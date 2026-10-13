import { useCallback, useRef, useState } from 'react';
import { Expand } from 'lucide-react';
import { useLang } from '../../i18n/useLang';
import { captionOf, fieldColumns, fieldPhotos } from '../../lib/gallery';
import { useGsap } from '../../lib/gsap';
import { photoSrc, photoSrcSet } from '../../lib/photos';
import Lightbox from './Lightbox';

/** Each desktop column drifts at its own pace while the section scrolls by (px over the pass). */
const DRIFT = [-36, 44, -14];

/**
 * "In the field": an asymmetric masonry of event and teaching photos. Desktop: three columns
 * of unequal width, the middle one set lower, each drifting at its own speed (light
 * parallax, GSAP scrub; off with reduced motion). Phones: two plain columns. Every photo
 * opens the lightbox.
 */
export default function FieldGallery() {
  const { t, pick } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);

  useGsap(
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('.field-col').forEach((col, i) =>
          gsap.fromTo(
            col,
            { y: -DRIFT[i] / 2 },
            {
              y: DRIFT[i] / 2,
              ease: 'none',
              scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          ),
        );
      });
    },
    root,
  );

  return (
    <>
      <div ref={root} className="columns-2 gap-3 md:grid md:grid-cols-[1.08fr_0.92fr_1fr] md:items-start md:gap-6">
        {fieldColumns.map((col, c) => (
          <div key={c} className={`field-col contents md:flex md:flex-col md:gap-6 ${c === 1 ? 'md:pt-28' : c === 2 ? 'md:pt-10' : ''}`}>
            {col.map((i) => {
              const p = fieldPhotos[i];
              return (
                <figure key={p.photo.id} className="mb-3 break-inside-avoid md:mb-0">
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    aria-haspopup="dialog"
                    aria-label={`${t.about.openPhoto}: ${captionOf(p, pick)}`}
                    className="group relative block w-full overflow-hidden rounded-2xl md:rounded-3xl"
                  >
                    <img
                      src={photoSrc(p.photo)}
                      srcSet={photoSrcSet(p.photo)}
                      sizes="(min-width: 768px) 32vw, 50vw"
                      width={p.photo.w}
                      height={p.photo.h}
                      alt={pick(p.photo.alt)}
                      loading="lazy"
                      decoding="async"
                      className="h-auto w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <Expand
                      size={18}
                      aria-hidden="true"
                      className="absolute right-3 top-3 text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </button>
                  <figcaption className="mt-2 text-[0.8125rem] leading-snug text-ink3">{captionOf(p, pick)}</figcaption>
                </figure>
              );
            })}
          </div>
        ))}
      </div>
      <Lightbox items={fieldPhotos} index={open} onIndex={setOpen} onClose={close} />
    </>
  );
}
