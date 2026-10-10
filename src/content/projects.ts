import type { Project, ResearchInterest } from './types';

// Funded projects: CV 2026, section 7 (Research Funding).
// Research collaborations and digital-learning work: carried over from the previous site.
export const projects: Project[] = [
  {
    id: 'volcanic',
    title: 'Erasmus+ VOLCANIC',
    summary:
      'European capacity-building project on computational thinking, inclusion and artificial intelligence in teacher education.',
    role: 'Co-coordinator for Morocco',
    coordinator: 'International consortium',
    funder: 'European Education and Culture Executive Agency (EACEA)',
    budget: 'EUR 94,066',
    period: '2024–2027',
    status: 'Active',
    group: 'funded',
    url: 'https://volcanic.education/blog/identifying-our-target-populations-specific-needs-moroccan/',
    links: [
      {
        label: 'Dissemination seminar in Morocco',
        url: 'https://volcanic.education/blog/advancing-digital-equity-volcanic-project-hosts-dissemination-seminar-in-morocco/',
      },
    ],
  },
  {
    id: 'sustaineur',
    title: 'Sustaineur',
    summary:
      'An AI-assisted platform that helps learners, educators and entrepreneurs design sustainable business models through systems thinking, causal-loop mapping and data-driven decision tools, integrating learning analytics and systems dynamics within a pedagogical framework.',
    role: 'Co-researcher and co-coordinator',
    coordinator: 'UM6P / Africa Business School',
    funder: 'UM6P and Fondation OCP',
    budget: 'MAD 2.6 million',
    period: '2024–2027',
    status: 'Active',
    group: 'funded',
    url: 'https://sustaineur.co/',
  },
  {
    id: 'inclusive-at',
    title:
      'Inclusive Assistive Technology for Access to Information by Deaf and Deafblind People in Emergency Situations and at Major Events',
    short: 'Inclusive assistive technology for deaf and deafblind people',
    summary: 'Interinstitutional research proposal on assistive technology for access to information.',
    role: 'Co-researcher',
    coordinator: 'Interinstitutional consortium involving UM6P and ENSMR',
    funder: 'PNARDI 2025–2028 — MESRSI, Fondation OCP, CNRST and UM6P',
    period: '2026–2028',
    status: 'Pending',
    group: 'funded',
  },
  {
    id: 'core-curriculum',
    title: 'Digitalization of Core Curriculum Modules',
    summary: 'Partnership proposal to digitalize core curriculum modules.',
    role: 'Co-coordinator with the UM6P Digital Learning Center',
    coordinator: 'Partnership proposal',
    funder: 'Ministry of National Education, Fondation OCP and UM6P',
    period: '2025–2027',
    status: 'Pending',
    group: 'funded',
  },
  {
    id: 'sil',
    title: 'SIL — distance learning model for rural primary schools',
    short: 'SIL',
    summary:
      'Co-design of a distance learning model adapted to primary schools in rural Morocco, supported by the Fondation OCP.',
    role: 'Co-coordinator',
    coordinator: 'FOCP-supported project',
    funder: 'Fondation OCP (FOCP)',
    budget: 'MAD 500,000',
    period: '2021 (one year)',
    status: 'Completed',
    group: 'funded',
    url: 'https://doi.org/10.29062/edu.v7i3.534',
  },
  {
    id: 'its',
    title: 'Development of an intelligent tutoring system',
    summary:
      'Smart learning environments project (SIGC) on AI-based tutoring, with Prof. Belkacem Chikhaoui, Department of Artificial Intelligence, Université TÉLUQ.',
    role: 'Participant',
    coordinator: 'Université TÉLUQ',
    period: '2022–2024',
    status: 'Completed',
    group: 'research',
  },
  {
    id: 'gsdl',
    title: 'GSDL — UNESCO Chair in Global Smart Disruptive Learning',
    summary: 'Research on AI-driven personalised learning with the UNESCO Chair held at Université TÉLUQ.',
    role: 'Co-researcher',
    coordinator: 'Université TÉLUQ',
    period: '2022–2024',
    status: 'Completed',
    group: 'research',
    url: 'https://hal.science/hal-04223251',
  },
  {
    id: 'comodal',
    title: 'Comodal (HyFlex) teaching in francophone Canada',
    summary:
      'Research and guide on comodal teaching — combining presence and distance — with Prof. Serge Gérin-Lajoie, published by REFAD.',
    role: 'Research assistant',
    coordinator: 'Université TÉLUQ',
    period: '2022–2024',
    status: 'Completed',
    group: 'research',
    url: 'https://r-libre.teluq.ca/2709/',
  },
  {
    id: 'cetal',
    title: 'CETAL-CEAN — web design for diverse abilities in the workplace',
    summary:
      'Website accessibility and pedagogical inclusion project that produced the inclusive design teaching guide (SAVIE, CTREQ).',
    role: 'Co-researcher',
    funder: 'Quebec Ministry of Labour',
    period: '2022–2023',
    status: 'Completed',
    group: 'research',
    url: 'https://www.guidepedagogique.ca/en-savoir-plus',
  },
  {
    id: 'd4r',
    title: 'Digital for Research Lab, UM6P',
    summary:
      'E-learning instructional design and MOOC development (edX, Canvas, WordPress) for research and training programmes.',
    role: 'E-learning instructional designer',
    period: '2019–2020',
    status: 'Completed',
    group: 'digital',
    url: 'https://youtu.be/r2MhibAv4bc',
  },
];

export const researchInterests: ResearchInterest[] = [
  {
    title: {
      en: 'Responsible AI in teacher education',
      fr: 'IA responsable en formation des enseignants',
    },
    body: {
      en: 'How teachers can integrate AI into planning, teaching and assessment without losing sight of pedagogy and ethics. This line of work produced AIA-PCEK, a framework for teaching with AI, first published in Cogent Education and extended in Quality & Quantity.',
      fr: 'Comment les enseignants peuvent intégrer l’IA à la planification, à l’enseignement et à l’évaluation sans perdre de vue la pédagogie et l’éthique. Ce travail a donné AIA-PCEK, un cadre pour enseigner avec l’IA, publié dans Cogent Education puis développé dans Quality & Quantity.',
    },
    refs: ['mimoudi-bouabid-2026', 'mimoudi-kouider-2025', 'crc-2026'],
  },
  {
    title: {
      en: 'Generative AI, personalisation and the educational divide',
      fr: 'IA générative, personnalisation et fracture éducative',
    },
    body: {
      en: 'Whether generative AI can personalise learning and assessment in ways that reduce, rather than widen, inequalities between learners and regions.',
      fr: 'Dans quelle mesure l’IA générative peut personnaliser l’apprentissage et l’évaluation de façon à réduire, plutôt qu’à creuser, les inégalités entre apprenants et entre territoires.',
    },
    refs: ['mimoudi-2025-ssho', 'springer-2026', 'mimoudi-2024-icair'],
  },
  {
    title: {
      en: 'Intelligent tutoring systems and distance learning',
      fr: 'Systèmes tutoriels intelligents et formation à distance',
    },
    body: {
      en: 'The design of AI-based tutoring for distance education, and the interdisciplinary collaboration that designing such systems requires — the subject of his doctoral thesis.',
      fr: 'La conception de tutorat fondé sur l’IA pour la formation à distance, et la collaboration interdisciplinaire qu’exige leur conception — l’objet de sa thèse de doctorat.',
    },
    refs: ['thesis-2026', 'mimoudi-meyer-2022', 'gerin-lajoie-2022'],
  },
  {
    title: {
      en: 'Computational thinking, inclusion and digital equity',
      fr: 'Pensée computationnelle, inclusion et équité numérique',
    },
    body: {
      en: 'Computational thinking and AI in teacher education (Erasmus+ VOLCANIC), distance learning for rural primary schools in Morocco, and inclusive design for learners with diverse abilities.',
      fr: 'La pensée computationnelle et l’IA en formation des enseignants (Erasmus+ VOLCANIC), la formation à distance pour les écoles primaires rurales au Maroc et le design inclusif pour des apprenants aux capacités diverses.',
    },
    refs: ['alladatin-2024', 'sauve-2024', 'hotte-2023'],
  },
  {
    title: {
      en: 'Employability, entrepreneurship and sustainability competencies',
      fr: 'Employabilité, entrepreneuriat et compétences en durabilité',
    },
    body: {
      en: 'Technology-enhanced programmes that build entrepreneurship, employability and future-ready skills — including the Sustaineur platform and research on AI chatbots and sustainability learning in higher education.',
      fr: 'Des programmes appuyés par la technologie qui développent l’entrepreneuriat, l’employabilité et les compétences d’avenir — dont la plateforme Sustaineur et des recherches sur les agents conversationnels et l’apprentissage de la durabilité dans l’enseignement supérieur.',
    },
    refs: ['nunez-in-press'],
  },
];

export const methods: { en: string; fr: string }[] = [
  { en: 'Mixed methods', fr: 'Méthodes mixtes' },
  { en: 'Competency frameworks', fr: 'Référentiels de compétences' },
  { en: 'Survey-based evaluation', fr: 'Évaluation par questionnaire' },
  { en: 'Learning analytics', fr: 'Analytique de l’apprentissage' },
  { en: 'Systems dynamics and causal-loop mapping', fr: 'Dynamique des systèmes et boucles causales' },
];
