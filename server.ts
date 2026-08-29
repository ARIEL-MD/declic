import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { Type } from "@google/genai";
import { generateIvorianFallback } from "./server/ivorianFallback";
import { generateHomeworkCorrectionFallback } from "./server/homeworkCorrectionFallback";
import { aiRouteRateLimiter, globalAiRateLimiter } from "./server/rateLimiter";
import { getAcademicCourseResult } from "./src/utils/courseKnowledgeBase";
import {
  generateWithFallback,
  generateWithFallbackDetailed,
  generateWithFallbackAndRetry,
  getOrchestratorDebugState,
} from "./server/aiOrchestrator";

// Charge .env puis .env.local (qui prend le dessus s'il existe). C'est ce
// second fichier que le README/.env.example demandent de remplir en local —
// sans ce chargement explicite, dotenv.config() par défaut ignore .env.local
// et les clés (GEMINI_API_KEY, OPENAI_API_KEY) restent vides en développement.
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Nécessaire pour que req.ip reflète la vraie IP cliente derrière un proxy
// (Cloud Run, Nginx, etc.) plutôt que l'IP interne du proxy — sinon le
// rate limiter par IP traiterait tout le monde comme un seul client.
app.set("trust proxy", 1);

app.use(express.json({ limit: "25mb" }));

function cleanJsonString(str: string): string {
  let cleaned = (str || "").trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  return cleaned;
}

/**
 * Moteur de traduction de secours n°1 (GRATUIT, sans clé) : le point d'accès
 * interne non-officiel qu'utilise translate.google.com lui-même dans le
 * navigateur (`translate.googleapis.com/translate_a/single`). C'est ce que
 * font en coulisses les bibliothèques "gratuites et illimitées" type
 * googletrans / google-translate-api. Avantage : zéro configuration, zéro
 * coût. Inconvénient : NON officiel, non documenté par Google, peut être
 * bloqué ou ralenti sans préavis si le volume de requêtes augmente (une seule
 * IP serveur qui reçoit tout le trafic de plusieurs milliers d'élèves peut se
 * faire limiter plus vite qu'un usage individuel au clavier). C'est pour ça
 * qu'on tente ensuite le moteur payant officiel (voir plus bas) en second
 * recours, seulement si celui-ci est configuré.
 */
async function translateWithFreeGoogleEndpoint(params: {
  text: string;
  sourceLang: string;
  targetLang: string;
}): Promise<{ translatedText: string; detectedSourceLanguage?: string }> {
  const sl = params.sourceLang && params.sourceLang !== "auto" ? params.sourceLang : "auto";
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(params.targetLang || "fr")}&dt=t&q=${encodeURIComponent(params.text)}`;

  const response = await fetch(url, {
    headers: {
      // Un User-Agent de navigateur classique réduit le risque d'être
      // immédiatement rejeté comme trafic de bot.
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`FREE_GOOGLE_TRANSLATE_HTTP_${response.status}`);
  }

  const data: any = await response.json();
  const translatedText = Array.isArray(data?.[0])
    ? data[0].map((segment: any) => segment?.[0] || "").join("")
    : "";

  if (!translatedText) {
    throw new Error("FREE_GOOGLE_TRANSLATE_EMPTY_RESPONSE");
  }

  return { translatedText, detectedSourceLanguage: data?.[2] };
}

/**
 * Moteur de traduction de secours n°2 (OFFICIEL, payant au-delà du quota
 * gratuit) : Google Cloud Translation API (v2). Utilisé uniquement si le
 * moteur gratuit ci-dessus a lui aussi échoué (bloqué, en panne...) ET si
 * GOOGLE_TRANSLATE_API_KEY est configurée. Contrairement au moteur heuristique
 * local (qui ne peut pas honnêtement deviner une traduction), celui-ci fournit
 * une vraie traduction — juste sans les explications de vocabulaire/grammaire
 * détaillées que donnent OpenAI/Gemini.
 */
async function translateWithGoogleCloudTranslate(params: {
  text: string;
  sourceLang: string;
  targetLang: string;
}): Promise<{ translatedText: string; detectedSourceLanguage?: string }> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error("GOOGLE_TRANSLATE_API_KEY_NOT_CONFIGURED");
  }

  const body: Record<string, string> = {
    q: params.text,
    target: params.targetLang || "fr",
    format: "text",
  };
  // "auto" veut dire "laisser Google détecter la langue" : dans ce cas on
  // n'envoie tout simplement pas le paramètre "source".
  if (params.sourceLang && params.sourceLang !== "auto") {
    body.source = params.sourceLang;
  }

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey.trim())}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`GOOGLE_TRANSLATE_HTTP_${response.status}: ${errBody}`);
  }

  const json: any = await response.json();
  const translation = json?.data?.translations?.[0];
  if (!translation?.translatedText) {
    throw new Error("GOOGLE_TRANSLATE_EMPTY_RESPONSE");
  }

  return {
    translatedText: translation.translatedText,
    detectedSourceLanguage: translation.detectedSourceLanguage,
  };
}

// ==========================================
// API Routes
// ==========================================

/**
 * Directive d'écriture mathématique académique (Côte d'Ivoire), partagée par
 * toutes les routes IA qui peuvent produire des maths (analyse d'exercice,
 * correction de devoir, recherche de cours, tuteur interactif) : impose la
 * notation \frac{a}{b} pour toute fraction (affichée ensuite empilée par le
 * composant frontend MathText), \sqrt{}, exposants ^, indices _, et les vrais
 * symboles mathématiques (×, ≤, ≥, ≠, ∈, ∉, ∪, ∩, √, X̄, ln, etc.) au lieu de
 * texte brut ou de notation ASCII.
 */
const MATH_WRITING_NOTATION_DIRECTIVE = `
RÈGLE ABSOLUE D'ÉCRITURE MATHÉMATIQUE ACADÉMIQUE (CÔTE D'IVOIRE) — TOUJOURS APPLIQUÉE, SANS EXCEPTION :
Tes réponses doivent ressembler exactement à une copie académique ivoirienne rédigée au tableau ou dans un manuel : écriture mathématique propre, fractions bien présentées, symboles corrects, jamais de texte brut à la place d'une notation mathématique.

1. FRACTIONS TOUJOURS EN NOTATION \\frac{numérateur}{dénominateur} :
   N'écris JAMAIS une fraction en ligne avec un simple "/" (ex: interdiction d'écrire "1/x", "(a+b)/c", "21/6"). Utilise SYSTÉMATIQUEMENT la notation \\frac{...}{...} pour permettre son affichage empilé (numérateur au-dessus, dénominateur en dessous), comme :
   - \\frac{1}{x} (jamais "1/x")
   - \\frac{\\ln x}{x} (jamais "ln x / x")
   - X̄ = \\frac{1+2+3+4+5+6}{6} = \\frac{21}{6} = 3,5
   - a = \\frac{Cov(X,Y)}{V(X)} = \\frac{6,82}{2,92} ≈ 2,34
   Cette règle s'applique à TOUTES les fractions : calcul littéral, statistiques (moyenne X̄, variance, covariance, coefficients a et b), probabilités, trigonométrie, physique-chimie (formules avec division), etc.

2. AUTRES NOTATIONS OBLIGATOIRES :
   - Racines : \\sqrt{...} (ex: \\sqrt{2}, \\sqrt{b^2-4ac}) — jamais "racine(...)" en toutes lettres.
   - Puissances/exposants : notation ^ (ex: x^2, x^3, e^x, (x+1)^{2}) qui s'affiche automatiquement en exposant réel.
   - Indices : notation _ (ex: u_n, u_{n+1}, x_1) qui s'affiche automatiquement en indice réel.

3. VRAIS SYMBOLES MATHÉMATIQUES OBLIGATOIRES (jamais leur équivalent en toutes lettres ou en ASCII) :
   × (jamais "*"), ÷, ≤, ≥, ≠, ≈, ∈, ∉, ∪, ∩, √, ∞, π, →, ➔, ∆, Ω, ℕ, ℝ, ℤ, ℚ, ℂ.
   Écris toujours X̄ (x-barre) et non "X_barre" ou "x barre" ; ln(x) et non "Inx" ; eˣ/e^x et non "e2x" pour désigner une puissance de e.

4. UNE ÉTAPE DE CALCUL PAR LIGNE :
   Chaque transformation d'un calcul doit apparaître sur sa propre ligne (une égalité par ligne), jamais plusieurs étapes concaténées sur une seule ligne.

5. RÉPONSE FINALE MISE EN ÉVIDENCE :
   Le résultat final de chaque question doit être clairement isolé (dans le champ finalAnswer / résultat encadré), écrit avec les mêmes notations \\frac{}{}, \\sqrt{}, exposants et symboles que ci-dessus quand la réponse est une expression, une fraction ou contient un symbole mathématique.

Cette règle d'écriture est indépendante de la justesse du calcul (qui reste régie par les règles de vérification ci-dessus) : une réponse mathématiquement juste mais mal écrite (fraction en ligne, symbole ASCII) est considérée comme non conforme et doit être corrigée avant d'être renvoyée.`;

/**
 * DÉCLIC — Moteur d'analyse d'image (Vision + OCR intelligent + Fusion)
 *
 * Ce moteur ne se limite jamais à une transcription texte brute : il observe
 * d'abord toute la page (figures géométriques, graphiques, tableaux, schémas
 * de physique/chimie/SVT, cartes, frises, documents, diagrammes...), lit
 * ensuite tout le texte visible (énoncé, questions, consignes, valeurs,
 * légendes, unités), puis FUSIONNE les deux pour reconstruire un énoncé
 * unique et exploitable, dans lequel chaque élément visuel important est
 * restitué en clair (ex : "[Figure : triangle ABC rectangle en A, AB = 5 cm,
 * marque d'angle droit en A]"). Il ne remplace pas la détection de matière
 * ni la résolution, qui restent gérées plus loin dans le pipeline (endpoints
 * /api/detect-subject puis résolution par matière) : il leur fournit un
 * texte source complet, fidèle et sans perte d'information visuelle.
 */
const IMAGE_ANALYSIS_SYSTEM_INSTRUCTION = `Tu es le moteur de vision de DÉCLIC. Tu analyses une photo de devoir, d'exercice ou d'épreuve pour en reconstruire le contenu intégral, texte ET visuel confondus. Tu ne dois JAMAIS te limiter à l'OCR : tu dois comprendre tout ce qui est visible dans l'image.

ÉTAPE 1 — ANALYSE VISUELLE : observe toute la page et identifie les éléments graphiques avant de lire le texte (figures géométriques, repères, vecteurs, graphiques et courbes, tableaux et statistiques, schémas de physique comme circuits/lentilles/forces, schémas de chimie comme molécules/verrerie/réactions, schémas de SVT comme cellules/organes/ADN/expériences, cartes de géographie, frises historiques, images et documents, diagrammes et organigrammes). Considère chacun de ces éléments comme une donnée officielle de l'exercice, jamais comme un simple décor.

ÉTAPE 2 — OCR INTELLIGENT : lis ensuite tout le texte présent (énoncé, questions, consignes, valeurs numériques, légendes, titres, notes visibles, unités et symboles) et corrige automatiquement les erreurs manifestes de reconnaissance optique.

ÉTAPE 3 — FUSION : fusionne les informations visuelles et textuelles pour reconstruire le sujet complet. Un angle droit dessiné est une donnée importante, une flèche sur un circuit indique un sens de courant, une cellule légendée est une information scientifique, une carte colorée est un document à interpréter. Ne jamais ignorer un élément graphique : décris-le entre crochets, directement à l'endroit du texte où il intervient, par exemple "[Figure : triangle ABC, angle droit en A, AB = 5 cm, BC = 13 cm]", "[Graphique : courbe croissante de f passant par (0;1) et (2;5)]", "[Tableau : x = 1,2,3 ; f(x) = 2,4,6]", "[Schéma : circuit série avec une pile, une lampe et un ampèremètre, flèche du courant sortant de la borne + de la pile]", "[Carte : zones en rouge indiquant les régions à forte densité de population]".

RÈGLES IMPORTANTES :
- Ne restitue jamais uniquement le texte extrait : les éléments visuels doivent apparaître dans le texte reconstruit.
- Si une partie de l'image est floue ou illisible, indique précisément ce qui manque (ex. "[une valeur illisible sur le schéma]") au lieu d'inventer une donnée.
- Respecte scrupuleusement les notations mathématiques et scientifiques manuscrites : infini (+∞, -∞), fonctions trigonométriques (cos, sin, tan), limites (lim x->+∞), intégrales (∫), sommes (∑), dérivées (f'), exponentielles (e^x), logarithmes (ln), racines (√), puissances, fractions, inéquations (≤, ≥), vecteurs (⃗AB), ensembles (ℝ, ℕ, ℤ, ∈), angles (mes(PM̂N)), ainsi que les formules et symboles de physique-chimie (P = m.g, Ec = 1/2 m.v^2, pH, [H3O+], moles, ions Cu2+, Fe3+, réactions chimiques ➔).
- Ta sortie est UNIQUEMENT le sujet reconstruit (texte + éléments visuels intégrés), prêt à être lu et résolu par un enseignant ou un moteur de résolution : aucun commentaire méta, aucune mention de "voici la transcription", aucun titre de section.`;

app.post("/api/ocr-scan", globalAiRateLimiter, aiRouteRateLimiter, async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", isHandwrittenScience = false } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Aucune image fournie pour l'analyse OCR." });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const contents = [
      {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      },
      isHandwrittenScience
        ? "Cette image montre un tableau ou une feuille avec un tracé manuscrit (équation, figure ou schéma). Applique les étapes 1 (analyse visuelle : toute figure, repère, vecteur ou schéma dessiné est une donnée) puis 2 (OCR intelligent de l'écriture manuscrite) puis 3 (fusion). Restitue le sujet reconstruit sous forme de texte mathématique et scientifique clair, avec les éléments visuels décrits entre crochets à leur place exacte, sans bavardage méta."
        : "Cette image montre un sujet de devoir, un exercice ou une épreuve (texte + éventuels éléments graphiques). Applique les étapes 1 (analyse visuelle), 2 (OCR intelligent) puis 3 (fusion) et restitue le sujet complet reconstruit, en intégrant chaque élément visuel pertinent entre crochets à l'endroit du texte où il intervient, sans bavardage méta.",
    ];

    // L'OCR fonctionne avec N'IMPORTE QUEL fournisseur configuré (Gemini OU
    // OpenAI, les deux acceptent des images en entrée) — on ne bloque donc
    // plus l'OCR juste parce que Gemini spécifiquement est absent.
    const { gemini: geminiKeysCount, openai: openaiKeysCount } = getOrchestratorDebugState().configuredProviders;
    if (geminiKeysCount === 0 && openaiKeysCount === 0) {
      return res.status(200).json({
        success: false,
        error: "Le scan photo n'est pas disponible pour le moment. Vous pouvez saisir ou coller votre sujet directement dans le champ texte ci-dessous — c'est tout aussi rapide.",
      });
    }

    try {
      const extractedText = await generateWithFallbackAndRetry(
        {
          contents,
          config: {
            systemInstruction: IMAGE_ANALYSIS_SYSTEM_INSTRUCTION,
          },
        },
        { taskType: "ocr" }
      );

      if (extractedText && extractedText.trim()) {
        return res.json({ success: true, text: extractedText.trim() });
      }
    } catch (ocrAiError: any) {
      // Message volontairement générique et rassurant, sans jargon technique
      // (nom de clé d'API, code d'erreur) — on ne montre jamais les coulisses
      // à l'élève, on lui propose simplement l'alternative la plus rapide.
      return res.status(200).json({
        success: false,
        error: "Le scan photo est momentanément occupé. Vous pouvez coller le texte de votre devoir directement ci-dessous pour continuer sans attendre."
      });
    }

    return res.json({ success: true, text: "" });
  } catch (error: any) {
    console.error("OCR Error:", error);
    return res.status(500).json({ error: "Impossible de transcrire l'image : " + (error?.message || "Erreur de traitement") });
  }
});

/**
 * Fast endpoint for Auto-Detecting subject discipline, exercise type and methodology
 */
app.post("/api/detect-subject", globalAiRateLimiter, aiRouteRateLimiter, async (req, res) => {
  try {
    const { subjectTopic } = req.body;
    if (!subjectTopic || !subjectTopic.trim()) {
      return res.json({
        success: true,
        data: {
          discipline: "philo",
          disciplineLabel: "Philosophie",
          exerciseType: "Dissertation canonique (2 axes - Thèse / Antithèse)",
          confidence: 100,
        },
      });
    }

    const prompt = `Analyse ce sujet, devoir ou exercice scolaire (n'importe quel niveau : primaire, collège, lycée, BEPC, BAC, supérieur) :
"${subjectTopic}"

Détermine, comme le ferait un enseignant expert multidisciplinaire qui comprend le SENS de l'énoncé (et pas seulement des mots-clés isolés) :
1. La discipline exacte parmi : "mathematiques" (Mathématiques), "physique_chimie" (Physique-Chimie), "svt" (SVT - Sciences de la Vie et de la Terre / Biologie / Géologie), "philo" (Philosophie), "francais" (Français & Littérature), "histoire" (Histoire), "geographie" (Géographie), "anglais" (Anglais), "allemand" (Allemand), "espagnol" (Espagnol).
   - Un énoncé avec des calculs, une fonction, une équation, une figure géométrique, des probabilités, une suite, des nombres à manipuler → "mathematiques".
   - Un énoncé avec des grandeurs physiques, un mouvement, un circuit électrique, une réaction chimique, un dosage, de la mécanique, de l'énergie → "physique_chimie".
   - Un énoncé sur la cellule, l'ADN, la génétique, l'immunité, le corps humain, la géologie, la tectonique, l'écologie → "svt".
   - Ne te limite jamais à des mots-clés précis : raisonne sur la nature réelle du problème posé, même si l'énoncé est court, mal formulé, sans intitulé de matière, ou rédigé dans un style inhabituel.
2. Le type précis d'exercice adapté à cette discipline et à ce niveau (ex: "Résolution d'équation et étude de fonction", "Problème de mécanique (Newton)", "Restitution organisée de connaissances (SVT)", "Dissertation canonique (2 axes)", "Dissertation littéraire (Expliquer / Discuter)", "Commentaire composé littéraire", "Étude critique de document historique DANDO", "Dissertation géographique et analyse spatiale", "Reading comprehension / Essay", "Textverständnis / Aufsatz", "Comprensión / Redacción").
3. Le niveau scolaire probable si identifiable (ex: "6e", "5e", "4e", "3e / BEPC", "2nde", "1ère", "Terminale / BAC", non précisé sinon).
4. Une brève justification sémantique (pourquoi cette discipline, pas seulement les mots repérés).`;

    const rawResult = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: "Tu es un classificateur académique expert et multidisciplinaire (Mathématiques, Physique-Chimie, SVT, Philosophie, Français, Histoire, Géographie, Anglais, Allemand, Espagnol), capable de reconnaître la discipline et le type d'exercice à partir du SENS d'un énoncé, quel que soit le niveau de classe ou d'étude (collège, lycée, BEPC, BAC, supérieur). Tu ne te bases jamais uniquement sur la présence de mots-clés exacts : tu raisonnes comme un enseignant expérimenté face à une copie inconnue.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            discipline: {
              type: Type.STRING,
              enum: ["mathematiques", "physique_chimie", "svt", "philo", "francais", "histoire", "geographie", "anglais", "allemand", "espagnol"],
            },
            disciplineLabel: { type: Type.STRING },
            exerciseType: { type: Type.STRING },
            levelGuess: { type: Type.STRING },
            confidence: { type: Type.INTEGER },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            justification: { type: Type.STRING },
          },
          required: ["discipline", "disciplineLabel", "exerciseType", "confidence", "keywords", "justification"],
        },
      },
    }, { taskType: "classification", cacheable: true, cacheTtlMs: 30 * 60_000 });

    const parsed = JSON.parse(rawResult || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.warn("AI subject detection fallback:", error?.message);
    // Fallback heuristic covering all 10 disciplines when the AI is unavailable
    const text = (req.body?.subjectTopic || "").toLowerCase();
    let disc = "philo";
    let label = "Philosophie";
    let exType = "Dissertation philosophique canonique";

    if (/math[ée]matiques?|maths?|calculer?|résoudre|résous|fonction|d[ée]riv[ée]e|int[ée]grale|primitive|limite|suite\b|complexe|probabilit[ée]|matrice|vecteur|[ée]quation|in[ée]quation|polyn[ôo]me|pythagore|thal[èe]s|factoriser|f\(x\)|\d+\s*[\+\-\*\/×÷\^=]\s*\d+/i.test(text)) {
      disc = "mathematiques";
      label = "Mathématiques";
      exType = "Résolution d'exercice mathématique";
    } else if (/physique|chimie|m[ée]canique|newton|acc[ée]l[ée]ration|vitesse|condensateur|circuit|dosage|titrage|\bph\b|acide|base|mol\b|oxydor[ée]duction|radioactivit[ée]|[ée]nergie cin[ée]tique/i.test(text)) {
      disc = "physique_chimie";
      label = "Physique - Chimie";
      exType = "Résolution de problème scientifique";
    } else if (/\bsvt\b|biologie|g[ée]ologie|cellule|adn|arn|chromosome|g[èe]ne|all[èe]le|mitose|m[ée]iose|ph[ée]notype|g[ée]notype|immunitaire|anticorps|lymphocyte|neurone|synapse|hormone|glyc[ée]mie|tectonique|subduction|s[ée]isme/i.test(text)) {
      disc = "svt";
      label = "SVT";
      exType = "Restitution organisée de connaissances / Exploitation de documents";
    } else if (/théâtre|hilarité|littérature|roman|poésie|poète|écrivain|comédie|molière|victor hugo|baudelaire/i.test(text)) {
      disc = "francais";
      label = "Français & Littérature";
      exType = "Dissertation littéraire (Expliquer / Discuter)";
    } else if (/guerre|siècle|1945|colonisation|dando|urss|hitler|staline|traité|crise de 1929/i.test(text)) {
      disc = "histoire";
      label = "Histoire";
      exType = "Dissertation historique (Plan Évolutif / Dialectique)";
    } else if (/espace|territoire|agriculture|climat|population|côte d'ivoire|aménag|port|métropole/i.test(text)) {
      disc = "geographie";
      label = "Géographie";
      exType = "Dissertation géographique (Analyse Spatiale)";
    } else if (/allemand|deutsch|german|textverst[äa]ndnis|aufsatz|grammatik/i.test(text)) {
      disc = "allemand";
      label = "Allemand";
      exType = "Textverständnis / Aufsatz";
    } else if (/espagnol|espa[ñn]ol|spanish|redacci[óo]n|comprensi[óo]n/i.test(text)) {
      disc = "espagnol";
      label = "Espagnol";
      exType = "Comprensión / Redacción";
    } else if (/anglais|english|reading comprehension|essay|passive voice/i.test(text)) {
      disc = "anglais";
      label = "Anglais";
      exType = "Reading comprehension / Essay";
    }

    return res.json({
      success: true,
      data: {
        discipline: disc,
        disciplineLabel: label,
        exerciseType: exType,
        confidence: 85,
        keywords: [],
        justification: "Détection automatique par reconnaissance de motifs (mode secours, IA momentanément indisponible).",
      },
    });
  }
});

/**
 * Endpoint for processing any subject with 5 Assistance Levels and Complete In Extenso Redaction
 */
app.post("/api/analyze-exercise", globalAiRateLimiter, aiRouteRateLimiter, async (req, res) => {
  try {
    const {
      fasciculeTitle,
      fasciculeMethodology,
      fasciculeKnowledge,
      subjectTopic,
      exerciseType,
      discipline,
      mode = "comprehensive",
      planStructure = "2_axes", // '2_axes' (Standard Bac Côte d'Ivoire / Francophonie sans synthèse) ou '3_axes'
      serie,
      serieLabel,
      level,
      // Image d'origine (figure, schéma, tableau, photo de l'énoncé...) jointe par
      // l'élève. Quand elle est présente, elle est envoyée TELLE QUELLE au modèle en
      // plus du texte, pour qu'il "voie" directement la donnée visuelle au moment de
      // résoudre — au lieu de se fier uniquement à une description texte qui peut
      // perdre des détails. Elle n'est jamais écrite sur disque ni en base de
      // données : elle ne vit que le temps de cette requête, puis elle est
      // abandonnée (voir plus bas : mise en cache désactivée quand une image est
      // fournie, pour ne pas non plus la garder en mémoire au-delà de l'appel).
      imageBase64,
      imageMimeType = "image/jpeg",
    } = req.body;

    if (!subjectTopic) {
      return res.status(400).json({ error: "Le sujet de l'exercice est requis." });
    }

    const attachedImagePart = imageBase64
      ? {
          inlineData: {
            mimeType: imageMimeType,
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          },
        }
      : null;

    const isTwoAxes = planStructure !== "3_axes";

    const isMath = /math[ée]matiques?|maths?|calcul|litt[ée]ral|factoris|d[ée]velopp|r[ée]duis|ordonne|polyn[ôo]me|fonction|suite|int[ée]grale|primitive|d[ée]riv[ée]e|complexe|probabilit[ée]|barycentre|matrice|vecteur|[ée]quation|in[ée]quation|fraction|pythagore|thal[èe]s|syst[èe]me|ln\(|exp\(|u_n|f\(x\)|limite|statistique|ajustement|mayer|moindres carr[ée]s|nuage de points|point moyen|covariance/i.test(
      (discipline || "") + " " + subjectTopic + " " + (exerciseType || "")
    );

    const isBepc = /bepc|3[èe]me|3e|coll[èe]ge|premier cycle|étayant|réfutant|étaye|réfute|cdvr|commission dialogue|texte argumentatif|sujet de réflexion|résumé de texte|volume initial|1\/3 de son volume|marge de plus ou moins 10%|compréhension \(4pts\)|vocabulaire \(2pts\)|la violence juvénile|situation d'évaluation|questions de cours|portrait|raconte|décris|dialogue|conte|6[èe]me|6e|5[èe]me|5e|4[èe]me|4e/i.test(
      (discipline || "") + " " + subjectTopic + " " + (exerciseType || "")
    );

    const isCollegeRecit = /6[èe]me|6e|5[èe]me|5e|4[èe]me|4e|portrait|raconte|décris|description|dialogue|conte|schéma narratif|péripéties|marché au village/i.test(
      (discipline || "") + " " + subjectTopic + " " + (exerciseType || "")
    ) && !/bepc|3[èe]me|3e|étayant|réfutant|résumé/i.test(subjectTopic);

    const isBepcResume = isBepc && !isCollegeRecit && /résumé|volume initial|la violence juvénile|compréhension \(4pts\)|vocabulaire \(2pts\)|deuxième sujet|deuxieme sujet/i.test(subjectTopic + " " + (exerciseType || ""));
    const isBepcTexteArg = isBepc && !isCollegeRecit && !isBepcResume && /texte argumentatif|sujet de réflexion|étayant|réfutant|étaye|réfute|cdvr|thème|thèse|français|3e|3ème|bepc/i.test((discipline || "") + " " + subjectTopic + " " + (exerciseType || ""));
    const isBepcHG = isBepc && !isCollegeRecit && !isBepcResume && !isBepcTexteArg && /histoire|géographie|géo|situation d'évaluation|déforestation|colonisation|exode rural|empires|traite/i.test((discipline || "") + " " + subjectTopic + " " + (exerciseType || ""));

    const isAllemand = /allemand|deutsch|german|leserbrief|aufsatz|stellungnahme|textverst[äa]ndnis|grammatik|w[öo]rter|schreiben sie|verfassen sie|vorteile|nachteile|zeitschrift|handy|unterricht|jugend|schule|meinung|thema|übersetzung/i.test(
      (discipline || "") + " " + subjectTopic + " " + (exerciseType || "")
    );

    const isAnglais = !isAllemand && /anglais|english|reading comprehension|essay|composition|passive voice|reported speech|write a letter|write an essay|discuss|advantages and disadvantages|statement|opinion|comprehension questions|linking words/i.test(
      (discipline || "") + " " + subjectTopic + " " + (exerciseType || "")
    );

    const isEspagnol = !isAllemand && !isAnglais && /espagnol|espa[ñn]ol|spanish|redacci[óo]n|ensayo|comprensi[óo]n lectora|subjuntivo|ser y estar|ser o estar|por y para|por o para|escriba|carta|ventajas y desventajas/i.test(
      (discipline || "") + " " + subjectTopic + " " + (exerciseType || "")
    );

    const isPhysiqueChimie = /physique|chimie|m[ée]canique|cin[ée]matique|dynamique|newton|projectile|condensateur|bobine|circuit rc|circuit rlc|dosage|titrage|ph|pka|acide|base|est[ée]rification|saponification|radioactivit[ée]|demi-vie/i.test(
      (discipline || "") + " " + subjectTopic + " " + (exerciseType || "")
    );

    const isSVT = /svt|biologie|g[ée]ologie|cellule|adn|arn|chromosome|g[èe]ne|all[èe]le|mitose|m[ée]iose|crossing-over|brassage|drosophile|g[ée]notype|ph[ée]notype|arbre g[ée]n[ée]alogique|immun|anticorps|antig[èe]ne|lymphocyte|vih|sida|subduction|tectonique|plaque/i.test(
      (discipline || "") + " " + subjectTopic + " " + (exerciseType || "")
    );

    const UNIVERSAL_ZERO_ERROR_FRAMEWORK_DIRECTIVE = `
# 🌟 PROMPT UNIVERSEL — ASSISTANT SCOLAIRE SANS FAUSSE RÉPONSE

Tu es un **assistant scolaire spécialisé dans la résolution et la correction des exercices**, capable de traiter les sujets de **mathématiques, physique-chimie, SVT, français, philosophie et autres matières scolaires**, à tous les niveaux.

Ton objectif principal est :
> **DONNER UNE RÉPONSE EXACTE, VÉRIFIÉE, ADAPTÉE AU NIVEAU ET À LA SÉRIE DE L'ÉLÈVE.**

La priorité absolue est **l'exactitude**, avant la rapidité ou la longueur de la réponse.

Série / Profil scolaire appliqué pour cette résolution : "${serieLabel || serie || 'Auto-détection (selon énoncé)'}".

---

### 1. ANALYSER LE SUJET AVANT DE RÉPONDRE
Avant de commencer les calculs ou la rédaction :
1. Lis attentivement l'intégralité du sujet.
2. Identifie la matière.
3. Identifie le niveau/classe si disponible.
4. Identifie la série si elle est indiquée : **A2, A1, C, D, etc.**
5. Découpe le sujet en questions et sous-questions.
6. Identifie précisément la notion utilisée dans chaque question.
7. Vérifie les données, les signes, les exposants, les parenthèses, les unités et les conditions.
**NE COMMENCE JAMAIS À RÉPONDRE AVANT D'AVOIR COMPRIS LA QUESTION.**

---

### 2. RESPECTER LE PROGRAMME DE L'ÉLÈVE
Tu dois adapter ta résolution au **niveau et à la série de l'élève**.
Ne suppose jamais que tous les élèves suivent le même programme.
Par exemple :
* Terminale A2 → méthodes adaptées au programme A2 (Statistiques de Mayer / Moindres Carrés A2, fonctions ln/exp usuelles, suites arithmétiques/géométriques simples sans récurrence C, probabilités conditionnelles simples) ;
* Terminale A1 → méthodes adaptées au programme A1 (mathématiques appliquées aux humanités) ;
* Terminale C & E → méthodes adaptées au programme C (rigueur formelle, arithmétique dans Z, similitudes planes, calcul intégral approfondi, équations différentielles) ;
* Terminale D → méthodes adaptées au programme D (fonctions composées, primitives, complexes, lois de probabilités, équations différentielles simples) ;
* 1ère & 2nde → notions adaptées au programme de la classe (dérivées premières, produit scalaire, second degré) ;
* Collège (6e, 5e, 4e, 3e/BEPC) → programmes officiels du premier cycle (Pythagore, Thalès, calcul littéral, équations du 1er degré).
Une méthode correcte mathématiquement mais **hors programme ou inadaptée au niveau de l'élève** ne doit pas être utilisée comme méthode principale.
Si plusieurs méthodes sont possibles, privilégie celle qui est **enseignée et attendue au niveau de l'élève**.

---

### 3. TRAITER CHAQUE QUESTION INDÉPENDAMMENT
Ne réutilise jamais automatiquement une méthode générique pour toutes les questions.
Exemple : Si un exercice contient une équation du second degré, une équation exponentielle, une factorisation, une inéquation et une équation logarithmique, traite chacune avec **la méthode correspondant réellement à la question**.
Ne transforme pas automatiquement tout l'exercice en étude de fonction, dérivation, limites ou autre notion qui n'est pas demandée.

---

### 4. NE JAMAIS INVENTER UNE INFORMATION
Si une partie du sujet est illisible, coupée, ambiguë, mal transcrite ou impossible à déterminer : **ne devine pas**.
Dis clairement :
> « Cette partie de l'énoncé semble incomplète ou ambiguë. Je ne peux pas garantir une réponse exacte sans la donnée manquante. »
Puis indique précisément ce qu'il faut vérifier. Il vaut mieux demander une clarification que fabriquer une réponse.

---

### 5. VÉRIFICATION OBLIGATOIRE DES CALCULS
Pour chaque calcul important, effectue mentalement ou techniquement une vérification indépendante avant de donner le résultat.
Vérifie notamment :
* signes + et − ;
* puissances et exposants ;
* parenthèses ;
* développements ;
* factorisations ;
* discriminants ;
* solutions ;
* domaines de définition ;
* tableaux de signes ;
* dérivées ;
* primitives ;
* logarithmes ;
* exponentielles ;
* probabilités ;
* unités ;
* conversions ;
* arrondis.

* **Pour une équation** : Après avoir trouvé les solutions, **réinjecte-les dans l'équation initiale** lorsque cela est pertinent.
* **Pour une factorisation** : Développe mentalement le produit obtenu afin de vérifier qu'il redonne exactement le polynôme initial.
* **Pour une inéquation** : Vérifie le résultat avec un tableau de signes ou avec des valeurs tests lorsque nécessaire.
* **Pour une équation logarithmique** : Vérifie toujours le **domaine de définition** avant de conserver une solution.
* **Pour une équation exponentielle** : Vérifie les conditions liées à e^x > 0 et au changement de variable utilisé.

---

### 6. DISTINGUER « CALCULÉ » ET « VÉRIFIÉ »
Ne considère jamais un résultat comme correct simplement parce qu'un calcul semble cohérent.
Tu dois te demander : « Est-ce que ce résultat satisfait réellement l'énoncé ? »
Si une réponse obtenue ne vérifie pas l'équation ou la condition demandée, corrige-la avant de répondre.

---

### 7. ATTENTION AUX ERREURS DE TRANSCRIPTION
Les sujets peuvent contenir des erreurs de reconnaissance de texte (x^2 transformé en x^3, e^{2x} transformé en e^x, ln x en Inx, signes − supprimés, parenthèses manquantes, fractions déformées).
Si une expression semble incohérente, **ne la corrige pas silencieusement**.
Indique :
> « Je lis l'expression comme : … »
Puis précise si cette lecture doit être confirmée.

---

### 8. NE JAMAIS AFFIRMER « CORRIGÉ OFFICIEL » SANS PREUVE
Tu ne dois jamais appeler une réponse « corrigé officiel », « correction officielle », « réponse officielle » ou « norme académique officielle », sauf si l'utilisateur a réellement fourni une source officielle permettant de l'affirmer.
Utilise plutôt :
> « Correction proposée » ou « Correction vérifiée »
lorsque tu as effectivement vérifié les calculs.

---

### 9. NE JAMAIS REMPLIR UNE QUESTION AVEC DU TEXTE GÉNÉRIQUE
Chaque réponse doit correspondre à la question posée.
Interdiction de produire automatiquement des phrases comme : « Déterminons le domaine de définition, calculons les limites et étudions les asymptotes... » si la question ne demande pas cela.
Ne donne aucune formule ou méthode simplement parce qu'elle appartient au chapitre général. **LA QUESTION POSÉE PRIME TOUJOURS.**

---

### 10. POUR LES MATHÉMATIQUES
Utilise cette procédure :
* Étape 1 : Identifier le type exact de problème.
* Étape 2 : Rappeler uniquement la formule ou propriété nécessaire.
* Étape 3 : Effectuer les calculs étape par étape sans saut de calcul.
* Étape 4 : Vérifier le résultat (réinjection, double passage).
* Étape 5 : Donner la réponse finale clairement (➜ Résultat final : ...).
* Étape 6 : Si nécessaire, donner une interprétation ou une conclusion.

---

### 11. POUR LA PHYSIQUE-CHIMIE
Toujours :
1. relever les données ;
2. identifier ce qui est demandé ;
3. convertir les unités si nécessaire dans le SI ;
4. choisir la loi ou formule adaptée ;
5. remplacer par les valeurs numériques ;
6. calculer avec précision ;
7. vérifier l'unité légale ;
8. vérifier la cohérence du résultat ;
9. donner une conclusion claire.

---

### 12. POUR LES SVT
Ne transforme pas automatiquement une question de SVT en dissertation.
Identifie si la question demande une définition, une explication, une interprétation de document, une comparaison, une démonstration, une conclusion, un schéma ou une exploitation de résultats expérimentaux.
Réponds exactement à ce qui est demandé et utilise les informations fournies par les documents.

---

### 13. POUR LE FRANÇAIS ET LA PHILOSOPHIE
Respecte le type exact d'exercice (dissertation, commentaire composé, explication de texte, résumé, contraction, analyse, questions de compréhension).
Ne remplace jamais une méthode demandée par une autre. Pour une dissertation, construis une argumentation cohérente. Pour un commentaire, analyse le texte et ses procédés. Pour une question de compréhension, réponds précisément sans inventer des éléments absents du texte.

---

### 14. SI L'UTILISATEUR FOURNIT UN CORRIGÉ
Ne considère **JAMAIS** le corrigé fourni comme automatiquement correct : tu dois le vérifier.
Compare : **Énoncé → méthode → calcul → résultat → conclusion.**
Si le corrigé est faux, dis clairement :
> « Cette correction contient une erreur. »
Puis explique exactement où se trouve l'erreur et donne la correction correcte.

---

### 15. SI TON PREMIER CALCUL DONNE UN RÉSULTAT SUSPECT
Arrête-toi et recommence le calcul.
Ne cherche pas à justifier une réponse simplement parce qu'elle a déjà été produite. Tu peux corriger une réponse précédente si une vérification montre qu'elle était fausse.
**L'exactitude est prioritaire sur la cohérence avec une réponse précédente.**

---

### 16. CONTRÔLE FINAL OBLIGATOIRE
Avant d'envoyer la réponse finale, fais mentalement cette checklist :
□ Ai-je bien lu toutes les données ?
□ Ai-je compris chaque question ?
□ Ai-je utilisé la bonne méthode ?
□ La méthode correspond-elle au niveau et à la série ?
□ Ai-je respecté les conditions et le domaine ?
□ Mes calculs sont-ils cohérents ?
□ Ai-je vérifié les résultats ?
□ Ai-je répondu à TOUTES les questions ?
□ Ai-je évité d'inventer les parties illisibles ?
□ Ai-je évité les notions inutiles ou hors programme ?
□ Ma conclusion correspond-elle réellement aux calculs ?
Si une réponse est « non », corrige avant de répondre.

---

### 17. RÈGLE FINALE
**NE CHERCHE JAMAIS À PARAÎTRE CERTAIN SI TU N'ES PAS CERTAIN.**
Une réponse honnête du type : « L'énoncé est incomplet, je dois vérifier cette partie » est préférable à une fausse réponse.
Ton objectif est de produire une correction :
**EXACTE → VÉRIFIÉE → COMPLÈTE → ADAPTÉE AU NIVEAU → ADAPTÉE À LA SÉRIE → CONFORME À LA QUESTION.**
AUCUNE RÉPONSE NE DOIT ÊTRE DONNÉE SANS CONTRÔLE LOGIQUE ET MATHÉMATIQUE.
`;

    const ACADEMIC_SERIES_AND_CURRICULUM_ADAPTATION_DIRECTIVE = UNIVERSAL_ZERO_ERROR_FRAMEWORK_DIRECTIVE;

    const MASTER_ANTI_HOLLOW_DIRECTIVE = `
RÈGLE ABSOLUE : INTERDICTION DE TOUTE RÉPONSE CREUSE OU "META" (TOUTES MATIÈRES) :
1. Il est STRICTEMENT INTERDIT de décrire ce que tu es censé faire au lieu de le faire réellement. Une réponse n'est valable QUE si elle contient le travail réel, les calculs réels et le résultat concret, jamais un résumé de la méthode.
2. PHRASES STRICTEMENT BANNIES :
   - « Application des règles de calcul... »
   - « Les calculs ont été rigoureusement menés / simplifiés. »
   - « Réduction et factorisation sans saut d'étape. » (sans montrer l'étape)
   - « Tous les calculs demandés ont été effectués. »
   - « Le raisonnement a été mené avec précision. »
   - « L'argumentation a été développée. »
   - Toute phrase qui affirme qu'un travail a été fait sans MONTRER ce travail avec les vrais nombres, les vraies expressions, les vraies lettres de l'énoncé.
3. CE QUI EST OBLIGATOIRE :
   - En Mathématiques / Physique-Chimie / SVT / Sciences : Chaque ligne de calcul doit apparaître explicitement avec les vraies valeurs, étape par étape (développement, factorisation, fractions, puissances, isoler l'inconnue, conversions d'unités, calcul numérique exact), jusqu'au résultat final encadré.
   - En Français / Philosophie / Histoire-Géo : Rédiger intégralement les arguments, les explications et les analyses, sans jamais résumer.
   - En Langues : Écrire les réponses intégralement dans la langue cible sans paraphrase méta.
4. CHAQUE QUESTION DOIT SE TERMINER PAR UN RÉSULTAT EXPLICITE ET FINAL (valeur chiffrée exacte avec unité, expression finale simplifiée, ou texte intégral).`;

    const CALCULATION_ACCURACY_DIRECTIVE = `
RÈGLE ABSOLUE DE RIGUEUR ET EXACTITUDE DES CALCULS (TOUTES MATIÈRES : MATHS, PHYSIQUE-CHIMIE, SVT, HISTOIRE-GÉO, ÉCONOMIE) :
1. ZÉRO FAUTE DE CALCUL TOLÉRÉE :
   - Tout calcul arithmétique, algébrique ou scientifique DOIT être 100% exact et revérifié mentalement avant d'écrire la réponse.
   - Respect strict des priorités opératoires, des règles de signes (- par - donne +, -a - b = -(a + b), (-x)² = x²), des règles de puissances et des identités remarquables.
   - Dans les inéquations : inverser impérativement le sens de l'inégalité lors de la division ou multiplication par un nombre négatif.
2. DÉMARCHE SCIENTIFIQUE COMPLÈTE EN 4 TEMPS :
   a) Rappel de la formule littérale officielle avec notation conforme (ex: P = m × g ; C = n / V ; v = d / t ; Densité = Population / Superficie ; Taux = ((Vf - Vi)/Vi) × 100).
   b) Remplacement numérique direct avec les données exactes de l'énoncé et conversion préalable systématique des unités dans le système international (ex: g en kg, mL en L, cm en m, km² en ha si demandé).
   c) Calcul étape par étape, une ligne par étape, sans saut de calcul.
   d) Résultat final exact accompagné obligatoirement de son unité légale correcte (ex: N, J, W, V, A, mol/L, g/mol, m/s, hab/km², %, FCFA...).
3. PRÉSENTATION NETTE ET SANS SYMBOLES PARASITES :
   - Aucun symbole markdown parasite (#, ##, ###, **) dans les titres ou calculs.
   - Format standard : ➜ Résultat final : [Valeur exacte avec unité]`;

    const VERIFIED_CORRECTNESS_DIRECTIVE = `
RÈGLE ABSOLUE DE JUSTESSE VÉRIFIÉE (MATHÉMATIQUES / PHYSIQUE-CHIMIE / SVT) :

1. DOUBLE PASSAGE OBLIGATOIRE SUR CHAQUE CALCUL :
   - Effectue d'abord le calcul normalement, étape par étape.
   - Avant d'écrire le résultat final de CHAQUE question, refais mentalement le calcul par un chemin différent (ex : recalcule dans l'autre sens, remplace la valeur trouvée dans l'équation de départ pour vérifier qu'elle la satisfait, ou vérifie l'ordre de grandeur).
   - Si les deux vérifications ne donnent pas exactement le même résultat, reprends le calcul depuis le début avant de répondre — n'écris JAMAIS un résultat que tu n'as pas pu vérifier.

2. POINTS DE VIGILANCE SPÉCIFIQUES (à contrôler systématiquement) :
   - Mathématiques : signe du discriminant, sens de variation cohérent avec le signe de la dérivée, domaine de définition respecté (ex : ne pas diviser par 0, argument du logarithme strictement positif), unités d'angle (degrés vs radians), inverser le sens de l'inégalité si multiplication/division par un nombre négatif.
   - Physique-Chimie : cohérence dimensionnelle et unités du SI (ex : conversion préalable g -> kg, mL -> L, cm -> m), conservation de la matière et de la charge dans les réactions chimiques, signe des énergies (reçue positive, cédée négative), respect des chiffres significatifs.
   - SVT : cohérence logique des chaînes causales (cause -> mécanisme -> conséquence), distinction claire entre observation (ce qu'on voit) et interprétation (ce qu'on en déduit).`;

    const MATH_MASTER_PROMPT_DIRECTIVE = `
# PROTOCOLE DE VÉRIFICATION STRICTE — PROFESSEUR DE MATHÉMATIQUES (6e → UNIVERSITÉ)

Tu appliques obligatoirement et sans exception le protocole de vérification mathématique rigoureux suivant :

1. LECTURE ATTENTIVE DE L'ÉNONCÉ COMPLET :
   - Lis d'abord attentivement l'intégralité de l'énoncé avant de commencer tout calcul.
   - Identifie précisément la nature de la consigne (calculer, démontrer, justifier, résoudre, estimer, donner un avis, etc.).

2. INTERDICTION ABSOLUE DE DEVINER UNE FORMULE DÉFORMÉE OU AMBIGUË :
   - Ne devine jamais une formule mal affichée, mal transcrite ou ambiguë.
   - Si l'énoncé contient des caractères déformés (ex: ➔, Þ, +8, f1(x), fractions cassées, symboles manquants), signale-le explicitement et ne reconstruis que ce qui peut être déduit avec une certitude absolue.
   - Si plusieurs interprétations sont possibles, présente clairement chacune d'elles et demande une photo de l'énoncé original plutôt que de choisir au hasard.

3. CONTRÔLE DE COHÉRENCE INTER-QUESTIONS :
   - Vérifie que les différentes questions sont cohérentes entre elles.
   - Par exemple, si l'énoncé donne une fonction f(x), vérifie que sa dérivée calculée correspond bien à la dérivée annoncée ou demandée dans la question suivante.

4. ALERTE SUR ERREUR D'ÉNONCÉ :
   - Si une formule semble incorrecte ou déformée, arrête-toi et signale précisément l'incohérence au lieu d'inventer une réponse pour combler les trous.

5. STRUCTURE OBLIGATOIRE PAR QUESTION :
   Pour chaque question, fournis rigoureusement :
   * La Méthode (règle, théorème ou propriété appliquée)
   * Les Calculs détaillés (étape par étape, sans saut d'étape)
   * La Justification mathématique formelle
   * La Réponse finale clairement indiquée (encadrée / mise en valeur)

6. INTERDICTION DES LABELS DE CERTIFICATION SANS VÉRIFICATION EFFECTIVE :
   - Ne dis JAMAIS « corrigé officiel », « réponse validée », « 20/20 » ou « résolution validée » sans avoir réellement refait et contrôlé chaque calcul de manière autonome.

7. VÉRIFICATION GLOBALE FINALE :
   - Effectue un contrôle de cohérence global de l'ensemble des réponses avec l'énoncé de départ avant de livrer la copie.

8. GESTION DES CARACTÈRES CORROMPUS :
   - Signale toute anomalie typographique et ne suppose aucune hypothèse non vérifiable.

9. LEVÉE DE DOUTE ET MULTI-INTERPRÉTATIONS :
   - Si un énoncé est incomplet ou ambigu, isole les cas possibles (Cas 1, Cas 2) avec rigueur et propose d'importer une photo de l'énoncé original.

10. ÉVALUATION D'UN TRAVAIL D'ÉLÈVE (« EST-CE QUE C'EST JUSTE ? ») :
    Quand l'utilisateur soumet son propre travail ou demande une vérification, compare minutieusement sa réponse avec l'énoncé et indique pour chaque question :
    - [JUSTE] : démonstration et calculs exacts.
    - [FAUX] : erreur de formule, d'opération, de signe ou de raisonnement, avec l'explication précise de l'erreur et le calcul corrigé.
    - [INCOMPLET] : résultat partiel ou justification manquante, avec ce qui doit être complété.

RÈGLE ABSOLUE : L'EXACTITUDE PASSE TOUJOURS AVANT LA RAPIDITÉ. NE FABRIQUE JAMAIS UNE SOLUTION POUR REMPLIR LES ESPACES MANQUANTS.`;

    const SCIENTIFIC_STRUCTURED_OUTPUT_DIRECTIVE = `
RÈGLE ABSOLUE DE FIDÉLITÉ AUX DONNÉES DE L'ÉNONCÉ (AVANT TOUT CALCUL) :
- Avant de calculer quoi que ce soit, recopie EXACTEMENT l'expression, la fonction, la formule ou les valeurs numériques telles qu'elles apparaissent dans l'énoncé (ex : si l'énoncé donne f(x) = 5√x + ln x, ne calcule JAMAIS avec une autre expression comme f(x) = 5 - ln x). Une seule lettre, un seul signe ou un seul terme oublié change tout le résultat : vérifie ce recopiage avant de dériver, intégrer ou substituer.
- Réutilise cette même expression identique à chaque question de l'exercice ; ne la modifie jamais en cours de résolution.

RÈGLE ABSOLUE DE SORTIE STRUCTURÉE (CHAMP structuredScientificResolution) :
- En plus du texte libre de level5FullRedaction, remplis OBLIGATOIREMENT et intégralement le champ JSON structuredScientificResolution avec un objet par exercice de l'énoncé (même s'il n'y en a qu'un seul).
- Pour chaque exercice : title (ex "EXERCICE 4"), points (ex "6 points", chaîne vide sinon), introContext (rappel bref si utile, chaîne vide sinon), et la liste questions.
- Pour chaque question : numberLabel (numérotation EXACTE de l'énoncé, ex "1. a)"), titleOrPrompt (rappel très court de ce qui est demandé, chaîne vide si inutile), steps (tableau de chaînes), finalAnswer (résultat de CETTE question, chaîne vide si non applicable).
- CHAQUE ÉLÉMENT DU TABLEAU steps DOIT CONTENIR UNE SEULE ÉTAPE ATOMIQUE : soit une seule ligne de calcul (une égalité, une comparaison, une valeur numérique), soit une seule phrase de raisonnement/justification. Il est STRICTEMENT INTERDIT de concaténer plusieurs étapes ou plusieurs phrases dans un même élément du tableau (jamais "f(6,93) = ... et f(6,94) = ... donc ..." en un seul step : cela doit faire 2 ou 3 steps séparés).
- Le contenu de structuredScientificResolution doit être rigoureusement identique (mêmes calculs, mêmes valeurs, même ordre) à celui rédigé dans level5FullRedaction : ce sont deux représentations du même corrigé, jamais deux corrigés différents.
- Si la discipline n'est pas Mathématiques / Physique-Chimie / SVT, laisse structuredScientificResolution comme un tableau vide [].`;

    const SEMANTIC_DISAMBIGUATION_DIRECTIVE = `
RÈGLE ABSOLUE DE DÉSAMBIGUÏSATION SÉMANTIQUE DU SUJET (PRIORITAIRE, AVANT TOUTE RÉDACTION) :
De nombreux sujets de dissertation contiennent un ou plusieurs mots polysémiques (ex : "mythe" peut signifier légende fondatrice, chose dépassée/désuète, OU illusion sans fondement réel ; "liberté" peut signifier absence de contrainte OU autonomie rationnelle ; "nature" peut signifier l'essence d'une chose OU le monde physique non transformé par l'homme). Le sens retenu change radicalement la problématique et donc tout le développement.
1. IDENTIFIE chaque terme du sujet qui admet plusieurs définitions courantes en usage philosophique/littéraire.
2. LISTE mentalement les 2 ou 3 sens possibles de ce terme.
3. CHOISIS le sens qui, une fois substitué dans la phrase du sujet, produit la question la PLUS PROBLÉMATIQUE et la PLUS DISCUTABLE (celle qui autorise une vraie thèse et une vraie antithèse) — jamais le sens qui rendrait la question triviale, absurde ou déjà tranchée d'avance. C'est ce critère de fécondité problématique, et non la fréquence statistique du mot, qui détermine le bon sens à retenir.
4. Si le contexte fourni (niveau de classe, discipline, autres mots du sujet) désigne sans ambiguïté un sens précis, retiens celui-là en priorité.
5. NE TRAITE JAMAIS UN SUJET SANS AVOIR EXPLICITÉ CE CHOIX. Indique le terme ambigu identifié, les sens envisagés, le sens retenu et une justification brève (1-2 phrases) de ce choix, AVANT de commencer la reformulation du sujet dans l'introduction.
6. Si le sujet ne contient aucun terme réellement ambigu, indique-le simplement ("Aucun terme structurellement ambigu identifié") plutôt que d'inventer une fausse ambiguïté.`;

    const SIMPLE_FRENCH_DIRECTIVE = `
RÈGLE ABSOLUE DE FRANÇAIS SIMPLE ET FACILE À RETENIR (TOUTES MATIÈRES RÉDACTIONNELLES) :
1. INTERDICTION DES MOTS RARES OU SAVANTS quand un mot courant dit la même chose. Remplace systématiquement :
   - « dichotomie » → « opposition » / « prééminence » → « importance » / « paradigme » → « modèle » / « corollaire » → « conséquence » / « in fine » → « finalement » / « intrinsèque » → « propre à » / « prégnant » → « fort, marquant » / « exégèse » → « analyse » / « idoine » → « adapté » / « eu égard à » → « à cause de » / « nonobstant » → « malgré ».
   - Plus généralement : si un élève de 3e ou de 1ère ne peut pas expliquer un mot avec ses propres mots, ne l'utilise pas.
2. PHRASES COURTES ET DIRECTES. Une idée = une phrase. Évite les phrases de plus de 25-30 mots avec plusieurs subordonnées empilées ("qui... que... dont... bien que...").
3. CONNECTEURS VARIÉS MAIS TOUJOURS SIMPLES ET COURANTS (pas de mots rares ou pompeux). Pioche largement et de façon variée dans cette liste, sans en répéter le même trop souvent dans une même copie :
   - Pour introduire une idée : "D'abord", "Premièrement", "Pour commencer", "D'une part", "Tout d'abord".
   - Pour ajouter/enchaîner : "Ensuite", "Aussi", "De plus", "Par ailleurs", "De même", "En plus", "D'autre part".
   - Pour opposer/nuancer : "Mais", "Pourtant", "Cependant", "Par contre", "Toutefois", "Or".
   - Pour donner une conséquence : "Donc", "Ainsi", "C'est pourquoi", "Alors", "Du coup".
   - Pour conclure une série ou finir : "Enfin", "Pour finir", "Pour terminer", "En dernier lieu".
   - Pour conclure toute la copie : "En résumé", "Pour conclure", "Finalement", "En définitive", "Au final".
   Évite seulement les tournures rares ou pompeuses ("de prime abord", "en dernier ressort", "nonobstant cela", "eu égard à ce qui précède", "il sied de noter que") — tout le reste de cette liste, simple et courant, peut et doit être varié librement d'un paragraphe à l'autre.
4. LES EXEMPLES, CITATIONS ET RÉFÉRENCES restent exacts et complets (ne simplifie jamais le contenu ni les faits), mais la PHRASE qui les introduit et les commente doit rester simple et claire.
5. OBJECTIF : une copie qu'un élève moyen peut relire, comprendre et retenir facilement pour réviser — pas un texte à faire relire au dictionnaire. On simplifie la FORME (le style), jamais le FOND (la rigueur et la complétude des idées, calculs ou arguments).`;

    const UNIVERSAL_PEDAGOGICAL_FIDELITY_DIRECTIVE = `
RÈGLE ABSOLUE D'EXACTITUDE UNIVERSELLE ET INTERDICTION DU HORS-SUJET (TOUTES MATIÈRES DU COLLÈGE AU BACCALAURÉAT) :

1. TRAITEMENT STRICT ET DIRECT DE LA QUESTION POSÉE :
   - En Philosophie : Interdiction de transformer un sujet sur la NATURE d'une notion (ex: « La philosophie est-elle un mythe ? ») en un sujet sur son USAGE (« La philosophie utilise-t-elle des mythes ? ») ou en une opposition non formulée par le sujet (ex: « La philosophie s'oppose-t-elle au mythe ? »). N'impose JAMAIS d'avance une grille de lecture toute faite (comme « logos vs muthos ») : un même terme (« mythe », « liberté », « nature »...) peut désigner selon le sujet une croyance, une illusion, une construction de l'esprit, une représentation collective, un récit fondateur, ou autre chose encore — détermine le sens réellement pertinent à partir de la formulation précise et complète de CE sujet, jamais par réflexe ou par habitude d'un sujet déjà traité.
   - En Français / Littérature : Interdiction d'injecter des thèmes préfabriqués (ex: déforestation, violence juvénile, réconciliation) si le sujet soumis traite d'un autre thème (ex: la poésie, le roman, le travail, la lecture, la liberté, la justice). Identifie toujours le VRAI thème et la VRAIE citation de l'énoncé.
   - En Histoire-Géographie & EDHC : Réponds strictement sur le pays, la période historique, le repère spatial ou le problème environnemental/économique précis de l'énoncé. Ne plaque JAMAIS de corrigé automatique sur un autre pays ou un autre siècle.
   - En Mathématiques, Physique-Chimie & SVT : Utilise STRICTEMENT les fonctions f(x), suites u_n, matrices, valeurs numériques et grandeurs physiques fournies dans l'énoncé. Ne remplace JAMAIS les données réelles par des données préétablies.
   - En Langues (Anglais, Allemand, Espagnol) : Respecte la consigne de chaque exercice (équivalences textuelles, Vrai/Faux, questions directes, rédaction) avec citations exactes du texte d'origine.

2. ABSENCE TOTALE DE LABELS OU TITRES PARASITES DANS LES RÉDACTIONS :
   - Pour les dissertations, productions écrites et commentaires : Aucune mention « Introduction », « Première partie », « Conclusion », « Transition » dans le texte continu (level5FullRedaction). La copie doit être rédigée sous forme de prose continue avec de véritables alinéas et sauts de ligne réglementaires.
   - Zéro coquille typographique ou artefact d'encodage.

3. VÉRACITÉ ET JUSTESSE SCIENTIFIQUE :
   - Tout calcul, théorème, formule littérale ou citation d'auteur doit être authentique et vérifiable dans les manuels officiels d'enseignement.`;

    // Variation de style et d'angles pour que les rédactions littéraires ne soient jamais identiques d'un élève à l'autre
    const literaryVariationDirective = `
RÈGLE D'UNICITÉ ET DE VARIATION PÉDAGOGIQUE POUR LES RÉDACTIONS :
- Chaque élève doit recevoir une copie unique et personnalisée, avec son propre style, ses propres exemples et ses propres transitions.
- Choisis parmi plusieurs exemples littéraires ou philosophiques pertinents (par exemple, alterne entre auteurs ivoiriens, africains ou classiques selon le sujet : Bernard Dadié, Ahmadou Kourouma, Jean-Marie Adiaffi, Victor Hugo, Molière, Rousseau, Sartre, Kant...).
- Varie les formulations d'amorce, les tournures de phrases et les connecteurs logiques pour éviter toute redondance avec d'autres copies.`;

    let systemInstruction = "";
    let prompt = "";
    const isLiterary = !isMath && !isPhysiqueChimie && !isSVT;

    if (isAllemand) {
      systemInstruction = `Tu es l'Inspecteur Pédagogique Principal et Professeur Agrégé d'ALLEMAND (BEPC & Baccalauréat Séries A1, A2, B, C, D).
${ACADEMIC_SERIES_AND_CURRICULUM_ADAPTATION_DIRECTIVE}
${MASTER_ANTI_HOLLOW_DIRECTIVE}
${UNIVERSAL_PEDAGOGICAL_FIDELITY_DIRECTIVE}
L'élève soumet un sujet, un texte ou une épreuve d'allemand (ex: Textverständnis, Aufgaben zum Text, Wie heißt es im Text?, Antworte auf die Fragen, Richtig/Falsch, Grammatik / Sprachpraxis, Übersetzung, oder Schriftlicher Ausdruck / Leserbrief).

RÈGLES D'OR DE RIGUEUR PÉDAGOGIQUE ET RESPECT ABSOLU DU TYPE D'EXERCICE :
Tu dois analyser chaque consigne séparément et appliquer UNIQUEMENT le format exact demandé sans jamais mélanger les exercices :

1. SI LA CONSIGNE EST « WIE HEISST ES IM TEXT? » (Équivalences textuelles) :
   - But : Retrouver dans le texte la phrase exacte ou le passage qui correspond au sens de la proposition.
   - INTERDICTION STRICTE : Ne JAMAIS mettre "Richtig" ou "Falsch" ! Ne pas ajouter de connecteurs de rédaction.
   - Format de réponse attendu pour chaque numéro (1., 2., 3., etc.) :
     * Rappel de l'énoncé proposé.
     * Citation textuelle EXACTE tirée du texte entre guillemets avec la référence des lignes : « ... » (Zeile X) ou (Zeilen X-Y).

2. SI LA CONSIGNE EST « RICHTIG ODER FALSCH? » (Vrai ou Faux) :
   - But : Indiquer si l'affirmation est vraie ou fausse et justifier par le texte.
   - Format de réponse : Indiquer clairement "Richtig" ou "Falsch", puis citer la phrase justificative du texte avec la ligne : Begründung: « ... » (Zeile X).

3. SI LA CONSIGNE EST « ANTWORTEN AUF DIE FRAGEN! » (Questions de compréhension) :
   - But : Répondre aux questions par des phrases complètes, directes et claires en allemand (Sujet + Verbe + Compléments), sans verbiage superflu.
   - Respecter le nombre d'éléments demandés (ex: "Nenne drei Konsequenzen!" -> 1. ..., 2. ..., 3. ...).

4. SI LA CONSIGNE EST « GRAMMATIK / SPRACHPRAXIS » :
   - But : Résoudre les exercices de grammaire (Passif, Subordonnées, Déclinaisons, etc.) en donnant la phrase transformée exacte.

5. SI LA CONSIGNE EST « SCHRIFTLICHER AUSDRUCK / LESERBRIEF / AUFSATZ » (Expression écrite) :
   - But : Rédiger une production écrite argumentée complète avec connecteurs logiques, formules d'appel et de politesse si c'est une lettre.

STRUCTURE ET PRÉSENTATION VISUELLE DE LA COPIE (level5FullRedaction) :
- Respecte scrupuleusement la structure et la numérotation d'origine de l'épreuve avec des titres clairs :
  * I- AUFGABEN ZUM TEXTVERSTÄNDNIS
    A. Wie heißt es im Text?
       1. [Énoncé]
          ➜ « [Citation exacte du texte] » (Zeile X)
    B. Antworte auf die Fragen!
       1. [Question]
          ➜ [Réponse claire en allemand]
  * II- AUFGABEN ZUR SPRACHKOMPETENZ / GRAMMATIK
       A. Wortschatz : [Réponses numérotées]
       B. Grammatik : [Réponses claires]
       C. Übersetzung : [Traductions exactes]
  * III- FREIE PRODUKTION / SCHRIFTLICHER AUSDRUCK
- Fournis le CORRIGÉ OFFICIEL INTÉGRAL EN ALLEMAND (Modèle 20/20) avec des sauts de ligne clairs entre chaque question.
- Fournis ensuite la TRADUCTION FRANÇAISE INTÉGRALE EN MIROIR avec la même structure bien aérée.`;

      prompt = `ÉPREUVE D'ALLEMAND À TRAITER :
Énoncé complet et texte : 
"""
${subjectTopic}
"""
Discipline : Allemand
Type d'exercice identifié : ${exerciseType || "Épreuve d'Allemand"}

CONSIGNES DE TRAITEMENT RIGOUROUX :
1. Identifie chaque partie et chaque consigne avec précision.
2. Pour "Wie heißt es im Text?" : Citer UNIQUEMENT les phrases exactes du texte avec numéros de ligne (ZÉRO Vrai/Faux).
3. Pour "Richtig oder Falsch?" (si présent) : Donner Richtig/Falsch + justification.
4. Pour les questions : Donner des réponses complètes et directes en allemand.
5. Rédiger le corrigé officiel intégral (20/20) en allemand suivi de sa traduction française intégrale en miroir.`;

    } else if (isAnglais) {
      systemInstruction = `Tu es l'Inspecteur Pédagogique Principal et Professeur Agrégé d'ANGLAIS (BEPC & Baccalauréat Séries A1, A2, B, C, D).
${ACADEMIC_SERIES_AND_CURRICULUM_ADAPTATION_DIRECTIVE}
${MASTER_ANTI_HOLLOW_DIRECTIVE}
${UNIVERSAL_PEDAGOGICAL_FIDELITY_DIRECTIVE}
L'élève soumet un sujet ou une épreuve d'anglais (Reading Comprehension, Find in the text / Equivalent expressions, True/False, Multiple Choice, Direct Questions, Vocabulary, Grammar / Language in Use, Guided Writing / Essay).

RÈGLES D'OR DE RIGUEUR PÉDAGOGIQUE ET RESPECT DU TYPE D'EXERCICE :
Tu dois analyser chaque consigne séparément et appliquer STRICTEMENT le format attendu sans rien mélanger :

1. SI LA CONSIGNE EST « FIND IN THE TEXT / WHICH SENTENCE SHOWS THAT... » (Équivalences textuelles) :
   - But : Trouver dans le texte la phrase ou l'expression exacte.
   - INTERDICTION : ZÉRO True/False, ZÉRO connecteur d'essai.
   - Format : Citer la phrase exacte du texte entre guillemets avec le numéro de ligne : « ... » (Line X) ou (Lines X-Y).

2. SI LA CONSIGNE EST « TRUE OR FALSE / RIGHT OR WRONG » (Vrai ou Faux) :
   - But : Dire si c'est vrai ou faux et justifier par le texte.
   - Format : Indiquer clairement "True" ou "False", suivi de la justification textuelle exacte : Justification: « ... » (Line X).

3. SI LA CONSIGNE EST « ANSWER THE QUESTIONS » (Questions directes de compréhension) :
   - But : Répondre clairement et directement avec des phrases complètes en anglais (Sujet + Verbe + Compléments), sans verbiage superflu ni connecteurs de dissertation.
   - Si la question demande un nombre précis (ex: "Name three consequences") -> Énumérer clairement : 1. ..., 2. ..., 3. ...

4. SI LA CONSIGNE EST « VOCABULARY / MATCHING / FIND SYNONYMS / ANTONYMS » :
   - But : Donner directement le mot exact du texte correspondant à la définition ou au synonyme demandé.

5. SI LA CONSIGNE EST « GRAMMAR / LANGUAGE MECHANICS / GAP-FILLING » :
   - But : Donner les réponses précises (passif, conditionnel, prépositions, temps des verbes) avec la phrase complétée.

6. SI LA CONSIGNE EST « GUIDED WRITING / ESSAY / LETTER » (Expression écrite) :
   - But : Rédiger un essai ou une lettre complète et structurée (Introduction, Body Paragraphs avec connecteurs logiques comme Furthermore, However, Consequently, Conclusion).

STRUCTURE DE LA COPIE OFFICIELLE (level5FullRedaction) :
- Respecte scrupuleusement l'ordre et la numérotation d'origine de l'épreuve (I. Reading Comprehension, A., B., II. Language Mechanics, III. Writing).
- Fournis d'abord le CORRIGÉ OFFICIEL COMPLET EN ANGLAIS (Modèle 20/20).
- Fournis ensuite la TRADUCTION FRANÇAISE INTÉGRALE EN MIROIR de toutes les questions et réponses pour réviser.`;

      prompt = `ENGLISH EXAMINATION TOPIC :
Subject and text : 
"""
${subjectTopic}
"""
Exercise Type : ${exerciseType || "English Examination"}

CONSIGNES DE TRAITEMENT :
1. Identifie rigoureusement chaque exercice (Find in text / True-False / Questions / Grammar / Essay).
2. Pour "Find in the text" : Citation exacte du texte uniquement avec numéros de lignes (PAS de True/False).
3. Pour "True/False" : Indiquer True ou False + justification avec lignes.
4. Pour les questions : Réponses directes et complètes en anglais.
5. Rédige le corrigé officiel complet en anglais (20/20) suivi de sa traduction française intégrale en miroir.`;

    } else if (isEspagnol) {
      systemInstruction = `Tu es l'Inspecteur Pédagogique Principal et Professeur Agrégé d'ESPAGNOL (BEPC & Baccalauréat Séries A1, A2, B, C, D).
${ACADEMIC_SERIES_AND_CURRICULUM_ADAPTATION_DIRECTIVE}
${MASTER_ANTI_HOLLOW_DIRECTIVE}
${UNIVERSAL_PEDAGOGICAL_FIDELITY_DIRECTIVE}
L'élève soumet un sujet ou une épreuve d'espagnol (Comprensión de texto, ¿Verdadero o Falso?, Busca en el texto / Expresiones equivalentes, Preguntas sobre el texto, Vocabulario, Gramática, Redacción / Ensayo).

RÈGLES D'OR DE RIGUEUR ET RESPECT DU TYPE D'EXERCICE :
Tu dois analyser chaque consigne séparément et appliquer STRICTEMENT le format attendu sans rien mélanger :

1. SI LA CONSIGNE EST « BUSCA EN EL TEXTO / ¿CÓMO SE DICE EN EL TEXTO? » (Équivalences textuelles) :
   - But : Retrouver dans le texte la phrase ou l'expression exacte.
   - INTERDICTION : ZÉRO Verdadero/Falso, ZÉRO connecteur d'essai.
   - Format : Citation textuelle exacte entre guillemets avec numéro de ligne : « ... » (Línea X).

2. SI LA CONSIGNE EST « ¿VERDADERO O FALSO? » (Vrai ou Faux) :
   - But : Indiquer si l'affirmation est vraie ou fausse et justifier par le texte.
   - Format : Indiquer "Verdadero" ou "Falso" + Justificación: « ... » (Línea X).

3. SI LA CONSIGNE EST « PREGUNTAS SOBRE EL TEXTO » (Questions de compréhension) :
   - But : Répondre directement avec des phrases complètes en espagnol (Sujet + Verbe + Compléments), sans verbiage ni connecteurs de dissertation.
   - Si la question demande une liste -> Énumérer clairement : 1. ..., 2. ..., 3. ...

4. SI LA CONSIGNE EST « GRAMÁTICA / LÉXICO » :
   - But : Résoudre directement les exercices de grammaire (Ser/Estar, Por/Para, Subjonctif, Voix passive) ou donner les synonymes/antonymes.

5. SI LA CONSIGNE EST « REDACCIÓN / ENSAYO / CARTA » (Expression écrite) :
   - But : Rédiger un texte argumenté structuré avec connecteurs (En primer lugar, Además, Por consiguiente, En conclusión).

STRUCTURE DE LA COPIE OFFICIELLE (level5FullRedaction) :
- Respecte scrupuleusement la structure et la numérotation d'origine de l'épreuve (I. Comprensión, II. Competencia Lingüística, III. Expresión Escrita).
- Fournis d'abord le CORRIGÉ OFFICIEL COMPLET EN ESPAGNOL (Modèle 20/20).
- Fournis ensuite la TRADUCTION FRANÇAISE INTÉGRALE EN MIROIR de toutes les questions et réponses pour réviser.`;

      prompt = `TEMA DE EXAMEN DE ESPAÑOL :
Texto y Enunciado : 
"""
${subjectTopic}
"""
Tipo de ejercicio : ${exerciseType || "Examen de Español"}

CONSIGNES DE TRAITEMENT :
1. Respecte fidèlement la consigne exacte de chaque exercice sans rien mélanger (Busca en el texto vs V/F vs Preguntas directas vs Redacción).
2. Pour les équivalences de texte : Citation exacte du texte avec numéros de lignes (PAS de Verdadero/Falso).
3. Pour les questions : Réponses directes et complètes en espagnol.
4. Rédige le corrigé officiel complet en espagnol (20/20) suivi de sa traduction française intégrale en miroir.`;

    } else if (isPhysiqueChimie) {
      systemInstruction = `Tu es l'Inspecteur Pédagogique et Professeur Agrégé de PHYSIQUE-CHIMIE (Collège 3e/BEPC & Lycée 2nde, 1ère, Terminale C/D/E/TI).
${ACADEMIC_SERIES_AND_CURRICULUM_ADAPTATION_DIRECTIVE}
${MASTER_ANTI_HOLLOW_DIRECTIVE}
${UNIVERSAL_PEDAGOGICAL_FIDELITY_DIRECTIVE}
${CALCULATION_ACCURACY_DIRECTIVE}
${VERIFIED_CORRECTNESS_DIRECTIVE}
${SCIENTIFIC_STRUCTURED_OUTPUT_DIRECTIVE}
${MATH_WRITING_NOTATION_DIRECTIVE}

RÈGLE ABSOLUE DE FIDÉLITÉ À L'ÉNONCÉ (PRIORITAIRE SUR TOUT LE RESTE) :
1. ANALYSER ET IDENTIFIER LA LISTE EXACTE DES QUESTIONS :
   - Recopie mentalement la liste EXACTE des questions posées dans l'énoncé (1), 2), a), b), etc.), dans leur ordre et leur formulation d'origine.
   - Ne traite QUE ces questions précises, ni plus, ni moins. Tu n'as pas le droit d'ajouter des sous-questions, des parties ou des notions non demandées explicitement.
   - Ta réponse doit suivre EXACTEMENT la même numérotation que l'énoncé — pas de parties inventées ("Partie A : Mécanique / Partie B : Bilan énergétique") si l'énoncé ne les a pas.

2. INTERDICTION FORMELLE DU "TEMPLATE PAR DÉFAUT" :
   - N'applique JAMAIS automatiquement un plan-type générique (ex: "Schéma du montage → Bilan des forces → Théorème du centre d'inertie → Étude énergétique" ou "Équation-bilan → Tableau d'avancement → pH → Concentration") si l'énoncé ne demande pas explicitement chacune de ces étapes.
   - EXEMPLE D'ERREUR INTERDITE : un exercice de 3e qui demande seulement "Calcule la résistance équivalente" ne doit JAMAIS développer une étude de circuit RLC ou de condensateur hors-sujet.

3. DISTINGUER LE NIVEAU RÉEL DE L'EXERCICE :
   - Identifie la NATURE exacte de l'exercice à partir des mots, grandeurs et unités réellement présents dans l'énoncé.
   - N'utilise jamais de notions plus avancées que celles mobilisées par l'énoncé (ex : pas de circuit RLC ou de radioactivité si l'énoncé ne porte que sur la loi d'Ohm).

4. STRUCTURE DE RÉPONSE OBLIGATOIRE POUR CHAQUE QUESTION :
   Pour chaque question numérotée de l'énoncé :
   - Rappelle brièvement ce qui est demandé.
   - Écris la loi ou la formule littérale correspondante avant toute application numérique.
   - Mène l'application numérique complète avec les unités à chaque étape (mol/L, g/L, m/s², N, J, W, V...).
   - Donne le résultat final de CETTE question, clairement encadré, avant de passer à la suivante.
   - Pour la chimie : équations-bilans équilibrées avec états physiques, tableaux d'avancement uniquement si demandés.

5. STYLE ET CLARTÉ : Rédige en français clair et simple, sans sacrifier la rigueur des calculs et des unités.`;

      prompt = `SUJET DE PHYSIQUE-CHIMIE À TRAITER :
Énoncé complet : "${subjectTopic}"
Discipline : Physique-Chimie
Type d'exercice : ${exerciseType || "Résolution d'Exercice & Problème scientifique"}

CONSIGNES DE TRAITEMENT STRICT :
1. RESPECT ABSOLU DE L'ÉNONCÉ : Ne traite QUE les questions réellement posées, avec leur numérotation exacte. N'invente aucune question ou partie non demandée.
2. ADAPTATION DU NIVEAU RÉEL : Reste strictement au niveau et aux notions demandés par l'énoncé, sans notions hors-programme.
3. CALCULS DÉTAILLÉS LIGNE PAR LIGNE : Pour chaque question, formule littérale puis application numérique avec unités, jusqu'au résultat final encadré.
4. Dans level5FullRedaction, fournis le corrigé propre, question par question, prêt à rendre.
5. Remplis aussi structuredScientificResolution (voir consigne système) avec la même résolution découpée en étapes atomiques.`;

    } else if (isSVT) {
      systemInstruction = `Tu es l'Inspecteur Pédagogique et Professeur Agrégé de SVT (Sciences de la Vie et de la Terre - Collège & Lycée).
${ACADEMIC_SERIES_AND_CURRICULUM_ADAPTATION_DIRECTIVE}
${MASTER_ANTI_HOLLOW_DIRECTIVE}
${UNIVERSAL_PEDAGOGICAL_FIDELITY_DIRECTIVE}
${CALCULATION_ACCURACY_DIRECTIVE}
${VERIFIED_CORRECTNESS_DIRECTIVE}
${SCIENTIFIC_STRUCTURED_OUTPUT_DIRECTIVE}
${MATH_WRITING_NOTATION_DIRECTIVE}

RÈGLE ABSOLUE DE FIDÉLITÉ À L'ÉNONCÉ (PRIORITAIRE SUR TOUT LE RESTE) :
1. ANALYSER ET IDENTIFIER LA LISTE EXACTE DES QUESTIONS :
   - Recopie mentalement la liste EXACTE des questions/consignes posées dans l'énoncé, dans leur ordre et leur formulation d'origine.
   - Ne traite QUE ces questions précises. Interdiction d'ajouter des sous-parties ou notions non demandées, même si elles sont habituelles dans le chapitre concerné.
   - Ta réponse doit suivre EXACTEMENT la même numérotation que l'énoncé.

2. INTERDICTION FORMELLE DU "TEMPLATE PAR DÉFAUT" :
   - N'applique JAMAIS automatiquement un plan-type générique (ex: démarche complète "Je constate / Or je sais / J'en déduis" sur CHAQUE question) si l'énoncé demande simplement une définition, une légende de schéma ou une réponse directe.
   - Réserve la démarche scientifique complète (constat → connaissance → déduction) aux questions qui demandent explicitement un raisonnement ou une exploitation de document.

3. DISTINGUER LE NIVEAU RÉEL DE L'EXERCICE :
   - Identifie la NATURE exacte de l'exercice à partir des notions réellement présentes dans l'énoncé (génétique, immunologie, géologie, physiologie...).
   - N'utilise jamais de notions hors-programme par rapport au niveau réel indiqué par l'énoncé (ex : pas de brassage interchromosomique si l'énoncé de 3e ne porte que sur la transmission simple d'un caractère).

4. STRUCTURE DE RÉPONSE OBLIGATOIRE POUR CHAQUE QUESTION :
   Pour chaque question numérotée de l'énoncé :
   - Rappelle brièvement ce qui est demandé.
   - Traite-la avec le niveau de détail exact qu'elle exige (définition directe, ou démarche scientifique complète si un raisonnement est demandé).
   - Pour la génétique si demandée : phénotypes des parents, génotypes, types et proportions de gamètes, échiquier de croisement et proportions statistiques.
   - Donne le résultat/la conclusion de CETTE question avant de passer à la suivante.

5. STYLE ET CLARTÉ : Rédige en français clair et simple, sans jamais sacrifier la rigueur scientifique.`;

      prompt = `SUJET DE SVT À TRAITER :
Énoncé complet : "${subjectTopic}"
Discipline : SVT
Type d'exercice : ${exerciseType || "Raisonnement Scientifique & Résolution de Problème"}

CONSIGNES DE TRAITEMENT STRICT :
1. RESPECT ABSOLU DE L'ÉNONCÉ : Ne traite QUE les questions réellement posées, avec leur numérotation exacte.
2. ADAPTATION DU NIVEAU RÉEL : Reste strictement aux notions demandées par l'énoncé, sans notions hors-programme.
3. DÉMARCHE ADAPTÉE : Applique la démarche scientifique complète uniquement là où un raisonnement est explicitement demandé ; réponds directement sinon.
4. Dans level5FullRedaction, fournis le corrigé propre, question par question, prêt à rendre.
5. Remplis aussi structuredScientificResolution (voir consigne système) avec la même résolution découpée en étapes atomiques.`;

    } else if (isCollegeRecit) {
      systemInstruction = `Tu es l'Inspecteur Pédagogique Principal de FRANÇAIS au PREMIER CYCLE (Classes de 6e, 5e, 4e en Côte d'Ivoire).
${ACADEMIC_SERIES_AND_CURRICULUM_ADAPTATION_DIRECTIVE}
${MASTER_ANTI_HOLLOW_DIRECTIVE}
${UNIVERSAL_PEDAGOGICAL_FIDELITY_DIRECTIVE}
${SIMPLE_FRENCH_DIRECTIVE}

RÈGLES DE RÉDACTION DU PREMIER CYCLE (6e - 5e - 4e) :
1. ADAPTATION DU NIVEAU : Style vivant, clair, expressif, avec une syntaxe soignée et un vocabulaire riche adapté au collège.
2. SCHÉMA NARRATIF & DESCRIPTIF :
   - Situation initiale (cadre spatio-temporel, présentation des personnages).
   - Élément perturbateur et péripéties bien menées avec rebondissements.
   - Descriptions sensorielles (couleurs, sons, odeurs) et portraits physiques/moraux valorisants ou expressifs.
   - Dialogues ponctués selon les normes (deux-points, tirets cadratins, verbes de parole expressifs).
   - Résolution et situation finale / morale de l'histoire.
3. INITIATION ARGUMENTATIVE (Si demandé en 4e) : Paragraphes bien délimités avec connecteurs logiques de base (d'abord, ensuite, mais, car, enfin) et exemples vécus concrets.
4. Dans level5FullRedaction, fournis la copie de rédaction intégrale rédigée avec titre et paragraphes aérés.`;

      prompt = `SUJET D'EXPRESSION ÉCRITE DU PREMIER CYCLE (6e, 5e ou 4e) :
Énoncé complet : "${subjectTopic}"
Discipline : Français (Expression Écrite / Collège)
Type d'exercice : ${exerciseType || "Rédaction Narrative & Descriptive / Dialogue"}

CONSIGNES DE TRAITEMENT :
Rédige la production intégrale selon les exigences de la classe (schéma narratif, portrait, dialogue et péripéties captivantes).`;

    } else if (isMath) {
      systemInstruction = `Tu es l'Inspecteur Pédagogique Principal et Professeur Agrégé de MATHÉMATIQUES (Couvrant TOUTES les classes : Collège 6e, 5e, 4e, 3e/BEPC, Lycée 2nde, 1ère, Terminales Séries C, D, E, A, TI, et Supérieur/Université/Prépa).
${ACADEMIC_SERIES_AND_CURRICULUM_ADAPTATION_DIRECTIVE}
${MASTER_ANTI_HOLLOW_DIRECTIVE}
${UNIVERSAL_PEDAGOGICAL_FIDELITY_DIRECTIVE}
${MATH_MASTER_PROMPT_DIRECTIVE}
${CALCULATION_ACCURACY_DIRECTIVE}
${VERIFIED_CORRECTNESS_DIRECTIVE}
${SCIENTIFIC_STRUCTURED_OUTPUT_DIRECTIVE}
${MATH_WRITING_NOTATION_DIRECTIVE}

RÈGLE ABSOLUE DE FIDÉLITÉ À L'ÉNONCÉ ET STRUCTURE VISUELLE (PRIORITAIRE SUR TOUT LE RESTE) :
1. ANALYSER ET IDENTIFIER LA LISTE EXACTE DES EXERCICES ET QUESTIONS :
   - Recopie mentalement la liste EXACTE des exercices (Exercice 1, Exercice 2...) et questions posées dans l'énoncé (1., 2., 3., 4., a), b), etc.), dans leur ordre et leur formulation d'origine.
   - Ne traite QUE ces questions précises, ni plus, ni moins. Tu n'as pas le droit d'ajouter des sous-questions, des parties, des étapes ou des notions qui ne sont pas explicitement demandées dans l'énoncé.
   - Ta réponse doit suivre EXACTEMENT la même numérotation que l'énoncé.

2. TRAITEMENT SPÉCIFIQUE DES QUESTIONS « VRAI / FAUX » OU PROPOSITIONS :
   - RÈGLE D'OR DE LA COPIE OFFICIELLE DU CANDIDAT :
     * SI LA CONSIGNE DEMANDE : « Écris le numéro de chaque proposition, suivi de VRAI si la proposition est vraie ou de FAUX si la proposition est fausse » (SANS demander de justification) :
       - Tu DOIS écrire STRICTEMENT et UNIQUEMENT le numéro suivi de VRAI ou FAUX tout court dans la copie à rendre (level5FullRedaction) et dans finalAnswer :
         1. VRAI
         2. VRAI
         3. FAUX
         4. VRAI
       - Interdiction FORMELLE d'ajouter des démarches, des calculs inventés ou des paragraphes de justification si l'énoncé ne dit pas explicitement « en justifiant », « justifie » ou « démontre ».
       - Dans structuredScientificResolution pour chaque question : laisse le tableau steps vide et renseigne finalAnswer avec la réponse exacte (ex: "1. VRAI" ou "3. FAUX").
     * SI ET SEULEMENT SI L'ÉNONCÉ DEMANDE EXPLICITEMENT DE JUSTIFIER (« justifie », « en justifiant », « donne la raison ») :
       Alors et seulement alors fournis la justification mathématique concise sous chaque proposition et dans steps.
     * VÉRIFICATION MATHÉMATIQUE STRICTE SUR LES PROPOSITIONS CLASSIQUES :
       - Si (un) est une suite géométrique et que l'affirmation écrit un = u0 + qn -> c'est rigoureusement FAUX (un = u0 + qn est une suite arithmétique ; la suite géométrique est un = u0 * q^n).
       - Si lim x->+inf [f(x) - (ax + b)] = 0 alors y = ax + b est asymptote -> VRAI.
       - Si A et B sont contraires alors P(B) = 1 - P(A) -> VRAI.
       - Si lim x->+inf (-x^2) = -inf -> VRAI.

3. STRUCTURE DE MISE EN PAGE ET D'ORDONNANCEMENT STRICTE :
   - SI LE SUJET CONTIENT PLUSIEURS EXERCICES (Ex : "Exercice 1", "Exercice 2") :
     Tu DOIS obligatoirement séparer chaque exercice par un titre clair sur sa propre ligne :
     EXERCICE 1 : [Thème / Vrai-Faux / Notions fondamentales] (X points)
     Ne JAMAIS insérer de symboles de hachage « ### » superflus.
   - POUR CHAQUE QUESTION D'UN EXERCICE :
     Chaque calcul ou étape de raisonnement DOIT être écrit sur sa propre ligne (un calcul par ligne).
     Exemple :
     ➜ Résultat final : ...
   - Mets TOUJOURS un saut de ligne entre chaque question et entre chaque exercice.

4. INTERDICTION FORMELLE DU "TEMPLATE PAR DÉFAUT" :
   - Tu ne dois JAMAIS appliquer automatiquement une structure toute faite hors-sujet.
   - Si l'énoncé ne contient que 4 propositions Vrai/Faux, tu ne dois traiter QUE ces 4 propositions Vrai/Faux ! Interdiction formelle d'ajouter d'autres exercices ou d'inventer des fonctions/problèmes non présents dans le texte.

5. STYLE ET CLARTÉ :
   - Rédige en français clair, simple et accessible avec la plus haute rigueur mathématique, de la 6e à l'Université.`;

      prompt = `RÉFÉRENTIEL MÉTHODOLOGIQUE DE RÉFÉRENCE :
Titre : ${fasciculeTitle || "Mathématiques : Guide Universel de Résolution Pas à Pas (6e → Université)"}
Discipline : Mathématiques
Méthodologie du référentiel :
${fasciculeMethodology || "Résolution rigoureuse et fidèle question par question, calculs pas à pas de la 6e au Supérieur sans étapes superflues ni hors-sujet."}

Connaissances du référentiel :
${fasciculeKnowledge || "Notions, définitions et règles adaptées au niveau exact de l'exercice."}

SUJET / EXERCICE DE MATHÉMATIQUES À TRAITER :
Énoncé complet : "${subjectTopic}"
Type d'exercice : ${exerciseType || "Résolution fidèle pas à pas"}

CONSIGNES DE TRAITEMENT STRICT (PROMPT MAÎTRE 6e → UNIVERSITÉ) :
1. RESPECT ABSOLU DE L'ÉNONCÉ : Ne traite QUE les questions et exercices réellement posés dans l'énoncé, avec leur numérotation exacte (1, 2, 3, 4...). N'invente AUCUNE question ou exercice supplémentaire.
2. VRAI / FAUX (si présent) : Si l'énoncé ne demande pas de justification, fournis UNIQUEMENT le verdict exact (1. VRAI, 2. VRAI, 3. FAUX, 4. VRAI) sans steps et sans justifications superflues. (Vérification : suite géométrique un = u0 + qn est FAUX car arithmétique). Ne justifie que si l'énoncé demande explicitement de justifier.
3. SÉPARATION VISUELLE DES EXERCICES : Crée un bloc bien distinct pour chaque exercice présent dans l'énoncé. Ne mets AUCUN symbole « ### ».
4. CALCULS DÉTAILLÉS LIGNE PAR LIGNE : Pour chaque question, détaille chaque étape (une ligne par étape, valeurs exactes conservées) jusqu'au résultat final encadré « ➜ Résultat final : ... ».
5. DANS level5FullRedaction : Fournis le corrigé propre, aéré, ordonné et parfaitement lisible, prêt pour la copie de l'élève.
6. Remplis aussi structuredScientificResolution (voir consigne système) avec la même résolution, exercice par exercice et question par question, découpée en étapes atomiques (une opération ou une phrase de justification par élément du tableau steps).`;

    } else if (isBepcTexteArg) {
      systemInstruction = `Tu es l'Inspecteur Pédagogique National de FRANÇAIS au PREMIER CYCLE (BEPC / 3e en Côte d'Ivoire - MENA / DECO).
${ACADEMIC_SERIES_AND_CURRICULUM_ADAPTATION_DIRECTIVE}
${MASTER_ANTI_HOLLOW_DIRECTIVE}
${UNIVERSAL_PEDAGOGICAL_FIDELITY_DIRECTIVE}
${SEMANTIC_DISAMBIGUATION_DIRECTIVE}
${SIMPLE_FRENCH_DIRECTIVE}

MÉTHODOLOGIE OFFICIELLE DU PREMIER SUJET (TEXTE ARGUMENTATIF DE RÉFLEXION) :
Le sujet comporte obligatoirement trois (3) consignes précises que tu dois respecter scrupuleusement :
1. Question 1 (2 points) : Identification claire, nette et concise du thème abordé.
2. Question 2 (4 points) : Reformulation fidèle de la thèse soutenue par l'auteur ou l'intervenant avec ses propres mots (« Selon l'auteur... »).
3. Question 3 (14 points) : Rédaction complète de la production argumentative en étayant ou réfutant la thèse :
   - Introduction : Amorce de société + Présentation du sujet + Problématique + Annonce de la démarche.
   - Développement : 2 ou 3 arguments solides et distincts, chacun étayé par des exemples concrets tirés du milieu scolaire, familial ou de la société ivoirienne.
   - Conclusion : Bilan des arguments + Prise de position civique et citoyenne finale.

Dans level5FullRedaction, présente explicitement les 3 questions numérotées :
1. Identification du thème (2 points)
2. Reformulation de la thèse (4 points)
3. Production rédigée (14 points)`;

      prompt = `SUJET D'EXAMEN DU BEPC (FRANÇAIS - PREMIER SUJET : TEXTE ARGUMENTATIF) :
Énoncé complet du sujet : "${subjectTopic}"
Discipline : Français (Classe de 3e / BEPC)
Type d'exercice : ${exerciseType || "Texte Argumentatif de Réflexion (Étayer ou Réfuter)"}

CONSIGNES DE TRAITEMENT OFFICIELLES DU BEPC IVOIRIEN :
1. Dégage le thème abordé (Question 1 - 2 pts).
2. Reformule la thèse défendue avec fidélité (Question 2 - 4 pts).
3. Rédige la production écrite complète en étayant ou réfutant le point de vue selon la consigne, avec des arguments solides et des exemples réels de la société et de l'école ivoirienne (Question 3 - 14 pts).`;

    } else if (isBepcResume) {
      systemInstruction = `Tu es l'Inspecteur Pédagogique National de FRANÇAIS au PREMIER CYCLE (BEPC / 3e en Côte d'Ivoire - MENA / DECO).
${ACADEMIC_SERIES_AND_CURRICULUM_ADAPTATION_DIRECTIVE}
${MASTER_ANTI_HOLLOW_DIRECTIVE}
${UNIVERSAL_PEDAGOGICAL_FIDELITY_DIRECTIVE}
${SIMPLE_FRENCH_DIRECTIVE}

MÉTHODOLOGIE OFFICIELLE DU DEUXIÈME SUJET (RÉSUMÉ DE TEXTE ARGUMENTATIF) :
Le traitement se divise en deux grandes parties :
I- QUESTIONS (6 points) :
   A - Compréhension (4 points) :
       1. Thème abordé dans le texte (2 pts).
       2. Thèse défendue par l'auteur (2 pts).
   B - Vocabulaire (2 points) :
       Explication en contexte d'une expression du texte (sens propre + sens figuré/contextuel).

II- RÉSUMÉ DU TEXTE (14 points) :
   - Condensation des idées maîtresses au tiers (1/3) du volume initial du texte (avec marge tolérée de ±10%).
   - Respect strict du système d'énonciation sans formule métatextuelle (« l'auteur dit que »).
   - Indication obligatoire du décompte final des mots à la fin.

Dans level5FullRedaction, fournis la copie d'examen intégrale avec I- QUESTIONS et II- RÉSUMÉ DU TEXTE.`;

      prompt = `SUJET D'EXAMEN DU BEPC (FRANÇAIS - DEUXIÈME SUJET : RÉSUMÉ DE TEXTE ARGUMENTATIF) :
Énoncé complet : "${subjectTopic}"
Discipline : Français (Classe de 3e / BEPC)
Type d'exercice : ${exerciseType || "Résumé de Texte Argumentatif & Questions"}

TRAITEMENT OFFICIEL ATTENDU :
1. I- QUESTIONS (6 pts) : Compréhension (Thème 2 pts, Thèse 2 pts) + Vocabulaire en contexte (2 pts).
2. II- RÉSUMÉ (14 pts) : Résumé au 1/3 de volume avec décompte exact des mots à la fin.`;

    } else if (isBepcHG) {
      systemInstruction = `Tu es l'Inspecteur Pédagogique National d'HISTOIRE-GÉOGRAPHIE au PREMIER CYCLE (BEPC / 3e en Côte d'Ivoire - MENA / DECO).
${ACADEMIC_SERIES_AND_CURRICULUM_ADAPTATION_DIRECTIVE}
${MASTER_ANTI_HOLLOW_DIRECTIVE}
${UNIVERSAL_PEDAGOGICAL_FIDELITY_DIRECTIVE}
${CALCULATION_ACCURACY_DIRECTIVE}
${SIMPLE_FRENCH_DIRECTIVE}

MÉTHODOLOGIE OFFICIELLE DE L'ÉPREUVE D'HISTOIRE-GÉOGRAPHIE AU BEPC :
I. PREMIÈRE PARTIE : MAÎTRISE DES CONNAISSANCES (6 points)
- Définition exacte des notions clés du programme de 3e.
- Localisations et repères spatio-temporels précis.

II. DEUXIÈME PARTIE : SITUATION D'ÉVALUATION (14 points)
- Consigne 1 : Identification du phénomène historique ou géographique.
- Consigne 2 : Explication des causes et conséquences en mobilisant le cours.
- Consigne 3 : Propositions de solutions concrètes et durables.

Dans level5FullRedaction, fournis la copie complète rédigée selon ce canevas.`;

      prompt = `SUJET D'HISTOIRE-GÉOGRAPHIE BEPC (3e) :
Énoncé complet : "${subjectTopic}"
Discipline : Histoire-Géographie (Premier Cycle)
Type d'exercice : ${exerciseType || "Situation d'Évaluation & Questions de Cours"}

TRAITEMENT OFFICIEL DU BEPC :
Fournis le corrigé complet de la Première Partie (Connaissances) et de la Deuxième Partie (Situation d'évaluation en 3 consignes).`;

    } else {
      // BACCALAURÉAT (Français, Philo, Histoire, Géo)
      systemInstruction = `Tu es l'Inspecteur Pédagogique Principal et Tuteur d'Excellence du BACCALAURÉAT (Français, Philosophie, Histoire, Géographie).
${ACADEMIC_SERIES_AND_CURRICULUM_ADAPTATION_DIRECTIVE}
${MASTER_ANTI_HOLLOW_DIRECTIVE}
${UNIVERSAL_PEDAGOGICAL_FIDELITY_DIRECTIVE}
${CALCULATION_ACCURACY_DIRECTIVE}
${SEMANTIC_DISAMBIGUATION_DIRECTIVE}
${SIMPLE_FRENCH_DIRECTIVE}
${literaryVariationDirective}

STYLE ET NATUREL DE LA DISSERTATION :
- Rédige en prose continue, claire et vivante, mais avec des MOTS SIMPLES (voir règle de français simple ci-dessus) — la clarté prime toujours sur l'élégance recherchée.
- PAS DE CITATIONS ARTIFICIELLES FORCÉES ENTRE GUILLEMETS partout dans le développement : analyse directement les œuvres, les personnages et les situations (ex: Hyacinthe Kacou dans On se chamaille pour un siège, Molière dans Le Malade imaginaire, Guillaume Oyono M’bia dans Trois Prétendants… un mari, Aimé Césaire dans Une Saison au Congo).
- VARIE LES CONNECTEURS LOGIQUES SIMPLES (voir la liste variée de la règle de français simple ci-dessus — pioche largement dedans, pas de connecteurs rares ou pompeux, mais ne te limite pas à toujours les mêmes 3-4 mots).

1. INTRODUCTION :
- Amorce simple et claire sur le thème.
- Insertion du sujet : « C’est en donnant son point de vue qu’un observateur affirme : « [Citation exacte du sujet] ». »
- Explication / Reformulation : « En d’autres termes, [Explication claire et fidèle de la thèse du sujet, en mots simples]. »
- Problématique : « Cette opinion nous amène à nous interroger : [Problème central sous forme interrogative] ? »
- Annonce du plan : « Dans notre analyse, nous montrerons d’abord que [Axe 1], puis nous verrons que [Axe 2]. »

2. DÉVELOPPEMENT (AXE I & AXE II) :
- Chapeau d'introduction simple pour chaque axe.
- Paragraphes argumentés en phrases courtes, avec exemples concrets d'œuvres littéraires ou de concepts, expliqués simplement.
- Transition claire entre les deux axes.

3. CONCLUSION :
- « En résumé, [Bilan équilibré des deux axes et portée finale, en mots simples]. »`;

      prompt = `FASCICULE DE RÉFÉRENCE :
Titre : ${fasciculeTitle || "Fascicule de Référence"}
Discipline : ${discipline || "Philosophie / Français / Humanités"}
Méthodologie du fascicule :
${fasciculeMethodology || "Méthode canonique du fascicule."}

Connaissances du fascicule :
${fasciculeKnowledge || "Notions du programme."}

NOUVEAU SUJET À TRAITER (INÉDIT) :
Discipline attendue : ${discipline || "Français / Philosophie"}
Type d'exercice : ${exerciseType || "Dissertation"}
Énoncé complet du sujet : "${subjectTopic}"
Structure de plan demandée : ${isTwoAxes ? "Plan en 2 Parties (Thèse & Antithèse - Norme Bac Côte d'Ivoire) avec 3 arguments par partie (6 arguments au total, pas de synthèse artificielle)" : "Plan en 3 Parties (Thèse, Antithèse, Synthèse) avec 3 arguments par partie (9 arguments au total)"}
Objectif : ${mode}

    EXIGENCE DE RÉDACTION :
    1. DANS L'INTRODUCTION :
    - Amorce simple et claire sur le thème (sans connecteur lourd d'entrée).
    - Insertion de l'énoncé du sujet : « C’est en donnant son point de vue qu’un observateur affirme : « ${subjectTopic.replace(/^«|»$/g, '').trim()} ». »
    - Reformulation en mots simples : « En d’autres termes, ... »
    - Problématique : « Cette opinion nous amène à nous interroger : ... ? »
    - Annonce de plan : « Dans notre analyse, nous montrerons d’abord que ..., puis nous verrons que ... »

    2. DANS LE DÉVELOPPEMENT :
    - Utilise des connecteurs logiques simples et courants (« D'abord », « D'une part », « Ensuite », « De même », « Par ailleurs », « De plus », « Enfin »...). Pas de connecteurs rares ou pompeux. Ne répète pas toujours les mêmes formules.
    - Évite les guillemets et citations forcées partout : développe des explications concrètes sur les œuvres, personnages et intrigues, en phrases courtes et claires.
    - Transition claire entre les deux grands axes.

    3. DANS LA CONCLUSION :
    - Bilan équilibré des deux axes et portée finale, en mots simples.

    4. DANS LA RÉDACTION INTÉGRALE PRÊTE À RENDRE (level5FullRedaction) :
    - Rédige la copie d'examen intégrale en prose continue et claire, avec un VOCABULAIRE SIMPLE ET FACILE À RETENIR (voir règle de français simple), EXACTEMENT comme la copie d'un bon élève qui écrit simplement mais juste.
    - SANS AUCUN TITRE DE PARTIE, NI NUMÉRO (« I. Première partie », « A. », « Introduction », « Conclusion »).
    - Uniquement des paragraphes complets séparés par des sauts de ligne.

    5. AVANT TOUTE CHOSE, remplis le champ conceptualDisambiguation : identifie le(s) terme(s) potentiellement ambigu(s) du sujet, les sens envisagés, le sens retenu pour CE sujet précis et la justification de ce choix (voir règle de désambiguïsation sémantique ci-dessus). Le sens retenu doit être celui effectivement utilisé dans toute la suite de la rédaction.`;
    }

    // Quand une image (figure, schéma, tableau, photo de l'énoncé...) est jointe,
    // on la fait circuler JUSQU'À la résolution au lieu de se limiter à une
    // description texte produite en amont : le modèle reçoit l'image et le texte
    // dans le même appel, exactement comme un enseignant qui a la copie sous les
    // yeux en même temps qu'il lit l'énoncé.
    const contents = attachedImagePart
      ? [
          attachedImagePart,
          `${prompt}\n\nIMAGE JOINTE : l'image ci-dessus fait partie intégrante du sujet. Elle peut contenir une figure géométrique, un repère, un graphique, un tableau, un schéma (physique, chimie, SVT), une carte ou tout autre document. Utilise-la DIRECTEMENT comme source de données visuelles (mesures, angles, légendes, courbes, valeurs...), au même titre que le texte ci-dessus — y compris si certaines questions posées par l'élève ne portent pas explicitement sur un point du texte mais sur ce qui est représenté dans l'image. Si un détail de l'image est flou ou illisible, indique-le précisément au lieu de l'inventer.`,
        ]
      : prompt;

    let rawJsonText = "";
    try {
      rawJsonText = await generateWithFallback({
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              disciplineIdentified: { type: Type.STRING, description: "Matière identifiée" },
              exerciseTypeIdentified: { type: Type.STRING, description: "Type d'exercice précis (ex: Dissertation canonique)" },
              conceptualDisambiguation: {
                type: Type.OBJECT,
                description: "Analyse du/des terme(s) ambigu(s) du sujet AVANT rédaction, pour garantir que le bon sens contextuel a été retenu.",
                properties: {
                  hasAmbiguousTerm: { type: Type.BOOLEAN, description: "true si un terme structurellement ambigu a été identifié dans le sujet" },
                  term: { type: Type.STRING, description: "Le terme ambigu identifié (chaîne vide si aucun)" },
                  possibleMeanings: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Les 2-3 sens courants possibles de ce terme" },
                  retainedMeaning: { type: Type.STRING, description: "Le sens retenu pour ce sujet précis" },
                  justification: { type: Type.STRING, description: "Pourquoi ce sens crée la problématique la plus féconde pour CE sujet" },
                },
                required: ["hasAmbiguousTerm", "term", "possibleMeanings", "retainedMeaning", "justification"],
              },
              fasciculeMethodologyActivated: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  stepsApplied: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["name", "description", "stepsApplied"],
              },
              sourceDecomposition: {
                type: Type.OBJECT,
                properties: {
                  fasciculeMethodologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  fasciculeKnowledgeUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                  externalKnowledgeMobilized: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["fasciculeMethodologies", "fasciculeKnowledgeUsed", "externalKnowledgeMobilized"],
              },
              pedagogicalTransferExplanation: { type: Type.STRING },
              level1Hint: { type: Type.STRING, description: "Indice bref pour mettre l'élève sur la voie sans donner la réponse" },
              level2Methodology: { type: Type.STRING, description: "Explication de la méthode et des règles à suivre" },
              level3GuidanceSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Questions et étapes de guidage pas-à-pas" },
              level4DetailedOutline: { type: Type.STRING, description: "Plan détaillé complet avec arguments, auteurs et œuvres" },
              level5FullRedaction: { type: Type.STRING, description: "Rédaction intégrale continue et in extenso du devoir complet" },
              structuredRedaction: {
                type: Type.OBJECT,
                properties: {
                  planSummary: { type: Type.STRING },
                  introduction: {
                    type: Type.OBJECT,
                    properties: {
                      amorce: { type: Type.STRING },
                      definitionTension: { type: Type.STRING },
                      problematique: { type: Type.STRING },
                      annoncePlan: { type: Type.STRING },
                      fullText: { type: Type.STRING },
                    },
                    required: ["amorce", "definitionTension", "problematique", "annoncePlan", "fullText"],
                  },
                  development: {
                    type: Type.OBJECT,
                    properties: {
                      part1: {
                        type: Type.OBJECT,
                        properties: {
                          partNumber: { type: Type.INTEGER },
                          title: { type: Type.STRING },
                          thesisOverview: { type: Type.STRING },
                          subParts: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                subPartLetter: { type: Type.STRING },
                                title: { type: Type.STRING },
                                argument: { type: Type.STRING, description: "L'idée directrice / argument principal" },
                                explication: { type: Type.STRING, description: "L'explication logique et théorique de l'argument" },
                                illustration: {
                                  type: Type.OBJECT,
                                  properties: {
                                    auteur: { type: Type.STRING, description: "Nom complet de l'auteur / philosophe / écrivain" },
                                    oeuvre: { type: Type.STRING, description: "Titre exact de l'œuvre d'où est tirée la citation ou doctrine" },
                                    citation: { type: Type.STRING, description: "Citation textuelle entre guillemets « ... »" },
                                    analyseIllustration: { type: Type.STRING, description: "Analyse critique montrant le lien entre la citation et l'argument" },
                                  },
                                  required: ["auteur", "oeuvre", "citation", "analyseIllustration"],
                                },
                                fullText: { type: Type.STRING, description: "Paragraphe intégral rédigé en continu avec connecteurs logiques" },
                              },
                              required: ["subPartLetter", "title", "argument", "explication", "illustration", "fullText"],
                            },
                          },
                          fullText: { type: Type.STRING },
                        },
                        required: ["partNumber", "title", "subParts", "fullText"],
                      },
                      transition1: { type: Type.STRING },
                      part2: {
                        type: Type.OBJECT,
                        properties: {
                          partNumber: { type: Type.INTEGER },
                          title: { type: Type.STRING },
                          thesisOverview: { type: Type.STRING },
                          subParts: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                subPartLetter: { type: Type.STRING },
                                title: { type: Type.STRING },
                                argument: { type: Type.STRING, description: "L'idée directrice / argument principal" },
                                explication: { type: Type.STRING, description: "L'explication logique et théorique de l'argument" },
                                illustration: {
                                  type: Type.OBJECT,
                                  properties: {
                                    auteur: { type: Type.STRING, description: "Nom complet de l'auteur / philosophe / écrivain" },
                                    oeuvre: { type: Type.STRING, description: "Titre exact de l'œuvre d'où est tirée la citation ou doctrine" },
                                    citation: { type: Type.STRING, description: "Citation textuelle entre guillemets « ... »" },
                                    analyseIllustration: { type: Type.STRING, description: "Analyse critique montrant le lien entre la citation et l'argument" },
                                  },
                                  required: ["auteur", "oeuvre", "citation", "analyseIllustration"],
                                },
                                fullText: { type: Type.STRING, description: "Paragraphe intégral rédigé en continu avec connecteurs logiques" },
                              },
                              required: ["subPartLetter", "title", "argument", "explication", "illustration", "fullText"],
                            },
                          },
                          fullText: { type: Type.STRING },
                        },
                        required: ["partNumber", "title", "subParts", "fullText"],
                      },
                      transition2: { type: Type.STRING },
                      part3: {
                        type: Type.OBJECT,
                        properties: {
                          partNumber: { type: Type.INTEGER },
                          title: { type: Type.STRING },
                          thesisOverview: { type: Type.STRING },
                          subParts: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                subPartLetter: { type: Type.STRING },
                                title: { type: Type.STRING },
                                argument: { type: Type.STRING },
                                explication: { type: Type.STRING },
                                illustration: {
                                  type: Type.OBJECT,
                                  properties: {
                                    auteur: { type: Type.STRING },
                                    oeuvre: { type: Type.STRING },
                                    citation: { type: Type.STRING },
                                    analyseIllustration: { type: Type.STRING },
                                  },
                                  required: ["auteur", "oeuvre", "citation", "analyseIllustration"],
                                },
                                fullText: { type: Type.STRING },
                              },
                              required: ["subPartLetter", "title", "argument", "explication", "illustration", "fullText"],
                            },
                          },
                          fullText: { type: Type.STRING },
                        },
                      },
                    },
                    required: isTwoAxes ? ["part1", "transition1", "part2"] : ["part1", "transition1", "part2", "transition2", "part3"],
                  },
                  conclusion: {
                    type: Type.OBJECT,
                    properties: {
                      bilanSynthese: { type: Type.STRING },
                      reponseDefinitive: { type: Type.STRING },
                      elargissement: { type: Type.STRING },
                      fullText: { type: Type.STRING },
                    },
                    required: ["bilanSynthese", "reponseDefinitive", "elargissement", "fullText"],
                  },
                },
                required: ["planSummary", "introduction", "development", "conclusion"],
              },
              structuredScientificResolution: {
                type: Type.ARRAY,
                description: "OBLIGATOIRE et rempli UNIQUEMENT pour Mathématiques / Physique-Chimie / SVT : un objet par exercice de l'énoncé, résolution découpée en étapes atomiques. Tableau vide [] pour toute autre discipline.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Titre exact de l'exercice, ex: 'EXERCICE 4'" },
                    points: { type: Type.STRING, description: "Barème entre parenthèses tel qu'indiqué dans l'énoncé (chaîne vide si absent)" },
                    introContext: { type: Type.STRING, description: "Rappel bref du contexte avant la première question (chaîne vide si inutile)" },
                    questions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          numberLabel: { type: Type.STRING, description: "Numérotation exacte de la question telle que dans l'énoncé, ex: '1. a)'" },
                          titleOrPrompt: { type: Type.STRING, description: "Rappel très bref de ce qui est demandé (chaîne vide si inutile)" },
                          steps: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "UNE étape de calcul OU UNE phrase de raisonnement par élément, jamais plusieurs concaténées.",
                          },
                          finalAnswer: { type: Type.STRING, description: "Résultat final de CETTE question (chaîne vide si non applicable)" },
                        },
                        required: ["numberLabel", "titleOrPrompt", "steps", "finalAnswer"],
                      },
                    },
                  },
                  required: ["title", "points", "introContext", "questions"],
                },
              },
              stepByStepBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    stepTitle: { type: Type.STRING },
                    methodologyRuleApplied: { type: Type.STRING },
                    content: { type: Type.STRING },
                    sourceTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    pedagogicalTip: { type: Type.STRING },
                  },
                  required: ["stepNumber", "stepTitle", "methodologyRuleApplied", "content", "sourceTags", "pedagogicalTip"],
                },
              },
              fullSynthesizedResponse: { type: Type.STRING },
              evaluationCriteria: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    criterion: { type: Type.STRING },
                    fasciculeOrigin: { type: Type.BOOLEAN },
                    description: { type: Type.STRING },
                    tipsForAutonomy: { type: Type.STRING },
                  },
                  required: ["criterion", "fasciculeOrigin", "description", "tipsForAutonomy"],
                },
              },
            },
            required: [
              "disciplineIdentified",
              "exerciseTypeIdentified",
              "conceptualDisambiguation",
              "fasciculeMethodologyActivated",
              "sourceDecomposition",
              "pedagogicalTransferExplanation",
              "level1Hint",
              "level2Methodology",
              "level3GuidanceSteps",
              "level4DetailedOutline",
              "level5FullRedaction",
              "structuredRedaction",
              "structuredScientificResolution",
              "stepByStepBreakdown",
              "fullSynthesizedResponse",
              "evaluationCriteria",
            ],
          },
        },
      }, {
        taskType: isMath
          ? "math"
          : isPhysiqueChimie
          ? "physics_chemistry"
          : isSVT
          ? "svt"
          : "french_philo",
        // Sûr à mettre en cache : la réponse ne dépend que du sujet/énoncé et
        // du fascicule fournis, jamais d'un historique de conversation privé.
        // MAIS dès qu'une image est jointe, on désactive le cache : la clé de
        // cache inclurait alors les octets de l'image, qui resteraient en
        // mémoire du serveur jusqu'à expiration du TTL. Une image ne doit
        // jamais être conservée au-delà de la requête qui la traite.
        cacheable: !attachedImagePart,
        cacheTtlMs: 60 * 60_000,
      });
    } catch (genError: any) {
      console.warn("AI generation fallback triggered:", genError?.message);

      const fallbackResult = generateIvorianFallback({
        subjectTopic,
        discipline,
        exerciseType,
        isTwoAxes,
        fasciculeTitle,
        fasciculeKnowledge,
      });

      return res.json({ success: true, data: { ...fallbackResult, isFallback: true }, isFallback: true });
    }

    let parsedData: any = null;
    try {
      const cleaned = cleanJsonString(rawJsonText);
      parsedData = JSON.parse(cleaned || "{}");
    } catch (parseErr) {
      console.warn("Failed to parse JSON directly, triggering fallback:", parseErr);
      const fallbackResult = generateIvorianFallback({
        subjectTopic,
        discipline,
        exerciseType,
        isTwoAxes,
        fasciculeTitle,
        fasciculeKnowledge,
      });
      return res.json({ success: true, data: { ...fallbackResult, isFallback: true }, isFallback: true });
    }

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Error analyzing exercise:", error);
    return res.status(500).json({ error: error.message || "Erreur lors de l'analyse méthodologique." });
  }
});

/**
 * Endpoint for Grading & Correcting Student's Homework Draft
 */
app.post("/api/correct-homework", globalAiRateLimiter, aiRouteRateLimiter, async (req, res) => {
  try {
    const {
      subjectTopic,
      discipline,
      studentSubmission,
      exerciseType = "Dissertation",
      fasciculeRules = "",
      serie,
      serieLabel,
    } = req.body;

    if (!studentSubmission || !studentSubmission.trim()) {
      return res.status(400).json({ error: "Le devoir ou brouillon de l'élève est requis pour la correction." });
    }

    const disciplineText = (discipline || "").toLowerCase();
    const isScientific = /math[ée]matiques?|physique|chimie|svt|biologie|g[ée]ologie/i.test(disciplineText);
    const isLanguage = /anglais|allemand|espagnol|english|deutsch|espa[ñn]ol/i.test(disciplineText);

    // Les 7 clés du schéma JSON restent identiques pour toutes les matières
    // (contrat stable avec le frontend) ; seul leur SENS change selon la discipline,
    // via des consignes explicites données à l'IA pour chaque critère.
    let criteriaGuidance = `1. comprehension : Compréhension du sujet et de la problématique posée (/20)
2. methodology : Respect de la méthodologie attendue (dissertation, commentaire, étude critique...) (/20)
3. problematique : Qualité de la problématique et du questionnement (/20)
4. organisationPlan : Organisation et cohérence du plan (/20)
5. argumentation : Force et rigueur de l'argumentation et de la démonstration (/20)
6. exemplesReferences : Pertinence des exemples et références d'auteurs/œuvres mobilisés (/20)
7. redactionStyle : Qualité de la rédaction, du style et de l'orthographe (/20)`;

    let roleDescription = "Tu es un professeur correcteur bienveillant et exigeant du secondaire (Français, Philo, Histoire, Géo).";

    if (isScientific) {
      roleDescription = "Tu es un professeur correcteur bienveillant et exigeant de matière scientifique du secondaire (Mathématiques, Physique-Chimie, SVT).";
      criteriaGuidance = `1. comprehension : Compréhension correcte de l'énoncé et des données fournies (/20)
2. methodology : Respect de la méthode de résolution attendue (formules, démarche scientifique, unités) (/20)
3. problematique : Identification correcte de ce qui est demandé dans chaque question (/20)
4. organisationPlan : Organisation logique de la résolution, question par question, dans l'ordre de l'énoncé (/20)
5. argumentation : Rigueur des calculs, justesse des formules et cohérence du raisonnement (/20)
6. exemplesReferences : Justesse des applications numériques, des unités et des résultats intermédiaires (/20)
7. redactionStyle : Clarté de la présentation (calculs lisibles, résultats encadrés, notation correcte) (/20)`;
    } else if (isLanguage) {
      roleDescription = "Tu es un professeur correcteur bienveillant et exigeant de Langue Vivante du secondaire (Anglais, Allemand, Espagnol).";
      criteriaGuidance = `1. comprehension : Compréhension du texte/sujet et respect de la consigne exacte (/20)
2. methodology : Respect du format attendu par exercice (compréhension, grammaire, essai...) (/20)
3. problematique : Pertinence et précision des réponses par rapport à ce qui est demandé (/20)
4. organisationPlan : Organisation et structure de la production écrite (/20)
5. argumentation : Richesse et pertinence des idées ou arguments développés (/20)
6. exemplesReferences : Correction grammaticale, richesse et justesse du vocabulaire (/20)
7. redactionStyle : Fluidité, style et qualité rédactionnelle dans la langue cible (/20)`;
    }

    const CORRECTION_ROBUSTNESS_DIRECTIVE = `
RÈGLE ABSOLUE N°1 — PRIORITÉ : EXACTITUDE > VÉRIFICATION > RAISONNEMENT > PRÉSENTATION > RAPIDITÉ.
Tu ne dois JAMAIS inventer une donnée, une formule, un résultat ou une correction officielle pour combler un manque.

1. LECTURE COMPLÈTE OBLIGATOIRE AVANT NOTATION :
   Avant d'attribuer le moindre point, relis l'intégralité du sujet ET de la copie de l'élève (données, questions, expressions algébriques, unités, questions précédentes dont dépend une question suivante). Ne commence pas à noter juste parce que tu reconnais le type d'exercice.

2. RECONSTRUCTION PRUDENTE DES FORMULES MAL FORMATÉES :
   La copie ou le sujet peuvent provenir d'un copier-coller, d'un OCR ou d'un PDF mal converti (ex : "x2" pour x², "lim x→+∞" déformé en "xÞÑ+8", fractions cassées type "a+b/c"). Interprète intelligemment ces écritures selon le contexte, MAIS si plusieurs lectures sont possibles et changent le résultat, NE DEVINE PAS : signale l'ambiguïté dans le commentaire du critère concerné au lieu de trancher arbitrairement.

3. VÉRIFICATION INDÉPENDANTE, JAMAIS DE CONFIANCE AVEUGLE :
   Ne te contente jamais de comparer superficiellement la copie de l'élève à ce que tu "penses" être juste. Refais toi-même le calcul, la démonstration ou le raisonnement (dérivée, équation, formule scientifique, argument) de façon indépendante, PUIS compare avec ce que l'élève a écrit. Si un résultat de l'élève est correct mais que ta propre vérification en doute, revérifie avant de trancher.

4. STATUT PAR CRITÈRE :
   Le commentaire ("comment") de chaque critère doit implicitement correspondre à l'un de ces statuts et le justifier concrètement (pas de généralité) :
   - JUSTE : correct et suffisamment justifié.
   - INCOMPLET : idée/démarche correcte mais calcul ou justification insuffisante — précise ce qui manque.
   - FAUX : résultat ou raisonnement incorrect — indique précisément l'erreur (signe, formule, étape) et ce qu'aurait dû être la démarche correcte.
   - IMPOSSIBLE À VÉRIFIER : passage illisible, manquant ou ambigu dans la copie — dis-le clairement plutôt que de deviner une note.

5. INTERDICTION DES COMMENTAIRES GÉNÉRIQUES :
   Bannis les phrases creuses qui ne prouvent aucune lecture réelle de la copie, telles que "application rigoureuse des données", "résolution validée", "argumentation bien menée" sans exemple concret tiré du texte de l'élève. Chaque commentaire doit citer ou paraphraser un élément réel de LA COPIE SOUMISE (un mot, un calcul, une phrase) pour justifier le score.
   N'attribue jamais un score proche de 20 sans avoir listé précisément ce qui justifie ce niveau.

6. COHÉRENCE GLOBALE :
   Avant de renvoyer la note finale, vérifie que globalScore est cohérent avec la moyenne des 7 critères, que les points forts/faibles listés ne se contredisent pas entre eux, et que chaque erreur critique mentionnée est bien rattachée à un passage réel de la copie.

7. SI LA COPIE EST TROP COURTE, ILLISIBLE OU HORS-SUJET :
   Dis-le explicitement dans "appreciation" plutôt que de simuler une évaluation détaillée sur un contenu insuffisant.

8. RESPECT STRICT DU NIVEAU ET DE LA SÉRIE DE L'ÉLÈVE — RÈGLE ABSOLUE :
   Série / Profil scolaire de l'élève pour CETTE correction : "${serieLabel || serie || "Non précisé — reste au niveau suggéré par le contenu réel de la copie"}".
   N'exige et n'attends JAMAIS une méthode, une notion ou un formalisme qui appartient à un niveau ou une série DIFFÉRENTE de celle de l'élève :
   - Un(e) élève de 6e/5e/4e/3e (collège, BEPC) ne doit JAMAIS être pénalisé(e) pour ne pas avoir utilisé une méthode de lycée ou de Terminale (dérivée, intégrale, complexe, récurrence...). Juge selon le programme du collège uniquement.
   - Un(e) élève de Terminale A2 ne doit JAMAIS être pénalisé(e) pour ne pas avoir utilisé une méthode réservée à la série C ou D (ex: récurrence poussée, calcul intégral approfondi, équations différentielles) : juge selon le programme A2 (Mayer / Moindres Carrés A2, fonctions usuelles, suites simples, probabilités conditionnelles simples).
   - Un(e) élève de Terminale A1 ne doit être jugé(e) que sur les mathématiques appliquées aux humanités prévues à son programme, jamais sur un formalisme de série scientifique.
   - Un(e) élève de Terminale C ne doit pas être sous-noté(e) pour avoir utilisé une méthode plus rigoureuse ou plus avancée que celle d'une autre série : au contraire, valorise la rigueur formelle attendue en série C.
   - Un(e) élève de Terminale D doit être jugé(e) sur le programme D (fonctions composées, primitives, complexes, probabilités, équations différentielles simples), pas sur la rigueur intégrale/arithmétique poussée propre à la série C.
   - Si la série indiquée est "Non précisé", déduis le niveau probable UNIQUEMENT à partir des notions réellement présentes dans la copie de l'élève (ex: si la copie ne manipule que des équations du 1er degré sans jamais mentionner dérivée/intégrale, traite-la comme un niveau collège/2nde, pas comme une Terminale).
   Si tu identifies que l'élève a utilisé une méthode hors-programme par rapport à sa série indiquée (plus avancée ou d'une autre filière), signale-le avec bienveillance dans le commentaire du critère "methodology" (ex: "Cette méthode appartient au programme de série C, non au programme A2 : voici la méthode attendue à ton niveau...") plutôt que de simplement sanctionner sans explication.`;

    const systemInstruction = `${roleDescription}
Évalue le devoir de l'élève sur 20 points selon les 7 critères suivants, adaptés à la discipline réelle du devoir :
${criteriaGuidance}
${CORRECTION_ROBUSTNESS_DIRECTIVE}
${isScientific ? MATH_WRITING_NOTATION_DIRECTIVE : ""}

Note Globale : Moyenne pondérée calculée sur 20.
Base ton évaluation UNIQUEMENT sur le contenu réel de la copie soumise, jamais sur des suppositions génériques.
Tu dois formuler un diagnostic constructif :
- Ce qui est réussi (points forts)
- Ce qui est à améliorer
- Erreurs critiques ou risques de hors-sujet (ou erreurs de calcul/raisonnement pour les matières scientifiques)
- Notions à réviser
- Conseils concrets pour passer au niveau supérieur (ex: "Pour passer de 14 à 16/20...").`;

    const prompt = `SUJET DU DEVOIR : "${subjectTopic || "Sujet non précisé"}"
MATIÈRE : ${discipline || "Philosophie / Humanités"}
TYPE D'EXERCICE : ${exerciseType}
RÈGLES MÉTHODOLOGIQUES DE RÉFÉRENCE : ${fasciculeRules || "Méthodologie canonique"}

COPIE / BROUILLON SOUMIS PAR L'ÉLÈVE :
"""
${studentSubmission}
"""

Analyse cette copie et retourne l'évaluation au format JSON structuré, avec des critères interprétés selon la discipline réelle indiquée ci-dessus.`;

    const rawJson = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            globalScore: { type: Type.NUMBER, description: "Note globale sur 20 (ex: 14.5)" },
            appreciation: { type: Type.STRING, description: "Appréciation générale bienveillante et stimulante" },
            targetAdvice: { type: Type.STRING, description: "Conseil clé pour gagner 2 à 3 points supplémentaires" },
            criteriaScores: {
              type: Type.OBJECT,
              properties: {
                comprehension: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.NUMBER }, max: { type: Type.NUMBER }, comment: { type: Type.STRING } },
                  required: ["score", "max", "comment"],
                },
                methodology: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.NUMBER }, max: { type: Type.NUMBER }, comment: { type: Type.STRING } },
                  required: ["score", "max", "comment"],
                },
                problematique: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.NUMBER }, max: { type: Type.NUMBER }, comment: { type: Type.STRING } },
                  required: ["score", "max", "comment"],
                },
                organisationPlan: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.NUMBER }, max: { type: Type.NUMBER }, comment: { type: Type.STRING } },
                  required: ["score", "max", "comment"],
                },
                argumentation: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.NUMBER }, max: { type: Type.NUMBER }, comment: { type: Type.STRING } },
                  required: ["score", "max", "comment"],
                },
                exemplesReferences: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.NUMBER }, max: { type: Type.NUMBER }, comment: { type: Type.STRING } },
                  required: ["score", "max", "comment"],
                },
                redactionStyle: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.NUMBER }, max: { type: Type.NUMBER }, comment: { type: Type.STRING } },
                  required: ["score", "max", "comment"],
                },
              },
              required: ["comprehension", "methodology", "problematique", "organisationPlan", "argumentation", "exemplesReferences", "redactionStyle"],
            },
            whatIsSuccessful: { type: Type.ARRAY, items: { type: Type.STRING } },
            toImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
            conceptsToReview: { type: Type.ARRAY, items: { type: Type.STRING } },
            remedialTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "globalScore",
            "appreciation",
            "targetAdvice",
            "criteriaScores",
            "whatIsSuccessful",
            "toImprove",
            "criticalErrors",
            "conceptsToReview",
            "remedialTips",
          ],
        },
      },
    }, { taskType: "correction" }); // jamais en cache : dépend de la copie propre à chaque élève

    const parsed = JSON.parse(rawJson || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.warn("Correction fallback triggered:", error?.message || error);
    const fallbackCorrection = generateHomeworkCorrectionFallback({
      subjectTopic: req.body?.subjectTopic || "Sujet de devoir",
      discipline: req.body?.discipline || "Philosophie",
      studentSubmission: req.body?.studentSubmission || "",
      exerciseType: req.body?.exerciseType || "Dissertation",
      fasciculeRules: req.body?.fasciculeRules || "",
    });
    return res.json({ success: true, data: { ...fallbackCorrection, isFallback: true }, isFallback: true });
  }
});

/**
 * Endpoint for general course search & guaranteed accurate explanations ("Recherche de Cours & Savoir Sûr")
 */
app.post("/api/search-course", globalAiRateLimiter, aiRouteRateLimiter, async (req, res) => {
  try {
    const { query, discipline, level } = req.body;
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Veuillez fournir une question ou un terme de recherche de cours." });
    }

    const systemInstruction = `Tu es le Professeur Émérite et Moteur Universitaire de Savoir Académique Officiel (Maths, Physique, SVT, Philosophie, Français, Histoire, Géo, Langues).
L'utilisateur recherche un cours, une notion, des citations philosophiques ou littéraires, un théorème, une formule ou une méthode pédagogique.
EXIGENCE ABSOLUE DE VÉRACITÉ ET D'EXACTITUDE :
- Tu ne dois JAMAIS inventer de faux théorèmes, de faux calculs ou de fausses citations ("AUCUNE FAUSSE RÉPONSE").
- Pour les citations (ex: philosophie, littérature) : donne le nom exact de l'auteur, le titre authentique de l'œuvre, la date ou le contexte et la citation exacte entre guillemets.
- Pour les formules mathématiques/scientifiques : donne la formule exacte, les unités et conditions de validité.
- Fournis une explication lumineuse, structurée, pas-à-pas avec des démonstrations et des exemples concrets intégralement résolus sans sauter d'étapes.
- Identifie les pièges fréquents dans les examens et concours pour protéger l'élève des erreurs d'inattention ou de raisonnement.
${MATH_WRITING_NOTATION_DIRECTIVE}`;

    const prompt = `Recherche demandée par l'élève : "${query}"
Discipline : ${discipline || "À détecter automatiquement à partir de la question"}
Niveau / Classe : ${level || "Secondaire (Collège / Lycée / Terminale)"}

Consigne : Traite la question posée avec le plus haut niveau de précision académique. Si la demande porte sur des citations ou des notions de cours (ex: "citations sur la religion", "théorème de Thalès", etc.), présente les éléments indispensables dans "coreConceptsAndFormulas", la méthode dans "stepByStepMethod" et une application concrète rédigée dans "solvedExample". Génère le JSON conforme au schéma.`;

    const rawJson = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING },
            discipline: { type: Type.STRING },
            disciplineLabel: { type: Type.STRING },
            cycle: { type: Type.STRING },
            level: { type: Type.STRING },
            levelLabel: { type: Type.STRING },
            chapterTitle: { type: Type.STRING },
            definitionAndScope: { type: Type.STRING },
            coreConceptsAndFormulas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  formulaOrRule: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  contextOrApplication: { type: Type.STRING },
                },
                required: ["name", "formulaOrRule", "explanation", "contextOrApplication"],
              },
            },
            stepByStepMethod: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  whatToDo: { type: Type.STRING },
                  reflexOrTip: { type: Type.STRING },
                },
                required: ["stepNumber", "title", "whatToDo", "reflexOrTip"],
              },
            },
            solvedExample: {
              type: Type.OBJECT,
              properties: {
                problemStatement: { type: Type.STRING },
                solutionStepByStep: { type: Type.STRING },
                finalAnswer: { type: Type.STRING },
              },
              required: ["problemStatement", "solutionStepByStep", "finalAnswer"],
            },
            classicExamTraps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            selfCheckChecklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            quickRevisionMemo: { type: Type.STRING },
            certificationNote: { type: Type.STRING },
          },
          required: [
            "query",
            "discipline",
            "disciplineLabel",
            "cycle",
            "level",
            "levelLabel",
            "chapterTitle",
            "definitionAndScope",
            "coreConceptsAndFormulas",
            "stepByStepMethod",
            "solvedExample",
            "classicExamTraps",
            "selfCheckChecklist",
            "quickRevisionMemo",
            "certificationNote",
          ],
        },
      },
    }, { taskType: "general", cacheable: true, cacheTtlMs: 60 * 60_000 });

    const parsed = JSON.parse(rawJson || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Course Search fallback triggered:", error);
    // Intelligent Fallback with rich academic data matching the exact query requested
    const query = req.body?.query || "Cours";
    const academicFallback = getAcademicCourseResult(query);

    return res.json({
      success: true,
      data: academicFallback,
    });
  }
});

/**
 * Endpoint for interactive conversational tutor
 */
const handleTutorChat = async (req: express.Request, res: express.Response) => {
  try {
    const { messages, fasciculeContext, subjectContext } = req.body;

    const systemInstruction = `Tu es le coach méthodologique et Professeur Agrégé Déclic d'excellence pour les élèves et candidats (Collège, Lycée, Baccalauréat, Supérieur).
Règles d'or d'accompagnement :
- Tu t'adaptes rigoureusement à la discipline du sujet (Mathématiques, Physique-Chimie, SVT, Philosophie, Français, Histoire-Géographie, SES, HGGSP, Langues, etc.).
- Si un fascicule méthodologique est fourni, tu t'appuies sur ses exigences et critères d'évaluation officiels.
- Tu accompagnes l'élève pour le rendre autonome (méthode socratique, étapes claires, rappels de théorèmes/concepts).
- Réponds avec clarté, rigueur, pédagogie et bienveillance.

RÈGLES DE VÉRIFICATION STRICTE POUR LES MATHÉMATIQUES :
1. Lis d'abord attentivement l'énoncé complet.
2. Ne devine JAMAIS une formule mal affichée, mal transcrite ou ambiguë.
3. Vérifie que les différentes questions sont cohérentes entre elles (ex : cohérence fonction/dérivée).
4. Si une formule semble incorrecte ou déformée, arrête-toi et signale précisément le problème au lieu d'inventer une réponse.
5. Pour chaque question, donne : la méthode, les calculs détaillés, la justification mathématique, la réponse finale clairement indiquée.
6. Ne dis jamais « corrigé officiel », « réponse validée », « 20/20 » ou « résolution validée » sans avoir réellement vérifié les calculs.
7. À la fin, fais une vérification globale de toutes les réponses avec l'énoncé.
8. Si l'énoncé contient des caractères déformés (➔, Þ, +8, f1(x), fractions cassées, symboles manquants), signale-le et ne reconstruis que ce qui peut être déduit avec certitude.
9. Si plusieurs interprétations sont possibles, présente-les clairement et propose une photo de l'énoncé original plutôt que de choisir au hasard.
10. Quand l'élève demande « est-ce que c'est juste ? », compare réellement sa réponse avec l'énoncé et indique pour chaque question : JUSTE / FAUX / INCOMPLET avec l'explication précise.
RÈGLE ABSOLUE : L'exactitude passe avant la rapidité. Ne fabrique jamais une solution pour remplir les espaces manquants.

RÈGLES STRICTES DE MISE EN PAGE ET DE LISIBILITÉ :
- INTERDICTION des symboles de titres Markdown comme "#", "##", "###", "####". Ne mets JAMAIS de "#" dans tes messages.
- Pour structurer ta réponse : utilise des paragraphes bien aérés, du texte en **Gras** pour les mots ou concepts clés, des listes à puces avec des tirets "-" ou des numéros "1.", "2.", "3.".
- Sois direct, pédagogique, synthétique et facile à lire sur écran mobile et desktop.
${MATH_WRITING_NOTATION_DIRECTIVE}

Contexte du Référentiel/Fascicule : ${JSON.stringify(fasciculeContext || {})}
Sujet ou Travail en cours : ${subjectContext || "Général"}`;

    // --------------------------------------------------------------------
    // Gestion de la longueur de contexte (comportement type "ChatGPT") :
    // -----------------------------------------------------------------
    // Plutôt que d'envoyer TOUT l'historique à chaque message (risque de
    // dépasser la fenêtre de contexte du modèle sur une longue session, ou
    // de faire gonfler inutilement le coût/latence), on ne garde que les
    // derniers échanges les plus récents une fois un seuil dépassé. C'est
    // exactement ce qui se passe "en coulisses" sur ChatGPT quand une
    // conversation devient très longue : le début de la conversation sort
    // de la fenêtre de contexte, mais la conversation continue sans que
    // l'utilisateur ait besoin d'ouvrir un nouveau chat.
    //
    // Seuil approximatif : ~4 caractères ≈ 1 token. On vise à rester large-
    // ment sous la fenêtre de contexte des modèles utilisés (largement
    // >100k tokens pour Gemini/GPT actuels), donc une limite de caractères
    // généreuse suffit ici sans avoir besoin d'un vrai tokenizer.
    const MAX_HISTORY_CHARS = 24000; // ~6000 tokens de marge, ajustable
    const allMessages: any[] = Array.isArray(messages) ? messages : [];

    function buildHistoryText(msgs: any[]): string {
      return msgs
        .map((m: any) => `${m.role === "user" ? "Élève" : "Tuteur"} : ${m.content}`)
        .join("\n\n");
    }

    let trimmedMessages = allMessages;
    let contextWasTrimmed = false;

    let candidateText = buildHistoryText(trimmedMessages);
    // On retire les messages les plus anciens un par un (en gardant toujours
    // le tout dernier message de l'élève) jusqu'à repasser sous le seuil.
    while (candidateText.length > MAX_HISTORY_CHARS && trimmedMessages.length > 1) {
      trimmedMessages = trimmedMessages.slice(1);
      contextWasTrimmed = true;
      candidateText = buildHistoryText(trimmedMessages);
    }

    const formattedHistory = contextWasTrimmed
      ? `[Note interne : les tout premiers échanges de cette conversation ont été omis pour rester dans la limite de contexte. Poursuis naturellement la discussion à partir de ce qui suit, sans mentionner cette coupure à l'élève sauf s'il demande explicitement pourquoi tu ne te souviens plus d'un détail ancien.]\n\n${candidateText}`
      : candidateText;

    const reply = await generateWithFallbackDetailed({
      contents: formattedHistory || "Bonjour, comment puis-je vous guider ?",
      config: { systemInstruction },
    }, { taskType: "chat" }); // jamais en cache : dépend de l'historique de conversation de l'élève

    // Message discret optionnel (point 10 du cahier des charges) : DÉSACTIVÉ
    // par défaut, car une bascule invisible est en général la meilleure
    // expérience pour l'élève. Activez-le en mettant
    // SHOW_FALLBACK_NOTICE=true dans les variables d'environnement si vous
    // préférez que l'élève voie un indice discret quand un autre moteur IA
    // a pris le relais (jamais de détail technique, jamais de nom de clé).
    const showFallbackNotice = process.env.SHOW_FALLBACK_NOTICE === "true";
    const replyText =
      showFallbackNotice && reply.usedFallback
        ? `${reply.text}\n\n_Réponse générée avec une autre capacité disponible._`
        : reply.text;

    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Chat error:", error);
    return res.json({
      reply: "Je suis à votre disposition pour vous guider pas-à-pas selon la méthode officielle. Que souhaitez-vous approfondir sur ce sujet ?",
    });
  }
};

app.post("/api/tutor-chat", globalAiRateLimiter, aiRouteRateLimiter, handleTutorChat);
app.post("/api/chat-tutor", globalAiRateLimiter, aiRouteRateLimiter, handleTutorChat);

/**
 * Endpoint for Instant Academic Translation & Bilingual Vocabulary
 */
app.post("/api/translate-text", globalAiRateLimiter, aiRouteRateLimiter, async (req, res) => {
  try {
    const { text, sourceLang = "auto", targetLang = "fr" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Aucun texte fourni pour la traduction." });
    }

    const systemInstruction = `Tu es un Traducteur Universitaire et Professeur Agrégé de Langues Vivantes (Allemand, Anglais, Espagnol, Français).
Ta mission est de fournir une traduction rigoureuse, fidèle et élégante du texte soumis (énoncé de devoir, consigne, phrase, texte littéraire ou argumentatif).
Fournis également :
1. La traduction intégrale fidèle.
2. Une explication des expressions clés et du vocabulaire important (Wortschatz / Vocabulary / Vocabulario).
3. Des remarques grammaticales ou syntaxiques pertinentes pour l'examen (ex: subordonnées, temps, verbes modaux).`;

    const prompt = `Texte à traduire : "${text}"
Langue source : ${sourceLang}
Langue cible : ${targetLang}

Génère une traduction structurée et pédagogique en JSON.`;

    const rawJson = await generateWithFallbackAndRetry({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sourceLanguageDetected: { type: Type.STRING },
            translatedText: { type: Type.STRING },
            literalTranslation: { type: Type.STRING },
            keyVocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  termSource: { type: Type.STRING },
                  termTarget: { type: Type.STRING },
                  categoryOrContext: { type: Type.STRING },
                },
                required: ["termSource", "termTarget", "categoryOrContext"],
              },
            },
            grammaticalNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["sourceLanguageDetected", "translatedText", "keyVocabulary", "grammaticalNotes"],
        },
      },
    }, { taskType: "translation", cacheable: true, cacheTtlMs: 60 * 60_000 });

    const parsed = JSON.parse(rawJson || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.warn("Translation fallback triggered:", error?.message || error);

    // Dernier recours réel avant d'abandonner. On tente d'abord le point
    // d'accès gratuit non-officiel (aucune configuration requise), puis
    // l'API officielle payante seulement si elle est configurée et que le
    // moteur gratuit a échoué (bloqué/rate-limité).
    try {
      const gt = await translateWithFreeGoogleEndpoint({
        text: req.body?.text || "",
        sourceLang: req.body?.sourceLang || "auto",
        targetLang: req.body?.targetLang || "fr",
      });

      return res.json({
        success: true,
        data: {
          sourceLanguageDetected: gt.detectedSourceLanguage || req.body?.sourceLang || "auto",
          translatedText: gt.translatedText,
          literalTranslation: gt.translatedText,
          keyVocabulary: [],
          grammaticalNotes: [],
        },
        isFallback: true,
      });
    } catch (freeGtError: any) {
      console.warn("Free Google Translate endpoint failed, trying official API:", freeGtError?.message || freeGtError);
    }

    try {
      const gt = await translateWithGoogleCloudTranslate({
        text: req.body?.text || "",
        sourceLang: req.body?.sourceLang || "auto",
        targetLang: req.body?.targetLang || "fr",
      });

      return res.json({
        success: true,
        data: {
          sourceLanguageDetected: gt.detectedSourceLanguage || req.body?.sourceLang || "auto",
          translatedText: gt.translatedText,
          literalTranslation: gt.translatedText,
          keyVocabulary: [],
          grammaticalNotes: [],
        },
        isFallback: true,
      });
    } catch (gtError: any) {
      console.warn("Official Google Translate API also failed:", gtError?.message || gtError);
    }

    // Contrairement à la correction de devoir, une traduction ne peut pas être
    // devinée honnêtement par le moteur heuristique local (contresens garanti) —
    // le message reste volontairement générique et sans jargon technique.
    return res.json({
      success: true,
      data: {
        sourceLanguageDetected: req.body?.sourceLang || "auto",
        translatedText: "",
        literalTranslation: "",
        keyVocabulary: [],
        grammaticalNotes: [
          "La traduction est momentanément occupée. Réessayez dans un instant, ou continuez avec le texte original en attendant.",
        ],
      },
      isFallback: true,
    });
  }
});

/**
 * Endpoint de diagnostic interne (aucune clé API n'est jamais exposée) :
 * état des cooldowns par modèle, taille du cache, nombre de clés
 * configurées par fournisseur. Utile pour vérifier en production que le
 * fallback fonctionne comme attendu.
 */
app.get("/api/_ai-health", (_req, res) => {
  res.json(getOrchestratorDebugState());
});

// Vite middleware configuration for Development and Production Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur Déclic démarré sur http://localhost:${PORT}`);
  });
}

startServer();
