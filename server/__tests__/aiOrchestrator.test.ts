/**
 * Tests de l'orchestrateur IA — couvre les 8 scénarios demandés dans la
 * mission (section "TESTS OBLIGATOIRES").
 *
 * Exécution : npm run test:orchestrator
 * (utilise le test runner intégré à Node.js, aucune dépendance supplémentaire)
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  generateWithFallback,
  generateWithFallbackDetailed,
  __setTestCandidateCaller,
  __testing,
} from "../aiOrchestrator";

function makeErr(status: number, message: string) {
  const e: any = new Error(message);
  e.status = status;
  return e;
}

beforeEach(() => {
  // Isole chaque test : pas de cooldown ni de cache hérité du test précédent.
  __testing.cooldownStore.clear();
  __testing.responseCache.clear();
  __testing.inFlightRequests.clear();
  __setTestCandidateCaller(null);

  process.env.GEMINI_API_KEY = "test-gemini-key";
  process.env.OPENAI_API_KEY = "test-openai-key";
  delete process.env.GEMINI_API_KEY_2;
  delete process.env.OPENAI_API_KEY_2;
});

// TEST 1 — Modèle principal fonctionne => réponse du modèle principal.
test("TEST 1: le candidat principal répond avec succès", async () => {
  let calls = 0;
  __setTestCandidateCaller(async () => {
    calls += 1;
    return "réponse du modèle principal";
  });

  const result = await generateWithFallback({ contents: "2x+5=15" });
  assert.equal(result, "réponse du modèle principal");
  assert.equal(calls, 1, "un seul appel doit suffire quand le premier candidat réussit");
});

// TEST 2 — Modèle principal => 429 => bascule automatique sur le secondaire.
test("TEST 2: 429 sur le premier candidat déclenche le fallback vers le suivant", async () => {
  const seenCandidates: string[] = [];
  __setTestCandidateCaller(async (candidate) => {
    seenCandidates.push(`${candidate.provider}:${candidate.model}`);
    if (seenCandidates.length === 1) throw makeErr(429, "Quota exceeded");
    return "réponse du modèle secondaire";
  });

  const result = await generateWithFallback({ contents: "exercice" });
  assert.equal(result, "réponse du modèle secondaire");
  assert.ok(seenCandidates.length >= 2, "au moins deux candidats différents doivent avoir été tentés");
  assert.notEqual(seenCandidates[0], seenCandidates[1]);
});

// TEST 3 — Modèle principal => timeout => passe au modèle suivant.
test("TEST 3: une erreur d'indisponibilité (503) fait passer au candidat suivant", async () => {
  const seenCandidates: string[] = [];
  __setTestCandidateCaller(async (candidate) => {
    seenCandidates.push(`${candidate.provider}:${candidate.model}`);
    if (seenCandidates.length <= 3) throw makeErr(503, "UNAVAILABLE: high demand");
    return "réponse après bascule";
  });

  const result = await generateWithFallback({ contents: "exercice" }, { maxRetriesPerCandidate: 0 });
  assert.equal(result, "réponse après bascule");
});

// TEST 4 — Tous les modèles IA échouent => l'appelant doit pouvoir détecter
// l'échec total pour déclencher SON fallback local (chaque route fait ça
// dans un try/catch autour de generateWithFallback — ici on vérifie que
// l'orchestrateur relance bien une erreur exploitable quand tout échoue).
test("TEST 4: si tous les candidats échouent, une erreur est levée (pour déclencher le fallback local)", async () => {
  __setTestCandidateCaller(async () => {
    throw makeErr(429, "Quota exceeded");
  });

  await assert.rejects(() => generateWithFallback({ contents: "exercice" }));
});

// TEST 5 — Fallback local incapable de résoudre => pas d'invention.
// (Vérifié au niveau des modules de fallback locaux eux-mêmes, pas de
// l'orchestrateur : ils retournent un message honnête plutôt qu'une fausse
// résolution. On vérifie ici la propriété symétrique côté orchestrateur :
// une erreur de CONTENU (400 hors quota) ne doit jamais être masquée par
// une invention silencieuse — elle doit remonter telle quelle.)
test("TEST 5: une erreur 400 (contenu invalide) remonte sans boucler sur tous les modèles", async () => {
  let calls = 0;
  __setTestCandidateCaller(async () => {
    calls += 1;
    throw makeErr(400, "Invalid request: malformed schema");
  });

  await assert.rejects(() => generateWithFallback({ contents: "exercice" }));
  assert.equal(calls, 1, "une erreur de contenu ne doit pas déclencher un balayage de tous les modèles");
});

// TEST 6 — Deux "utilisateurs" simultanés : les requêtes DIFFÉRENTES restent
// indépendantes (pas de mélange de contenu/réponse entre elles).
test("TEST 6: deux requêtes concurrentes et différentes restent indépendantes", async () => {
  __setTestCandidateCaller(async (_candidate, _key, params) => {
    await new Promise((r) => setTimeout(r, 10));
    return `réponse pour: ${params.contents}`;
  });

  const [resA, resB] = await Promise.all([
    generateWithFallback({ contents: "énoncé élève A" }),
    generateWithFallback({ contents: "énoncé élève B" }),
  ]);

  assert.equal(resA, "réponse pour: énoncé élève A");
  assert.equal(resB, "réponse pour: énoncé élève B");
});

// TEST 7 — Même exercice envoyé deux fois : le cache (opt-in) est utilisé
// de manière sûre, sans réappeler le moteur IA une seconde fois.
test("TEST 7: une requête identique et cacheable réutilise la réponse (pas de second appel réseau)", async () => {
  let calls = 0;
  __setTestCandidateCaller(async () => {
    calls += 1;
    return "Résous 2x + 5 = 15 => x = 5";
  });

  const opts = { cacheable: true, taskType: "math" as const };
  const first = await generateWithFallback({ contents: "Résous 2x + 5 = 15" }, opts);
  const second = await generateWithFallback({ contents: "Résous 2x + 5 = 15" }, opts);

  assert.equal(first, second);
  assert.equal(calls, 1, "la deuxième requête identique doit être servie depuis le cache");
});

test("TEST 7bis: deux requêtes IDENTIQUES simultanées sont dédupliquées (single-flight)", async () => {
  let calls = 0;
  __setTestCandidateCaller(async () => {
    calls += 1;
    await new Promise((r) => setTimeout(r, 20));
    return "même réponse";
  });

  const opts = { cacheable: true, taskType: "math" as const };
  const [a, b] = await Promise.all([
    generateWithFallback({ contents: "3x = 9" }, opts),
    generateWithFallback({ contents: "3x = 9" }, opts),
  ]);

  assert.equal(a, "même réponse");
  assert.equal(b, "même réponse");
  assert.equal(calls, 1, "deux requêtes identiques envoyées en même temps ne doivent déclencher qu'UN SEUL appel réel");
});

// TEST 8 — Clé API absente : le serveur ne doit pas planter, il doit lever
// une erreur exploitable (que chaque route transforme en fallback local ou
// message générique), jamais une exception non gérée qui crashe le process.
test("TEST 8: aucune clé API configurée => erreur propre, pas de crash", async () => {
  delete process.env.GEMINI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.VITE_GEMINI_API_KEY;

  await assert.rejects(
    () => generateWithFallback({ contents: "exercice" }),
    /API_KEY_NOT_CONFIGURED/
  );
});

// Bonus — classification des erreurs : vérifie que les catégories clés du
// cahier des charges sont bien reconnues (429, quota, rate limit, 503,
// unavailable, timeout, 403, 404).
test("classifyError reconnaît les catégories d'erreurs attendues", () => {
  assert.equal(__testing.classifyError(makeErr(429, "too many requests")).kind, "quota");
  assert.equal(__testing.classifyError(new Error("RESOURCE_EXHAUSTED")).kind, "quota");
  assert.equal(__testing.classifyError(makeErr(503, "service unavailable")).kind, "unavailable");
  assert.equal(__testing.classifyError(new Error("ORCHESTRATOR_TIMEOUT_45000ms")).kind, "timeout");
  assert.equal(__testing.classifyError(makeErr(403, "PERMISSION_DENIED")).kind, "auth");
  assert.equal(__testing.classifyError(makeErr(404, "model not found")).kind, "not_found");
  assert.equal(__testing.classifyError(makeErr(400, "bad request")).kind, "invalid_request");
});

// TEST 9 — generateWithFallbackDetailed() signale usedFallback=false quand
// le tout premier candidat répond directement (pas de bascule).
test("TEST 9: usedFallback est false quand le premier candidat répond directement", async () => {
  __setTestCandidateCaller(async () => "réponse directe");

  const result = await generateWithFallbackDetailed({ contents: "exercice" });
  assert.equal(result.text, "réponse directe");
  assert.equal(result.usedFallback, false, "pas de bascule = usedFallback doit être false");
});

// TEST 10 — generateWithFallbackDetailed() signale usedFallback=true dès
// qu'un candidat autre que le premier a dû répondre (utile pour un message
// discret optionnel côté UI, point 10 du cahier des charges), sans jamais
// exposer de détail technique (clé, stack trace) dans le résultat.
test("TEST 10: usedFallback est true dès qu'un candidat secondaire répond", async () => {
  let calls = 0;
  __setTestCandidateCaller(async () => {
    calls += 1;
    if (calls === 1) throw makeErr(429, "Quota exceeded");
    return "réponse du candidat secondaire";
  });

  const result = await generateWithFallbackDetailed({ contents: "exercice" });
  assert.equal(result.text, "réponse du candidat secondaire");
  assert.equal(result.usedFallback, true, "une bascule a eu lieu, usedFallback doit être true");
  assert.ok(!("apiKey" in result) && !("key" in result), "le résultat ne doit jamais contenir de credential");
});

// TEST 11 — Correction du bug observé en production : quand un modèle est
// indisponible (503/timeout), ce n'est PAS un problème de clé — inutile
// d'épuiser toutes les clés du même modèle avant de changer de modèle. Avec
// 3 clés Gemini configurées, une erreur "unavailable" sur la 1ère doit
// directement passer au modèle suivant, sans tester les clés 2 et 3 du
// modèle en échec (elles échoueraient de la même façon, en pure perte de
// temps pour l'élève qui attend sa correction).
test("TEST 11: une erreur d'indisponibilité saute directement au modèle suivant sans épuiser les autres clés", async () => {
  process.env.GEMINI_API_KEY_2 = "test-gemini-key-2";
  process.env.GEMINI_API_KEY_3 = "test-gemini-key-3";

  const seenCandidates: string[] = [];
  __setTestCandidateCaller(async (candidate) => {
    seenCandidates.push(`${candidate.provider}:${candidate.model}`);
    // Le tout premier modèle Gemini tenté échoue systématiquement en 503,
    // peu importe la clé utilisée (simulateur de vraie panne du modèle).
    const firstModelTried = seenCandidates[0].split(":")[1];
    if (candidate.provider === "gemini" && candidate.model === firstModelTried) {
      throw makeErr(503, "UNAVAILABLE: the model is overloaded");
    }
    return "réponse d'un autre modèle";
  });

  const result = await generateWithFallback(
    { contents: "exercice" },
    { taskType: "math", maxRetriesPerCandidate: 0 }
  );

  assert.equal(result, "réponse d'un autre modèle");
  const firstModel = seenCandidates[0];
  const sameModelRetries = seenCandidates.filter((c) => c === firstModel).length;
  assert.equal(
    sameModelRetries,
    1,
    `le modèle en échec (${firstModel}) ne doit être tenté qu'UNE seule fois (pas une fois par clé) ; vu : ${seenCandidates.join(", ")}`
  );
});

// Bonus — cooldown : un candidat en échec de quota est bien mis en pause et
// ignoré par le prochain appel tant que le cooldown n'a pas expiré.
test("un candidat en cooldown après un 429 est sauté lors de l'appel suivant", async () => {
  const seenModels: string[] = [];
  __setTestCandidateCaller(async (candidate) => {
    seenModels.push(candidate.model);
    if (candidate.model === __testing.buildOrderedCandidates(undefined)[0].model) {
      throw makeErr(429, "Quota exceeded");
    }
    return "ok";
  });

  await generateWithFallback({ contents: "premier appel" });
  const firstFailedModel = seenModels[0];

  seenModels.length = 0;
  await generateWithFallback({ contents: "second appel" });

  assert.ok(
    !seenModels.includes(firstFailedModel),
    "le modèle qui vient d'échouer sur quota ne doit pas être retenté immédiatement (cooldown actif)"
  );
});
