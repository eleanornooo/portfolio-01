import type { Certification, Degree } from './types';

// Source: CV 2026, section 1.3.
export const degrees: Degree[] = [
  {
    id: 'phd',
    degree: 'Ph.D. in Education',
    school: 'Université de Sherbrooke',
    place: 'Canada',
    year: '2026',
    thesis: {
      title:
        'Analyse des dynamiques de collaboration interdisciplinaire dans la conception d’un système tutoriel intelligent',
      translation: 'Development of an intelligent tutoring system: Interdisciplinary contributions and collaborative tools',
      doi: '10.71892/11143/1932',
    },
    logo: 'usherbrooke',
  },
  {
    id: 'master',
    degree: 'Master’s in Didactics of Languages & Training Engineering',
    school: 'Université Jean Monnet de Saint-Étienne',
    place: 'France',
    year: '2017',
    logo: 'ujm',
    links: [
      {
        label: 'Credential evaluation badge (WES)',
        url: 'https://badges.wes.org/Evidence?i=c07f113b-718a-4b95-8fe0-ecc6f6313461&type=ca',
      },
    ],
  },
  {
    id: 'bachelor',
    degree: 'Bachelor’s in French Language & Literature',
    school: 'Université Cadi Ayyad',
    place: 'Marrakech, Morocco',
    year: '2005',
    logo: 'cadi-ayyad',
  },
  {
    id: 'crf',
    degree: 'Teacher training diploma (Didactics, Mathematics)',
    school: 'Teacher Training Center',
    place: 'Ouarzazate, Morocco',
    year: '1999',
    minor: true,
  },
  {
    id: 'bac',
    degree: 'Baccalauréat in Experimental Sciences',
    school: 'Morocco',
    year: '1996',
    minor: true,
  },
];

// Source: CV 2026 "Selected Professional Development" + two items from the previous site
// (AIcan, Stanford GSE) that the CV does not list.
export const certifications: Certification[] = [
  {
    year: '2022',
    title: 'Scientific Entrepreneurship Program',
    provider: 'Fonds de recherche du Québec',
    detail: 'Three-month training in scientific entrepreneurship, innovation and the commercialisation of university research.',
  },
  {
    year: '2021',
    title: 'Extended Reality Technologies',
    provider: 'EON Reality',
    detail: 'Educational use of virtual and augmented reality through the EON-XR platform.',
  },
  {
    year: '2020',
    title: 'CERTICE Scol',
    provider: 'CY Cergy Paris Université, Agence universitaire de la Francophonie & Agence française de développement',
    detail: 'Pedagogical integration of digital technologies in schools.',
  },
  {
    year: '2020',
    title: 'J’enseigne à distance',
    provider: 'Université TÉLUQ',
    detail: 'Microprogram in remote learner support and online teaching at college and university levels.',
    links: [
      {
        label: 'Certificate',
        url: 'https://um6p-my.sharepoint.com/:b:/g/personal/aziz_mimoudi_um6p_ma/EQd4ijIXT7NGnp1eSn4anukB9PrsmTkIX6UZJay2FTbd7Q?e=sfOLbe',
        restricted: true,
      },
    ],
  },
  {
    year: '2020',
    title: 'University Teaching Program',
    provider: 'Université du Québec à Montréal',
    detail: 'Instructional design, inclusive education, student supervision, foundational pedagogy and learning assessment.',
    modules: [
      {
        title: 'Scénarisation pédagogique',
        link: {
          label: 'Certificate',
          url: 'https://um6p-my.sharepoint.com/:b:/g/personal/aziz_mimoudi_um6p_ma/Ec3Ci0sCHC1AvPkqaSQ8VOkB2NXhJvX2IsjNKEa0G0fyiQ?e=r0kxby',
          restricted: true,
        },
      },
      {
        title: 'Éducation inclusive',
        link: {
          label: 'Certificate',
          url: 'https://um6p-my.sharepoint.com/:b:/g/personal/aziz_mimoudi_um6p_ma/EV9_jncQk4xOmF9_FERBRLUBDpETotNPnlLaGuWQzukipA?e=TMYpDl',
          restricted: true,
        },
      },
      {
        title: 'Encadrement des étudiants',
        link: {
          label: 'Certificate',
          url: 'https://um6p-my.sharepoint.com/:b:/g/personal/aziz_mimoudi_um6p_ma/Efm8VgtNJYBBmLIlklRzULgBgCJyZcgdPoMAnvGK3WIlvQ?e=VF7cfJ',
          restricted: true,
        },
      },
      { title: 'Concepts et compétences de base en pédagogie' },
      {
        title: 'Évaluation des apprentissages',
        link: {
          label: 'Certificate',
          url: 'https://um6p-my.sharepoint.com/:b:/g/personal/aziz_mimoudi_um6p_ma/EShie9S89nxFspk1uqHGl3oBB3e7X1kEM3m14Uh8B55F5A?e=jCTGCe',
          restricted: true,
        },
      },
    ],
  },
  {
    year: '2020',
    title: 'Transitioning to Online Teaching',
    provider: 'University of Texas at Arlington (edX)',
    detail: 'Design and delivery of online education.',
    links: [
      {
        label: 'Certificate',
        url: 'https://um6p-my.sharepoint.com/:b:/g/personal/aziz_mimoudi_um6p_ma/ESiXppJ_-iVHhJ-NAjk1qLMBm00XQ0ziNmMLddWb9ZIzfQ?e=2Zj8iR',
        restricted: true,
      },
    ],
  },
  {
    year: '2020',
    title: 'Eye Tracking for Educational and Psychological Research',
    provider: 'Tobii Pro France',
    detail: 'Introductory methodological training in eye-tracking applications.',
  },
  {
    year: '2020',
    title: 'Assessment through Application',
    provider: 'Arizona State University & U.S. Embassy in Morocco',
    detail: 'Professional development in applied assessment.',
  },
  {
    title: 'Open Dialogues on Ethics & AI in Canada',
    provider: 'AIcan',
  },
  {
    title: 'Technopedagogy training',
    provider: 'Stanford Graduate School of Education',
  },
];
