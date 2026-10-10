import { useEffect, useRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';

/**
 * Fades its content in when it scrolls into view. Content is visible by default
 * (no JS, reduced motion, or already on screen); see .reveal-armed in styles/index.css.
 */
export default function Reveal({
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Content already on screen is never hidden (it is the page's first paint);
    // only sections that start below the fold fade in when scrolled to.
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add('reveal-armed');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
