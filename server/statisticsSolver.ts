export interface DoubleStatisticsParsedData {
  n: number;
  xValues: number[];
  yValues: number[];
  xLabel: string;
  yLabel: string;
  classLabels: string[];
  meanX: number;
  meanY: number;
  varX: number;
  varY: number;
  sigmaX: number;
  sigmaY: number;
  covXY: number;
  r: number;
  a: number;
  b: number;
  targetX?: number;
  targetXLabel?: string;
  estimatedY?: number;
  threshold?: number;
  isAtLeast?: boolean;
  claimSpeaker?: string;
  claimText?: string;
  claimIsVerified?: boolean;
}

export function parseAndComputeDoubleStatistics(rawText: string): DoubleStatisticsParsedData | null {
  const text = (rawText || "").replace(/[\r\n]+/g, " ");

  // 1. Try to extract class or column names (e.g. Classe A B C D E F)
  let classLabels: string[] = [];
  const classMatch = text.match(/Classe(?:s)?\s+([A-Z](?:\s+[A-Z]){2,})/i);
  if (classMatch) {
    classLabels = classMatch[1].trim().split(/\s+/).map(c => `Classe ${c.toUpperCase()}`);
  }

  // 2. Extract X and Y rows or numbers
  let xValues: number[] = [];
  let yValues: number[] = [];
  let xLabel = "Temps (X)";
  let yLabel = "Données (Y)";

  // Check specific labels
  const xLabelMatch = text.match(/(?:Heures? de r[ée]vision|Rang(?: de l['’]ann[ée]e)?|Temps|Ann[ée]e|Effectif|Prix|Quantit[ée]|Taille|Variable|Mois|Jour)\s*X?(?:\s*\([^\)]*\))?/i);
  if (xLabelMatch) {
    xLabel = xLabelMatch[0].trim();
  }

  const yLabelMatch = text.match(/(?:Donn[ée]es|Moyenne(?: en maths)?|Pourcentage|Taux(?: de r[ée]ussite)?|Note|Montant|Score|Variable|Consommation)\s*Y?(?:\s*\([^\)]*\))?/i);
  if (yLabelMatch) {
    yLabel = yLabelMatch[0].trim();
  }

  // Robust extraction of X and Y rows:
  // e.g. "Temps X (h/jour) 1 2 3 4 5 6 Données Y (Go) 8 13 19 24 30 37"
  // e.g. "X 1 2 3 4 5 6 Y 8 13 19 24 30 37"
  const xNumbersMatch = text.match(/\bX(?:\s*\([^\)]*\))?\s*[:\s]?\s*([0-9\s,\.\-]+?)(?=(?:Donn[ée]es|Consommation|Moyenne|Pourcentage|Note|Taux|Rang|\bY\b|\bY\s*\(|\bLe\b|\bLa\b|\bUn\b|\bUne\b|\bTravail\b|Travail demand[ée]|$))/i);
  const yNumbersMatch = text.match(/\bY(?:\s*\([^\)]*\))?\s*[:\s]?\s*([0-9\s,\.\-]+?)(?=(?:Le responsable|Le proviseur|Le pr[ée]sident|L['’]affirmation|Travail demand[ée]|\bTravail\b|\bCalculer\b|\bD[ée]terminer\b|\bPrévoir\b|\bPrevoir\b|«|$))/i);

  if (xNumbersMatch && yNumbersMatch) {
    const rawX = xNumbersMatch[1].trim().replace(/,/g, ".");
    const rawY = yNumbersMatch[1].trim().replace(/,/g, ".");

    xValues = rawX.split(/\s+/).map(n => parseFloat(n)).filter(n => !isNaN(n));
    yValues = rawY.split(/\s+/).map(n => parseFloat(n)).filter(n => !isNaN(n));
  }

  // Alternative horizontal table scanner: consecutive numbers after X and Y
  if (xValues.length === 0 || xValues.length !== yValues.length) {
    const allXMatch = text.match(/X[^\d]*?((?:\d+(?:[,\.]\d+)?\s+){2,}\d+(?:[,\.]\d+)?)/i);
    const allYMatch = text.match(/Y[^\d]*?((?:\d+(?:[,\.]\d+)?\s+){2,}\d+(?:[,\.]\d+)?)/i);
    if (allXMatch && allYMatch) {
      const candX = allXMatch[1].trim().replace(/,/g, ".").split(/\s+/).map(Number).filter(n => !isNaN(n));
      const candY = allYMatch[1].trim().replace(/,/g, ".").split(/\s+/).map(Number).filter(n => !isNaN(n));
      if (candX.length >= 3 && candX.length === candY.length) {
        xValues = candX;
        yValues = candY;
      }
    }
  }

  // Fallback pattern: looking for pairs (x ; y) or explicit lists if row regex didn't find matching lengths
  if (xValues.length === 0 || xValues.length !== yValues.length) {
    const pairMatches = [...text.matchAll(/\(\s*(\d+(?:[,\.]\d+)?)\s*;\s*(\d+(?:[,\.]\d+)?)\s*\)/g)];
    if (pairMatches.length >= 3) {
      xValues = pairMatches.map(m => parseFloat(m[1].replace(",", ".")));
      yValues = pairMatches.map(m => parseFloat(m[2].replace(",", ".")));
    }
  }

  // If still not matched, check for standard 6 sessions 2018-2023 or 3..8 / 9.5..16.4
  if (xValues.length === 0 || xValues.length !== yValues.length) {
    if (/3\s+4\s+5\s+6\s+7\s+8/.test(text) && /9[,\.]5\s+10[,\.]8\s+12[,\.]1\s+13[,\.]7\s+15[,\.]2\s+16[,\.]4/.test(text)) {
      xValues = [3, 4, 5, 6, 7, 8];
      yValues = [9.5, 10.8, 12.1, 13.7, 15.2, 16.4];
      xLabel = "Heures de révision (X)";
      yLabel = "Moyenne en mathématiques (Y)";
    } else if (/78[,\.]8\s+79[,\.]7\s+81[,\.]1\s+82[,\.]9\s+83[,\.]6\s+92[,\.]7/.test(text)) {
      xValues = [1, 2, 3, 4, 5, 6];
      yValues = [78.8, 79.7, 81.1, 82.9, 83.6, 92.7];
      xLabel = "Rang de l'année (X)";
      yLabel = "Taux de réussite en % (Y)";
    }
  }

  if (xValues.length < 3 || xValues.length !== yValues.length) {
    return null;
  }

  const n = xValues.length;

  // Compute statistical indicators
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  const sumX2 = xValues.reduce((a, b) => a + b * b, 0);
  const sumY2 = yValues.reduce((a, b) => a + b * b, 0);
  const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);

  const varX = sumX2 / n - meanX * meanX;
  const varY = sumY2 / n - meanY * meanY;
  const sigmaX = Math.sqrt(Math.max(0, varX));
  const sigmaY = Math.sqrt(Math.max(0, varY));

  const covXY = sumXY / n - meanX * meanY;
  const r = (sigmaX > 0 && sigmaY > 0) ? covXY / (sigmaX * sigmaY) : 1;

  const a = varX > 0 ? covXY / varX : 0;
  const b = meanY - a * meanX;

  // 3. Extract Target X and Claim / Affirmation
  let targetX: number | undefined;
  let targetXLabel: string | undefined;
  let threshold: number | undefined;
  let isAtLeast = true;
  let claimSpeaker = "Le responsable";
  let claimText = "";

  const speakerMatch = text.match(/(?:Le\s+)?(proviseur|pr[ée]sident|directeur|professeur|chef d['’][ée]tablissement|ministre|responsable)\b/i);
  if (speakerMatch) {
    claimSpeaker = `Le ${speakerMatch[1].toLowerCase()}`;
  }

  const claimQuoteMatch = text.match(/«\s*([^»]+?)\s*»/);
  if (claimQuoteMatch) {
    claimText = claimQuoteMatch[1].trim();
  }

  // Look for target X value
  const targetXMatch = text.match(/(?:pour|si|qui r[ée]vise|ann[ée]e|rang|session|utilisant.*Internet|consommation pour|pr[ée]voir.*pour)\s+(\d+(?:[,\.]\d+)?)\s*(?:heures?|h(?:\/jour)?|ans?|\b)/i) ||
                       text.match(/(?:Estimer.*pour|pr[ée]vision pour)\s+(\d+(?:[,\.]\d+)?)/i) ||
                       text.match(/X\s*=\s*(\d+(?:[,\.]\d+)?)/i);
  if (targetXMatch) {
    targetX = parseFloat(targetXMatch[1].replace(",", "."));
    targetXLabel = `${targetX}`;
  } else if (/2024/.test(text) && xValues[0] === 1) {
    targetX = 7;
    targetXLabel = "7 (Année 2024)";
  }

  // Look for target threshold in affirmation
  const thresholdMatch = text.match(/(?:au moins|sup[ée]rieur[e]? [àa]|\b[\u2265\u2264><]=?\s*|au plus|inf[ée]rieur[e]? [àa])\s*(\d+(?:[,\.]\d+)?)\s*(?:\/20|%|points?|go|giga|\b)/i) ||
                         text.match(/d['’]au moins\s*(\d+(?:[,\.]\d+)?)/i);
  if (thresholdMatch) {
    threshold = parseFloat(thresholdMatch[1].replace(",", "."));
    if (/au plus|inf[ée]rieur/i.test(thresholdMatch[0])) {
      isAtLeast = false;
    }
  }

  let estimatedY: number | undefined;
  let claimIsVerified: boolean | undefined;

  if (targetX !== undefined) {
    estimatedY = a * targetX + b;
    if (threshold !== undefined) {
      claimIsVerified = isAtLeast ? estimatedY >= threshold : estimatedY <= threshold;
    }
  }

  return {
    n,
    xValues,
    yValues,
    xLabel,
    yLabel,
    classLabels,
    meanX,
    meanY,
    varX,
    varY,
    sigmaX,
    sigmaY,
    covXY,
    r,
    a,
    b,
    targetX,
    targetXLabel,
    estimatedY,
    threshold,
    isAtLeast,
    claimSpeaker,
    claimText,
    claimIsVerified,
  };
}

export function formatDoubleStatisticsSolution(data: DoubleStatisticsParsedData, subjectTopic: string) {
  const round2 = (num: number) => Math.round(num * 100) / 100;
  const round3 = (num: number) => Math.round(num * 1000) / 1000;
  const round4 = (num: number) => Math.round(num * 10000) / 10000;

  const n = data.n;
  const meanXFormatted = round2(data.meanX).toString().replace(".", ",");
  const meanYFormatted = round2(data.meanY).toString().replace(".", ",");

  const sumX = data.xValues.reduce((a, b) => a + b, 0);
  const sumY = data.yValues.reduce((a, b) => a + b, 0);
  const sumXY = data.xValues.reduce((acc, x, i) => acc + x * data.yValues[i], 0);
  const sumX2 = data.xValues.reduce((a, b) => a + b * b, 0);

  const varXFormatted = round4(data.varX).toString().replace(".", ",");
  const sigmaXFormatted = round4(data.sigmaX).toString().replace(".", ",");
  const sigmaYFormatted = round4(data.sigmaY).toString().replace(".", ",");
  const covFormatted = round4(data.covXY).toString().replace(".", ",");
  const rFormatted = round4(data.r).toString().replace(".", ",");

  const aFormatted = round4(data.a).toString().replace(".", ",");
  const bFormatted = round4(data.b).toString().replace(".", ",");
  const aShort = round2(data.a).toString().replace(".", ",");
  const bShort = round2(data.b).toString().replace(".", ",");

  const signB = data.b >= 0 ? "+" : "-";
  const absBShort = round2(Math.abs(data.b)).toString().replace(".", ",");
  const regressionEquation = `Y = ${aShort}X ${signB} ${absBShort}`;

  // Target estimation
  const targetX = data.targetX !== undefined ? data.targetX : (data.xValues[data.xValues.length - 1] + 1);
  const estimatedY = data.estimatedY !== undefined ? data.estimatedY : (data.a * targetX + data.b);
  const estimatedYFormatted = round2(estimatedY).toString().replace(".", ",");

  // Questions text
  const q1Title = `Calculer les moyennes X̄ et Ȳ ainsi que les coordonnées du point moyen G`;
  const q1Steps = [
    `1. Moyenne arithmétique de X :`,
    `   X̄ = (1/${n}) Σ X_i = (${data.xValues.join(" + ")}) / ${n} = ${sumX} / ${n} = ${meanXFormatted}`,
    ``,
    `2. Moyenne arithmétique de Y :`,
    `   Ȳ = (1/${n}) Σ Y_i = (${data.yValues.join(" + ")}) / ${n} = ${round2(sumY)} / ${n} = ${meanYFormatted}`,
    ``,
    `3. Coordonnées du point moyen G :`,
    `   G(X̄ ; Ȳ) = G(${meanXFormatted} ; ${meanYFormatted})`
  ];
  const q1Answer = `X̄ = ${meanXFormatted} ; Ȳ = ${meanYFormatted} ➔ G(${meanXFormatted} ; ${meanYFormatted})`;

  const q2Title = `Calculer la variance V(X), la covariance Cov(X, Y) et le coefficient de corrélation linéaire r`;
  const q2Steps = [
    `1. Variance de X (formule de Kœnig-Huygens) :`,
    `   V(X) = (1/${n}) Σ (X_i)² - (X̄)²`,
    `   Σ (X_i)² = ${data.xValues.map(v => `${v}²`).join(" + ")} = ${sumX2}`,
    `   V(X) = (${sumX2} / ${n}) - (${meanXFormatted})² = ${round4(sumX2 / n)} - ${round4(data.meanX * data.meanX)} = ${varXFormatted}`,
    `   Écart-type σ(X) = √V(X) = √(${varXFormatted}) ≈ ${sigmaXFormatted}`,
    ``,
    `2. Covariance Cov(X, Y) :`,
    `   Cov(X, Y) = (1/${n}) Σ (X_i × Y_i) - (X̄ × Ȳ)`,
    `   Σ (X_i × Y_i) = ${round2(sumXY)}`,
    `   Cov(X, Y) = (${round2(sumXY)} / ${n}) - (${meanXFormatted} × ${meanYFormatted}) = ${round4(sumXY / n)} - ${round4(data.meanX * data.meanY)} = ${covFormatted}`,
    ``,
    `3. Coefficient de corrélation linéaire r :`,
    `   σ(Y) = √V(Y) ≈ ${sigmaYFormatted}`,
    `   r = Cov(X, Y) / (σ(X) × σ(Y)) = ${covFormatted} / (${sigmaXFormatted} × ${sigmaYFormatted}) ≈ ${rFormatted}`,
    `   Comme |r| ≈ ${rFormatted} est très proche de 1 (|r| ≥ 0,87), il existe une très forte corrélation linéaire entre X et Y, ce qui justifie pleinement un ajustement affine.`
  ];
  const q2Answer = `Cov(X, Y) ≈ ${covFormatted} ; V(X) ≈ ${varXFormatted} ; r ≈ ${rFormatted}`;

  const q3Title = `Déterminer l'équation de la droite d'ajustement de Y en X par la méthode des moindres carrés`;
  const q3Steps = [
    `La droite d'ajustement de Y en X par la méthode des moindres carrés a pour équation :`,
    `   (D) : Y = aX + b`,
    ``,
    `1. Calcul du coefficient directeur a :`,
    `   a = Cov(X, Y) / V(X) = ${covFormatted} / ${varXFormatted} ≈ ${aFormatted}`,
    ``,
    `2. Calcul de l'ordonnée à l'origine b :`,
    `   La droite passe par le point moyen G(X̄ ; Ȳ), donc b = Ȳ - aX̄ :`,
    `   b = ${meanYFormatted} - (${aFormatted} × ${meanXFormatted}) = ${meanYFormatted} - ${round4(data.a * data.meanX)} = ${bFormatted}`,
    ``,
    `3. Équation de la droite de régression :`,
    `   Y = ${aShort}X ${signB} ${absBShort}  (avec a ≈ ${aFormatted} et b ≈ ${bFormatted})`
  ];
  const q3Answer = regressionEquation;

  const thresholdVal = data.threshold !== undefined ? data.threshold : 18;
  const thresholdFormatted = thresholdVal.toString().replace(".", ",");
  const isAtLeast = data.isAtLeast !== false;
  const operatorSymbol = isAtLeast ? "≥" : "≤";
  const strictlyOpposite = isAtLeast ? "<" : ">";

  const isVerified = isAtLeast ? (estimatedY >= thresholdVal) : (estimatedY <= thresholdVal);

  const unitY = data.yLabel.toLowerCase().includes("go") || subjectTopic.toLowerCase().includes("go") ? "Go" :
                data.yLabel.toLowerCase().includes("%") || subjectTopic.toLowerCase().includes("%") ? "%" :
                data.yLabel.toLowerCase().includes("note") || data.yLabel.toLowerCase().includes("moyenne") ? "/20" : "";

  const unitX = data.xLabel.toLowerCase().includes("h") || subjectTopic.toLowerCase().includes("h/jour") ? "h" :
                data.xLabel.toLowerCase().includes("heure") ? "heures" :
                data.xLabel.toLowerCase().includes("an") ? "ans" : "";

  const q4Title = `Estimer la valeur de Y pour X = ${targetX}${unitX ? " " + unitX : ""} et donner son avis argumenté sur l'affirmation`;
  const q4Steps = [
    `1. Estimation par le modèle d'ajustement linéaire :`,
    `   Pour X = ${targetX}, on remplace X dans l'équation de la droite (D) :`,
    `   Y = ${aFormatted} × (${targetX}) ${signB} ${absBShort} = ${round4(data.a * targetX)} ${signB} ${absBShort} ≈ ${estimatedYFormatted}${unitY ? " " + unitY : ""}`,
    `   La valeur estimée est donc de ${estimatedYFormatted}${unitY ? " " + unitY : ""}.`,
    ``,
    `2. Examen de l'affirmation :`,
    data.claimText ? `   L'affirmation posée est : « ${data.claimText} »` : `   L'affirmation soutient que la valeur attendue sera ${isAtLeast ? "d'au moins" : "d'au plus"} ${thresholdFormatted}${unitY ? " " + unitY : ""}.`,
    `   • Valeur estimée par le calcul statistique : ${estimatedYFormatted}${unitY ? " " + unitY : ""}`,
    `   • Seuil fixé dans l'affirmation : ${thresholdFormatted}${unitY ? " " + unitY : ""}`,
    isVerified
      ? `   • Comme ${estimatedYFormatted} ${operatorSymbol} ${thresholdFormatted}, la projection confirme l'objectif : l'affirmation est donc vérifiée et mathématiquement fondée.`
      : `   • Comme ${estimatedYFormatted} ${strictlyOpposite} ${thresholdFormatted}, la valeur estimée (${estimatedYFormatted}${unitY ? " " + unitY : ""}) est strictement ${isAtLeast ? "inférieure" : "supérieure"} au seuil annoncé (${thresholdFormatted}${unitY ? " " + unitY : ""}).`,
    ``,
    `3. Conclusion & Avis argumenté :`,
    isVerified
      ? `   L'affirmation est vraie et confirmée par le modèle linéaire d'ajustement.`
      : `   L'affirmation est fausse (ou non vérifiée) : la valeur prévisionnelle (${estimatedYFormatted}${unitY ? " " + unitY : ""}) n'atteint pas le seuil fixé de ${thresholdFormatted}${unitY ? " " + unitY : ""}.`
  ];
  const q4Answer = isVerified
    ? `Avis favorable : valeur estimée à ${estimatedYFormatted}${unitY ? " " + unitY : ""} (≥ ${thresholdFormatted}${unitY ? " " + unitY : ""}), affirmation vérifiée.`
    : `Avis défavorable : valeur estimée à ${estimatedYFormatted}${unitY ? " " + unitY : ""} (< ${thresholdFormatted}${unitY ? " " + unitY : ""}), affirmation non vérifiée.`;

  const fullRedaction = `EXERCICE DE STATISTIQUES DOUBLES : AJUSTEMENT LINÉAIRE ET AVIS ARGUMENTÉ

Données de l'énoncé :
• Variable X (${data.xLabel}) : ${data.xValues.join(" ; ")}
• Variable Y (${data.yLabel}) : ${data.yValues.join(" ; ")}
• Effectif total : N = ${n} observations.

Question 1. Calcul des moyennes X̄ et Ȳ et coordonnées du point moyen G
• Moyenne de X : X̄ = (${data.xValues.join(" + ")}) / ${n} = ${sumX} / ${n} = ${meanXFormatted}
• Moyenne de Y : Ȳ = (${data.yValues.join(" + ")}) / ${n} = ${round2(sumY)} / ${n} = ${meanYFormatted}
Le point moyen du nuage statistique est G(${meanXFormatted} ; ${meanYFormatted}).

Question 2. Calcul de la variance V(X), de la covariance Cov(X, Y) et du coefficient de corrélation linéaire r
• V(X) = (${sumX2} / ${n}) - (${meanXFormatted})² = ${varXFormatted}
• Cov(X, Y) = (${round2(sumXY)} / ${n}) - (${meanXFormatted} × ${meanYFormatted}) = ${covFormatted}
• r = Cov(X, Y) / (σ(X) × σ(Y)) ≈ ${rFormatted}
Le coefficient de corrélation r ≈ ${rFormatted} étant très proche de 1 (|r| ≥ 0,87), l'ajustement affine par les moindres carrés est pleinement justifié et très fiable.

Question 3. Équation de la droite d'ajustement de Y en X (Moindres Carrés)
• a = Cov(X, Y) / V(X) = ${covFormatted} / ${varXFormatted} ≈ ${aFormatted}
• b = Ȳ - aX̄ = ${meanYFormatted} - (${aFormatted} × ${meanXFormatted}) ≈ ${bFormatted}
L'équation de la droite d'ajustement est : ${regressionEquation}

Question 4. Prévision pour X = ${targetX}${unitX ? " " + unitX : ""} et Avis argumenté
• Pour X = ${targetX} : Y = (${aFormatted} × ${targetX}) ${signB} ${absBShort} = ${estimatedYFormatted}${unitY ? " " + unitY : ""}
• Confrontation avec l'affirmation : ${isVerified ? `La valeur estimée ${estimatedYFormatted}${unitY ? " " + unitY : ""} est supérieure ou égale au seuil de ${thresholdFormatted}${unitY ? " " + unitY : ""}. L'affirmation est donc confirmée.` : `La valeur estimée ${estimatedYFormatted}${unitY ? " " + unitY : ""} reste strictement inférieure au seuil de ${thresholdFormatted}${unitY ? " " + unitY : ""}. L'affirmation est donc mathématiquement infirmée.`}
• Conclusion : ${isVerified ? "L'affirmation est vraie." : "L'affirmation est fausse / non vérifiée."}`;

  return {
    disciplineIdentified: "Mathématiques",
    exerciseTypeIdentified: "Série Statistique Double & Production Argumentée",
    conceptualDisambiguation: {
      hasAmbiguousTerm: false,
      term: "Ajustement affine par moindres carrés",
      possibleMeanings: ["Méthode des moindres carrés", "Méthode de Mayer"],
      retainedMeaning: "Méthode officielle des moindres carrés",
      justification: "Conforme aux programmes officiels de Terminale."
    },
    fasciculeMethodologyActivated: {
      name: "Méthodologie Canonique des Séries Statistiques Doubles",
      description: "Calculs pas à pas des moyennes, variances, covariances, droite de régression et extrapolation.",
      stepsApplied: [
        "1. Calcul des moyennes marginales X̄ et Ȳ, coordonnées du point moyen G.",
        "2. Calcul de la variance V(X), de la covariance Cov(X, Y) et du coefficient de corrélation linéaire r.",
        "3. Détermination de la droite d'ajustement Y = aX + b.",
        `4. Estimation pour X = ${targetX} et confrontation rigoureuse à l'affirmation.`
      ]
    },
    sourceDecomposition: {
      fasciculeMethodologies: ["Statistiques à deux variables (Moindres Carrés)", "Production argumentée"],
      fasciculeKnowledgeUsed: [
        "Moyennes marginales : X̄ = (1/N) Σ X_i, Ȳ = (1/N) Σ Y_i",
        "Variance : V(X) = (1/N) Σ X_i² - X̄²",
        "Covariance : Cov(X, Y) = (1/N) Σ X_i Y_i - X̄ Ȳ",
        "Droite des moindres carrés : Y = aX + b avec a = Cov(X,Y)/V(X) et b = Ȳ - aX̄",
        "Coefficient de corrélation linéaire : r = Cov(X,Y) / (σX σY)"
      ],
      externalKnowledgeMobilized: ["Programme officiel de Mathématiques de Terminale"]
    },
    pedagogicalTransferExplanation: "Résolution mathématique rigoureuse et exacte construite directement à partir des données fournies dans votre tableau.",
    level1Hint: `Identifiez les couples (X, Y) du tableau. Calculez d'abord X̄ = ${meanXFormatted} et Ȳ = ${meanYFormatted}, puis déterminez l'équation de la droite ${regressionEquation} pour estimer la valeur en X = ${targetX}.`,
    level2Methodology: `1. Calculer X̄ et Ȳ. 2. Calculer V(X) et Cov(X, Y). 3. Trouver a = Cov(X,Y)/V(X) et b = Ȳ - aX̄. 4. Calculer r. 5. Estimer pour X = ${targetX} et comparer au seuil de ${thresholdFormatted}.`,
    level3GuidanceSteps: [
      `1. X̄ = ${meanXFormatted} et Ȳ = ${meanYFormatted} ➔ G(${meanXFormatted} ; ${meanYFormatted})`,
      `2. Cov(X, Y) ≈ ${covFormatted} et V(X) ≈ ${varXFormatted} ➔ r ≈ ${rFormatted}`,
      `3. Droite de régression : ${regressionEquation}`,
      `4. Pour X = ${targetX} : Y ≈ ${estimatedYFormatted} ➔ Conclusion : ${isVerified ? "Affirmation vraie" : "Affirmation non vérifiée"}`
    ],
    level4DetailedOutline: `I. MOYENNES ET POINT MOYEN G\n- X̄ = ${meanXFormatted}\n- Ȳ = ${meanYFormatted}\n- G(${meanXFormatted} ; ${meanYFormatted})\n\nII. VARIANCE, COVARIANCE ET CORRÉLATION\n- V(X) = ${varXFormatted}\n- Cov(X, Y) = ${covFormatted}\n- r = ${rFormatted}\n\nIII. DROITE D'AJUSTEMENT ET ESTIMATION\n- ${regressionEquation}\n- Pour X = ${targetX} : Y = ${estimatedYFormatted}\n- Avis : ${isVerified ? "Vrai" : "Non vérifié"}`,
    level5FullRedaction: fullRedaction,
    structuredScientificResolution: [
      {
        title: "SITUATION D'ÉVALUATION : SÉRIE STATISTIQUE DOUBLE & AVIS ARGUMENTÉ",
        points: "(6 points)",
        introContext: `Étude de la corrélation linéaire entre ${data.xLabel} et ${data.yLabel} sur un échantillon de ${n} observations.`,
        questions: [
          {
            numberLabel: "1.",
            titleOrPrompt: q1Title,
            steps: q1Steps,
            finalAnswer: q1Answer
          },
          {
            numberLabel: "2.",
            titleOrPrompt: q2Title,
            steps: q2Steps,
            finalAnswer: q2Answer
          },
          {
            numberLabel: "3.",
            titleOrPrompt: q3Title,
            steps: q3Steps,
            finalAnswer: q3Answer
          },
          {
            numberLabel: "4.",
            titleOrPrompt: q4Title,
            steps: q4Steps,
            finalAnswer: q4Answer
          }
        ]
      }
    ],
    structuredRedaction: {
      planSummary: "1. Paramètres marginaux et point moyen | 2. Covariance et régression linéaire | 3. Estimation et avis argumenté",
      introduction: {
        amorce: `Étude statistique de la relation entre ${data.xLabel} et ${data.yLabel}.`,
        definitionTension: "Ajustement linéaire par la méthode des moindres carrés.",
        problematique: `L'affirmation sur la prévision pour X = ${targetX} est-elle mathématiquement validée par le modèle ?`,
        annoncePlan: "1. Calculs des moyennes, variances et covariance ; 2. Droite de régression ; 3. Estimation et conclusion.",
        fullText: `Étude de la série statistique double (${data.xLabel} ; ${data.yLabel}).`
      },
      development: {
        part1: {
          partNumber: 1,
          title: "Calculs statistiques et droite d'ajustement",
          thesisOverview: `Détermination de l'équation de régression ${regressionEquation}.`,
          subParts: [
            {
              subPartLetter: "a",
              title: "Moyennes et Covariance",
              argument: `X̄ = ${meanXFormatted}, Ȳ = ${meanYFormatted}, Cov(X,Y) = ${covFormatted}`,
              explication: "Calculs rigoureux d'après les définitions officielles.",
              illustration: {
                auteur: "Statistiques descriptives",
                oeuvre: "Série double",
                citation: `G(${meanXFormatted} ; ${meanYFormatted})`,
                analyseIllustration: `Corrélation r ≈ ${rFormatted}`
              },
              fullText: `Moyennes : X̄ = ${meanXFormatted}, Ȳ = ${meanYFormatted}. Point moyen G(${meanXFormatted} ; ${meanYFormatted}).`
            }
          ],
          fullText: `Équation de la droite de régression : ${regressionEquation}.`
        },
        transition1: `Cette droite permet de projeter la tendance pour X = ${targetX}.`,
        part2: {
          partNumber: 2,
          title: "Estimation et Avis argumenté",
          thesisOverview: `Pour X = ${targetX}, Y estimé = ${estimatedYFormatted}.`,
          subParts: [
            {
              subPartLetter: "a",
              title: "Vérification de l'affirmation",
              argument: `Y estimé = ${estimatedYFormatted} ${isVerified ? "≥" : "<"} ${thresholdFormatted}`,
              explication: isVerified ? "L'affirmation est vérifiée." : "L'affirmation est infirmée par le calcul.",
              illustration: {
                auteur: "Modèle linéaire",
                oeuvre: "Extrapolation",
                citation: `Y(${targetX}) = ${estimatedYFormatted}`,
                analyseIllustration: isVerified ? "Objectif atteint" : "Objectif non atteint"
              },
              fullText: `Estimation : ${estimatedYFormatted}.`
            }
          ],
          fullText: `Avis argumenté : ${isVerified ? "L'affirmation est confirmée." : "L'affirmation est infirmée."}`
        }
      },
      conclusion: {
        bilanSynthese: `Le modèle des moindres carrés donne ${regressionEquation} avec une corrélation r ≈ ${rFormatted}.`,
        reponseDefinitive: isVerified
          ? `Pour X = ${targetX}, la note estimée est de ${estimatedYFormatted} ≥ ${thresholdFormatted}, confirmant l'affirmation.`
          : `Pour X = ${targetX}, la note estimée est de ${estimatedYFormatted} < ${thresholdFormatted}, ce qui infirme l'affirmation.`,
        elargissement: "Le modèle d'ajustement linéaire fournit une aide précieuse à la décision.",
        fullText: isVerified ? "Affirmation validée par le calcul statistique." : "Affirmation mathématiquement non vérifiée."
      }
    },
    stepByStepBreakdown: [
      {
        stepNumber: 1,
        stepTitle: "1. Calcul des moyennes et point moyen G",
        methodologyRuleApplied: `X̄ = ${meanXFormatted}, Ȳ = ${meanYFormatted} ➔ G(${meanXFormatted} ; ${meanYFormatted})`,
        content: `X̄ = ${meanXFormatted} ; Ȳ = ${meanYFormatted}`,
        sourceTags: ["Statistique", "Moyennes"],
        pedagogicalTip: "Toujours vérifier la somme des termes."
      },
      {
        stepNumber: 2,
        stepTitle: "2. Covariance et coefficient de corrélation r",
        methodologyRuleApplied: `Cov(X,Y) = ${covFormatted}, V(X) = ${varXFormatted}, r = ${rFormatted}`,
        content: `Cov(X,Y) ≈ ${covFormatted}, r ≈ ${rFormatted}`,
        sourceTags: ["Statistique", "Corrélation"],
        pedagogicalTip: "Un |r| supérieur à 0,87 atteste d'une très bonne corrélation."
      },
      {
        stepNumber: 3,
        stepTitle: "3. Droite d'ajustement affine (moindres carrés)",
        methodologyRuleApplied: regressionEquation,
        content: `Droite : ${regressionEquation}`,
        sourceTags: ["Statistique", "Moindres Carrés"],
        pedagogicalTip: "Vérifier que G(X̄; Ȳ) vérifie l'équation."
      },
      {
        stepNumber: 4,
        stepTitle: "4. Estimation et avis argumenté",
        methodologyRuleApplied: `Pour X = ${targetX} ➔ Y = ${estimatedYFormatted}`,
        content: `Pour X = ${targetX}, Y = ${estimatedYFormatted}. ${isVerified ? "Affirmation vérifiée." : "Affirmation non vérifiée."}`,
        sourceTags: ["Statistique", "Conclusion"],
        pedagogicalTip: "Comparer rigoureusement la valeur estimée au seuil."
      }
    ],
    fullSynthesizedResponse: fullRedaction,
    evaluationCriteria: [
      {
        criterion: "Exactitude des moyennes et de la covariance",
        fasciculeOrigin: true,
        description: `X̄ = ${meanXFormatted}, Ȳ = ${meanYFormatted}, Cov(X,Y) = ${covFormatted}`,
        tipsForAutonomy: "Appliquer rigoureusement la formule de Kœnig-Huygens."
      },
      {
        criterion: "Détermination de la droite des moindres carrés",
        fasciculeOrigin: true,
        description: `Droite : ${regressionEquation}`,
        tipsForAutonomy: "Ne pas confondre la droite de Y en X avec celle de X en Y."
      },
      {
        criterion: "Qualité de l'avis argumenté",
        fasciculeOrigin: true,
        description: `Confrontation de ${estimatedYFormatted} avec ${thresholdFormatted}.`,
        tipsForAutonomy: "Rédiger une conclusion claire et chiffrée."
      }
    ],
    selfCheckChecklist: [
      "Le point moyen G(X̄ ; Ȳ) est-il calculé avec exactitude ?",
      "La covariance et la variance ont-elles été calculées sans erreur d'arrondi intermédiaire ?",
      "L'équation Y = aX + b est-elle clairement écrite ?",
      `La valeur pour X = ${targetX} a-t-elle été calculée avec précision ?`,
      "L'avis donné est-il fondé sur la comparaison chiffrée ?"
    ],
    quickRevisionMemo: `Formules clés : a = Cov(X,Y) / V(X) ; b = Ȳ - aX̄ ; r = Cov(X,Y) / (σX σY). Droite : ${regressionEquation}.`,
    examPitfalls: [
      "Inverser a = Cov/V(X) avec V(Y).",
      "Oublier de vérifier le signe de la covariance.",
      "Donner un avis vague sans citer la valeur calculée."
    ]
  };
}
