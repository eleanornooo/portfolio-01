// "In the field": real event and teaching photos for the About page gallery, each with a
// caption (event, place, year). Places and years come from the site's own data: Science Week
// is the ISE symposium of February 2025 in Ben Guerir (content/talks.ts, content/service.ts);
// the 2019 panel's year is on its banner. Where the data gives no place or year, none is shown.
// Not used here: the Home hero and About cut-outs, the campus and Montréal street photos.
import type { Localized } from '../content/types';
import { photos, type Photo } from './photos';

export interface FieldPhoto {
  photo: Photo;
  event: Localized;
  place?: string;
  year?: string;
}

const scienceWeek = { place: 'Ben Guerir', year: '2025' };

export const fieldPhotos: FieldPhoto[] = [
  {
    photo: photos.scienceWeekSpeaking,
    event: { en: 'Keynote, ISE symposium, UM6P Science Week', fr: 'Conférence, symposium de l’ISE, UM6P Science Week' },
    ...scienceWeek,
  },
  {
    photo: photos.scienceWeekPanelA,
    event: { en: 'Panel, ISE symposium, UM6P Science Week', fr: 'Panel, symposium de l’ISE, UM6P Science Week' },
    ...scienceWeek,
  },
  {
    photo: photos.teaching,
    event: { en: 'Teaching, UM6P', fr: 'Enseignement, UM6P' },
  },
  {
    photo: photos.scienceWeekPanelB,
    event: { en: 'Panel discussion, UM6P Science Week', fr: 'Table ronde, UM6P Science Week' },
    ...scienceWeek,
  },
  {
    photo: photos.teachingRoom,
    event: { en: 'Workshop, UM6P', fr: 'Atelier, UM6P' },
  },
  {
    photo: photos.panel2019,
    event: {
      en: 'Conference on instructional design and digital education',
      fr: 'Colloque sur l’ingénierie pédagogique et le numérique éducatif',
    },
    year: '2019',
  },
  {
    photo: photos.scienceWeekPanelC,
    event: { en: 'Questions from the floor, UM6P Science Week', fr: 'Questions du public, UM6P Science Week' },
    ...scienceWeek,
  },
];

/** "Keynote, ISE symposium, UM6P Science Week · Ben Guerir · 2025" (only the parts we know). */
export const captionOf = (p: FieldPhoto, pick: (l: Localized) => string) =>
  [pick(p.event), p.place, p.year].filter(Boolean).join(' · ');

/**
 * Masonry columns (desktop), balanced by hand from the photos' shapes: square, tall,
 * landscape and wide. Indexes into fieldPhotos; on phones the same order flows into two columns.
 */
export const fieldColumns: number[][] = [
  [0, 6],
  [1, 4, 5],
  [2, 3],
];
