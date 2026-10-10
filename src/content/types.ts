// Shared types for everything in src/content/.
// Pages only render these files: to update the site, edit the data, not the components.

export type Lang = 'en' | 'fr';

/** Text that is shown in both languages. */
export type Localized = { en: string; fr: string };

/** A date with the precision we actually know: "2026", "2026-04" or "2026-04-23". */
export type PartialDate = string;

export interface Link {
  label: string;
  url: string;
  /**
   * True for links that probably need a UM6P login (SharePoint / OneDrive).
   * They are shown as small secondary links with a lock hint.
   */
  restricted?: boolean;
}

/* ------------------------------------------------------------------ profile */

export interface Profile {
  name: string;
  honorific: string; // "Dr."
  postnominal: string; // "Ph.D."
  title: Localized; // "Assistant Professor"
  role: Localized; // "Coordinator, Technopedagogy & AI Axis"
  institute: Localized;
  institutionShort: string; // "ISE – UM6P"
  university: Localized;
  location: Localized;
  address: Localized;
  statement: Localized;
  bio: { en: string[]; fr: string[] };
  email: { primary: string; secondary?: string };
  links: {
    scholar: string;
    orcid: string;
    linkedin: string;
    scopus?: string;
    instagram?: string;
  };
  metrics: {
    citations: number;
    hIndex: number;
    i10Index: number;
    source: string;
    asOf: PartialDate;
  };
  mapUrl: string;
  cvPdf: string; // path under /public
}

/* ------------------------------------------------------------- publications */

export type PublicationType = 'article' | 'chapter' | 'proceedings' | 'thesis' | 'report';

export interface Publication {
  id: string;
  type: PublicationType;
  /** APA-style names, e.g. "Mimoudi, A." — Aziz's name is set in bold automatically. */
  authors: string[];
  /** Publication year, or "in press". */
  year: number | 'in press';
  /** Optional month for reports/proceedings, e.g. "June" (kept as in the CV). */
  month?: string;
  title: string;
  /** Journal name (articles). */
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  /** Book or proceedings title. */
  container?: string;
  /** Editors as they should appear after "In", e.g. "M. Lahby & Y. Maleh (Eds.)". */
  editors?: string;
  chapter?: string;
  /** Bracketed description, e.g. "Thèse de doctorat, Université de Sherbrooke". */
  description?: string;
  publisher?: string;
  doi?: string;
  /** Main link when there is no DOI. */
  url?: string;
  /** Extra links (preprint, free-access copy, repository…). */
  links?: Link[];
  /** Shown on the home page. */
  selected?: boolean;
  lang?: Lang;
}

/* -------------------------------------------------------------------- talks */

export type TalkType = 'Keynote' | 'Panel' | 'Oral' | 'Workshop' | 'Chair';

export interface Talk {
  id: string;
  date: PartialDate;
  endDate?: PartialDate;
  /** Free-text dates when they don't fit a range (e.g. "October 2–3 and 9, 2020"). */
  dateLabel?: string;
  type: TalkType;
  /** Talk title; when absent the event name is used as the heading. */
  title?: string;
  event: string;
  location?: string;
  virtual?: boolean;
  /** Co-presenters in APA form, only when the talk was co-authored. */
  authors?: string[];
  note?: string;
  links?: Link[];
  lang?: Lang;
}

/* ----------------------------------------------------------------- projects */

export type ProjectStatus = 'Active' | 'Completed' | 'Pending';

export interface Project {
  id: string;
  title: string;
  short?: string;
  summary: string;
  role: string;
  coordinator?: string;
  funder?: string;
  /** Amount as written in the CV, e.g. "EUR 94,066". */
  budget?: string;
  period: string;
  status: ProjectStatus;
  group: 'funded' | 'research' | 'digital';
  url?: string;
  links?: Link[];
}

export interface ResearchInterest {
  title: Localized;
  body: Localized;
  /** Publication ids that illustrate this theme. */
  refs?: string[];
}

/* ------------------------------------------------------------------ courses */

export interface Course {
  id: string;
  code?: string;
  title: string;
  programme: string;
  level: 'Ph.D.' | 'Master' | 'Professional development' | 'Teacher training';
  /** Academic years the course was given, e.g. ["2023–2024"]. Empty if unknown. */
  years: string[];
  /** Term label as known, e.g. "Spring 2024". */
  term?: string;
  credits?: string;
  place?: string;
  description: string;
  topics?: string[];
  /** Only set when a real, public URL exists. */
  materialsUrl?: string;
}

/* ---------------------------------------------------------------- timetable */

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
export type SessionType = 'Lecture' | 'Seminar' | 'Office hours' | 'Supervision';
export type SessionMode = 'On campus' | 'Online';

export interface Session {
  day: Weekday;
  /** 24-hour "HH:MM", Morocco time (Africa/Casablanca). */
  start: string;
  end: string;
  courseCode: string;
  title: string;
  type: SessionType;
  room?: string;
  programme?: string;
  mode: SessionMode;
  link?: string;
}

export interface TimetableException {
  /** "YYYY-MM-DD" */
  date: string;
  label: string;
  /** Only this course is cancelled; omit for a holiday that cancels everything. */
  courseCode?: string;
}

export interface Semester {
  id: string;
  name: string;
  /** "YYYY-MM-DD", inclusive. */
  start: string;
  end: string;
  sessions: Session[];
  exceptions: TimetableException[];
  /** Placeholder data: shows a visible "sample schedule" notice. */
  sample?: boolean;
}

/* ------------------------------------------------------------- about / misc */

export interface Position {
  id: string;
  role: string;
  org: string;
  place?: string;
  start: string; // year
  end?: string; // year, or undefined for "present"
  /** Shown instead of start–end when months are known. */
  periodLabel?: string;
  logo?: string; // file name in /public/img/logos (without extension)
  note?: string;
  url?: string;
}

export interface Affiliation {
  name: string;
  org: string;
  role: string;
  period: string;
  url?: string;
}

export interface Degree {
  id: string;
  degree: string;
  field?: string;
  school: string;
  place?: string;
  year: string;
  thesis?: { title: string; translation?: string; doi?: string };
  logo?: string;
  links?: Link[];
  /** Earlier diplomas shown in a smaller style. */
  minor?: boolean;
}

export interface ServiceItem {
  role: string;
  body: string;
  period?: string;
  detail?: string;
  links?: Link[];
}

export interface ServiceGroup {
  id: string;
  title: Localized;
  items: ServiceItem[];
}

export interface Award {
  year?: string;
  title: string;
  detail?: string;
  links?: Link[];
}

export interface Student {
  name: string;
  topic: string;
  cohort: string;
  status: string;
}

export interface Certification {
  year?: string;
  title: string;
  provider: string;
  detail?: string;
  links?: Link[];
  modules?: { title: string; link?: Link }[];
}

export type NewsKind = 'Milestone' | 'Talk' | 'Publication' | 'Award' | 'Service' | 'Teaching';

export interface NewsItem {
  id: string;
  date: PartialDate;
  endDate?: PartialDate;
  kind: NewsKind;
  title: Localized;
  detail?: Localized;
  url?: string;
}
