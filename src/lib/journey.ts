// "Journey 1999 → 2026": career milestones, assembled from the CV data files
// (degrees, positions, service) so nothing is typed twice.
import { degrees } from '../content/education';
import { positions } from '../content/experience';
import { service } from '../content/service';
import type { Localized } from '../content/types';
import { photos, type Photo } from './photos';

export interface Milestone {
  id: string;
  year: string;
  period?: string;
  chapter: Localized;
  title: string;
  org: string;
  place?: string;
  photo?: Photo;
}

const degree = (id: string) => degrees.find((d) => d.id === id)!;
const position = (id: string) => positions.find((p) => p.id === id)!;
const cofounder = service.flatMap((g) => g.items).find((s) => s.role === 'Co-founder')!;

export function milestones(): Milestone[] {
  const crf = degree('crf');
  const men = position('men');
  const aefe = position('aefe');
  const master = degree('master');
  const d4r = position('d4r');
  const phd = degree('phd');
  const teluq = position('teluq-ra');
  const ap = position('ap-um6p');
  return [
    {
      id: 'crf',
      year: crf.year,
      chapter: { en: 'Training to teach', fr: 'Se former à enseigner' },
      title: crf.degree,
      org: crf.school,
      place: crf.place,
    },
    {
      id: 'men',
      year: men.start,
      period: `${men.start}–${men.end}`,
      chapter: { en: 'Twenty years in the classroom', fr: 'Vingt ans en classe' },
      title: men.role,
      org: men.org,
      place: men.place,
    },
    {
      id: 'aefe',
      year: aefe.start,
      period: `${aefe.start}–${aefe.end}`,
      chapter: { en: 'An international school', fr: 'Un établissement international' },
      title: aefe.role,
      org: aefe.org,
      place: aefe.place,
    },
    {
      id: 'master',
      year: master.year,
      chapter: { en: 'A master’s in France', fr: 'Un master en France' },
      title: master.degree,
      org: master.school,
      place: master.place,
    },
    {
      id: 'd4r',
      year: d4r.start,
      period: `${d4r.start}–${d4r.end}`,
      chapter: { en: 'Designing digital learning', fr: 'Concevoir l’apprentissage numérique' },
      title: d4r.role,
      org: d4r.org,
      place: d4r.place,
      photo: photos.panel2019,
    },
    {
      id: 'ise',
      year: cofounder.period ?? '2020',
      chapter: { en: 'Building an institute', fr: 'Fonder un institut' },
      title: cofounder.role,
      org: cofounder.body,
      place: d4r.place,
      photo: photos.campus,
    },
    {
      id: 'phd',
      year: teluq.start,
      period: `${teluq.start}–${phd.year}`,
      chapter: { en: 'A doctorate in Canada', fr: 'Un doctorat au Canada' },
      title: phd.degree,
      org: `${phd.school} · ${teluq.org.split(',')[0]}`,
      place: 'Québec, Canada',
      photo: photos.montreal,
    },
    {
      id: 'ap',
      year: ap.start,
      chapter: { en: 'Professor of AI in education', fr: 'Professeur en IA et éducation' },
      title: ap.role,
      org: ap.org,
      place: ap.place,
      photo: photos.scienceWeekPanelB,
    },
  ];
}
