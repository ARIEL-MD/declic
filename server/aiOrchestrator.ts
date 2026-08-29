/**
 * ORCHESTRATEUR IA DÉCLIC
 * ========================
 *
 * Point d'entrée UNIQUE pour toutes les fonctionnalités IA du site (remplace
 * les anciennes fonctions `generateWithGeminiEngine` / `generateWithOpenAiEngine`
 * / `generateWithFallback` qui vivaient directement dans server.ts).
 *
 * Ce module :
 *  - centralise la liste des modèles/fournisseurs candidats, avec une
 *    priorité configurable et, si besoin, un profil différent par type de
 *    tâche (maths, physique-chimie, SVT, français/philo, correction...) ;
 *  - gère plusieurs clés API par fournisseur (pools indépendants) ;
 *  - reconnaît les erreurs de quota / indisponibilité / autorisation et
 *    bascule automatiquement sur le candidat suivant au lieu de renvoyer
 *    une erreur brute à l'utilisateur ;
 *  - mémorise temporairement ("cooldown") qu'un couple modèle+clé vient
 *    d'être limité, pour ne pas perdre de temps à le retenter tout de
 *    suite ;
 *  - applique un retry limité avec backoff exponentiel + jitter pour les
 *    erreurs vraiment transitoires (503, timeout réseau) ;
 *  - déduplique les requêtes strictement identiques en vol (single-flight)
 *    et propose un cache TTL optionnel, opt-in, pour les requêtes sans
 *    contexte utilisateur privé ;
 *  - journalise (sans jamais logguer une clé API) : fournisseur, modèle,
 *    raison du fallback, latence, succès/échec.
 *
 * IMPORTANT : ce module NE PROMET PAS un quota infini. Il maximise la
 * disponibilité en utilisant intelligemment les ressources réellement
 * configurées (clés API), mais respecte les quotas et conditions
 * d'utilisation de chaque fournisseur.
 */

import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";

// ==========================================================================
// 1. CONFIGURATION DES FOURNISSEURS / MODÈLES (facilement modifiable)
// ==========================================================================

export type AIProviderName = "gemini" | "openai";

/**
 * Types de tâches reconnus par l'orchestrateur pour le routage par profil
 * (voir TASK_PROFILES plus bas). "general" est le profil par défaut utilisé
 * si aucun profil spécifique n'est défini pour la tâche demandée.
 */
export type TaskType =
  | "math"
  | "physics_chemistry"
  | "svt"
  | "french_philo"
  | "correction"
  | "statistics"
  | "translation"
  | "ocr"
  | "chat"
  | "classification"
  | "general";

export interface ProviderCandidate {
  provider: AIProviderName;
  /** Nom exact du modèle tel qu'attendu par le SDK du fournisseur. */
  model: string;
  /** Priorité globale par défaut : plus petit = essayé en premier. */
  priority: number;
}

/**
 * NOTE SUR LES NOMS DE MODÈLES (lire avant de déployer) :
 * -------------------------------------------------------
 * Ces identifiants correspondent aux modèles réellement documentés par
 * Google et OpenAI au moment de la rédaction de ce fichier. Les fournisseurs
 * font évoluer/retirent leurs modèles régulièrement (ex : la gamme
 * Gemini 1.5 et Gemini 2.0 a été mise hors service en 2026). Avant un
 * déploiement, vérifiez la liste des modèles réellement disponibles pour
 * VOTRE clé/projet dans la console du fournisseur, et ajustez cette liste
 * si nécessaire — un modèle obsolète ou non autorisé est de toute façon
 * ignoré automatiquement (404 / 403) et l'orchestrateur passe au suivant,
 * donc une entrée périmée ne casse rien, elle est juste inutile.
 */
export const GEMINI_CANDIDATES: ProviderCandidate[] = [
  { provider: "gemini", model: "gemini-3.7-flash", priority: 1 },
  { provider: "gemini", model: "gemini-3.6-flash", priority: 2 },
  { provider: "gemini", model: "gemini-3.1-flash-lite", priority: 3 },
  { provider: "gemini", model: "gemini-2.5-flash", priority: 4 },
  { provider: "gemini", model: "gemini-2.5-flash-lite", priority: 5 },
];

export const OPENAI_CANDIDATES: ProviderCandidate[] = [
  { provider: "openai", model: "gpt-5-mini", priority: 1 },
  { provider: "openai", model: "gpt-5", priority: 2 },
  { provider: "openai", model: "gpt-4o-mini", priority: 3 },
  { provider: "openai", model: "gpt-4o", priority: 4 },
];

/**
 * Ordre des FOURNISSEURS par défaut (pas des modèles individuels) : lequel
 * essayer en premier. Conserve le comportement historique de DÉCLIC
 * (OpenAI d'abord si configuré, puis Gemini) tout en restant modifiable.
 */
const DEFAULT_PROVIDER_ORDER: AIProviderName[] = ["openai", "gemini"];

/**
 * Profils par type de tâche : permet de changer l'ordre des FOURNISSEURS
 * (et donc implicitement des modèles) selon la nature de l'exercice, sans
 * dupliquer toute la logique de fallback. Une tâche non listée ici utilise
 * DEFAULT_PROVIDER_ORDER. On garde les deux fournisseurs disponibles dans
 * tous les profils (aucun n'est jamais totalement exclu) — seul l'ORDRE
 * change, pour ne jamais réduire la disponibilité réelle.
 */
const TASK_PROFILES: Partial<Record<TaskType, AIProviderName[]>> = {
  math: ["gemini", "openai"],
  physics_chemistry: ["gemini", "openai"],
  svt: ["gemini", "openai"],
  french_philo: ["openai", "gemini"],
  correction: ["openai", "gemini"],
  statistics: ["gemini", "openai"],
  classification: ["gemini", "openai"],
  chat: ["openai", "gemini"],
  translation: ["openai", "gemini"],
  ocr: ["gemini", "openai"],
};

function getProviderOrder(taskType: TaskType | undefined): AIProviderName[] {
  if (taskType && TASK_PROFILES[taskType]) return TASK_PROFILES[taskType]!;
  return DEFAULT_PROVIDER_ORDER;
}

// ==========================================================================
// 2. POOLS DE CLÉS API (plusieurs clés/projets par fournisseur si fournis)
// ==========================================================================

/**
 * Lit GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3... (et l'équivalent
 * OpenAI) pour construire un pool de clés indépendantes. Une seule clé
 * configurée (le cas le plus courant) fonctionne exactement comme avant.
 * Chaque clé additionnelle DOIT être une clé/projet légitimement obtenue
 * auprès du fournisseur — l'orchestrateur ne fait que les utiliser en
 * rotation lorsqu'elles existent, il n'en fabrique ni n'en devine aucune.
 */
function getKeyPool(prefix: string): string[] {
  const keys: string[] = [];
  const base = process.env[prefix];
  if (base && base.trim()) keys.push(base.trim());

  let i = 2;
  while (true) {
    const extra = process.env[`${prefix}_${i}`];
    if (!extra || !extra.trim()) break;
    keys.push(extra.trim());
    i += 1;
    if (i > 20) break; // garde-fou raisonnable
  }
  return keys;
}

function getKeysForProvider(provider: AIProviderName): string[] {
  if (provider === "gemini") {
    // VITE_GEMINI_API_KEY est conservée pour compatibilité avec l'ancien setup.
    const pool = getKeyPool("GEMINI_API_KEY");
    if (pool.length === 0) {
      const legacy = process.env.VITE_GEMINI_API_KEY;
      if (legacy && legacy.trim()) pool.push(legacy.trim());
    }
    return pool;
  }
  return getKeyPool("OPENAI_API_KEY");
}

// ==========================================================================
// 3. CLASSIFICATION DES ERREURS (quota / indisponibilité / auth / contenu)
// ==========================================================================

type ErrorKind =
  | "quota"          // 429 / RESOURCE_EXHAUSTED / rate limit
  | "unavailable"    // 503 / temporarily unavailable / high demand / timeout réseau
  | "auth"           // 403 / clé invalide / non autorisé
  | "not_found"      // 404 / modèle obsolète ou inexistant
  | "timeout"        // dépassement du délai imparti côté orchestrateur
  | "invalid_request"// contenu de la requête lui-même en cause (400 hors quota)
  | "unknown";

interface ClassifiedError {
  kind: ErrorKind;
  /** Faut-il marquer ce (provider, modèle, clé) en cooldown ? */
  cooldown: boolean;
  /** Faut-il encore réessayer LE MÊME candidat (backoff court) avant de changer ? */
  retrySameCandidate: boolean;
}

function classifyError(err: any): ClassifiedError {
  const status = err?.status ?? err?.response?.status;
  const msg = String(err?.message || err || "");

  const isQuota =
    status === 429 ||
    /RESOURCE_EXHAUSTED|quota exceeded|rate limit|too many requests/i.test(msg);
  if (isQuota) return { kind: "quota", cooldown: true, retrySameCandidate: false };

  const isAuth =
    status === 403 ||
    status === 401 ||
    /PERMISSION_DENIED|unauthorized|unregistered callers|invalid api key|incorrect api key/i.test(msg);
  if (isAuth) return { kind: "auth", cooldown: true, retrySameCandidate: false };

  const isNotFound =
    status === 404 ||
    /NOT_FOUND|model not found|no longer available|deprecated|does not exist/i.test(msg);
  if (isNotFound) return { kind: "not_found", cooldown: true, retrySameCandidate: false };

  const isUnavailable =
    status === 503 ||
    status === 502 ||
    status === 504 ||
    /UNAVAILABLE|high demand|temporarily unavailable|service unavailable|overloaded|ECONNRESET|ETIMEDOUT|ENOTFOUND|fetch failed/i.test(msg);
  if (isUnavailable) return { kind: "unavailable", cooldown: false, retrySameCandidate: true };

  if (/ORCHESTRATOR_TIMEOUT/.test(msg)) {
    return { kind: "timeout", cooldown: false, retrySameCandidate: true };
  }

  // Erreur 400 générique (hors quota/auth) : très probablement un problème
  // de contenu de la requête (schéma, prompt, image invalide...). Pas la
  // peine de boucler sur tous les modèles pour la même erreur.
  if (status === 400) return { kind: "invalid_request", cooldown: false, retrySameCandidate: false };

  return { kind: "unknown", cooldown: false, retrySameCandidate: false };
}

// ==========================================================================
// 4. COOLDOWN / CIRCUIT BREAKER PAR (fournisseur, modèle, index de clé)
// ==========================================================================

interface CooldownEntry {
  cooldownUntil: number;
  consecutiveFailures: number;
}

const cooldownStore = new Map<string, CooldownEntry>();

function candidateKey(provider: AIProviderName, model: string, keyIndex: number): string {
  return `${provider}:${model}:${keyIndex}`;
}

function isInCooldown(key: string): boolean {
  const entry = cooldownStore.get(key);
  return !!entry && entry.cooldownUntil > Date.now();
}

/**
 * Cooldown avec backoff exponentiel PAR CANDIDAT : la première fois qu'un
 * modèle atteint son quota il est mis en pause ~30s, puis 1min, 2min... si
 * l'échec se reproduit, jusqu'à un plafond de 15 minutes. Cela évite de
 * marteler un modèle qui vient d'atteindre son quota tout en le retestant
 * automatiquement dès que le quota a des chances d'être régénéré.
 */
function markCooldown(key: string, kind: ErrorKind) {
  const existing = cooldownStore.get(key);
  const failures = (existing?.consecutiveFailures || 0) + 1;

  const baseMs = kind === "auth" || kind === "not_found" ? 5 * 60_000 : 30_000;
  const capMs = kind === "auth" || kind === "not_found" ? 60 * 60_000 : 15 * 60_000;
  const ms = Math.min(capMs, baseMs * Math.pow(2, failures - 1));

  cooldownStore.set(key, { cooldownUntil: Date.now() + ms, consecutiveFailures: failures });
  logAI("cooldown activated", { key, kind, ms, consecutiveFailures: failures });
}

function clearCooldown(key: string) {
  if (cooldownStore.has(key)) cooldownStore.delete(key);
}

// ==========================================================================
// 5. LOGGING (jamais de clé API dans les logs)
// ==========================================================================

function logAI(event: string, meta: Record<string, any> = {}) {
  const safeMeta = { ...meta };
  delete safeMeta.apiKey;
  delete safeMeta.key;
  try {
    console.log(`[AI] ${event}`, JSON.stringify(safeMeta));
  } catch {
    console.log(`[AI] ${event}`);
  }
}

// ==========================================================================
// 6. UTILITAIRES : timeout, backoff+jitter
// ==========================================================================

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`ORCHESTRATOR_TIMEOUT_${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffWithJitter(attempt: number): number {
  // 500ms, 1s, 2s... + jitter aléatoire, plafonné.
  const base = Math.min(4000, 500 * Math.pow(2, attempt));
  return base + Math.floor(Math.random() * 250);
}

// ==========================================================================
// 7. GLUE SCHÉMA GEMINI -> JSON SCHEMA OPENAI (pour Structured Outputs)
// ==========================================================================

function geminiTypeToJsonSchemaType(t: any): string {
  switch (t) {
    case Type.OBJECT:
      return "object";
    case Type.ARRAY:
      return "array";
    case Type.STRING:
      return "string";
    case Type.NUMBER:
      return "number";
    case Type.INTEGER:
      return "integer";
    case Type.BOOLEAN:
      return "boolean";
    default:
      return "string";
  }
}

function convertGeminiSchemaToJsonSchema(schema: any): any {
  if (!schema) return schema;
  const jsonType = geminiTypeToJsonSchemaType(schema.type);
  const result: any = { type: jsonType };

  if (schema.description) result.description = schema.description;
  if (schema.enum) result.enum = schema.enum;

  if (jsonType === "object" && schema.properties) {
    result.properties = {};
    for (const key of Object.keys(schema.properties)) {
      result.properties[key] = convertGeminiSchemaToJsonSchema(schema.properties[key]);
    }
    result.required = Object.keys(schema.properties);
    result.additionalProperties = false;
  }

  if (jsonType === "array" && schema.items) {
    result.items = convertGeminiSchemaToJsonSchema(schema.items);
  }

  return result;
}

function buildOpenAiMessages(systemInstruction: string | undefined, contents: any): any[] {
  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }

  if (typeof contents === "string") {
    messages.push({ role: "user", content: contents });
    return messages;
  }

  if (Array.isArray(contents)) {
    const parts: any[] = [];
    for (const part of contents) {
      if (typeof part === "string") {
        parts.push({ type: "text", text: part });
      } else if (part?.inlineData?.data) {
        parts.push({
          type: "image_url",
          image_url: { url: `data:${part.inlineData.mimeType || "image/jpeg"};base64,${part.inlineData.data}` },
        });
      } else if (part?.text) {
        parts.push({ type: "text", text: part.text });
      }
    }
    messages.push({ role: "user", content: parts });
    return messages;
  }

  messages.push({ role: "user", content: String(contents) });
  return messages;
}

// ==========================================================================
// 8. APPELS BAS NIVEAU PAR FOURNISSEUR (un seul modèle, une seule clé)
// ==========================================================================

const REQUEST_TIMEOUT_MS = 45_000;

async function callGeminiOnce(model: string, apiKey: string, params: { contents: any; config?: any }): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });

  const response = await withTimeout(
    ai.models.generateContent({ model, contents: params.contents, config: params.config }),
    REQUEST_TIMEOUT_MS
  );

  if (!response?.text) {
    throw new Error("EMPTY_RESPONSE: Le modèle Gemini a renvoyé une réponse vide.");
  }
  return response.text;
}

async function callOpenAiOnce(model: string, apiKey: string, params: { contents: any; config?: any }): Promise<string> {
  const openai = new OpenAI({ apiKey });
  const messages = buildOpenAiMessages(params.config?.systemInstruction, params.contents);

  let responseFormat: any = undefined;
  if (params.config?.responseMimeType === "application/json" && params.config?.responseSchema) {
    responseFormat = {
      type: "json_schema",
      json_schema: {
        name: "declic_response",
        strict: true,
        schema: convertGeminiSchemaToJsonSchema(params.config.responseSchema),
      },
    };
  } else if (params.config?.responseMimeType === "application/json") {
    responseFormat = { type: "json_object" };
  }

  const completion = await withTimeout(
    openai.chat.completions.create({
      model,
      messages,
      ...(responseFormat ? { response_format: responseFormat } : {}),
    }),
    REQUEST_TIMEOUT_MS
  );

  const text = completion.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("EMPTY_RESPONSE: Le modèle OpenAI a renvoyé une réponse vide.");
  }
  return text;
}

async function callCandidateOnce(
  candidate: ProviderCandidate,
  apiKey: string,
  params: { contents: any; config?: any }
): Promise<string> {
  if (testCandidateCaller) return testCandidateCaller(candidate, apiKey, params);
  if (candidate.provider === "gemini") return callGeminiOnce(candidate.model, apiKey, params);
  return callOpenAiOnce(candidate.model, apiKey, params);
}

/**
 * Point d'injection RÉSERVÉ AUX TESTS UNITAIRES : permet de remplacer les
 * appels réseau réels vers Gemini/OpenAI par un mock déterministe (succès,
 * 429, 503, timeout...) pour tester la logique de fallback de manière
 * fiable et rapide, sans dépendre d'API externes ni de clés réelles.
 * Ne JAMAIS appeler ceci en dehors des tests.
 */
let testCandidateCaller:
  | ((candidate: ProviderCandidate, apiKey: string, params: { contents: any; config?: any }) => Promise<string>)
  | null = null;

export function __setTestCandidateCaller(fn: typeof testCandidateCaller) {
  testCandidateCaller = fn;
}

// ==========================================================================
// 9. CACHE (opt-in, sûr) + DÉDUPLICATION DES REQUÊTES IDENTIQUES EN VOL
// ==========================================================================

interface CacheEntry {
  value: string;
  expiresAt: number;
  provider: AIProviderName;
  model: string;
}

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<GenerateResult>>();
const CACHE_MAX_ENTRIES = 1000;

function pruneCacheIfNeeded() {
  if (responseCache.size <= CACHE_MAX_ENTRIES) return;
  // Retire les entrées expirées d'abord, puis les plus anciennes si besoin.
  const now = Date.now();
  for (const [k, v] of responseCache.entries()) {
    if (v.expiresAt <= now) responseCache.delete(k);
  }
  while (responseCache.size > CACHE_MAX_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey === undefined) break;
    responseCache.delete(oldestKey);
  }
}

/**
 * Construit une clé de cache stable à partir du CONTENU et des paramètres
 * pertinents uniquement — jamais d'historique de conversation, d'IP ou
 * d'identifiant utilisateur, pour ne jamais mélanger de contexte privé.
 */
function makeCacheKey(taskType: TaskType | undefined, params: { contents: any; config?: any }): string {
  const stable = {
    t: taskType || "general",
    c: params.contents,
    system: params.config?.systemInstruction || "",
    schema: params.config?.responseSchema || null,
    mime: params.config?.responseMimeType || "",
  };
  return JSON.stringify(stable);
}

// ==========================================================================
// 10. ORCHESTRATEUR PRINCIPAL
// ==========================================================================

export interface GenerateParams {
  contents: any;
  config?: any;
}

export interface OrchestratorOptions {
  taskType?: TaskType;
  /**
   * Active un cache TTL + une déduplication des requêtes identiques en vol.
   * À activer UNIQUEMENT pour les requêtes sans contexte utilisateur privé
   * (ex : résolution d'un énoncé, recherche de cours, traduction d'un texte)
   * — jamais pour le chat-tuteur ou la correction d'une copie personnelle.
   */
  cacheable?: boolean;
  cacheTtlMs?: number;
  /** Nombre max de tentatives (retry court) SUR LE MÊME candidat pour une erreur transitoire. */
  maxRetriesPerCandidate?: number;
}

function buildOrderedCandidates(taskType: TaskType | undefined): ProviderCandidate[] {
  const providerOrder = getProviderOrder(taskType);
  const byProvider: Record<AIProviderName, ProviderCandidate[]> = {
    gemini: [...GEMINI_CANDIDATES].sort((a, b) => a.priority - b.priority),
    openai: [...OPENAI_CANDIDATES].sort((a, b) => a.priority - b.priority),
  };

  const ordered: ProviderCandidate[] = [];
  for (const provider of providerOrder) {
    // Un fournisseur sans clé configurée du tout est ignoré immédiatement
    // (inutile de lister ses modèles un par un pour rien).
    if (getKeysForProvider(provider).length === 0) continue;
    ordered.push(...byProvider[provider]);
  }
  return ordered;
}

/**
 * generateWithFallback() — le cœur de l'architecture demandée.
 *
 * Parcourt les candidats (fournisseur+modèle) dans l'ordre du profil de
 * tâche, et pour chacun, chaque clé disponible du pool, en sautant celles
 * actuellement en cooldown. Sur erreur transitoire (503/timeout), retente
 * un court instant le MÊME candidat (backoff+jitter, tentatives limitées)
 * avant de passer au suivant. Sur quota/auth/404, passe immédiatement au
 * candidat suivant et met celui-ci en cooldown. Sur erreur de contenu de
 * la requête (400 hors quota), ARRÊTE la boucle : ce n'est pas un problème
 * de disponibilité, boucler sur tous les modèles ne réglerait rien.
 */
export interface GenerateResult {
  text: string;
  /** Vrai si le PREMIER candidat de la liste n'a pas répondu directement. */
  usedFallback: boolean;
  provider: AIProviderName;
  model: string;
}

/**
 * Variante de generateWithFallback() qui renvoie aussi la provenance de la
 * réponse (provider/modèle utilisé, et si un fallback a eu lieu). Utile pour
 * un affichage discret côté frontend (point 10 du cahier des charges) sans
 * jamais exposer de détail technique sensible (clé, stack trace...).
 * generateWithFallback() reste inchangée pour compatibilité (elle retourne
 * uniquement le texte) : elle appelle simplement cette variante en interne.
 */
export async function generateWithFallbackDetailed(
  params: GenerateParams,
  options: OrchestratorOptions = {}
): Promise<GenerateResult> {
  const { taskType, cacheable = false, cacheTtlMs = 30 * 60_000, maxRetriesPerCandidate = 2 } = options;

  // --- Cache + single-flight (opt-in uniquement) ---------------------------
  let cacheKey: string | null = null;
  if (cacheable) {
    cacheKey = makeCacheKey(taskType, params);
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      logAI("cache hit", { taskType });
      return { text: cached.value, provider: cached.provider, model: cached.model, usedFallback: false };
    }
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      logAI("dedup in-flight request", { taskType });
      return inFlight;
    }
  }

  const runner = (async (): Promise<GenerateResult> => {
    const candidates = buildOrderedCandidates(taskType);

    if (candidates.length === 0) {
      throw new Error(
        "API_KEY_NOT_CONFIGURED: Veuillez configurer au moins une clé API (GEMINI_API_KEY et/ou OPENAI_API_KEY) dans les variables d'environnement."
      );
    }

    const firstCandidateSignature = `${candidates[0].provider}:${candidates[0].model}`;
    let lastError: any = null;

    for (const candidate of candidates) {
      const keys = getKeysForProvider(candidate.provider);

      for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        const key = candidateKey(candidate.provider, candidate.model, keyIndex);
        if (isInCooldown(key)) {
          continue;
        }

        const startedAt = Date.now();
        logAI("request started", { provider: candidate.provider, model: candidate.model, taskType });

        for (let attempt = 0; attempt <= maxRetriesPerCandidate; attempt++) {
          try {
            const text = await callCandidateOnce(candidate, keys[keyIndex], params);
            clearCooldown(key);
            logAI("success", {
              provider: candidate.provider,
              model: candidate.model,
              taskType,
              latencyMs: Date.now() - startedAt,
              attempt,
            });
            return {
              text,
              provider: candidate.provider,
              model: candidate.model,
              // "Fallback" = un candidat AUTRE que le tout premier de la
              // liste a dû être utilisé (point 10 du cahier des charges).
              usedFallback: `${candidate.provider}:${candidate.model}` !== firstCandidateSignature,
            };
          } catch (err: any) {
            lastError = err;
            const classified = classifyError(err);
            logAI("attempt failed", {
              provider: candidate.provider,
              model: candidate.model,
              taskType,
              kind: classified.kind,
              attempt,
            });

            if (classified.kind === "invalid_request") {
              // Problème de contenu, pas de disponibilité : inutile de
              // boucler sur tous les modèles pour la même erreur.
              throw err;
            }

            if (classified.retrySameCandidate && attempt < maxRetriesPerCandidate) {
              await sleep(backoffWithJitter(attempt));
              continue;
            }

            if (classified.cooldown) {
              markCooldown(key, classified.kind);
            }
            break; // passe au candidat suivant (clé suivante ou modèle suivant)
          }
        }

        logAI("switching candidate", { from: `${candidate.provider}:${candidate.model}`, taskType });
      }
    }

    throw lastError || new Error("Tous les moteurs IA configurés sont temporairement indisponibles.");
  })();

  if (cacheable && cacheKey) {
    inFlightRequests.set(cacheKey, runner);
  }

  try {
    const result = await runner;
    if (cacheable && cacheKey) {
      responseCache.set(cacheKey, {
        value: result.text,
        expiresAt: Date.now() + cacheTtlMs,
        provider: result.provider,
        model: result.model,
      });
      pruneCacheIfNeeded();
    }
    return result;
  } finally {
    if (cacheable && cacheKey) inFlightRequests.delete(cacheKey);
  }
}

/**
 * generateWithFallback() — wrapper de compatibilité : renvoie uniquement le
 * texte, comme avant. Utilisé par la majorité des routes existantes qui
 * n'ont pas besoin de connaître la provenance de la réponse.
 */
export async function generateWithFallback(
  params: GenerateParams,
  options: OrchestratorOptions = {}
): Promise<string> {
  const result = await generateWithFallbackDetailed(params, options);
  return result.text;
}

/**
 * generateWithFallbackAndRetry() — pour les routes qui n'ont pas de
 * fallback local honnête (OCR, traduction) : si TOUTE la cascade de
 * candidats a échoué, on retente une fois de plus l'ensemble de la cascade
 * après un court délai, pour absorber un pic de charge ponctuel avant
 * d'abandonner réellement.
 */
export async function generateWithFallbackAndRetry(
  params: GenerateParams,
  options: OrchestratorOptions = {}
): Promise<string> {
  try {
    return await generateWithFallback(params, options);
  } catch (firstError: any) {
    const classified = classifyError(firstError);
    if (classified.kind === "invalid_request") throw firstError;
    await sleep(800 + Math.floor(Math.random() * 400));
    return await generateWithFallback(params, options);
  }
}

/** Variante détaillée de generateWithFallbackAndRetry (voir generateWithFallbackDetailed). */
export async function generateWithFallbackAndRetryDetailed(
  params: GenerateParams,
  options: OrchestratorOptions = {}
): Promise<GenerateResult> {
  try {
    return await generateWithFallbackDetailed(params, options);
  } catch (firstError: any) {
    const classified = classifyError(firstError);
    if (classified.kind === "invalid_request") throw firstError;
    await sleep(800 + Math.floor(Math.random() * 400));
    return await generateWithFallbackDetailed(params, options);
  }
}

/** Utile pour les tests et pour un futur endpoint de diagnostic/santé. */
export function getOrchestratorDebugState() {
  const now = Date.now();
  return {
    cooldowns: Array.from(cooldownStore.entries()).map(([key, entry]) => ({
      key,
      cooldownRemainingMs: Math.max(0, entry.cooldownUntil - now),
      consecutiveFailures: entry.consecutiveFailures,
    })),
    cacheSize: responseCache.size,
    inFlight: inFlightRequests.size,
    configuredProviders: {
      gemini: getKeysForProvider("gemini").length,
      openai: getKeysForProvider("openai").length,
    },
  };
}

/** Exposé pour les tests unitaires uniquement. */
export const __testing = {
  classifyError,
  buildOrderedCandidates,
  cooldownStore,
  responseCache,
  inFlightRequests,
};
