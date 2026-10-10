import type { RouteRecord } from 'vite-react-ssg';
import Layout from './components/Layout';

// Each page module exports `Component`; pages are code-split and pre-rendered.
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    entry: 'src/components/Layout.tsx',
    children: [
      { index: true, lazy: () => import('./pages/Home'), entry: 'src/pages/Home.tsx' },
      { path: 'research', lazy: () => import('./pages/Research'), entry: 'src/pages/Research.tsx' },
      { path: 'publications', lazy: () => import('./pages/Publications'), entry: 'src/pages/Publications.tsx' },
      { path: 'talks', lazy: () => import('./pages/Talks'), entry: 'src/pages/Talks.tsx' },
      { path: 'teaching', lazy: () => import('./pages/Teaching'), entry: 'src/pages/Teaching.tsx' },
      { path: 'about', lazy: () => import('./pages/About'), entry: 'src/pages/About.tsx' },
      { path: 'contact', lazy: () => import('./pages/Contact'), entry: 'src/pages/Contact.tsx' },
      // Pre-rendered as 404.html (served by Vercel for unknown URLs); "*" covers client navigation.
      { path: '404', lazy: () => import('./pages/NotFound'), entry: 'src/pages/NotFound.tsx' },
      { path: '*', lazy: () => import('./pages/NotFound'), entry: 'src/pages/NotFound.tsx' },
    ],
  },
];
