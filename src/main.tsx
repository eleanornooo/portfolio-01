import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import './styles/index.css';

// Every route is pre-rendered to static HTML at build time, then hydrated in the browser.
export const createRoot = ViteReactSSG({ routes });

// The app is running: clear the one-time "reload after deploy" flag set in index.html. Done a
// few seconds later, so a page that fails again right after that reload still can't loop.
if (typeof window !== 'undefined') {
  window.setTimeout(() => (window as Window & { __clearReloadFlag?: () => void }).__clearReloadFlag?.(), 10_000);
}
