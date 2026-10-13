/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        paper: v('paper'),
        paper2: v('paper-2'),
        ink: v('ink'),
        ink2: v('ink-2'),
        ink3: v('ink-3'),
        rule: v('rule'),
        accent: v('accent'),
        vivid: v('accent-vivid'),
        amber: v('amber'),
      },
      fontFamily: {
        // Each web font is followed by a metric-matched local fallback (see "Font fallbacks" in
        // index.css), so the swap when the web font arrives doesn't re-wrap text (no layout shift).
        serif: ['"Fraunces Variable"', '"Fraunces Fallback"', 'Iowan Old Style', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', '"Plex Fallback"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Bricolage Grotesque Variable"', '"Bricolage Fallback"', '"Arial Narrow"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        label: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.12em' }],
        eyebrow: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.28em' }],
        sm: ['0.875rem', { lineHeight: '1.35rem' }],
        base: ['1.0625rem', { lineHeight: '1.7rem' }],
        lead: ['1.25rem', { lineHeight: '1.9rem' }],
        h3: ['1.375rem', { lineHeight: '1.8rem' }],
        h2: ['clamp(1.75rem, 1.35rem + 1.3vw, 2.5rem)', { lineHeight: '1.15' }],
        h1: ['clamp(2.5rem, 1.7rem + 2.8vw, 4.25rem)', { lineHeight: '1.04' }],
        display: ['clamp(3.1rem, 1.6rem + 5.4vw, 6.5rem)', { lineHeight: '0.96' }],
        mega: ['clamp(3.25rem, 1rem + 9vw, 10rem)', { lineHeight: '0.88', letterSpacing: '-0.045em' }],
        big: ['clamp(2.5rem, 1.4rem + 4.2vw, 5.25rem)', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
      },
      maxWidth: {
        measure: '68ch',
        page: '78rem',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
