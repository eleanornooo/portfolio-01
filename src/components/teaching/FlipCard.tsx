import { useId, useRef, useState } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import type { Course } from '../../content/types';
import { useLang } from '../../i18n/useLang';
import { hasFinePointer } from '../../lib/motion';

/** `inert` is not in React 18's types; passed through as a plain attribute. */
const inert = (on: boolean) => (on ? ({ inert: '' } as Record<string, string>) : {});

/**
 * A course as a flip card. Front: the course code in giant type (or its number when the
 * course has no code) and the title. Back: programme, level, term and key topics, with a
 * "Details" button that opens the full course dialog.
 * It turns on hover (mouse), on tap, and with Enter/Space (the front is a button with
 * aria-expanded); focus moves to the side that is showing. Reduced motion: a cross-fade.
 */
export default function FlipCard({ course, index, onDetails }: { course: Course; index: number; onDetails: () => void }) {
  const { t } = useLang();
  const [flipped, setFlipped] = useState(false);
  const backId = useId();
  const frontBtn = useRef<HTMLButtonElement>(null);
  const backBtn = useRef<HTMLButtonElement>(null);
  const code = course.code;
  const when = course.term ?? (course.years.length ? course.years.join(', ') : null);

  const turn = (to: boolean, moveFocus: boolean) => {
    setFlipped(to);
    if (moveFocus) requestAnimationFrame(() => (to ? backBtn.current : frontBtn.current)?.focus({ preventScroll: true }));
  };

  return (
    <div
      className="flip h-[23rem]"
      data-flipped={flipped || undefined}
      onMouseEnter={() => hasFinePointer() && setFlipped(true)}
      onMouseLeave={() => hasFinePointer() && setFlipped(false)}
    >
      <div className="flip-inner">
        {/* ------------------------------------------------------------ front */}
        <div className="flip-face flip-front" {...inert(flipped)}>
          <button
            ref={frontBtn}
            type="button"
            aria-expanded={flipped}
            aria-controls={backId}
            aria-label={t.teaching.flip(`${code ? `${code} — ` : ''}${course.title}`)}
            onClick={(e) => turn(true, e.detail === 0)}
            className="flex h-full w-full flex-col rounded-[1.75rem] p-6 text-left [container-type:inline-size]"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="eyebrow text-accent">{course.level}</span>
              <RotateCw size={16} aria-hidden="true" className="text-ink3" />
            </span>
            <span
              aria-hidden="true"
              className={`display mt-5 block leading-[0.86] tracking-[-0.05em] ${code ? 'text-glow' : 'outline-text'}`}
              // Giant, but never wider than the card (container query units).
              style={{ fontSize: code ? `min(4.75rem, ${(100 / (code.length * 0.64)).toFixed(2)}cqw)` : 'min(7rem, 45cqw)' }}
            >
              {code ? code.replace(/-/g, '‑') : String(index + 1).padStart(2, '0')}
            </span>
            <span className="mt-auto block">
              <span className="block font-serif text-[1.375rem] leading-snug">{course.title}</span>
              {when && <span className="num mt-2 block text-sm text-ink3">{when}</span>}
            </span>
          </button>
        </div>

        {/* ------------------------------------------------------------- back */}
        <div id={backId} className="flip-face flip-back tone-dark" {...inert(!flipped)}>
          <div className="flex h-full flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <p className="eyebrow text-amber">{code ?? course.level}</p>
              <button
                ref={backBtn}
                type="button"
                onClick={(e) => turn(false, e.detail === 0)}
                aria-label={t.teaching.flipBack}
                className="-m-2 rounded-full p-2 text-ink3 hover:text-ink"
              >
                <RotateCcw size={16} aria-hidden="true" />
              </button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="sr-only">{t.teaching.programme}</dt>
                <dd className="font-serif text-[1.125rem] leading-snug text-ink">{course.programme}</dd>
              </div>
              <div className="flex flex-wrap gap-x-4 text-ink2">
                <dt className="sr-only">{t.teaching.level}</dt>
                <dd>{course.level}</dd>
                {when && (
                  <>
                    <dt className="sr-only">{t.teaching.term}</dt>
                    <dd className="num">{when}</dd>
                  </>
                )}
              </div>
            </dl>
            {course.topics ? (
              <>
                <h3 className="eyebrow mt-5 text-[0.625rem]">{t.teaching.topics}</h3>
                <ul className="mt-2 space-y-1.5 overflow-hidden text-sm text-ink2">
                  {course.topics.slice(0, 4).map((x) => (
                    <li key={x} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-amber shadow-[0_0_6px_rgb(245_158_59/0.9)]" />
                      <span className="line-clamp-2">{x}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-5 line-clamp-5 text-sm text-ink2">{course.description}</p>
            )}
            <button type="button" onClick={onDetails} aria-haspopup="dialog" className="btn-ghost mt-auto self-start px-5 py-2">
              {t.teaching.details}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
