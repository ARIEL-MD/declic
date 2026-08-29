import { Fascicule } from '../types';

export const DEFAULT_FASCICULES: Fascicule[] = [
  // ==========================================
  // PREMIER CYCLE : COLLÈGE (6e, 5e, 4e, 3e)
  // ==========================================
  {
    id: 'francais-college-initiation',
    title: 'Français 6e / 5e / 4e : Récit Narratif, Descriptif, Portrait & Écrit d\'Idées',
    discipline: 'francais',
    disciplineLabel: 'Français (6e, 5e, 4e)',
    badgeColor: 'rose',
    cycle: 'premier_cycle_bepc',
    summary: 'Méthodologie d\'expression écrite et d\'analyse de texte pour les classes de 6e, 5e et 4e : schéma narratif, description d\'un lieu ou d\'un personnage (portrait physique et moral), insertion de dialogues, questions de compréhension et initiation au paragraphe argumentatif.',
    methodologyOverview: `1. LE RÉCIT NARRATIF ET DESCRIPTIF (6e - 5e) :
   - Schéma narratif classique : Situation initiale -> Élément perturbateur -> Péripéties -> Élément de résolution -> Situation finale.
   - Le portrait (physique et moral) : Utilisation des adjectifs qualificatifs, des comparaisons et du vocabulaire des sensations (vue, ouïe, toucher).
   - L'insertion du dialogue : Ponctuation rigoureuse (tirets, deux-points, guillemets) et verbes de parole variés (déclarer, répliquer, s'écrier).

2. INITIATION À L'EXPLICATION ET À L'ARGUMENTATION (4e) :
   - Découverte du thème et distinction claire entre un fait objectif et une opinion subjective.
   - Formulation d'une idée directrice accompagnée d'un argument simple et d'un exemple concret du quotidien.
   - Maîtrise des connecteurs logiques de base : d'abord, ensuite, mais, car, parce que, enfin.

3. QUESTIONS DE COMPRÉHENSION ET DE LANGUE (6e à 4e) :
   - Répondre par des phrases complètes sans paraphraser.
   - Justifier par un relevé textuel entre guillemets.`,
    methodologySteps: [
      {
        name: 'Étape 1 : Analyse de la consigne et du cadre spatio-temporel',
        description: 'Repérer le lieu, l\'époque, les personnages principaux et le type de texte demandé (raconter, décrire, dialoguer).',
        keyRules: ['Définir le temps de narration principal (Passé simple/Imparfait ou Présent de narration)', 'Respecter la cohérence de l\'énonciation']
      },
      {
        name: 'Étape 2 : Élaboration du plan et des péripéties',
        description: 'Structurer l\'histoire en paragraphes distincts avec transitions logiques et chronologiques.',
        keyRules: ['1 paragraphe par étape du récit', 'Enrichir avec des détails sensoriels et des figures simples']
      },
      {
        name: 'Étape 3 : Rédaction et relecture soignée',
        description: 'Vérifier la concordance des temps, les accords en genre et en nombre, et la ponctuation du dialogue.',
        keyRules: ['Pas de répétitions de verbes génériques (faire, dire)', 'Vérifier l\'orthographe des homophones (a/à, et/est, son/sont)']
      }
    ],
    coreKnowledgeExcerpt: `Notions fondamentales de 6e, 5e et 4e en Côte d'Ivoire :
- Les types de textes : narratif, descriptif, explicatif, injonctif et dialogal.
- La conjugaison : présent, imparfait et passé simple de l'indicatif, futur simple, conditionnel présent, accords du participe passé.
- Les figures de style de base : comparaison, métaphore simple, personnification.
- Thématiques : les contes africains et universels, la vie familiale et villageoise, la protection de la nature, l'amitié, les aventures et découvertes.`,
    sampleInBookletSubjects: [
      'Rédaction 6e : « Un jour de marché au village ou en ville, un événement imprévu perturbe la foule. Raconte cette scène en décrivant l\'ambiance et la réaction des passants. »',
      'Rédaction 5e : « Fais le portrait physique et moral d\'un camarade ou d\'un aîné que tu admires particulièrement pour son courage et sa gentillesse. »',
      'Rédaction 4e : « Au cours d\'une discussion, ton ami soutient que la lecture des contes et romans est une perte de temps. Rédige un dialogue où tu lui expliques avec deux arguments pourquoi la lecture est enrichissante. »'
    ],
    sampleNewUntreatedSubjects: [
      'Raconte une journée mémorable passée pendant les vacances scolaires dans ton village ou dans une autre ville de Côte d\'Ivoire.',
      'Décris la forêt sacrée ou un monument historique de ta région en utilisant des comparaisons et des adjectifs de couleur et de forme.',
      'Rédige un court récit intégrant un dialogue entre un élève et son maître sur l\'importance de la discipline à l\'école.'
    ]
  },
  {
    id: 'francais-bepc-texte-argumentatif',
    title: 'Français 3e / BEPC : Texte Argumentatif (Étayer / Réfuter) & Résumé de Texte',
    discipline: 'francais',
    disciplineLabel: 'Français (3e / BEPC)',
    badgeColor: 'rose',
    cycle: 'premier_cycle_bepc',
    summary: 'Méthodologie officielle ivoirienne de l\'épreuve de Français au BEPC : Sujet 1 (Texte argumentatif de réflexion : Thème, Reformulation, Production étayante/réfutante) et Sujet 2 (Résumé de texte : Questions de Compréhension & Vocabulaire, Résumé au 1/3 de volume).',
    methodologyOverview: `1. PREMIER SUJET - TEXTE ARGUMENTATIF (Sujet de réflexion) :
   - Question 1 (2 pts) : Identification claire et concise du thème (sans paraphraser tout le sujet).
   - Question 2 (4 pts) : Reformulation précise et fidèle de la thèse soutenue avec vos propres mots (« Selon l'auteur... »).
   - Question 3 (14 pts) : Rédaction de la production argumentative (Étayer = soutenir avec arguments/exemples ; Réfuter = contester avec contre-arguments/exemples) :
     * Introduction : Amorce thématique de société + Présentation du sujet + Problématique + Annonce de la démarche.
     * Développement : 2 à 3 arguments solides, bien distincts, chacun étayé par des exemples concrets tirés de l'école, de la vie quotidienne ou de la société ivoirienne/africaine.
     * Conclusion : Bilan des arguments + Prise de position citoyenne finale.

2. DEUXIÈME SUJET - RÉSUMÉ DE TEXTE ARGUMENTATIF :
   - I- QUESTIONS (6 pts) :
     * A - Compréhension (4 pts) : 1- Thème abordé (2 pts), 2- Thèse de l'auteur (2 pts).
     * B - Vocabulaire (2 pts) : Explication en contexte de l'expression demandée (sens littéral + sens contextuel).
   - II- RÉSUMÉ (14 pts) :
     * Sélection des idées maîtresses et élimination des exemples superflus, chiffres accessoires et répétitions.
     * Rédaction au tiers (1/3) du volume initial avec respect de la marge de ±10%.
     * Respect strict du système d'énonciation et reformulation personnelle sans copier/coller.`,
    methodologySteps: [
      {
        name: 'Étape 1 : Traitement du Thème & Reformulation de la Thèse',
        description: 'Dégager le thème en 1 courte phrase et reformuler la thèse fidèlement sans déformation.',
        keyRules: ['Thème : De quoi parle le texte/sujet ?', 'Thèse : Que dit exactement l\'auteur à ce sujet ?']
      },
      {
        name: 'Étape 2 : Choix de la posture (Étayer ou Réfuter)',
        description: 'Vérifier la consigne : étayer (apporter des preuves confirmatives) ou réfuter (démontrer les failles).',
        keyRules: ['Développer au moins 2 arguments solides', 'Associer à chaque argument un exemple concret du vécu']
      },
      {
        name: 'Étape 3 : Rédaction de la production ou du résumé',
        description: 'Respecter le schéma Introduction - Développement - Conclusion pour le sujet 1, ou le calibrage au 1/3 pour le sujet 2.',
        keyRules: ['Connecteurs logiques clairs (D\'abord, Ensuite, Enfin)', 'Mentionner le décompte exact des mots pour le résumé']
      }
    ],
    coreKnowledgeExcerpt: `Thématiques clés du programme de 3e / BEPC en Côte d'Ivoire :
- L'École, l'éducation, la formation civique et la réconciliation nationale.
- La jeunesse, les dérives juvéniles (violence, drogue, cybercriminalité / broutement, grossesses précoces en milieu scolaire).
- Les technologies de l'information (réseaux sociaux, téléphone portable, internet : atouts et dangers).
- La protection de l'environnement, le réchauffement climatique et la salubrité urbaine.
- Le travail des enfants, la solidarité, la tolérance et la citoyenneté responsable.`,
    sampleInBookletSubjects: [
      'Au cours d\'un débat animé par la CDVR dans ton établissement, un membre déclare : « L\'école peut jouer un grand rôle dans la réconciliation des filles et fils de la Côte d\'Ivoire ». 1- Thème, 2- Reformule la thèse, 3- Rédige en étayant ce point de vue (BEPC Session 2022)',
      'Résumé de texte argumentatif : « La violence juvénile » par Brigivie Guirathe (BEPC Session 2022 - Questions et Résumé au 1/3)'
    ],
    sampleNewUntreatedSubjects: [
      'Un conférencier affirme devant les élèves : « Les réseaux sociaux constituent aujourd\'hui un frein à la réussite scolaire des jeunes. » 1- Identifie le thème, 2- Reformule la thèse, 3- Rédige ta production en étayant cette affirmation.',
      '« Le travail de groupe permet aux élèves de mieux progresser que le travail individuel. » Rédige une production argumentative pour réfuter cette opinion.',
      'Un observateur soutient : « Le respect des règles d\'hygiène et la préservation de l\'environnement relèvent d\'abord de la responsabilité des citoyens avant celle de l\'État. » Développe ton argumentation en étayant ce point de vue.',
      '« La lecture d\'œuvres littéraires est indispensable pour forger l\'esprit critique de la jeunesse moderne. » Explique et étaye ce point de vue.'
    ]
  },
  {
    id: 'histoire-geo-college',
    title: 'Histoire-Géographie Collège (6e, 5e, 4e, 3e) : Repères, Documents & Situation d\'Évaluation',
    discipline: 'histoire',
    disciplineLabel: 'Histoire-Géo (Collège 6e-3e)',
    badgeColor: 'amber',
    cycle: 'premier_cycle_bepc',
    summary: 'Méthodologie officielle d\'Histoire et Géographie au Premier Cycle : repérages chronologiques et spatiaux (6e-5e), analyse guidée de documents (4e) et maîtrise des connaissances couplée à la situation d\'évaluation en 3 consignes (3e / BEPC).',
    methodologyOverview: `1. PREMIÈRE PARTIE - MAÎTRISE DES CONNAISSANCES :
   - Définitions claires des concepts clés (ex: Impérialisme, Colonisation, Traite négrière, Résistance, Déforestation, Exode rural, PAA, Relief, Climat).
   - Localisation sur carte de Côte d'Ivoire ou d'Afrique (fleuves, ports, zones agro-écologiques).
   - Chronologie et associations événements/dates majeures.

2. DEUXIÈME PARTIE - SITUATION D'ÉVALUATION (Approche par compétences) :
   - Consigne 1 : Identification du fait historique ou du phénomène géographique décrit dans le texte.
   - Consigne 2 : Explication approfondie des causes, manifestations ou conséquences en combinant texte et cours.
   - Consigne 3 : Proposition de solutions concrètes, durables et réalistes, ou prise de position argumentée.`,
    methodologySteps: [
      {
        name: 'Étape 1 : Réponse aux questions de connaissances',
        description: 'Formuler des définitions rigoureuses et situer précisément les repères chronologiques.',
        keyRules: ['Définition scientifique sans à-peu-près', 'Précision des dates et des acteurs']
      },
      {
        name: 'Étape 2 : Traitement de la situation d\'évaluation (Consignes 1, 2 et 3)',
        description: 'Répondre consigne par consigne avec développement rédigé et structuré.',
        keyRules: ['Identifier le problème central', 'Expliquer 2 causes et 2 conséquences', 'Proposer 2 solutions réalistes']
      }
    ],
    coreKnowledgeExcerpt: `Programme d'Histoire et Géographie du Collège (Côte d'Ivoire) :
- 6e : La Préhistoire en Afrique, l'Égypte antique, la Terre dans l'univers, les milieux naturels.
- 5e : Les grands empires ouest-africains (Ghana, Mali, Songhaï), la traite transsaharienne et atlantique, la population mondiale.
- 4e : Les révolutions du XVIIIe siècle, la colonisation au XIXe siècle, les activités économiques et l'urbanisation.
- 3e : L'impérialisme, les résistances (Samory Touré), la colonisation en Côte d'Ivoire, l'accession à l'indépendance de 1960 (Félix Houphouët-Boigny), le milieu naturel, la population et l'agriculture ivoirienne (cacao/café/hévéa).`,
    sampleInBookletSubjects: [
      'Situation d\'évaluation 3e : La déforestation et la dégradation des sols en Côte d\'Ivoire (Consignes : identifier le problème, expliquer deux causes humaines, proposer deux solutions de reboisement)',
      'Questions de cours 4e : Définir "Traite négrière" et expliquer ses conséquences démographiques sur le continent africain',
      'Exercice 5e/6e : Citer les trois grands empires du Soudan médiéval et localiser le fleuve Niger'
    ],
    sampleNewUntreatedSubjects: [
      'Situation d\'évaluation sur l\'exode rural et la poussée urbaine à Abidjan : Causes socio-économiques, conséquences sur les infrastructures et solutions d\'aménagement.',
      'Situation d\'évaluation sur la lutte anticoloniale en Côte d\'Ivoire : Du Syndicat Agricole Africain (SAA) à l\'indépendance de 1960.',
      'L\'impact du changement climatique sur les rendements de la cacaoculture en Côte d\'Ivoire : Analyse et propositions.'
    ]
  },
  {
    id: 'math-college',
    title: 'Mathématiques Collège (6e, 5e, 4e, 3e) : Arithmétique, Calcul Littéral & Géométrie Plane',
    discipline: 'mathematiques',
    disciplineLabel: 'Mathématiques (Collège 6e-3e)',
    badgeColor: 'sky',
    cycle: 'premier_cycle_bepc',
    summary: 'Méthodologie complète de résolution pour toutes les classes du Collège : opérations arithmétiques et fractions (6e/5e), puissances et théorème de Pythagore (4e), calcul littéral, factorisations avec identités remarquables, équations-produits, théorème de Thalès, trigonométrie et repérage cartésien (3e / BEPC).',
    methodologyOverview: `1. ANALYSE DE L'ÉNONCÉ & IDENTIFICATION DES FORMULES :
   - Écrire explicitement la formule de cours avant son application (ex: Théorème de Pythagore, Propriété de Thalès, Identités remarquables : (a+b)², (a-b)², a²-b²).
2. DÉMARCHE DE RÉSOLUTION DÉTAILLÉE :
   - Présenter chaque étape de calcul intermédiaire sans raccourci.
   - Poser les égalités avec rigueur et appliquer les règles des signes et des priorités opératoires.
3. JUSTIFICATIONS GÉOMÉTRIQUES :
   - Vérifier les hypothèses préalables (ex: « Le triangle ABC est rectangle en A, donc d'après le théorème de Pythagore... »).
4. CONCLUSION & RÉSULTAT ENCADRÉ :
   - Mettre en valeur le résultat numérique avec son unité (cm, cm², °) ou l'ensemble des solutions S = {...}.`,
    methodologySteps: [
      {
        name: 'Étape 1 : Relevé des données et théorèmes associés',
        description: 'Identifier l\'inconnue et énoncer la règle ou le théorème applicable.',
        keyRules: ['Poser les conditions (triangle rectangle, droites parallèles)', 'Rappeler la formule littérale']
      },
      {
        name: 'Étape 2 : Développement des calculs algébriques et géométriques',
        description: 'Effectuer les calculs pas à pas avec gestion rigoureuse des signes et parenthèses.',
        keyRules: ['Respecter les priorités de calcul (parenthèses, puissances, multiplications)', 'Réduire les termes semblables']
      },
      {
        name: 'Étape 3 : Conclusion et vérification',
        description: 'Vérifier la cohérence du résultat et formuler une phrase de réponse claire.',
        keyRules: ['Encadrer le résultat final', 'Écrire l\'ensemble des solutions sous la forme S = {x1; x2}']
      }
    ],
    coreKnowledgeExcerpt: `Notions du Collège (6e à 3e en Côte d'Ivoire) :
- 6e / 5e : Nombres décimaux, fractions, symétrie axiale et centrale, angles, périmètres et aires de polygones et disques, proportionnalité.
- 4e : Nombres relatifs, puissances de 10, calcul littéral simple (développement), Théorème de Pythagore et sa réciproque, cosinus dans le triangle rectangle, statistiques.
- 3e / BEPC : Identités remarquables, factorisations, équations du 1er degré et équations-produits nuls, inéquations et représentation graphique sur une droite graduée, systèmes de deux équations à deux inconnues, Théorème de Thalès et sa réciproque, trigonométrie (cosinus, sinus, tangente), vecteurs et repérage cartésien.`,
    sampleInBookletSubjects: [
      'Calcul littéral 3e : Soit A(x) = (2x - 3)² - (x + 1)². 1) Développer et réduire A(x). 2) Factoriser A(x). 3) Résoudre A(x) = 0 dans R.',
      'Géométrie 3e : Soit un triangle ABC rectangle en A tel que AB = 6 cm et AC = 8 cm. 1) Calculer BC. 2) Calculer cos(ABC) puis en déduire la mesure de l\'angle au degré près.',
      'Exercice 4e/5e : Calculer et donner sous forme de fraction irréductible B = (3/4 - 1/2) * (5/3 + 2).'
    ],
    sampleNewUntreatedSubjects: [
      'Résoudre dans R le système d\'équations : { 2x + 3y = 12 ; 5x - y = 13 } par la méthode de combinaison linéaire ou de substitution.',
      'Dans un repère orthonormé (O, I, J), placer les points A(2; 3), B(-1; 1) et C(4; -2). 1) Calculer les coordonnées du milieu K de [AB]. 2) Calculer la distance AB.',
      'Factoriser les expressions : B(x) = 9x² - 25 et C(x) = (3x - 5)(2x + 1) + (3x - 5)(x - 4).'
    ]
  },

  // ==========================================
  // SECOND CYCLE (2nde, 1ère, Terminale)
  // ==========================================
  {
    id: 'francais-litterature',
    title: 'Français & Littérature (2nde, 1ère, Tle) : Dissertation & Commentaire Composé',
    discipline: 'francais',
    disciplineLabel: 'Français & Littérature (2nde-Tle)',
    badgeColor: 'rose',
    cycle: 'second_cycle_bac',
    summary: 'Méthode officielle du Second Cycle : dissertation littéraire (Expliquer/Discuter en 2 axes), commentaire composé (poésie, roman, théâtre) et analyse stylistique pour la 2nde, la 1ère et la Terminale.',
    methodologyOverview: `1. Typologie des consignes : "Expliquez et discutez" (Plan dialectique : I. Explication fidèle de la thèse de l'auteur -> II. Limites, nuances et autres fonctions de la littérature), "Dans quelle mesure..." (Plan analytique/nuancé).
2. Poésie : Analyse métrique (Alexandrins, césure, enjambement, rejet), fonctions poétiques (lyrique, militante/engagée, hermétique).
3. Roman & Récit : Statut du héros/antihéros, roman réaliste, naturaliste et négro-africain engagé.
4. Théâtre : Double énonciation, didascalies, dynamique du conflit, catharsis, dénonciation sociale par la comédie ou le drame.
5. Règle d'or de l'analyse : Idée directrice claire -> Référence et intrigue de l'œuvre analysée -> Portée critique et esthétique.`,
    methodologySteps: [
      {
        name: 'Étape 1 : Analyse de la citation & Consigne littéraire',
        description: 'Identifier l\'auteur, le contexte esthétique, décomposer les mots-clés et formuler la thèse initiale.',
        keyRules: ['Distinguer la citation de la consigne', 'Reformuler la thèse sans dénaturer la pensée']
      },
      {
        name: 'Étape 2 : Construction du plan littéraire (Expliquer / Discuter)',
        description: 'Partie I : Valider et illustrer la citation avec les œuvres au programme. Partie II : Montrer les autres fonctions de la littérature.',
        keyRules: ['Mobiliser au moins 3 œuvres distinctes par grande partie', 'Varier les genres (poésie, roman, théâtre)']
      },
      {
        name: 'Étape 3 : Rédaction du paragraphe littéraire',
        description: 'Idée littéraire + Référence/intrigue de l\'œuvre + Analyse de la visée de l\'écrivain.',
        keyRules: ['Titre d\'œuvre mis en valeur', 'Expliquer la visée de l\'écrivain avec connecteurs variés']
      }
    ],
    coreKnowledgeExcerpt: `Corpus et notions littéraires (2nde à Terminale) :
- La Négritude et la Poésie engagée : Aimé Césaire (Cahier d'un retour au pays natal, Une Saison au Congo), Léopold Sédar Senghor (Hosties noires, Chants d'ombre), David Diop (Coups de pilon), Bernard Dadié (La Ronde des jours).
- Le Roman réaliste et africain : Camara Laye (L'Enfant noir), Ahmadou Kourouma (Les Soleils des Indépendances), Ferdinand Oyono (Une vie de boy, Le Vieux Nègre et la médaille), Victor Hugo (Les Misérables), Gustave Flaubert (Madame Bovary).
- Le Théâtre et la contestation : Bernard Dadié (Les Voix dans le vent, Béatrice du Congo, Monsieur Thôgô-gnini), Hyacinthe Kacou (On se chamaille pour un siège), Guillaume Oyono M'bia (Trois Prétendants... un mari), Molière (Le Malade imaginaire, Tartuffe, Dom Juan), Jean Anouilh (Antigone).`,
    sampleInBookletSubjects: [
      '« Le théâtre n\'est fait que pour le divertissement et l\'hilarité. » Expliquez et discutez cette affirmation. (Exemple modèle)',
      '« L\'écrivain doit être la voix de ceux qui n\'ont pas de voix. » Expliquez et discutez cette affirmation.'
    ],
    sampleNewUntreatedSubjects: [
      '« Le roman est un miroir qui se promène sur une grande route. » Dans quelle mesure cette citation de Stendhal s\'applique-t-elle au roman moderne ?',
      'La poésie a-t-elle pour seule fonction d\'exprimer les sentiments intimes du poète ?',
      'Le personnage de théâtre doit-il nécessairement être vertueux pour toucher le spectateur ?',
      'L\'écrivain africain doit-il obligatoirement faire de son œuvre une arme politique ?'
    ]
  },
  {
    id: 'philo-dissertation',
    title: 'Philosophie (1ère & Terminale) : Dissertation Dialectique & Commentaire de Texte',
    discipline: 'philo',
    disciplineLabel: 'Philosophie (1ère & Terminale)',
    badgeColor: 'indigo',
    cycle: 'second_cycle_bac',
    summary: 'Cadre méthodologique d\'excellence du Second Cycle : analyse notionnelle, problématisation aporétique, plan dialectique (Thèse / Antithèse) et argumentation philosophique approfondie.',
    methodologyOverview: `1. Analyse conceptuelle du sujet : Définition de chaque terme clé dans son sens commun et philosophique, repérage des présupposés.
2. Problématisation : Découverte du problème implicite ou de la contradiction aporétique (Thèse A vs Thèse B).
3. Plan dialectique progressif (Thèse -> Antithèse critique -> Dépassement / Synthèse réflexive).
4. Argumentation rigoureuse : 1 idée directrice + 1 concept philosophique + 1 auteur de référence analysé en profondeur + 1 exemple.
5. Structure intégrale obligatoire : Introduction complète en 4 phases (Amorce, Définition/Tension, Problématique, Plan), Développement avec transitions rédigées, Conclusion fermant le débat sans échappatoire.`,
    methodologySteps: [
      {
        name: 'Étape 1 : Décorticage notionnel & Présupposés',
        description: 'Définir les termes dans leurs multiples acceptions et formuler la question centrale sous forme de contradiction féconde.',
        keyRules: ['Définition restrictive vs large', 'Mise au jour du présupposé caché', 'Formulation de l\'aporie centrale']
      },
      {
        name: 'Étape 2 : Structure de l’Introduction en 4 temps',
        description: '1. Amorce/Accroche philosophique, 2. Définition des termes & mise en tension, 3. Problématique explicite, 4. Annonce rigoureuse du plan.',
        keyRules: ['Pas de généralité vague ("De tout temps...")', 'Accroche ancrée dans un fait ou une expérience de pensée', 'Annonce de plan sans formulation scolaire']
      },
      {
        name: 'Étape 3 : Développement argumenté et Transitions logiques',
        description: 'Chaque partie résout un pan de la problématique avec transitions récapitulatives et interrogatives.',
        keyRules: ['1 sous-partie = 1 idée + 1 justification théorique + 1 auteur/concept analysé', 'Transitions interrogatives obligatoires entre les axes']
      },
      {
        name: 'Étape 4 : Conclusion synthétique & Bilan',
        description: 'Faire le bilan du cheminement réflexif et apporter une réponse définitive et nuancée.',
        keyRules: ['Répondre formellement à la problématique posée', 'Pas d’ouverture artificielle hors-sujet']
      }
    ],
    coreKnowledgeExcerpt: `Notions fondamentales du programme de Philosophie (1ère et Terminale) :
- La Conscience et l'Inconscient (Descartes - Cogito, Freud - Métapsychologie, Sartre - Mauvaise foi).
- La Liberté (Spinoza - Déterminisme, Kant - Autonomie morale, Rousseau - Obéissance à la loi).
- L'État, le Droit et la Justice (Machiavel, Hobbes - Léviathan, Locke, Rousseau - Contrat social).
- Le Progrès et la Technique (Heidegger - Arraisonnement, Hans Jonas - Principe responsabilité).
- La Vérité et la Connaissance (Platon - Allégorie de la caverne, Nietzsche, Popper - Réfutabilité).`,
    sampleInBookletSubjects: [
      'L\'État est-il l\'ennemi de la liberté individuelle ? (Exemple canonique du référentiel)',
      'La vérité peut-elle être dangereuse ? (Sujet d\'application traité dans le référentiel)',
      'L\'homme est-il responsable de son inconscient ? (Cas pratique du référentiel)'
    ],
    sampleNewUntreatedSubjects: [
      'Le progrès technique nous libère-t-il ou nous aliène-t-il ?',
      'L\'art peut-il se passer de règles ?',
      'La liberté dépend-elle de la société ?',
      'Peut-on être libre sans les autres ?',
      'La souffrance a-t-elle un sens ?'
    ]
  },
  {
    id: 'histoire-methodologie',
    title: 'Histoire (2nde, 1ère, Terminale) : Typologies de Sujets & Commentaire D-A-N-D-O',
    discipline: 'histoire',
    disciplineLabel: 'Histoire (2nde-Tle)',
    badgeColor: 'amber',
    cycle: 'second_cycle_bac',
    summary: 'Méthodologie experte des 5 typologies de sujets (Évolutif, Biographique, Dialectique, Tableau, Comparaison) et méthode critique D-A-N-D-O (2nde à Terminale).',
    methodologyOverview: `1. Typologies de sujets (2nde à Terminale) :
   - SUJET ÉVOLUTIF (Chronologique) : Découpage en périodes charnières / césures historiques (ex: De 1945 à 1991).
   - SUJET DIALECTIQUE : Examen de la thèse admise -> Limites et nuances factuelles -> Bilan historique global.
   - SUJET TABLEAU : Analyse synchronique d'un moment clé à travers ses facettes (Politique, Économique, Social).
2. Commentaire de document historique (Méthode D-A-N-D-O) :
   - D (Date et contexte précis), A (Auteur et statut), N (Nature du texte), D (Destinataire), O (Objectif/Enjeux).`,
    methodologySteps: [
      {
        name: 'Étape 1 : Analyse du type de sujet & Délimitation spatio-temporelle',
        description: 'Borner la période historique et identifier la typologie exacte parmi les 5 catégories.',
        keyRules: ['Fixer la date de début et de fin', 'Interdire tout anachronisme']
      },
      {
        name: 'Étape 2 : Découpage du plan historique',
        description: 'Construire 2 ou 3 grandes parties reflétant des césures chronologiques nettes.',
        keyRules: ['Chaque sous-partie correspond à un fait majeur étayé par des dates précises', 'Titres problématisés']
      }
    ],
    coreKnowledgeExcerpt: `Repères majeurs d'Histoire (2nde à Terminale) :
- 2nde : L'Europe et le monde au XIXe siècle, les révolutions industrielles, l'impérialisme en Afrique.
- 1ère : La Première et Deuxième Guerre mondiale, l'Afrique entre les deux guerres, les totalitarismes.
- Terminale : Relations Internationales de 1945 à nos jours (Guerre Froide, Crises de Berlin et Cuba, chute du Mur de 1989), Décolonisation et Tiers-Monde (Bandung 1955, Indépendances africaines de 1960), Félix Houphouët-Boigny et l'histoire politique de la Côte d'Ivoire.`,
    sampleInBookletSubjects: [
      'Les relations américano-soviétiques de 1947 à 1962 : de la rupture à la coexistence pacifique',
      'Le rôle du Tiers-Monde dans les relations internationales de Bandung (1955) à nos jours'
    ],
    sampleNewUntreatedSubjects: [
      'Dans quelle mesure la bipolarisation du monde de 1945 à 1991 a-t-elle façonné les relations internationales ?',
      'La décolonisation en Afrique noire francophone : processus pacifique ou lutte d\'émancipation ?',
      'L\'Union Africaine face aux défis de l\'intégration économique et de la paix sur le continent.'
    ]
  },
  {
    id: 'geographie-methodologie',
    title: 'Géographie (2nde, 1ère, Terminale) : Dissertation Spatiale & Commentaire Cartographique',
    discipline: 'geographie',
    disciplineLabel: 'Géographie (2nde-Tle)',
    badgeColor: 'emerald',
    cycle: 'second_cycle_bac',
    summary: 'Méthodologie du Second Cycle : analyse multiscalaire (local, national, régional, mondial), typologies d\'aménagement et commentaire de graphiques et cartes.',
    methodologyOverview: `1. Démarche géographique multiscalaire :
   - Facteurs naturels et atouts physiques -> Facteurs humains et dynamiques démographiques -> Facteurs économiques et politiques d'aménagement.
2. Structure du plan de dissertation géographique :
   - 2 axes équilibrés : Atouts & Réalisations (Axe I) vs Défis structurels & Solutions d'aménagement spatial (Axe II).`,
    methodologySteps: [
      {
        name: 'Étape 1 : Cadrage spatial et définition des échelles',
        description: 'Localiser l\'espace d\'étude et caractériser ses spécificités bioclimatiques et démographiques.',
        keyRules: ['Délimitation spatiale nette', 'Vocabulaire géographique précis (hub, pôle, littoralisation, hinterland)']
      },
      {
        name: 'Étape 2 : Articulation Atouts / Contraintes / Aménagements',
        description: 'Organiser le plan en montrant les interactions entre l\'Homme et son milieu.',
        keyRules: ['Associer chaque constat à un exemple territorial concret', 'Chiffrer les indicateurs']
      }
    ],
    coreKnowledgeExcerpt: `Thèmes fondamentaux de Géographie (2nde à Terminale) :
- 2nde : Les grands ensembles biogéographiques, la dynamique de la population mondiale et les risques naturels.
- 1ère : Les espaces ruraux et urbains, l'industrialisation, la mondialisation des échanges.
- Terminale : L'espace ivoirien (atouts, agriculture café-cacao/hévéa, Port Autonome d'Abidjan, aménagement du territoire), les puissances mondiales (États-Unis, Chine, Union Européenne) et la mondialisation.`,
    sampleInBookletSubjects: [
      'L\'agriculture dans l\'économie ivoirienne : atouts, rôle et perspectives',
      'L\'organisation de l\'espace américain : façades maritimes et dynamiques régionales'
    ],
    sampleNewUntreatedSubjects: [
      'L\'agriculture ivoirienne face aux exigences de l\'aménagement spatial et du développement durable.',
      'Le Port Autonome d\'Abidjan : un hub maritime au service du développement sous-régional.',
      'Les contrastes de développement entre le Nord et le Sud en Côte d\'Ivoire : facteurs et solutions d\'aménagement.',
      'La mondialisation renforce-t-elle les inégalités spatiales entre les territoires ?'
    ]
  },
  {
    id: 'math-lycee',
    title: 'Mathématiques (2nde, 1ère, Terminale - Séries A, C, D, E) : Analyse, Suites & Complexes',
    discipline: 'mathematiques',
    disciplineLabel: 'Mathématiques (2nde-Tle)',
    badgeColor: 'sky',
    cycle: 'second_cycle_bac',
    summary: 'Méthodologie experte pour les classes de 2nde, 1ère et Terminale (Séries C, D, E, A, TI) : fonctions polynômes, dérivation, suites arithmétiques et géométriques, barycentres, fonctions exponentielle et logarithme, limites et TVI, calcul intégral, nombres complexes et similitudes directes, probabilités conditionnelles et lois binomiales.',
    methodologyOverview: `1. Identification & Décodage des Hypothèses :
   - Relever le domaine de définition Df, les ensembles de référence (R, C, N, Z), les conditions d'existence et les hypothèses initiales.
   - Poser clairement l'objectif mathématique (résoudre, démontrer, calculer, encadrer, étudier les variations, interpréter géométriquement).
2. Justifications et Théorèmes Clés :
   - Citer explicitement le théorème ou la propriété appliquée avant chaque calcul majeur (ex: Théorème des valeurs intermédiaires / bijection, Dérivée d'une fonction composée, Intégration par parties, Raisonnement par récurrence, Équations différentielles).
3. Rigueur de la Rédaction Mathématique :
   - Employer les connecteurs logiques de déduction : « Soit... », « On sait que... », « Or... », « D'où... », « Par conséquent... », « On en déduit que... ».
   - Présenter les étapes intermédiaires de calcul sans saut d'étape opaque.
4. Encadrement & Vérification Finale :
   - Encadrer ou mettre en valeur chaque résultat final avec son interprétation géométrique ou probabiliste.`,
    methodologySteps: [
      {
        name: 'Étape 1 : Analyse de l\'énoncé & Hypothèses',
        description: 'Identifier le cadre mathématique, le domaine de validité et poser les variables.',
        keyRules: ['Déterminer l\'ensemble de définition Df ou le cadre géométrique', 'Préciser les conditions aux limites et hypothèses']
      },
      {
        name: 'Étape 2 : Démonstration méthodique & Justification théorique',
        description: 'Appliquer les théorèmes du programme avec rédaction canonique étape par étape.',
        keyRules: ['Justifier les hypothèses avant d\'appliquer un théorème', 'Expliciter l\'initialisation, l\'hérédité et la conclusion pour les récurrences']
      },
      {
        name: 'Étape 3 : Calculs détaillés & Tableaux de synthèse',
        description: 'Développer les calculs analytiques et dresser les tableaux de signes, de variations ou d\'effectifs.',
        keyRules: ['Dresser un tableau complet avec limites et valeurs remarquables', 'Vérifier la cohérence numérique des résultats']
      },
      {
        name: 'Étape 4 : Conclusion & Interprétation géométrique/physique',
        description: 'Fournir la conclusion finale claire, interpréter les asymptotes, tangentes, positions relatives ou probabilités.',
        keyRules: ['Encadrer le résultat final', 'Donner l\'interprétation géométrique ou concrète']
      }
    ],
    coreKnowledgeExcerpt: `Programme de Mathématiques (2nde à Terminale) :
- 2nde : Fonctions affines, polynômes du second degré, vecteurs, produit scalaire, géométrie analytique.
- 1ère (Séries C, D, A) : Nombre dérivé, fonction dérivée, étude des variations, suites numériques (arithmétiques, géométriques), trigonométrie circulaire, barycentres dans le plan et l'espace, dénombrement.
- Terminale (Séries C, D, E, A, TI) : Fonctions exponentielles et logarithmes népériens, limites et croissances comparées, TVI, calcul intégral et intégration par parties, équations différentielles, suites et récurrence, nombres complexes et similitudes planes directes, probabilités conditionnelles et loi binomiale, lois à densité.`,
    sampleInBookletSubjects: [
      'Étude complète de la fonction f(x) = (x - 2) * e^x + 1 : Domaine, limites, dérivée, variations, branches infinies et tracé de courbe (Problème canonique Terminale)',
      'Suites & Récurrence 1ère/Terminale : Soit U0 = 1 et U(n+1) = (2Un + 3)/(Un + 4). Démontrer par récurrence que 0 < Un < 1 et étudier sa convergence.',
      'Résolution dans C de l\'équation z² - 2(1 + cos θ)z + 2(1 + cos θ) = 0 et interprétation géométrique des racines (Exercice Terminale C/D)'
    ],
    sampleNewUntreatedSubjects: [
      'Une urne contient 4 boules blanches et 6 boules noires. On tire simultanément 3 boules. Déterminer la loi de probabilité du nombre de boules blanches tirées et calculer son espérance.',
      'Dans le plan muni d\'un repère orthonormé, étudier les branches infinies et dresser le tableau de variations de la fonction f(x) = ln((x + 1)/(x - 1)).',
      'Résoudre dans R l\'inéquation : e^(2x) - 3e^x + 2 <= 0.',
      'Soit f(x) = 2x² - 4x + 1 en classe de 2nde. Déterminer sa forme canonique, son extremum et dresser son tableau de variations.'
    ]
  },
  {
    id: 'math-superieur-universite',
    title: 'Mathématiques Supérieur & Université (Licence L1/L2/L3, Prépa CPGE, BTS) : Algèbre Linéaire, Analyse Réelle & Séries',
    discipline: 'mathematiques',
    disciplineLabel: 'Mathématiques (Supérieur & Université)',
    badgeColor: 'sky',
    cycle: 'superieur_universite',
    summary: 'Cadre méthodologique formel pour l\'enseignement supérieur et les classes préparatoires : espaces vectoriels, applications linéaires, diagonalisation et valeurs propres, développements limités et formules de Taylor, séries numériques et entières, intégrales généralisées, équations différentielles linéaires d\'ordre n, topologie des espaces métriques et probabilités continues.',
    methodologyOverview: `1. Identification & Formalisation des Hypothèses :
   - Énoncer les espaces de travail (E-ev sur K = R ou C, domaine ouvert U, intervalle I).
   - Préciser la classe de régularité (C^0, C^1, C^k, C^∞, L^1, L^2).
2. Démonstrations & Théorèmes Fondamentaux :
   - Citer les théorèmes avec vérification explicite des hypothèses (Théorème du rang, Bolzano-Weierstrass, Heine, Théorème de convergence dominée, Règle de d'Alembert/Cauchy, Théorème de Cauchy-Lipschitz).
3. Rigueur Analytique et Algébrique :
   - Traiter les équivalents, dominations (Landau o, O, ~) avec précaution (jamais d'équivalents terme à terme dans une somme).
   - Manipuler les bases, matrices de passage P^-1 A P et polynômes caractéristiques avec exactitude.
4. Rédaction Universitaire & Concours :
   - Distinguer clairement l'analyse (recherche nécessaire) de la synthèse (condition suffisante).
   - Conclure rigoureusement sans ellipse injustifiée.`,
    methodologySteps: [
      {
        name: 'Étape 1 : Analyse des structures et hypothèses de départ',
        description: 'Vérifier la dimension des espaces, la complétude, la compacité ou la connexité si requises.',
        keyRules: ['Poser rigoureusement les quantificateurs (∀, ∃)', 'Vérifier que les opérations sont bien définies']
      },
      {
        name: 'Étape 2 : Démonstration et calcul pas à pas',
        description: 'Appliquer les théorèmes généraux avec justification complète de chaque lemme intermédiaire.',
        keyRules: ['Justifier toutes les hypothèses avant d\'invoquer un théorème', 'Garder les valeurs et constantes exactes']
      },
      {
        name: 'Étape 3 : Synthèse et validation du résultat',
        description: 'Vérifier la cohérence matricielle, dimensionnelle ou asymptotique et conclure formellement.',
        keyRules: ['Encadrer le résultat final', 'Vérifier les cas limites (n=0, x->0, borne)']
      }
    ],
    coreKnowledgeExcerpt: `Programme d'Enseignement Supérieur (L1, L2, L3, CPGE MPSI/PCSI/MP/PSI) :
- Algèbre linéaire & bilinéaire : Espaces vectoriels, familles libres/génératrices/bases, théorème du rang, produit matriciel, déterminants, valeurs et vecteurs propres, diagonalisation, trigonalisation, produit scalaire euclidien et procédé de Gram-Schmidt.
- Analyse réelle et complexe : Suites réelles (critères de Cauchy, suites adjacentes), continuité uniforme, développements limités et asymptotiques, séries numériques (séries de Riemann, critères de comparaison), séries entières et séries de Fourier, intégrales impropres et intégrales à paramètres.
- Équations différentielles : Systèmes différentiels linéaires à coefficients constants, méthode de variation de la constante, équations non-linéaires fondamentales.
- Probabilités & Statistiques : Variables aléatoires discrètes et à densité (loi normale, exponentielle, uniforme), espérance, variance, covariance, inégalités de Bienaymé-Tchebychev et loi forte des grands nombres.`,
    sampleInBookletSubjects: [
      'Algèbre linéaire L1/L2 : Soit E = R3[X]. Soit l\'endomorphisme u défini par u(P) = (X² - 1)P\'\' + 2XP\'. 1) Déterminer la matrice de u dans la base canonique. 2) Trouver les valeurs propres et les sous-espaces propres. 3) u est-il diagonalisable ?',
      'Analyse L2/CPGE : Étudier la convergence de l\'intégrale généralisée I = ∫ (de 0 à +∞) (sin(x) / x) dx et calculer sa valeur par la méthode des intégrales à paramètre.',
      'Séries numériques L1/L2 : Déterminer la nature de la série de terme général Un = ln(1 + 1/n) - 1/n et donner un équivalent de son reste Rn.'
    ],
    sampleNewUntreatedSubjects: [
      'Soit A une matrice carrée d\'ordre 3 telle que A^3 - 3A + 2I = 0. Déterminer les valeurs propres possibles de A et montrer que A est inversible.',
      'Déterminer le développement limité à l\'ordre 3 au voisinage de 0 de la fonction f(x) = (1 + x)^(1/x).',
      'Calculer l\'intégrale double ∬_D (x² + y²) dx dy sur le disque D = {(x,y) ∈ R² : x² + y² ≤ 1}.',
      'Résoudre l\'équation différentielle du second ordre : y\'\' - 4y\' + 4y = e^(2x) / (1 + x²).'
    ]
  },
  // ==========================================
  // 6. PHYSIQUE - CHIMIE (Collège & Lycée)
  // ==========================================
  {
    id: 'physique-chimie-expert',
    title: 'Physique - Chimie (Collège & Lycée : Séries C, D, E, TI) : Mécanique, Électricité, Chimie Organique & Solutions',
    discipline: 'physique_chimie',
    disciplineLabel: 'Physique - Chimie',
    badgeColor: 'amber',
    cycle: 'second_cycle_bac',
    summary: 'Méthodologie experte de résolution en Physique-Chimie : identification du système et du référentiel, bilan des forces et inventaire des réactifs, formule littérale avec symboles normalisés, analyse dimensionnelle, calculs sans saut d\'étape avec unités SI et chiffres significatifs, interprétation physique/chimique des résultats.',
    methodologyOverview: `1. PHYSIQUE : MÉTHODE CANONIQUE DE RÉSOLUTION :
   - Définir précisément le SYSTÈME d'étude {objet ou ensemble} et le RÉFÉRENTIEL d'espace et de temps (ex: référentiel terrestre supposé galiléen).
   - Faire le Bilan exhaustif des forces appliquées avec schéma vectoriel (Poids P, Réaction R, Frottements f, Tension T, Force électrique F = qE, Force de Lorentz F = qv^B).
   - Énoncer le théorème ou la loi fondamentale (2nde Loi de Newton : Σ F = m*a, Théorème de l'Énergie Cinétique, Conservation de l'Énergie Mécanique, Loi des Mailles / Nœuds, etc.).
   - Établir l'ÉQUATION DIFFÉRENTIELLE ou la FORMULE LITTÉRALE avant tout calcul numérique.
   - Effectuer l'APPLICATION NUMÉRIQUE avec unités du Système International (SI) et respect des CHIFFRES SIGNIFICATIFS.

2. CHIMIE : DÉMARCHE OPÉRATOIRE & ANALYSE RÉACTIONNELLE :
   - Écrire et équilibrer l'équation-bilan de la réaction chimique (réactions acido-basiques, oxydoréduction avec demi-équations, estérification).
   - Dresser le TABLEAU D'AVANCEMENT avec l'état initial, intermédiaire et final, et déterminer le réactif limitant (x_max).
   - Exprimer les grandeurs (Concentration C = n/V, pH = -log[H3O+], pKa, Vitesse volumique de réaction v = (1/V)*(dx/dt), Constante d'équilibre K, Rendement η).
   - Interpréter l'équivalence (relation de dosage : Ca*Va = Cb*Vb à l'équivalence).`,
    methodologySteps: [
      {
        name: 'Étape 1 : Cadrage du système, hypothèses et inventaire des grandeurs',
        description: 'Préciser le système, le référentiel, lister les données avec leurs unités SI et repérer l\'inconnue.',
        keyRules: ['Définir le système et le référentiel galiléen', 'Convertir toutes les données en unités SI (m, s, kg, A, mol/L, V, J)']
      },
      {
        name: 'Étape 2 : Justification théorique et expression littérale',
        description: 'Citer la loi physique ou le principe chimique applicable et isoler littéralement la variable cherchée.',
        keyRules: ['Toujours exprimer la formule littérale avant d\'insérer les nombres', 'Vérifier l\'homogénéité par analyse dimensionnelle']
      },
      {
        name: 'Étape 3 : Application numérique rigoureuse et chiffres significatifs',
        description: 'Remplacer les valeurs numériques avec puissances de dix et calculer sans approximation prématurée.',
        keyRules: ['Respecter le nombre de chiffres significatifs de la donnée la moins précise', 'Accompagner le résultat de son unité légale SI']
      },
      {
        name: 'Étape 4 : Interprétation concrète et validation du résultat',
        description: 'Commenter le résultat obtenu au regard du phénomène physique ou de l\'équilibre chimique.',
        keyRules: ['Vérifier l\'ordre de grandeur', 'Conclure par une phrase explicite']
      }
    ],
    coreKnowledgeExcerpt: `Programme fondamental de Physique-Chimie (Collège à Terminale) :
- Mécanique : Cinématique du point, 2e loi de Newton, mouvement de projectiles dans un champ de pesanteur uniforme, mouvement de particules chargées dans un champ électrostatique/magnétique, satellites et lois de Kepler, oscillateurs mécaniques (pendule élastique, énergie mécanique).
- Électricité & Ondes : Dipôles RC, RL, RLC (charge/décharge, équations différentielles, oscillations libres et amorties), propagation des ondes (fréquence, longueur d'onde λ = v*T), optique géométrique (lentilles minces convergentes, grandissement γ, vergence C = 1/f'), physique nucléaire (radioactivité α, β-, β+, γ, demi-vie t1/2, défaut de masse et énergie de liaison E = Δm*c²).
- Chimie : Cinétique chimique (facteurs cinétiques, catalyse), équilibres chimiques et quotient de réaction, acides et bases de Brönsted (pH, Ka, pKa, domaine de prédominance, solution tampon), titrages pH-métriques et colorimétriques, chimie organique (alcools, aldéhydes, cétones, acides carboxyliques, esters, estérification/hydrolyse, saponification, polymères).`,
    sampleInBookletSubjects: [
      'Étude du mouvement d\'un projectile lancé avec une vitesse v0 faisant un angle α avec l\'horizontale dans le champ de pesanteur g : Équations horaires, trajectoire, portée et flèche.',
      'Dosage d\'un acide faible HA de concentration Ca inconnue par une solution d\'hydroxyde de sodium (Na+ + HO-) de concentration Cb : Équation de réaction, tableau d\'avancement, pH à l\'équivalence et à la demi-équivalence (pH = pKa).'
    ],
    sampleNewUntreatedSubjects: [
      'Un solide de masse m = 200 g glisse sur un plan incliné d\'un angle θ = 30° avec frottements f = 0,5 N. Déterminer l\'accélération du centre d\'inertie et la vitesse au bas de la pente.',
      'Décharge d\'un condensateur de capacité C = 100 µF à travers un conducteur ohmique de résistance R = 1 kΩ : Établir l\'équation différentielle de la tension u_c(t), déterminer la constante de temps τ et calculer la durée au bout de laquelle 99% de l\'énergie est dissipée.',
      'On réalise l\'estérification d\'une mole d\'acide éthanoïque et d\'une mole d\'éthanol. Calculer la composition du mélange à l\'équilibre sachant que la constante K = 4 et déterminer le rendement de la réaction.',
      'Désintégration du Cobalt-60 (émetteur β- et γ de demi-vie T = 5,27 ans). Calculer la constante radioactive λ, l\'activité initiale d\'un échantillon de 1 µg et son activité au bout de 15 ans.'
    ]
  },

  // ==========================================
  // 7. SCIENCES DE LA VIE ET DE LA TERRE (SVT)
  // ==========================================
  {
    id: 'svt-sciences-vie-terre',
    title: 'SVT (Sciences de la Vie et de la Terre - Collège & Lycée Séries D, C, A) : Génétique, Immunologie, Neuro & Géologie',
    discipline: 'svt',
    disciplineLabel: 'SVT',
    badgeColor: 'emerald',
    cycle: 'second_cycle_bac',
    summary: 'Méthodologie du raisonnement scientifique en SVT : Restitution organisée des connaissances (plan structuré avec introduction, schéma fonctionnel et conclusion) et Exploitation méthodique de documents (Je constate d\'après le graphe/document... Or je sais que... J\'en conclus que...).',
    methodologyOverview: `1. EXERCICE 1 - RESTITUTION ORGANISÉE DES CONNAISSANCES (ROC) :
   - Introduction : Cadrer le sujet, définir le concept biologique/géologique clé, poser la problématique et annoncer le plan.
   - Développement structuré : Présenter les mécanismes biologiques avec précision moléculaire et cellulaire, relier les causes aux effets.
   - Schéma fonctionnel ou bilan obligatoire : Soigné, titré, légendé avec code couleur clair.
   - Conclusion : Bilan synthétique répondant à la problématique et élargissement fonctionnel.

2. EXERCICE 2 - RAISONNEMENT SCIENTIFIQUE & ANALYSE DE DOCUMENTS (Démarche I-S-O-C) :
   - Saisie des informations (« Je constate / J\'observe que... ») : Relever les données quantitatives et qualitatives du document avec chiffres précis et unités.
   - Mobilisation des connaissances (« Or je sais que... ») : Rappeler la notion du cours qui éclaire ces observations.
   - Mise en relation & Déduction (« Donc j\'en déduis que... ») : Expliquer le mécanisme sous-jacent.
   - Synthèse globale : Répondre rigoureusement à la question posée.`,
    methodologySteps: [
      {
        name: 'Étape 1 : Analyse des documents et relevé précis des variables',
        description: 'Identifier les paramètres mesurés (abscisse, ordonnée, conditions témoins et expérimentales).',
        keyRules: ['Citer les valeurs chiffrées avec leurs unités', 'Comparer les états initiaux et finaux ou conditions témoins']
      },
      {
        name: 'Étape 2 : Mobilisation des connaissances biologiques ou géologiques',
        description: 'Associer les résultats observés aux notions théoriques précises (protéines, synapses, chromosomes, plaques).',
        keyRules: ['Vocabulaire scientifique rigoureux (ex: endocytose, antigène, allèle récessif, subduction)']
      },
      {
        name: 'Étape 3 : Déduction logique et conclusion argumentée',
        description: 'Articuler l\'observation et le savoir pour déduire la réponse avec certitude scientifique.',
        keyRules: ['Utiliser les connecteurs déductifs : Par conséquent, Ce qui prouve que', 'Dresser le schéma fonctionnel si demandé']
      }
    ],
    coreKnowledgeExcerpt: `Notions indispensables du programme de SVT :
- Génétique & Hérédité : Mitose, Méiose (brassage interchromosomique en anaphase I, brassage intrachromosomique / crossing-over en prophase I), monohybridisme et dihybridisme mendélien, gènes liés et indépendants, arbre généalogique et transmission de maladies héréditaires (autosomique/gonosomique, dominante/récessive).
- Immunologie & Défense de l'organisme : Réaction inflammatoire innée (phagocytose), immunité adaptative humorale (LB, plasmocytes, anticorps / immunoglobulines) et cellulaire (LT4 / auxiliaires, LT8 / cytotoxiques), le VIH et l'immunodéficience acquise, vaccins et mémoire immunitaire.
- Communication nerveuse & Régulation : Réflexe myotatique, potentiel de repos et potentiel d'action, propagation saltatoire, transmission synaptique neuro-neuronique et neuro-musculaire (acétylcholine), contrôle hormonal de la reproduction (axe hypothalamo-hypophysaire, FSH, LH, rétrocontrôle ovarien œstrogènes/progestérone).
- Géologie & Tectonique : Lithosphère, asthénosphère, frontières de plaques, zones de subduction (métamorphisme haute pression, volcanisme andésitique), zones de collision (orogenèse), dérive des continents et paléomagnétisme.`,
    sampleInBookletSubjects: [
      'Génétique formelle : Analyse d\'un croisement de drosophiles pour deux caractères (couleur du corps et longueur des ailes) avec calcul des pourcentages de phénotypes recombinés et établissement de la carte factorielle.',
      'Immunologie : Expliquer par un texte illustré d\'un schéma bilan comment la coopération cellulaire entre LT4, LT8 et LB permet l\'élimination d\'un antigène viral.'
    ],
    sampleNewUntreatedSubjects: [
      'À partir de l\'analyse d\'un arbre généalogique familial, déterminer le mode de transmission d\'une anomalie héréditaire (dominant/récessif, porté par un autosome ou le chromosome X) et calculer la probabilité pour un futur enfant d\'être atteint.',
      'Expliquer le mécanisme de genèse et de propagation du potentiel d\'action le long d\'une fibre nerveuse myélinisée et son franchissement d\'une synapse neuromusculaire.',
      'Montrer comment les mécanismes de la subduction océanique conduisent à la fusion partielle de la péridonite et à la genèse du magmatisme des zones de convergence.',
      'La glycémie est une constante biologique régulée autour de 1 g/L. Expliquer le rôle des cellules alpha et bêta des îlots de Langerhans du pancréas lors d\'une hyperglycémie post-prandiale.'
    ]
  },

  // ==========================================
  // 8. ANGLAIS (Collège & Lycée)
  // ==========================================
  {
    id: 'anglais-exam-excellence',
    title: 'Anglais (Collège & Lycée / BEPC & BAC) : Reading Comprehension, Grammar in Context & Model Essay',
    discipline: 'anglais',
    disciplineLabel: 'Anglais',
    badgeColor: 'blue',
    cycle: 'second_cycle_bac',
    summary: 'Méthodologie complète des épreuves d\'anglais (BEPC & BAC) : Compréhension de texte (Justifications textuelles exactes, QCM, Vrai/Faux), Maîtrise linguistique (Grammar & Tenses, Passive Voice, Conditionals, Reported Speech) et Production écrite (Formal/Informal Letter, Opinion Essay, Article avec connecteurs logiques).',
    methodologyOverview: `1. PART ONE - READING COMPREHENSION (Text Analysis) :
   - Direct Wh- Questions : Answer clearly in full sentences without copying unnecessary lines.
   - True / False / Not Mentioned : State T or F, then quote the exact supporting sentence from the text between quotation marks with line reference.
   - Vocabulary in context : Identify contextual synonyms or antonyms matching the grammatical form (verb for verb, noun for noun).

2. PART TWO - LANGUAGE IN USE / GRAMMAR :
   - Tenses & Aspects : Present Simple / Continuous, Past Simple / Past Perfect, Present Perfect Simple/Continuous.
   - Grammatical Transformations : Active to Passive voice, Direct to Reported Speech, Conditionals (Types 0, 1, 2, 3), Wish / If only, Modals (must, should, ought to, have to, might).
   - Word Building : Suffixes, Prefixes, Parts of speech.

3. PART THREE - GUIDED WRITING / ESSAY :
   - Introduction : Hook (General context) + Paraphrase of topic + Clear Thesis Statement.
   - Body Paragraphs (2 to 3) : Topic Sentence + Explanation + Concrete Real-World Example + Concluding sentence.
   - Linking Words / Transitions : First of all, Furthermore, Moreover, On the one hand / On the other hand, However, As a consequence, Therefore.
   - Conclusion : Summary of main arguments + Final thought / Recommendation.`,
    methodologySteps: [
      {
        name: 'Step 1 : Text Decoding & Question Analysis',
        description: 'Read the text thoroughly, underline keywords in questions and locate relevant paragraphs.',
        keyRules: ['Never lift entire chunks of text when personal formulation is requested', 'Always include line references for T/F justifications']
      },
      {
        name: 'Step 2 : Grammar Accuracy & Structure Application',
        description: 'Apply grammar transformation rules systematically (concordance of tenses, subject-verb agreement).',
        keyRules: ['Check irregular verbs forms', 'Respect punctuation and capital letters']
      },
      {
        name: 'Step 3 : Essay Planning & Cohesive Writing',
        description: 'Organize the essay with structured paragraphs and varied linking words.',
        keyRules: ['1 Idea = 1 Paragraph with Topic Sentence', 'Use advanced academic vocabulary and avoid colloquialisms']
      }
    ],
    coreKnowledgeExcerpt: `Key English Grammar & Thematic syllabus :
- Grammar Masterpoints : Conditionals (If + past simple, would + V / If + past perfect, would have + V3), Passive voice (Be + past participle), Reported speech (backshift of tenses and pronouns), Relative clauses (who, which, whose, where, that), Question tags, Gerund vs Infinitive, Connectors of contrast (although, despite, whereas, however).
- Themes (BEPC & BAC) : Youth and Technology (Social media, Artificial intelligence), Climate Change and Environmental Preservation, Education and Gender Equality, Brain Drain and Migration, Cultural Heritage and Globalization, Health and Epidemics, Peace and Civic Responsibility.`,
    sampleInBookletSubjects: [
      'Reading Comprehension & Essay : "The impact of artificial intelligence on youth employment". 1- Comprehension questions, 2- Grammar transformations (Passive voice & Conditionals), 3- Write a 150-200 word essay presenting the pros and cons of AI.',
      'BAC Essay : "Some people believe that traditional cultures are being destroyed by globalization. Do you agree or disagree? Write an argumentative essay to support your viewpoint."'
    ],
    sampleNewUntreatedSubjects: [
      'Write a formal letter to the Minister of Youth and Employment suggesting three concrete measures to promote entrepreneurship among young high school graduates.',
      '"Social media platforms do more harm than good to students\' academic performance." Discuss this statement by providing two arguments in favour and two against, then give your personal conclusion.',
      'Turn the following sentences from active to passive voice, and from direct into reported speech with full grammatical justifications.',
      'Write a speech delivered at your school assembly about the importance of girls\' education in developing nations.'
    ]
  },

  // ==========================================
  // 9. ALLEMAND (Collège & Lycée)
  // ==========================================
  {
    id: 'allemand-exam-excellence',
    title: 'Allemand (Collège & Lycée / BEPC & BAC) : Textverständnis, Grammatik, Übersetzung & Aufsatz',
    discipline: 'allemand',
    disciplineLabel: 'Allemand',
    badgeColor: 'violet',
    cycle: 'second_cycle_bac',
    summary: 'Méthodologie complète des épreuves d\'Allemand : Compréhension de texte (Textverständnis : Fragen, Richtig/Falsch mit Textbelegen), Maîtrise de la langue (Grammatik : Deklination, Kasus, Passiv, Konjunktiv II, Nebensätze) et Expression écrite (Freier Aufsatz / Stellungnahme mit Konnektoren).',
    methodologyOverview: `1. TEIL 1 - TEXTVERSTÄNDNIS (Compréhension de texte) :
   - W-Fragen beantworten : Antworten in vollständigen Sätzen (Subjekt + Verb + Ergänzungen) ohne blindes Abschreiben.
   - Richtig oder Falsch (R / F) : Entscheidung klar angeben und das genaue Zitat aus dem Text mit Zeilenangabe (« ... », Zeile X) anführen.
   - Wortschatz : Synonyme und Antonyme im Textkontext finden.

2. TEIL 2 - GRAMMATIK & STRUKTUREN (Grammaire & Syntaxe) :
   - Deklination der Adjektive (starke, schwache und gemischte Deklination nach Kasus : Nominativ, Akkusativ, Dativ, Genitiv).
   - Satzbau & Nebensätze : Verbletztstellung bei Kausalsätzen (weil, da), Finalsätzen (damit, um... zu), Konditionalsätzen (wenn), Konzessivsätzen (obwohl) und Relativsätzen.
   - Passivbildung (werden + Partizip II) und Konjunktiv II (Höflichkeit, Wunsch, Irrealität mit würde + Infinitiv oder wäre / hätte).

3. TEIL 3 - FREIER AUFSATZ & STELLUNGNAHME (Expression écrite) :
   - Einleitung : Thema vorstellen und Problematik formulieren.
   - Hauptteil : Mindestens 2 gut strukturierte Argumente mit Beispielen aus dem Alltag oder Afrika/Deutschland.
   - Konnektoren verwenden : Zuerst, Außerdem, Darüber hinaus, Einerseits... andererseits, Meiner Meinung nach, Schließlich.
   - Schluss : Zusammenfassung und persönlicher Standpunkt.`,
    methodologySteps: [
      {
        name: 'Schritt 1 : Textanalyse & Fragenverständnis',
        description: 'Den Text sorgfältig lesen, Schlüsselwörter in den Fragen markieren und Textstellen lokalisieren.',
        keyRules: ['Textbelege immer mit Anführungszeichen und Zeilennummer angeben', 'Vollständige Sätze formulieren']
      },
      {
        name: 'Schritt 2 : Grammatische Regeln exakt anwenden',
        description: 'Endungen der Adjektive, Verbstellung im Haupt- und Nebensatz und Zeitenfolge beachten.',
        keyRules: ['Im Nebensatz steht das konjugierte Verb am Ende', 'Präpositionen bestimmen den Kasus (Dativ / Akkusativ)']
      },
      {
        name: 'Schritt 3 : Aufsatzstruktur & Argumentation',
        description: 'Den Aufsatz in Einleitung, Hauptteil mit Konnektoren und Schluss gliedern.',
        keyRules: ['Jedes Argument mit einem konkreten Beispiel belegen', 'Auf korrekte Groß-/Kleinschreibung der Nomen achten']
      }
    ],
    coreKnowledgeExcerpt: `Wichtige Grammatik- und Themenbereiche im Fach Deutsch :
- Grammatikschwerpunkte : Kasuslehre (Präpositionen mit Dativ : aus, bei, mit, nach, seit, von, zu ; mit Akkusativ : durch, für, gegen, ohne, um ; Wechselpräpositionen : an, auf, hinter, in, neben, über, unter, vor, zwischen), Passiv (Präsens, Präteritum, Perfekt), Konjunktiv II der Gegenwart und Vergangenheit, Infinitivkonstruktionen (um...zu, ohne...zu, anstatt...zu).
- Zentrale Themen : Jugend und Beruf (Ausbildung, Praktikum, Arbeitswelt), Umweltschutz und Klimawandel (Erneuerbare Energien, Mülltrennung), Digitalisierung und Soziale Medien, Migration und Integration, Tradition und Moderne in Afrika und Europa, Kultur und Schulalltag.`,
    sampleInBookletSubjects: [
      'Textverständnis und Aufsatz : "Die Rolle der Solarenergie für die Entwicklung in afrikanischen Ländern". 1- Fragen zum Text, 2- Grammatik (Passiv & Nebensätze mit weil/obwohl), 3- Aufsatz : Warum ist Umweltschutz heute für die Jugend so wichtig?',
      'BAC Aufsatz : "Manche Jugendliche bevorzugen das Leben in der Großstadt, andere bleiben lieber auf dem Lande." Was ist Ihre Meinung dazu? Begründen Sie Ihren Standpunkt mit Argumenten.'
    ],
    sampleNewUntreatedSubjects: [
      'Verfassen Sie einen Leserbrief an eine Jugendzeitschrift über die Vor- und Nachteile von Smartphones im Unterricht.',
      'Setzen Sie die Sätze ins Passiv und verwandeln Sie die Hauptsätze in Nebensätze mit den Konjunktionen "obwohl", "weil" und "damit".',
      '"Freiwilligenarbeit und bürgerschaftliches Engagement machen junge Menschen solidarischer." Nehmen Sie Stellung zu dieser Aussage.',
      'Übersetzen Sie den folgenden kurzen Textabschnitt ins Französische (Version) unter Beachtung der genauen Bedeutung.'
    ]
  },

  // ==========================================
  // 10. ESPAGNOL (Collège & Lycée)
  // ==========================================
  {
    id: 'espagnol-exam-excellence',
    title: 'Espagnol (Collège & Lycée / BEPC & BAC) : Comprensión de Lectura, Gramática y Redacción',
    discipline: 'espagnol',
    disciplineLabel: 'Espagnol',
    badgeColor: 'rose',
    cycle: 'second_cycle_bac',
    summary: 'Méthodologie officielle des épreuves d\'Espagnol : Compréhension de texte (Comprensión : Preguntas directas, Verdadero/Falso con justificación textual exacta), Structures de la langue (Gramática : Ser/Estar, Por/Para, Subjuntivo, Concordance des temps) et Expression écrite (Redacción / Ensayo argumentativo con conectores discursivos).',
    methodologyOverview: `1. PRIMERA PARTE - COMPRENSIÓN DEL TEXTO :
   - Preguntas de comprensión : Responder con oraciones completas y redactadas con vocabulario propio sin copiar párrafos enteros innecesarios.
   - Verdadero o Falso (V / F) : Justificar obligatoriamente con la cita textual exacta del texto entre comillas (« ... », línea X).
   - Léxico y vocabulario : Identificar sinónimos o antónimos en el contexto del texto.

2. SEGUNDA PARTE - COMPETENCIA LINGÜÍSTICA Y GRAMÁTICA :
   - Diferenciación fundamental Ser vs Estar (cualidad esencial vs estado transitorio o localización).
   - Uso contrastado de Por vs Para (causa, medio, duración vs finalidad, destino, plazo).
   - El Modo Subjuntivo : Presente e Imperfecto de Subjuntivo para expresar duda, deseo, orden negativa, hipótesis (ojalá, es necesario que, para que, aunque + subjuntivo).
   - Concordancia temporal y perífrasis verbales (soler + infinitivo, acabar de + infinitivo, ponerse a + infinitivo, seguir + gerundio).

3. TERCERA PARTE - EXPRESIÓN ESCRITA / REDACCIÓN ARGUMENTATIVA :
   - Introducción : Presentación atractiva del tema y planteamiento de la pregunta clave.
   - Desarrollo : 2 a 3 argumentos sólidos ilustrados con ejemplos concretos de la sociedad hispanohablante o africana.
   - Conectores discursivos : En primer lugar, Además, Por un lado / Por otro lado, Sin embargo, Por consiguiente, En resumen.
   - Conclusión : Balance final y opinión personal fundada.`,
    methodologySteps: [
      {
        name: 'Paso 1 : Lectura comprensiva y análisis de consignas',
        description: 'Leer atentamente el texto, subrayar ideas principales y responder con precisión a las preguntas.',
        keyRules: ['Citar siempre entre comillas con el número de línea para V/F', 'Redactar respuestas completas']
      },
      {
        name: 'Paso 2 : Aplicación rigurosa de las reglas gramaticales',
        description: 'Verificar la conjugación verbal, concordancia de género/número y uso correcto del subjuntivo.',
        keyRules: ['Atención a la acentuación de palabras (agudas, llanas, esdrújulas)', 'Diferenciar correctamente por y para']
      },
      {
        name: 'Paso 3 : Estructuración de la redacción',
        description: 'Organizar el texto en párrafos claros con conectores lógicos variados.',
        keyRules: ['1 Párrafo = 1 Idea argumentada con un ejemplo real', 'Evitar repeticiones y enriquecer el léxico']
      }
    ],
    coreKnowledgeExcerpt: `Contenidos gramaticales y temáticos esenciales de Español :
- Gramática clave : Ser y Estar, Por y Para, Usos del Subjuntivo (Presente: -e/-a ; Imperfecto: -ra/-se), Condicional y oraciones condicionales (Si + imperfecto de subjuntivo, condicional simple), Voz pasiva refleja (Se + verbo en 3ª persona), Estilo indirecto y cambios verbales, Pronombres de CD y CI (leísmo/loísmo, se lo).
- Ejes temáticos : Juventud y Futuro profesional (Empleo, Emprendimiento, Nuevas tecnologías), Protección del Medio Ambiente y Energías Limpias, Migración e Integración cultural, Mujer y Desarrollo socioeconómico, El mundo hispánico (Cultura, Tradiciones y Diversidad de España e Iberoamérica), Convivencia y Paz.`,
    sampleInBookletSubjects: [
      'Comprensión lectora y Redacción : "El impacto de las redes sociales en las relaciones familiares de los jóvenes". 1- Preguntas de comprensión y V/F, 2- Ejercicios gramaticales (Subjuntivo & Ser/Estar), 3- Redacción : ¿Son las redes sociales un factor de unión o de aislamiento para la juventud moderna?',
      'BAC Ensayo : "Muchos jóvenes afirman que para tener éxito en la vida es indispensable viajar o vivir en el extranjero." Discuta esta afirmación dando su opinión personal con argumentos claros.'
    ],
    sampleNewUntreatedSubjects: [
      'Escriba un artículo de opinión para el periódico escolar explicando tres medidas concretas para preservar el medio ambiente en nuestra comunidad.',
      'Transforme las siguientes frases utilizando el modo Subjuntivo y la construcción impersonal con "Se".',
      '"El aprendizaje de lenguas extranjeras abre las puertas hacia un futuro laboral exitoso." Desarrolle su argumentación a favor o en contra de esta idea.',
      'Redacte una carta formal dirigida al Director de una empresa solicitando una pasantía o prácticas profesionales durante las vacaciones.'
    ]
  }
];
