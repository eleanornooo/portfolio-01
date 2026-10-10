import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import { useLang } from '../i18n/useLang';
import Dialog from './Dialog';
import { NAV } from './nav';

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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
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
    : 'inline-flex h-9 min-w-9 items-center justify-center px-2 text-sm text-ink2 hover:text-accent';
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

export default function Header() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-[6px] supports-[backdrop-filter]:bg-paper/85"
    >
      <div className="page flex h-14 items-center justify-between gap-6 md:h-16">
        <Link to="/" className="group flex items-center gap-3" aria-label={`Aziz Mimoudi — ${t.nav.home}`}>
          <Monogram className="h-7 w-7" />
          <span className="font-serif text-[1.125rem] tracking-[-0.01em] group-hover:text-accent">Aziz Mimoudi</span>
        </Link>

        <nav aria-label={t.nav.primary} className="hidden lg:block">
          <ul className="flex items-center gap-7 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  className={({ isActive }) =>
                    `relative py-1 transition-colors hover:text-accent ${
                      isActive
                        ? 'text-ink after:absolute after:-bottom-[1.3rem] after:left-0 after:right-0 after:h-[2px] after:bg-vivid'
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

        <div className="hidden lg:block">
          <Toggles />
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 py-2 text-sm lg:hidden"
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
                    `flex items-baseline gap-4 py-3 font-serif text-[1.75rem] leading-tight ${isActive ? 'text-accent' : 'text-ink'}`
                  }
                >
                  <span className="label num w-6">{String(i).padStart(2, '0')}</span>
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
