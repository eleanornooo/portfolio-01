import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import { useLang } from '../i18n/useLang';
import Dialog from './Dialog';
import { DARK_HERO_ROUTES, NAV } from './nav';

/** Outline of a Georgia Italic "m" (same as the favicon, public/d-m-dot-transparent.svg). */
const M_PATH =
  'M49.21 47.02L48.82 48.71Q46.39 49.68 44.94 50.07Q43.49 50.45 42.46 50.45Q40.35 50.45 39.30 49.35Q38.25 48.26 38.25 46.65Q38.25 46.07 38.35 45.37Q38.46 44.67 38.69 43.72L41.28 33.89Q41.57 32.76 41.74 31.83Q41.91 30.91 41.91 30.36Q41.91 28.59 41.15 27.56Q40.38 26.53 38.72 26.53Q36.95 26.53 35.25 27.36Q33.55 28.19 31.42 30.46L26.83 50L21.92 50L26.06 32.39Q26.20 31.81 26.31 31.16Q26.43 30.51 26.43 30.20Q26.43 28.48 25.58 27.51Q24.72 26.53 23.06 26.53Q21.56 26.53 19.74 27.28Q17.92 28.04 15.52 30.65L11.06 50L6.16 50L10.09 32.91Q10.30 31.99 10.49 30.94Q10.69 29.88 10.69 29.14Q10.69 27.61 10.19 27.13Q9.69 26.64 8.24 26.64Q7.66 26.64 6.75 26.85Q5.84 27.06 5.34 27.19L5.73 25.50Q7.79 24.58 9.37 24.13Q10.96 23.69 12.09 23.69Q14.20 23.69 15.08 24.83Q15.97 25.98 16.02 27.96L16.18 27.96Q19.29 25.50 21.29 24.45Q23.30 23.40 26.06 23.40Q28.41 23.40 29.87 24.75Q31.34 26.11 31.52 28.17L31.63 28.17Q34.45 25.82 36.65 24.61Q38.85 23.40 41.78 23.40Q44.31 23.40 45.67 24.86Q47.03 26.32 47.03 28.70Q47.03 29.17 46.88 30.38Q46.74 31.600 46.42 32.78L44.20 41.25Q43.97 42.09 43.76 43.18Q43.55 44.28 43.55 44.88Q43.55 46.39 44.18 46.93Q44.81 47.47 46.31 47.47Q46.81 47.47 47.76 47.34Q48.71 47.21 49.21 47.02Z';

/**
 * The site mark: a serif "m" in the current text colour (it follows the theme) and an orange dot.
 * Trimmed viewBox so the glyph sits on the text baseline next to the name.
 */
export function Monogram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="4 20 58 34" className={className} aria-hidden="true">
      <path d={M_PATH} fill="currentColor" />
      <circle cx="55" cy="47" r="6" fill="#E8622C" />
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
        <Link to="/" className="group relative flex items-center gap-2" aria-label={`Aziz Mimoudi — ${t.nav.home}`}>
          <Monogram className="h-[1.375rem] w-auto translate-y-[0.1rem]" />
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
