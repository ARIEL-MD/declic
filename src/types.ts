export type DisciplineType = 
  | 'philo' 
  | 'francais' 
  | 'histoire' 
  | 'geographie' 
  | 'mathematiques' 
  | 'physique_chimie' 
  | 'svt' 
  | 'anglais' 
  | 'allemand' 
  | 'espagnol';

export type EducationCycle = 'premier_cycle_bepc' | 'second_cycle_bac' | 'superieur_universite';

export type SecondaryLevel = '6e' | '5e' | '4e' | '3e' | '2nde' | '1ere' | 'terminale' | 'superieur';

export type AcademicSerie = 
  | 'auto'
  | 'tle_a2'
  | 'tle_a1'
  | 'tle_d'
  | 'tle_c'
  | 'tle_e'
  | '1ere_a'
  | '1ere_c_d'
  | '2nde_a'
  | '2nde_c'
  | '3e_bepc'
  | 'college_6e_4e'
  | 'superieur';

export interface AcademicProfileInfo {
  serie: AcademicSerie;
  serieLabel: string;
  level: SecondaryLevel;
  levelLabel: string;
  cycle: EducationCycle;
  curriculumGuidelines: string;
}

export type AssistanceLevel = 1 | 2 | 3 | 4 | 5;

export interface FasciculeMethodologyStep {
  name: string;
  description: string;
  keyRules: string[];
}

export interface CourseConceptFormula {
  name: string;
  formulaOrRule: string;
  explanation: string;
  contextOrApplication: string;
}

export interface CourseMethodStep {
  stepNumber: number;
  title: string;
  whatToDo: string;
  reflexOrTip: string;
}

export interface CourseSolvedExample {
  problemStatement: string;
  solutionStepByStep: string;
  finalAnswer: string;
}

export interface CourseSearchResult {
  query: string;
  discipline: DisciplineType;
  disciplineLabel: string;
  cycle: EducationCycle;
  level: SecondaryLevel;
  levelLabel: string;
  chapterTitle: string;
  definitionAndScope: string;
  coreConceptsAndFormulas: CourseConceptFormula[];
  stepByStepMethod: CourseMethodStep[];
  solvedExample: CourseSolvedExample;
  classicExamTraps: string[];
  selfCheckChecklist: string[];
  quickRevisionMemo: string;
  certificationNote: string;
}

export interface Fascicule {
  id: string;
  title: string;
  discipline: DisciplineType;
  disciplineLabel: string;
  badgeColor: string;
  cycle?: EducationCycle;
  level?: SecondaryLevel;
  summary: string;
  methodologyOverview: string;
  methodologySteps: FasciculeMethodologyStep[];
  coreKnowledgeExcerpt: string;
  sampleInBookletSubjects: string[];
  sampleNewUntreatedSubjects: string[];
}

export interface SourceDecomposition {
  fasciculeMethodologies: string[];
  fasciculeKnowledgeUsed: string[];
  externalKnowledgeMobilized: string[];
}

export interface StepBreakdown {
  stepNumber: number;
  stepTitle: string;
  methodologyRuleApplied: string;
  content: string;
  sourceTags: string[];
  pedagogicalTip: string;
}

export interface EvaluationCriterion {
  criterion: string;
  fasciculeOrigin: boolean;
  scoreMax?: number;
  description: string;
  tipsForAutonomy: string;
}

export interface IllustrationData {
  auteur: string;
  oeuvre: string;
  citation: string;
  analyseIllustration: string;
}

export interface SubPartData {
  subPartLetter: string;
  title: string;
  argument: string;
  explication: string;
  illustration: IllustrationData;
  fullText: string;
}

export interface DevelopmentPartData {
  partNumber: number;
  title: string;
  thesisOverview?: string;
  subParts: SubPartData[];
  subPartA?: string;
  subPartB?: string;
  subPartC?: string;
  transition?: string;
  fullText: string;
}

export interface StructuredRedaction {
  planSummary: string;
  introduction: {
    amorce: string;
    definitionTension: string;
    problematique: string;
    annoncePlan: string;
    fullText: string;
  };
  development: {
    part1: DevelopmentPartData;
    transition1: string;
    part2: DevelopmentPartData;
    transition2?: string;
    part3?: DevelopmentPartData;
  };
  conclusion: {
    bilanSynthese: string;
    reponseDefinitive: string;
    elargissement: string;
    fullText: string;
  };
}

export interface StructuredScientificQuestion {
  numberLabel: string;
  titleOrPrompt?: string;
  steps: string[];
  finalAnswer?: string;
}

export interface StructuredScientificExercise {
  title: string;
  points?: string;
  introContext?: string;
  questions: StructuredScientificQuestion[];
}

export interface ConceptualDisambiguation {
  hasAmbiguousTerm: boolean;
  term: string;
  possibleMeanings: string[];
  retainedMeaning: string;
  justification: string;
}

export interface MethodologyAnalysisResult {
  exerciseTypeIdentified: string;
  disciplineIdentified: string;
  conceptualDisambiguation?: ConceptualDisambiguation;
  fasciculeMethodologyActivated: {
    name: string;
    description: string;
    stepsApplied: string[];
  };
  sourceDecomposition: SourceDecomposition;
  pedagogicalTransferExplanation: string;
  // 5 Levels of Assistance
  level1Hint: string;
  level2Methodology: string;
  level3GuidanceSteps: string[];
  level4DetailedOutline: string;
  level5FullRedaction: string;
  structuredRedaction: StructuredRedaction;
  // Rempli uniquement pour Mathématiques / Physique-Chimie / SVT : évite le parsing fragile
  // de texte libre côté client en fournissant directement la résolution découpée en étapes.
  structuredScientificResolution?: StructuredScientificExercise[];
  stepByStepBreakdown: StepBreakdown[];
  fullSynthesizedResponse: string;
  evaluationCriteria: EvaluationCriterion[];
  // true quand cette résolution vient du moteur de secours local (hors-ligne, sans IA)
  // plutôt que du moteur IA principal — à afficher clairement à l'élève.
  isFallback?: boolean;
}

export interface StudentCorrectionResult {
  globalScore: number; // e.g. 14.5 / 20
  appreciation: string;
  targetAdvice: string;
  criteriaScores: {
    comprehension: { score: number; max: 20; comment: string };
    methodology: { score: number; max: 20; comment: string };
    problematique: { score: number; max: 20; comment: string };
    organisationPlan: { score: number; max: 20; comment: string };
    argumentation: { score: number; max: 20; comment: string };
    exemplesReferences: { score: number; max: 20; comment: string };
    redactionStyle: { score: number; max: 20; comment: string };
  };
  whatIsSuccessful: string[];
  toImprove: string[];
  criticalErrors: string[];
  conceptsToReview: string[];
  remedialTips: string[];
  // true quand cette correction vient du moteur de secours local (hors-ligne, sans IA)
  // plutôt que du moteur IA principal — à afficher clairement à l'élève.
  isFallback?: boolean;
}

export interface SavedExercise {
  id: string;
  date: string;
  subjectTitle: string;
  discipline: string;
  exerciseType: string;
  result: MethodologyAnalysisResult;
  isFavorite: boolean;
  userScore?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
}

