import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { profile } from '../content/profile';
import { useLang } from '../i18n/useLang';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import Magnetic from '../components/Magnetic';
import { Ext } from '../components/Ext';

// EmailJS configuration. Values can be overridden with VITE_EMAILJS_* environment variables
// (see .env.example); the defaults are the ones the site has always used.
// The EmailJS template receives: from_name, email_id, message and reply_to.
const EMAILJS = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_srq3qjb',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_ivo607f',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'pd47JUs1ZBhhOIIan',
};

const COOLDOWN_MS = 60_000;
const MIN_FILL_MS = 3_000; // humans don't fill in a form in under three seconds
const LAST_SENT_KEY = 'contact:lastSent';

/** An e-mail address that may wrap only before "@" and ".", never mid-word. */
function Address({ email }: { email: string }) {
  const parts = email.split(/(?=[@.])/);
  return (
    <span className="min-w-0 break-normal">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <wbr />}
          {p}
        </span>
      ))}
    </span>
  );
}

type Status = 'idle' | 'sending' | 'success' | 'error' | 'cooldown';

function lastSent(): number {
  try {
    return Number(window.localStorage.getItem(LAST_SENT_KEY)) || 0;
  } catch {
    return 0;
  }
}

function ContactForm() {
  const { t } = useLang();
  const [status, setStatus] = useState<Status>('idle');
  const [wait, setWait] = useState(0);
  const openedAt = useRef(0);
  const memoryLastSent = useRef(0);

  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot or impossibly fast submission: pretend it worked, send nothing.
    if (String(data.get('website') ?? '') !== '' || Date.now() - openedAt.current < MIN_FILL_MS) {
      setStatus('success');
      form.reset();
      return;
    }

    const since = Date.now() - Math.max(lastSent(), memoryLastSent.current);
    if (since < COOLDOWN_MS) {
      setWait(Math.ceil((COOLDOWN_MS - since) / 1000));
      setStatus('cooldown');
      return;
    }

    const email = String(data.get('email_id') ?? '').trim();
    setStatus('sending');
    try {
      const { default: emailjs } = await import('@emailjs/browser');
      await emailjs.send(
        EMAILJS.serviceId,
        EMAILJS.templateId,
        {
          from_name: String(data.get('from_name') ?? '').trim(),
          email_id: email,
          message: String(data.get('message') ?? '').trim(),
          reply_to: email,
        },
        { publicKey: EMAILJS.publicKey },
      );
      memoryLastSent.current = Date.now();
      try {
        window.localStorage.setItem(LAST_SENT_KEY, String(memoryLastSent.current));
      } catch {
        /* storage unavailable — the in-memory cooldown still applies */
      }
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    }
  };

  const sending = status === 'sending';

  return (
    <form onSubmit={onSubmit} aria-describedby="contact-status" className="space-y-6">
      <div>
        <label htmlFor="from_name" className="mb-2 block text-sm font-medium">
          {t.contact.name} <span className="text-ink3">({t.contact.required.toLowerCase()})</span>
        </label>
        <input id="from_name" name="from_name" type="text" required autoComplete="name" maxLength={120} className="field" />
      </div>
      <div>
        <label htmlFor="email_id" className="mb-2 block text-sm font-medium">
          {t.contact.yourEmail} <span className="text-ink3">({t.contact.required.toLowerCase()})</span>
        </label>
        <input id="email_id" name="email_id" type="email" required autoComplete="email" maxLength={200} className="field" />
      </div>
      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium">
          {t.contact.message} <span className="text-ink3">({t.contact.required.toLowerCase()})</span>
        </label>
        <textarea id="message" name="message" required rows={7} maxLength={5000} className="field resize-y" />
      </div>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Magnetic strength={0.25}>
          <button type="submit" className="btn-glow disabled:cursor-wait disabled:opacity-60" disabled={sending}>
            {sending ? t.contact.sending : t.contact.send}
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </Magnetic>
        <p className="text-sm text-ink3">{t.contact.privacy}</p>
      </div>

      <div id="contact-status" role="status" aria-live="polite" className="min-h-[1.5rem] text-sm">
        {status === 'success' && <p className="border-l-2 border-amber pl-3 text-ink">{t.contact.success}</p>}
        {status === 'error' && (
          <p className="border-l-2 border-accent pl-3 text-accent">
            {t.contact.error}{' '}
            <a className="link" href={`mailto:${profile.email.primary}`}>
              {profile.email.primary}
            </a>
            .
          </p>
        )}
        {status === 'cooldown' && <p className="pl-3 text-ink2">{t.contact.cooldown(wait)}</p>}
      </div>
    </form>
  );
}

export function Component() {
  const { t, pick } = useLang();
  return (
    <>
      <Seo title={t.contact.metaTitle} description={t.contact.metaDescription} path="/contact" />
      <PageHero eyebrow={`${pick(profile.institute)} · UM6P`} title={t.contact.title} intro={t.contact.intro} />

      <section id="details" aria-label={t.contact.email} className="relative isolate overflow-hidden pb-28 pt-4 md:pb-36">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="glow-field opacity-60" />
        </div>
        <div className="page grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-8">
          <div className="space-y-4">
            <div className="glass rounded-[1.75rem] p-6 md:p-8">
              <p className="eyebrow mb-4">
                {t.contact.email} · {t.contact.emailPrimary}
              </p>
              <a
                href={`mailto:${profile.email.primary}`}
                className="group inline-flex items-center gap-3 font-display text-[clamp(1.0625rem,0.7rem+1.25vw,1.75rem)] font-bold tracking-[-0.03em] text-ink transition-colors hover:text-amber"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber/10 text-amber ring-1 ring-amber/30">
                  <Mail size={18} aria-hidden="true" />
                </span>
                <Address email={profile.email.primary} />
              </a>
              {profile.email.secondary && (
                <p className="mt-4 text-sm text-ink2">
                  {t.contact.emailSecondary}:{' '}
                  <a href={`mailto:${profile.email.secondary}`} className="link-quiet">
                    <Address email={profile.email.secondary} />
                  </a>
                </p>
              )}
            </div>
            <div className="glass rounded-[1.75rem] p-6 md:p-8">
              <p className="eyebrow mb-4">{t.contact.address}</p>
              <address className="flex gap-3 not-italic text-ink2">
                <MapPin size={18} className="mt-1 shrink-0 text-amber" aria-hidden="true" />
                <span>{pick(profile.address)}</span>
              </address>
              <p className="mt-4 pl-[30px] text-sm">
                <Ext href={profile.mapUrl}>{t.contact.map}</Ext>
              </p>
            </div>
            <div className="glass rounded-[1.75rem] p-6 md:p-8">
              <p className="eyebrow mb-4">{t.contact.elsewhere}</p>
              <ul className="flex flex-wrap gap-2 text-sm">
                {[
                  ['Google Scholar', profile.links.scholar],
                  ['ORCID', profile.links.orcid],
                  ['LinkedIn', profile.links.linkedin],
                  ...(profile.links.instagram ? [['Instagram', profile.links.instagram]] : []),
                ].map(([label, href]) => (
                  <li key={href}>
                    <Ext href={href} className="btn-small text-ink">
                      {label}
                    </Ext>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 sm:p-8 md:p-10">
            <h2 className="display mb-8 text-[clamp(2.25rem,1.4rem+2.6vw,3.5rem)] leading-[0.95] tracking-[-0.04em]">
              {t.contact.form}
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
