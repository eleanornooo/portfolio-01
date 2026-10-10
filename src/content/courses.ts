import type { Course } from './types';

// Source: CV 2026, section 9, plus the Executive Master and Southern Morocco master class
// from the previous site. Add `materialsUrl` only when there is a real, public link.
export const courses: Course[] = [
  {
    id: 'edu-704',
    code: 'EDU 704',
    title: 'Digitalization and AI in Education',
    programme: 'Ph.D. in Education, ISE – UM6P',
    level: 'Ph.D.',
    years: ['2023–2024'],
    term: 'Spring 2024',
    credits: '4',
    description:
      'Introduces future educators and researchers to AI literacy, digital transformation, and the ethical use of learning technologies.',
    topics: [
      'AI literacy and algorithmic thinking',
      'Learning analytics and data-driven pedagogy',
      'Ethical, social and pedagogical implications of AI in education',
      'Emerging technologies and educational policy',
    ],
  },
  {
    id: 'caes-pd008',
    code: 'CAES-PD008',
    title: 'AI in Research',
    programme: 'Ph.D. courses, UM6P',
    level: 'Ph.D.',
    years: ['2023–2024'],
    term: 'Winter 2024',
    credits: '2',
    description:
      'Equips researchers and graduate students with computational and analytical tools for academic research.',
    topics: [
      'AI-assisted research methods and data analysis',
      'Digital tools for literature mining and academic writing',
      'Ethics and integrity in AI-supported research',
      'Open science and reproducibility',
    ],
  },
  {
    id: 'online-pedagogy',
    title: 'Master Class — Principles of Online Pedagogy and Learner Support',
    programme: 'ISE – UM6P',
    level: 'Professional development',
    years: [],
    description:
      'Instructional design, facilitation strategies, and the human dimensions of online learning.',
  },
  {
    id: 'sports-excellence',
    title: 'Modules on AI, Pedagogy, and Digital Education',
    programme: 'Sports and Academic Excellence Program, UM6P',
    level: 'Professional development',
    years: ['2025–2026'],
    description:
      'Co-designed interdisciplinary modules linking AI, data analytics, and educational technologies to sports performance, rehabilitation, and inclusion.',
  },
  {
    id: 'lydex-2026',
    title: 'Professional Development Program for Secondary School Teachers',
    programme: 'ISE – UM6P & LYDEX Rabat',
    level: 'Teacher training',
    years: ['2025–2026'],
    term: 'July 6–17, 2026',
    place: 'LYDEX, Rabat',
    description:
      'A two-week programme designed, coordinated and delivered as project lead. Participants’ final projects focused on integrating digital technologies and AI into classroom practice.',
    topics: [
      'Educational technology and AI in education',
      'Online course design',
      'Digital resource development',
      'Technology-enhanced assessment',
    ],
  },
  {
    id: 'southern-morocco',
    title: 'Master Class — Integrating AI into Teaching in Southern Morocco',
    programme: 'Teacher training, Laâyoune · Smara · Boujdour · Tarfaya',
    level: 'Teacher training',
    years: ['2024–2025'],
    term: 'Winter 2025',
    description: 'Master class for teachers on integrating artificial intelligence into classroom teaching.',
  },
  {
    id: 'volcanic-ct',
    title: 'Computational Thinking, Inclusion, and AI',
    programme: 'Teacher training, Erasmus+ VOLCANIC',
    level: 'Teacher training',
    years: ['2024–2025'],
    term: 'Fall 2024',
    description:
      'Computational thinking for inclusive, AI-supported teaching, building the digital competence of teachers in rural and underserved areas.',
    topics: [
      'Decomposition, abstraction and algorithm design',
      'Unplugged and digital activities',
      'Inclusive pedagogy and accessibility',
      'AI tools for lesson planning and formative assessment',
    ],
  },
  {
    id: 'teacher-training',
    title: 'Teacher Training and Continuing Education',
    programme: 'In-service and pre-service teachers',
    level: 'Teacher training',
    years: [],
    description:
      'Short professional programmes for in-service and pre-service teachers, focusing on AI integration, digital inclusion, and hybrid pedagogy.',
  },
  {
    id: 'executive-master',
    title: 'Educational Technologies and AI in Moroccan Schools',
    programme: 'Executive Master’s Program, UM6P',
    level: 'Master',
    years: ['2022–2023'],
    term: 'May–July 2023',
    credits: '3',
    description:
      'Key concepts of educational technologies and artificial intelligence, with a focus on instructional design, digital tools, and AI-based personalisation in learning.',
    topics: [
      'Instructional design and digital learning ecosystems',
      'Intelligent tutoring systems and adaptive learning',
      'Ethics of AI in education and data-driven decision-making',
    ],
  },
];

export const teachingStatement = {
  en: 'His teaching integrates experiential learning, digital pedagogy and artificial intelligence to foster learners’ self-efficacy, creativity and employability. Courses combine theoretical foundations with applied practice: students co-create digital tools, work on problem-based tasks, and develop critical, computational and ethical thinking, supported by multimodal, data-informed feedback.',
  fr: 'Son enseignement combine apprentissage expérientiel, pédagogie numérique et intelligence artificielle pour développer le sentiment d’efficacité personnelle, la créativité et l’employabilité des apprenants. Les cours articulent fondements théoriques et pratique appliquée : les étudiants co-créent des outils numériques, travaillent par problèmes et développent une pensée critique, computationnelle et éthique, avec une rétroaction multimodale fondée sur les données.',
};
