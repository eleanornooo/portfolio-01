import { useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock, Facebook, Link2, Linkedin, Mail, MapPin, Share2, Twitter } from 'lucide-react';
import { talks } from '../content/talks';
import { profile } from '../content/profile';
import { useLang } from '../i18n/useLang';
import { useMounted, useNow } from '../hooks/useNow';
import { formatDate } from '../lib/dates';
import { useReveals } from '../lib/reveal';
import { useSpotlight } from '../lib/spotlight';
import Seo, { SITE_URL } from '../components/Seo';

/**
 * One session page, laid out like the UNU programme page: breadcrumb, title, when/where,
 * share, chair, panel grid, about, official link. The talk itself (title, event, venue,
 * official URL) comes from content/talks.ts; the session times and the panel are here.
 */
const PATH = '/talks/unu-macau-2026';
const talk = talks.find((x) => x.id === 'unu-macau-2026')!;
const OFFICIAL = talk.links![0].url;

/** 25 November 2026, 08:30–09:30 in Macau (UTC+8) = 00:30–01:30 UTC. */
const START = Date.UTC(2026, 10, 25, 0, 30);
const END = Date.UTC(2026, 10, 25, 1, 30);

const CHAIR = { name: 'Salvatore Moccia' };
const PANEL = [
  { name: 'Sergio de Araujo Vilela', org: 'ANPD Brazil / IFRO' },
  { name: 'Carmen Ferri', org: 'University of Central Asia' },
  { name: 'Ip Teng Hin, Henry', org: 'Colégio Diocesano de São José' },
];

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/** "Carmen Ferri" → "CF", "Sergio de Araujo Vilela" → "SV" (first and last capitalised words). */
const initials = (name: string) =>
  name
    .split(',')[0]
    .split(/\s+/)
    .filter((w) => /^[A-ZÀ-Ý]/.test(w))
    .map((w) => w[0])
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .join('');

function Initials({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  return (
    <span
      aria-hidden="true"
      className={`display inline-flex shrink-0 items-center justify-center rounded-full bg-ink/[0.06] text-ink2 ring-1 ring-ink/15 ${
        size === 'lg' ? 'h-16 w-16 text-[1.375rem]' : 'h-14 w-14 text-[1.125rem]'
      } tracking-[-0.03em]`}
    >
      {initials(name)}
    </span>
  );
}

function StatusBadge({ now }: { now: number }) {
  const { t } = useLang();
  const state = now < START ? 'upcoming' : now <= END ? 'live' : 'past';
  return state === 'past' ? (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase leading-4 tracking-[0.14em] text-ink2 ring-1 ring-ink/25">
      {t.session.status.past}
    </span>
  ) : (
    <span className="badge-glow inline-flex items-center gap-1.5 rounded-full bg-amber px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase leading-4 tracking-[0.14em] text-[#160b05]">
      {state === 'live' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#160b05]" aria-hidden="true" />}
      {t.session.status[state]}
    </span>
  );
}

/** The visitor's own time for the session (client only: the server doesn't know the zone). */
function LocalTime() {
  const { t, lang } = useLang();
  const mounted = useMounted();
  if (!mounted) return null;
  const loc = lang === 'fr' ? 'fr-FR' : 'en-GB';
  const day = new Intl.DateTimeFormat(loc, { weekday: 'short', day: 'numeric', month: 'short' }).format(START);
  const hm = new Intl.DateTimeFormat(loc, { hour: '2-digit', minute: '2-digit' });
  const zone =
    new Intl.DateTimeFormat(loc, { timeZoneName: 'short' }).formatToParts(START).find((p) => p.type === 'timeZoneName')?.value ?? '';
  return (
    <p className="kin-fade num mt-1 text-sm text-ink3">
      {t.session.yourTime} {day}, {hm.format(START)}–{hm.format(END)} ({zone})
    </p>
  );
}

function Share({ title }: { title: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}${PATH}`;
  const u = encodeURIComponent(url);
  const txt = encodeURIComponent(title);
  const links = [
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: Linkedin },
    { name: 'X', href: `https://twitter.com/intent/tweet?url=${u}&text=${txt}`, Icon: Twitter },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: Facebook },
  ];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked: the address bar still has the link */
    }
  };
  const native = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      /* cancelled */
    }
  };
  const btn =
    'inline-flex h-11 w-11 items-center justify-center rounded-full text-ink2 ring-1 ring-ink/15 transition-colors hover:text-amber hover:ring-amber/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-2">{t.session.share}</span>
      {links.map(({ name, href, Icon }) => (
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" className={btn} aria-label={`${t.session.shareOn(name)} ${t.common.opensNewTab}`}>
          <Icon size={17} aria-hidden="true" />
        </a>
      ))}
      <a href={`mailto:?subject=${txt}&body=${u}`} className={btn} aria-label={t.session.shareEmail}>
        <Mail size={17} aria-hidden="true" />
      </a>
      <button type="button" onClick={copy} className={btn} aria-label={copied ? t.session.copied : t.session.copy}>
        {copied ? <Check size={17} aria-hidden="true" className="text-amber" /> : <Link2 size={17} aria-hidden="true" />}
      </button>
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button type="button" onClick={native} className={`${btn} sm:hidden`} aria-label={t.session.share}>
          <Share2 size={17} aria-hidden="true" />
        </button>
      )}
      <span role="status" className="sr-only">
        {copied ? t.session.copied : ''}
      </span>
    </div>
  );
}

export function Component() {
  const { t, lang } = useLang();
  const now = useNow(30_000);
  const root = useRef<HTMLDivElement>(null);
  useReveals(root);
  useSpotlight(root);
  const title = talk.title!;
  const [conference] = talk.event.split(',');
  const date = formatDate(talk.date, lang);
  const time = lang === 'fr' ? '8 h 30 – 9 h 30' : '08:30–09:30';

  return (
    <div ref={root}>
      <Seo title={t.session.metaTitle} description={t.session.metaDescription} path={PATH} />

      {/* ------------------------------------------------------------ opener */}
      <section aria-labelledby="page-title" className="tone-dark blend-b relative isolate overflow-hidden pb-16 pt-28 md:pb-24 md:pt-36">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="glow-field opacity-80" />
          <p className="display absolute -right-[2vw] bottom-[-0.12em] select-none text-[clamp(6rem,2rem+16vw,19rem)] leading-none tracking-[-0.06em] text-ink/[0.045]">
            MACAU
          </p>
        </div>
        <div className="page">
          <nav aria-label={t.session.breadcrumb} className="kin-fade text-sm text-ink3" style={delay(40)}>
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link to="/" className="link-quiet">
                  {t.session.home}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to="/talks" className="link-quiet">
                  {t.nav.talks}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink2">
                {conference}
              </li>
            </ol>
          </nav>

          <div className="kin-fade mt-8 flex flex-wrap items-center gap-3" style={delay(100)}>
            <StatusBadge now={now} />
            <span className="eyebrow text-amber">
              {t.session.panel} · {conference}
            </span>
          </div>

          <h1
            id="page-title"
            className="display mt-6 max-w-[22ch] text-[clamp(2.125rem,1rem+4.4vw,5.25rem)] leading-[0.98] tracking-[-0.04em]"
            lang="en"
          >
            <span className="kin-line">
              <span style={delay(160)}>{title}</span>
            </span>
          </h1>
          <p className="kin-fade mt-5 text-lead text-ink2" style={delay(300)}>
            {t.session.unu} · {conference}
          </p>

          <dl className="kin-fade mt-10 grid gap-6 border-t border-ink/10 pt-8 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-start" style={delay(420)}>
            <div className="flex gap-3">
              <Clock size={18} aria-hidden="true" className="mt-1 shrink-0 text-amber" />
              <div>
                <dt className="eyebrow text-[0.625rem]">{t.session.when}</dt>
                <dd className="mt-1.5">
                  <p className="num text-ink">
                    {date} · {time}
                  </p>
                  <p className="text-sm text-ink3">{t.session.macauTime}</p>
                  <LocalTime />
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin size={18} aria-hidden="true" className="mt-1 shrink-0 text-amber" />
              <div>
                <dt className="eyebrow text-[0.625rem]">{t.session.where}</dt>
                <dd className="mt-1.5 text-ink">
                  MGM MACAU, Grand Ballroom 1 &amp; 2
                  <span className="block text-sm text-ink3">{lang === 'fr' ? 'RAS de Macao, Chine' : 'Macau SAR, China'}</span>
                </dd>
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Share title={title} />
            </div>
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------- chair + panel */}
      <section aria-labelledby="panel-title" className="page pb-20 pt-16 md:pb-28 md:pt-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3" data-reveal="up">
            <h2 className="eyebrow">{t.session.chair}</h2>
            <div className="mt-5 flex items-center gap-4">
              <Initials name={CHAIR.name} size="lg" />
              <p className="font-serif text-[1.375rem] leading-snug">{CHAIR.name}</p>
            </div>
          </div>

          <div className="lg:col-span-9">
            <h2 id="panel-title" className="eyebrow" data-reveal="up">
              {t.session.panelists}
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2" data-reveal="stagger">
              {/* Aziz first, highlighted, with his photo. */}
              <li className="card-dark spot group relative flex items-center gap-5 p-5 ring-1 ring-amber/40 sm:col-span-2 md:p-6">
                <img
                  src="/img/portrait-400.webp"
                  width={400}
                  height={500}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-28 w-[5.6rem] shrink-0 rounded-2xl object-cover object-top shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)] md:h-32 md:w-[6.4rem]"
                />
                <div className="relative z-10 min-w-0">
                  <p className="eyebrow text-amber">{t.session.you}</p>
                  <p className="mt-1.5 font-serif text-[1.5rem] leading-snug md:text-[1.75rem]">
                    {profile.honorific} {profile.name}
                  </p>
                  <p className="mt-1 text-sm text-ink2">
                    {lang === 'fr' ? profile.title.fr : profile.title.en} · {profile.institutionShort}
                  </p>
                  <Link to="/about" className="link mt-3 inline-flex items-center gap-1 text-sm after:absolute after:inset-0">
                    {t.session.aboutAziz}
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </li>
              {PANEL.map((p) => (
                <li key={p.name} className="flex items-center gap-4 rounded-3xl border border-ink/10 p-5">
                  <Initials name={p.name} />
                  <div className="min-w-0">
                    <p className="font-serif text-[1.1875rem] leading-snug">{p.name}</p>
                    <p className="mt-0.5 text-sm text-ink2">{p.org}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- about */}
      <section aria-labelledby="about-title" className="page pb-28 md:pb-36">
        <div className="grid gap-8 border-t border-ink/10 pt-12 lg:grid-cols-12">
          <h2 id="about-title" className="eyebrow lg:col-span-3" data-reveal="up">
            {t.session.about}
          </h2>
          <div className="prose-measure space-y-5 text-lead text-ink2 lg:col-span-9" data-reveal="up">
            {t.session.body.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
            <p className="text-ink">{t.session.azizAngle}</p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a href={OFFICIAL} target="_blank" rel="noopener noreferrer" className="btn-glow">
                {t.session.official}
                <ArrowUpRight size={16} aria-hidden="true" />
                <span className="sr-only"> {t.common.opensNewTab}</span>
              </a>
              <Link to="/talks" className="btn-ghost">
                <ArrowLeft size={16} aria-hidden="true" />
                {t.session.allTalks}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
