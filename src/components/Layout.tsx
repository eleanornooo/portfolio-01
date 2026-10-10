import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LangProvider } from '../i18n/context';
import { useLang } from '../i18n/useLang';
import Header from './Header';
import Footer from './Footer';
import { scrollToElement, scrollToTop, startSmoothScroll } from '../lib/smooth';

function Shell() {
  const { t } = useLang();
  const { pathname, hash } = useLocation();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);

  // On client-side navigation: scroll to the top (or the #anchor) and move focus to <main>
  // so screen-reader and keyboard users start at the new page's content.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) scrollToElement(el);
      return;
    }
    scrollToTop();
    main.current?.focus({ preventScroll: true });
  }, [pathname, hash]);

  // Smooth scrolling, started after hydration (and never with reduced motion).
  useEffect(() => {
    let stop = () => {};
    let cancelled = false;
    startSmoothScroll().then((fn) => (cancelled ? fn() : (stop = fn)));
    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  return (
    <div id="top" className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t.skip}
      </a>
      <Header />
      <main id="main" ref={main} tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function Layout() {
  return (
    <LangProvider>
      <Shell />
    </LangProvider>
  );
}
