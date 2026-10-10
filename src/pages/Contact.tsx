import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Mail, MapPin } from 'lucide-react';
import { profile } from '../content/profile';
import { useLang } from '../i18n/useLang';
import Seo from '../components/Seo';
import Section, { PageHeader } from '../components/Section';
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
        <label htmlFor="from_name" className="mb-1.5 block text-sm font-medium">
          {t.contact.name} <span className="text-ink3">({t.contact.required.toLowerCase()})</span>
        </label>
        <input id="from_name" name="from_name" type="text" required autoComplete="name" maxLength={120} className="field" />
      </div>
      <div>
        <label htmlFor="email_id" className="mb-1.5 block text-sm font-medium">
          {t.contact.yourEmail} <span className="text-ink3">({t.contact.required.toLowerCase()})</span>
        </label>
        <input id="email_id" name="email_id" type="email" required autoComplete="email" maxLength={200} className="field" />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
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
        <button type="submit" className="btn-solid disabled:cursor-wait disabled:opacity-60" disabled={sending}>
          {sending ? t.contact.sending : t.contact.send}
        </button>
        <p className="text-sm text-ink3">{t.contact.privacy}</p>
      </div>

      <div id="contact-status" role="status" aria-live="polite" className="min-h-[1.5rem] text-sm">
        {status === 'success' && <p className="border-l-2 border-vivid pl-3 text-ink">{t.contact.success}</p>}
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
      <PageHeader title={t.contact.title} intro={t.contact.intro} />

      <Section id="details" index="01" label={t.contact.email}>
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-10">
            <div>
              <p className="label mb-2">{t.contact.emailPrimary}</p>
              <a href={`mailto:${profile.email.primary}`} className="link inline-flex items-center gap-2 font-serif text-h3">
                <Mail size={18} aria-hidden="true" />
                {profile.email.primary}
              </a>
              {profile.email.secondary && (
                <p className="mt-3 text-sm text-ink2">
                  {t.contact.emailSecondary}:{' '}
                  <a href={`mailto:${profile.email.secondary}`} className="link-quiet">
                    {profile.email.secondary}
                  </a>
                </p>
              )}
            </div>
            <div>
              <p className="label mb-2">{t.contact.address}</p>
              <address className="flex gap-2 not-italic text-ink2">
                <MapPin size={18} className="mt-1 shrink-0 text-ink3" aria-hidden="true" />
                <span>{pick(profile.address)}</span>
              </address>
              <p className="mt-2 pl-[26px] text-sm">
                <Ext href={profile.mapUrl}>{t.contact.map}</Ext>
              </p>
            </div>
            <div>
              <p className="label mb-2">{t.contact.elsewhere}</p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <li>
                  <Ext href={profile.links.scholar}>Google Scholar</Ext>
                </li>
                <li>
                  <Ext href={profile.links.orcid}>ORCID</Ext>
                </li>
                <li>
                  <Ext href={profile.links.linkedin}>LinkedIn</Ext>
                </li>
                {profile.links.instagram && (
                  <li>
                    <Ext href={profile.links.instagram}>Instagram</Ext>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="relative border-t border-ink pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <h2 className="mb-6 font-serif text-h3 font-normal">{t.contact.form}</h2>
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
