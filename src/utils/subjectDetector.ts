import { DisciplineType, EducationCycle, SecondaryLevel, AcademicSerie } from '../types';
import { DEFAULT_FASCICULES } from '../data/defaultFascicules';

const VALID_DISCIPLINES: DisciplineType[] = [
  'philo', 'francais', 'histoire', 'geographie',
  'mathematiques', 'physique_chimie', 'svt',
  'anglais', 'allemand', 'espagnol',
];

/**
 * Calls the semantic AI classifier (/api/detect-subject) to identify the discipline of a
 * subject/exercise the way a human expert (or Claude) would — by understanding the meaning
 * of the statement, not just matching exact keywords. Works for any discipline (Maths,
 * Physique-Chimie, SVT included) and any class level. Returns null if the AI call fails or
 * times out, so callers can gracefully fall back to the local keyword-based detector.
 */
export async function detectDisciplineWithAI(
  rawSubject: string,
  signal?: AbortSignal
): Promise<{ discipline: DisciplineType; exerciseType?: string } | null> {
  const trimmed = rawSubject.trim();
  if (!trimmed || trimmed.length < 6) return null;

  try {
    const res = await fetch('/api/detect-subject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectTopic: trimmed }),
      signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const disc = data?.data?.discipline as DisciplineType | undefined;
    if (!disc || !VALID_DISCIPLINES.includes(disc)) return null;
    return { discipline: disc, exerciseType: data?.data?.exerciseType };
  } catch {
    return null;
  }
}

/**
 * Runs the fast local (instant) detection immediately, then refines it in the background with
 * the semantic AI classifier so that math/physics-chemistry/SVT (and every other discipline)
 * get detected reliably regardless of phrasing or class level. `onRefined` is called only if
 * the AI changes the outcome, so the caller can update its UI without flicker otherwise.
 */
export function detectSubjectMetadataSmart(
  rawSubject: string,
  onRefined: (result: SubjectDetectionResult) => void,
  signal?: AbortSignal
): SubjectDetectionResult {
  const instant = detectSubjectMetadata(rawSubject);

  detectDisciplineWithAI(rawSubject, signal).then((aiResult) => {
    if (!aiResult) return;
    if (aiResult.discipline === instant.discipline) return; // already agrees, nothing to refine
    const refined = detectSubjectMetadata(rawSubject, aiResult.discipline);
    onRefined(refined);
  });

  return instant;
}

export interface SubjectDetectionResult {
  discipline: DisciplineType;
  disciplineLabel: string;
  disciplineIcon?: string;
  cycle: EducationCycle;
  cycleLabel: string;
  level: SecondaryLevel;
  levelLabel: string;
  serie: AcademicSerie;
  serieLabel: string;
  exerciseType: string;
  exerciseCategory: 'dissertation' | 'commentaire' | 'etude_document' | 'reflexion' | 'resume' | 'texte_argumentatif' | 'situation_evaluation' | 'recit_redaction';
  confidence: number;
  matchedKeywords: string[];
  recommendedFasciculeId: string;
  recommendedPlanStructure: '2_axes' | '3_axes';
  explanation: string;
}

interface DisciplineSignature {
  discipline: DisciplineType;
  disciplineLabel: string;
  disciplineIcon?: string;
  fasciculeId: string;
  primaryKeywords: RegExp[];
  secondaryKeywords: RegExp[];
  authorsAndFigures: RegExp[];
  typicalSubjects: RegExp[];
}

const DISCIPLINE_SIGNATURES: DisciplineSignature[] = [
  // 1. PHILOSOPHIE
  {
    discipline: 'philo',
    disciplineLabel: 'Philosophie',
    
    fasciculeId: 'philo-dissertation',
    primaryKeywords: [
      /\b(philosoph\w*|pens\w+|conscience|inconscient|libert[ée]|d[ée]sir|devoir|morale|justice|droit|état|etat|v[ée]rit[ée]|raison|science|technique|art|bonheur|travail|langage|autrui|existence|mort|nature|ali[ée]nation|souverainet[ée]|th[ée]orie|praxis|aporie|notion|concept)\b/i,
      /\b(ali[ée]ne|lib[èe]re|affranch\w+|asserv\w+|connaissance|absolu|relatif|universel|singulier|essence|m[ée]taphysique|ontolog\w+|d[ée]terminisme)\b/i,
    ],
    secondaryKeywords: [
      /\b(peut-on|faut-il|est-il l[ée]gitime|en quoi|suffit-il|l'homme est-il|l'humanit[ée]|la condition humaine)\b/i,
      /\b(vérité|illusion|jugement|vertu|souverain|tyrannie|démocratie|morale|éthique)\b/i,
    ],
    authorsAndFigures: [
      /\b(descartes|kant|hegel|nietzsche|sartre|rousseau|platon|aristote|spinoza|marx|freud|alain|bergson|[ée]picure|machiavel|hobbes|locke|hannah arendt|pascal|montaigne|augustin|s[ée]n[èe]que|bacon|jonas|canguilhem|foucault)\b/i,
    ],
    typicalSubjects: [
      /nous lib[èe]re-t-il ou nous ali[èe]ne-t-il/i,
      /l'[ée]tat est-il/i,
      /la libert[ée] consiste-t-elle/i,
      /peut-on d[ée]sob[ée]ir/i,
      /le travail est-il/i,
      /l'art est-il/i,
    ],
  },

  // 2. FRANÇAIS & LITTÉRATURE (6e à Terminale)
  {
    discipline: 'francais',
    disciplineLabel: 'Français & Lettres',
    
    fasciculeId: 'francais-litterature',
    primaryKeywords: [
      /\b(litt[ée]rature|litt[ée]raire|th[ée]âtre|roman|po[ée]sie|po[èe]me|po[èe]te|vers|com[ée]die|trag[ée]die|dramaturge|dramatique|[ée]crivain|auteur|lecteur|spectateur|personnage|sc[èe]ne|hilarit[ée]|esth[ée]tique|fiction|r[ée]cit|narrat\w+|lyri\w+|militant\w+|engagement|versification|strophe|alexandrin|rimes?|m[ée]taphore|catharsis|didascalie|tragique|comique)\b/i,
      /\b(expliqu\w+ et discut\w+|dans quelle mesure l'[ée]crivain|l'œuvre litt[ée]raire|le roman est|la po[ée]sie est|le th[ée]âtre est|la fonction du roman|le r[ôo]le de l'[ée]crivain)\b/i,
      /\b([ée]tayant|[ée]taye|[ée]tayer|r[ée]futant|r[ée]fute|r[ée]futer|cdvr|commission dialogue|texte argumentatif|sujet de r[ée]flexion|r[ée]sum[ée] de texte|volume initial|1\/3 de son volume|marge de plus ou moins 10%|bepc)\b/i,
      /\b(portrait|raconte|d[ée]cris|dialogue|conte|fable|sch[ée]ma narratif|p[ée]rip[ée]ties|compr[ée]hension du texte|grammaire|conjugaison)\b/i,
    ],
    secondaryKeywords: [
      /\b(miser sur|distraction|d[ée]tente|amusement|divertissement|peindre la soci[ée]t[ée]|miroir|[ée]mouvoir|instruire|plaire|d[ée]noncer|t[ée]moigner)\b/i,
      /\b(roman n[ée]gro-africain|n[ée]gritude|romantisme|r[ée]alisme|naturalisme|classicisme|surr[ée]alisme|symbolisme)\b/i,
    ],
    authorsAndFigures: [
      /\b(c[ée]saire|senghor|dadi[ée]|kourouma|camara laye|oyono|moli[èe]re|victor hugo|baudelaire|zola|stendhal|flaubert|camus|anouilh|marivaux|rimbaud|verlaine|mallarm[ée]|corneille|racine|la fontaine|montesquieu|voltaire|balzac|maupassant|jean-paul sartre|david diop|guy de maupassant|hyacinthe kacou|guillaume oyono|brigivie guirathe)\b/i,
    ],
    typicalSubjects: [
      /le th[ée]âtre n'est fait que pour/i,
      /l'[ée]crivain doit [êe]tre la voix/i,
      /la po[ée]sie a-t-elle pour seule fonction/i,
      /le roman est un miroir/i,
      /au cours d'un d[ée]bat/i,
      /identifie le th[èe]me/i,
      /reformule la th[èe]se/i,
      /r[ée]sume ce texte/i,
      /raconte une sc[èe]ne/i,
      /fais le portrait/i,
    ],
  },

  // 3. HISTOIRE (6e à Terminale)
  {
    discipline: 'histoire',
    disciplineLabel: 'Histoire',
    
    fasciculeId: 'histoire-methodologie',
    primaryKeywords: [
      /\b(histoire|historique|guerre|conflit|trait[ée]|r[ée]volution|d[ée]colonisation|ind[ée]pendance|guerre froide|bipolarisation|imp[ée]rialisme|colonisation|tiers-monde|nationalisme|conf[ée]rence|onu|sdn|r[ée]sistance|crise|fascisme|nazisme|totalitarisme|d[ée]mocratie|empire|monarchie|r[ée]publique|bataille|armistice|pr[ée]histoire|antiquit[ée]|moyen [âa]ge|empires soudanais|ghana|mali|songha[ïi]|traite n[ée]gri[èe]re)\b/i,
      /\b(1914|1918|1939|1945|1947|1955|1956|1960|1962|1989|1991|xixe si[èe]cle|xxe si[èe]cle|yalta|potsdam|bandung|berlin|cuba|vietnam|alg[ée]rie|rda|syndicat agricole)\b/i,
    ],
    secondaryKeywords: [
      /\b(causes?|cons[ée]quences?|enjeux|bilan|facteurs?|[ée]tapes?|[ée]volution|c[ée]sure|rupture|tournant|continuit[ée]|processus|phase)\b/i,
    ],
    authorsAndFigures: [
      /\b(houphou[ëe]t-boigny|samory tour[ée]|de gaulle|churchill|roosevelt|staline|khrouchtchev|kennedy|gorbatchev|l[ée]nine|hitler|mussolini|mao|nasser|nkrumah|mandela|lumumba|sekou tour[ée]|sankara|soundiata keita|kankan moussa|sonni ali ber)\b/i,
    ],
    typicalSubjects: [
      /relations am[ée]ricano-sovi[ée]tiques/i,
      /la guerre froide/i,
      /la bipolarisation du monde/i,
      /la d[ée]colonisation en afrique/i,
      /la conf[ée]rence de bandung/i,
      /l'accession de la c[ôo]te d'ivoire/i,
      /les grands empires/i,
    ],
  },

  // 4. GÉOGRAPHIE (6e à Terminale)
  {
    discipline: 'geographie',
    disciplineLabel: 'Géographie',
    
    fasciculeId: 'geographie-methodologie',
    primaryKeywords: [
      /\b(g[ée]ographie|g[ée]ographique|espace|territoire|spatial|am[ée]nagement|d[ée]veloppement|agriculture|agricole|cacao|caf[ée]|industrie|port|abidjan|san pedro|ville|urbain|urbanisation|rural|exode rural|littoral|littoralisation|climat|relief|hydrographie|population|d[ée]mographie|flux|mondialisation|puissance|[ée]tats-unis|usa|chine|ue|triade|m[ée]tropole|m[ée]gapole|hinterland|d[ée]forestation|environnement|reboisement)\b/i,
    ],
    secondaryKeywords: [
      /\b(atouts?|contraintes?|facteurs?|disparit[ée]s?|in[ée]galit[ée]s?|contrastes?|dynamiques?|perspectives?|d[ée]fis?|mutations?|croissance|potentiel)\b/i,
    ],
    authorsAndFigures: [
      /\b(c[ôo]te d'ivoire|afrique subsaharienne|am[ée]rique du nord|sun belt|manufacturing belt|fa[çc]ade maritime|golfe de guin[ée]e|fleuve bandama|fleuve como[ée]|sassandra|cavally)\b/i,
    ],
    typicalSubjects: [
      /l'agriculture ivoirienne/i,
      /le port autonome d'abidjan/i,
      /les contrastes nord\/sud/i,
      /l'am[ée]nagement du territoire/i,
      /l'organisation de l'espace am[ée]ricain/i,
      /l'urbanisation en afrique/i,
      /la d[ée]forestation en c[ôo]te d'ivoire/i,
    ],
  },

  // 5. MATHÉMATIQUES (6e à Terminale)
  {
    discipline: 'mathematiques',
    disciplineLabel: 'Mathématiques',
    
    fasciculeId: 'math-lycee',
    primaryKeywords: [
      /\b(math[ée]matiques?|maths?|calcul\w*|calcule|calculer|résoudre|résous|simplifier|simplifie|fonction|d[ée]riv[ée]e|int[ée]grale|primitive|limite|suite|complexe|barycentre|probabilit[ée]|statistique|statistiques|s[ée]rie double|nuage de points|point moyen|droite de mayer|ajustement lin[ée]aire|droite de r[ée]gression|moindres carr[ée]s|cov\(x,y\)|covariance|coefficient de corr[ée]lation|rang de l'ann[ée]e|pourcentage|matrice|vecteur|rep[èe]re|asymptote|tableau de variations|in[ée]quation|[ée]quation|r[ée]currence|convex\w+|tangente|polyn[ôo]me|trigonom[ée]tr\w+|exponentielle|logarithme|ln\(|exp\(|e\^[a-z0-9]|f\(x\)|g\(x\)|u_n|u_\{n\}|\(u_n\)|z_A|z_B|factoriser|d[ée]velopper et r[ée]duire|identit[ée]s? remarquables?|pythagore|thal[èe]s|calcul litt[ée]ral|fraction|arithm[ée]tique|pgcd|ppcm|sym[ée]trie|angle|cos|sin|tan|cosinus|sinus|tangente|infini|infinie?s?|\+∞|\-∞|∞)\b/i,
      /\b(d[ée]montrer par r[ée]currence|calculer la d[ée]riv[ée]e|dresser le tableau de variation|calculer la limite|d[ée]terminer l'ensemble de d[ée]finition|r[ée]soudre dans [RCZ]|calculer l'esp[ée]rance|loi de probabilit[ée]|loi binomiale|d[ée]terminer la nature de la transformation|forme exponentielle|module et argument|calculer la distance|d[ée]montrer que le triangle est rectangle|connaissances math[ée]matiques|production argument[ée] bas[ée]e sur|taux de r[ée]ussite)\b/i,
      /\d+\s*[\+\-\*\/×÷\^=]\s*\d+/,
    ],
    secondaryKeywords: [
      /\b(convexe|concave|point d'inflexion|bijection|th[ée]or[èe]me des valeurs interm[ée]diaires|tvi|accroissements finis|somme|produit scalaire|produit vectoriel|plan affine|droite de r[ée]gression|moindres carr[ée]s|cov\w+|variance|[ée]cart-type|tirage sans remise|tirage avec remise|combinaisons?|arrangements?|⃗[a-zA-Z]+|cos\(|sin\(|tan\(|\+inf|\-inf|\+infini|\-infini|ajustement affine|m[ée]thode des moindres carr[ée]s|m[ée]thode de mayer)\b/i,
      /\b(f'\(x\)|f''\(x\)|lim_{|\\lim|\\int|\\sum|\\frac|\\sqrt|\\alpha|\\beta|\\theta|\\pi|[0-9]+[xXyYzZ]|[xXyYzZ]\^2|x̄|ȳ)\b/i,
    ],
    authorsAndFigures: [
      /\b(pythagore|thal[èe]s|euler|newton|leibniz|gauss|descartes|pascal|fermat|cauchy|riemann|laplace|bernoulli|poisson|bayes|mayer)\b/i,
    ],
    typicalSubjects: [
      /soit la fonction f/i,
      /soit la suite \(/i,
      /d[ée]terminer les limites/i,
      /r[ée]soudre dans c/i,
      /une urne contient/i,
      /montrer que pour tout n/i,
      /étudier les variations/i,
      /calculer l'int[ée]grale/i,
      /factoriser l'expression/i,
      /d[ée]velopper et r[ée]duire/i,
      /soit a\(x\) =/i,
    ],
  },

  // 6. PHYSIQUE - CHIMIE (Collège & Lycée)
  {
    discipline: 'physique_chimie',
    disciplineLabel: 'Physique - Chimie',
    
    fasciculeId: 'physique-chimie-expert',
    primaryKeywords: [
      /\b(physique|chimie|m[ée]canique|cin[ée]matique|dynamique|newton|pesanteur|frottement|vitesse|acc[ée]l[ée]ration|trajectoire|projectile|satellite|kepler|gravitation|vecteur vitesse|[ée]nergie cin[ée]tique|[ée]nergie potentielle|travail|puissance|ressort|pendule|oscillateur|condensateur|bobine|dip[ôo]le|circuit rc|circuit rl|circuit rlc|onde|fr[ée]quence|p[ée]riode|longueur d'onde|optique|lentille|vergence|foyer|radioactivit[ée]|demi-vie|noyau|nucl[ée]aire|d[ée]faut de masse|mol|molaire|concentration|acide|base|ph|pka|tampon|dosage|titrage|[ée]quivalence|avancement|r[ée]actif limitant|oxydor[ée]duction|r[ée]action redox|oxydant|r[ée]ducteur|cin[ée]tique chimique|catalyseur|est[ée]rification|hydrolyse|saponification|alc[oo]l|alc[èe]ne|alcane|ester|acide carboxylique)\b/i,
      /\b(loi de newton|th[ée]or[èe]me de l'[ée]nergie cin[ée]tique|bilan des forces|tableau d'avancement|relation de dosage|constante d'[ée]quilibre|demi-[ée]quation|[ée]quation diff[ée]rentielle|constante de temps \tau)\b/i,
    ],
    secondaryKeywords: [
      /\b(joule|watt|newton|volt|amp[èe]re|ohm|farad|henry|becquerel|kelvin|pression|pascal|volume|masse volumique|quantit[ée] de mati[èe]re|conductim[ée]trie|absorbance|spectrophotom[ée]trie)\b/i,
      /\b(m\/s|m\.s\^\{-1\}|rad\/s|mol\/l|g\/mol|g\/l|kg|cm\^3|ml)\b/i,
    ],
    authorsAndFigures: [
      /\b(newton|kepler|galil[ée]e|coulomb|faraday|amp[èe]re|ohm|maxwell|planck|einstein|bohr|curie|lavoisier|mendele[ïi]ev|br[öo]nsted|le chatelier|arrhenius)\b/i,
    ],
    typicalSubjects: [
      /un solide de masse m/i,
      /on lance un projectile/i,
      /un condensateur de capacit[ée]/i,
      /on dose un volume v/i,
      /on m[ée]lange une mole/i,
      /la d[ée]sint[ée]gration du/i,
      /calculer l'acc[ée]l[ée]ration/i,
      /d[ée]terminer la constante de temps/i,
      /calculer le ph de la solution/i,
    ],
  },

  // 7. SCIENCES DE LA VIE ET DE LA TERRE (SVT)
  {
    discipline: 'svt',
    disciplineLabel: 'SVT',
    
    fasciculeId: 'svt-sciences-vie-terre',
    primaryKeywords: [
      /\b(svt|biologie|g[ée]ologie|cellule|adn|arn|chromosome|g[èe]ne|all[èe]le|mitose|m[ée]iose|crossing-over|brassage|drosophile|croisement|g[ée]notype|ph[ée]notype|arbre g[ée]n[ée]alogique|h[ée]r[ée]dit[ée]|mutation|prot[ée]ine|transcription|traduction|syst[èe]me immunitaire|anticorps|antig[èe]ne|lymphocyte|lymphocytes? (t4|t8|b)|plasmocyte|phagocytose|vih|sida|s[ée]ropositif|vaccin|neurone|synapse|r[ée]flexe myotatique|potentiel d'action|potentiel de repos|neurotransmetteur|hormone|glyc[ée]mie|pancr[ée]as|insuline|glucagon|fsh|lh|progest[ée]rone|œstrog[èe]ne|ovulation|spermatozo[ïi]de|f[ée]condation|tectonique|plaque|subduction|dorsale|magmatisme|volcanisme|s[ée]isme|orogen[èe]se|m[ée]tamorphisme|lithosph[èe]re|asth[ée]nosph[èe]re|p[ée]ridotite|granite|basalte)\b/i,
      /\b(sch[ée]ma fonctionnel|sch[ée]ma bilan|restitution organis[ée]e|arbre g[ée]n[ée]alogique|brassage interchromosomique|brassage intrachromosomique|transmission d'une anomalie|zone de convergence)\b/i,
    ],
    secondaryKeywords: [
      /\b(dominant|r[ée]cessif|codominant|autosome|gonosome|chromosome x|caryotype|g[èe]nes li[ée]s|g[èe]nes ind[ée]pendants|test-cross|r[ée]trocroisement|recombin[ée]s|all[èe]le sain|all[èe]le mut[ée])\b/i,
      /\b(je constate|or je sais que|j'en d[ée]duis que|mise en relation|bilan fonctionnel)\b/i,
    ],
    authorsAndFigures: [
      /\b(mendel|morgan|watson|crick|darwin|pasteur|wegener)\b/i,
    ],
    typicalSubjects: [
      /arbre g[ée]n[ée]alogique/i,
      /croisement de drosophiles/i,
      /r[ée]ponse immunitaire/i,
      /potentiel d'action/i,
      /la subduction oc[ée]anique/i,
      /la r[ée]gulation de la glyc[ée]mie/i,
      /coop[ée]ration cellulaire/i,
    ],
  },

  // 8. ANGLAIS
  {
    discipline: 'anglais',
    disciplineLabel: 'Anglais',
    
    fasciculeId: 'anglais-exam-excellence',
    primaryKeywords: [
      /\b(anglais|english|reading comprehension|passive voice|reported speech|conditionals?|relative clause|essay|composition|wh- questions|true or false|text indicates|author's purpose|synonyms?|antonyms?|fill in the blanks|turn into passive|give your opinion|write an essay|write a letter|discuss this statement|topic sentence|linking words)\b/i,
      /\b(although|furthermore|moreover|however|on the other hand|therefore|in conclusion|nevertheless|despite|in order to|as a result)\b/i,
    ],
    secondaryKeywords: [
      /\b(past continuous|past perfect|present perfect|modal verbs|must|should|would have|irregular verbs|phrasal verbs|adverb|adjective|prefix|suffix)\b/i,
      /\b(globalization|social media|technology|climate change|education|youth|employment|environment|human rights)\b/i,
    ],
    authorsAndFigures: [
      /\b(shakespeare|orwell|woolf|hemingway|dickens|chinua achebe|wole soyinka|ngugi wa thiong'o|toni morrison)\b/i,
    ],
    typicalSubjects: [
      /write an essay/i,
      /do you agree or disagree/i,
      /turn the following into passive/i,
      /comprehension questions/i,
      /write a formal letter/i,
      /discuss the advantages and disadvantages/i,
    ],
  },

  // 9. ALLEMAND
  {
    discipline: 'allemand',
    disciplineLabel: 'Allemand',
    
    fasciculeId: 'allemand-excellence-lv2',
    primaryKeywords: [
      /\b(allemand|deutsch|german|textverst[äa]ndnis|grammatik|aufsatz|stellungnahme|[üu]bersetzung|version|thema|fragen zum text|richtig oder falsch|deklination|adjektivdeklination|kasus|nominativ|akkusativ|dativ|genitiv|passiv|konjunktiv ii|nebensatz|weil|obwohl|damit|wenn|dass|um\s*\.\.\.\s*zu|pr[äa]positionen|wechselpr[äa]positionen)\b/i,
      /\b(zuerst|au[ßs]erdem|dar[üu]ber hinaus|einerseits|andererseits|meiner meinung nach|schlie[ßs]lich|zusammenfassend)\b/i,
    ],
    secondaryKeywords: [
      /\b(w-fragen|zeilennummer|textstelle|satzbau|verbletztstellung|partizip ii|modalverben|trennbare verben|konjugation)\b/i,
      /\b(umweltschutz|jugend|beruf|ausbildung|digitalisierung|klimawandel|solidarit[äa]t)\b/i,
    ],
    authorsAndFigures: [
      /\b(goethe|schiller|kafka|brecht|thomas mann|heinrich b[öo]ll)\b/i,
    ],
    typicalSubjects: [
      /fragen zum text/i,
      /richtig oder falsch/i,
      /setzen sie ins passiv/i,
      /was ist ihre meinung/i,
      /verfassen sie einen leserbrief/i,
      /nehmen sie stellung/i,
    ],
  },

  // 10. ESPAGNOL
  {
    discipline: 'espagnol',
    disciplineLabel: 'Espagnol',
    
    fasciculeId: 'espagnol-excellence-lv2',
    primaryKeywords: [
      /\b(espagnol|espa[ñn]ol|spanish|comprensi[óo]n lectora|gram[áa]tica|redacci[óo]n|ensayo|preguntas de comprensi[óo]n|verdadero o falso|justificaci[óo]n textual|subjuntivo|presente de subjuntivo|imperfecto de subjuntivo|ser y estar|ser o estar|por y para|por o para|concordancia|per[íi]frasis|voz pasiva|estilo indirecto|conectores)\b/i,
      /\b(en primer lugar|adem[áa]s|por un lado|por otro lado|sin embargo|por lo tanto|en conclusi[óo]n|a mi parecer|opino que)\b/i,
    ],
    secondaryKeywords: [
      /\b(pret[ée]rito perfecto|pret[ée]rito indefinido|imperfecto|condicional|acentuaci[óo]n|pronombres|art[íi]culos|g[ée]nero y n[úu]mero)\b/i,
      /\b(juventud|medio ambiente|tecnolog[íi]a|migraci[óo]n|educaci[óo]n|sociedad hispana)\b/i,
    ],
    authorsAndFigures: [
      /\b(cervantes|garc[íi]a m[áa]rquez|borges|lorca|neruda|octavio paz|isabel allende|cort[áa]zar)\b/i,
    ],
    typicalSubjects: [
      /preguntas de comprensi[óo]n/i,
      /verdadero o falso/i,
      /complete con ser o estar/i,
      /use el subjuntivo/i,
      /redacci[óo]n/i,
      /d[ée] su opini[óo]n/i,
      /escriba un art[íi]culo/i,
    ],
  },
];

/**
 * Detect Specific Academic Serie (Terminale A2, A1, D, C, E, 1ère A/CD, 2nde A/C, 3e BEPC...)
 */
export function detectAcademicSerie(text: string, level: SecondaryLevel): { serie: AcademicSerie; serieLabel: string } {
  // 1. Explicit Series keywords
  if (/\b(terminale\s*a2|tle\s*a2|bac\s*a2|s[ée]rie\s*a2|\ba2\b)\b/i.test(text)) {
    return { serie: 'tle_a2', serieLabel: 'Terminale A2 (Programme A2)' };
  }
  if (/\b(terminale\s*a1|tle\s*a1|bac\s*a1|s[ée]rie\s*a1|\ba1\b)\b/i.test(text)) {
    return { serie: 'tle_a1', serieLabel: 'Terminale A1 (Programme A1)' };
  }
  if (/\b(terminale\s*d|tle\s*d|bac\s*d|s[ée]rie\s*d|\bd\b)\b/i.test(text)) {
    return { serie: 'tle_d', serieLabel: 'Terminale D (Programme D)' };
  }
  if (/\b(terminale\s*c|tle\s*c|bac\s*c|s[ée]rie\s*c|\bc\b)\b/i.test(text)) {
    return { serie: 'tle_c', serieLabel: 'Terminale C (Programme C)' };
  }
  if (/\b(terminale\s*e|tle\s*e|bac\s*e|s[ée]rie\s*e|ti|technique\s*industrielle)\b/i.test(text)) {
    return { serie: 'tle_e', serieLabel: 'Terminale E / TI (Technologique)' };
  }
  if (/\b(1[èe]re\s*a|1re\s*a|premi[èe]re\s*a|1ere\s*a|1[èe]re\s*a2|1[èe]re\s*a1)\b/i.test(text)) {
    return { serie: '1ere_a', serieLabel: 'Première A (Littéraire)' };
  }
  if (/\b(1[èe]re\s*c|1re\s*c|premi[èe]re\s*c|1[èe]re\s*d|1re\s*d|premi[èe]re\s*d|1[èe]re\s*s|1re\s*s)\b/i.test(text)) {
    return { serie: '1ere_c_d', serieLabel: 'Première C / D (Scientifique)' };
  }
  if (/\b(2nde\s*a|2de\s*a|seconde\s*a)\b/i.test(text)) {
    return { serie: '2nde_a', serieLabel: 'Seconde A (Littéraire)' };
  }
  if (/\b(2nde\s*c|2de\s*c|seconde\s*c|2nde\s*s|seconde\s*s)\b/i.test(text)) {
    return { serie: '2nde_c', serieLabel: 'Seconde C (Scientifique)' };
  }
  if (level === '3e' || /\b(3[èe]me|3e|troisi[èe]me|bepc|brevet)\b/i.test(text)) {
    return { serie: '3e_bepc', serieLabel: 'Classe de 3ᵉ (BEPC)' };
  }
  if (level === '6e' || level === '5e' || level === '4e') {
    return { serie: 'college_6e_4e', serieLabel: 'Collège (6ᵉ - 5ᵉ - 4ᵉ)' };
  }
  if (level === 'superieur') {
    return { serie: 'superieur', serieLabel: 'Enseignement Supérieur / Université' };
  }

  // Implicit / Topic-based series matching
  if (/\b(mayer|droite\s+de\s+mayer|s[ée]rie\s+double.*mayer)\b/i.test(text)) {
    return { serie: 'tle_a2', serieLabel: 'Terminale A2 (Méthode de Mayer / Programme A2)' };
  }
  if (/\b(similitudes?|arithm[ée]tique.*modulo|congruence|espace\s+vectoriel|barycentre\s+dans\s+l['’]espace)\b/i.test(text)) {
    return { serie: 'tle_c', serieLabel: 'Terminale C (Notions approfondies Série C)' };
  }

  // Default general
  if (level === 'terminale') {
    return { serie: 'auto', serieLabel: 'Terminale (Toutes séries / Auto-adapté)' };
  }
  if (level === '1ere') {
    return { serie: 'auto', serieLabel: 'Première (Toutes séries)' };
  }
  if (level === '2nde') {
    return { serie: 'auto', serieLabel: 'Seconde (Toutes séries)' };
  }

  return { serie: 'auto', serieLabel: 'Auto-détecté (Toutes séries)' };
}

/**
 * Detect Specific Grade / Level (6e, 5e, 4e, 3e, 2nde, 1ere, Terminale)
 */
export function detectLevel(text: string): { level: SecondaryLevel; levelLabel: string; cycle: EducationCycle; cycleLabel: string } {
  // 1. Explicit grade checks
  if (/\b(6[èe]me|6e|sixi[èe]me)\b/i.test(text)) {
    return {
      level: '6e',
      levelLabel: 'Classe de 6ᵉ (Collège)',
      cycle: 'premier_cycle_bepc',
      cycleLabel: 'Premier Cycle (Collège)',
    };
  }
  if (/\b(5[èe]me|5e|cinqui[èe]me)\b/i.test(text)) {
    return {
      level: '5e',
      levelLabel: 'Classe de 5ᵉ (Collège)',
      cycle: 'premier_cycle_bepc',
      cycleLabel: 'Premier Cycle (Collège)',
    };
  }
  if (/\b(4[èe]me|4e|quatri[èe]me)\b/i.test(text)) {
    return {
      level: '4e',
      levelLabel: 'Classe de 4ᵉ (Collège)',
      cycle: 'premier_cycle_bepc',
      cycleLabel: 'Premier Cycle (Collège)',
    };
  }
  if (/\b(3[èe]me|3e|troisi[èe]me|bepc|brevet|cdvr|étayant|réfutant|r[ée]sume ce texte|au 1\/3 de son volume|marge de plus ou moins 10%|compr[ée]hension \(4pts\)|vocabulaire \(2pts\))\b/i.test(text)) {
    return {
      level: '3e',
      levelLabel: 'Classe de 3ᵉ (BEPC / Examen)',
      cycle: 'premier_cycle_bepc',
      cycleLabel: 'Premier Cycle (Collège / 3e - BEPC)',
    };
  }
  if (/\b(2nde|2de|seconde)\b/i.test(text)) {
    return {
      level: '2nde',
      levelLabel: 'Classe de 2ⁿᵈᵉ',
      cycle: 'second_cycle_bac',
      cycleLabel: 'Second Cycle (2nde, 1ère, Tle)',
    };
  }
  if (/\b(1[èe]re|1re|premi[èe]re|1ere)\b/i.test(text)) {
    return {
      level: '1ere',
      levelLabel: 'Classe de 1ʳᵉ',
      cycle: 'second_cycle_bac',
      cycleLabel: 'Second Cycle (2nde, 1ère, Tle)',
    };
  }
  if (/\b(terminale|tle|bac|baccalaur[ée]at)\b/i.test(text)) {
    return {
      level: 'terminale',
      levelLabel: 'Classe de Terminale (BAC)',
      cycle: 'second_cycle_bac',
      cycleLabel: 'Second Cycle (BAC)',
    };
  }

  // 1.5 Higher Education / University / CPGE checks
  if (/\b(licence|l1|l2|l3|master|mpsi|pcsi|mp|psi|bcpst|cpge|pr[ée]pa|bts|dut|universit[ée]|sup[ée]rieur|endomorphisme|espace vectoriel|diagonalis\w+|valeurs? propres?|vecteurs? propres?|polyn[ôo]me caract[ée]ristique|d[ée]veloppement limit[ée]|int[ée]grale impropre|s[ée]rie enti[èe]re|s[ée]rie num[ée]rique|topologie|espace m[ée]trique)\b/i.test(text)) {
    return {
      level: 'superieur',
      levelLabel: 'Enseignement Supérieur & Université (L1/L2/L3, CPGE)',
      cycle: 'superieur_universite',
      cycleLabel: 'Enseignement Supérieur & Université',
    };
  }

  // 2. Implicit / Pedagogical Content inference
  // College indicators (6e-4e narrative/descriptive or basic math)
  if (/\b(portrait|raconte|d[ée]cris|dialogue|conte|march[ée] au village|sch[ée]ma narratif)\b/i.test(text)) {
    return {
      level: '6e',
      levelLabel: 'Classe de 6ᵉ / 5ᵉ (Collège)',
      cycle: 'premier_cycle_bepc',
      cycleLabel: 'Premier Cycle (Collège)',
    };
  }

  if (/\b(pythagore|thal[èe]s|factoriser|d[ée]velopper et r[ée]duire|identit[ée]s? remarquables?|situation d'[ée]valuation|déforestation en côte d'ivoire)\b/i.test(text)) {
    return {
      level: '3e',
      levelLabel: 'Classe de 3ᵉ (BEPC)',
      cycle: 'premier_cycle_bepc',
      cycleLabel: 'Premier Cycle (Collège / 3e - BEPC)',
    };
  }

  // Advanced Second Cycle indicators
  if (/\b(philosoph|conscience|inconscient|ali[ée]nation|d[ée]terminisme|bipolarisation|dando|guerre froide|e\^x|ln\(|exponentielle|logarithme|intégrale|complexe|récurrence)\b/i.test(text)) {
    return {
      level: 'terminale',
      levelLabel: 'Classe de Terminale (BAC)',
      cycle: 'second_cycle_bac',
      cycleLabel: 'Second Cycle (BAC)',
    };
  }

  // Default Second Cycle
  return {
    level: 'terminale',
    levelLabel: 'Second Cycle (BAC)',
    cycle: 'second_cycle_bac',
    cycleLabel: 'Second Cycle (BAC)',
  };
}

/**
 * Detect exercise type based on discipline, cycle and specific level
 */
function detectExerciseType(text: string, discipline: DisciplineType, level: SecondaryLevel, cycle: EducationCycle): {
  exerciseType: string;
  category: 'dissertation' | 'commentaire' | 'etude_document' | 'reflexion' | 'resume' | 'texte_argumentatif' | 'situation_evaluation' | 'recit_redaction';
} {
  // 1. Classes de 6e, 5e, 4e
  if (level === '6e' || level === '5e' || level === '4e') {
    if (discipline === 'francais') {
      if (/\b(portrait|décris|description)\b/i.test(text)) {
        return {
          exerciseType: 'Expression écrite : Portrait & Description (6e/5e)',
          category: 'recit_redaction',
        };
      }
      if (/\b(dialogue|discutent|réplique)\b/i.test(text)) {
        return {
          exerciseType: 'Expression écrite : Insertion de dialogue (6e/5e/4e)',
          category: 'recit_redaction',
        };
      }
      if (/\b(argument|explique pourquoi|avis)\b/i.test(text)) {
        return {
          exerciseType: 'Expression écrite : Initiation au paragraphe argumentatif (4e)',
          category: 'recit_redaction',
        };
      }
      return {
        exerciseType: 'Expression écrite : Récit narratif & péripéties (Collège 6e-4e)',
        category: 'recit_redaction',
      };
    }

    if (discipline === 'mathematiques') {
      return {
        exerciseType: 'Exercice de Mathématiques Collège (Calcul numérique, littéral & géométrie 6e-4e)',
        category: 'reflexion',
      };
    }

    if (discipline === 'histoire' || discipline === 'geographie') {
      return {
        exerciseType: 'Questions de connaissances & Repères spatio-temporels (Collège 6e-4e)',
        category: 'situation_evaluation',
      };
    }
  }

  // 2. Classe de 3e / BEPC
  if (level === '3e' || (cycle === 'premier_cycle_bepc' && level !== '6e' && level !== '5e' && level !== '4e')) {
    if (discipline === 'francais') {
      const isResume = /\b(r[ée]sum[ée]|r[ée]sume ce texte|volume initial|compr[ée]hension \(4pts\)|vocabulaire \(2pts\)|deuxi[èe]me sujet|deuxieme sujet)\b/i.test(text);
      if (isResume) {
        return {
          exerciseType: 'Résumé de texte argumentatif & Questions (Épreuve Français 3e / BEPC)',
          category: 'resume',
        };
      }
      return {
        exerciseType: 'Texte argumentatif de réflexion - Étayer ou Réfuter (Épreuve Français 3e / BEPC)',
        category: 'texte_argumentatif',
      };
    }

    if (discipline === 'histoire' || discipline === 'geographie') {
      return {
        exerciseType: 'Situation d\'évaluation & Maîtrise des connaissances (Histoire-Géo 3e / BEPC)',
        category: 'situation_evaluation',
      };
    }

    if (discipline === 'mathematiques') {
      return {
        exerciseType: 'Exercice & Problème de Mathématiques (Calcul littéral, Thalès, Pythagore - 3e / BEPC)',
        category: 'reflexion',
      };
    }

    if (discipline === 'physique_chimie') {
      return {
        exerciseType: 'Exercice de Physique-Chimie (Électricité, Mécanique, Solutions & Chimie - 3e / BEPC)',
        category: 'reflexion',
      };
    }

    if (discipline === 'svt') {
      return {
        exerciseType: 'Exercice & Raisonnement scientifique en SVT (Reproduction, Immunité, Géologie - 3e / BEPC)',
        category: 'situation_evaluation',
      };
    }

    if (discipline === 'anglais') {
      return {
        exerciseType: 'English BEPC Exam (Reading Comprehension, Grammar & Guided Writing)',
        category: 'reflexion',
      };
    }

    if (discipline === 'allemand') {
      return {
        exerciseType: 'Deutsch BEPC Prüfung (Textverständnis, Grammatik & Kurzer Aufsatz)',
        category: 'reflexion',
      };
    }

    if (discipline === 'espagnol') {
      return {
        exerciseType: 'Español Examen BEPC (Comprensión, Gramática y Redacción)',
        category: 'reflexion',
      };
    }
  }

  // 3. Second Cycle (2nde, 1ère, Terminale)
  // Mathematics
  if (discipline === 'mathematiques') {
    if (level === '2nde' || /\b(2nde|seconde|forme canonique|polynôme du second degré)\b/i.test(text)) {
      return {
        exerciseType: 'Exercice de Mathématiques 2nde (Fonctions, Polynômes & Vecteurs)',
        category: 'reflexion',
      };
    }
    if (level === '1ere' || /\b(1ère|1ere|première|dérivée|sens de variation|barycentre)\b/i.test(text)) {
      return {
        exerciseType: 'Exercice de Mathématiques 1ère (Dérivation, Suites & Barycentres)',
        category: 'reflexion',
      };
    }
    if (/\b(probl[èe]me|partie a|partie b|partie c|étude de fonction|fonction numérique)\b/i.test(text)) {
      return {
        exerciseType: 'Problème de synthèse de Mathématiques (Étude de fonction exp/ln & Branches infinies - BAC)',
        category: 'reflexion',
      };
    }
    if (/\b(suite|récurrence|un\+1|u_n)\b/i.test(text)) {
      return {
        exerciseType: 'Exercice de suites numériques & démonstration par récurrence (BAC)',
        category: 'reflexion',
      };
    }
    if (/\b(complexe|affixe|plan complexe|module|argument|similitude)\b/i.test(text)) {
      return {
        exerciseType: 'Exercice sur les Nombres Complexes & Géométrie (BAC)',
        category: 'reflexion',
      };
    }
    if (/\b(urne|boule|probabilité|variable aléatoire|loi binomiale|espérance)\b/i.test(text)) {
      return {
        exerciseType: 'Exercice de Dénombrement, Probabilités & Variables Aléatoires (BAC)',
        category: 'reflexion',
      };
    }
    return {
      exerciseType: 'Résolution intégrale & Démonstration pas à pas de Mathématiques (BAC)',
      category: 'reflexion',
    };
  }

  // Physique - Chimie
  if (discipline === 'physique_chimie') {
    if (/\b(dosage|titrage|ph|pka|tampon|acide|base|acide éthanoïque|soude)\b/i.test(text)) {
      return {
        exerciseType: 'Problème de Chimie : Réactions acido-basiques, Dosage pH-métrique & Titrage (BAC)',
        category: 'reflexion',
      };
    }
    if (/\b(estérification|hydrolyse|saponification|ester|alcool|acide carboxylique)\b/i.test(text)) {
      return {
        exerciseType: 'Exercice de Chimie Organique : Estérification, Hydrolyse & Rendement (BAC)',
        category: 'reflexion',
      };
    }
    if (/\b(projectile|champ de pesanteur|trajectoire|vitesse v0|portée|flèche|newton)\b/i.test(text)) {
      return {
        exerciseType: 'Problème de Mécanique : Mouvement de Projectile & Lois de Newton (BAC)',
        category: 'reflexion',
      };
    }
    if (/\b(condensateur|bobine|circuit rc|circuit rlc|dipôle|oscillations)\b/i.test(text)) {
      return {
        exerciseType: 'Exercice d\'Électricité & Électronique : Circuits RC/RLC & Équations Différentielles (BAC)',
        category: 'reflexion',
      };
    }
    if (/\b(radioactivité|désintégration|demi-vie|nucléaire|défaut de masse)\b/i.test(text)) {
      return {
        exerciseType: 'Exercice de Physique Nucléaire : Radioactivité & Énergie de liaison (BAC)',
        category: 'reflexion',
      };
    }
    return {
      exerciseType: 'Résolution intégrale de Physique-Chimie avec formules littérales et calculs sans saut (BAC)',
      category: 'reflexion',
    };
  }

  // SVT
  if (discipline === 'svt') {
    if (/\b(croisement|drosophile|arbre généalogique|hérédité|allèle|dominant|récessif)\b/i.test(text)) {
      return {
        exerciseType: 'Exercice de Génétique formelle & Analyse d\'arbres généalogiques (BAC)',
        category: 'reflexion',
      };
    }
    if (/\b(immun|anticorps|antigène|lymphocyte|sida|vih|phagocytose)\b/i.test(text)) {
      return {
        exerciseType: 'Raisonnement scientifique & Restitution organisée en Immunologie (BAC)',
        category: 'reflexion',
      };
    }
    if (/\b(subduction|tectonique|plaque|dorsale|magmatisme|séisme)\b/i.test(text)) {
      return {
        exerciseType: 'Étude géologique & Dynamique de la lithosphère (BAC)',
        category: 'reflexion',
      };
    }
    return {
      exerciseType: 'Raisonnement scientifique & Exploitation méthodique de documents en SVT (BAC)',
      category: 'reflexion',
    };
  }

  // Anglais
  if (discipline === 'anglais') {
    if (/\b(essay|composition|article|letter|discuss|opinion)\b/i.test(text)) {
      return {
        exerciseType: 'English Guided Writing & Model Argumentative Essay (BAC)',
        category: 'reflexion',
      };
    }
    if (/\b(passive|reported speech|conditionals|relative)\b/i.test(text)) {
      return {
        exerciseType: 'English Language in Use & Grammar Mastery (BAC)',
        category: 'reflexion',
      };
    }
    return {
      exerciseType: 'English Comprehensive BAC Exam (Reading Comprehension, Grammar & Essay)',
      category: 'reflexion',
    };
  }

  // Allemand
  if (discipline === 'allemand') {
    if (/\b(aufsatz|stellungnahme|leserbrief|meinung)\b/i.test(text)) {
      return {
        exerciseType: 'Deutsch Freier Aufsatz & Stellungnahme (BAC)',
        category: 'reflexion',
      };
    }
    return {
      exerciseType: 'Deutsch Abiturprüfung (Textverständnis, Grammatik & Aufsatz - BAC)',
      category: 'reflexion',
    };
  }

  // Espagnol
  if (discipline === 'espagnol') {
    if (/\b(redacción|ensayo|artículo|opinión|carta)\b/i.test(text)) {
      return {
        exerciseType: 'Español Redacción y Ensayo argumentativo (BAC)',
        category: 'reflexion',
      };
    }
    return {
      exerciseType: 'Español Examen de Bachillerato (Comprensión lectora, Gramática y Redacción - BAC)',
      category: 'reflexion',
    };
  }

  const isCommentaire = 
    /\b(commentaire|commentez|expliquer le texte|lignes?\s*\d+|vers\s*\d+|strophes?\s*\d+|didascalie|d[ée]gagez l'int[ée]r[êe]t|étudiez ce texte|étudier le document)\b/i.test(text) ||
    (text.length > 300 && /\b(texte|extrait|auteur|source|date)\b/i.test(text));

  const isEtudeDocument = 
    /\b(document\s*1|document\s*2|tableau statistique|carte|graphique|dando|critique de document|analyser le document)\b/i.test(text);

  if (isEtudeDocument) {
    return {
      exerciseType: discipline === 'histoire' 
        ? 'Étude critique de document(s) historique (Méthode D-A-N-D-O - BAC)' 
        : 'Analyse documentaire & données statistiques en Géographie (BAC)',
      category: 'etude_document',
    };
  }

  if (isCommentaire) {
    if (discipline === 'francais') {
      return {
        exerciseType: 'Commentaire composé littéraire (Poésie, Roman ou Théâtre - BAC)',
        category: 'commentaire',
      };
    }
    if (discipline === 'philo') {
      return {
        exerciseType: 'Commentaire méthodique de texte philosophique (1ère & Terminale)',
        category: 'commentaire',
      };
    }
    return {
      exerciseType: 'Commentaire critique de documents (BAC)',
      category: 'commentaire',
    };
  }

  // Default: Dissertation Second Cycle / BAC
  if (discipline === 'francais') {
    return {
      exerciseType: level === '2nde'
        ? 'Dissertation littéraire guidée (2nde)'
        : 'Dissertation littéraire canonique (Expliquer & Discuter - 1ère / Tle BAC)',
      category: 'dissertation',
    };
  }
  if (discipline === 'philo') {
    return {
      exerciseType: 'Dissertation philosophique canonique (2 axes - Thèse / Antithèse 1ère & Terminale)',
      category: 'dissertation',
    };
  }
  if (discipline === 'histoire') {
    return {
      exerciseType: 'Dissertation historique (Plan Évolutif ou Thématique - BAC)',
      category: 'dissertation',
    };
  }

  return {
    exerciseType: 'Dissertation géographique (Plan Thématique & Analyse Spatiale - BAC)',
    category: 'dissertation',
  };
}

/**
 * Main auto-detection algorithm for any input text.
 * @param rawSubject The raw exercise/subject text typed or scanned by the user.
 * @param aiDiscipline Optional discipline already determined by the semantic AI classifier
 *   (see /api/detect-subject). When provided, it takes priority over the local keyword
 *   scoring below — the keyword engine still runs to infer level, exercise type and the
 *   matching fascicule, but the discipline itself is trusted from the AI (which reasons on
 *   meaning, not just keywords, and is far more reliable regardless of class level).
 */
export function detectSubjectMetadata(rawSubject: string, aiDiscipline?: DisciplineType): SubjectDetectionResult {
  const trimmed = rawSubject.trim();
  if (!trimmed) {
    const defaultFasc = DEFAULT_FASCICULES[0];
    return {
      discipline: defaultFasc.discipline,
      disciplineLabel: defaultFasc.disciplineLabel,
      
      cycle: 'premier_cycle_bepc',
      cycleLabel: 'Premier Cycle (Collège)',
      level: '6e',
      levelLabel: '6e à Terminale',
      serie: 'auto',
      serieLabel: 'Toutes séries (Auto-adapté)',
      exerciseType: 'Expression écrite & Résolution méthodique',
      exerciseCategory: 'recit_redaction',
      confidence: 100,
      matchedKeywords: [],
      recommendedFasciculeId: defaultFasc.id,
      recommendedPlanStructure: '2_axes',
      explanation: 'Moteur multi-niveaux et multi-séries (6e à la Terminale A1, A2, C, D...) actif en attente d\'un sujet.',
    };
  }

  const scores: Record<DisciplineType, { score: number; matches: string[] }> = {
    philo: { score: 0, matches: [] },
    francais: { score: 0, matches: [] },
    histoire: { score: 0, matches: [] },
    geographie: { score: 0, matches: [] },
    mathematiques: { score: 0, matches: [] },
    physique_chimie: { score: 0, matches: [] },
    svt: { score: 0, matches: [] },
    anglais: { score: 0, matches: [] },
    allemand: { score: 0, matches: [] },
    espagnol: { score: 0, matches: [] },
  };

  DISCIPLINE_SIGNATURES.forEach((sig) => {
    // 1. Check Primary Keywords (+10 points)
    sig.primaryKeywords.forEach((regex) => {
      const match = trimmed.match(regex);
      if (match) {
        scores[sig.discipline].score += 10;
        scores[sig.discipline].matches.push(match[0]);
      }
    });

    // 2. Check Authors and Famous Figures (+15 points)
    sig.authorsAndFigures.forEach((regex) => {
      const match = trimmed.match(regex);
      if (match) {
        scores[sig.discipline].score += 15;
        scores[sig.discipline].matches.push(match[0]);
      }
    });

    // 3. Check Typical Subjects (+20 points)
    sig.typicalSubjects.forEach((regex) => {
      if (regex.test(trimmed)) {
        scores[sig.discipline].score += 20;
        scores[sig.discipline].matches.push('Formulation type');
      }
    });

    // 4. Check Secondary Keywords (+4 points)
    sig.secondaryKeywords.forEach((regex) => {
      const match = trimmed.match(regex);
      if (match) {
        scores[sig.discipline].score += 4;
        scores[sig.discipline].matches.push(match[0]);
      }
    });
  });

  // Determine top discipline
  let bestDiscipline: DisciplineType = 'philo';
  let highestScore = -1;

  (Object.keys(scores) as DisciplineType[]).forEach((disc) => {
    if (scores[disc].score > highestScore) {
      highestScore = scores[disc].score;
      bestDiscipline = disc;
    }
  });

  // If the semantic AI classifier already identified the discipline, trust it: it reasons on
  // the meaning of the exercise (like a real teacher would), so it catches math/physics-chemistry/SVT
  // exercises that don't contain any of the exact keywords below, at any class level.
  const aiOverrideApplied = !!aiDiscipline && Object.prototype.hasOwnProperty.call(scores, aiDiscipline);
  if (aiOverrideApplied) {
    bestDiscipline = aiDiscipline as DisciplineType;
    highestScore = Math.max(highestScore, 10);
  }

  // Fallback heuristic if score is 0 or very low
  if (!aiOverrideApplied && highestScore <= 0) {
    if (/^[\s\d\+\-\*\/×÷\^\(\)\.\,\=\<\>\!\%\?xXyYzZ\s]+$/.test(trimmed) && /\d/.test(trimmed)) {
      bestDiscipline = 'mathematiques';
    } else if (/\b(dosage|newton|condensateur|projectile|acide|base|ph|vitesse|accélération|circuit rc|mol|chimie|physique)\b/i.test(trimmed)) {
      bestDiscipline = 'physique_chimie';
    } else if (/\b(svt|adn|cellule|chromosome|arbre généalogique|immunité|synapse|mitose|méiose|subduction|tectonique)\b/i.test(trimmed)) {
      bestDiscipline = 'svt';
    } else if (/\b(english|reading comprehension|essay|passive voice|reported speech|grammar|wh-)\b/i.test(trimmed)) {
      bestDiscipline = 'anglais';
    } else if (/\b(deutsch|german|textverständnis|grammatik|aufsatz|deklination|weil|obwohl)\b/i.test(trimmed)) {
      bestDiscipline = 'allemand';
    } else if (/\b(español|spanish|comprensión|subjuntivo|ser y estar|redacción|por y para)\b/i.test(trimmed)) {
      bestDiscipline = 'espagnol';
    } else if (/\b(f\(x\)|e\^x|ln\(x\)|limite|suite|complexe|probabilité|calculer|calcule|démontrer|intégrale|dérivée|matrice|vecteur|repère|sin|cos|tan|factoriser|pythagore|fraction|[0-9]+)\b/i.test(trimmed)) {
      bestDiscipline = 'mathematiques';
    } else if (/\b(théâtre|roman|poésie|écrivain|comédie|littérature|hilarité|étayant|réfutant|cdvr|bepc|résume ce texte|portrait|raconte|dialogue)\b/i.test(trimmed)) {
      bestDiscipline = 'francais';
    } else if (/\b(guerre|siècle|1945|colonisation|pays|traité|crise|empires|préhistoire)\b/i.test(trimmed)) {
      bestDiscipline = 'histoire';
    } else if (/\b(espace|agriculture|côte d'ivoire|climat|population|ville|port|déforestation)\b/i.test(trimmed)) {
      bestDiscipline = 'geographie';
    } else {
      bestDiscipline = 'philo';
    }
  }

  const { level, levelLabel, cycle, cycleLabel } = detectLevel(trimmed);
  const { serie, serieLabel } = detectAcademicSerie(trimmed, level);
  const { exerciseType, category } = detectExerciseType(trimmed, bestDiscipline, level, cycle);

  // Recommended Fascicule based on Grade Level & Discipline
  let targetFasciculeId = 'philo-dissertation';
  if (level === '6e' || level === '5e' || level === '4e') {
    if (bestDiscipline === 'francais') targetFasciculeId = 'francais-college-initiation';
    else if (bestDiscipline === 'mathematiques') targetFasciculeId = 'math-college';
    else if (bestDiscipline === 'histoire' || bestDiscipline === 'geographie') targetFasciculeId = 'histoire-geo-college';
    else if (bestDiscipline === 'physique_chimie') targetFasciculeId = 'physique-chimie-expert';
    else if (bestDiscipline === 'svt') targetFasciculeId = 'svt-sciences-vie-terre';
    else if (bestDiscipline === 'anglais') targetFasciculeId = 'anglais-exam-excellence';
    else if (bestDiscipline === 'allemand') targetFasciculeId = 'allemand-excellence-lv2';
    else if (bestDiscipline === 'espagnol') targetFasciculeId = 'espagnol-excellence-lv2';
    else targetFasciculeId = 'francais-college-initiation';
  } else if (level === '3e') {
    if (bestDiscipline === 'francais') targetFasciculeId = 'francais-bepc-texte-argumentatif';
    else if (bestDiscipline === 'mathematiques') targetFasciculeId = 'math-college';
    else if (bestDiscipline === 'histoire' || bestDiscipline === 'geographie') targetFasciculeId = 'histoire-geo-college';
    else if (bestDiscipline === 'physique_chimie') targetFasciculeId = 'physique-chimie-expert';
    else if (bestDiscipline === 'svt') targetFasciculeId = 'svt-sciences-vie-terre';
    else if (bestDiscipline === 'anglais') targetFasciculeId = 'anglais-exam-excellence';
    else if (bestDiscipline === 'allemand') targetFasciculeId = 'allemand-excellence-lv2';
    else if (bestDiscipline === 'espagnol') targetFasciculeId = 'espagnol-excellence-lv2';
    else targetFasciculeId = 'francais-bepc-texte-argumentatif';
  } else if (level === 'superieur' || cycle === 'superieur_universite') {
    if (bestDiscipline === 'mathematiques') targetFasciculeId = 'math-superieur-universite';
    else if (bestDiscipline === 'physique_chimie') targetFasciculeId = 'physique-chimie-expert';
    else if (bestDiscipline === 'svt') targetFasciculeId = 'svt-sciences-vie-terre';
    else targetFasciculeId = 'math-superieur-universite';
  } else {
    // 2nde, 1ère, Terminale
    if (bestDiscipline === 'mathematiques') targetFasciculeId = 'math-lycee';
    else if (bestDiscipline === 'physique_chimie') targetFasciculeId = 'physique-chimie-expert';
    else if (bestDiscipline === 'svt') targetFasciculeId = 'svt-sciences-vie-terre';
    else if (bestDiscipline === 'anglais') targetFasciculeId = 'anglais-exam-excellence';
    else if (bestDiscipline === 'allemand') targetFasciculeId = 'allemand-excellence-lv2';
    else if (bestDiscipline === 'espagnol') targetFasciculeId = 'espagnol-excellence-lv2';
    else if (bestDiscipline === 'francais') targetFasciculeId = 'francais-litterature';
    else if (bestDiscipline === 'histoire') targetFasciculeId = 'histoire-methodologie';
    else if (bestDiscipline === 'geographie') targetFasciculeId = 'geographie-methodologie';
    else targetFasciculeId = 'philo-dissertation';
  }

  const targetFascicule = DEFAULT_FASCICULES.find((f) => f.id === targetFasciculeId) || DEFAULT_FASCICULES[0];
  
  const matchingSignature = DISCIPLINE_SIGNATURES.find((s) => s.discipline === bestDiscipline) || DISCIPLINE_SIGNATURES[0];
  const confidence = aiOverrideApplied ? 98 : Math.min(99, Math.max(78, 72 + highestScore * 2));
  const uniqueMatches = Array.from(new Set(scores[bestDiscipline].matches));

  const explanation = aiOverrideApplied
    ? `Discipline confirmée par analyse sémantique IA : ${matchingSignature.disciplineLabel}. Niveau & Série : ${serieLabel}. Application de la méthodologie officielle adaptée.`
    : `Niveau & Série : ${serieLabel} (${matchingSignature.disciplineLabel}). Méthode et rigueur conformes au programme.`;

  return {
    discipline: bestDiscipline,
    disciplineLabel: matchingSignature.disciplineLabel,
    disciplineIcon: matchingSignature.disciplineIcon,
    cycle,
    cycleLabel,
    level,
    levelLabel,
    serie,
    serieLabel,
    exerciseType,
    exerciseCategory: category,
    confidence,
    matchedKeywords: uniqueMatches,
    recommendedFasciculeId: targetFascicule.id,
    recommendedPlanStructure: '2_axes',
    explanation,
  };
}
