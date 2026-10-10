import { useEffect, useRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';

/**
 * Fades its content in when it scrolls into view. Content stays visible without JS
 * and under prefers-reduced-motion (see .reveal in styles/index.css).
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
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }
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
