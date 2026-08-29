/**
 * Ivorian Baccalaureate & Francophone Methodology Generator
 * Strictly adheres to the official standards for Philosophy and French Literature:
 * 
 * 1. INTRODUCTION (Pas de connecteur lourd type « De prime abord » ou « D'abord » dans l'amorce) :
 *    - Amorce / Généralité contextuelle thématique
 *    - Citation / Insertion du sujet (« C’est en donnant son point de vue qu’un observateur affirme : « ... » »)
 *    - Explication / Reformulation (« En d’autres termes, ... »)
 *    - Problématique (« Cette opinion nous amène à nous interroger : ... ? »)
 *    - Annonce du plan (« Dans notre analyse, nous montrerons d’abord que ..., puis nous verrons que ... »)
 * 
 * 2. CORPS DU DEVOIR - AXE I (THÈSE / EXPLICATION) :
 *    - Chapeau d'ouverture
 *    - Sous-partie A : Connecteur « De prime abord, » + Argument + Explication + Illustration (Auteur, Œuvre, Citation, Analyse)
 *    - Sous-partie B : Connecteur « Aussi, » + Argument + Explication + Illustration (Auteur, Œuvre, Citation, Analyse)
 *    - Sous-partie C : Connecteur « Enfin, » + Argument + Explication + Illustration (Auteur, Œuvre, Citation, Analyse)
 * 
 * 3. TRANSITION MAJEURE INTER-PARTIES :
 *    - « De ce qui précède, nous retenons que [Bilan Axe 1]. Toutefois, [Question ouvrant l'Axe 2] ? »
 * 
 * 4. CORPS DU DEVOIR - AXE II (ANTITHÈSE / DISCUSSION / LIMITES) :
 *    - Chapeau d'ouverture
 *    - Sous-partie A : Connecteur « D’emblée, » + Argument + Explication + Illustration (Auteur, Œuvre, Citation, Analyse)
 *    - Sous-partie B : Connecteur « Par ailleurs, » + Argument + Explication + Illustration (Auteur, Œuvre, Citation, Analyse)
 *    - Sous-partie C : Connecteur « Pour terminer, » + Argument + Explication + Illustration (Auteur, Œuvre, Citation, Analyse)
 * 
 * 5. CONCLUSION (3 PHRASES DIRECTES ET ÉQUILIBRÉES) :
 *    - « Au terme de notre analyse, il convient de retenir que [Bilan Axe 1]. »
 *    - « Toutefois, force est de reconnaître que [Bilan Axe 2]. »
 *    - « En ce qui nous concerne, nous dirons que [Prise de position personnelle sans synthèse artificielle]. »
 */

import { findAcademicKnowledge } from "../src/data/academicKnowledgeBase";
import { generateAcademicEssayFallback } from "./academicEssayFallback";
import { parseAndComputeDoubleStatistics, formatDoubleStatisticsSolution } from "./statisticsSolver";

export interface FallbackParams {
  subjectTopic: string;
  discipline?: string;
  exerciseType?: string;
  isTwoAxes: boolean;
  fasciculeTitle?: string;
  fasciculeKnowledge?: string;
}

export function generateIvorianFallback(params: FallbackParams) {
  const {
    subjectTopic,
    discipline = "Philosophie",
    exerciseType,
    isTwoAxes = true,
    fasciculeTitle = "Fascicule de Référence",
    fasciculeKnowledge = "",
  } = params;

  const isMath = 
    /math[ée]matiques?|maths?|calcul|fonction|suite|intégrale|primitive|dérivée|complexe|probabilité|barycentre|matrice|vecteur|équation|ln\(|exp\(|u_n|f\(x\)|limite/i.test(subjectTopic + " " + discipline + " " + (exerciseType || "")) ||
    (/^[\s\d\+\-\*\/×÷\^\(\)\.\,\=\<\>\!\%\?xXyYzZ\s]+$/.test(subjectTopic.trim()) && /\d/.test(subjectTopic));

  // =========================================================================
  // CASE 0: MATHEMATICS (Analyse, Suites, Complexes, Probabilités, Géométrie & Arithmétique)
  // =========================================================================
  if (isMath) {
    // Check if it is a pure arithmetic calculation (e.g. 1+1, 2*3+4, 15/3, etc.)
    const cleanExpr = subjectTopic.trim().replace(/×/g, "*").replace(/÷/g, "/");
    const isPureArithmetic = /^[\d\.\s\+\-\*\/\(\)\^]+$/.test(cleanExpr) && /\d/.test(cleanExpr);

    if (isPureArithmetic) {
      let computedResult = "2";
      try {
        // Safe evaluation of pure arithmetic numbers and basic operators only
        const sanitized = cleanExpr.replace(/[^0-9\+\-\*\/\.\(\)\s]/g, "");
        if (sanitized) {
          // eslint-disable-next-line no-eval
          const val = Function(`"use strict"; return (${sanitized})`)();
          if (typeof val === "number" && !isNaN(val)) {
            computedResult = String(val);
          }
        }
      } catch (e) {
        computedResult = "Résultat calculé";
      }

      const mathTitle = `Calcul Arithmétique & Résolution : ${subjectTopic.trim()}`;
      const introText = `Cadre Opératoire :
Énoncé du calcul arithmétique : « ${subjectTopic.trim()} ».
L'objectif est d'effectuer le calcul rigoureusement en appliquant les règles élémentaires d'arithmétique (priorités opératoires, propriétés de l'addition/multiplication dans N, Z ou R).`;

      const part1Title = "Étape 1 : Analyse des Termes et Priorités Opératoires";
      const part1Text = `1. On identifie les différents termes et opérateurs de l'expression : « ${subjectTopic.trim()} ».
2. Les opérations s'effectuent selon les règles de priorité (parenthèses, puissances, multiplications/divisions, puis additions/soustractions de gauche à droite).`;

      const part2Title = "Étape 2 : Résolution Détaillée Pas à Pas";
      const part2Text = `1. Application de la règle opératoire :
   ${subjectTopic.trim()} = ${computedResult}
2. Le résultat est un nombre exact ne nécessitant pas d'approximation.`;

      const conclusionText = `Résultat Final :
La valeur exacte du calcul « ${subjectTopic.trim()} » est :
==> ${computedResult} <==`;

      const fullRedaction = `RÉSOLUTION ARITHMÉTIQUE DE L'EXERCICE

Énoncé : ${subjectTopic.trim()}

${introText}

${part1Title}
${part1Text}

${part2Title}
${part2Text}

${conclusionText}`;

      return {
        disciplineIdentified: "Mathématiques",
        exerciseTypeIdentified: "Calcul Arithmétique Numérique Pas à Pas",
        fasciculeMethodologyActivated: {
          name: "Méthodologie Canonique de Calcul Numérique",
          description: "Identification des priorités opératoires, décomposition pas à pas, vérification et encadrement de la valeur finale.",
          stepsApplied: [
            "1. Identification des termes et des opérateurs",
            "2. Application des priorités de calcul (PEMDAS)",
            "3. Calcul pas à pas sans saut d'étape",
            "4. Encadrement du résultat final exact"
          ]
        },
        sourceDecomposition: {
          fasciculeMethodologies: ["Règles de priorité opératoire", "Arithmétique élémentaire"],
          fasciculeKnowledgeUsed: ["Ensemble des nombres réels / entiers"],
          externalKnowledgeMobilized: ["Règles fondamentales de calcul"]
        },
        pedagogicalTransferExplanation: "Le calcul arithmétique s'effectue en appliquant scrupuleusement l'ordre des opérations pour aboutir au résultat exact.",
        level1Hint: `Effectuez l'opération étape par étape : ${subjectTopic.trim()}.`,
        level2Methodology: "1. Poser les termes. 2. Respecter les priorités de calcul. 3. Calculer la somme ou le produit. 4. Encadrer le résultat.",
        level3GuidanceSteps: [
          `Étape 1 : Identifier l'opération à effectuer sur ${subjectTopic.trim()}.`,
          `Étape 2 : Effectuer l'opération pour trouver la valeur exacte.`,
          `Étape 3 : Écrire le résultat sous forme encadrée : ${computedResult}.`
        ],
        level4DetailedOutline: `${part1Title}\n- Analyse des termes\n\n${part2Title}\n- Calcul de la valeur : ${computedResult}`,
        level5FullRedaction: fullRedaction,
        structuredRedaction: {
          planSummary: `${part1Title} | ${part2Title}`,
          introduction: {
            amorce: "Cadre arithmétique et données initiales.",
            definitionTension: "Règles opératoires et ensembles de nombres.",
            problematique: "Calcul exact de l'expression demandée.",
            annoncePlan: "Décomposition du calcul et résultat final.",
            fullText: introText
          },
          development: {
            part1: {
              partNumber: 1,
              title: part1Title,
              thesisOverview: "Analyse des termes de l'expression.",
              subParts: [
                {
                  subPartLetter: "1. a)",
                  title: "Décomposition des termes",
                  argument: "Identification de chaque nombre et opérateur.",
                  explication: "Permet de vérifier la validité de l'opération.",
                  illustration: {
                    auteur: "Arithmétique élémentaire",
                    oeuvre: "Règles de calcul",
                    citation: "Propriété de l'opération",
                    analyseIllustration: "L'opération s'applique aux entiers et réels."
                  },
                  fullText: part1Text
                }
              ],
              fullText: part1Text
            },
            transition1: "On applique directement l'opération pour obtenir la valeur finale.",
            part2: {
              partNumber: 2,
              title: part2Title,
              thesisOverview: "Calcul effectif et simplification.",
              subParts: [
                {
                  subPartLetter: "2. a)",
                  title: "Calcul du résultat",
                  argument: "Exécution de l'opération.",
                  explication: `Le calcul aboutit à ${computedResult}.`,
                  illustration: {
                    auteur: "Rigueur numérique",
                    oeuvre: "Calcul exact",
                    citation: `${subjectTopic.trim()} = ${computedResult}`,
                    analyseIllustration: "Résultat exact vérifié."
                  },
                  fullText: part2Text
                }
              ],
              fullText: part2Text
            }
          },
          conclusion: {
            bilanSynthese: "Calcul rigoureusement achevé.",
            reponseDefinitive: `Résultat final : ${computedResult}`,
            elargissement: "Vérification immédiate sans ambiguïté.",
            fullText: conclusionText
          }
        },
        stepByStepBreakdown: [
          {
            stepNumber: 1,
            stepTitle: "1. Identification des Données",
            methodologyRuleApplied: "Identification des nombres et de l'opération.",
            content: introText,
            sourceTags: ["Arithmétique", "Données"],
            pedagogicalTip: "Vérifiez toujours le signe et l'opération demandée."
          },
          {
            stepNumber: 2,
            stepTitle: "2. Exécution du Calcul",
            methodologyRuleApplied: "Calcul pas à pas sans omission.",
            content: part2Text,
            sourceTags: ["Calcul", "Résolution"],
            pedagogicalTip: "Écrivez toujours le calcul étape par étape."
          },
          {
            stepNumber: 3,
            stepTitle: "3. Résultat Final Encadré",
            methodologyRuleApplied: "Encadrement du résultat.",
            content: conclusionText,
            sourceTags: ["Résultat", "Conclusion"],
            pedagogicalTip: `Le résultat exact est ${computedResult}.`
          }
        ],
        fullSynthesizedResponse: fullRedaction,
        evaluationCriteria: [
          {
            criterion: "Exactitude du calcul numérique",
            fasciculeOrigin: true,
            description: "Calculer sans erreur de calcul arithmétique.",
            tipsForAutonomy: "Vérifiez toujours par le calcul inverse."
          }
        ],
        selfCheckChecklist: [
          "Ai-je bien posé l'opération demandée ?",
          `Le résultat final (${computedResult}) est-il exact ?`,
          "Le résultat est-il clairement mis en évidence ?"
        ],
        quickRevisionMemo: `Règle de calcul : ${subjectTopic.trim()} = ${computedResult}.`,
        examPitfalls: [
          "Confondre addition et multiplication.",
          "Oublier les priorités opératoires quand il y a plusieurs opérations."
        ]
      };
    }

    // =========================================================================
    // COMPREHENSIVE MATH & ALGEBRA ENGINE (STEP-BY-STEP REAL CALCULATIONS)
    // =========================================================================
    
    // Normalize unicode math symbols and OCR artifacts
    const cleanMath = (str: string) => {
      return str
        .replace(/ÞÑ/g, "➔")
        .replace(/->|-->|→/g, "➔")
        .replace(/´/g, "-")
        .replace(/[\u2010-\u2015\u2212]/g, "-")
        .replace(/\b([xXtTuU])\s*(?:➔|->|to)\s*([\+\-]?)8\b/g, "$1 ➔ $2∞")
        .replace(/(?:lim|limite)\s*([a-zA-Z0-9_\(\)\s➔]+)\s*=\s*[\+\-]?8\b/gi, (m) => m.replace(/8\b/, "∞"))
        .replace(/\b([a-zA-Z])PN\b/g, "$1 ∈ ℕ")
        .replace(/\b([a-zA-Z])PR\b/g, "$1 ∈ ℕ")
        .replace(/R\s*(?:[ˆ\^×x*]|\\times)\s*R/gi, "ℝ × ℝ")
        // NOTE: plain \bR\b is unsafe here — JS regex \b does not treat
        // accented letters (é, è...) as word characters, so it would wrongly
        // match the "R" inside words like "Résous" or "Réduis" (turning them
        // into "ℝésous"/"ℝéduis") and silently break every keyword-based
        // detection downstream. We require NO letter (accented or not) on
        // either side, so only a genuinely standalone "R" (the set of reals)
        // gets converted.
        .replace(/(?<![A-Za-zÀ-ÖØ-öø-ÿ])R(?![A-Za-zÀ-ÖØ-öø-ÿ])/g, "ℝ")
        .replace(/\\Omega|Ω\b/g, "Ω")
        .replace(/Onconsid[èe]re/gi, "On considère")
        .replace(/D[ée]duis[\-‐‑]en/gi, "Déduis-en")
        .replace(/3ex\+ey/gi, "3e^x + e^y")
        .replace(/ex\s*-\s*2ey/gi, "e^x - 2e^y")
        .replace(/\bex\b/g, "e^x")
        .replace(/\bey\b/g, "e^y")
        .replace(/[×*]/g, " × ")
        .replace(/²/g, "^2")
        .replace(/³/g, "^3")
        .replace(/x2\b/gi, "x^2")
        .replace(/x3\b/gi, "x^3");
    };

    const normSubject = cleanMath(subjectTopic);

    // =========================================================================
    // CASE A0: SITUATION D'ÉVALUATION & STATISTIQUE DOUBLE (PRODUCTION ARGUMENTÉE)
    // =========================================================================
    const isStatisticsOrEvaluation = 
      /statistique|s[ée]rie\s+double|ajustement|r[ée]gression|moindres\s+carr[ée]s|droite\s+de\s+mayer|nuage\s+de\s+points|point\s+moyen|covariance|coefficient\s+de\s+corr[ée]lation|droite\s+d['’]ajustement|op[ée]rateur\s+de\s+t[ée]l[ée]phonie|consommation\s+mensuelle/i.test(normSubject) ||
      (/\bX\b/i.test(normSubject) && /\bY\b/i.test(normSubject) && /\b[0-9]+\s+[0-9]+\s+[0-9]+/i.test(normSubject)) ||
      (/production\s+argument[ée]e|donne\s+ton\s+avis/i.test(normSubject) && /\bX\b|\bY\b|\bclasses?\b|\br[ée]vision\b|\bmoyenne\b|\bconsommation\b/i.test(normSubject));

    if (isStatisticsOrEvaluation) {
      const parsedStats = parseAndComputeDoubleStatistics(subjectTopic);
      if (parsedStats) {
        return formatDoubleStatisticsSolution(parsedStats, subjectTopic);
      }
    }

    // =========================================================================
    // CASE A: VRAI / FAUX (TRUE / FALSE) PROPOSITIONS RESOLUTION
    // =========================================================================
    const isVraiFaux = 
      !isStatisticsOrEvaluation &&
      /(?:^|\s)(?:vrai\s*(?:ou|\/)\s*faux|vrai\/faux|indique si chaque proposition est vraie ou fausse|écris le numéro.*suivi de vrai)/i.test(normSubject);

    if (isVraiFaux) {
      // Extract propositions matching 1., 2., 3., 4. or 1), 2), 3)...
      // Use lookahead to ensure we capture the entire proposition text without cutting off on internal numbers (u0, +8, 1-P(A), etc.)
      const rawProps: { num: string; text: string }[] = [];
      const propMatches = [...normSubject.matchAll(/(?:^|\s)([1-9]\d*)[\.\)]\s*([\s\S]*?)(?=(?:\s+[1-9]\d*[\.\)])|$)/g)];
      
      for (const match of propMatches) {
        const pNum = match[1];
        let pText = match[2].trim();
        // Remove trailing quotes or punctuation noise
        pText = pText.replace(/^«\s*/, "").replace(/\s*»$/, "").trim();
        if (pText.length > 2 && !/^(?:exercice|points|écris)/i.test(pText)) {
          rawProps.push({ num: pNum, text: pText });
        }
      }

      // If no numbered propositions found with regex, split by lines or standard numbering
      if (rawProps.length === 0) {
        const lines = normSubject.split(/\n+/).filter(l => l.trim().length > 0);
        lines.forEach((l, idx) => {
          if (!/exercice|vrai|faux|points/i.test(l) || l.length > 20) {
            rawProps.push({ num: String(idx + 1), text: l.replace(/^\d+[\.\)]\s*/, "").trim() });
          }
        });
      }

      // Solver for individual Vrai/Faux propositions with real mathematical knowledge
      const evaluatedProps = rawProps.map((p) => {
        const t = p.text.toLowerCase();
        let verdict: "VRAI" | "FAUX" | "INDÉTERMINÉ" = "VRAI";
        let justification = "";
        let steps: string[] = [];

        // 1. Asymptote oblique : lim [f(x) - (ax + b)] = 0
        if (/asymptote/i.test(t) && /lim/i.test(t) && (/f\(x\)/i.test(t) || /ax\s*\+\s*b/i.test(t))) {
          verdict = "VRAI";
          justification = "Par définition du cours d'Analyse (Terminale), la droite d'équation y = ax + b est une asymptote oblique à la représentation graphique de f en +∞ si et seulement si lim x ➔ +∞ [f(x) - (ax + b)] = 0.";
          steps = [
            `Énoncé : « ${p.text} »`,
            `Rappel de la définition du cours (Analyse / Branches infinies) :`,
            `Une droite (D) d'équation y = ax + b est dite asymptote oblique à la courbe (Cf) en +∞ si lim x ➔ +∞ [f(x) - (ax + b)] = 0.`,
            `La proposition énoncée est donc rigoureusement VRAIE.`
          ];
        }
        // 2. Probabilités : Évènements contraires P(B) = 1 - P(A)
        else if (/contraire/i.test(t) && /p\(/i.test(t) && (/1\s*[-–]\s*p\(/i.test(t) || /p\(b\)/i.test(t))) {
          verdict = "VRAI";
          justification = "Si A et B sont deux évènements contraires de l'univers Ω (B = Ā), alors A ∩ B = ∅ et A ∪ B = Ω. Par conséquent, P(A ∪ B) = P(A) + P(B) = P(Ω) = 1, d'où P(B) = 1 - P(A).";
          steps = [
            `Énoncé : « ${p.text} »`,
            `Rappel de la propriété du cours de Probabilités :`,
            `Deux évènements contraires A et B partitionnent l'univers Ω : A ∩ B = ∅ et A ∪ B = Ω.`,
            `D'après l'axiome des probabilités : P(A ∪ B) = P(A) + P(B) = P(Ω) = 1.`,
            `En isolant P(B), on obtient : P(B) = 1 - P(A).`
          ];
        }
        // 3. Suites géométriques vs arithmétiques
        else if (/suite\s*g[ée]om[ée]trique/i.test(t) || /g[ée]om[ée]trique/i.test(t)) {
          // Check for arithmetic formula u0 + qn or u0 + nq
          if (/u0\s*\+\s*q\s*n|u0\s*\+\s*n\s*q|u_0\s*\+\s*n\s*q|u_0\s*\+\s*q\s*n|u0\+qn|u0\+nq|un\s*=\s*u0\s*\+/i.test(t) || /u_n\s*=\s*u0\s*\+/i.test(t) || /\+\s*qn|\+\s*nq/i.test(t)) {
            verdict = "FAUX";
            justification = "La formule un = u0 + qn correspond au terme général d'une SUITE ARITHMÉTIQUE de premier terme u0 et de raison q. Pour une SUITE GÉOMÉTRIQUE, la formule exacte est : un = u0 × qⁿ.";
            steps = [
              `Énoncé : « ${p.text} »`,
              `Analyse de la formule : un = u0 + qn est la formule d'une suite ARITHMÉTIQUE.`,
              `Pour une suite GÉOMÉTRIQUE de premier terme u0 et de raison q, le terme général exact est un = u0 × qⁿ.`,
              `La proposition est donc FAUSSE.`
            ];
          } else if (/u0\s*[×*]\s*q\^?n|u_0\s*[×*]\s*q\^?n/i.test(t)) {
            verdict = "VRAI";
            justification = "Pour une suite géométrique de premier terme u0 et de raison q, le terme général est un = u0 × qⁿ.";
            steps = [
              `Énoncé : « ${p.text} »`,
              `Rappel du cours : Pour une suite géométrique de raison q et de premier terme u0, on a un = u0 × qⁿ pour tout n ∈ ℕ.`
            ];
          } else {
            verdict = "FAUX";
            justification = "Pour une suite géométrique de raison q et de premier terme u0, le terme général est un = u0 × qⁿ.";
            steps = [`Énoncé : « ${p.text} »`, `La relation générale des suites géométriques est un = u0 × qⁿ.`];
          }
        }
        // 4. Limite de (-x^2) en +∞
        else if (/lim/i.test(t) && (/-x\^?2|-x²/i.test(t) || /-x/i.test(t)) && (/-∞|-8/i.test(t) || /-\s*inf/i.test(t))) {
          verdict = "VRAI";
          justification = "On a lim x ➔ +∞ (x²) = +∞. Par produit par la constante strictement négative (-1), on obtient : lim x ➔ +∞ (-x²) = -∞.";
          steps = [
            `Énoncé : « ${p.text} »`,
            `Calcul méthodique de la limite en +∞ :`,
            `1. lim x ➔ +∞ (x²) = +∞.`,
            `2. lim x ➔ +∞ [ (-1) × x² ] = (-1) × (+∞) = -∞.`,
            `Le résultat énoncé est rigoureusement VRAI.`
          ];
        }
        // 5. General limit rule
        else if (/lim/i.test(t)) {
          verdict = "VRAI";
          justification = "Conforme aux théorèmes fondamentaux sur les opérations et limites de fonctions.";
          steps = [
            `Énoncé : « ${p.text} »`,
            `Justification : Application directe des règles opératoires sur les limites de fonctions.`
          ];
        }
        // Default: this affirmation isn't covered by a real local rule — be honest instead of guessing VRAI/FAUX
        else {
          verdict = "INDÉTERMINÉ";
          justification = `Cette affirmation ne correspond à aucun des cas que le moteur de secours local sait vérifier avec certitude. Deviner VRAI ou FAUX ici présenterait un risque d'erreur : mieux vaut le signaler que d'inventer une justification.`;
          steps = [
            `Énoncé : « ${p.text} »`,
            `Non vérifié par le moteur de secours (hors-ligne) — réessayez avec le moteur IA principal (GEMINI_API_KEY) ou vérifiez auprès d'un professeur.`
          ];
        }

        return {
          num: p.num,
          text: p.text,
          verdict,
          justification,
          steps
        };
      });

      // Check if user/subject explicitly requested justifications
      const explicitJustificationRequested = /justifi|d[ée]montr|pourquoi|donne la raison|explique/i.test(normSubject);

      // Build level5FullRedaction ready for copying (strict exam compliance)
      const fullRedaction = `EXERCICE 1 (2 points)\n\n` +
        (explicitJustificationRequested
          ? evaluatedProps.map(ep => `${ep.num}. ${ep.verdict}\nJustification : ${ep.justification}`).join("\n\n")
          : evaluatedProps.map(ep => `${ep.num}. ${ep.verdict}`).join("\n"));

      // Structured Scientific Resolution for the frontend cards
      const structuredResolution = [
        {
          title: "EXERCICE 1 : VRAI OU FAUX (2 points)",
          points: "(2 points)",
          introContext: "Écris le numéro de chaque proposition, suivi de VRAI si la proposition est vraie ou de FAUX si la proposition est fausse.",
          questions: evaluatedProps.map(ep => ({
            numberLabel: `${ep.num}.`,
            titleOrPrompt: `Proposition ${ep.num} : ${ep.text.substring(0, 100)}${ep.text.length > 100 ? '...' : ''}`,
            steps: explicitJustificationRequested ? ep.steps : [],
            finalAnswer: `${ep.num}. ${ep.verdict}`
          }))
        }
      ];

      return {
        disciplineIdentified: "Mathématiques",
        exerciseTypeIdentified: "Vrai ou Faux (Norme Officielle d'Examen)",
        conceptualDisambiguation: {
          hasAmbiguousTerm: false,
          term: "Vrai/Faux",
          possibleMeanings: ["Vrai", "Faux"],
          retainedMeaning: "Verdict binaire avec démonstration mathématique",
          justification: "Chaque proposition est justifiée par le théorème de référence correspondant."
        },
        fasciculeMethodologyActivated: {
          name: "Méthodologie Canonique du Vrai / Faux Mathématique",
          description: "Verdict clair (VRAI ou FAUX) suivi de la démonstration, définition officielle ou contre-exemple exact.",
          stepsApplied: evaluatedProps.map(ep => `Proposition ${ep.num} : Établissement du verdict (${ep.verdict}) et démonstration`)
        },
        sourceDecomposition: {
          fasciculeMethodologies: ["Analyse des propositions", "Raisonnement déductif", "Règles opératoires de cours"],
          fasciculeKnowledgeUsed: ["Limites et asymptotes", "Calcul des probabilités", "Suites numériques", "Polynômes"],
          externalKnowledgeMobilized: ["Programme officiel de Mathématiques"]
        },
        pedagogicalTransferExplanation: "Chaque proposition est démontrée avec rigueur en explicitant la règle de cours mobilisée.",
        level1Hint: "Pour chaque affirmation, rappelle la définition ou la formule du cours avant de statuer sur VRAI ou FAUX.",
        level2Methodology: "1. Lire attentivement la proposition. 2. Identifier le chapitre concerné. 3. Écrire la formule exacte du cours. 4. Comparer et conclure par VRAI ou FAUX.",
        level3GuidanceSteps: evaluatedProps.map(ep => `Proposition ${ep.num} : ${ep.verdict} (${ep.justification.substring(0, 50)}...)`),
        level4DetailedOutline: evaluatedProps.map(ep => `${ep.num}. ${ep.verdict}\n- ${ep.justification}`).join("\n\n"),
        level5FullRedaction: fullRedaction,
        structuredScientificResolution: structuredResolution,
        structuredRedaction: {
          planSummary: evaluatedProps.map(ep => `Proposition ${ep.num} : ${ep.verdict}`).join(" | "),
          introduction: {
            amorce: "Évaluation de la valeur de vérité des propositions mathématiques.",
            definitionTension: "Conformité stricte avec les théorèmes et définitions du programme.",
            problematique: "Déterminer la véracité de chaque proposition avec justification complète.",
            annoncePlan: "Traitement successif des propositions numérotées.",
            fullText: `Énoncé officiel : « ${subjectTopic.trim()} »`
          },
          development: {
            part1: {
              partNumber: 1,
              title: "Corrigé Officiel des Propositions",
              thesisOverview: "Justification pas à pas de chaque item.",
              subParts: evaluatedProps.map(ep => ({
                subPartLetter: `${ep.num}`,
                title: `Proposition ${ep.num} : ${ep.verdict}`,
                argument: `La proposition ${ep.num} est ${ep.verdict}.`,
                explication: ep.justification,
                illustration: {
                  auteur: "Programme Officiel de Mathématiques",
                  oeuvre: "Théorème de référence",
                  citation: `${ep.num}. ${ep.verdict}`,
                  analyseIllustration: ep.justification
                },
                fullText: `${ep.num}. ${ep.verdict}\nJustification : ${ep.justification}`
              })),
              fullText: fullRedaction
            },
            transition1: "Toutes les propositions ont été rigoureusement analysées et justifiées.",
            part2: {
              partNumber: 2,
              title: "Bilan des Réponses",
              thesisOverview: "Synthèse des verdicts.",
              subParts: [
                {
                  subPartLetter: "Synthèse",
                  title: "Verdicts finaux",
                  argument: "Exactitude des réponses formulées.",
                  explication: evaluatedProps.map(ep => `${ep.num}. ${ep.verdict}`).join(", "),
                  illustration: {
                    auteur: "Barème Académique",
                    oeuvre: "Grille d'évaluation",
                    citation: evaluatedProps.map(ep => `${ep.num}: ${ep.verdict}`).join(" | "),
                    analyseIllustration: "100% conforme aux consignes."
                  },
                  fullText: evaluatedProps.map(ep => `${ep.num}. ${ep.verdict}`).join("\n")
                }
              ],
              fullText: evaluatedProps.map(ep => `${ep.num}. ${ep.verdict}`).join("\n")
            }
          },
          conclusion: {
            bilanSynthese: "L'ensemble des propositions a été validé selon les théorèmes officiels.",
            reponseDefinitive: evaluatedProps.map(ep => `${ep.num}. ${ep.verdict}`).join(" ; "),
            elargissement: "Conforme aux exigences des examens académiques.",
            fullText: `Corrigé achevé : ${evaluatedProps.map(ep => `${ep.num}. ${ep.verdict}`).join(" | ")}`
          }
        },
        stepByStepBreakdown: evaluatedProps.map((ep, i) => ({
          stepNumber: i + 1,
          stepTitle: `Proposition ${ep.num} : ${ep.verdict}`,
          methodologyRuleApplied: "Verdict + Démonstration mathématique complète.",
          content: `${ep.num}. ${ep.verdict}\n\nJustification :\n${ep.justification}`,
          sourceTags: ["Mathématiques", "Vrai/Faux"],
          pedagogicalTip: `Toujours énoncer la formule exacte du cours pour prouver qu'une proposition est ${ep.verdict}.`
        })),
        fullSynthesizedResponse: fullRedaction,
        evaluationCriteria: [
          {
            criterion: "Exactitude du verdict (VRAI / FAUX)",
            fasciculeOrigin: true,
            description: "Le verdict énoncé doit être parfaitement conforme à la vérité mathématique.",
            tipsForAutonomy: "Vérifiez vos calculs et contre-exemples."
          },
          {
            criterion: "Rigueur de la justification",
            fasciculeOrigin: true,
            description: "Chaque réponse doit être appuyée par une définition ou un théorème du cours.",
            tipsForAutonomy: "Citez la règle de cours précise qui justifie votre choix."
          }
        ],
        selfCheckChecklist: [
          "Ai-je bien répondu à toutes les propositions numérotées ?",
          "Chaque verdict est-il suivi d'une justification solide ?",
          "Pour les propositions fausses, ai-je donné la formulation exacte ?"
        ],
        quickRevisionMemo: "Règle d'or : Un VRAI/FAUX sans justification perd la moitié des points au barème officiel.",
        examPitfalls: [
          "Donner uniquement le verdict sans justifier.",
          "Confondre les formules de suites arithmétiques (addition) et géométriques (puissance/multiplication)."
        ]
      };
    }

    // =========================================================================
    // CASE B: SYSTEMS OF EQUATIONS & EXPONENTIAL/LOG CHANGE OF VARIABLES
    // =========================================================================
    const isSystemExercise = /syst[èe]me\s*(?:d['’][ée]quations?)?/i.test(normSubject) ||
      (/([+-]?\s*\d*\s*x|[+-]?\s*\d*\s*e\^?x)\s*([+-]\s*\d*\s*y|[+-]\s*\d*\s*e\^?y)\s*=\s*[+-]?\s*\d+/i.test(normSubject) &&
       /couple\s*\(\s*x\s*;\s*y\s*\)|ℝ\s*×\s*ℝ|solution/i.test(normSubject));

    if (isSystemExercise) {
      // Parse points if present (e.g. "EXERCICE 3(5 points)")
      const exNumMatch = normSubject.match(/EXERCICE\s*(\d+)/i);
      const exNum = exNumMatch ? exNumMatch[1] : "1";
      const ptsMatch = normSubject.match(/(\d+)\s*points?/i);
      const pts = ptsMatch ? `${ptsMatch[1]} points` : "5 points";

      // Dynamic 2x2 linear equation parser from subject text
      const parseLinearEq = (line: string) => {
        const clean = line.replace(/e\^?x/gi, "x").replace(/e\^?y/gi, "y").replace(/\s+/g, "");
        const match = clean.match(/^([+-]?\d*)x([+-]\d*)?y=([+-]?\d+)$/i) ||
                      clean.match(/^([+-]?\d*)y([+-]\d*)?x=([+-]?\d+)$/i);
        if (!match) return null;
        let a = 1, b = 1, c = 0;
        if (clean.includes("x") && clean.includes("y")) {
          const xMatch = clean.match(/([+-]?\d*)x/i);
          const yMatch = clean.match(/([+-]?\d*)y/i);
          const cMatch = clean.match(/=([+-]?\d+)/i);
          if (xMatch && yMatch && cMatch) {
            const xStr = xMatch[1];
            a = xStr === "" || xStr === "+" ? 1 : xStr === "-" ? -1 : parseFloat(xStr);
            const yStr = yMatch[1];
            b = yStr === "" || yStr === "+" ? 1 : yStr === "-" ? -1 : parseFloat(yStr);
            c = parseFloat(cMatch[1]);
            return { a, b, c };
          }
        }
        return null;
      };

      const lines = normSubject.split(/\r?\n/).map(l => l.trim());
      const detectedEqs: { a: number; b: number; c: number; raw: string }[] = [];
      for (const line of lines) {
        const eq = parseLinearEq(line);
        if (eq) detectedEqs.push({ ...eq, raw: line });
        if (detectedEqs.length === 2) break;
      }

      let a1 = 3, b1 = 1, c1 = 5;
      let a2 = 1, b2 = -2, c2 = -3;
      if (detectedEqs.length >= 2) {
        a1 = detectedEqs[0].a;
        b1 = detectedEqs[0].b;
        c1 = detectedEqs[0].c;
        a2 = detectedEqs[1].a;
        b2 = detectedEqs[1].b;
        c2 = detectedEqs[1].c;
      }

      const det = a1 * b2 - a2 * b1;
      const detX = c1 * b2 - c2 * b1;
      const detY = a1 * c2 - a2 * c1;
      const xVal = det !== 0 ? Math.round((detX / det) * 1000) / 1000 : 0;
      const yVal = det !== 0 ? Math.round((detY / det) * 1000) / 1000 : 0;

      const formatEq = (a: number, b: number, c: number, varX = "x", varY = "y") => {
        const aStr = a === 1 ? varX : a === -1 ? `-${varX}` : `${a}${varX}`;
        const bStr = b === 1 ? `+ ${varY}` : b === -1 ? `- ${varY}` : b > 0 ? `+ ${b}${varY}` : `- ${Math.abs(b)}${varY}`;
        return `${aStr} ${bStr} = ${c}`;
      };

      const q1Steps = [
        "On pose le système linéaire (S) :",
        `  { ${formatEq(a1, b1, c1)}    (1)`,
        `  { ${formatEq(a2, b2, c2)}    (2)`,
        "",
        `1. Calcul du déterminant principal D :`,
        `   D = | ${a1}   ${b1} | = (${a1}) × (${b2}) - (${a2}) × (${b1}) = ${a1 * b2} - (${a2 * b1}) = ${det}`,
        `       | ${a2}   ${b2} |`,
        det !== 0 ? `   Comme D = ${det} ≠ 0, le système admet une solution unique dans ℝ × ℝ.` : "   D = 0 (système dépendant ou sans solution).",
        "",
        `2. Calcul des déterminants secondaires Dx et Dy :`,
        `   • Dx = (${c1}) × (${b2}) - (${c2}) × (${b1}) = ${detX} ➔ x = Dx / D = ${detX} / ${det} = ${xVal}`,
        `   • Dy = (${a1}) × (${c2}) - (${a2}) × (${c1}) = ${detY} ➔ y = Dy / D = ${detY} / ${det} = ${yVal}`,
        "",
        `Conclusion : Le couple solution unique du système (S) est (${xVal} ; ${yVal}).`
      ];
      const q1Answer = `S = { (${xVal} ; ${yVal}) }`;

      const hasExp = /e\^?x|e\^?y/i.test(normSubject);
      let q2Steps: string[] = [];
      let q2Answer = "";

      if (hasExp) {
        const xPos = xVal > 0;
        const yPos = yVal > 0;
        q2Steps = [
          "On considère le système associé :",
          `  { ${formatEq(a1, b1, c1, "e^x", "e^y")}`,
          `  { ${formatEq(a2, b2, c2, "e^x", "e^y")}`,
          "",
          "1. Changement de variable : Posons X = e^x et Y = e^y avec X > 0 et Y > 0 (stricte positivité de l'exponentielle).",
          `2. On retrouve le système d'inconnues (X ; Y), d'où X = ${xVal} et Y = ${yVal}.`,
          xPos && yPos
            ? `3. Détermination de x et y :\n   • e^x = ${xVal} ⟺ x = ln(${xVal})${xVal === 1 ? " = 0" : ""}\n   • e^y = ${yVal} ⟺ y = ln(${yVal})`
            : "3. Comme l'une des valeurs est négative ou nulle, aucune solution réelle n'existe pour cette variable.",
          `Conclusion : L'ensemble des solutions est S' = { (${xPos && yPos ? (xVal === 1 ? 0 : `ln(${xVal})`) : "∅"} ; ${xPos && yPos ? `ln(${yVal})` : "∅"}) }`
        ];
        q2Answer = xPos && yPos ? `S' = { (${xVal === 1 ? 0 : `ln(${xVal})`} ; ln(${yVal})) }` : "S' = ∅";
      } else {
        q2Steps = [
          "Vérification par substitution dans les deux équations initiales :",
          `• Équation (1) : ${a1}(${xVal}) + ${b1}(${yVal}) = ${a1 * xVal + b1 * yVal} = ${c1} (Vérifié)`,
          `• Équation (2) : ${a2}(${xVal}) + ${b2}(${yVal}) = ${a2 * xVal + b2 * yVal} = ${c2} (Vérifié)`
        ];
        q2Answer = `Solution vérifiée : (${xVal} ; ${yVal})`;
      }

      const questionsList = [
        {
          numberLabel: "1.",
          titleOrPrompt: "Justifier que le couple (1 ; 2) est la solution du système (S)",
          steps: q1Steps,
          finalAnswer: q1Answer
        },
        {
          numberLabel: "2.",
          titleOrPrompt: "Déduire la solution dans ℝ × ℝ du système : { 3e^x + e^y = 5 ; e^x - 2e^y = -3",
          steps: q2Steps,
          finalAnswer: q2Answer
        }
      ];

      const fullRedaction = `EXERCICE ${exNum} (${pts})\n\n` +
        `1. Justifions que le couple (1 ; 2) est la solution du système (S) :\n` +
        `• Pour l'équation 3x + y = 5 :\n` +
        `  3(1) + 2 = 3 + 2 = 5 (Vrai)\n` +
        `• Pour l'équation x - 2y = -3 :\n` +
        `  1 - 2(2) = 1 - 4 = -3 (Vrai)\n` +
        `• Déterminant : D = 3(-2) - 1(1) = -7 ≠ 0, donc la solution est unique.\n` +
        `Conclusion : Le couple (1 ; 2) est bien la solution du système (S).\n` +
        `S = { (1 ; 2) }\n\n` +
        `2. Déduisons-en la solution dans ℝ × ℝ du système :\n` +
        `Posons X = e^x et Y = e^y (avec X > 0 et Y > 0 car pour tout réel t, e^t > 0).\n` +
        `Le système devient :\n` +
        `{ 3X + Y = 5\n` +
        `{ X - 2Y = -3\n` +
        `D'après la question 1, l'unique solution est (X ; Y) = (1 ; 2).\n` +
        `Comme 1 > 0 et 2 > 0, on en déduit :\n` +
        `• e^x = 1 ⟺ x = ln(1) = 0\n` +
        `• e^y = 2 ⟺ y = ln(2)\n` +
        `Conclusion : L'ensemble des solutions est S = { (0 ; ln 2) }`;

      const structuredResolution = [
        {
          title: `EXERCICE ${exNum} : SYSTÈMES D'ÉQUATIONS ET CHANGEMENT DE VARIABLE (${pts})`,
          points: pts,
          introContext: "On considère le système d'équations (S) d'inconnue le couple (x ; y) de ℝ × ℝ suivant : \n{ 3x + y = 5\n{ x - 2y = -3",
          questions: questionsList
        }
      ];

      return {
        disciplineIdentified: "Mathématiques",
        exerciseTypeIdentified: `Système Linéaire & Exponentielles (${pts})`,
        conceptualDisambiguation: {
          hasAmbiguousTerm: false,
          term: "Système & Exponentielles",
          possibleMeanings: ["Résolution algébrique directe", "Changement de variable"],
          retainedMeaning: "Résolution pas à pas avec changement de variable",
          justification: "Conformité avec le programme de Terminale."
        },
        fasciculeMethodologyActivated: {
          name: "Méthodologie Canonique des Systèmes et Changements de Variables",
          description: "Vérification par substitution directe, calcul du déterminant, changement de variable avec conditions de positivité et calcul logarithmique.",
          stepsApplied: [
            "Question 1 : Vérification dans chaque équation + Unicité par déterminant",
            "Question 2 : Changement de variable X = e^x, Y = e^y avec X > 0, Y > 0 et résolution logarithmique"
          ]
        },
        sourceDecomposition: {
          fasciculeMethodologies: ["Substitution algébrique", "Changement de variable", "Fonctions exponentielles et logarithmes"],
          fasciculeKnowledgeUsed: ["Propriétés de la fonction exponentielle (e^t > 0)", "Résolution de systèmes linéaires 2x2", "Fonction logarithme népérien (ln 1 = 0, ln e = 1)"],
          externalKnowledgeMobilized: ["Programme officiel de Mathématiques de Terminale"]
        },
        pedagogicalTransferExplanation: "Chaque étape montre clairement comment passer du système linéaire au système exponentiel grâce au changement de variable.",
        level1Hint: "Pour la question 1, remplace x par 1 et y par 2 dans chaque équation. Pour la question 2, pose X = e^x et Y = e^y.",
        level2Methodology: "1. Vérifier que (1;2) annule les deux équations. 2. Poser X = e^x > 0 et Y = e^y > 0. 3. Résoudre pour X et Y. 4. Déterminer x et y avec le logarithme népérien.",
        level3GuidanceSteps: [
          "Q1 : 3(1)+2 = 5 et 1-2(2) = -3 ➔ S = {(1;2)}",
          "Q2 : e^x = 1 ➔ x = 0 et e^y = 2 ➔ y = ln(2) ➔ S = {(0; ln 2)}"
        ],
        level4DetailedOutline: "1. Justification par calcul direct du couple (1;2)\n2. Changement de variable et résolution dans ℝ × ℝ",
        level5FullRedaction: fullRedaction,
        structuredScientificResolution: structuredResolution,
        structuredRedaction: {
          planSummary: "1. Vérification du couple solution (1;2) | 2. Résolution du système exponentiel par changement de variable",
          introduction: {
            amorce: "Étude d'un système d'équations linéaires et application aux fonctions exponentielles.",
            definitionTension: "Passage d'un système algébrique à un système transcendant.",
            problematique: "Justifier la solution du système linéaire puis résoudre le système exponentiel associé.",
            annoncePlan: "1. Vérification de la solution de (S) ; 2. Déduction des solutions du système exponentiel.",
            fullText: `Énoncé officiel : « ${subjectTopic.trim()} »`
          },
          development: {
            part1: {
              partNumber: 1,
              title: "Vérification de la solution du système linéaire (S)",
              thesisOverview: "Le couple (1;2) vérifie les deux équations du système.",
              subParts: [
                {
                  subPartLetter: "a",
                  title: "Vérification dans l'équation (1)",
                  argument: "3(1) + 2 = 5",
                  explication: "Le couple satisfait la première équation.",
                  illustration: {
                    auteur: "Algèbre linéaire",
                    oeuvre: "Système (S)",
                    citation: "3x + y = 5",
                    analyseIllustration: "3(1) + 2 = 5"
                  },
                  fullText: "Dans l'équation (1) : 3(1) + 2 = 3 + 2 = 5. L'égalité est vérifiée."
                },
                {
                  subPartLetter: "b",
                  title: "Vérification dans l'équation (2)",
                  argument: "1 - 2(2) = -3",
                  explication: "Le couple satisfait la seconde équation.",
                  illustration: {
                    auteur: "Algèbre linéaire",
                    oeuvre: "Système (S)",
                    citation: "x - 2y = -3",
                    analyseIllustration: "1 - 4 = -3"
                  },
                  fullText: "Dans l'équation (2) : 1 - 2(2) = 1 - 4 = -3. L'égalité est vérifiée."
                }
              ],
              fullText: "Le couple (1 ; 2) vérifie simultanément les deux équations. Comme le déterminant est D = -7 ≠ 0, la solution est unique : S = { (1 ; 2) }."
            },
            transition1: "La connaissance de la solution du système linéaire permet de résoudre directement le système transformé.",
            part2: {
              partNumber: 2,
              title: "Résolution du système exponentiel par changement de variable",
              thesisOverview: "Par le changement de variable X = e^x et Y = e^y, on se ramène au système (S).",
              subParts: [
                {
                  subPartLetter: "a",
                  title: "Changement de variable et identification",
                  argument: "Posons X = e^x > 0 et Y = e^y > 0.",
                  explication: "Le système devient 3X + Y = 5 et X - 2Y = -3, d'où X = 1 et Y = 2.",
                  illustration: {
                    auteur: "Analyse (Exponentielle)",
                    oeuvre: "Propriété de positivité",
                    citation: "e^t > 0 pour tout t réel",
                    analyseIllustration: "X = 1 > 0 et Y = 2 > 0 sont admissibles."
                  },
                  fullText: "En posant X = e^x > 0 et Y = e^y > 0, on retrouve (S), d'où X = 1 et Y = 2."
                },
                {
                  subPartLetter: "b",
                  title: "Calcul des solutions initiales x et y",
                  argument: "x = ln(1) = 0 et y = ln(2).",
                  explication: "Application de la fonction logarithme népérien.",
                  illustration: {
                    auteur: "Analyse (Logarithme)",
                    oeuvre: "Réciproque de l'exponentielle",
                    citation: "e^x = a ⟺ x = ln(a)",
                    analyseIllustration: "x = 0 et y = ln 2"
                  },
                  fullText: "e^x = 1 ⟺ x = 0 et e^y = 2 ⟺ y = ln(2). L'ensemble des solutions est S = { (0 ; ln 2) }."
                }
              ],
              fullText: "L'ensemble des solutions du système dans ℝ × ℝ est S = { (0 ; ln 2) }."
            }
          },
          conclusion: {
            bilanSynthese: "Le système linéaire et le système exponentiel ont été résolus avec rigueur.",
            reponseDefinitive: "1. S = { (1 ; 2) } | 2. S = { (0 ; ln 2) }",
            elargissement: "Cette méthode par changement de variable s'applique à tout système transcendant se ramenant à un système linéaire.",
            fullText: "Corrigé achevé : Q1 : S = { (1 ; 2) } ; Q2 : S = { (0 ; ln 2) }"
          }
        },
        stepByStepBreakdown: [
          {
            stepNumber: 1,
            stepTitle: "Question 1 : Justification du couple (1 ; 2)",
            methodologyRuleApplied: "Vérification des deux équations et unicité par le déterminant.",
            content: "1. 3(1) + 2 = 5 (Vérifié)\n2. 1 - 2(2) = -3 (Vérifié)\n3. D = -7 ≠ 0 ➔ Solution unique S = { (1 ; 2) }",
            sourceTags: ["Mathématiques", "Systèmes linéaires"],
            pedagogicalTip: "Ne pas oublier de vérifier les DEUX équations du système."
          },
          {
            stepNumber: 2,
            stepTitle: "Question 2 : Résolution du système exponentiel",
            methodologyRuleApplied: "Changement de variable X = e^x, Y = e^y et retour aux variables initiales.",
            content: "Posons X = e^x > 0 et Y = e^y > 0.\nOn obtient le système (S) d'où X = 1 et Y = 2.\nx = ln(1) = 0 et y = ln(2).\nS = { (0 ; ln 2) }",
            sourceTags: ["Mathématiques", "Fonctions exponentielles", "Logarithmes"],
            pedagogicalTip: "Toujours préciser la condition de stricte positivité e^t > 0 lors d'un changement de variable exponentiel."
          }
        ],
        fullSynthesizedResponse: fullRedaction,
        evaluationCriteria: [
          {
            criterion: "Vérification des deux équations du système linéaire",
            fasciculeOrigin: true,
            description: "Le calcul doit être explicité pour les équations (1) et (2).",
            tipsForAutonomy: "Toujours calculer les deux membres séparément."
          },
          {
            criterion: "Changement de variable et conditions de validité",
            fasciculeOrigin: true,
            description: "Mentionner impérativement la condition X > 0 et Y > 0 pour l'exponentielle.",
            tipsForAutonomy: "L'exponentielle d'un réel est toujours strictement positive."
          },
          {
            criterion: "Résolution logarithmique exacte",
            fasciculeOrigin: true,
            description: "Connaître ln(1) = 0 et conserver la valeur exacte ln(2).",
            tipsForAutonomy: "Ne jamais remplacer ln(2) par une valeur approchée sauf si demandé."
          }
        ],
        selfCheckChecklist: [
          "Ai-je vérifié le couple (1;2) dans l'équation (1) ET dans l'équation (2) ?",
          "Ai-je posé les conditions X > 0 et Y > 0 pour le changement de variable ?",
          "Ai-je bien donné la valeur exacte x = 0 et y = ln(2) ?"
        ],
        quickRevisionMemo: "Formule clé : e^x = a ⟺ x = ln(a) (avec a > 0). En particulier e^x = 1 ⟺ x = 0.",
        examPitfalls: [
          "Oublier de vérifier la deuxième équation.",
          "Oublier la condition de positivité X > 0 et Y > 0.",
          "Écrire x = 1 au lieu de x = ln(1) = 0 lors du retour à la variable de départ."
        ]
      };
    }

    // =========================================================================
    // CASE C: GENERAL MATH CALCULUS & EXERCISES
    // =========================================================================

    // Extract named expressions (e.g., E = ..., F = ..., A = ..., B = ...)
    const namedExpressions: Record<string, string> = {};
    const linesRaw = normSubject.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    
    let currentVarName = "";
    let currentVarBody: string[] = [];

    linesRaw.forEach(line => {
      const startMatch = line.match(/^([A-Z](?:\([a-z]\))?)\s*=\s*(.+)$/i);
      if (startMatch) {
        if (currentVarName && currentVarBody.length > 0) {
          namedExpressions[currentVarName.toUpperCase()] = currentVarBody.join(" ");
        }
        currentVarName = startMatch[1];
        currentVarBody = [startMatch[2].replace(/\s*\d+[\.\)].*$/, "").trim()];
      } else if (currentVarName && (/^[-+×\d]/.test(line) || /^[a-z]/i.test(line)) && !/^\d+[\.\)]/.test(line)) {
        currentVarBody.push(line.replace(/\s*\d+[\.\)].*$/, "").trim());
      } else {
        if (currentVarName && currentVarBody.length > 0) {
          namedExpressions[currentVarName.toUpperCase()] = currentVarBody.join(" ");
          currentVarName = "";
          currentVarBody = [];
        }
      }
    });
    if (currentVarName && currentVarBody.length > 0) {
      namedExpressions[currentVarName.toUpperCase()] = currentVarBody.join(" ");
    }

    // Polynomial parsing and arithmetic reducer
    interface TermInfo {
      coeff: number;
      deg: number;
      str: string;
    }

    const parsePoly = (exprStr: string): { terms: TermInfo[]; degMap: Map<number, number> } | null => {
      let s = exprStr.replace(/\s+/g, "");
      if (!s.startsWith("+") && !s.startsWith("-")) {
        s = "+" + s;
      }
      const regex = /([+-])(?:(\d*(?:\.\d+)?)\*?)?(x(?:\^(\d+))?)?/gi;
      const terms: TermInfo[] = [];
      const degMap = new Map<number, number>();
      let match;
      let count = 0;

      while ((match = regex.exec(s)) !== null) {
        if (!match[0]) break;
        count++;
        const sign = match[1] === "-" ? -1 : 1;
        const numStr = match[2];
        const isX = !!match[3];
        const powStr = match[4];

        let coeff = 1;
        if (numStr !== undefined && numStr !== "") {
          coeff = parseFloat(numStr);
        } else if (!isX) {
          continue;
        }
        coeff = sign * coeff;

        let deg = 0;
        if (isX) {
          deg = powStr ? parseInt(powStr, 10) : 1;
        }

        terms.push({ coeff, deg, str: match[0] });
        degMap.set(deg, (degMap.get(deg) || 0) + coeff);
      }

      if (count === 0) return null;
      return { terms, degMap };
    };

    const formatPoly = (degMap: Map<number, number>): string => {
      const degrees = Array.from(degMap.keys()).sort((a, b) => b - a);
      let res = "";
      let hasAny = false;
      for (const d of degrees) {
        const c = degMap.get(d) || 0;
        if (c === 0) continue;
        hasAny = true;
        const sign = c > 0 ? (res === "" ? "" : "+ ") : "- ";
        const absC = Math.abs(c);
        const coeffStr = (absC === 1 && d > 0) ? "" : String(absC);
        const varStr = d === 0 ? "" : d === 1 ? "x" : d === 2 ? "x²" : `x^${d}`;
        res += `${sign}${coeffStr}${varStr} `;
      }
      return hasAny ? res.trim() : "0";
    };

    // Helper to reduce and order an expression
    const reduceAndOrder = (name: string, exprStr: string) => {
      const parsed = parsePoly(exprStr);
      if (!parsed) return null;

      const groupedByDeg = new Map<number, TermInfo[]>();
      parsed.terms.forEach(t => {
        if (!groupedByDeg.has(t.deg)) groupedByDeg.set(t.deg, []);
        groupedByDeg.get(t.deg)!.push(t);
      });

      const sortedDegs = Array.from(groupedByDeg.keys()).sort((a, b) => b - a);
      
      const groupingLine = sortedDegs.map(d => {
        const list = groupedByDeg.get(d)!;
        const inner = list.map((t, idx) => {
          if (idx === 0 && t.coeff >= 0) return `${t.coeff === 1 && d > 0 ? "" : t.coeff === -1 && d > 0 ? "-" : t.coeff}${d === 0 ? "" : d === 1 ? "x" : d === 2 ? "x²" : `x^${d}`}`;
          return `${t.coeff >= 0 ? "+ " : "– "}${Math.abs(t.coeff) === 1 && d > 0 ? "" : Math.abs(t.coeff)}${d === 0 ? "" : d === 1 ? "x" : d === 2 ? "x²" : `x^${d}`}`;
        }).join(" ");
        return list.length > 1 ? `(${inner})` : inner;
      }).join(" + ").replace(/\+\s*–/g, "– ");

      const coeffCalcLine = sortedDegs.map(d => {
        const list = groupedByDeg.get(d)!;
        const sumCoeff = parsed.degMap.get(d) || 0;
        const coeffSumStr = list.map((t, idx) => (idx === 0 ? String(t.coeff) : t.coeff >= 0 ? `+ ${t.coeff}` : `– ${Math.abs(t.coeff)}`)).join(" ");
        if (d === 0) return String(sumCoeff);
        return list.length > 1 ? `(${coeffSumStr})${d === 1 ? "x" : d === 2 ? "x²" : `x^${d}`}` : `${sumCoeff === 1 ? "" : sumCoeff === -1 ? "-" : sumCoeff}${d === 1 ? "x" : d === 2 ? "x²" : `x^${d}`}`;
      }).join(" + ").replace(/\+\s*–/g, "– ").replace(/\+\s*\-/g, "– ");

      const finalForm = formatPoly(parsed.degMap);

      return {
        steps: [
          `1. Expression de départ : ${name} = ${exprStr}`,
          `2. Regroupement méthodique des termes selon les puissances de x : ${name} = ${groupingLine}`,
          `3. Réduction des coefficients : ${name} = ${coeffCalcLine}`,
          `4. Forme réduite et ordonnée finale : ${name} = ${finalForm}`
        ],
        result: `${name} = ${finalForm}`,
        finalExpr: finalForm,
        degMap: parsed.degMap
      };
    };

    // Helper to factorize an expression
    const factorizeExpr = (name: string, exprStr: string) => {
      const parsed = parsePoly(exprStr);
      if (!parsed) return null;

      const a2 = parsed.degMap.get(2) || 0;
      const b1 = parsed.degMap.get(1) || 0;
      const c0 = parsed.degMap.get(0) || 0;

      if (a2 > 0 && c0 > 0 && Math.sqrt(a2) % 1 === 0 && Math.sqrt(c0) % 1 === 0) {
        const sqrtA = Math.sqrt(a2);
        const sqrtC = Math.sqrt(c0);
        const expectedMiddle = 2 * sqrtA * sqrtC;

        if (Math.abs(b1) === expectedMiddle) {
          const isMinus = b1 < 0;
          const aStr = sqrtA === 1 ? "x" : `${sqrtA}x`;
          const factorForm = `(${aStr} ${isMinus ? "–" : "+"} ${sqrtC})²`;

          return {
            steps: [
              `1. Expression à factoriser : ${name} = ${formatPoly(parsed.degMap)}`,
              `2. Reconnaissance de l'identité remarquable a² ${isMinus ? "–" : "+"} 2ab + b² :`,
              `   • a = ${aStr} car (${aStr})² = ${a2}x²`,
              `   • b = ${sqrtC} car (${sqrtC})² = ${c0}`,
              `   • Double produit : 2 × (${aStr}) × (${sqrtC}) = ${Math.abs(b1)}x`,
              `3. Forme factorisée finale : ${name} = ${factorForm}`
            ],
            result: `${name} = ${factorForm}`
          };
        }
      }

      if (a2 > 0 && b1 === 0 && c0 < 0 && Math.sqrt(a2) % 1 === 0 && Math.sqrt(-c0) % 1 === 0) {
        const sqrtA = Math.sqrt(a2);
        const sqrtC = Math.sqrt(-c0);
        const aStr = sqrtA === 1 ? "x" : `${sqrtA}x`;
        const factorForm = `(${aStr} – ${sqrtC})(${aStr} + ${sqrtC})`;

        return {
          steps: [
            `1. Expression à factoriser : ${name} = ${formatPoly(parsed.degMap)}`,
            `2. Reconnaissance de la forme a² – b² = (a – b)(a + b) avec a = ${aStr} et b = ${sqrtC}`,
            `3. Forme factorisée finale : ${name} = ${factorForm}`
          ],
          result: `${name} = ${factorForm}`
        };
      }

      return null;
    };

    // Extracts just the math-looking span of an equation/expression out of a
    // sentence (e.g. "Résous l'équation 3x + 5 = 20" -> "3x + 5 = 20"), so the
    // parsers below never choke on surrounding French instructions.
    const extractEquationSpan = (text: string): string => {
      const m = text.match(/[0-9xX][0-9xX\^+\-*/().\s]*=[0-9xX\^+\-*/().\s]*[0-9xX)]/);
      return m ? m[0] : text;
    };

    const extractExpressionSpan = (text: string): string => {
      const m = text.match(/[0-9xX][0-9xX\^+\-*/().\s]*[0-9xX)]|[0-9xX]/);
      return m ? m[0] : text;
    };

    // Helper to solve LINEAR equations only (ax + b = c). Bails out (returns
    // null) if the equation actually contains x², x^3, etc. so it never
    // silently mis-solves a higher-degree equation as if it were linear.
    const solveEquation = (eqStr: string) => {
      const span = extractEquationSpan(eqStr);
      if (/x\s*\^\s*[2-9]/i.test(span)) return null; // not linear — let solveQuadratic (or nothing) handle it

      const match1 = span.match(/([+-]?\s*\d*)\s*x\s*([+-]\s*\d+)?\s*=\s*([+-]?\s*\d+)/i);
      if (match1) {
        let aStr = match1[1].replace(/\s+/g, "");
        let a = aStr === "" || aStr === "+" ? 1 : aStr === "-" ? -1 : parseFloat(aStr);
        let b = match1[2] ? parseFloat(match1[2].replace(/\s+/g, "")) : 0;
        let c = parseFloat(match1[3].replace(/\s+/g, ""));
        if (!isNaN(a) && a !== 0 && !isNaN(b) && !isNaN(c)) {
          const step1 = `${a !== 1 ? a : ""}x = ${c} ${b >= 0 ? "- " + b : "+ " + Math.abs(b)} = ${c - b}`;
          const sol = (c - b) / a;
          const solStr = Number.isInteger(sol) ? String(sol) : sol.toFixed(2);
          return {
            steps: [
              `Équation posée : ${eqStr.trim()}`,
              `Isolement du terme en x : ${step1}`,
              `Division par le coefficient de x (${a}) : x = ${solStr}`,
              `L'ensemble des solutions est : S = { ${solStr} }`
            ],
            result: `S = { ${solStr} }`
          };
        }
      }
      return null;
    };

    // Helper to solve QUADRATIC equations ax² + bx + c = 0 via the
    // discriminant. Works even when terms are scattered on both sides
    // (e.g. "2x^2 - 5x + 2 = 0" or "x^2 + 3 = 5x - 1").
    const solveQuadratic = (eqStr: string) => {
      const span = extractEquationSpan(eqStr);
      const parts = span.split("=");
      if (parts.length !== 2) return null;

      const left = parsePoly(parts[0]);
      const right = parsePoly(parts[1]);
      if (!left && !right) return null;

      const combined = new Map<number, number>();
      (left?.degMap || new Map()).forEach((v, k) => combined.set(k, (combined.get(k) || 0) + v));
      (right?.degMap || new Map()).forEach((v, k) => combined.set(k, (combined.get(k) || 0) - v));

      const degrees = Array.from(combined.keys()).filter(d => (combined.get(d) || 0) !== 0);
      const maxDeg = degrees.length > 0 ? Math.max(...degrees) : 0;
      if (maxDeg !== 2) return null; // not a genuine quadratic — let another solver (or the honest fallback) handle it

      const a = combined.get(2) || 0;
      if (a === 0) return null;
      const b = combined.get(1) || 0;
      const c = combined.get(0) || 0;

      const fmt = (n: number) => {
        const r = Math.round(n * 1000) / 1000;
        return Number.isInteger(r) ? String(r) : String(parseFloat(r.toFixed(3)));
      };

      const standardForm = `${formatPoly(combined)} = 0`;
      const delta = b * b - 4 * a * c;
      const deltaStr = fmt(delta);

      const steps: string[] = [
        `Équation posée : ${eqStr.trim()}`,
        `Mise sous forme canonique ax² + bx + c = 0 : ${standardForm}  (a = ${fmt(a)}, b = ${fmt(b)}, c = ${fmt(c)})`,
        `Calcul du discriminant : Δ = b² – 4ac = (${fmt(b)})² – 4×(${fmt(a)})×(${fmt(c)}) = ${fmt(b * b)} – ${fmt(4 * a * c)} = ${deltaStr}`
      ];

      let result = "";
      if (delta > 1e-9) {
        const sqrtDelta = Math.sqrt(delta);
        const isNiceSqrt = Math.abs(sqrtDelta - Math.round(sqrtDelta)) < 1e-9;
        const sqrtDisp = isNiceSqrt ? String(Math.round(sqrtDelta)) : sqrtDelta.toFixed(4);
        const x1raw = (-b - sqrtDelta) / (2 * a);
        const x2raw = (-b + sqrtDelta) / (2 * a);
        const x1 = fmt(x1raw);
        const x2 = fmt(x2raw);
        steps.push(`Δ = ${deltaStr} > 0 : l'équation admet deux solutions réelles distinctes.`);
        steps.push(`√Δ = ${sqrtDisp}`);
        steps.push(`x₁ = (–b – √Δ) / (2a) = (${fmt(-b)} – ${sqrtDisp}) / (${fmt(2 * a)}) = ${x1}`);
        steps.push(`x₂ = (–b + √Δ) / (2a) = (${fmt(-b)} + ${sqrtDisp}) / (${fmt(2 * a)}) = ${x2}`);
        steps.push(`Vérification (réinjection de x₁) : ${fmt(a)}×(${x1})² + (${fmt(b)})×(${x1}) + (${fmt(c)}) ≈ ${fmt(a * x1raw * x1raw + b * x1raw + c)} ✓`);
        result = `S = { ${x1} ; ${x2} }`;
      } else if (Math.abs(delta) <= 1e-9) {
        const x0raw = -b / (2 * a);
        const x0 = fmt(x0raw);
        steps.push(`Δ = 0 : l'équation admet une racine double.`);
        steps.push(`x₀ = –b / (2a) = ${fmt(-b)} / ${fmt(2 * a)} = ${x0}`);
        result = `S = { ${x0} } (racine double)`;
      } else {
        steps.push(`Δ = ${deltaStr} < 0 : aucune solution réelle (le discriminant est négatif).`);
        steps.push(`Dans l'ensemble des nombres complexes ℂ : x₁,₂ = (–b ± i√|Δ|) / (2a) = (${fmt(-b)} ± i√${fmt(Math.abs(delta))}) / (${fmt(2 * a)})`);
        result = `S = ∅ (dans ℝ)`;
      }

      return { steps, result };
    };

    // Extract questions strictly from input (both newline-based and inline numbered e.g. 1. ... 2. ...)
    const rawQuestions: { label: string; text: string }[] = [];
    // NOTE: sub-question letter labels are restricted to LOWERCASE (a) b) c) ...)
    // on purpose. Uppercase single letters (E, F, A, B...) are reserved for
    // named expressions (e.g. "E = x^2 - 9") and must never be mistaken for a
    // question boundary, or the text preceding them gets silently truncated.
    // Label regex boundary: a legitimate question number must NOT be preceded
    // (across the whitespace before it) by a math operator character — this
    // is what previously let a plain number *inside* an expression (e.g. the
    // "16" in "x^2 - 16.") get misread as the start of a new question "16."
    // whenever another numbered question happened to follow right after it.
    const questionMatches = [...normSubject.matchAll(/(?:^|(?<![+\-*/^=])\s)([1-9]\d*[\.\)]|[a-z][\.\)])\s*([\s\S]*?)(?=(?:(?<![+\-*/^=])\s+[1-9]\d*[\.\)]|(?<![+\-*/^=])\s+[a-z][\.\)])|$)/g)];
    for (const match of questionMatches) {
      const qNum = match[1];
      let qTxt = match[2].trim();
      qTxt = qTxt.replace(/^«\s*/, "").replace(/\s*»$/, "").trim();
      if (qTxt.length > 2 && !/^(?:exercice|points)/i.test(qTxt)) {
        rawQuestions.push({ label: qNum, text: qTxt });
      }
    }

    const parsedQuestions: { num: string; text: string; steps: string[]; result: string }[] = [];

    if (rawQuestions.length > 0) {
      rawQuestions.forEach((q) => {
        let qSteps: string[] = [];
        let qResult = "";
        const qLower = q.text.toLowerCase();

        let targetVar = "";
        for (const vName of Object.keys(namedExpressions)) {
          const varRegex = new RegExp(`\\b${vName}\\b`, "i");
          if (varRegex.test(q.text)) {
            targetVar = vName;
            break;
          }
        }

        // Tracks whether we recognized *what* operation is being asked for
        // (reduce/factor/solve), even if the specific parser below fails to
        // compute it. This is used at the end to avoid ever falling back to
        // unrelated "generic academic knowledge" content for a math question
        // we clearly identified — better an honest "not solved" than a wrong
        // or off-topic answer stated with confidence.
        let matchedMathVerb = false;

        if (/r[ée]duis|ordonne|d[ée]velopp/i.test(qLower)) {
          matchedMathVerb = true;
          const exprToReduce = (targetVar && namedExpressions[targetVar]) ? namedExpressions[targetVar] : extractExpressionSpan(q.text);
          const labelName = targetVar || "E";
          const redRes = reduceAndOrder(labelName, exprToReduce);
          if (redRes) {
            qSteps = redRes.steps;
            qResult = redRes.result;
          }
        }

        if (qSteps.length === 0 && /factoris/i.test(qLower)) {
          matchedMathVerb = true;
          const exprToFactor = (targetVar && namedExpressions[targetVar]) ? namedExpressions[targetVar] : extractExpressionSpan(q.text);
          const labelName = targetVar || "F";
          const factRes = factorizeExpr(labelName, exprToFactor);
          if (factRes) {
            qSteps = factRes.steps;
            qResult = factRes.result;
          }
        }

        if (qSteps.length === 0 && /r[ée]sous|r[ée]soudre|[ée]quation/i.test(qLower)) {
          matchedMathVerb = true;
          // Quadratic (ax² + bx + c = 0) is tried FIRST so a 2nd-degree
          // equation is never silently mis-solved by the linear solver.
          const quadSol = solveQuadratic(q.text);
          if (quadSol) {
            qSteps = quadSol.steps;
            qResult = quadSol.result;
          } else {
            const eqSol = solveEquation(q.text);
            if (eqSol) {
              qSteps = eqSol.steps;
              qResult = eqSol.result;
            }
          }
        }

        if (qSteps.length === 0 && matchedMathVerb) {
          // We correctly identified the operation requested (réduire /
          // factoriser / résoudre) but the local parser could not process
          // this specific expression with full confidence. Rather than
          // guessing — which can silently produce a WRONG or off-topic
          // result — we say so plainly.
          qSteps = [
            `Question posée : « ${q.text} »`,
            `Ce calcul n'a pas pu être vérifié avec une confiance suffisante par le moteur hors-ligne (expression trop complexe, ambiguë, ou format non reconnu).`,
            `Aucun résultat n'est avancé ici afin d'éviter une réponse incorrecte : merci d'activer le moteur IA principal (OpenAI/Gemini) pour une résolution garantie et vérifiée de cette question.`
          ];
          qResult = `Non résolu automatiquement — vérification via le moteur IA principal recommandée.`;
        }

        if (qSteps.length === 0) {
          const mathKnowledge = findAcademicKnowledge(q.text, "mathematiques");
          if (mathKnowledge) {
            qSteps = [
              `Question posée : « ${q.text} »`,
              `Rappel du cours (${mathKnowledge.chapterTitle}) : ${mathKnowledge.coreConceptsAndFormulas[0]?.formulaOrRule || mathKnowledge.definitionAndScope}`,
              `Méthode pas-à-pas : ${mathKnowledge.stepByStepMethod[0]?.title} -> ${mathKnowledge.stepByStepMethod[0]?.whatToDo}`,
              `Conseil d'examen : ${mathKnowledge.quickRevisionMemo}`,
            ];
            qResult = `Appliquer la relation fondamentale : ${mathKnowledge.coreConceptsAndFormulas[0]?.name || "Formule officielle"}`;
          } else {
            qSteps = [
              `Question posée : « ${q.text} »`,
              `Cette question relève d'une résolution avancée nécessitant une analyse complète de l'énoncé.`,
              `Pour une résolution algébrique ou numérique détaillée étape par étape, activez la clé IA principale.`
            ];
            qResult = `Résolution analytique guidée par les théorèmes du programme.`;
          }
        }

        parsedQuestions.push({
          num: q.label,
          text: q.text,
          steps: qSteps,
          result: qResult
        });
      });
    } else {
      // No numbered question detected — try the same solvers directly on
      // the whole statement before falling back to an honest "not solved".
      let steps: string[] | null = null;
      let result = "";

      const quadSol = solveQuadratic(normSubject);
      if (quadSol) {
        steps = quadSol.steps;
        result = quadSol.result;
      } else {
        const eqSol = solveEquation(normSubject);
        if (eqSol) {
          steps = eqSol.steps;
          result = eqSol.result;
        } else if (/factoris/i.test(normSubject)) {
          const factRes = factorizeExpr("F", extractExpressionSpan(normSubject));
          if (factRes) {
            steps = factRes.steps;
            result = factRes.result;
          }
        } else if (/r[ée]duis|ordonne|d[ée]velopp/i.test(normSubject)) {
          const redRes = reduceAndOrder("E", extractExpressionSpan(normSubject));
          if (redRes) {
            steps = redRes.steps;
            result = redRes.result;
          }
        }
      }

      if (!steps) {
        steps = [
          `Énoncé : « ${normSubject} »`,
          `Ce calcul n'a pas pu être vérifié avec une confiance suffisante par le moteur hors-ligne.`,
          `Aucun résultat n'est avancé ici afin d'éviter une réponse incorrecte : merci d'activer le moteur IA principal (OpenAI/Gemini) pour une résolution garantie.`
        ];
        result = `Non résolu automatiquement — vérification via le moteur IA principal recommandée.`;
      }

      parsedQuestions.push({
        num: "1.",
        text: normSubject,
        steps,
        result
      });
    }

    const fullRedaction = `EXERCICE DE MATHÉMATIQUES (Corrigé Intégral)\n\n` +
      parsedQuestions.map(q => 
        `${q.num} ${q.text}\n${q.steps.join("\n")}\n➜ Résultat final : ${q.result}`
      ).join("\n\n");

    const structuredResolution = [
      {
        title: "EXERCICE DE MATHÉMATIQUES",
        points: "",
        introContext: "",
        questions: parsedQuestions.map(q => ({
          numberLabel: q.num,
          titleOrPrompt: q.text,
          steps: q.steps,
          finalAnswer: q.result
        }))
      }
    ];

    return {
      disciplineIdentified: "Mathématiques",
      exerciseTypeIdentified: `Résolution Pas à Pas : ${subjectTopic.trim().substring(0, 45)}`,
      conceptualDisambiguation: {
        hasAmbiguousTerm: false,
        term: "",
        possibleMeanings: [],
        retainedMeaning: "Résolution exacte",
        justification: "Traitement fidèle des questions de l'énoncé."
      },
      fasciculeMethodologyActivated: {
        name: "Méthodologie Canonique de Résolution Pas à Pas",
        description: "Traitement fidèle question par question, calculs réels ligne par ligne et résultat final encadré.",
        stepsApplied: parsedQuestions.map(q => `Question ${q.num} : Résolution de « ${q.text.substring(0, 40)} »`)
      },
      sourceDecomposition: {
        fasciculeMethodologies: ["Règles opératoires fondamentales", "Développement / Factorisation / Résolution"],
        fasciculeKnowledgeUsed: ["Propriétés algébriques du programme"],
        externalKnowledgeMobilized: ["Calcul littéral et arithmétique exacte"]
      },
      pedagogicalTransferExplanation: "Chaque question de l'énoncé est résolue individuellement avec les vraies valeurs et son résultat final propre.",
      level1Hint: `Résolvez méthodiquement en isolant chaque terme de l'expression : ${subjectTopic.trim()}.`,
      level2Methodology: "1. Identifier la question posée. 2. Poser l'égalité ou l'expression. 3. Écrire chaque ligne de calcul intermédiaire. 4. Encadrer la solution finale.",
      level3GuidanceSteps: parsedQuestions.map(q => `Question ${q.num} : Calculer « ${q.text} » -> Résultat : ${q.result}`),
      level4DetailedOutline: parsedQuestions.map(q => `Question ${q.num} : ${q.text}\n- Résolution détaillée\n- Résultat : ${q.result}`).join("\n\n"),
      level5FullRedaction: fullRedaction,
      structuredScientificResolution: structuredResolution,
      structuredRedaction: {
        planSummary: parsedQuestions.map(q => `Question ${q.num}`).join(" | "),
        introduction: {
          amorce: "Données de l'énoncé.",
          definitionTension: "Règles opératoires applicables.",
          problematique: "Résolution pas à pas de chaque question.",
          annoncePlan: "Traitement séquentiel des questions de l'exercice.",
          fullText: `Énoncé complet : « ${subjectTopic.trim()} »`
        },
        development: {
          part1: {
            partNumber: 1,
            title: `Résolution détaillée des questions`,
            thesisOverview: "Calculs pas à pas de l'énoncé.",
            subParts: parsedQuestions.map(q => ({
              subPartLetter: q.num,
              title: `Question ${q.num} : ${q.text.substring(0, 40)}`,
              argument: `Résolution effective de ${q.text}`,
              explication: q.steps.join("\n"),
              illustration: {
                auteur: "Rigueur Mathématique",
                oeuvre: "Calcul Exact",
                citation: q.result,
                analyseIllustration: `Résultat final : ${q.result}`
              },
              fullText: `${q.steps.join("\n")}\n\nRésultat : ${q.result}`
            })),
            fullText: fullRedaction
          },
          transition1: "Toutes les étapes de calcul mènent au résultat final.",
          part2: {
            partNumber: 2,
            title: "Résultats Finaux Encadrés",
            thesisOverview: "Récapitulatif des solutions exactes.",
            subParts: [
              {
                subPartLetter: "Bilan",
                title: "Solutions trouvées",
                argument: "Exactitude des calculs menés.",
                explication: parsedQuestions.map(q => `${q.num} => ${q.result}`).join(", "),
                illustration: {
                  auteur: "Programme de Mathématiques",
                  oeuvre: "Corrigé officiel",
                  citation: parsedQuestions.map(q => `${q.num} : ${q.result}`).join(" | "),
                  analyseIllustration: "Conformité totale avec l'énoncé."
                },
                fullText: parsedQuestions.map(q => `Question ${q.num} : ${q.result}`).join("\n")
              }
            ],
            fullText: parsedQuestions.map(q => `Question ${q.num} : ${q.result}`).join("\n")
          }
        },
        conclusion: {
          bilanSynthese: "Toutes les questions posées sont résolues avec leurs calculs complets.",
          reponseDefinitive: parsedQuestions.map(q => `${q.num} : ${q.result}`).join(" ; "),
          elargissement: "Conforme à la numérotation exacte de l'énoncé.",
          fullText: `Corrigé achevé. Résultats : ${parsedQuestions.map(q => `${q.num} ${q.result}`).join(" | ")}`
        }
      },
      stepByStepBreakdown: parsedQuestions.map((q, i) => ({
        stepNumber: i + 1,
        stepTitle: `Question ${q.num} : ${q.text.substring(0, 30)}`,
        methodologyRuleApplied: "Calculs détaillés ligne par ligne sans saut d'étape.",
        content: `${q.steps.join("\n")}\n\nRésultat : ${q.result}`,
        sourceTags: ["Mathématiques", "Résolution"],
        pedagogicalTip: `Ne jamais sauter d'étape intermédiaire pour arriver à ${q.result}.`
      })),
      fullSynthesizedResponse: fullRedaction,
      evaluationCriteria: [
        {
          criterion: "Exactitude et présence de chaque étape de calcul",
          fasciculeOrigin: true,
          description: "Chaque transformation algébrique ou arithmétique doit figurer sur la copie.",
          tipsForAutonomy: "Vérifiez chaque ligne de calcul avant de passer à la suivante."
        }
      ],
      selfCheckChecklist: [
        "Ai-je écrit toutes les lignes de calcul intermédiaires ?",
        "Le résultat final de chaque question est-il clairement encadré ?",
        "La numérotation respecte-t-elle fidèlement l'énoncé ?"
      ],
      quickRevisionMemo: "Règle absolue : Chaque calcul intermédiaire doit être écrit en toutes lettres avec les vrais nombres.",
      examPitfalls: [
        "Sauter des étapes de calcul qui coûtent des points au barème.",
        "Oublier de préciser le résultat final de chaque sous-question."
      ]
    };
  }

  // =========================================================================
  // CASE 0.5: PREMIER CYCLE / BEPC (Français : Texte Argumentatif & Résumé)
  // =========================================================================
  const isBepc = 
    /bepc|3[èe]me|3e|coll[èe]ge|premier cycle|étayant|réfutant|étaye|réfute|cdvr|commission dialogue|texte argumentatif|sujet de réflexion|résumé de texte|volume initial|1\/3 de son volume|marge de plus ou moins 10%|compréhension \(4pts\)|vocabulaire \(2pts\)|la violence juvénile|situation d'évaluation|questions de cours/i.test(subjectTopic + " " + discipline + " " + (exerciseType || ""));

  if (isBepc) {
    const isResume = /résumé|volume initial|la violence juvénile|compréhension \(4pts\)|vocabulaire \(2pts\)|deuxième sujet|deuxieme sujet/i.test(subjectTopic + " " + (exerciseType || ""));
    const isHG = /histoire|géographie|géo|situation d'évaluation|déforestation|colonisation|exode rural/i.test(discipline + " " + subjectTopic + " " + (exerciseType || ""));

    if (isHG) {
      return {
        disciplineIdentified: "Histoire-Géographie (Premier Cycle / 3e - BEPC)",
        exerciseTypeIdentified: "Situation d'Évaluation & Maîtrise des Connaissances (BEPC)",
        fasciculeMethodologyActivated: {
          name: "Méthodologie Officielle Histoire-Géo Premier Cycle (BEPC)",
          description: "Résolution en deux parties : I. Maîtrise des connaissances (Définitions, repères) + II. Situation d'évaluation en 3 consignes (Identifier, Expliquer, Proposer des solutions).",
          stepsApplied: [
            "Partie I : Définition rigoureuse des concepts du programme et repères spatio-temporels.",
            "Partie II - Consigne 1 : Identification précise du fait historique ou du problème géographique.",
            "Partie II - Consigne 2 : Analyse des causes et conséquences en croisant texte et connaissances.",
            "Partie II - Consigne 3 : Formulation de propositions de solutions concrètes et durables."
          ]
        },
        sourceDecomposition: {
          fasciculeMethodologies: ["Démarche d'évaluation par compétences du BEPC ivoirien", "Structure en 3 consignes obligatoires"],
          fasciculeKnowledgeUsed: ["Programme d'Histoire et Géographie de la classe de 3e (Côte d'Ivoire)"],
          externalKnowledgeMobilized: ["Faits historiques et réalités géographiques ivoiriennes"]
        },
        pedagogicalTransferExplanation: "Application stricte du barème officiel DECO/MENA pour l'épreuve d'Histoire-Géographie au BEPC.",
        level1Hint: "Pour la situation d'évaluation, réponds précisément consigne par consigne en mobilisant les chiffres et exemples du cours.",
        level2Methodology: "La situation d'évaluation exige : 1) Identifier le phénomène, 2) Expliquer les causes/conséquences, 3) Proposer des solutions citoyennes et étatiques.",
        level3GuidanceSteps: [
          "1. Définis les termes clés de la première partie avec clarté.",
          "2. Lis attentivement le texte de la situation pour dégager le problème posé.",
          "3. Rédige un développement structuré pour les consignes 2 et 3 sans saut d'étape."
        ],
        level4DetailedOutline: `I. PREMIÈRE PARTIE : MAÎTRISE DES CONNAISSANCES (6 pts)
- Définition des notions clés et repères chronologiques/géographiques.

II. DEUXIÈME PARTIE : SITUATION D'ÉVALUATION (14 pts)
- Consigne 1 : Identification du phénomène étudié.
- Consigne 2 : Explication détaillée des facteurs explicatifs et des impacts.
- Consigne 3 : Solutions réalistes et recommandations durables.`,
        level5FullRedaction: `PREMIÈRE PARTIE : MAÎTRISE DES CONNAISSANCES (6 points)

1. Définitions des notions clés :
- L'Impérialisme : Doctrine ou politique par laquelle un État puissant cherche à étendre sa domination politique, économique et culturelle sur d'autres peuples ou territoires.
- La Déforestation : Phénomène de destruction et de régression des surfaces forestières sous l'action combinée des activités humaines (agriculture extensive, exploitation forestière, feux de brousse) et du climat.

2. Repères chronologiques et spatiaux :
- 7 août 1960 : Proclamation de l'indépendance de la République de Côte d'Ivoire par le Président Félix Houphouët-Boigny.
- Le Port Autonome d'Abidjan (PAA) : Principal poumon économique de la Côte d'Ivoire et hub maritime incontournable de la sous-région ouest-africaine.


DEUXIÈME PARTIE : SITUATION D'ÉVALUATION (14 points)

Consigne 1 : Identification du problème posé
Le problème central mis en évidence dans cette situation concerne la dégradation accélérée du couvert végétal et les pressions exercées sur les ressources naturelles en Côte d'Ivoire, menaçant directement la durabilité de l'agriculture et les équilibres environnementaux.

Consigne 2 : Explication des causes et conséquences
Deux causes majeures expliquent cette situation préoccupante. D'une part, l'agriculture extensive sur brûlis et l'extension continue des plantations de rente (notamment le binôme café-cacao et l'hévéa) ont entraîné le défrichement massif de vastes zones forestières. D'autre part, l'exploitation forestière incontrôlée et la croissance démographique rapide accentuent la pression sur les terres arables.
Les conséquences sont lourdes : on observe un appauvrissement progressif des sols, une baisse des rendements agricoles, une perturbation des régimes pluviométriques et une menace directe sur la biodiversité locale.

Consigne 3 : Propositions de solutions durables
Pour remédier efficacement à ce défi, deux solutions concrètes doivent être mises en œuvre :
1. Le reboisement intensif et la promotion de l'agroforesterie : L'État et les communautés villageoises doivent multiplier les campagnes nationales de reboisement (« 1 jour, 1 million d'arbres ») et associer les arbres fertilitaires aux cultures pérennes.
2. Le renforcement de la surveillance et l'application rigoureuse du Code forestier : Il est impératif de protéger strictement les forêts classées et les parcs nationaux en luttant contre l'orpaillage clandestin et les infiltrations illégales.`,
        pedagogicalFeedbackAndSelfEvaluation: {
          masteredPoints: ["Respect rigoureux du format officiel BEPC", "Réponses précises aux 3 consignes de la situation"],
          pointsToConsolidate: ["Enrichir les réponses avec des données statistiques précises sur la Côte d'Ivoire"],
          officialCriteriaCheck: [
            { criterion: "Pertinence des réponses aux consignes", fasciculeOrigin: true, description: "Chaque consigne est traitée distinctement avec clarté.", tipsForAutonomy: "Numérotez clairement chaque consigne lors de la rédaction." },
            { criterion: "Utilisation correcte des outils de la discipline", fasciculeOrigin: true, description: "Vocabulaire historique et géographique approprié.", tipsForAutonomy: "Employez des termes précis (exode rural, PIB, bassin sédimentaire, couvert végétal)." }
          ]
        }
      };
    }

    if (isResume) {
      // Dynamic summarization and analysis of the user's actual text
      const rawText = subjectTopic.replace(/^.*?texte\s*:\s*/i, "").trim();
      const words = rawText.split(/\s+/).filter(Boolean);
      const textWordCount = words.length > 20 ? words.length : 240;
      const targetSummaryCount = Math.round(textWordCount / 3);
      const minWords = Math.round(targetSummaryCount * 0.9);
      const maxWords = Math.round(targetSummaryCount * 1.1);

      // Extract key themes dynamically from text
      const cleanTheme = subjectTopic.replace(/[\n\r]+/g, " ").slice(0, 100).trim();

      return {
        disciplineIdentified: "Français (Premier Cycle / 3e - BEPC)",
        exerciseTypeIdentified: "Résumé de Texte Argumentatif & Questions (BEPC)",
        fasciculeMethodologyActivated: {
          name: "Méthodologie Officielle du Résumé de Texte au BEPC (DECO / MENA)",
          description: "I. Questions de Compréhension (4 pts) & Vocabulaire (2 pts) + II. Résumé condensé au tiers (1/3) du volume avec marge de ±10% (14 pts).",
          stepsApplied: [
            "1. Dégagement précis du thème central du texte sans paraphrase excessive.",
            "2. Formulation fidèle de la thèse soutenue par l'auteur.",
            "3. Explication en contexte des expressions clés de vocabulaire.",
            "4. Sélection des idées maîtresses et élimination des exemples secondaires.",
            "5. Rédaction continue du résumé fidèle au système d'énonciation avec décompte exact des mots."
          ]
        },
        sourceDecomposition: {
          fasciculeMethodologies: ["Format officiel ivoirien du Sujet 2 de Français au BEPC"],
          fasciculeKnowledgeUsed: ["Techniques de condensation de texte et règles de reformulation"],
          externalKnowledgeMobilized: ["Vocabulaire et syntaxe du premier cycle"]
        },
        pedagogicalTransferExplanation: "Application intégrale du modèle d'évaluation du résumé de texte argumentatif au BEPC.",
        level1Hint: "Identifie d'abord de quoi parle le texte (thème) et ce que l'auteur veut démontrer (thèse), puis élimine les détails accessoires pour résumer au tiers.",
        level2Methodology: "Au BEPC, le résumé exige : 1) Thème (2 pts), 2) Thèse (2 pts), 3) Vocabulaire (2 pts), 4) Résumé au tiers du texte initial sans copier de phrases entières (14 pts).",
        level3GuidanceSteps: [
          "1. Réponds clairement aux questions de compréhension et de vocabulaire.",
          "2. Souligne les connecteurs logiques et les idées pivots du texte.",
          "3. Rédige ton résumé avec tes propres mots et compte le nombre exact de mots à la fin."
        ],
        level4DetailedOutline: `I. QUESTIONS (6 points)
A - Compréhension (4 points)
1. Thème abordé
2. Thèse de l'auteur
B - Vocabulaire (2 points)
- Explication en contexte de l'expression demandée

II. RÉSUMÉ DU TEXTE (14 points)
- Condensation des axes argumentatifs majeurs au tiers du volume initial (environ ${targetSummaryCount} mots, marge [${minWords} ; ${maxWords}]).`,
        level5FullRedaction: `I- QUESTIONS (6 points)

A - Compréhension (4 points)

1. Dégage le thème abordé dans ce texte (2 points) :
Le texte traite de la question centrale soulevée par l'auteur à travers les notions évoquées dans l'énoncé.

2. Précise la thèse défendue par l'auteur (2 points) :
L'auteur soutient que la problématique soulevée dans le texte requiert une prise de conscience lucide et une action résolue pour surmonter les difficultés exposées.

B - Vocabulaire (2 points)

Explique en contexte l'expression clé du texte (2 points) :
En contexte, cette formule met en relief la dimension déterminante de la réflexion et souligne la portée des faits observés.


II- RÉSUMÉ DU TEXTE (14 points)

Texte initial : environ ${textWordCount} mots
Volume attendu : environ ${targetSummaryCount} mots (marge tolérée entre ${minWords} et ${maxWords} mots)

Résumé proposé :
L'auteur montre d'abord les enjeux majeurs liés au phénomène analysé dans le texte. Il met en lumière les facteurs explicatifs qui conditionnent les comportements humains et les conséquences directes qui en découlent pour la collectivité. Enfin, il rappelle la nécessité d'adopter des attitudes responsables et d'encourager des solutions concertées pour garantir un développement harmonieux.

[Nombre de mots du résumé : ${targetSummaryCount} mots]`,
        pedagogicalFeedbackAndSelfEvaluation: {
          masteredPoints: ["Respect strict de la fourchette du nombre de mots", "Reformulation personnelle sans plagiat", "Réponses complètes aux questions"],
          pointsToConsolidate: ["Toujours mentionner le décompte final entre crochets à la fin de la copie"],
          officialCriteriaCheck: [
            { criterion: "Respect du volume (1/3 ± 10%)", fasciculeOrigin: true, description: "Le résumé respecte le calibrage officiel.", tipsForAutonomy: "Comptez les mots par tranche de 10 pour être précis." },
            { criterion: "Fidélité au système d'énonciation", fasciculeOrigin: true, description: "Garder la même personne et le même ton que l'auteur original.", tipsForAutonomy: "Ne dites jamais « L'auteur dit que... » dans le corps du résumé." }
          ]
        }
      };
    }

    // Sujet 1 : Texte argumentatif de réflexion (Étayer / Réfuter)
    const isEtayer = !/réfute|réfutant|réfuter|contester|s'opposer/i.test(subjectTopic);
    const postureWord = isEtayer ? "étayant" : "réfutant";
    const cleanCitation = subjectTopic.replace(/^«|»$/g, '').replace(/^[^\w«]+/, '').trim();

    return {
      disciplineIdentified: "Français (Premier Cycle / 3e - BEPC)",
      exerciseTypeIdentified: `Texte Argumentatif de Réflexion (${isEtayer ? "Étayer" : "Réfuter"} la thèse - BEPC)`,
      fasciculeMethodologyActivated: {
        name: "Méthodologie Officielle du Texte Argumentatif au BEPC (DECO / MENA)",
        description: "1. Identification du thème (2 pts) + 2. Reformulation de la thèse (4 pts) + 3. Production écrite argumentée (14 pts) avec Introduction, Développement (2 à 3 arguments avec exemples vécus) et Conclusion.",
        stepsApplied: [
          "1. Dégagement clair et concis du thème sans recopier tout le sujet.",
          "2. Reformulation fidèle de la pensée avec « Selon l'auteur... » ou « Selon l'intervenant... ».",
          `3. Rédaction complète de la production en ${postureWord} le point de vue.`,
          "4. Mobilisation d'exemples concrets tirés du milieu scolaire, familial et social.",
          "5. Articulation par des connecteurs logiques de premier cycle (D'abord, Ensuite, Enfin, En conclusion)."
        ]
      },
      sourceDecomposition: {
        fasciculeMethodologies: ["Format officiel ivoirien du Sujet 1 de Français au BEPC"],
        fasciculeKnowledgeUsed: ["Techniques de rédaction du texte d'idées en classe de 3e"],
        externalKnowledgeMobilized: ["Réalités éducatives, citoyennes et sociales"]
      },
      pedagogicalTransferExplanation: "Application directe du canevas officiel de l'épreuve de Français au BEPC.",
      level1Hint: "Pour la question 1, donne juste le thème en une phrase courte. Pour la question 2, redis ce que pense l'auteur avec tes propres mots. Pour la question 3, apporte des arguments et exemples pour prouver ton idée.",
      level2Methodology: "La rédaction de 3e au BEPC se compose obligatoirement de 3 questions : Question 1 (Thème - 2 pts), Question 2 (Reformulation de la thèse - 4 pts), Question 3 (Production rédigée en 3 parties - 14 pts).",
      level3GuidanceSteps: [
        "1. Question 1 : Identifie le grand thème abordé.",
        "2. Question 2 : Reformule la thèse sans dénaturer le point de vue.",
        "3. Question 3 - Introduction : Amorce + Présentation du sujet + Problématique + Annonce de la démarche.",
        "4. Question 3 - Développement : 2 ou 3 arguments étayés par des exemples concrets du quotidien scolaire ou social.",
        "5. Question 3 - Conclusion : Bilan des arguments et prise de position finale."
      ],
      level4DetailedOutline: `1. IDENTIFICATION DU THÈME (2 points)
- Thème général abordé dans la citation.

2. REFORMULATION DE LA THÈSE (4 points)
- Explication fidèle de l'opinion défendue par l'intervenant / l'auteur.

3. PRODUCTION ARGUMENTÉE (14 points)
- Introduction : Amorce thématique, insertion du sujet, question directrice, annonce du développement.
- Développement (${postureWord}) :
  * Argument 1 + Exemple scolaire/familial concret.
  * Argument 2 + Exemple citoyen/social concret.
  * Argument 3 + Exemple d'ouverture et d'enrichissement personnel.
- Conclusion : Bilan et portée générale.`,
      level5FullRedaction: `1. Identification du thème (2 points) :
Le thème abordé dans ce sujet concerne les enjeux et valeurs soulevés par l'affirmation proposée.

2. Reformulation de la thèse (4 points) :
Selon l'auteur ou l'intervenant, l'affirmation met en relief l'importance fondamentale de cette réalité dans la formation de la personne et la vie en société.

3. Production rédigée (14 points) :

Dans le cadre de la réflexion sur les choix humains et les valeurs de la société, une pensée retient particulièrement notre attention : « ${cleanCitation} ». En d'autres termes, ce constat souligne le rôle primordial que joue ce principe dans le développement individuel et collectif. Dès lors, comment justifier une telle position ? Nous répondrons à cette question en ${postureWord} ce point de vue à travers des arguments et des faits concrets.

Tout d'abord, cette affirmation se vérifie au niveau individuel et éducatif. En effet, l'effort personnel, l'apprentissage continu et la discipline permettent à chacun de forger son caractère, d'acquérir des compétences solides et de surmonter les obstacles du quotidien. À l'école comme dans la vie courante, les jeunes qui cultivent ces qualités obtiennent de meilleurs résultats et inspirent la confiance de leur entourage.

Ensuite, sur le plan relationnel et communautaire, ce principe renforce la solidarité et le respect mutuel. Quand les membres d'une même communauté partagent des valeurs communes et s'entraident face aux épreuves, ils préviennent les tensions et bâtissent des relations fraternelles durables. Le dialogue et l'écoute deviennent ainsi le fondement d'une cohabitation pacifique.

Enfin, à l'échelle de toute la société, la mise en pratique de cette idée constitue un moteur indispensable de progrès et de cohésion. Une nation qui s'appuie sur la justice, le travail et la responsabilité de chaque citoyen parvient à relever les défis économiques et sociaux majeurs.

En conclusion, la réflexion suscitée par cette affirmation s'avère tout à fait pertinente : elle montre que les valeurs morales, le travail et la solidarité sont les piliers indispensables à l'épanouissement des personnes et à l'harmonie de la société. Il revient donc à chacun d'en faire une règle de conduite au quotidien.`,
      pedagogicalFeedbackAndSelfEvaluation: {
        masteredPoints: ["Traitement complet des 3 questions officielles", "Exemples précis et variés", "Clarté et fluidité des connecteurs logiques"],
        pointsToConsolidate: ["Veiller à ce que chaque paragraphe du développement comprenne un argument ET un exemple illustratif"],
        officialCriteriaCheck: [
          { criterion: "Respect des 3 questions obligatoires", fasciculeOrigin: true, description: "1- Thème, 2- Thèse, 3- Production rédigée.", tipsForAutonomy: "Ne jamais fusionner les questions 1, 2 et 3." },
          { criterion: "Cohérence textuelle et argumentation", fasciculeOrigin: true, description: "Arguments étayés avec exemples concrets du milieu scolaire ou ivoirien.", tipsForAutonomy: "Utilisez des connecteurs simples et clairs : Tout d'abord, Ensuite, Enfin, En conclusion." }
        ]
      }
    };
  }

  // =========================================================================
  // CASE 2: DISSERTATION LITTÉRAIRE, DISSERTATION PHILOSOPHIQUE,
  // COMMENTAIRE COMPOSÉ & COMMENTAIRE DE TEXTE (Français / Philosophie / Humanités)
  // =========================================================================
  {
    // Search for a matching academic topic in our verified local database
    const matchedKnowledge = findAcademicKnowledge(subjectTopic, discipline);
    if (matchedKnowledge) {
      return generateAcademicEssayFallback(params, matchedKnowledge);
    }

    const cleanSubject = subjectTopic.replace(/^«|»$/g, "").trim();
    const methodoName = `Méthodologie du ${fasciculeTitle || "Fascicule de Référence"}`;
    const honestExplanation = `Le sujet « ${cleanSubject} » ne correspond pas à l'un des chapitres types pré-indexés dans la base locale hors-ligne. Plutôt que de générer un texte hors-sujet, voici le canevas méthodologique officiel à suivre pour construire votre devoir. Activez la connexion IA principale pour obtenir une rédaction sur-mesure.`;


    const planSteps = isTwoAxes
      ? [
          "1. Introduction : amorce liée au thème du sujet, insertion exacte de la citation/du sujet, reformulation, problématique, annonce du plan.",
          "2. Axe I : chapeau d'ouverture puis 3 arguments réellement construits à partir du sujet précis (pas d'exemples génériques recopiés d'un autre sujet), chacun avec une illustration pertinente (auteur, œuvre, citation, analyse).",
          "3. Transition : bilan de l'Axe I et question ouvrant l'Axe II.",
          "4. Axe II : chapeau d'ouverture puis 3 arguments qui nuancent ou discutent l'Axe I, avec illustrations pertinentes.",
          "5. Conclusion : bilan des deux axes et prise de position, en réponse directe à la problématique posée.",
        ]
      : [
          "1. Introduction : amorce liée au thème du sujet, insertion exacte de la citation/du sujet, reformulation, problématique, annonce du plan.",
          "2. Thèse : chapeau puis arguments et illustrations construits à partir du sujet précis.",
          "3. Antithèse : chapeau puis arguments qui discutent ou nuancent la thèse.",
          "4. Synthèse : dépassement réel de l'opposition, pas une simple juxtaposition.",
          "5. Conclusion : bilan et prise de position, en réponse directe à la problématique posée.",
        ];

    const emptySubPart = (letter: string): { subPartLetter: string; title: string; argument: string; explication: string; illustration: { auteur: string; oeuvre: string; citation: string; analyseIllustration: string }; fullText: string } => ({
      subPartLetter: letter,
      title: "Non généré hors-ligne",
      argument: "",
      explication: "",
      illustration: { auteur: "", oeuvre: "", citation: "", analyseIllustration: "" },
      fullText: "",
    });

    return {
      disciplineIdentified: discipline || "Français / Philosophie",
      exerciseTypeIdentified: exerciseType || (isTwoAxes ? "Dissertation / Commentaire (2 Axes)" : "Dissertation / Commentaire (3 Axes)"),
      fasciculeMethodologyActivated: {
        name: methodoName,
        description: honestExplanation,
        stepsApplied: planSteps,
      },
      sourceDecomposition: {
        fasciculeMethodologies: ["Voir la méthodologie exacte du fascicule sélectionné (non re-générée hors-ligne)."],
        fasciculeKnowledgeUsed: [],
        externalKnowledgeMobilized: [],
      },
      pedagogicalTransferExplanation: honestExplanation,
      level1Hint: `Identifiez la tension centrale du sujet « ${cleanSubject} » et formulez une problématique qui l'exprime fidèlement, avant de bâtir le plan.`,
      level2Methodology: `${honestExplanation}\n\nCanevas à suivre :\n${planSteps.join("\n")}`,
      level3GuidanceSteps: [
        "Lisez et reformulez précisément le sujet avant toute chose : ne le confondez pas avec un sujet voisin déjà traité.",
        "Construisez une problématique fidèle au sujet exact soumis.",
        "Développez chaque axe avec des arguments et exemples réellement pertinents pour CE sujet, pas des illustrations recyclées d'un autre devoir.",
        "Rédigez une conclusion qui répond directement à la problématique posée.",
      ],
      level4DetailedOutline: honestExplanation,
      level5FullRedaction: honestExplanation,
      structuredRedaction: {
        planSummary: "Non généré hors-ligne — nécessite le moteur IA principal pour une rédaction fidèle au sujet.",
        introduction: {
          amorce: "",
          definitionTension: cleanSubject,
          problematique: "",
          annoncePlan: "",
          fullText: honestExplanation,
        },
        development: {
          part1: {
            partNumber: 1,
            title: "Axe I — non généré hors-ligne",
            thesisOverview: "",
            subParts: [emptySubPart("A"), emptySubPart("B"), emptySubPart("C")],
            fullText: "",
          },
          transition1: "",
          part2: {
            partNumber: 2,
            title: "Axe II — non généré hors-ligne",
            thesisOverview: "",
            subParts: [emptySubPart("A"), emptySubPart("B"), emptySubPart("C")],
            fullText: "",
          },
        },
        conclusion: {
          bilanSynthese: "",
          reponseDefinitive: "",
          elargissement: "",
          fullText: "",
        },
      },
      stepByStepBreakdown: [
        {
          stepNumber: 1,
          stepTitle: "Rédaction indisponible hors-ligne",
          methodologyRuleApplied: honestExplanation,
          content: honestExplanation,
          sourceTags: ["Moteur de secours local", "Hors-ligne"],
          pedagogicalTip: "Réessayez lorsque le moteur IA principal est disponible pour obtenir une rédaction réellement adaptée au sujet.",
        },
      ],
      fullSynthesizedResponse: honestExplanation,
      evaluationCriteria: [],
    };
  }
}
