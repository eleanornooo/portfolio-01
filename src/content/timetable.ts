import type { Semester } from './types';

// Weekly timetable. Times are Morocco time (Africa/Casablanca), 24-hour "HH:MM".
//
// ⚠ SAMPLE DATA — the days, times and rooms below are placeholders using real course names.
//   Replace them with Aziz's actual schedule and remove `sample: true`.
//
// Alternatively set VITE_TIMETABLE_SHEET_CSV to a Google Sheet published as CSV
// (see README → "Timetable from a Google Sheet"); this file is then only the fallback.
export const semesters: Semester[] = [
  {
    id: 'fall-2026',
    name: 'Fall 2026',
    start: '2026-09-14',
    end: '2027-01-15',
    sample: true,
    sessions: [
      {
        day: 'Mon',
        start: '10:00',
        end: '12:00',
        courseCode: 'EDU 704',
        title: 'Digitalization and AI in Education',
        type: 'Lecture',
        room: 'ISE, room to be confirmed',
        programme: 'Ph.D. in Education',
        mode: 'On campus',
      },
      {
        day: 'Tue',
        start: '16:00',
        end: '17:30',
        courseCode: 'OH',
        title: 'Office hours',
        type: 'Office hours',
        programme: 'All students',
        mode: 'Online',
      },
      {
        day: 'Wed',
        start: '14:00',
        end: '16:00',
        courseCode: 'CAES-PD008',
        title: 'AI in Research',
        type: 'Seminar',
        room: 'ISE, room to be confirmed',
        programme: 'Ph.D. courses',
        mode: 'On campus',
      },
      {
        day: 'Thu',
        start: '09:30',
        end: '11:00',
        courseCode: 'PHD-SUP',
        title: 'Ph.D. supervision meetings',
        type: 'Supervision',
        room: 'ISE office',
        programme: 'Ph.D. in Education',
        mode: 'On campus',
      },
      {
        day: 'Fri',
        start: '14:00',
        end: '15:30',
        courseCode: 'MC-OP',
        title: 'Master Class — Principles of Online Pedagogy',
        type: 'Seminar',
        programme: 'Professional development',
        mode: 'Online',
      },
    ],
    exceptions: [
      { date: '2026-11-06', label: 'Green March Day (public holiday)' },
      { date: '2026-11-18', label: 'Independence Day (public holiday)' },
      { date: '2026-12-02', courseCode: 'CAES-PD008', label: 'Seminar cancelled' },
    ],
  },
];
