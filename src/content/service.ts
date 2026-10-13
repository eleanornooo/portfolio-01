import type { ServiceGroup } from './types';

// Source: CV 2026, sections 2 (editorial) and 8 (service). Duplicates merged.
// Never add reviewer IDs or private contact details here.
export const service: ServiceGroup[] = [
  {
    id: 'boards',
    title: { en: 'Boards and committees', fr: 'Conseils et comités' },
    items: [
      {
        role: 'Member',
        body: 'Saaba Education Advisory Board',
        period: '2026–present',
        detail:
          'International advisory board of university leaders and education experts from the Gulf region, the Middle East and the United Kingdom, advising on education policy, curriculum, teacher development, digital transformation and responsible AI — with particular attention to education-system recovery in Syria.',
        links: [{ label: 'Saaba', url: 'http://saabacommunications.com/' }],
      },
      {
        role: 'Member',
        body: 'UM6P Digital Learning and MOOC Transformation Committee',
        period: 'since June 2026',
        detail:
          'University-wide initiative (Human Capital, Academic Affairs and the Digital Learning Center) to turn academic courses into MOOCs and digital learning experiences.',
      },
      {
        role: 'Member',
        body: 'Curriculum Committee, Institute of Education Sciences (ISE), UM6P',
        period: 'since June 2026',
      },
      {
        role: 'Panel member',
        body: 'Board for Academic Strategy and Excellence (BASE), UM6P',
        detail: 'Strategic discussions on academic excellence, digital transformation, educational innovation and AI at university level.',
      },
      {
        role: 'Member, Practical and Academic Research Committee',
        body: 'CERIC — Advancing Career Development in Canada',
        period: 'since 2023',
        links: [
          { label: 'CERIC committees', url: 'https://ceric.ca/committees/' },
          {
            label: 'Appointment letter',
            url: 'https://um6p-my.sharepoint.com/:b:/g/personal/aziz_mimoudi_um6p_ma/EcRN2nLQAtVAkzhDWeicT64BHb3tJRlfz9LAg_4GECT0fA?e=bZPkUu',
            restricted: true,
          },
        ],
      },
      {
        role: 'Member, Scientific Committee',
        body: '3rd International Conference on Sciences and Techniques for Renewable Energy and the Environment (STR2E 2027), Faculty of Sciences and Techniques, Al Hoceima',
        period: 'May 4–6, 2027',
        links: [{ label: 'STR2E', url: 'https://str2e.wordpress.com/' }],
      },
      {
        role: 'Committee member',
        body: 'Sports Excellence Bachelor Program initiation, UM6P',
        period: '2025',
      },
    ],
  },
  {
    id: 'editorial',
    title: { en: 'Peer review', fr: 'Évaluation par les pairs' },
    items: [
      { role: 'Peer reviewer', body: 'Social Sciences & Humanities Open (SSHO), Elsevier', period: '2026' },
      { role: 'Peer reviewer', body: 'Oklahoma International Publishing (OkIP), USA', period: '2025' },
      {
        role: 'Peer reviewer',
        body: 'Revue internationale des technologies en pédagogie universitaire (RITPU), Canada',
        period: '2024',
      },
    ],
  },
  {
    id: 'conferences',
    title: { en: 'Conference organisation', fr: 'Organisation de colloques' },
    items: [
      {
        role: 'Supervisor and session chair',
        body: 'Symposium of the Institute of Education Sciences (ISE), Science Week at UM6P, Ben Guerir',
        period: 'February 2025',
      },
      {
        role: 'Organizing committee member & co-chair',
        body: 'International Conference on Education in Africa: Current Challenges and Future Perspectives, Al Akhawayn University & UM6P (virtual)',
        period: 'October 2–3 and 9, 2020',
      },
      {
        role: 'Moderator',
        body: '“Serious Gaming and Remote Simulation” workshop, Erasmus+ Morocco National Office, with Prof. Mourad Abed & Prof. Jérôme Graindorge (Université Polytechnique Hauts-de-France)',
        period: 'July 1, 2020',
        links: [{ label: 'Programme', url: 'https://erasmusplus.ma/erasmus-uploads/2020/07/Affiche-atelier-3-1-2048x1152.png' }],
      },
      {
        role: 'Co-organizer',
        body: 'Conference on Educational Engineering and Digital Education, Dar El Phosphate, Marrakech — UM6P (Digital for Research Center), EPFL, RESCIF, ENSPY and ESP',
        period: 'April 15–17, 2019',
      },
    ],
  },
  {
    id: 'institutional',
    title: { en: 'Institutional service', fr: 'Engagement institutionnel' },
    items: [
      {
        role: 'Project lead',
        body: 'ISE-UM6P Professional Development Program for Secondary School Teachers, LYDEX Rabat',
        period: 'July 6–17, 2026',
      },
      {
        role: 'Partnership development',
        body: 'Faculty-level international academic exchange with the Université de Sherbrooke',
        period: '2023–2025',
      },
      {
        role: 'Consultant',
        body: 'Moroccan Innovation Hub / Digital University',
        period: '2021',
      },
      { role: 'Co-founder', body: 'Institute of Education Sciences (ISE), UM6P', period: '2020' },
      { role: 'Co-supervisor', body: 'ISE recruitment process', period: '2020' },
    ],
  },
];
