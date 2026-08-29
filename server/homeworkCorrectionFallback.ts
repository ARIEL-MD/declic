import { StudentCorrectionResult } from "../src/types";
import { findAcademicKnowledge } from "../src/data/academicKnowledgeBase";

export interface HomeworkCorrectionFallbackParams {
  subjectTopic: string;
  discipline?: string;
  studentSubmission: string;
  exerciseType?: string;
  fasciculeRules?: string;
}

export function generateHomeworkCorrectionFallback(params: HomeworkCorrectionFallbackParams): StudentCorrectionResult {
  const {
    subjectTopic = "Sujet d'exercice",
    discipline = "Philosophie",
    studentSubmission = "",
    exerciseType = "Dissertation",
  } = params;

  const text = studentSubmission.trim();
  const lowerText = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const paragraphCount = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

  const disc = (discipline || "").toLowerCase();
  const isMath = /math[ée]matiques?|maths?|calcul/i.test(disc);
  const isPhysique = /physique|chimie/i.test(disc);
  const isSVT = /svt|biologie|g[ée]ologie/i.test(disc);
  const isScientific = isMath || isPhysique || isSVT;
  const isLanguage = /anglais|allemand|espagnol|english|deutsch|espa[ñn]ol/i.test(disc);

  // Match academic knowledge from the local offline knowledge base
  const matchedKnowledge = findAcademicKnowledge(subjectTopic, discipline);
  const expectedKeywords = matchedKnowledge?.expectedKeywords || [];

  // 1. Topic Adequacy Evaluation (Adéquation réelle au sujet et aux concepts attendus)
  const matchedExpectedKeywords = expectedKeywords.filter(kw => lowerText.includes(kw.toLowerCase()));
  const keywordRatio = expectedKeywords.length > 0
    ? matchedExpectedKeywords.length / expectedKeywords.length
    : 0.5;

  // 2. Structural & Rhetorical Analysis
  const hasIntro = /intro|amorce|probl[ée]matique|d'abord|en premier lieu|hypoth[èe]se|consid[ée]rons/i.test(text);
  const hasConclusion = /conclu|en d[ée]finitive|en r[ée]sum[ée]|au final|ainsi|en somme|pour conclure/i.test(text);
  const hasConnectors = /donc|or|cependant|toutefois|par cons[ée]quent|en effet|de plus|d'une part|d'autre part|n[ée]anmoins/i.test(text);
  const hasCitationsOrAuthors = /[«»"]|\b(descartes|kant|freud|platon|rousseau|camus|kourouma|dadi[ée]|hugo|zola|newton|weber|sartre|montesquieu|hobbes|lévi-strauss|vernant|alain|flaubert|proust)\b/i.test(text);
  const hasFormulasOrMathSteps = /\b\d+\s*[\+\-\*\/=]\s*\d+\b|f\(x\)|f'\(x\)|lim|e\^|ln|u_n|v_n|p\(|=>|->|∫/i.test(text);

  // 3. Dynamic Calculation of Criteria Scores based on real evidence
  let comprehensionScore = 12;
  let methodologyScore = 12;
  let problematiqueScore = 12;
  let organisationPlanScore = 12;
  let argumentationScore = 12;
  let exemplesReferencesScore = 11;
  let redactionStyleScore = 12;

  // Adjust for length and structure
  if (wordCount < 40) {
    comprehensionScore = Math.max(7, Math.round(8 + keywordRatio * 4));
    methodologyScore = 7.5;
    problematiqueScore = 8;
    organisationPlanScore = 7;
    argumentationScore = 6.5;
    exemplesReferencesScore = 6;
    redactionStyleScore = 9;
  } else if (wordCount < 120) {
    comprehensionScore = Math.max(9.5, Math.round(10 + keywordRatio * 5));
    methodologyScore = 10.5;
    problematiqueScore = 10;
    organisationPlanScore = 10.5;
    argumentationScore = 10;
    exemplesReferencesScore = 9.5;
    redactionStyleScore = 11.5;
  } else {
    // Normal / Developed essay or exercise
    comprehensionScore = Math.min(18.5, Math.round(12 + keywordRatio * 7));
    methodologyScore = hasIntro && hasConclusion ? 15.5 : 12.5;
    problematiqueScore = hasIntro ? 14.5 : 11.5;
    organisationPlanScore = paragraphCount >= 3 ? 15 : 12;
    argumentationScore = hasConnectors ? 15 : 12;
    exemplesReferencesScore = (hasCitationsOrAuthors || hasFormulasOrMathSteps) ? 15 : 11;
    redactionStyleScore = Math.min(17, Math.round(13 + (paragraphCount >= 3 ? 1.5 : 0)));
  }

  // Bonus/Penalty based on matched academic concepts
  if (matchedExpectedKeywords.length >= 3) {
    comprehensionScore = Math.min(19, comprehensionScore + 1.5);
    argumentationScore = Math.min(18.5, argumentationScore + 1);
  }

  const rawAverage = (
    comprehensionScore +
    methodologyScore +
    problematiqueScore +
    organisationPlanScore +
    argumentationScore +
    exemplesReferencesScore +
    redactionStyleScore
  ) / 7;

  const globalScore = Math.round(rawAverage * 2) / 2;

  // 4. Detailed Pedagogical Feedback Generation
  const whatIsSuccessful: string[] = [];
  const toImprove: string[] = [];
  const criticalErrors: string[] = [];
  const conceptsToReview: string[] = [];
  const remedialTips: string[] = [];

  let appreciation = "";
  let targetAdvice = "";

  if (matchedKnowledge) {
    conceptsToReview.push(`Notions clés du chapitre : ${matchedKnowledge.chapterTitle}`);
    if (matchedExpectedKeywords.length > 0) {
      whatIsSuccessful.push(`Bonne mobilisation des notions attendues : ${matchedExpectedKeywords.slice(0, 4).join(", ")}.`);
    } else {
      toImprove.push(`Intégrer les concepts et auteurs clés au programme pour ce sujet (ex: ${expectedKeywords.slice(0, 3).join(", ")}).`);
    }
  }

  if (isScientific) {
    if (hasFormulasOrMathSteps) {
      whatIsSuccessful.push("Présence de démarches de calcul et d'expressions mathématiques formalisées.");
    } else {
      toImprove.push("Poser systématiquement la formule littérale avant toute application numérique.");
    }
    if (hasConclusion) {
      whatIsSuccessful.push("Présence d'une conclusion avec encadrement de la solution finale.");
    } else {
      criticalErrors.push("Ne pas oublier de formuler une phrase bilan claire avec l'unité du résultat.");
    }
    appreciation = `Travail sérieux en ${discipline}. La démarche scientifique est engagée avec des étapes identifiables.`;
    targetAdvice = "Justifiez toujours les théorèmes utilisés (hypothèses de validité) avant de calculer et encadrez vos résultats finaux.";
    remedialTips.push("Vérifiez l'homogénéité des unités et la cohérence de vos signes à chaque étape.");
    remedialTips.push("Dressez systématiquement un tableau de signes ou un schéma quand cela est applicable.");
  } else if (isLanguage) {
    appreciation = `Production écrite structurée en ${discipline}. Le sujet est pris en compte avec une volonté claire de communiquer.`;
    targetAdvice = "Enrichissez les connecteurs de transition et veillez à la concordance des temps.";
    whatIsSuccessful.push("Respect du thème et découpage en paragraphes.");
    toImprove.push("Varier le lexique thématique et éviter les calques directs de la langue maternelle.");
    criticalErrors.push("Attention aux accords de base (sujet-verbe et genre/nombre).");
    remedialTips.push("Préparez un plan avec 3 arguments avant de rédiger.");
  } else {
    // Philo / Français / Histoire-Géo
    if (hasCitationsOrAuthors) {
      whatIsSuccessful.push("Présence d'auteurs ou de citations de référence pour appuyer le raisonnement.");
    } else {
      toImprove.push("Ancrer chaque argument dans une référence philosophique ou littéraire précise (auteur, œuvre, citation analysée).");
    }
    if (hasIntro && hasConclusion) {
      whatIsSuccessful.push("Structure académique respectée (Introduction rédigée et Conclusion bilan).");
    } else {
      toImprove.push("Soigner impérativement les 4 étapes de l'introduction (amorce, sujet, problématique, annonce du plan).");
    }
    if (matchedExpectedKeywords.length === 0 && expectedKeywords.length > 0) {
      criticalErrors.push(`Risque de hors-sujet partiel : la copie n'aborde pas assez directement les concepts fondamentaux du sujet (${expectedKeywords.slice(0, 3).join(", ")}).`);
    }

    appreciation = `Copie encourageante en ${discipline}. Le sujet « ${subjectTopic.slice(0, 50)}... » est traité avec des éléments de réflexion pertinents.`;
    targetAdvice = "Pour franchir le palier vers la mention, approfondissez l'analyse conceptuelle des termes du sujet et reliez chaque exemple à la problématique.";
    remedialTips.push("Appliquez la règle d'or : 1 Idée directrice + 1 Explication conceptuelle + 1 Exemple/Citation analysé par paragraphe.");
    remedialTips.push("Rédigez toujours une transition entre les grands axes du devoir.");
  }

  return {
    globalScore,
    appreciation,
    targetAdvice,
    criteriaScores: {
      comprehension: {
        score: comprehensionScore,
        max: 20,
        comment: matchedExpectedKeywords.length > 0
          ? `Compréhension satisfaisante : notions identifiées (${matchedExpectedKeywords.slice(0, 3).join(", ")}).`
          : "Le thème est abordé mais mérite un cadrage conceptuel plus rigoureux.",
      },
      methodology: {
        score: methodologyScore,
        max: 20,
        comment: `Application de la méthodologie propre à l'exercice (${exerciseType}).`,
      },
      problematique: {
        score: problematiqueScore,
        max: 20,
        comment: hasIntro
          ? "Questionnement central et tension directrice posés avec clarté."
          : "Veiller à bien formuler la problématique et la question directrice dès l'introduction.",
      },
      organisationPlan: {
        score: organisationPlanScore,
        max: 20,
        comment: paragraphCount >= 3
          ? "Progression équilibrée et découpage clair en plusieurs parties distinctes."
          : "Découpage en paragraphes à accentuer pour aérer la lecture.",
      },
      argumentation: {
        score: argumentationScore,
        max: 20,
        comment: hasConnectors
          ? "Enchaînement logique soutenu par des connecteurs argumentatifs adaptés."
          : "Développer davantage l'explication théorique de chaque étape.",
      },
      exemplesReferences: {
        score: exemplesReferencesScore,
        max: 20,
        comment: hasCitationsOrAuthors || hasFormulasOrMathSteps
          ? "Présence de références directes pour étayer la démonstration."
          : "Mobiliser des exemples d'œuvres, d'auteurs ou de calculs précis.",
      },
      redactionStyle: {
        score: redactionStyleScore,
        max: 20,
        comment: "Niveau d'expression correct, vocabulaire adapté aux exigences de l'examen.",
      },
    },
    whatIsSuccessful,
    toImprove,
    criticalErrors,
    conceptsToReview,
    remedialTips,
  };
}
