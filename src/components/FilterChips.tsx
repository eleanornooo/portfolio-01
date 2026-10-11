import { motion, MotionConfig } from 'framer-motion';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/**
 * A row of toggle buttons (aria-pressed) in a glass track; the amber pill slides to the
 * active option (framer-motion layoutId). Reduced motion: the pill jumps.
 */
export default function FilterChips<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
  bare = false,
  className = '',
}: {
  id: string;
  label: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (v: T) => void;
  /** No glass track (when it already sits inside a glass bar). */
  bare?: boolean;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div role="group" aria-label={label} className={`inline-flex flex-wrap gap-1 ${bare ? '' : 'glass rounded-[1.75rem] p-1.5'} ${className}`}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.value)}
              className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                on ? 'font-semibold text-[#160b05]' : 'text-ink2 hover:text-ink'
              }`}
            >
              {on && (
                <motion.span
                  layoutId={`chip-${id}`}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-vivid to-amber shadow-[0_8px_26px_-8px_rgb(226_87_43/0.9)]"
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }}
                />
              )}
              <span className="relative">
                {o.label}
                {o.count !== undefined && <span className="num ml-1.5 opacity-70">{o.count}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </MotionConfig>
  );
}
