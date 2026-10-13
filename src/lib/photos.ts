// Event photos (sources in assets-src/events, optimised by `npm run images`).
// Dimensions are the 640 px rendition's, so every image reserves its space (no layout shift).
import type { Localized } from '../content/types';

export interface Photo {
  id: string;
  w: number;
  h: number;
  alt: Localized;
  caption: Localized;
}

export const photos = {
  scienceWeekSpeaking: {
    id: 'science-week-speaking',
    w: 640,
    h: 640,
    alt: {
      en: 'Aziz Mimoudi speaking into a microphone in front of a UM6P Science Week backdrop',
      fr: 'Aziz Mimoudi parle au micro devant le décor de la UM6P Science Week',
    },
    caption: { en: 'Keynote, UM6P Science Week', fr: 'Conférence, UM6P Science Week' },
  },
  scienceWeekPanelA: {
    id: 'science-week-panel-a',
    w: 640,
    h: 853,
    alt: {
      en: 'Aziz Mimoudi speaking on a panel at UM6P Science Week, a fellow panellist beside him',
      fr: 'Aziz Mimoudi intervient lors d’un panel de la UM6P Science Week, à côté d’une autre panéliste',
    },
    caption: { en: 'ISE symposium, Science Week', fr: 'Symposium de l’ISE, Science Week' },
  },
  scienceWeekPanelB: {
    id: 'science-week-panel-b',
    w: 640,
    h: 853,
    alt: {
      en: 'Three panellists at a table at UM6P Science Week, Aziz Mimoudi on the right',
      fr: 'Trois panélistes à une table lors de la UM6P Science Week, Aziz Mimoudi à droite',
    },
    caption: { en: 'Panel, UM6P Science Week', fr: 'Panel, UM6P Science Week' },
  },
  scienceWeekPanelC: {
    id: 'science-week-panel-c',
    w: 640,
    h: 853,
    alt: {
      en: 'Aziz Mimoudi answering a question on stage at UM6P Science Week',
      fr: 'Aziz Mimoudi répond à une question sur scène lors de la UM6P Science Week',
    },
    caption: { en: 'Discussion, Science Week', fr: 'Échanges, Science Week' },
  },
  teaching: {
    id: 'teaching-um6p',
    w: 640,
    h: 640,
    alt: {
      en: 'Aziz Mimoudi standing in front of a class in a UM6P classroom',
      fr: 'Aziz Mimoudi debout devant une classe dans une salle de l’UM6P',
    },
    caption: { en: 'Teaching at UM6P', fr: 'Enseignement à l’UM6P' },
  },
  teachingRoom: {
    id: 'teaching-um6p-room',
    w: 640,
    h: 295,
    alt: {
      en: 'Wide view of a UM6P training room: Aziz Mimoudi presenting, participants at long tables',
      fr: 'Vue d’ensemble d’une salle de formation de l’UM6P : Aziz Mimoudi présente, les participants à de longues tables',
    },
    caption: { en: 'Workshop, UM6P', fr: 'Atelier, UM6P' },
  },
  panel2019: {
    id: 'panel-2019',
    w: 640,
    h: 427,
    alt: {
      en: 'Aziz Mimoudi seated on stage with a tablet at a 2019 conference on instructional design and digital education',
      fr: 'Aziz Mimoudi assis sur scène avec une tablette lors d’un colloque de 2019 sur l’ingénierie pédagogique et le numérique éducatif',
    },
    caption: {
      en: 'Instructional design and digital education, 2019',
      fr: 'Ingénierie pédagogique et numérique éducatif, 2019',
    },
  },
  campus: {
    id: 'um6p-campus',
    w: 640,
    h: 640,
    alt: {
      en: 'The glass canopy and terracotta buildings of the UM6P campus in Ben Guerir',
      fr: 'La verrière et les bâtiments ocre du campus de l’UM6P à Ben Guerir',
    },
    caption: { en: 'UM6P campus, Ben Guerir', fr: 'Campus de l’UM6P, Ben Guerir' },
  },
  montreal: {
    id: 'montreal',
    w: 640,
    h: 640,
    alt: {
      en: 'Colourful Victorian row houses with autumn trees on a Montréal street',
      fr: 'Maisons victoriennes colorées et arbres d’automne dans une rue de Montréal',
    },
    caption: { en: 'Montréal, Québec', fr: 'Montréal, Québec' },
  },
} satisfies Record<string, Photo>;

export const photoSrc = (p: Photo, w: 640 | 1200 = 640) => `/img/events/${p.id}-${w}.webp`;
export const photoSrcSet = (p: Photo) => `${photoSrc(p, 640)} 640w, ${photoSrc(p, 1200)} 1200w`;
