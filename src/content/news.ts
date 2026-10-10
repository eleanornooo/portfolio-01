import type { NewsItem } from './types';

// Highlights shown on the home page, newest first.
// Items whose date is still in the future get an "Upcoming" tag automatically,
// which disappears once the date (or endDate) has passed.
export const news: NewsItem[] = [
  {
    id: 'unu-macau',
    date: '2026-11-25',
    endDate: '2026-11-26',
    kind: 'Talk',
    title: {
      en: 'Panelist at the UNU Macau AI Conference 2026',
      fr: 'Panéliste à la UNU Macau AI Conference 2026',
    },
    detail: {
      en: 'United Nations University, Macau SAR — panel “AI & Education: End of an Era of the Old Education System?”',
      fr: 'Université des Nations unies, Macao — panel « AI & Education: End of an Era of the Old Education System? »',
    },
  },
  {
    id: 'lydex',
    date: '2026-07-06',
    endDate: '2026-07-17',
    kind: 'Teaching',
    title: {
      en: 'Two-week professional development programme for secondary teachers, LYDEX Rabat',
      fr: 'Programme de développement professionnel de deux semaines pour enseignants du secondaire, LYDEX Rabat',
    },
    detail: { en: 'Project lead for ISE – UM6P.', fr: 'Chef de projet pour l’ISE – UM6P.' },
  },
  {
    id: 'innovenssup',
    date: '2026-06',
    kind: 'Talk',
    title: { en: 'Keynote at Innov’EnsSup’26, Rabat', fr: 'Conférence d’ouverture à Innov’EnsSup’26, Rabat' },
    detail: {
      en: 'Pedagogical innovation in higher education in the age of AI — École Nationale Supérieure des Mines de Rabat.',
      fr: 'Innovation pédagogique dans l’enseignement supérieur à l’ère de l’IA — École Nationale Supérieure des Mines de Rabat.',
    },
    url: 'https://amtic.org.ma/innovenssup/fr/index.html',
  },
  {
    id: 'bouregreg',
    date: '2026-04',
    kind: 'Talk',
    title: {
      en: 'Keynote, international colloquium on education and AI, Rabat',
      fr: 'Conférence d’ouverture, colloque international Éducation et IA, Rabat',
    },
    detail: {
      en: 'Technological innovation with social responsibility — Palais des congrès Bouregreg.',
      fr: 'Innovation technologique avec responsabilité sociale — Palais des congrès Bouregreg.',
    },
  },
  {
    id: 'phd',
    date: '2026',
    kind: 'Milestone',
    title: { en: 'Ph.D. in Education completed, Université de Sherbrooke', fr: 'Doctorat en éducation obtenu, Université de Sherbrooke' },
    detail: {
      en: 'Thesis on interdisciplinary collaboration in the design of an intelligent tutoring system.',
      fr: 'Thèse sur la collaboration interdisciplinaire dans la conception d’un système tutoriel intelligent.',
    },
    url: 'https://doi.org/10.71892/11143/1932',
  },
  {
    id: 'assistant-professor',
    date: '2026',
    kind: 'Milestone',
    title: { en: 'Appointed Assistant Professor, ISE – UM6P', fr: 'Nommé professeur assistant, ISE – UM6P' },
    detail: { en: 'Coordinator of the Technopedagogy & AI Axis.', fr: 'Coordonnateur de l’axe Technopédagogie et IA.' },
  },
  {
    id: 'qs-judge',
    date: '2026',
    kind: 'Award',
    title: { en: 'Judge, QS Reimagine Education Awards 2026', fr: 'Membre du jury, QS Reimagine Education Awards 2026' },
    detail: { en: 'AI Innovation in Education category.', fr: 'Catégorie AI Innovation in Education.' },
    url: 'https://qsrea.evessiocloud.com/Reimagine2026/en/node/judgeprofile-aziz-mimoudi',
  },
  {
    id: 'saaba',
    date: '2026',
    kind: 'Service',
    title: { en: 'Joined the Saaba Education Advisory Board', fr: 'Membre du Saaba Education Advisory Board' },
  },
  {
    id: 'qq-article',
    date: '2026',
    kind: 'Publication',
    title: {
      en: 'AIA-PCEK framework published in Quality & Quantity (Springer)',
      fr: 'Le cadre AIA-PCEK publié dans Quality & Quantity (Springer)',
    },
    url: 'https://doi.org/10.1007/s11135-026-02902-y',
  },
  {
    id: 'chapters-2026',
    date: '2026',
    kind: 'Publication',
    title: {
      en: 'Two book chapters on generative AI, with Springer and CRC Press',
      fr: 'Deux chapitres d’ouvrages sur l’IA générative, chez Springer et CRC Press',
    },
  },
  {
    id: 'stars-medal',
    date: '2025',
    kind: 'Award',
    title: { en: 'UM6P STARS Awards — Medal', fr: 'UM6P STARS Awards — Médaille' },
  },
];
