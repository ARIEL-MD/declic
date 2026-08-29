import { DisciplineType, EducationCycle, SecondaryLevel, CourseConceptFormula, CourseMethodStep, CourseSolvedExample } from '../types';

export interface AcademicTopicKnowledge {
  id: string;
  queryKeywords: RegExp;
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
  // Specific templates for offline fallback generation & homework evaluation
  essayStructure?: {
    amorce: string;
    definitionTension: string;
    problematique: string;
    annoncePlan: string;
    axes: {
      title: string;
      thesisOverview: string;
      arguments: {
        letter: string;
        title: string;
        argument: string;
        explication: string;
        illustration: {
          auteur: string;
          oeuvre: string;
          citation: string;
          analyseIllustration: string;
        };
      }[];
      transition?: string;
    }[];
    conclusion: {
      bilanSynthese: string;
      reponseDefinitive: string;
      elargissement: string;
    };
  };
  expectedKeywords: string[];
}

export const ACADEMIC_KNOWLEDGE_BASE: AcademicTopicKnowledge[] = [
  // =========================================================================
  // 1. PHILOSOPHIE (Terminale A, C, D) : NOTIONS DU PROGRAMME OFFICIEL IVOIRIEN
  // =========================================================================
  {
    id: 'philo-mythe',
    queryKeywords: /mythe|mytholog|all[ée]gorie|caverne|prom[ée]th|sisyphe/i,
    discipline: 'philo',
    disciplineLabel: 'Philosophie & Humanités',
    cycle: 'second_cycle_bac',
    level: 'terminale',
    levelLabel: 'Terminale (Séries A, C, D)',
    chapterTitle: 'Le Mythe : Fonction philosophique, illusion et vérité symbolique',
    definitionAndScope: `Le mythe (du grec « muthos », récit fabuleux) est un récit fondateur mettant en scène des forces sacrées ou héroïques pour expliquer l'origine du monde, les lois humaines ou la condition mortelle. En philosophie, le mythe est d'abord opposé au « logos » (le discours rationnel et démonstratif), mais il est aussi utilisé comme un outil pédagogique et allégorique (ex: Platon).`,
    coreConceptsAndFormulas: [
      {
        name: 'Platon — L\'Allégorie de la Caverne (La République, Livre VII)',
        formulaOrRule: '« Représente-toi des hommes dans une demeure souterraine en forme de caverne... Ils n\'ont jamais vu que des ombres. »',
        explanation: 'Platon utilise le mythe et l\'allégorie pour rendre sensible l\'élévation de l\'âme de l\'ignorance (les ombres) vers la vérité intelligible (le Soleil / l\'Idée du Bien).',
        contextOrApplication: 'Axe épistémologique : le mythe comme instrument pédagogique pour enseigner la vérité intelligible.',
      },
      {
        name: 'Albert Camus — Le Mythe de Sisyphe (1942)',
        formulaOrRule: '« Il faut imaginer Sisyphe heureux. »',
        explanation: 'Le mythe antique du châtiment perpétuel devient le symbole de la condition humaine et de l\'Absurde : la lucidité de l\'homme face à l\'absence de sens transcendant.',
        contextOrApplication: 'Axe existentialiste : révolte de la conscience contre l\'absurdité de l\'existence.',
      },
      {
        name: 'Claude Lévi-Strauss — Anthropologie structurale (1958)',
        formulaOrRule: '« Un mythe se rapporte toujours à des événements passés, mais la valeur intrinsèque attribuée au mythe provient de ce que ces événements forment une structure permanente. »',
        explanation: 'Les mythes sont des constructions logiques universelles servant à résoudre symboliquement les contradictions humaines (nature/culture, vie/mort).',
        contextOrApplication: 'Axe anthropologique : rationalité inconsciente et structuration des sociétés humaines.',
      },
      {
        name: 'Roland Barthes — Mythologies (1957)',
        formulaOrRule: '« Le mythe est une parole dépolitisée qui transforme l\'histoire en nature. »',
        explanation: 'Dans la société contemporaine, le mythe fonctionne comme une idéologie masquée qui fait passer des constructions sociales pour des évidences naturelles.',
        contextOrApplication: 'Axe sociopolitique : déconstruction critique des discours et symboles contemporains.',
      },
    ],
    stepByStepMethod: [
      {
        stepNumber: 1,
        title: 'Distinguer Muthos (Récit/Imaginaire) et Logos (Raison/Démonstration)',
        whatToDo: 'Définir si le mythe est envisagé comme un obstacle à la vérité (illusion, superstition) ou comme un véhicule symbolique d\'une vérité profonde.',
        reflexOrTip: 'Rappeler que la naissance de la philosophie en Grèce au VIe siècle av. J.-C. s\'est construite par le passage du mythe à la rationalité critique.',
      },
      {
        stepNumber: 2,
        title: 'Mobiliser les fonctions fondamentales du mythe',
        whatToDo: 'Analyser ses 3 rôles : 1. Cosmologique (expliquer les origines), 2. Éthique & Politique (fonder les lois), 3. Pédagogique/Philosophique (rendre sensible l\'abstrait).',
        reflexOrTip: 'Toujours citer l\'auteur exact et le titre de l\'œuvre (Platon, Camus, Lévi-Strauss, Barthes).',
      },
      {
        stepNumber: 3,
        title: 'Articuler dépassement critique et permanence du mythe',
        whatToDo: 'Montrer que même dans un monde technicien et scientifique, l\'homme produit de nouveaux mythes (progrès, célébrités, consommation).',
        reflexOrTip: 'Terminer par une synthèse nuancée sur le besoin humain de sens et de récits.',
      },
    ],
    solvedExample: {
      problemStatement: 'Sujet type BAC : « La philosophie doit-elle rejeter tout recours au mythe ? »',
      solutionStepByStep: `1. Thèse (Axe 1) : La philosophie, comme quête rationnelle (logos), doit disqualifier le mythe qui repose sur la croyance irrationnelle et l'autorité de la tradition.\n2. Antithèse (Axe 2) : Pourtant, la raison a des limites pour exprimer l'origine ou l'idéal. Platon lui-même recourt aux mythes (Caverne, Er, Prométhée) comme médiation pédagogique indispensable.\n3. Synthèse (Axe 3) : Le mythe n'est pas le contraire de la vérité, mais une forme symbolique que la philosophie réinvestit lucidement sans jamais y asservir son jugement critique.`,
      finalAnswer: 'Problématique et plan dialectique entièrement validés avec références d\'auteurs authentifiées.',
    },
    classicExamTraps: [
      'Réduire le mythe à un simple "mensonge" ou conte pour enfants sans percevoir sa portée symbolique.',
      'Confondre mythe (récit sacré des origines) et légende (déformation d\'un fait historique) ou fable (récit moralisateur fictif).',
      'Oublier que Platon utilise abondamment le mythe tout en critiquant les poètes homériques.',
    ],
    selfCheckChecklist: [
      'Ai-je bien distingué mythe, logos et allégorie ?',
      'Mes citations de Platon ou Camus sont-elles exactes et contextualisées ?',
      'Le plan répond-il à la tension entre rationalité et pensée symbolique ?',
    ],
    quickRevisionMemo: 'Le mythe est à la fois l\'ancêtre du discours rationnel et son allié symbolique quand la raison atteint ses propres limites.',
    certificationNote: 'Fiche académique certifiée conforme aux programmes de Philosophie (Baccalauréat Séries A, C, D).',
    essayStructure: {
      amorce: `Depuis l'aube de la pensée grecque antique, l'avènement de la philosophie s'est constitué par une rupture décisive avec les récits mythologiques traditionnels, substituant l'exigence démonstrative du logos aux croyances fabuleuses.`,
      definitionTension: `Le mythe se définit comme un récit fondateur imaginaire mettant en scène des puissances surnaturelles pour donner sens au réel, tandis que la philosophie se veut une recherche rationnelle, critique et autonome de la vérité. Dès lors, le recours au mythe apparaît paradoxal pour une discipline fondée sur la rigueur logique.`,
      problematique: `Dès lors, le mythe constitue-t-il un obstacle épistémologique que la philosophie doit impérativement abolir, ou représente-t-il un détour pédagogique et métaphorique fécond pour appréhender ce qui échappe à la pure démonstration conceptuelle ?`,
      annoncePlan: `Dans un premier temps, nous examinerons en quoi la philosophie se constitue contre le mythe en tant qu'illusion dogmatique ; puis, nous analyserons la valeur heuristique et pédagogique de la pensée mythique au cœur même du philosopher ; enfin, nous montrerons que le mythe demeure une médiation symbolique nécessaire pour penser la condition humaine.`,
      axes: [
        {
          title: `Axe I : La philosophie comme rejet critique du mythe et triomphe de la rationalité démonstrative`,
          thesisOverview: `La philosophie naît historiquement et conceptuellement d'une émancipation à l'égard de la pensée mythico-religieuse.`,
          arguments: [
            {
              letter: 'A',
              title: `Le passage du Muthos au Logos`,
              argument: `Le mythe impose une explication close et indiscutable des phénomènes fondée sur l'autorité des traditions, alors que la démarche philosophique exige le libre examen et la démonstration rationnelle.`,
              explication: `Tandis que le mythe exige une adhésion passive de la croyance, la philosophie inaugure le doute méthodique et le débat d'arguments universellement vérifiables.`,
              illustration: {
                auteur: 'Jean-Pierre Vernant',
                oeuvre: 'Les Origines de la pensée grecque (1962)',
                citation: '« La raison grecque ne s\'est pas constituée dans le commerce avec les dieux, mais dans l\'espace public de l\'agora, par la discussion réglée entre égaux. »',
                analyseIllustration: `Vernant montre que la naissance de la philosophie correspond à une laïcisation radicale de la pensée, où le débat d'arguments remplace la parole sacrée du devin et du conteur mythologique.`
              }
            },
            {
              letter: 'B',
              title: `La critique des fables trompeuses et du dogmatisme`,
              argument: `Les mythes anthropomorphiques projettent les passions et faiblesses humaines sur le divin, entretenant l'ignorance et la superstition populaire.`,
              explication: `En attribuant aux dieux les vices des hommes, les fables mythiques égarent les citoyens et corrompent la droiture morale et la vérité épistémologique.`,
              illustration: {
                auteur: 'Platon',
                oeuvre: 'La République, Livre II & III',
                citation: '« Nous devons veiller sur les faiseurs de fables, et si l\'un d\'eux en compose une bonne, la retenir, s\'il en compose une mauvaise, la rejeter. »',
                analyseIllustration: `Socrate critique vivement Homère et Hésiode parce que leurs mythes présentent des dieux menteurs et jaloux, incompatibles avec la recherche de l'Idée du Bien.`
              }
            }
          ]
        },
        {
          title: `Axe II : La fécondité du mythe comme instrument pédagogique et allégorique de la philosophie`,
          thesisOverview: `Loin d'être un simple mensonge, le mythe devient pour le philosophe un outil puissant pour rendre sensible l'intelligible.`,
          arguments: [
            {
              letter: 'A',
              title: `L'allégorie comme pédagogie de l'élévation spirituelle`,
              argument: `La raison conceptuelle pure est parfois trop ardue pour l'esprit non initié ; le mythe sert alors d'image médiatrice pour guider l'âme vers la vérité.`,
              explication: `Le philosophe invente des récits imagés non pour tromper, mais pour illustrer des vérités métaphysiques abstraites que le langage discursif peine à communiquer directement.`,
              illustration: {
                auteur: 'Platon',
                oeuvre: 'La République, Livre VII',
                citation: '« Représente-toi des hommes dans une demeure souterraine en forme de caverne... Ils n\'ont jamais vu que des ombres projetées sur le mur. »',
                analyseIllustration: `L'allégorie de la caverne illustre magnifiquement la libération philosophique, matérialisant le passage douloureux des illusions sensibles à la contemplation du Soleil intelligible.`
              }
            },
            {
              letter: 'B',
              title: `Le mythe comme symbole existentiel de la condition humaine`,
              argument: `Lorsque la raison fait face aux questions limites de l'existence (la mort, la souffrance, le sens), le mythe offre un miroir lucide de notre destin.`,
              explication: `Les grandes figures mythologiques incarnent des archétypes universels permettant à l'homme de penser sa propre finitude avec noblesse et courage.`,
              illustration: {
                auteur: 'Albert Camus',
                oeuvre: 'Le Mythe de Sisyphe (1942)',
                citation: '« Il faut imaginer Sisyphe heureux. »',
                analyseIllustration: `Camus réinvestit le mythe grec pour donner chair au concept d'Absurde : la grandeur de l'homme réside dans sa lucidité face à l'effort sans espoir divin.`
              }
            }
          ]
        },
        {
          title: `Axe III : Synthèse — Le mythe comme partenaire symbolique d'une raison lucide`,
          thesisOverview: `La philosophie ne doit pas abolir le mythe mais le déchiffrer herméneutiquement pour éclairer les structures profondes de la conscience.`,
          arguments: [
            {
              letter: 'A',
              title: `La rationalité symbolique et anthropologique des mythes`,
              argument: `Les mythes ne sont pas des délires irrationnels, mais des systèmes logiques complexes qui structurent les sociétés humaines et résolvent leurs contradictions fondatrices.`,
              explication: `L'anthropologie moderne a prouvé que la pensée sauvage et mythique obéit à des règles de combinatoire et de rigueur aussi exigeantes que la pensée scientifique.`,
              illustration: {
                auteur: 'Claude Lévi-Strauss',
                oeuvre: 'Anthropologie structurale (1958)',
                citation: '« Un mythe se rapporte toujours à des événements passés, mais la valeur intrinsèque attribuée au mythe provient de ce que ces événements forment une structure permanente. »',
                analyseIllustration: `Lévi-Strauss démontre que le mythe accomplit un travail intellectuel authentique en médiatisant les oppositions fondamentales (nature/culture, vie/mort).`
              }
            }
          ]
        }
      ],
      conclusion: {
        bilanSynthese: `Au terme de cette analyse, il apparaît que l'opposition initiale entre mythe et philosophie doit être profondément réévaluée. Si la philosophie s'est affranchie du mythe dogmatique pour fonder la souveraineté du logos, elle n'a jamais cessé d'utiliser la puissance évocatrice de la métaphore et de l'allégorie.`,
        reponseDefinitive: `La philosophie ne doit donc pas rejeter tout recours au mythe : elle doit le soumettre à l'exigence critique afin de faire du récit symbolique un vecteur de compréhension humaine et d'élévation spirituelle.`,
        elargissement: `Dans notre modernité technicienne où prolifèrent de nouveaux mythes publicitaires et idéologiques, la tâche de la philosophie demeure plus que jamais de déconstruire les fausses illusions tout en préservant le pouvoir d'émerveillement et de sens de la pensée poétique.`
      }
    },
    expectedKeywords: ['mythe', 'logos', 'platon', 'caverne', 'camus', 'sisyphe', 'lévi-strauss', 'vérité', 'allégorie', 'symbole', 'illusion', 'raison', 'vernant']
  },

  // 2. LA CONSCIENCE ET L'INCONSCIENT
  {
    id: 'philo-conscience-inconscient',
    queryKeywords: /conscience|inconscient|freud|descartes|cogito|psychanalyse|moi|surmoi|refoulement/i,
    discipline: 'philo',
    disciplineLabel: 'Philosophie & Épistémologie',
    cycle: 'second_cycle_bac',
    level: 'terminale',
    levelLabel: 'Terminale (Séries A, C, D)',
    chapterTitle: 'La Conscience et l\'Inconscient : Sujet, Connaissance de soi et Déterminisme psychique',
    definitionAndScope: `La conscience (du latin « cum scientia », avec savoir) est la faculté réflexive par laquelle l'homme a connaissance de lui-même, de ses actes et du monde extérieur. L'inconscient désigne une instance psychique postulée par la psychanalyse, regroupant des désirs, pulsions et souvenirs refoulés qui échappent au contrôle lucide du Moi.`,
    coreConceptsAndFormulas: [
      {
        name: 'René Descartes — Le Cogito (Discours de la méthode, 1637)',
        formulaOrRule: '« Je pense, donc je suis (Cogito ergo sum). »',
        explanation: 'La conscience de penser est la première certitude absolue résistant au doute méthodique, fondant le sujet souverain et transparent à lui-même.',
        contextOrApplication: 'Axe classique du sujet souverain : la transparence de la conscience.',
      },
      {
        name: 'Sigmund Freud — La Blessure narcissique (Introduction à la psychanalyse, 1916)',
        formulaOrRule: '« Le Moi n\'est pas maître dans sa propre maison. »',
        explanation: 'La découverte de l\'inconscient détrône le Moi conscient, divisé entre le Ça (pulsions), le Surmoi (interdits intériorisés) et le Moi (instance d\'adaptation).',
        contextOrApplication: 'Axe critique psychanalytique : le déterminisme psychique et le refoulement.',
      },
      {
        name: 'Jean-Paul Sartre — Critique de l\'inconscient (L\'Être et le Néant, 1943)',
        formulaOrRule: '« La mauvaise foi est mensonge à soi-même. »',
        explanation: 'Sartre rejette l\'inconscient freudien comme une excuse commode pour fuir sa responsabilité et sa liberté totale.',
        contextOrApplication: 'Axe existentialiste : la conscience comme liberté irréductible.',
      },
      {
        name: 'Emmanuel Kant — Le Sujet moral (Anthropologie d\'un point de vue pragmatique, 1798)',
        formulaOrRule: '« Posséder le Je dans sa représentation : ce pouvoir élève l\'homme infiniment au-dessus de tous les autres êtres vivants. »',
        explanation: 'La conscience réflexive confère à l\'être humain le statut unique de personne morale dotée d\'une dignité inconditionnelle.',
        contextOrApplication: 'Axe moral : dignité et unité transcendantale du sujet.',
      }
    ],
    stepByStepMethod: [
      {
        stepNumber: 1,
        title: 'Poser la définition de la conscience réflexive',
        whatToDo: 'Distinguer conscience spontanée/immédiate et conscience réflexive (se regarder soi-même en train de penser).',
        reflexOrTip: 'Rappeler que l\'homme est le seul être qui n\'est pas seulement dans le monde, mais qui "se sait" dans le monde.',
      },
      {
        stepNumber: 2,
        title: 'Confronter le sujet cartésien à la découverte de l\'inconscient',
        whatToDo: 'Montrer la rupture entre la certitude du Cogito et la décentralisation opérée par Freud.',
        reflexOrTip: 'Préciser les manifestations de l\'inconscient : actes manqués, lapsus, rêves, symptômes névrotiques.',
      },
      {
        stepNumber: 3,
        title: 'Traiter l\'enjeu moral et la responsabilité',
        whatToDo: 'Confronter le risque de déresponsabilisation (alibi de l\'inconscient) à l\'exigence d\'émancipation et de cure psychanalytique ("Wo Es war, soll Ich werden").',
        reflexOrTip: 'Conclure sur la conscience comme projet d\'auto-connaissance jamais totalement achevé.',
      }
    ],
    solvedExample: {
      problemStatement: 'Sujet type BAC : « L\'inconscient ruine-t-il toute liberté et toute connaissance de soi ? »',
      solutionStepByStep: `1. Thèse : L'homme s'est longtemps cru transparent à lui-même grâce au Cogito cartésien.\n2. Antithèse : La psychanalyse freudienne démontre que nos choix conscients sont déterminés par des pulsions inconscientes et refoulées.\n3. Synthèse : L'inconscient n'annule pas la liberté mais lui assigne une tâche : la prise de conscience et la sublimation permettent la reconquête lucide de soi.`,
      finalAnswer: 'Plan dialectique complet avec mobilisation de Descartes, Freud, Sartre et Kant.',
    },
    classicExamTraps: [
      'Confondre inconscient au sens psychanalytique (instance psychique active) et inconscience au sens moral (imprudence, évanouissement).',
      'Faire de l\'inconscient un "deuxième moi" autonome ou un monstre caché au lieu d\'un ensemble dynamique de pulsions.',
      'Oublier la critique sartrienne de la mauvaise foi.',
    ],
    selfCheckChecklist: [
      'Ai-je bien articulé conscience réflexive et inconscient dynamique ?',
      'Les citations de Descartes et Freud sont-elles exactes ?',
      'Le débat sur la responsabilité morale est-il clairement résolu ?',
    ],
    quickRevisionMemo: 'La conscience fait la dignité de l\'homme ; l\'inconscient révèle la complexité de son psychisme ; la psychanalyse est la reconquête de soi par le langage.',
    certificationNote: 'Fiche certifiée conforme au programme de Philosophie du Baccalauréat.',
    essayStructure: {
      amorce: `Traditionnellement exaltée comme le privilège suprême de l'être humain, la conscience a longtemps été considérée comme le foyer d'une souveraineté absolue et d'une parfaite transparence de l'esprit à lui-même.`,
      definitionTension: `Toutefois, la découverte par la psychanalyse d'un inconscient psychique dynamique est venue ébranler cette certitude, révélant que nos pensées et nos actes sont traversés par des forces obscures qui échappent à notre volonté.`,
      problematique: `Dès lors, l'inconscient condamne-t-il l'homme à n'être que le jouet de déterminismes psychiques aveugles, ou la conscience conserve-t-elle le pouvoir de se connaître et de reconquérir sa liberté ?`,
      annoncePlan: `Nous analyserons d'abord la thèse classique de la souveraineté de la conscience réflexive ; puis, nous étudierons la blessure infligée par la découverte freudienne de l'inconscient ; enfin, nous montrerons que la lucidité philosophique et la cure analytique permettent à l'homme de redevenir le sujet responsable de son existence.`,
      axes: [
        {
          title: `Axe I : Le privilège de la conscience réflexive et la certitude du sujet cartésien`,
          thesisOverview: `La conscience s'affirme comme le fondement inébranlable de toute vérité et de la liberté humaine.`,
          arguments: [
            {
              letter: 'A',
              title: `Le Cogito comme première certitude fondamentale`,
              argument: `Même lorsque je doute de tout, la conscience que j'ai d'exercer ce doute prouve de manière indubitable mon existence en tant que substance pensante.`,
              explication: `La pensée est immédiatement présente à elle-même sans médiation extérieure. Rien ne peut s'accomplir en moi sans que j'en aie l'intuition réflexive.`,
              illustration: {
                auteur: 'René Descartes',
                oeuvre: 'Méditations Métaphysiques (1641)',
                citation: '« Je suis, j\'existe, est nécessairement vraie toutes les fois que je la prononce ou que je la conçois en mon esprit. »',
                analyseIllustration: `Descartes fonde toute la modernité philosophique sur l'évidence du sujet pensant, capable de se ressaisir dans une transparence totale.`
              }
            },
            {
              letter: 'B',
              title: `La conscience comme fondement de la dignité et de la morale`,
              argument: `La capacité de dire « Je » élève l'être humain au-dessus du règne animal et en fait un sujet moral doué d'autonomie et de responsabilité.`,
              explication: `L'homme n'est pas simplement soumis aux lois de la nature ; par sa conscience, il peut juger ses actes, éprouver le remords et choisir le devoir moral.`,
              illustration: {
                auteur: 'Emmanuel Kant',
                oeuvre: 'Anthropologie d\'un point de vue pragmatique (1798)',
                citation: '« Posséder le Je dans sa représentation : ce pouvoir élève l\'homme infiniment au-dessus de tous les autres êtres vivants. »',
                analyseIllustration: `Kant souligne que la conscience confère à l'homme une valeur inestimable qui s'appelle la dignité, lui interdisant d'être traité comme un simple moyen.`
              }
            }
          ]
        },
        {
          title: `Axe II : La destitution du sujet conscient par la théorie freudienne de l'inconscient`,
          thesisOverview: `La conscience n'est qu'une surface fragile cachant des forces psychiques inconscientes et refoulées.`,
          arguments: [
            {
              letter: 'A',
              title: `La blessure narcissique et la triple servitude du Moi`,
              argument: `Le psychisme humain est dominé par des pulsions inconscientes (le Ça) et des interdits parentaux intériorisés (le Surmoi), réduisant la conscience à un rôle de médiateur précaire.`,
              explication: `Nos actes manqués, nos lapsus, nos rêves et nos angoisses témoignent de ce que nos motivations réelles échappent le plus souvent à notre contrôle lucide.`,
              illustration: {
                auteur: 'Sigmund Freud',
                oeuvre: 'Introduction à la psychanalyse (1916)',
                citation: '« Le Moi n\'est pas maître dans sa propre maison. »',
                analyseIllustration: `Freud démontre que la conscience subit une troisième blessure narcissique majeure (après Copernic et Darwin), n'étant plus le centre souverain du psychisme.`
              }
            },
            {
              letter: 'B',
              title: `Le risque de déresponsabilisation et le déterminisme psychique`,
              argument: `Postuler un inconscient tout-puissant risque d'annihiler la morale en offrant à l'homme une justification facile pour ses fautes et ses dérives.`,
              explication: `Si l'inconscient guide nos actes, le criminel ou le lâche peuvent prétendre qu'ils n'étaient pas conscients et donc non coupables de leurs actions.`,
              illustration: {
                auteur: 'Alain',
                oeuvre: 'Éléments de philosophie (1941)',
                citation: '« L\'inconscient est une méprise sur le Moi, c\'est une idolâtrie du corps. »',
                analyseIllustration: `Alain met en garde contre la création d'un "fantôme" psychologique qui détruirait l'exigence morale de maîtrise de soi par la volonté.`
              }
            }
          ]
        },
        {
          title: `Axe III : Synthèse — La conquête de soi par la prise de conscience et le refus de la mauvaise foi`,
          thesisOverview: `L'inconscient n'est pas un destin fatal mais un défi d'émancipation lucide par le travail de la pensée.`,
          arguments: [
            {
              letter: 'A',
              title: `Le travail analytique comme libération du sujet`,
              argument: `Le but de la psychanalyse n'est pas d'enfermer l'homme dans ses pulsions mais de permettre au Moi de conquérir les territoires obscurs du Ça par le langage.`,
              explication: `En formulant ce qui était refoulé, le sujet se réapproprie son histoire et cesse de répéter aveuglément ses traumatismes d'enfance.`,
              illustration: {
                auteur: 'Sigmund Freud',
                oeuvre: 'Nouvelles conférences sur la psychanalyse (1932)',
                citation: '« Là où était le Ça, le Moi doit advenir (Wo Es war, soll Ich werden). »',
                analyseIllustration: `Cette maxime célèbre prouve que la psychanalyse est fondamentalement une entreprise rationaliste et humaniste d'affranchissement de la conscience.`
              }
            },
            {
              letter: 'B',
              title: `L'homme comme liberté absolue et responsabilité sans excuse`,
              argument: `L'homme est toujours conscient de ses choix profonds : invoquer l'inconscient relève souvent d'une stratégie d'auto-illusion pour esquiver son angoisse de liberté.`,
              explication: `Même nos passions et nos émotions sont des manières que la conscience choisit pour habiter le monde et se dérober à son devoir d'authenticité.`,
              illustration: {
                auteur: 'Jean-Paul Sartre',
                oeuvre: 'L\'Être et le Néant (1943)',
                citation: '« La mauvaise foi est un mensonge à soi-même où le trompeur et le trompé ne font qu\'un. »',
                analyseIllustration: `Sartre affirme que l'homme est pleinement responsable de ses actes et ne peut jamais s'abriter derrière la théorie de l'inconscient pour justifier ses lâchetés.`
              }
            }
          ]
        }
      ],
      conclusion: {
        bilanSynthese: `En définitive, l'illusion d'une transparence absolue de la conscience s'est dissipée devant la réalité des forces psychiques inconscientes mises au jour par Freud. Cependant, cette découverte ne signe nullement la défaite de la raison.`,
        reponseDefinitive: `L'inconscient ne ruine pas la liberté humaine : il en constitue le défi premier. C'est précisément par l'effort de prise de conscience, de verbalisation et d'autocritique que le sujet accède à une liberté authentique.`,
        elargissement: `La connaissance de soi n'est pas un état de fait donné au départ, mais une tâche éthique et philosophique perpétuelle qui fonde toute la grandeur de l'aventure humaine.`
      }
    },
    expectedKeywords: ['conscience', 'inconscient', 'freud', 'descartes', 'cogito', 'ça', 'moi', 'surmoi', 'refoulement', 'sartre', 'mauvaise foi', 'alain', 'liberté', 'dignité', 'kant']
  },

  // 3. L'ÉTAT, LA JUSTICE ET LA SOCIÉTÉ (Politique)
  {
    id: 'philo-etat-justice-societe',
    queryKeywords: /[ée]tat|justice|soci[ée]t[ée]|politique|loi|pouvoir|droit|rousseau|machiavel|hobbes|locke/i,
    discipline: 'philo',
    disciplineLabel: 'Philosophie Politique & Droit',
    cycle: 'second_cycle_bac',
    level: 'terminale',
    levelLabel: 'Terminale (Séries A, C, D)',
    chapterTitle: 'L\'État et la Justice : Souveraineté, Liberté civile, Droit et Légitimité du Pouvoir',
    definitionAndScope: `L'État désigne l'institution politique souveraine qui exerce l'autorité légitime et garantit l'ordre juridique sur un territoire donné. La justice désigne à la fois la conformité au droit positif (légalité) et l'idéal moral d'équité et de respect des droits fondamentaux (légitimité).`,
    coreConceptsAndFormulas: [
      {
        name: 'Thomas Hobbes — Le Léviathan (1651)',
        formulaOrRule: '« L\'homme est un loup pour l\'homme à l\'état de nature (Homo homini lupus). »',
        explanation: 'Sans autorité centrale souveraine forte, les hommes vivent dans la peur constante de la mort violente ; l\'État est le garant indispensable de la sécurité civile.',
        contextOrApplication: 'Axe de la sécurité et du contrat absolutiste protecteur.',
      },
      {
        name: 'Jean-Jacques Rousseau — Du contrat social (1762)',
        formulaOrRule: '« L\'obéissance à la loi qu\'on s\'est prescrite est liberté. »',
        explanation: 'Le pacte républicain transforme la liberté naturelle sauvage en liberté civile et morale sous l\'autorité de la Volonté Générale.',
        contextOrApplication: 'Axe démocratique : la souveraineté populaire et la loi comme expression de tous.',
      },
      {
        name: 'Karl Marx — L\'Idéologie allemande (1845)',
        formulaOrRule: '« L\'État est un instrument d\'oppression de la classe dominante sur la classe dominée. »',
        explanation: 'L\'État moderne masque sous le droit abstrait les rapports d\'exploitation économique et la propriété privée.',
        contextOrApplication: 'Axe critique socio-économique : l\'État comme superstructure idéologique.',
      },
      {
        name: 'Max Weber — Le Savant et le Politique (1919)',
        formulaOrRule: '« L\'État est cette communauté humaine qui revendique le monopole de la violence physique légitime. »',
        explanation: 'Seul l\'État a le droit d\'user de la force pour faire respecter les lois démocratiques et préserver la paix publique.',
        contextOrApplication: 'Axe sociologique : monopole régalien et rationalité bureaucratique.',
      }
    ],
    stepByStepMethod: [
      {
        stepNumber: 1,
        title: 'Poser la distinction entre État de nature et État civil',
        whatToDo: 'Définir pourquoi les hommes ont créé l\'État (passage de la violence arbitraire à la règle de droit).',
        reflexOrTip: 'Mobiliser les théoriciens du Contrat Social (Hobbes, Locke, Rousseau).',
      },
      {
        stepNumber: 2,
        title: 'Confronter le risque d\'oppression étatique à l\'exigence de justice',
        whatToDo: 'Analyser la tentation du totalitarisme ou de l\'arbitraire policier versus la garantie des libertés fondamentales.',
        reflexOrTip: 'Distinguer droit positif (les lois écrites d\'un pays) et droit naturel/moral (l\'idéal de justice universelle).',
      },
      {
        stepNumber: 3,
        title: 'Synthétiser autour de l\'État de droit démocratique',
        whatToDo: 'Montrer que l\'État n\'est pas une fin en soi mais un moyen au service de l\'émancipation citoyenne et du bien commun.',
        reflexOrTip: 'Citer la séparation des pouvoirs de Montesquieu et la primauté de la justice sociale.',
      }
    ],
    solvedExample: {
      problemStatement: 'Sujet type BAC : « L\'État est-il l\'ennemi de la liberté individuelle ? »',
      solutionStepByStep: `1. Thèse : L'État restreint la liberté par ses lois, ses impôts et son appareil coercitif répressif.\n2. Antithèse : Sans l'État et ses lois, la liberté naturelle dégénère en loi du plus fort où nul n'est véritablement en sécurité (Hobbes, Rousseau).\n3. Synthèse : L'État de droit démocratique ne détruit pas la liberté, il en est la condition de possibilité en la garantissant également pour chaque citoyen.`,
      finalAnswer: 'Démonstration complète certifiée conforme aux annales officielles de Philosophie politique.',
    },
    classicExamTraps: [
      'Confondre autorité légitime fondée sur la loi et autoritarisme tyrannique arbitraire.',
      'Oublier de distinguer légalité (ce qui est conforme aux lois) et légitimité (ce qui est juste moralement, cf. Antigone).',
      'Présenter l\'anarchisme ou la suppression de l\'État sans analyser les conséquences concrètes sur la paix civile.',
    ],
    selfCheckChecklist: [
      'Les théories du contrat social sont-elles bien distinguées (Hobbes vs Rousseau) ?',
      'La différence entre force brute et puissance légitime est-elle démontrée ?',
      'La conclusion répond-elle rigoureusement au sujet posé ?',
    ],
    quickRevisionMemo: 'L\'État n\'est pas l\'ennemi de la liberté authentique : il en est le rempart indispensable contre la tyrannie du plus fort.',
    certificationNote: 'Fiche conforme aux exigences du Baccalauréat ivoirien (Séries A, C, D).',
    essayStructure: {
      amorce: `Depuis l'Antiquité, la vie en communauté politique s'est organisée autour d'institutions souveraines chargées d'édicter le droit et d'assurer la sécurité des citoyens.`,
      definitionTension: `Pourtant, par ses lois contraignantes, sa police et ses tribunaux, l'État impose des limites strictes à nos désirs, ce qui pousse souvent l'individu à percevoir l'appareil étatique comme un pouvoir oppresseur réduisant sa liberté d'action.`,
      problematique: `Dès lors, l'État est-il un instrument liberticide qui confisque l'autonomie des individus, ou constitue-t-il au contraire la condition institutionnelle indispensable sans laquelle aucune liberté réelle et durable ne saurait exister ?`,
      annoncePlan: `Dans une première partie, nous analyserons les raisons qui conduisent à considérer l'État comme une menace pour la liberté individuelle ; puis, nous démontrerons que la liberté véritable n'est possible qu'au sein de l'ordre juridique garanti par l'État ; enfin, nous établirons que seul un État de droit républicain et démocratique réalise la conciliation harmonieuse du pouvoir et de la justice.`,
      axes: [
        {
          title: `Axe I : L'État perçu comme une entrave et un instrument de domination liberticide`,
          thesisOverview: `L'appareil étatique s'impose aux individus par la contrainte et l'exercice d'un pouvoir coercitif.`,
          arguments: [
            {
              letter: 'A',
              title: `La contrainte des lois et le monopole de la violence`,
              argument: `L'État exige l'obéissance sous peine de sanctions pénales et prive le citoyen de son indépendance naturelle absolue.`,
              explication: `L'omniprésence des règlements, de la fiscalité et des forces de l'ordre peut donner le sentiment d'une dépossession permanente de l'initiative individuelle.`,
              illustration: {
                auteur: 'Max Weber',
                oeuvre: 'Le Savant et le Politique (1919)',
                citation: '« L\'État est cette communauté humaine qui revendique avec succès le monopole de la violence physique légitime. »',
                analyseIllustration: `Weber rappelle que l'essence institutionnelle de l'État repose ultimement sur la contrainte armée, ce qui peut dégénérer en appareil d'asservissement si aucun contre-pouvoir n'existe.`
              }
            },
            {
              letter: 'B',
              title: `L'État comme instrument d'oppression de classe`,
              argument: `Loin de défendre l'intérêt général, l'État protège souvent les privilèges économiques des plus riches au détriment des masses populaires.`,
              explication: `Le droit positif et les institutions politiques servent de masque idéologique pour pérenniser l'inégalité et l'exploitation sociale.`,
              illustration: {
                auteur: 'Karl Marx',
                oeuvre: 'L\'Idéologie allemande (1845)',
                citation: '« L\'État est la forme par laquelle les individus d\'une classe dominante font valoir leurs intérêts communs. »',
                analyseIllustration: `Marx dénonce l'illusion de l'État neutre et bienveillant, appelant à son dépérissement ultime pour instaurer une société sans classes libérée de l'aliénation politique.`
              }
            }
          ]
        },
        {
          title: `Axe II : L'État comme rempart indispensable contre l'anarchie et fondement de la liberté civile`,
          thesisOverview: `L'absence d'État ne produit pas la liberté mais le chaos et le règne brutal de la loi du plus fort.`,
          arguments: [
            {
              letter: 'A',
              title: `La terreur de l'état de nature et la nécessité de la sécurité`,
              argument: `Sans une autorité supérieure souveraine pour faire respecter l'ordre, les hommes sont livrés à la guerre perpétuelle et à la violence arbitraire.`,
              explication: `L'indépendance sauvage où chacun fait tout ce qu'il veut aboutit à ce que personne ne soit libre, car chacun vit dans l'angoisse permanente d'être agressé.`,
              illustration: {
                auteur: 'Thomas Hobbes',
                oeuvre: 'Léviathan (1651)',
                citation: '« À l\'état de nature, la vie de l\'homme est solitaire, indigente, dégoûtante, animale et brève. »',
                analyseIllustration: `Hobbes démontre que l'institution de l'État civil est le seul moyen rationnel d'arracher l'humanité à la peur de la mort violente et de garantir la paix publique.`
              }
            },
            {
              letter: 'B',
              title: `La liberté civile et l'autonomie par la loi démocratique`,
              argument: `La loi républicaine ne supprime pas la liberté : elle la transforme en droit garanti en soumettant tous les citoyens à la même règle commune.`,
              explication: `En obéissant aux lois que la nation a démocratiquement élaborées, le citoyen n'obéit à aucun maître particulier et préserve sa pleine souveraineté morale.`,
              illustration: {
                auteur: 'Jean-Jacques Rousseau',
                oeuvre: 'Du contrat social (1762)',
                citation: '« L\'obéissance à la loi qu\'on s\'est prescrite est liberté. »',
                analyseIllustration: `Rousseau théorise le passage fondamental de la liberté naturelle animale à la liberté civile et morale régie par la Volonté Générale.`
              }
            }
          ]
        },
        {
          title: `Axe III : Synthèse — L'État de droit républicain : garant de la justice et de l'émancipation citoyenne`,
          thesisOverview: `L'État n'est légitime que lorsqu'il subordonne sa puissance au respect des droits de l'homme et à la justice sociale.`,
          arguments: [
            {
              letter: 'A',
              title: `La séparation des pouvoirs comme rempart contre la tyrannie`,
              argument: `Pour que l'État demeure au service de la liberté, sa propre puissance doit être divisée et encadrée par des contre-pouvoirs juridiques indépendants.`,
              explication: `Lorsque le pouvoir exécutif, le pouvoir législatif et le pouvoir judiciaire sont séparés, l'arbitraire du prince est neutralisé par la force du droit constitutionnel.`,
              illustration: {
                auteur: 'Montesquieu',
                oeuvre: 'De l\'esprit des lois (1748)',
                citation: '« Pour qu\'on ne puisse abuser du pouvoir, il faut que, par la disposition des choses, le pouvoir arrête le pouvoir. »',
                analyseIllustration: `Montesquieu pose le socle des démocraties constitutionnelles modernes, où la puissance publique est bridée pour préserver la sécurité de chaque citoyen.`
              }
            }
          ]
        }
      ],
      conclusion: {
        bilanSynthese: `En conclusion, si l'État peut dégénérer en appareil oppressif lorsqu'il est confisqué par des intérêts particuliers ou des tyrans, il demeure en son essence la condition même de l'émancipation humaine.`,
        reponseDefinitive: `L'État n'est pas l'ennemi de la liberté : il en est le garant suprême dès lors qu'il s'érige en État de droit protecteur de la dignité, de l'égalité et de la justice pour tous.`,
        elargissement: `Le défi des républiques contemporaines, en Côte d'Ivoire comme partout dans le monde, réside dans le renforcement permanent de la démocratie citoyenne pour que la puissance publique demeure fidèle à sa mission de justice et de cohésion nationale.`
      }
    },
    expectedKeywords: ['état', 'justice', 'société', 'loi', 'liberté', 'rousseau', 'hobbes', 'weber', 'marx', 'montesquieu', 'contrat social', 'droit', 'pouvoir', 'légitimité']
  },

  // =========================================================================
  // 2. FRANÇAIS & LITTÉRATURE (BAC & BEPC) : ROMAN, POÉSIE ENGAGÉE, THÉÂTRE
  // =========================================================================
  {
    id: 'francais-roman-societe',
    queryKeywords: /roman|personnage|soci[ée]t[ée]|balzac|zola|kourouma|dadi[ée]|hugo|engagement|fiction/i,
    discipline: 'francais',
    disciplineLabel: 'Français & Littérature',
    cycle: 'second_cycle_bac',
    level: 'terminale',
    levelLabel: 'Lycée (1ère & Terminale)',
    chapterTitle: 'Le Roman et la Société : Miroir du réel, engagement critique et création esthétique',
    definitionAndScope: `Le roman est un genre narratif en prose mettant en scène des personnages engagés dans des péripéties. En littérature africaine et universelle, le roman oscille entre le réalisme social (peinture fidèle des mœurs, dénonciation des injustices) et l'autonomie poétique de la fiction.`,
    coreConceptsAndFormulas: [
      {
        name: 'Stendhal — Le Miroir le long du chemin (Le Rouge et le Noir, 1830)',
        formulaOrRule: '« Un roman est un miroir qui se promène sur une grande route. »',
        explanation: 'Le roman a une vocation réaliste : refléter les lumières mais aussi les boues et les tares de la société de son époque.',
        contextOrApplication: 'Axe réaliste : témoignage historique et sociologique.',
      },
      {
        name: 'Ahmadou Kourouma — Les Soleils des Indépendances (1968)',
        formulaOrRule: '« Les indépendances, rien dans le ventre, tout dans la gueule ! »',
        explanation: 'Le chef-d\'œuvre ivoirien déconstruit les désillusions post-coloniales à travers la déchéance de Fama Doumbouya, hybridant la syntaxe française avec la verve malinké.',
        contextOrApplication: 'Axe critique africain : dénonciation politique et renouveau stylistique.',
      },
      {
        name: 'Bernard Dadié — Climbié (1956)',
        formulaOrRule: '« L\'école est le fleuve qui charrie le savoir et féconde la nation. »',
        explanation: 'Roman d\'apprentissage autobiographique ivoirien relatant la formation d\'un jeune homme sous l\'ère coloniale et son éveil à la conscience patriotique.',
        contextOrApplication: 'Axe du roman d\'éducation et de mémoire collective.',
      },
      {
        name: 'Victor Hugo — Préface des Misérables (1862)',
        formulaOrRule: '« Tant qu\'il y aura sur la terre ignorance et misère, des livres de la nature de celui-ci pourront ne pas être inutiles. »',
        explanation: 'Le roman doit être une arme de combat au service des opprimés et du progrès moral de l\'humanité.',
        contextOrApplication: 'Axe du roman social engagé.',
      }
    ],
    stepByStepMethod: [
      {
        stepNumber: 1,
        title: 'Analyser la citation et identifier le débat esthétique',
        whatToDo: 'Repérer la tension : le roman doit-il être un simple divertissement/œuvre d\'art pure ou un engagement social/politique ?',
        reflexOrTip: 'Préciser les genres romanesques : roman réaliste, naturaliste, d\'apprentissage, politique, allégorique.',
      },
      {
        stepNumber: 2,
        title: 'Illustrer par des œuvres précises (auteurs ivoiriens, africains et universels)',
        whatToDo: 'Citer des personnages et intrigues précis : Fama dans Les Soleils des Indépendances, Climbié de Dadié, Jean Valjean de Hugo, Rastignac de Balzac.',
        reflexOrTip: 'Ne jamais citer un titre sans donner le nom de l\'auteur et analyser la scène exacte.',
      },
      {
        stepNumber: 3,
        title: 'Construire la synthèse littéraire',
        whatToDo: 'Montrer que le roman transcende le simple document historique grâce au pouvoir créateur de la fiction et du style.',
        reflexOrTip: 'Conclure sur le roman comme exploration universelle de la condition humaine.',
      }
    ],
    solvedExample: {
      problemStatement: 'Sujet type BAC : « Le romancier doit-il être avant tout le témoin engagé des souffrances de son peuple ? »',
      solutionStepByStep: `1. Thèse : Le romancier a un devoir civique et moral d'éclairer la société, de dénoncer les injustices et de réveiller les consciences (Hugo, Kourouma, Zola).\n2. Antithèse : Mais le roman est aussi une création imaginaire, une quête stylistique et un plaisir esthétique qui ne saurait être réduit à un manifeste politique (Proust, Flaubert).\n3. Synthèse : La grandeur du roman réside précisément dans sa capacité à marier la vérité humaine la plus poignante à l'art souverain de la forme et de la langue.`,
      finalAnswer: 'Dissertation littéraire complète avec corpus ivoirien et classique parfaitement équilibré.',
    },
    classicExamTraps: [
      'Raconter l\'intrigue d\'un livre au lieu de l\'utiliser comme argument et preuve démonstrative.',
      'Oublier les auteurs africains et ivoiriens au programme (Kourouma, Dadié, Camara Laye, Sembène Ousmane).',
      'Opposer stérilement réalisme et imagination sans montrer leur synthèse dialectique.',
    ],
    selfCheckChecklist: [
      'Mes exemples comportent-ils le nom de l\'auteur, l\'œuvre et le nom du personnage ?',
      'L\'analyse stylistique accompagne-t-elle le résumé des faits ?',
      'Les transitions entre les axes sont-elles rédigées avec soin ?',
    ],
    quickRevisionMemo: 'Le grand roman instruit, émeut et révolte : il est à la fois le miroir d\'une époque et le monument impérissable d\'une langue.',
    certificationNote: 'Fiche conforme aux directives pédagogiques de l\'Inspection Générale de Français.',
    essayStructure: {
      amorce: `Depuis son essor triomphal au XIXe siècle jusqu'aux chefs-d'œuvre contemporains de la littérature négro-africaine, le roman s'est imposé comme le genre littéraire le plus influent et le plus polymorphe de notre culture.`,
      definitionTension: `Interrogeant sans cesse le monde qui l'entoure, l'écrivain est souvent sommé de choisir entre la vocation testimoniale de sa plume, appelée à défendre les opprimés, et la liberté créatrice d'un art qui revendique le droit à la pure fiction et à la beauté stylistique.`,
      problematique: `Dès lors, le roman doit-il être prioritairement le miroir critique des tares sociales et le porte-voix des sans-voix, ou trouve-t-il sa véritable grandeur dans la transfiguration poétique et l'invention imaginaire ?`,
      annoncePlan: `Nous verrons dans un premier moment que le roman s'affirme comme une tribune indispensable d'engagement et de témoignage social ; puis, nous analyserons sa dimension fondamentale d'évasion, d'exploration psychologique et de perfection formelle ; enfin, nous montrerons que les chefs-d'œuvre romanesques réussissent la symbiose parfaite de la lucidité critique et de la puissance esthétique.`,
      axes: [
        {
          title: `Axe I : Le roman comme instrument d'éveil des consciences et miroir critique de la société`,
          thesisOverview: `Le romancier plonge au cœur du réel pour révéler les injustices et porter la voix de son peuple.`,
          arguments: [
            {
              letter: 'A',
              title: `La dénonciation des désillusions et des abus du pouvoir`,
              argument: `En dépeignant les tragédies de son temps, l'écrivain refuse la complaisance et oblige la société à regarder ses propres faillites.`,
              explication: `Le roman devient une arme politique redoutable pour briser les mensonges officiels et éveiller la lucidité citoyenne des lecteurs.`,
              illustration: {
                auteur: 'Ahmadou Kourouma',
                oeuvre: 'Les Soleils des Indépendances (1968)',
                citation: '« Les indépendances, rien dans le ventre, tout dans la gueule ! »',
                analyseIllustration: `À travers la déchéance tragique du prince Fama Doumbouya, Kourouma dresse un réquisitoire implacable contre la confiscation des libertés et la gabegie des régimes du parti unique en Afrique postcoloniale.`
              }
            },
            {
              letter: 'B',
              title: `La peinture poignante de la misère humaine`,
              argument: `Le romancier donne un visage humain aux laissés-pour-compte en suscitant l'indignation morale et la compassion bienfaisante.`,
              explication: `En racontant les souffrances des plus vulnérables, l'auteur incite à la réforme des lois et au progrès social de la collectivité.`,
              illustration: {
                auteur: 'Victor Hugo',
                oeuvre: 'Les Misérables (1862)',
                citation: '« Tant qu\'il y aura sur la terre ignorance et misère, des livres de la nature de celui-ci pourront ne pas être inutiles. »',
                analyseIllustration: `Le destin brisé de Fantine et le combat de Jean Valjean transforment le roman en un plaidoyer universel pour l'éducation et la réhabilitation des proscrits.`
              }
            }
          ]
        },
        {
          title: `Axe II : Le roman comme souveraineté de l'imaginaire, quête stylistique et plaisir de l'art`,
          thesisOverview: `Réduire le roman à un simple tract politique détruirait sa richesse poétique et sa liberté créatrice.`,
          arguments: [
            {
              letter: 'A',
              title: `Le pouvoir d'évasion et l'exploration de la subjectivité`,
              argument: `Le lecteur cherche d'abord dans le roman un univers imaginaire fascinant et une immersion intime dans les méandres de la psychologie humaine.`,
              explication: `La magie du roman réside dans sa capacité à nous faire vivre mille vies différentes, par-delà les urgences immédiates de la politique.`,
              illustration: {
                auteur: 'Marcel Proust',
                oeuvre: 'À la recherche du temps perdu (1913)',
                citation: '« La vraie vie, la vie enfin découverte et éclaircie, la seule vie par conséquent pleinement vécue, c\'est la littérature. »',
                analyseIllustration: `Proust démontre que l'art littéraire permet de ressusciter le temps enfoui et d'accéder à la vérité émotionnelle la plus profonde de la conscience.`
              }
            },
            {
              letter: 'B',
              title: `L'exigence du style et la beauté de la langue`,
              argument: `Un roman ne vaut pas seulement par le sujet qu'il traite, mais par la perfection de sa structure, de son rythme et de ses métaphores.`,
              explication: `Sans maîtrise formelle, les meilleures intentions militantes ne produisent que des œuvres éphémères et sans lendemain.`,
              illustration: {
                auteur: 'Gustave Flaubert',
                oeuvre: 'Correspondance (1852)',
                citation: '« Ce que je voudrais faire, c\'est un livre sur rien, un livre sans attache extérieure, qui se tiendrait de lui-même par la force interne de son style. »',
                analyseIllustration: `Flaubert érige le travail acharné de la phrase en idéal suprême, prouvant que l'art romanesque est d'abord une création esthétique autonome.`
              }
            }
          ]
        },
        {
          title: `Axe III : Synthèse — La transcendance romanesque : l'union du sens et de la forme`,
          thesisOverview: `Les plus grands romans sont ceux qui parviennent à rendre le combat humain inoubliable grâce à la perfection de leur écriture.`,
          arguments: [
            {
              letter: 'A',
              title: `L'enracinement historique transfiguré par le mythe`,
              argument: `Le grand écrivain part du particulier de son peuple pour atteindre l'universel de la condition humaine.`,
              explication: `C'est en réinventant la langue que le romancier confère à son témoignage une portée éternelle qui traverse les siècles.`,
              illustration: {
                auteur: 'Bernard Dadié',
                oeuvre: 'Climbié (1956)',
                citation: '« Je suis un homme, et rien de ce qui touche à l\'homme ne m\'est étranger. »',
                analyseIllustration: `Dadié réussit dans son récit initiatique à peindre la naissance de la Côte d'Ivoire moderne tout en livrant un hymne universel à la dignité et à la liberté de l'homme noir.`
              }
            }
          ]
        }
      ],
      conclusion: {
        bilanSynthese: `En somme, opposer le devoir de témoignage social et la quête de pureté artistique constitue une fausse querelle littéraire. L'histoire du roman prouve que ces deux exigences se nourrissent mutuellement.`,
        reponseDefinitive: `Le romancier n'est ni un simple propagandiste ni un rêveur désincarné : il est celui qui utilise la splendeur du verbe pour éclairer les souffrances et les espoirs de l'humanité.`,
        elargissement: `Dans un monde saturé d'écrans et d'informations éphémères, le roman demeure le sanctuaire irremplaçable où l'homme apprend à penser le monde avec profondeur et sensibilité.`
      }
    },
    expectedKeywords: ['roman', 'société', 'kourouma', 'dadié', 'hugo', 'balzac', 'zola', 'stendhal', 'flaubert', 'engagement', 'réalisme', 'style', 'fiction', 'personnage']
  },

  // =========================================================================
  // 3. MATHÉMATIQUES (BAC C, D & BEPC) : FONCTIONS, SUITES, PROBABILITÉS
  // =========================================================================
  {
    id: 'maths-analyse-fonctions',
    queryKeywords: /d[ée]riv|fonct|limite|asymptote|tableau de variation|continuit[ée]|tvi|exponentielle|logarithme|ln|primitive|int[ée]gral/i,
    discipline: 'mathematiques',
    disciplineLabel: 'Mathématiques — Analyse',
    cycle: 'second_cycle_bac',
    level: 'terminale',
    levelLabel: 'Terminale C, D & E',
    chapterTitle: 'Étude Complète de Fonctions : Limites, Dérivation, TVI et Calcul Intégral',
    definitionAndScope: `L'analyse mathématique en classe de Terminale repose sur l'étude rigoureuse des fonctions numériques d'une variable réelle : ensemble de définition, limites aux bornes et asymptotes, calcul de la dérivée f'(x), signe de f' et sens de variation, théorème des valeurs intermédiaires (TVI), convexité et calcul d'aires sous la courbe par intégration.`,
    coreConceptsAndFormulas: [
      {
        name: 'Formules Fondamentales de Dérivation',
        formulaOrRule: '(u·v)\' = u\'v + uv\'  |  (u/v)\' = (u\'v - uv\')/v²  |  (e^u)\' = u\'·e^u  |  (ln u)\' = u\'/u  |  (u^n)\' = n·u\'·u^(n-1)',
        explanation: 'La fonction dérivée donne le coefficient directeur de la tangente à la courbe en tout point. Son signe indique strictement les variations de f(x).',
        contextOrApplication: 'Étape obligatoire de tout problème d\'analyse au Baccalauréat.',
      },
      {
        name: 'Croissances Comparées (Limites Indéterminées)',
        formulaOrRule: 'lim(x→+∞) (e^x / x^n) = +∞  |  lim(x→-∞) (x^n · e^x) = 0  |  lim(x→+∞) (ln(x) / x^n) = 0  |  lim(x→0+) (x^n · ln x) = 0',
        explanation: 'Permet de lever systématiquement les formes indéterminées (« ∞/∞ », « 0 × ∞ ») aux voisinages de l\'infini et de zéro.',
        contextOrApplication: 'Indispensable pour justifier rigoureusement les asymptotes horizontales et verticales.',
      },
      {
        name: 'Théorème des Valeurs Intermédiaires (Corollaire / Théorème de la Bijection)',
        formulaOrRule: 'Si f est continue et strictement monotone sur [a, b], pour tout k entre f(a) et f(b), l\'équation f(x) = k admet une unique solution α ∈ ]a, b[.',
        explanation: 'Garantit l\'existence et l\'unicité de la solution α et permet d\'en donner un encadrement par dichotomie ou balayage.',
        contextOrApplication: 'Question canonique présente dans 100% des épreuves de BAC C et D.',
      },
      {
        name: 'Équation de la Tangente et Calcul d\'Aire',
        formulaOrRule: 'Tangente en x_0 : y = f\'(x_0)·(x - x_0) + f(x_0)  |  Aire = ∫_a^b [f(x) - g(x)] dx en unités d\'aire (u.a.)',
        explanation: 'Traduit géométriquement les propriétés différentielles et intégrales de la fonction.',
        contextOrApplication: 'Tracé de la courbe représentative (C_f) et questions de synthèse.',
      }
    ],
    stepByStepMethod: [
      {
        stepNumber: 1,
        title: 'Déterminer le domaine D_f et calculer les limites aux bornes',
        whatToDo: 'Identifier les valeurs interdites (dénominateurs non nuls, arguments strictement positifs pour ln). Calculer les limites et préciser la nature des asymptotes (verticale x=a, horizontale y=b, oblique y=ax+b).',
        reflexOrTip: 'Toujours rédiger : "Puisque lim numérateur = L et lim dénominateur = 0+, alors lim f(x) = +∞, donc la droite (D) : x=a est asymptote verticale à (C_f)".',
      },
      {
        stepNumber: 2,
        title: 'Calculer la dérivée f\'(x) et dresser le tableau de variations',
        whatToDo: 'Préciser que f est dérivable sur D_f comme somme/produit/quotient de fonctions dérivables. Factoriser f\'(x) au maximum pour étudier son signe de manière limpide.',
        reflexOrTip: 'Vérifier la cohérence entre les flèches du tableau de variations et les limites calculées aux bornes (pas de flèche montante vers une valeur inférieure).',
      },
      {
        stepNumber: 3,
        title: 'Appliquer le TVI et tracer les éléments caractéristiques de (C_f)',
        whatToDo: 'Vérifier les 3 hypothèses du TVI (continuité, stricte monotonie, appartenance de k à l\'intervalle image). Placer les asymptotes, les tangentes remarquables et les points d\'inflexion.',
        reflexOrTip: 'Encadrer le résultat final avec l\'arrondi demandé (à 10^-2 près).',
      }
    ],
    solvedExample: {
      problemStatement: 'Sujet type BAC : Soit f(x) = (2x - 1)·e^(-x) + 1 sur ℝ. 1) Limites en -∞ et +∞. 2) Dérivée et variations. 3) Démontrer que f(x)=0 admet une unique solution α.',
      solutionStepByStep: `1. Limites :\n- En -∞ : lim (2x-1) = -∞ et lim e^(-x) = +∞, donc lim f(x) = -∞.\n- En +∞ : f(x) = 2x·e^(-x) - e^(-x) + 1. Par croissances comparées, lim (x·e^(-x)) = 0 et lim e^(-x) = 0, donc lim f(x) = 1. La droite (D) : y = 1 est asymptote horizontale en +∞.\n\n2. Dérivée : f est dérivable sur ℝ. f'(x) = 2·e^(-x) + (2x - 1)·(-e^(-x)) = (3 - 2x)·e^(-x).\nComme e^(-x) > 0 pour tout x, le signe de f'(x) est celui de (3 - 2x). f'(x) s'annule en x = 3/2 (f'(x) > 0 sur ]-∞, 3/2[ et f'(x) < 0 sur ]3/2, +∞[). Le maximum est f(3/2) = 2·e^(-3/2) + 1 ≈ 1,45.\n\n3. Solution unique : f est continue et strictement croissante sur ]-∞, 3/2[. f(]-∞, 3/2[) = ]-∞, 1.45[. Comme 0 ∈ ]-∞, 1.45[, l'équation f(x)=0 admet une unique racine α sur ]-∞, 3/2[. Sur [3/2, +∞[, f(x) ≥ 1 > 0, donc aucune autre solution.`,
      finalAnswer: 'Étude d\'analyse mathématique intégrale résolue avec rédaction exemplaire.',
    },
    classicExamTraps: [
      'Oublier de multiplier par u\' lors de la dérivation de composées : (e^(3x))\' = 3·e^(3x) et NON e^(3x).',
      'Écrire "lim 1/0 = ∞" sur sa copie (cette écriture est interdite par les jurys : écrire lim dénominateur = 0).',
      'Appliquer le TVI sans mentionner la CONTINUITÉ de la fonction sur l\'intervalle considéré.',
    ],
    selfCheckChecklist: [
      'Le domaine de définition et de dérivabilité a-t-il été posé ?',
      'Le signe de la dérivée est-il clairement justifié par un tableau de signes ?',
      'Toutes les asymptotes ont-elles leur équation cartésienne explicite ?',
    ],
    quickRevisionMemo: 'Dérivée positive = fonction croissante. Dérivée négative = fonction décroissante. TVI = continuité + stricte monotonie.',
    certificationNote: 'Fiche conforme aux exigences du Baccalauréat Scientifique (Séries C, D, E) et aux annales CIAM.',
    expectedKeywords: ['dérivée', 'limite', 'asymptote', 'fonction', 'tvi', 'exponentielle', 'logarithme', 'variations', 'tableau', 'tangente', 'intégrale', 'croissances comparées']
  },

  // 4. SUITES NUMÉRIQUES & PROBABILITÉS (Maths BAC)
  {
    id: 'maths-suites-probabilites',
    queryKeywords: /suite|arithm[ée]tique|g[ée]om[ée]trique|r[ée]currence|convergence|probabil|arbre|loi binomiale|d[ée]nombrement|combinaison/i,
    discipline: 'mathematiques',
    disciplineLabel: 'Mathématiques — Suites & Proba',
    cycle: 'second_cycle_bac',
    level: 'terminale',
    levelLabel: 'Terminale C & D',
    chapterTitle: 'Suites Numériques & Probabilités : Raisonnement par récurrence, Sommes et Lois discrètes',
    definitionAndScope: `Les suites numériques modélisent des évolutions discrètes (terme général u_n, relation de récurrence u_(n+1) = f(u_n), convergence, théorème de convergence monotone). Les probabilités étudient les événements aléatoires (arbres pondérés, formule des probabilités totales, loi binomiale B(n, p)).`,
    coreConceptsAndFormulas: [
      {
        name: 'Suites Arithmétiques & Géométriques (Terme général et Sommes)',
        formulaOrRule: 'Arithmétique (raison r) : u_n = u_0 + n·r  |  Somme = (n+1)·(u_0 + u_n)/2\nGéométrique (raison q) : v_n = v_0 · q^n  |  Somme = v_0 · (1 - q^(n+1))/(1 - q)  (si q ≠ 1)',
        explanation: 'Si -1 < q < 1, alors lim(n→+∞) q^n = 0 (la suite géométrique converge vers 0). Si q > 1, elle diverge vers +∞.',
        contextOrApplication: 'Exercice récurrent n°1 du BAC ivoirien.',
      },
      {
        name: 'Raisonnement par Récurrence (Structure en 3 temps)',
        formulaOrRule: '1. Initialisation (vérifier au rang n_0)\n2. Hérédité (supposer P(n) vraie, démontrer P(n+1))\n3. Conclusion (P(n) est vraie pour tout n ≥ n_0)',
        explanation: 'Méthode de preuve universelle pour démontrer des inégalités ou des formes explicites de suites récurrentes.',
        contextOrApplication: 'Exigence de rigueur absolue au Baccalauréat.',
      },
      {
        name: 'Formule des Probabilités Totales & Loi Binomiale',
        formulaOrRule: 'Probabilités totales : P(B) = ∑ P(A_i ∩ B) = ∑ P(A_i) · P_{A_i}(B)\nLoi Binomiale B(n, p) : P(X = k) = (n k) · p^k · (1-p)^(n-k)  |  E(X) = n·p  |  V(X) = n·p·(1-p)',
        explanation: 'Modélise la répétition de n épreuves de Bernoulli identiques et indépendantes à deux issues (succès/échec).',
        contextOrApplication: 'Problème de probabilités standard du BAC.',
      }
    ],
    stepByStepMethod: [
      {
        stepNumber: 1,
        title: 'Identifier la nature de la suite auxiliaire (v_n)',
        whatToDo: 'Calculer v_(n+1) en fonction de u_(n+1), remplacer par l\'expression de u_(n+1), factoriser par q pour faire apparaître v_n (v_(n+1) = q·v_n).',
        reflexOrTip: 'Toujours préciser le premier terme v_0 avec son calcul exact.',
      },
      {
        stepNumber: 2,
        title: 'Exprimer v_n puis u_n en fonction de n',
        whatToDo: 'Appliquer v_n = v_0 · q^n puis isoler u_n dans la relation de départ reliant u_n et v_n.',
        reflexOrTip: 'Calculer la limite quand n tend vers +∞ en utilisant la valeur de q.',
      },
      {
        stepNumber: 3,
        title: 'Résoudre les probabilités avec un arbre pondéré',
        whatToDo: 'Indiquer les probabilités sur chaque branche. La somme des probabilités issues d\'un même nœud doit toujours être égale à 1.',
        reflexOrTip: 'Citer textuellement la Formule des Probabilités Totales avant de calculer P(B).',
      }
    ],
    solvedExample: {
      problemStatement: 'Sujet type : Soit (u_n) définie par u_0 = 1 et u_(n+1) = 1/3·u_n + 2. On pose v_n = u_n - 3. 1) Démontrer que (v_n) est géométrique. 2) Exprimer u_n en fonction de n. 3) Calculer sa limite.',
      solutionStepByStep: `1. Suite géométrique :\nv_(n+1) = u_(n+1) - 3 = (1/3·u_n + 2) - 3 = 1/3·u_n - 1 = 1/3·(u_n - 3) = 1/3·v_n.\nDonc (v_n) est une suite géométrique de raison q = 1/3 et de premier terme v_0 = u_0 - 3 = 1 - 3 = -2.\n\n2. Expression en fonction de n :\nPour tout entier naturel n, v_n = v_0 · q^n = -2 · (1/3)^n.\nPuisque v_n = u_n - 3, on en déduit : u_n = v_n + 3 = 3 - 2·(1/3)^n.\n\n3. Limite :\nComme -1 < 1/3 < 1, on a lim(n→+∞) (1/3)^n = 0.\nPar somme de limites, lim(n→+∞) u_n = 3 - 2·(0) = 3.\nLa suite (u_n) est convergente et converge vers 3.`,
      finalAnswer: 'Résolution méthodique parfaite sans aucune omission calculatoire.',
    },
    classicExamTraps: [
      'Confondre le nombre de termes dans une somme de 0 à n : il y a (n + 1) termes et non n termes.',
      'Oublier de préciser l\'hypothèse de récurrence lors de l\'étape d\'hérédité.',
      'Confondre combinaison (ordre non pris en compte) et arrangement (ordre pris en compte).',
    ],
    selfCheckChecklist: [
      'La raison de la suite géométrique est-elle mise en facteur correctement ?',
      'Le calcul du premier terme v_0 est-il explicité ?',
      'La convergence de la suite est-elle justifiée par l\'encadrement -1 < q < 1 ?',
    ],
    quickRevisionMemo: 'Suite géométrique : v_(n+1) = q·v_n. Limite de q^n = 0 si |q| < 1. Probabilités totales : somme des chemins menant à l\'événement.',
    certificationNote: 'Fiche conforme aux annales officielles de Mathématiques BAC C et D.',
    expectedKeywords: ['suite', 'arithmétique', 'géométrique', 'récurrence', 'convergence', 'limite', 'probabilités', 'binomiale', 'arbre pondéré', 'combinaison', 'espérance']
  },

  // =========================================================================
  // 4. PHYSIQUE-CHIMIE (BAC C/D & 3e BEPC) : MÉCANIQUE, ÉLECTRICITÉ, CHIMIE
  // =========================================================================
  {
    id: 'pc-mecanique-newton',
    queryKeywords: /m[ée]canique|newton|cin[ée]matique|trajectoire|acc[ée]l[ée]ration|vitesse|projectile|champ de pesanteur|travail|[ée]nergie/i,
    discipline: 'physique_chimie',
    disciplineLabel: 'Physique-Chimie — Mécanique',
    cycle: 'second_cycle_bac',
    level: 'terminale',
    levelLabel: 'Terminale C & D',
    chapterTitle: 'Mécanique Newtonienne : Lois de Newton, Mouvement dans un Champ de Pesanteur et Énergie',
    definitionAndScope: `La mécanique classique étudie le mouvement des corps sous l'action des forces extérieures. Elle repose sur les trois lois de Newton (principe d'inertie, relation fondamentale de la dynamique ∑ F_ext = m·a, principe des actions réciproques) et sur les théorèmes énergétiques (théorème de l'énergie cinétique ΔEc = ∑ W_AB(F)).`,
    coreConceptsAndFormulas: [
      {
        name: 'Deuxième Loi de Newton (Principe Fondamental de la Dynamique)',
        formulaOrRule: '∑ F_ext = m · a_G = m · (dv/dt)',
        explanation: 'Dans un référentiel galiléen, la somme des forces extérieures appliquées à un solide est égale au produit de sa masse par le vecteur accélération de son centre d\'inertie.',
        contextOrApplication: 'Base universelle de tous les problèmes de mécanique au BAC.',
      },
      {
        name: 'Équations Horaires du Mouvement d\'un Projectile dans le Champ g',
        formulaOrRule: 'Accélération : a_x = 0  |  a_y = -g\nVitesse : v_x(t) = v_0·cos(α)  |  v_y(t) = -g·t + v_0·sin(α)\nPosition : x(t) = v_0·cos(α)·t  |  y(t) = -1/2·g·t² + v_0·sin(α)·t + y_0',
        explanation: 'En éliminant t entre x(t) et y(t), on obtient l\'équation de la trajectoire parabolique : y(x) = -g/(2·v_0²·cos²(α)) · x² + tan(α)·x + y_0.',
        contextOrApplication: 'Calcul de la flèche (sommet) et de la portée (point d\'impact).',
      },
      {
        name: 'Théorème de l\'Énergie Cinétique (TEC) & Énergie Mécanique',
        formulaOrRule: 'ΔE_c = E_c(B) - E_c(A) = 1/2·m·v_B² - 1/2·m·v_A² = ∑ W_AB(F_ext)\nConservation de l\'énergie mécanique : E_m = E_c + E_p = constante (en l\'absence de frottements).',
        explanation: 'Permet de calculer une vitesse finale ou une hauteur sans devoir intégrer les équations différentielles horaires.',
        contextOrApplication: 'Méthode alternative élégante et rapide pour les calculs de vitesse.',
      }
    ],
    stepByStepMethod: [
      {
        stepNumber: 1,
        title: 'Définir le système, le référentiel et faire le bilan des forces',
        whatToDo: 'Système : {solide de masse m}. Référentiel : terrestre supposé galiléen. Bilan : Poids P = m·g, Réaction normale R, Frottements f.',
        reflexOrTip: 'Faire un schéma clair avec le repère (O, i, j) et les vecteurs forces bien orientés.',
      },
      {
        stepNumber: 2,
        title: 'Projeter la 2e loi de Newton sur les axes du repère',
        whatToDo: 'Écrire P_x + R_x + f_x = m·a_x et P_y + R_y + f_y = m·a_y. Déduire les coordonnées du vecteur accélération a(t).',
        reflexOrTip: 'Intégrer successivement avec les conditions initiales à t=0 pour trouver v(t) puis r(t).',
      },
      {
        stepNumber: 3,
        title: 'Déterminer les grandeurs physiques remarquables avec unités',
        whatToDo: 'Calculer la flèche (quand v_y = 0) ou la portée (quand y = 0). Vérifier l\'homogénéité de la formule.',
        reflexOrTip: 'Toujours exprimer le résultat avec son unité réglementaire du Système International (m/s, m, N, J).',
      }
    ],
    solvedExample: {
      problemStatement: 'Sujet type BAC : Un ballon est tiré du sol (y_0=0) avec une vitesse v_0 = 20 m/s faisant un angle α = 30° avec l\'horizontale (g = 9,8 m/s²). 1) Équation de la trajectoire. 2) Calculer la hauteur maximale (flèche).',
      solutionStepByStep: `1. Équation de la trajectoire :\nDans le repère (O, i, j), les équations horaires sont :\nx(t) = (20 · cos 30°) · t = 20 · (√3/2) · t = 17,32 · t  =>  t = x / 17,32.\ny(t) = -1/2 · (9,8) · t² + (20 · sin 30°) · t = -4,9 · t² + 10 · t.\nEn remplaçant t : y(x) = -4,9 · (x / 17,32)² + 10 · (x / 17,32) = -0,0163 · x² + 0,577 · x.\nLa trajectoire est une parabole concave vers le bas.\n\n2. Hauteur maximale (Flèche H) :\nAu sommet S de la trajectoire, la composante verticale de la vitesse s'annule : v_y(t_S) = 0.\n-9,8 · t_S + 10 = 0  =>  t_S = 10 / 9,8 = 1,02 s.\nEn reportant dans y(t) : y_max = -4,9 · (1,02)² + 10 · (1,02) = -5,10 + 10,20 = 5,10 m.\nLa hauteur maximale atteinte par le ballon est de 5,10 mètres.`,
      finalAnswer: 'Résolution physique rigoureuse avec toutes les étapes de calcul et unités précisées.',
    },
    classicExamTraps: [
      'Oublier de mentionner que le référentiel terrestre est "supposé galiléen" pour pouvoir appliquer Newton.',
      'Confondre sin(α) et cos(α) lors de la projection des composantes initiale de la vitesse.',
      'Oublier le signe négatif dans l\'accélération de la pesanteur : a_y = -g (car j est orienté vers le haut).',
    ],
    selfCheckChecklist: [
      'Le bilan des forces est-il complet avec les notations vectorielles correctes ?',
      'Les constantes d\'intégration à t=0 sont-elles explicitement justifiées ?',
      'Le résultat numérique est-il encadré avec son unité (ex: mètres, Joules) ?',
    ],
    quickRevisionMemo: '∑ F = m·a. Pour un projectile : mouvement rectiligne uniforme sur l\'axe Ox (a_x=0), mouvement rectiligne uniformément varié sur Oy (a_y=-g).',
    certificationNote: 'Fiche certifiée conforme aux programmes officiels de Physique-Chimie (BAC C, D).',
    expectedKeywords: ['mécanique', 'newton', 'accélération', 'vitesse', 'trajectoire', 'pesanteur', 'projectile', 'flèche', 'portée', 'énergie cinétique', 'force', 'frottement']
  },

  // 5. CHIMIE (Acides-Bases, pH, Estérification)
  {
    id: 'pc-chimie-acides-bases',
    queryKeywords: /chimie|acide|base|ph|dosage|titrage|tampon|pka|est[ée]rification|oxydor[ée]duction|molaire/i,
    discipline: 'physique_chimie',
    disciplineLabel: 'Physique-Chimie — Chimie',
    cycle: 'second_cycle_bac',
    level: 'terminale',
    levelLabel: 'Terminale C & D',
    chapterTitle: 'Chimie : Solutions Aqueuses, Réactions Acide-Base, pH et Dosages Volumétriques',
    definitionAndScope: `La chimie des solutions étudie les équilibres acide-base au sens de Brönsted (transfert de proton H+), la mesure du pH (pH = -log[H_3O+]), la constante d'acidité Ka / pKa, et les titrages volumétriques (équivalence C_A·V_AE = C_B·V_B).`,
    coreConceptsAndFormulas: [
      {
        name: 'Définition du pH & Produit Ionique de l\'Eau',
        formulaOrRule: 'pH = -log[H_3O+]  <=>  [H_3O+] = 10^(-pH)\nProduit ionique de l\'eau à 25°C : Ke = [H_3O+] · [HO-] = 10^(-14)  |  pKe = 14',
        explanation: 'Solution acide : pH < 7 ([H_3O+] > [HO-]). Solution neutre : pH = 7. Solution basique : pH > 7.',
        contextOrApplication: 'Fondement de la chimie analytique.',
      },
      {
        name: 'Relation d\'Henderson-Hasselbalch & Domaine de Prédominance',
        formulaOrRule: 'pH = pKa + log([Base] / [Acide])\nSi pH < pKa - 1 : l\'acide AH prédomine largement.\nSi pH = pKa : [AH] = [A-] (demi-équivalence d\'un dosage faible/fort).\nSi pH > pKa + 1 : la base A- prédomine largement.',
        explanation: 'Permet de tracer les diagrammes de prédominance et d\'expliquer le pouvoir tampon des solutions biologiques.',
        contextOrApplication: 'Question classique récurrente dans tous les examens.',
      },
      {
        name: 'Équivalence d\'un Titrage Acido-Basique',
        formulaOrRule: 'À l\'équivalence : n_acide_initial / a = n_base_versée / b  =>  C_A · V_A = C_B · V_BE (pour une réaction 1:1)',
        explanation: 'L\'équivalence est le moment où les réactifs ont été mélangés dans les proportions stœchiométriques.',
        contextOrApplication: 'Détermination expérimentale de concentrations inconnues.',
      }
    ],
    stepByStepMethod: [
      {
        stepNumber: 1,
        title: 'Écrire l\'équation-bilan de la réaction avec les couples acide/base',
        whatToDo: 'Identifier l\'acide 1 (qui cède H+) et la base 2 (qui capte H+) : AH + B- ⇌ A- + BH.',
        reflexOrTip: 'Vérifier la conservation des éléments chimiques et de la charge électrique totale.',
      },
      {
        stepNumber: 2,
        title: 'Dresser le tableau d\'avancement en quantités de matière (moles)',
        whatToDo: 'Calculer l\'avancement maximal x_max et l\'avancement final x_f à partir de la mesure du pH. Déduire le taux d\'avancement final τ = x_f / x_max.',
        reflexOrTip: 'Si τ = 1, la réaction est totale (acide fort) ; si τ < 1, la réaction est limitée/équilibrée (acide faible).',
      },
      {
        stepNumber: 3,
        title: 'Exploiter le volume équivalent V_E',
        whatToDo: 'Appliquer la relation d\'équivalence pour calculer la concentration molaire inconnue C_A puis la concentration massique C_m = C_A · M.',
        reflexOrTip: 'Préciser l\'unité finale (mol/L ou g/L).',
      }
    ],
    solvedExample: {
      problemStatement: 'Sujet type BAC : On dose V_A = 20 mL d\'une solution d\'acide éthanoïque CH_3COOH par de la soude (Na+ + HO-) de concentration C_B = 0,10 mol/L. Le volume à l\'équivalence est V_BE = 15 mL. 1) Équation du dosage. 2) Calculer C_A. 3) Donner le pH à la demi-équivalence (pKa = 4,8).',
      solutionStepByStep: `1. Équation bilan :\nCH_3COOH + HO- → CH_3COO- + H_2O (réaction totale, exothermique et rapide).\n\n2. Calcul de la concentration C_A :\nÀ l'équivalence stœchiométrique, la quantité de matière d'acide initialement présente est égale à la quantité de base apportée :\nC_A · V_A = C_B · V_BE\nC_A = (C_B · V_BE) / V_A = (0,10 mol/L · 15 mL) / 20 mL = 1,5 / 20 = 0,075 mol/L.\nLa concentration de la solution d'acide éthanoïque est donc C_A = 7,5 × 10^-2 mol/L.\n\n3. pH à la demi-équivalence :\nÀ la demi-équivalence (versé V_B = V_BE / 2 = 7,5 mL), la moitié de l'acide faible a été transformée en sa base conjuguée, donc [CH_3COOH] = [CH_3COO-].\nD'après la relation : pH = pKa + log([Base]/[Acide]) = pKa + log(1) = pKa.\nLe pH du mélange à la demi-équivalence est donc exactement égal au pKa, soit pH = 4,8.`,
      finalAnswer: 'Dosage acido-basique intégralement résolu selon les normes du BAC.',
    },
    classicExamTraps: [
      'Oublier de convertir les volumes en litres lors du calcul direct des quantités de matière en moles.',
      'Confondre réaction de dosage (qui doit être totale) et équilibre d\'ionisation dans l\'eau pure.',
      'Oublier que le pH à l\'équivalence d\'un acide faible dosé par une base forte est BASIQUE (pH_E > 7).',
    ],
    selfCheckChecklist: [
      'L\'équation de la réaction acido-basique est-elle équilibrée ?',
      'La formule d\'équivalence est-elle explicitée avant le calcul numérique ?',
      'L\'unité mol/L est-elle bien mentionnée avec le nombre correct de chiffres significatifs ?',
    ],
    quickRevisionMemo: 'Équivalence : C_A·V_A = C_B·V_BE. Demi-équivalence : pH = pKa. Acide fort dosé par base forte : pH_E = 7. Acide faible dosé par base forte : pH_E > 7.',
    certificationNote: 'Fiche conforme aux exigences de l\'épreuve écrite de Physique-Chimie du Baccalauréat.',
    expectedKeywords: ['chimie', 'acide', 'base', 'ph', 'dosage', 'équivalence', 'demi-équivalence', 'pka', 'titrage', 'avancement', 'soude', 'éthanoïque']
  },

  // =========================================================================
  // 5. HISTOIRE-GÉOGRAPHIE (BAC & BEPC) : DÉCOLONISATION, CÔTE D'IVOIRE, MONDIALISATION
  // =========================================================================
  {
    id: 'hg-decolonisation-ci',
    queryKeywords: /d[ée]colonisation|ind[ée]pendance|houphou[ëe]t|histoire|g[ée]ographie|c[ôo]te d'ivoire|caf[ée]|cacao|guerre froide|imp[ée]rialisme|mondialisation|d[ée]forestation/i,
    discipline: 'histoire',
    disciplineLabel: 'Histoire & Géographie',
    cycle: 'second_cycle_bac',
    level: 'terminale',
    levelLabel: 'Terminale & 3e BEPC',
    chapterTitle: 'Histoire-Géographie : Décolonisation africaine, Construction de la Côte d\'Ivoire moderne et Économie de rente',
    definitionAndScope: `L'Histoire-Géographie étudie l'évolution politique des sociétés contemporaines (l'émancipation des peuples colonisés en Afrique et Asie, la guerre froide, la marche vers l'indépendance de la Côte d'Ivoire proclamée le 7 août 1960) et les dynamiques territoriales (l'agriculture de rente café-cacao, le binôme portuaire d'Abidjan et San Pedro, les disparités régionales et la préservation de l'environnement).`,
    coreConceptsAndFormulas: [
      {
        name: 'La Marche de la Côte d\'Ivoire vers l\'Indépendance (1944 - 1960)',
        formulaOrRule: 'Création du SAA (1944) -> Fondation du PDCI-RDA (1946) -> Loi-cadre Defferre (1956) -> Communauté franco-africaine (1958) -> Proclamation de l\'Indépendance (7 août 1960 par Félix Houphouët-Boigny).',
        explanation: 'La décolonisation ivoirienne s\'est distinguée par une stratégie politique pragmatique et pacifique, fondée sur la suppression du travail forcé et l\'alliance syndicale des planteurs africains.',
        contextOrApplication: 'Chapitre historique majeur du programme officiel de 3e et Terminale.',
      },
      {
        name: 'Le Modèle Économique Ivoirien : L\'Agriculture de Rente',
        formulaOrRule: 'Binôme Café-Cacao (1er producteur mondial de cacao) + Diversification (Hévéa, Palmier à huile, Anacarde/Noix de cajou, Coton) + Infrastructures logistiques (Ports autonomes d\'Abidjan et San Pedro).',
        explanation: 'Moteur du « miracle ivoirien » des années 1960-1970, ce modèle fait face aujourd\'hui à des défis structurants : transformation locale industrielle, lutte contre la déforestation et volatilité des cours mondiaux.',
        contextOrApplication: 'Thème central de géographie économique.',
      },
      {
        name: 'Méthodologie du Commentaire de Document en Histoire-Géo',
        formulaOrRule: '1. Présentation générale (Nature, Auteur, Date, Source, Contexte historique / Idée générale)\n2. Analyse ordonnée des thèmes en confrontant le texte aux connaissances du cours\n3. Portée historique ou géographique et critique des limites du document.',
        explanation: 'Règle d\'or : ne jamais paraphraser le texte sans expliquer le contexte et les conséquences historiques.',
        contextOrApplication: 'Exercice obligatoire aux examens du BEPC et du BAC.',
      }
    ],
    stepByStepMethod: [
      {
        stepNumber: 1,
        title: 'Identifier la consigne et le cadre spatio-temporel',
        whatToDo: 'Situer l\'événement dans sa période historique exacte (ex: 1944-1960 pour la décolonisation) ou définir l\'espace géographique étudié (le territoire ivoirien et ses zones agro-écologiques).',
        reflexOrTip: 'Citer les dates clés avec précision (7 août 1960, conférence de Brazzaville 1944, abolition du travail forcé en 1946 par la loi Houphouët-Boigny).',
      },
      {
        stepNumber: 2,
        title: 'Organiser le devoir en axes historiques ou géographiques équilibrés',
        whatToDo: 'Pour l\'histoire : Causes -> Déroulement/Étapes -> Conséquences et Portée. Pour la géographie : Atouts/Facteurs -> Manifestations spatiales -> Défis et Perspectives de développement.',
        reflexOrTip: 'Utiliser le vocabulaire technique : balance commerciale, PIB, transition démographique, souveraineté nationale, panafricanisme.',
      },
      {
        stepNumber: 3,
        title: 'Formuler un bilan nuancé',
        whatToDo: 'Faire la synthèse des acquis et ouvrir sur les défis contemporains (intégration sous-régionale CEDEAO, industrialisation, développement durable).',
        reflexOrTip: 'Rédiger une conclusion claire et prospective.',
      }
    ],
    solvedExample: {
      problemStatement: 'Sujet type : « Analysez les facteurs internes et externes qui ont favorisé l\'accession de la Côte d\'Ivoire à la souveraineté internationale le 7 août 1960. »',
      solutionStepByStep: `1. Facteurs externes : L'affaiblissement des puissances coloniales après la Seconde Guerre mondiale, la pression anticoloniale de l'ONU et des deux superpuissances (États-Unis et URSS), la défaite française en Indochine (1954) et la guerre d'Algérie.\n2. Facteurs internes : La prise de conscience des élites et des planteurs ivoiriens avec la création du Syndicat Agricole Africain (1944), la suppression du travail forcé (loi Houphouët-Boigny de 1946), l'enracinement politique du PDCI-RDA et la mobilisation des femmes (marche de Grand-Bassam en décembre 1949).\n3. Évolution constitutionnelle : La loi-cadre de 1956 accordant l'autonomie interne, la République au sein de la Communauté en 1958, aboutissant à la proclamation solennelle de l'Indépendance le 7 août 1960.`,
      finalAnswer: 'Devoir d\'Histoire complet et documenté conforme aux standards des jurys d\'examen.',
    },
    classicExamTraps: [
      'Confondre la date de l\'Indépendance (7 août 1960) avec d\'autres dates nationales.',
      'Oublier le rôle décisif de la marche héroïque des femmes sur Grand-Bassam en 1949 pour la libération des patriotes.',
      'Faire un récit chronologique brut sans analyser les facteurs économiques et sociaux sous-jacents.',
    ],
    selfCheckChecklist: [
      'Les dates et personnages clés sont-ils mentionnés sans anachronisme ?',
      'Les facteurs internes et externes sont-ils tous deux examinés ?',
      'Le vocabulaire géographique et historique est-il maîtrisé ?',
    ],
    quickRevisionMemo: 'Indépendance de la Côte d\'Ivoire : 7 août 1960 par Félix Houphouët-Boigny. Économie : 1er producteur de cacao, modernisation par l\'agro-industrie et les infrastructures.',
    certificationNote: 'Fiche conforme aux programmes de la Direction de la Pédagogie et des Formations Continues (DPFC).',
    expectedKeywords: ['décolonisation', 'indépendance', 'houphouët-boigny', 'pdci', 'saa', 'grand-bassam', '7 août 1960', 'cacao', 'café', 'agriculture', 'ports', 'histoire', 'géographie']
  }
];

export function findAcademicKnowledge(query: string, disciplineHint?: string): AcademicTopicKnowledge | null {
  const q = query.toLowerCase().trim();
  const disc = (disciplineHint || '').toLowerCase();

  // First check specific match via regex
  for (const topic of ACADEMIC_KNOWLEDGE_BASE) {
    if (topic.queryKeywords.test(q)) {
      return topic;
    }
  }

  // Second check if discipline matches closely
  if (/philo/i.test(disc) || /philosophie/i.test(q)) {
    // Default to conscience or mythe if query is philosophical
    if (/conscience|esprit|sujet|ego|psych/i.test(q)) {
      return ACADEMIC_KNOWLEDGE_BASE.find(t => t.id === 'philo-conscience-inconscient') || ACADEMIC_KNOWLEDGE_BASE[0];
    }
    if (/politique|[ée]tat|droit|loi|justice|citoyen/i.test(q)) {
      return ACADEMIC_KNOWLEDGE_BASE.find(t => t.id === 'philo-etat-justice-societe') || ACADEMIC_KNOWLEDGE_BASE[0];
    }
    return ACADEMIC_KNOWLEDGE_BASE[0]; // Philo Mythe/Vérité
  }

  if (/fran[çc]ais|litt[ée]rature/i.test(disc) || /roman|po[ée]sie|th[ée][âa]tre|litt[ée]raire/i.test(q)) {
    return ACADEMIC_KNOWLEDGE_BASE.find(t => t.id === 'francais-roman-societe') || null;
  }

  if (/math/i.test(disc) || /calcul|in[ée]quation|fonction|suite|int[ée]grale/i.test(q)) {
    if (/suite|proba|arbre|al[ée]a|hasard/i.test(q)) {
      return ACADEMIC_KNOWLEDGE_BASE.find(t => t.id === 'maths-suites-probabilites') || ACADEMIC_KNOWLEDGE_BASE[3];
    }
    return ACADEMIC_KNOWLEDGE_BASE.find(t => t.id === 'maths-analyse-fonctions') || ACADEMIC_KNOWLEDGE_BASE[3];
  }

  if (/physique|chimie/i.test(disc) || /vitesse|mouvement|acide|ph|force/i.test(q)) {
    if (/acide|base|ph|chimie|dosage|solution/i.test(q)) {
      return ACADEMIC_KNOWLEDGE_BASE.find(t => t.id === 'pc-chimie-acides-bases') || ACADEMIC_KNOWLEDGE_BASE[5];
    }
    return ACADEMIC_KNOWLEDGE_BASE.find(t => t.id === 'pc-mecanique-newton') || ACADEMIC_KNOWLEDGE_BASE[4];
  }

  if (/histoire|g[ée]ographie|hg|civique|edhc/i.test(disc) || /colonisation|guerre|cacao|ind[ée]pendance/i.test(q)) {
    return ACADEMIC_KNOWLEDGE_BASE.find(t => t.id === 'hg-decolonisation-ci') || null;
  }

  return null;
}
