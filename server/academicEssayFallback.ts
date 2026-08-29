import { FallbackParams } from "./ivorianFallback";
import { findAcademicKnowledge } from "../src/data/academicKnowledgeBase";

export function generateAcademicEssayFallback(params: FallbackParams, matchedTopic: any) {
  const {
    subjectTopic,
    discipline = "Philosophie",
    exerciseType,
    isTwoAxes = true,
    fasciculeTitle = "Fascicule de Référence",
  } = params;

  const cleanSubject = subjectTopic.replace(/^«|»$/g, "").trim();
  const essay = matchedTopic.essayStructure;

  if (!essay) {
    // Fallback standard si aucune structure d'essai rédigée n'est disponible
    const honestExplanation = `Le sujet « ${cleanSubject} » a été analysé selon les concepts fondamentaux de ${matchedTopic.chapterTitle}. Pour une rédaction complète intégrant les auteurs et le plan dialectique, activez la clé IA principale. Voici le cadre d'analyse et les références applicables.`;
    return {
      disciplineIdentified: matchedTopic.disciplineLabel || discipline,
      exerciseTypeIdentified: exerciseType || (isTwoAxes ? "Dissertation (2 Axes)" : "Dissertation (3 Axes)"),
      fasciculeMethodologyActivated: {
        name: `Méthodologie Canonique — ${matchedTopic.chapterTitle}`,
        description: honestExplanation,
        stepsApplied: matchedTopic.stepByStepMethod.map((s: any) => `${s.stepNumber}. ${s.title} : ${s.whatToDo}`),
      },
      sourceDecomposition: {
        fasciculeMethodologies: [fasciculeTitle || "Fascicule officiel"],
        fasciculeKnowledgeUsed: matchedTopic.coreConceptsAndFormulas.map((c: any) => `${c.name} : ${c.formulaOrRule}`),
        externalKnowledgeMobilized: [matchedTopic.quickRevisionMemo],
      },
      pedagogicalTransferExplanation: honestExplanation,
      level1Hint: `Mobilisez les concepts de : ${matchedTopic.expectedKeywords.slice(0, 4).join(", ")}.`,
      level2Methodology: matchedTopic.stepByStepMethod.map((s: any) => `${s.stepNumber}. ${s.title}\n${s.whatToDo}\nConseil : ${s.reflexOrTip}`).join("\n\n"),
      level3GuidanceSteps: matchedTopic.stepByStepMethod.map((s: any) => `${s.title} (${s.whatToDo})`),
      level4DetailedOutline: `I. Introduction\n- Définition : ${matchedTopic.definitionAndScope.slice(0, 150)}...\n\nII. Développement\n` + matchedTopic.coreConceptsAndFormulas.map((c: any, i: number) => `Axe ${i + 1} : ${c.name}\n- Règle : ${c.formulaOrRule}\n- Analyse : ${c.explanation}`).join("\n\n") + `\n\nIII. Conclusion\n- Synthèse : ${matchedTopic.quickRevisionMemo}`,
      level5FullRedaction: honestExplanation,
      structuredRedaction: {
        planSummary: matchedTopic.chapterTitle,
        introduction: {
          amorce: matchedTopic.definitionAndScope,
          definitionTension: cleanSubject,
          problematique: `En quoi « ${cleanSubject} » engage-t-il la notion de ${matchedTopic.chapterTitle} ?`,
          annoncePlan: `Analyse méthodique des concepts et doctrines de référence.`,
          fullText: `${matchedTopic.definitionAndScope}\n\nSujet posé : « ${cleanSubject} »\n\nProblématique : En quoi ce sujet engage-t-il les principes de ${matchedTopic.chapterTitle} ?`,
        },
        development: {
          part1: {
            partNumber: 1,
            title: `Axe I : Principes fondamentaux de ${matchedTopic.chapterTitle}`,
            thesisOverview: matchedTopic.coreConceptsAndFormulas[0]?.explanation || "",
            subParts: [
              {
                subPartLetter: "A",
                title: matchedTopic.coreConceptsAndFormulas[0]?.name || "Analyse théorique",
                argument: matchedTopic.coreConceptsAndFormulas[0]?.explanation || "",
                explication: matchedTopic.coreConceptsAndFormulas[0]?.contextOrApplication || "",
                illustration: {
                  auteur: matchedTopic.coreConceptsAndFormulas[0]?.name || "",
                  oeuvre: "Doctrine fondamentale",
                  citation: matchedTopic.coreConceptsAndFormulas[0]?.formulaOrRule || "",
                  analyseIllustration: matchedTopic.coreConceptsAndFormulas[0]?.explanation || "",
                },
                fullText: `${matchedTopic.coreConceptsAndFormulas[0]?.formulaOrRule}\n\n${matchedTopic.coreConceptsAndFormulas[0]?.explanation}`,
              }
            ],
            fullText: matchedTopic.coreConceptsAndFormulas[0]?.explanation || "",
          },
          transition1: "Transition logique vers le deuxième axe d'analyse.",
          part2: {
            partNumber: 2,
            title: `Axe II : Approfondissement critique`,
            thesisOverview: matchedTopic.coreConceptsAndFormulas[1]?.explanation || "",
            subParts: [
              {
                subPartLetter: "A",
                title: matchedTopic.coreConceptsAndFormulas[1]?.name || "Discussion critique",
                argument: matchedTopic.coreConceptsAndFormulas[1]?.explanation || "",
                explication: matchedTopic.coreConceptsAndFormulas[1]?.contextOrApplication || "",
                illustration: {
                  auteur: matchedTopic.coreConceptsAndFormulas[1]?.name || "",
                  oeuvre: "Analyse critique",
                  citation: matchedTopic.coreConceptsAndFormulas[1]?.formulaOrRule || "",
                  analyseIllustration: matchedTopic.coreConceptsAndFormulas[1]?.explanation || "",
                },
                fullText: `${matchedTopic.coreConceptsAndFormulas[1]?.formulaOrRule}\n\n${matchedTopic.coreConceptsAndFormulas[1]?.explanation}`,
              }
            ],
            fullText: matchedTopic.coreConceptsAndFormulas[1]?.explanation || "",
          }
        },
        conclusion: {
          bilanSynthese: matchedTopic.quickRevisionMemo,
          reponseDefinitive: `Réponse méthodique appuyée sur les règles du chapitre.`,
          elargissement: `Perspectives et applications conformes aux examens.`,
          fullText: matchedTopic.quickRevisionMemo,
        }
      },
      stepByStepBreakdown: matchedTopic.stepByStepMethod.map((s: any) => ({
        stepNumber: s.stepNumber,
        stepTitle: s.title,
        methodologyRuleApplied: s.whatToDo,
        content: s.reflexOrTip,
        sourceTags: ["Base Académique Hors-Ligne", matchedTopic.disciplineLabel],
        pedagogicalTip: s.reflexOrTip,
      })),
      fullSynthesizedResponse: honestExplanation,
      evaluationCriteria: [
        {
          criterion: "Maîtrise des concepts du chapitre",
          fasciculeOrigin: true,
          description: matchedTopic.quickRevisionMemo,
          tipsForAutonomy: "Citer avec précision les notions et auteurs clés du cours.",
        }
      ],
    };
  }

  // Si une structure d'essai riche et rédigée existe dans la base pour ce thème
  const introFullText = `${essay.amorce} C'est dans cette perspective qu'un sujet d'examen affirme : « ${cleanSubject} ». ${essay.definitionTension} ${essay.problematique} ${essay.annoncePlan}`;

  const part1Data = essay.axes[0];
  const part2Data = essay.axes[1] || essay.axes[0];
  const part3Data = essay.axes[2] || null;

  const renderSubParts = (axis: typeof part1Data) => {
    return axis.arguments.map(arg => ({
      subPartLetter: arg.letter,
      title: arg.title,
      argument: arg.argument,
      explication: arg.explication,
      illustration: arg.illustration,
      fullText: `${arg.argument} ${arg.explication} Comme l'illustre ${arg.illustration.auteur} dans ${arg.illustration.oeuvre} : ${arg.illustration.citation}. ${arg.illustration.analyseIllustration}`,
    }));
  };

  const part1SubParts = renderSubParts(part1Data);
  const part2SubParts = renderSubParts(part2Data);

  const part1Full = `${part1Data.thesisOverview}\n\n` + part1SubParts.map(sp => sp.fullText).join("\n\n");
  const part2Full = `${part2Data.thesisOverview}\n\n` + part2SubParts.map(sp => sp.fullText).join("\n\n");

  const conclusionFullText = `${essay.conclusion.bilanSynthese} ${essay.conclusion.reponseDefinitive} ${essay.conclusion.elargissement}`;

  const fullRedactionText = `DISSERTATION ACADÉMIQUE COMPLÈTE\n\n` +
    `INTRODUCTION\n${introFullText}\n\n` +
    `DÉVELOPPEMENT\n\n` +
    `I. ${part1Data.title}\n${part1Full}\n\n` +
    `[TRANSITION] ${part1Data.transition || "Ainsi, l'examen de cette première thèse nous conduit à interroger ses limites."}\n\n` +
    `II. ${part2Data.title}\n${part2Full}\n\n` +
    (part3Data ? `III. ${part3Data.title}\n${part3Data.thesisOverview}\n\n` + renderSubParts(part3Data).map(sp => sp.fullText).join("\n\n") + `\n\n` : "") +
    `CONCLUSION\n${conclusionFullText}`;

  return {
    disciplineIdentified: matchedTopic.disciplineLabel || discipline,
    exerciseTypeIdentified: exerciseType || (isTwoAxes ? "Dissertation en 2 Axes" : "Dissertation en 3 Axes"),
    conceptualDisambiguation: {
      hasAmbiguousTerm: false,
      term: matchedTopic.chapterTitle,
      possibleMeanings: [matchedTopic.definitionAndScope],
      retainedMeaning: "Sens philosophique / littéraire rigoureux",
      justification: "Ancrage direct dans les programmes officiels de Terminale et du BAC.",
    },
    fasciculeMethodologyActivated: {
      name: `Méthodologie Officielle de Dissertation (${matchedTopic.disciplineLabel})`,
      description: `Traitement exhaustif du sujet « ${cleanSubject} » rattaché au chapitre : ${matchedTopic.chapterTitle}.`,
      stepsApplied: [
        "1. Introduction canonique en 4 étapes (Amorce, insertion du sujet, problématique, annonce du plan).",
        "2. Axe I avec arguments développés et citations d'auteurs authentifiées.",
        "3. Transition dialectique formulant le bilan et la question ouvrant l'axe suivant.",
        "4. Axe II avec discussion des limites et illustrations précises.",
        "5. Conclusion tripartite (Bilan synthétique, réponse définitive et élargissement de portée générale).",
      ],
    },
    sourceDecomposition: {
      fasciculeMethodologies: ["Canevas officiel de dissertation littéraire et philosophique"],
      fasciculeKnowledgeUsed: matchedTopic.coreConceptsAndFormulas.map((c: any) => `${c.name} : ${c.formulaOrRule}`),
      externalKnowledgeMobilized: [matchedTopic.quickRevisionMemo, matchedTopic.certificationNote],
    },
    pedagogicalTransferExplanation: `Rédaction intégrale générée à partir de la base de connaissances académique certifiée pour le thème : ${matchedTopic.chapterTitle}.`,
    level1Hint: `Identifiez la tension centrale de « ${cleanSubject} » à partir des concepts de ${matchedTopic.expectedKeywords.slice(0, 3).join(", ")}.`,
    level2Methodology: matchedTopic.stepByStepMethod.map((s: any) => `${s.stepNumber}. ${s.title} : ${s.whatToDo}`).join("\n"),
    level3GuidanceSteps: [
      `1. Introduction : ${essay.amorce.slice(0, 100)}...`,
      `2. Problématique : ${essay.problematique}`,
      `3. Axe I : ${part1Data.title}`,
      `4. Axe II : ${part2Data.title}`,
      `5. Conclusion : ${essay.conclusion.bilanSynthese.slice(0, 100)}...`,
    ],
    level4DetailedOutline: `I. INTRODUCTION\n- Amorce thématique\n- Insertion du sujet : « ${cleanSubject} »\n- Problématique : ${essay.problematique}\n- Plan : ${essay.annoncePlan}\n\nII. DÉVELOPPEMENT\n1. ${part1Data.title}\n` + part1SubParts.map(sp => `   * ${sp.title} (${sp.illustration.auteur})`).join("\n") + `\n2. ${part2Data.title}\n` + part2SubParts.map(sp => `   * ${sp.title} (${sp.illustration.auteur})`).join("\n") + `\n\nIII. CONCLUSION\n- Bilan : ${essay.conclusion.bilanSynthese}\n- Réponse : ${essay.conclusion.reponseDefinitive}`,
    level5FullRedaction: fullRedactionText,
    structuredRedaction: {
      planSummary: `${part1Data.title} | ${part2Data.title}`,
      introduction: {
        amorce: essay.amorce,
        definitionTension: essay.definitionTension,
        problematique: essay.problematique,
        annoncePlan: essay.annoncePlan,
        fullText: introFullText,
      },
      development: {
        part1: {
          partNumber: 1,
          title: part1Data.title,
          thesisOverview: part1Data.thesisOverview,
          subParts: part1SubParts,
          fullText: part1Full,
        },
        transition1: part1Data.transition || "De cette première analyse, nous retenons que la thèse est solidement étayée. Toutefois, ne comporte-t-elle pas des limites majeures ?",
        part2: {
          partNumber: 2,
          title: part2Data.title,
          thesisOverview: part2Data.thesisOverview,
          subParts: part2SubParts,
          fullText: part2Full,
        },
      },
      conclusion: {
        bilanSynthese: essay.conclusion.bilanSynthese,
        reponseDefinitive: essay.conclusion.reponseDefinitive,
        elargissement: essay.conclusion.elargissement,
        fullText: conclusionFullText,
      },
    },
    stepByStepBreakdown: [
      {
        stepNumber: 1,
        stepTitle: "Introduction rédigée",
        methodologyRuleApplied: "Amorce, sujet cité, problématique et annonce du plan.",
        content: introFullText,
        sourceTags: ["Introduction", matchedTopic.disciplineLabel],
        pedagogicalTip: "Ne jamais oublier d'insérer la citation exacte du sujet dans l'introduction.",
      },
      {
        stepNumber: 2,
        stepTitle: `Axe I : ${part1Data.title}`,
        methodologyRuleApplied: "Chapeau + Arguments et illustrations sourcées.",
        content: part1Full,
        sourceTags: ["Axe I", part1Data.title],
        pedagogicalTip: "Toujours analyser l'exemple ou la citation pour montrer en quoi il valide l'argument.",
      },
      {
        stepNumber: 3,
        stepTitle: `Axe II : ${part2Data.title}`,
        methodologyRuleApplied: "Discussion critique et dépassement de la thèse initiale.",
        content: part2Full,
        sourceTags: ["Axe II", part2Data.title],
        pedagogicalTip: "Veillez à formuler une transition claire et interrogative avant d'aborder le second axe.",
      },
      {
        stepNumber: 4,
        stepTitle: "Conclusion rédigée",
        methodologyRuleApplied: "Bilan des axes, réponse définitive et ouverture.",
        content: conclusionFullText,
        sourceTags: ["Conclusion", "Bilan"],
        pedagogicalTip: "La conclusion doit apporter une réponse nette à la question posée en introduction.",
      },
    ],
    fullSynthesizedResponse: fullRedactionText,
    evaluationCriteria: [
      {
        criterion: "Respect de la structure canonique de dissertation",
        fasciculeOrigin: true,
        description: "Introduction quadripartite, deux axes argumentés et conclusion équilibrée.",
        tipsForAutonomy: "Vérifier la présence des 4 étapes de l'introduction et la cohérence de la conclusion.",
      },
      {
        criterion: "Qualité des références et citations d'auteurs",
        fasciculeOrigin: true,
        description: "Mobilisation d'auteurs authentifiés et contextualisés.",
        tipsForAutonomy: "Ne jamais citer un auteur sans expliquer la thèse de l'ouvrage.",
      },
    ],
    selfCheckChecklist: matchedTopic.selfCheckChecklist,
    quickRevisionMemo: matchedTopic.quickRevisionMemo,
    examPitfalls: matchedTopic.classicExamTraps,
  };
}
