// French for the descriptive text in the content files that is written in English only
// (roles, summaries, course descriptions, positions, degrees, service, awards, notes, dates,
// link labels). Keyed by the exact English text, so the content files stay unchanged; `tx()`
// (from useLang) returns the French when the site is in French and the English otherwise.
// Not translated on purpose: titles of publications, talks and events, and proper names.
// When you edit an English string in src/content, update (or add) its line here too;
// a missing entry simply shows the English.
export const contentFr: Record<string, string> = {
  /* ------------------------------------------------------------ projects */
  'Co-coordinator for Morocco': 'Co-coordonnateur pour le Maroc',
  'International consortium': 'Consortium international',
  'European Education and Culture Executive Agency (EACEA)': 'Agence exécutive européenne pour l’éducation et la culture (EACEA)',
  'European capacity-building project on computational thinking, inclusion and artificial intelligence in teacher education.':
    'Projet européen de renforcement des capacités sur la pensée computationnelle, l’inclusion et l’intelligence artificielle en formation des enseignants.',
  'An AI-assisted platform that helps learners, educators and entrepreneurs design sustainable business models through systems thinking, causal-loop mapping and data-driven decision tools, integrating learning analytics and systems dynamics within a pedagogical framework.':
    'Une plateforme assistée par l’IA qui aide apprenants, enseignants et entrepreneurs à concevoir des modèles d’affaires durables grâce à la pensée systémique, aux boucles causales et à des outils de décision fondés sur les données, en intégrant l’analytique de l’apprentissage et la dynamique des systèmes dans un cadre pédagogique.',
  'Co-researcher and co-coordinator': 'Co-chercheur et co-coordonnateur',
  'UM6P / Africa Business School': 'UM6P / Africa Business School',
  'UM6P and Fondation OCP': 'UM6P et Fondation OCP',
  'Inclusive Assistive Technology for Access to Information by Deaf and Deafblind People in Emergency Situations and at Major Events':
    'Technologies d’assistance inclusives pour l’accès à l’information des personnes sourdes et sourdaveugles en situation d’urgence et lors de grands événements',
  'Inclusive assistive technology for deaf and deafblind people': 'Technologies d’assistance inclusives pour les personnes sourdes et sourdaveugles',
  'Interinstitutional research proposal on assistive technology for access to information.':
    'Proposition de recherche interinstitutionnelle sur les technologies d’assistance pour l’accès à l’information.',
  'Co-researcher': 'Co-chercheur',
  'Interinstitutional consortium involving UM6P and ENSMR': 'Consortium interinstitutionnel réunissant l’UM6P et l’ENSMR',
  'PNARDI 2025–2028 — MESRSI, Fondation OCP, CNRST and UM6P': 'PNARDI 2025–2028 — MESRSI, Fondation OCP, CNRST et UM6P',
  'Digitalization of Core Curriculum Modules': 'Numérisation des modules du tronc commun',
  'Partnership proposal to digitalize core curriculum modules.': 'Proposition de partenariat pour numériser les modules du tronc commun.',
  'Co-coordinator with the UM6P Digital Learning Center': 'Co-coordonnateur avec le Digital Learning Center de l’UM6P',
  'Partnership proposal': 'Proposition de partenariat',
  'Ministry of National Education, Fondation OCP and UM6P': 'Ministère de l’Éducation nationale, Fondation OCP et UM6P',
  'SIL — distance learning model for rural primary schools': 'SIL — modèle de formation à distance pour les écoles primaires rurales',
  'Co-design of a distance learning model adapted to primary schools in rural Morocco, supported by the Fondation OCP.':
    'Co-conception d’un modèle de formation à distance adapté aux écoles primaires du Maroc rural, avec le soutien de la Fondation OCP.',
  'Co-coordinator': 'Co-coordonnateur',
  'FOCP-supported project': 'Projet soutenu par la FOCP',
  '2021 (one year)': '2021 (un an)',
  'Development of an intelligent tutoring system': 'Développement d’un système tutoriel intelligent',
  'Smart learning environments project (SIGC) on AI-based tutoring, with Prof. Belkacem Chikhaoui, Department of Artificial Intelligence, Université TÉLUQ.':
    'Projet d’environnements d’apprentissage intelligents (SIGC) sur le tutorat fondé sur l’IA, avec le Pr Belkacem Chikhaoui, Département d’intelligence artificielle, Université TÉLUQ.',
  Participant: 'Participant',
  'Research on AI-driven personalised learning with the UNESCO Chair held at Université TÉLUQ.':
    'Recherche sur l’apprentissage personnalisé par l’IA avec la Chaire UNESCO de l’Université TÉLUQ.',
  'Comodal (HyFlex) teaching in francophone Canada': 'L’enseignement comodal (HyFlex) au Canada francophone',
  'Research and guide on comodal teaching — combining presence and distance — with Prof. Serge Gérin-Lajoie, published by REFAD.':
    'Recherche et guide sur l’enseignement comodal — présence et distance combinées — avec le Pr Serge Gérin-Lajoie, publiés par le REFAD.',
  'Research assistant': 'Assistant de recherche',
  'CETAL-CEAN — web design for diverse abilities in the workplace': 'CETAL-CEAN — conception web pour des capacités diverses en milieu de travail',
  'Website accessibility and pedagogical inclusion project that produced the inclusive design teaching guide (SAVIE, CTREQ).':
    'Projet d’accessibilité web et d’inclusion pédagogique qui a produit le guide pédagogique de design inclusif (SAVIE, CTREQ).',
  'Quebec Ministry of Labour': 'Ministère du Travail du Québec',
  'E-learning instructional design and MOOC development (edX, Canvas, WordPress) for research and training programmes.':
    'Conception pédagogique en ligne et développement de MOOC (edX, Canvas, WordPress) pour des programmes de recherche et de formation.',
  'E-learning instructional designer': 'Concepteur pédagogique en ligne',
  'Dissemination seminar in Morocco': 'Séminaire de diffusion au Maroc',

  /* ------------------------------------------------------------- courses */
  'Digitalization and AI in Education': 'Numérisation et IA en éducation',
  'Ph.D. in Education, ISE – UM6P': 'Doctorat en éducation, ISE – UM6P',
  'Spring 2024': 'Printemps 2024',
  'Introduces future educators and researchers to AI literacy, digital transformation, and the ethical use of learning technologies.':
    'Initie les futurs enseignants et chercheurs à la littératie en IA, à la transformation numérique et à l’usage éthique des technologies d’apprentissage.',
  'AI literacy and algorithmic thinking': 'Littératie en IA et pensée algorithmique',
  'Learning analytics and data-driven pedagogy': 'Analytique de l’apprentissage et pédagogie fondée sur les données',
  'Ethical, social and pedagogical implications of AI in education': 'Enjeux éthiques, sociaux et pédagogiques de l’IA en éducation',
  'Emerging technologies and educational policy': 'Technologies émergentes et politiques éducatives',
  'AI in Research': 'L’IA en recherche',
  'Ph.D. courses, UM6P': 'Cours doctoraux, UM6P',
  'Winter 2024': 'Hiver 2024',
  'Equips researchers and graduate students with computational and analytical tools for academic research.':
    'Donne aux chercheurs et aux étudiants des cycles supérieurs des outils computationnels et analytiques pour la recherche.',
  'AI-assisted research methods and data analysis': 'Méthodes de recherche et analyse de données assistées par l’IA',
  'Digital tools for literature mining and academic writing': 'Outils numériques pour la recension des écrits et la rédaction scientifique',
  'Ethics and integrity in AI-supported research': 'Éthique et intégrité dans la recherche appuyée par l’IA',
  'Open science and reproducibility': 'Science ouverte et reproductibilité',
  'Master Class — Principles of Online Pedagogy and Learner Support': 'Classe de maître — Principes de la pédagogie en ligne et de l’accompagnement des apprenants',
  'Instructional design, facilitation strategies, and the human dimensions of online learning.':
    'Conception pédagogique, stratégies d’animation et dimensions humaines de l’apprentissage en ligne.',
  'Modules on AI, Pedagogy, and Digital Education': 'Modules sur l’IA, la pédagogie et l’éducation numérique',
  'Sports and Academic Excellence Program, UM6P': 'Programme d’excellence sportive et académique, UM6P',
  'Co-designed interdisciplinary modules linking AI, data analytics, and educational technologies to sports performance, rehabilitation, and inclusion.':
    'Modules interdisciplinaires co-conçus reliant l’IA, l’analyse de données et les technologies éducatives à la performance sportive, à la réadaptation et à l’inclusion.',
  'Professional Development Program for Secondary School Teachers': 'Programme de développement professionnel pour les enseignants du secondaire',
  'ISE – UM6P & LYDEX Rabat': 'ISE – UM6P et LYDEX Rabat',
  'July 6–17, 2026': '6–17 juillet 2026',
  'A two-week programme designed, coordinated and delivered as project lead. Participants’ final projects focused on integrating digital technologies and AI into classroom practice.':
    'Un programme de deux semaines conçu, coordonné et animé en tant que chef de projet. Les projets finaux des participants portaient sur l’intégration du numérique et de l’IA dans la pratique en classe.',
  'Educational technology and AI in education': 'Technologies éducatives et IA en éducation',
  'Online course design': 'Conception de cours en ligne',
  'Digital resource development': 'Création de ressources numériques',
  'Technology-enhanced assessment': 'Évaluation appuyée par la technologie',
  'Master Class — Integrating AI into Teaching in Southern Morocco': 'Classe de maître — Intégrer l’IA à l’enseignement dans le Sud marocain',
  'Teacher training, Laâyoune · Smara · Boujdour · Tarfaya': 'Formation des enseignants, Laâyoune · Smara · Boujdour · Tarfaya',
  'Winter 2025': 'Hiver 2025',
  'Master class for teachers on integrating artificial intelligence into classroom teaching.':
    'Classe de maître pour les enseignants sur l’intégration de l’intelligence artificielle en classe.',
  'Computational Thinking, Inclusion, and AI': 'Pensée computationnelle, inclusion et IA',
  'Teacher training, Erasmus+ VOLCANIC': 'Formation des enseignants, Erasmus+ VOLCANIC',
  'Fall 2024': 'Automne 2024',
  'Computational thinking for inclusive, AI-supported teaching, building the digital competence of teachers in rural and underserved areas.':
    'La pensée computationnelle au service d’un enseignement inclusif appuyé par l’IA, pour développer la compétence numérique des enseignants en milieu rural et mal desservi.',
  'Decomposition, abstraction and algorithm design': 'Décomposition, abstraction et conception d’algorithmes',
  'Unplugged and digital activities': 'Activités débranchées et numériques',
  'Inclusive pedagogy and accessibility': 'Pédagogie inclusive et accessibilité',
  'AI tools for lesson planning and formative assessment': 'Outils d’IA pour la planification et l’évaluation formative',
  'Teacher Training and Continuing Education': 'Formation des enseignants et formation continue',
  'In-service and pre-service teachers': 'Enseignants en exercice et en formation initiale',
  'Short professional programmes for in-service and pre-service teachers, focusing on AI integration, digital inclusion, and hybrid pedagogy.':
    'Programmes professionnels courts pour enseignants en exercice et en formation initiale, axés sur l’intégration de l’IA, l’inclusion numérique et la pédagogie hybride.',
  'Educational Technologies and AI in Moroccan Schools': 'Technologies éducatives et IA dans les écoles marocaines',
  'Executive Master’s Program, UM6P': 'Executive Master, UM6P',
  'May–July 2023': 'Mai–juillet 2023',
  'Key concepts of educational technologies and artificial intelligence, with a focus on instructional design, digital tools, and AI-based personalisation in learning.':
    'Notions clés des technologies éducatives et de l’intelligence artificielle, avec un accent sur la conception pédagogique, les outils numériques et la personnalisation de l’apprentissage par l’IA.',
  'Instructional design and digital learning ecosystems': 'Conception pédagogique et écosystèmes d’apprentissage numériques',
  'Intelligent tutoring systems and adaptive learning': 'Systèmes tutoriels intelligents et apprentissage adaptatif',
  'Ethics of AI in education and data-driven decision-making': 'Éthique de l’IA en éducation et décision fondée sur les données',
  'Professional development': 'Développement professionnel',
  'Teacher training': 'Formation des enseignants',
  'Ph.D.': 'Doctorat',
  Master: 'Master',
  'LYDEX, Rabat': 'LYDEX, Rabat',

  /* ----------------------------------------------------------- positions */
  'Assistant Professor & Coordinator, Technopedagogy & AI Axis': 'Professeur assistant et coordonnateur, axe Technopédagogie et IA',
  'Institute of Education Sciences (ISE), UM6P': 'Institut des sciences de l’éducation (ISE), UM6P',
  'Ben Guerir, Morocco': 'Ben Guerir, Maroc',
  'Lecturer & Coordinator, Technopedagogy & AI Axis (formerly Digital & AI Axis)':
    'Chargé de cours et coordonnateur, axe Technopédagogie et IA (anciennement axe Numérique et IA)',
  'Replacement Teacher': 'Enseignant suppléant',
  'Centre de services scolaire des Patriotes schools': 'Écoles du Centre de services scolaire des Patriotes',
  'Instructor, Executive Master’s Program': 'Formateur, Executive Master',
  'UM6P — Educational Technologies and AI in Moroccan Schools': 'UM6P — Technologies éducatives et IA dans les écoles marocaines',
  'Co-researcher, GSDL project': 'Co-chercheur, projet GSDL',
  'UNESCO Chair in Global Smart Disruptive Learning, Université TÉLUQ': 'Chaire UNESCO Global Smart Disruptive Learning, Université TÉLUQ',
  'Oct 2022–2024': 'Oct. 2022–2024',
  'Co-researcher, CETAL-CEAN project': 'Co-chercheur, projet CETAL-CEAN',
  'Funded by the Quebec Ministry of Labour': 'Financé par le ministère du Travail du Québec',
  'Dec 2022–June 2023': 'Déc. 2022–juin 2023',
  'Research Assistant': 'Assistant de recherche',
  'Université TÉLUQ, Quebec universities network': 'Université TÉLUQ, réseau de l’Université du Québec',
  'E-learning Instructional Designer': 'Concepteur pédagogique en ligne',
  'Digital for Research Lab, UM6P': 'Digital for Research Lab, UM6P',
  'Teacher (on secondment)': 'Enseignant (en détachement)',
  'Marrakech, Morocco': 'Marrakech, Maroc',
  'Teacher of Languages & Mathematics': 'Enseignant de langues et de mathématiques',
  'Moroccan Ministry of Education': 'Ministère de l’Éducation nationale du Maroc',
  Morocco: 'Maroc',
  Researcher: 'Chercheur',
  'since 2021': 'depuis 2021',

  /* ----------------------------------------------------------- education */
  'Ph.D. in Education': 'Doctorat en éducation',
  'Development of an intelligent tutoring system: Interdisciplinary contributions and collaborative tools':
    'Développement d’un système tutoriel intelligent : contributions interdisciplinaires et outils collaboratifs',
  'Master’s in Didactics of Languages & Training Engineering': 'Master en didactique des langues et ingénierie de la formation',
  'Credential evaluation badge (WES)': 'Badge d’évaluation des diplômes (WES)',
  'Bachelor’s in French Language & Literature': 'Licence en langue et littérature françaises',
  'Teacher training diploma (Didactics, Mathematics)': 'Diplôme de formation des enseignants (didactique, mathématiques)',
  'Teacher Training Center': 'Centre de formation des enseignants',
  'Ouarzazate, Morocco': 'Ouarzazate, Maroc',
  'Baccalauréat in Experimental Sciences': 'Baccalauréat en sciences expérimentales',
  'Scientific Entrepreneurship Program': 'Programme d’entrepreneuriat scientifique',
  'Three-month training in scientific entrepreneurship, innovation and the commercialisation of university research.':
    'Formation de trois mois en entrepreneuriat scientifique, en innovation et en valorisation commerciale de la recherche universitaire.',
  'Extended Reality Technologies': 'Technologies de réalité étendue',
  'Educational use of virtual and augmented reality through the EON-XR platform.':
    'Usage pédagogique de la réalité virtuelle et augmentée avec la plateforme EON-XR.',
  'Pedagogical integration of digital technologies in schools.': 'Intégration pédagogique du numérique à l’école.',
  'Microprogram in remote learner support and online teaching at college and university levels.':
    'Microprogramme en encadrement à distance et en enseignement en ligne aux ordres collégial et universitaire.',
  Certificate: 'Certificat',
  'University Teaching Program': 'Programme de formation à l’enseignement universitaire',
  'Instructional design, inclusive education, student supervision, foundational pedagogy and learning assessment.':
    'Scénarisation pédagogique, éducation inclusive, encadrement des étudiants, pédagogie de base et évaluation des apprentissages.',
  'Transitioning to Online Teaching': 'Passer à l’enseignement en ligne',
  'Design and delivery of online education.': 'Conception et prestation de la formation en ligne.',
  'Eye Tracking for Educational and Psychological Research': 'L’oculométrie pour la recherche en éducation et en psychologie',
  'Introductory methodological training in eye-tracking applications.': 'Formation méthodologique d’introduction aux applications de l’oculométrie.',
  'Assessment through Application': 'L’évaluation par la mise en application',
  'Arizona State University & U.S. Embassy in Morocco': 'Arizona State University et ambassade des États-Unis au Maroc',
  'Professional development in applied assessment.': 'Développement professionnel en évaluation appliquée.',
  'Open Dialogues on Ethics & AI in Canada': 'Dialogues ouverts sur l’éthique et l’IA au Canada',
  'Technopedagogy training': 'Formation en technopédagogie',

  /* ------------------------------------------------------------- service */
  Member: 'Membre',
  '2026–present': '2026–aujourd’hui',
  'International advisory board of university leaders and education experts from the Gulf region, the Middle East and the United Kingdom, advising on education policy, curriculum, teacher development, digital transformation and responsible AI — with particular attention to education-system recovery in Syria.':
    'Conseil consultatif international de dirigeants universitaires et d’experts en éducation du Golfe, du Moyen-Orient et du Royaume-Uni, qui conseille sur les politiques éducatives, les programmes, le développement des enseignants, la transformation numérique et l’IA responsable — avec une attention particulière au relèvement du système éducatif en Syrie.',
  'UM6P Digital Learning and MOOC Transformation Committee': 'Comité de transformation numérique et MOOC de l’UM6P',
  'since June 2026': 'depuis juin 2026',
  'University-wide initiative (Human Capital, Academic Affairs and the Digital Learning Center) to turn academic courses into MOOCs and digital learning experiences.':
    'Initiative à l’échelle de l’université (Capital humain, Affaires académiques et Digital Learning Center) pour transformer les cours en MOOC et en expériences d’apprentissage numériques.',
  'Curriculum Committee, Institute of Education Sciences (ISE), UM6P': 'Comité des programmes, Institut des sciences de l’éducation (ISE), UM6P',
  'Panel member': 'Membre du panel',
  'Strategic discussions on academic excellence, digital transformation, educational innovation and AI at university level.':
    'Réflexions stratégiques sur l’excellence académique, la transformation numérique, l’innovation pédagogique et l’IA à l’échelle de l’université.',
  'Member, Practical and Academic Research Committee': 'Membre, Comité de recherche pratique et universitaire',
  'since 2023': 'depuis 2023',
  'Appointment letter': 'Lettre de nomination',
  'Member, Scientific Committee': 'Membre, comité scientifique',
  'May 4–6, 2027': '4–6 mai 2027',
  'Committee member': 'Membre du comité',
  'Sports Excellence Bachelor Program initiation, UM6P': 'Lancement de la licence Excellence sportive, UM6P',
  'Peer reviewer': 'Évaluateur',
  'Supervisor and session chair': 'Superviseur et président de séance',
  'February 2025': 'Février 2025',
  'Organizing committee member & co-chair': 'Membre du comité d’organisation et coprésident',
  'October 2–3 and 9, 2020': '2–3 et 9 octobre 2020',
  Moderator: 'Modérateur',
  'July 1, 2020': '1er juillet 2020',
  'Co-organizer': 'Co-organisateur',
  'April 15–17, 2019': '15–17 avril 2019',
  'Project lead': 'Chef de projet',
  'ISE-UM6P Professional Development Program for Secondary School Teachers, LYDEX Rabat':
    'Programme de développement professionnel ISE-UM6P pour les enseignants du secondaire, LYDEX Rabat',
  'Partnership development': 'Développement de partenariats',
  'Faculty-level international academic exchange with the Université de Sherbrooke':
    'Échange académique international entre facultés avec l’Université de Sherbrooke',
  Consultant: 'Consultant',
  'Co-founder': 'Cofondateur',
  'Co-supervisor': 'Co-superviseur',
  'ISE recruitment process': 'Processus de recrutement de l’ISE',

  /* -------------------------------------------------------------- awards */
  'Judge, QS Reimagine Education Awards 2026': 'Membre du jury, QS Reimagine Education Awards 2026',
  'International judge for the AI Innovation in Education category, evaluating academic and EdTech initiatives on innovation, educational impact, scalability and responsible AI integration.':
    'Membre du jury international de la catégorie AI Innovation in Education : évaluation d’initiatives universitaires et EdTech selon l’innovation, l’impact éducatif, le passage à l’échelle et l’intégration responsable de l’IA.',
  'Featured in UM6P STARS Newsletter, Ed. 22': 'Mis en avant dans l’infolettre UM6P STARS, éd. 22',
  'For the chapter “Personalizing assessments with generative AI: A case study from Moroccan teacher training at UM6P” (Springer).':
    'Pour le chapitre « Personalizing assessments with generative AI: A case study from Moroccan teacher training at UM6P » (Springer).',
  'UM6P STARS Awards — Medal': 'Prix UM6P STARS — médaille',
  'In recognition of scientific and institutional contributions.': 'En reconnaissance de contributions scientifiques et institutionnelles.',
  'Recognised in UM6P STARS, Ed. 20': 'Distingué dans UM6P STARS, éd. 20',
  'For the article “AIA-PCEK: A New Framework for Teaching with AI” and its contribution to the ethical and pedagogical integration of AI in education.':
    'Pour l’article « AIA-PCEK: A New Framework for Teaching with AI » et sa contribution à l’intégration éthique et pédagogique de l’IA en éducation.',
  'Featured in UM6P STARS, Ed. 19': 'Mis en avant dans UM6P STARS, éd. 19',
  'For the article “Generative AI to Bridge the Educational Divide”, downloaded 61 times within two months.':
    'Pour l’article « Generative AI to Bridge the Educational Divide », téléchargé 61 fois en deux mois.',
  'Interview, Science Pulse Magazine (UM6P)': 'Entrevue, magazine Science Pulse (UM6P)',
  'On the AIA-PCEK framework and human-centred, responsible approaches to AI in education.':
    'Sur le cadre AIA-PCEK et les approches responsables de l’IA en éducation, centrées sur l’humain.',

  /* ------------------------------------------------------------ students */
  'Generative AI for preservice teachers': 'L’IA générative pour les enseignants en formation initiale',
  'Human–AI interaction in learning environments': 'L’interaction humain–IA dans les environnements d’apprentissage',
  'Empowering educators through ethical and artificial intelligent systems': 'Outiller les éducateurs grâce à des systèmes d’intelligence artificielle éthiques',
  'Differential learning trajectories in AI-assisted educational environments: A learner-centred and technopedagogical analysis in Moroccan contexts':
    'Trajectoires d’apprentissage différenciées dans des environnements éducatifs assistés par l’IA : une analyse technopédagogique centrée sur l’apprenant en contexte marocain',
  'Ph.D. candidate, ISE – UM6P': 'Doctorant, ISE – UM6P',

  /* ---------------------------------------------------------- talk notes */
  'Selected panelist.': 'Panéliste sélectionné.',
  'Digital transformation, inclusivity and innovation in higher education.':
    'Transformation numérique, inclusivité et innovation dans l’enseignement supérieur.',
  'Facilitated the workshop and represented UM6P at the university’s stand.': 'Animation de l’atelier et représentation de l’UM6P au stand de l’université.',

  /* --------------------------------------------------------- link labels */
  Event: 'Événement',
  Video: 'Vidéo',
  'Video (from 49:40)': 'Vidéo (à partir de 49:40)',
  Slides: 'Diapositives',
  Post: 'Publication',
  Programme: 'Programme',
  Photo: 'Photo',
  Paper: 'Article',
  Abstract: 'Résumé',
  'Proceedings (p. 31)': 'Actes (p. 31)',
  Press: 'Presse',
  'Seminar report': 'Compte rendu du séminaire',
  'Free-access version (SharedIt)': 'Version en libre accès (SharedIt)',
};
