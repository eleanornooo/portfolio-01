import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Download, Search, Sparkles, X } from 'lucide-react';
import { useLang } from '../i18n/useLang';
import { prefersReducedMotion } from '../lib/motion';
import { lockScroll } from '../lib/smooth';
import { ask } from '../lib/guide/provider';
import type { GuideAnswer } from '../lib/guide/types';

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * "Ask about the research": a floating button (bottom-right, clear of the page content) and
 * Ctrl/⌘+K open a slide-in glass panel. Questions are answered from the site's own content
 * (fuzzy search, see lib/guide), with a typed-out answer and 2–4 linked results. Built on the
 * native modal <dialog>: the page is inert behind it, Tab stays inside, Esc closes, focus
 * returns. Reduced motion: no slide, no typing. On phones the button stays off the first
 * screen and tucks away while you scroll down, and it steps aside whenever an element marked [data-guide-avoid] (the contact
 * form's send button) is on screen.
 */
export default function ResearchGuide() {
  const { t, lang } = useLang();
  const { pathname } = useLocation();
  const ref = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<GuideAnswer | null>(null);
  const [typed, setTyped] = useState('');
  const [tucked, setTucked] = useState(false);
  const [mac, setMac] = useState(false);
  const titleId = useId();
  const inputId = useId();
  const asked = useRef(0);

  const show = useCallback(() => {
    const d = ref.current;
    if (!d || d.open) return;
    opener.current = document.activeElement as HTMLElement | null;
    d.showModal();
    lockScroll(true);
    setOpen(true);
    requestAnimationFrame(() => input.current?.focus());
  }, []);
  const hide = useCallback(() => ref.current?.close(), []);

  useEffect(() => setMac(isMac()), []);

  // Ctrl/⌘+K toggles the guide from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (ref.current?.open) hide();
        else show();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, hide]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => {
      lockScroll(false);
      setOpen(false);
      opener.current?.focus?.();
    };
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, []);

  // Phones: hide the button while scrolling down, bring it back on the way up.
  // Everywhere: step aside while a [data-guide-avoid] element is visible.
  useEffect(() => {
    let last = window.scrollY;
    let avoid = false;
    let down = false;
    const update = () => setTucked(avoid || down);
    // Phones: hidden over the first screen (the hero's buttons are there) and while scrolling down.
    const phone = () => window.innerWidth < 768;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) > 8 || y < 8) {
        down = phone() && ((y > last && y > 200) || y < window.innerHeight * 0.75);
        last = y;
        update();
      }
    };
    down = phone() && last < window.innerHeight * 0.75;
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    const io = new IntersectionObserver((entries) => {
      avoid = entries.some((e) => e.isIntersecting);
      update();
    });
    document.querySelectorAll('[data-guide-avoid]').forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
      setTucked(false);
    };
  }, [pathname]);

  // Typing animation for each new answer (instant with reduced motion).
  useEffect(() => {
    if (!answer) return setTyped('');
    const full = answer.text;
    if (prefersReducedMotion()) return setTyped(full);
    let i = 0;
    const step = Math.max(1, Math.ceil(full.length / 70));
    const id = window.setInterval(() => {
      i = Math.min(full.length, i + step);
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [answer]);

  const run = async (q: string) => {
    const question = q.trim();
    if (!question) return;
    setQuery(question);
    setBusy(true);
    const n = ++asked.current;
    const a = await ask(question, lang);
    if (n !== asked.current) return; // a newer question won
    setAnswer(a);
    setBusy(false);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(query);
  };
  // Load the search engine early when the button is hovered or focused.
  const prefetch = () => void import('../lib/guide/engine');
  const done = answer && typed.length >= answer.text.length;

  return (
    <>
      <button
        type="button"
        onClick={show}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        className={`guide-fab ${tucked && !open ? 'is-tucked' : ''}`}
      >
        <Sparkles size={17} aria-hidden="true" className="shrink-0 text-amber" />
        <span className="hidden md:inline">{t.guide.button}</span>
        <span className="sr-only md:hidden">{t.guide.button}</span>
        <kbd className="num hidden rounded-md border border-ink/15 px-1.5 py-0.5 text-[0.6875rem] text-ink3 md:inline">
          {mac ? '⌘' : 'Ctrl'} K
        </kbd>
      </button>

      <dialog
        ref={ref}
        data-lenis-prevent
        aria-labelledby={titleId}
        className="guide-panel tone-dark"
        onClick={(e) => {
          if (e.target === e.currentTarget) hide();
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Tab' || !ref.current) return;
          const items = [...ref.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])')];
          const first = items[0];
          const last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }}
      >
        <div className="guide-inner flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-ink/10 px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-7">
            <div>
              {/* The honest label: "Research guide — answers from this site's content". */}
              <h2 id={titleId}>
                <span className="flex items-center gap-2 font-display text-[1.375rem] font-bold tracking-[-0.02em]">
                  <Sparkles size={18} aria-hidden="true" className="text-amber" />
                  {t.guide.title}
                </span>
                <span className="mt-1 block text-xs font-normal text-ink3">{t.guide.label.slice(t.guide.title.length)}</span>
              </h2>
            </div>
            <button type="button" onClick={hide} aria-label={t.guide.close} className="-m-1 rounded-full p-2 text-ink2 hover:text-amber">
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <form onSubmit={submit} className="px-5 pt-5 sm:px-7" role="search">
            <label htmlFor={inputId} className="sr-only">
              {t.guide.placeholder}
            </label>
            <div className="relative">
              <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink3" />
              <input
                ref={input}
                id={inputId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.guide.placeholder}
                autoComplete="off"
                className="field rounded-full py-3 pl-10 pr-24 text-[0.9375rem]"
              />
              <button type="submit" className="btn-glow absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 text-sm">
                {t.guide.ask}
              </button>
            </div>
          </form>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-7">
            <h3 className="eyebrow text-[0.625rem]">{t.guide.suggestions}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {t.guide.chips.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => run(c)}
                    className="rounded-full border border-amber/30 bg-amber/[0.07] px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-amber/70"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>

            {(busy || answer) && (
              <section className="mt-7" aria-busy={busy}>
                {busy ? (
                  <p className="flex items-center gap-2 text-sm text-ink3">
                    <span className="guide-dot" aria-hidden="true" />
                    {t.guide.thinking}
                  </p>
                ) : (
                  answer && (
                    <>
                      {/* Screen readers get the whole answer once; the typing is visual only. */}
                      <p className="sr-only" aria-live="polite">
                        {answer.text}
                      </p>
                      <p aria-hidden="true" className="font-serif text-[1.125rem] leading-relaxed text-ink">
                        {typed}
                        {!done && <span className="guide-caret" />}
                      </p>
                      {answer.source === 'llm' && <p className="mt-2 text-xs text-ink3">{t.guide.llmNote}</p>}

                      {answer.results.length > 0 && (
                        <div className={`mt-6 transition-opacity duration-500 ${done ? 'opacity-100' : 'opacity-0'}`}>
                          <h3 className="eyebrow text-[0.625rem]">{t.guide.results}</h3>
                          <ul className="mt-3 space-y-2.5">
                            {answer.results.map((r) => {
                              const cls =
                                'group block rounded-2xl border border-ink/10 bg-ink/[0.03] p-4 transition-colors hover:border-amber/40';
                              const body = (
                                <>
                                  <span className="eyebrow block text-[0.625rem] text-amber">{t.guide.kinds[r.kind]}</span>
                                  <span className="mt-1.5 flex items-start justify-between gap-3">
                                    <span className="font-serif text-[1.0625rem] leading-snug text-ink">{r.title}</span>
                                    {r.download ? (
                                      <Download size={16} aria-hidden="true" className="mt-1 shrink-0 text-ink3 group-hover:text-amber" />
                                    ) : (
                                      <ArrowUpRight
                                        size={16}
                                        aria-hidden="true"
                                        className="mt-1 shrink-0 text-ink3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber"
                                      />
                                    )}
                                  </span>
                                  {r.meta && <span className="mt-1 block text-xs text-ink3">{r.meta}</span>}
                                </>
                              );
                              return (
                                <li key={r.id}>
                                  {/* The CV is a file (download), everything else a page of the site. */}
                                  {r.download ? (
                                    <a href={r.href} download className={cls}>
                                      {body}
                                    </a>
                                  ) : (
                                    <Link to={r.href} onClick={hide} className={cls}>
                                      {body}
                                    </Link>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </>
                  )
                )}
              </section>
            )}

            <p className="mt-8 text-xs text-ink3">
              {t.guide.shortcut}: <kbd className="num">{mac ? '⌘' : 'Ctrl'} K</kbd> · Esc
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
