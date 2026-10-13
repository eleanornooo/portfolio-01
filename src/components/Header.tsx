import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import { useLang } from '../i18n/useLang';
import Dialog from './Dialog';
import { DARK_HERO_ROUTES, NAV } from './nav';

export function Monogram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="12" className="fill-ink" />
      <g fill="none" className="stroke-paper" strokeWidth="4.5" strokeLinecap="square" strokeLinejoin="miter">
        <polyline points="12,46 21,18 30,46" />
        <line x1="15.6" y1="36" x2="26.4" y2="36" />
        <polyline points="35,46 35,18 43.5,35 52,18 52,46" />
      </g>
      <line x1="12" y1="53.5" x2="52" y2="53.5" className="stroke-vivid" strokeWidth="2.5" />
    </svg>
  );
}

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);
  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try {
        window.localStorage.setItem('theme', next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);
  return { theme, toggle };
}

function Toggles({ large = false }: { large?: boolean }) {
  const { lang, setLang, t } = useLang();
  const { theme, toggle } = useTheme();
  const cls = large
    ? 'inline-flex items-center gap-2 border border-rule px-3 py-2 text-sm hover:border-accent hover:text-accent'
    : 'inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-sm text-ink2 transition-colors hover:bg-ink/[0.07] hover:text-ink';
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={cls}
        onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
        aria-label={t.toggles.langLabel}
        lang={lang === 'en' ? 'fr' : 'en'}
      >
        <span className="font-medium tracking-wide">{large ? t.toggles.lang : t.toggles.langShort}</span>
      </button>
      <button
        type="button"
        className={cls}
        onClick={toggle}
        aria-label={theme === 'dark' ? t.toggles.themeLight : t.toggles.themeDark}
      >
        {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
        {large && <span>{theme === 'dark' ? t.toggles.themeLight : t.toggles.themeDark}</span>}
      </button>
    </div>
  );
}

/** True once the page has scrolled past `offset` px. */
function useScrolled(offset = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > offset);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [offset]);
  return scrolled;
}

export default function Header() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const close = useCallback(() => setOpen(false), []);
  const scrolled = useScrolled();
  // Over a dark hero (always dark) the bar uses the dark palette, whatever the theme.
  const overHero = DARK_HERO_ROUTES.includes(pathname) && !scrolled;

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      role="banner"
      className={`fixed inset-x-0 top-0 z-40 px-3 pt-3 transition-[padding] duration-500 md:px-5 ${
        overHero ? 'tone-dark !bg-transparent' : ''
      } ${scrolled ? 'md:pt-4' : 'md:pt-3'}`}
    >
      {/* Full-width and transparent at the top; a floating glass pill once the page scrolls. */}
      <div
        className={`relative mx-auto flex h-14 items-center justify-between gap-6 transition-[max-width,padding] duration-700 ease-out ${
          scrolled ? 'max-w-[62rem] pl-3 pr-2 sm:pl-4' : 'max-w-page px-2 sm:px-5 lg:px-9'
        }`}
      >
        <span
          aria-hidden="true"
          className={`glass-nav pointer-events-none absolute inset-0 rounded-full transition-[opacity,transform] duration-500 ${
            scrolled ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-0'
          }`}
        />
        <Link to="/" className="group relative flex items-center gap-3" aria-label={`Aziz Mimoudi — ${t.nav.home}`}>
          <Monogram className="h-7 w-7" />
          <span className="font-display text-[1.0625rem] font-bold tracking-[-0.02em] group-hover:text-accent">
            Aziz Mimoudi
          </span>
        </Link>

        <nav aria-label={t.nav.primary} className="relative hidden lg:block">
          <ul className="flex items-center gap-1 text-[0.8125rem]">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  className={({ isActive }) =>
                    `relative block rounded-full px-3.5 py-2 transition-colors hover:text-ink ${
                      isActive
                        ? 'bg-ink/[0.07] text-ink after:absolute after:bottom-[3px] after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-amber after:shadow-[0_0_10px_2px_rgb(245_158_59/0.7)]'
                        : 'text-ink2'
                    }`
                  }
                >
                  {t.nav[n.key]}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative hidden lg:block">
          <Toggles />
        </div>

        <button
          type="button"
          className="relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm lg:hidden"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          {t.nav.menu}
          <Menu size={18} aria-hidden="true" />
        </button>
      </div>

      <Dialog open={open} onClose={close} title={t.nav.menu} variant="sheet">
        <nav aria-label={t.nav.primary} className="page flex-1 overflow-y-auto py-8">
          <ul className="space-y-1">
            {[{ to: '/', key: 'home' } as const, ...NAV].map((n, i) => (
              <li key={n.to} className="border-b border-rule">
                <NavLink
                  to={n.to}
                  end={n.to === '/'}
                  onClick={close}
                  className={({ isActive }) =>
                    `flex items-baseline gap-4 py-3 font-display text-[2rem] font-bold leading-tight tracking-[-0.03em] ${isActive ? 'text-accent' : 'text-ink'}`
                  }
                >
                  <span className="label num w-6 font-sans">{String(i).padStart(2, '0')}</span>
                  {t.nav[n.key]}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Toggles large />
          </div>
        </nav>
      </Dialog>
    </header>
  );
}
