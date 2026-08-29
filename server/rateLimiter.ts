import { Request, Response, NextFunction } from "express";

/**
 * Limiteur de débit à store interchangeable.
 *
 * But : éviter qu'un seul utilisateur (ou un script) ne déclenche un grand
 * nombre d'appels vers les moteurs IA en peu de temps (coûts, épuisement du
 * quota partagé), ET éviter qu'un pic global ne sature les clés API
 * configurées quand le site est utilisé par plusieurs milliers d'élèves.
 *
 * Fonctionnement : fenêtre glissante (compteur à réinitialisation fixe, pas
 * un vrai "sliding window" ‒ suffisant ici et bon marché). Deux limiteurs
 * sont exportés :
 *   - `aiRouteRateLimiter` : par IP, protège un utilisateur individuel.
 *   - `globalAiRateLimiter` : tous utilisateurs confondus, protège les
 *     clés API elles-mêmes d'un pic de trafic global.
 *
 * STORE :
 *   - Par défaut : mémoire locale au process (zéro dépendance, zéro config).
 *     Limite connue : si l'app tourne sur plusieurs instances (scaling
 *     horizontal), chaque instance a son propre compteur — les limites
 *     réelles deviennent alors (limite × nombre d'instances).
 *   - Si la variable d'environnement REDIS_URL est configurée ET que le
 *     paquet optionnel `ioredis` est installé, un store Redis partagé est
 *     utilisé automatiquement à la place, pour une limite globalement
 *     cohérente entre toutes les instances. Si `ioredis` n'est pas installé
 *     ou que la connexion échoue, on retombe silencieusement (avec un log)
 *     sur le store mémoire plutôt que de faire planter le serveur — mieux
 *     vaut un rate-limiter légèrement imprécis en multi-instance qu'un site
 *     indisponible.
 */

interface RateLimitResult {
  count: number;
  resetAt: number;
}

interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<RateLimitResult>;
}

// --------------------------------------------------------------------------
// Store en mémoire (par défaut)
// --------------------------------------------------------------------------

class MemoryStore implements RateLimitStore {
  private buckets = new Map<string, RateLimitResult>();

  constructor() {
    // Purge périodique pour éviter une fuite mémoire sur le long terme.
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.buckets.entries()) {
        if (entry.resetAt <= now) this.buckets.delete(key);
      }
    }, 5 * 60 * 1000).unref();
  }

  async increment(key: string, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.buckets.get(key);

    if (!entry || entry.resetAt <= now) {
      const fresh = { count: 1, resetAt: now + windowMs };
      this.buckets.set(key, fresh);
      return fresh;
    }

    entry.count += 1;
    return entry;
  }
}

// --------------------------------------------------------------------------
// Store Redis (optionnel, activé seulement si REDIS_URL est configurée)
// --------------------------------------------------------------------------

class RedisStore implements RateLimitStore {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  async increment(key: string, windowMs: number): Promise<RateLimitResult> {
    // INCR + PEXPIRE (uniquement à la création de la clé) pour éviter une
    // fenêtre qui ne s'expire jamais si deux requêtes arrivent en même temps.
    const redisKey = `declic:ratelimit:${key}`;
    const count = await this.client.incr(redisKey);
    if (count === 1) {
      await this.client.pexpire(redisKey, windowMs);
    }
    const ttl = await this.client.pttl(redisKey);
    const resetAt = Date.now() + (ttl > 0 ? ttl : windowMs);
    return { count, resetAt };
  }
}

// --------------------------------------------------------------------------
// Sélection du store au démarrage
// --------------------------------------------------------------------------

let storePromise: Promise<RateLimitStore> | null = null;

async function resolveStore(): Promise<RateLimitStore> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl || !redisUrl.trim()) {
    return new MemoryStore();
  }

  try {
    // Import dynamique : si `ioredis` n'est pas installé, on ne casse rien,
    // on retombe simplement sur le store mémoire (voir catch ci-dessous).
    const { default: IORedis } = await import("ioredis");
    const client = new IORedis(redisUrl, { maxRetriesPerRequest: 2, lazyConnect: true });
    await client.connect();
    console.log("[RateLimiter] Store Redis actif (déploiement multi-instances supporté).");
    client.on("error", (err: any) => {
      console.warn("[RateLimiter] Erreur Redis :", err?.message || err);
    });
    return new RedisStore(client);
  } catch (err: any) {
    console.warn(
      "[RateLimiter] REDIS_URL est configurée mais Redis n'a pas pu être initialisé " +
        `(${err?.message || err}). Bascule sur le store en mémoire (limite par instance uniquement).`
    );
    return new MemoryStore();
  }
}

function getStore(): Promise<RateLimitStore> {
  if (!storePromise) storePromise = resolveStore();
  return storePromise;
}

// --------------------------------------------------------------------------
// Middleware
// --------------------------------------------------------------------------

function getClientKey(req: Request): string {
  // Derrière un proxy/load balancer, express doit avoir `trust proxy` activé
  // pour que req.ip reflète la vraie IP cliente (voir server.ts).
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  label: string;
  /** Si true, une seule clé globale est utilisée (pas par IP). */
  global?: boolean;
}) {
  const { windowMs, maxRequests, label, global = false } = options;

  return async function rateLimiter(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await getStore();
      const key = global ? `${label}:__global__` : `${label}:${getClientKey(req)}`;
      const result = await store.increment(key, windowMs);

      if (result.count > maxRequests) {
        const retryAfterSec = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
        res.setHeader("Retry-After", String(retryAfterSec));
        return res.status(429).json({
          error: global
            ? `Le service rencontre une forte affluence. Merci de patienter ${retryAfterSec} secondes avant de réessayer.`
            : `Trop de requêtes envoyées. Merci de patienter ${retryAfterSec} secondes avant de réessayer.`,
        });
      }

      return next();
    } catch (err: any) {
      // Le rate limiter ne doit JAMAIS faire planter une requête légitime :
      // en cas de souci imprévu (store indisponible...), on laisse passer.
      console.warn("[RateLimiter] Erreur inattendue, requête autorisée par prudence :", err?.message || err);
      return next();
    }
  };
}

// Limiteur par défaut appliqué à toutes les routes IA, PAR IP :
// 20 requêtes / 5 minutes. Ajuster selon l'usage réel observé.
export const aiRouteRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 20,
  label: "ai",
});

// Limiteur GLOBAL (tous utilisateurs confondus), ajustable via
// GLOBAL_AI_MAX_REQUESTS_PER_MIN. Sert de garde-fou pour ne jamais
// totalement saturer les clés API configurées lors d'un pic massif et
// simultané (ex: toute une classe qui se connecte en même temps). Valeur
// par défaut volontairement généreuse pour ne pas gêner un usage normal —
// à ajuster selon le nombre de clés/quota réellement disponibles.
const GLOBAL_MAX_PER_MIN = Number(process.env.GLOBAL_AI_MAX_REQUESTS_PER_MIN) || 600;
export const globalAiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: GLOBAL_MAX_PER_MIN,
  label: "ai-global",
  global: true,
});
