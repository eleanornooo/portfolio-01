import { useEffect, useRef, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLang } from '../../i18n/useLang';
import { photoSrc, photoSrcSet } from '../../lib/photos';
import { lockScroll } from '../../lib/smooth';
import { captionOf, type FieldPhoto } from '../../lib/gallery';

/**
 * Full-screen photo viewer on the native <dialog> (the page behind is inert, focus stays
 * inside and returns to the photo that opened it). ← / → step through the photos, Esc
 * closes, a horizontal swipe steps on touch screens. Reduced motion: no slide-in.
 */
export default function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: FieldPhoto[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const { t, pick } = useLang();
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const open = index !== null;
  const n = items.length;
  const step = (d: number) => index !== null && onIndex((index + d + n) % n);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal();
      lockScroll(true);
    } else if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onDialogClose = () => {
      lockScroll(false);
      opener.current?.focus?.();
      onClose();
    };
    d.addEventListener('close', onDialogClose);
    return () => d.removeEventListener('close', onDialogClose);
  }, [onClose]);

  const down = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const up = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) step(dx < 0 ? 1 : -1);
  };

  const item = index !== null ? items[index] : null;

  return (
    <dialog
      ref={ref}
      data-lenis-prevent
      aria-label={t.about.gallery}
      className="lightbox m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-[#f4efe6] backdrop:bg-[rgb(6_7_10/0.92)] backdrop:backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') step(1);
        else if (e.key === 'ArrowLeft') step(-1);
        else if (e.key === 'Tab' && ref.current) {
          // Keep Tab / Shift+Tab inside the viewer.
          const els = [...ref.current.querySelectorAll<HTMLElement>('button')];
          const first = els[0];
          const last = els[els.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }}
    >
      {item && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-4 sm:px-8">
            <p className="num text-sm text-white/60" aria-live="polite">
              {t.about.photoCount(index! + 1, n)}
            </p>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm hover:border-amber"
            >
              {t.common.close}
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-4 sm:px-20"
            onPointerDown={down}
            onPointerUp={up}
            onPointerCancel={() => (swipe.current = null)}
          >
            <figure key={item.photo.id} className="lightbox-in flex max-h-full min-h-0 flex-col items-center">
              <img
                src={photoSrc(item.photo, 1200)}
                srcSet={photoSrcSet(item.photo)}
                sizes="90vw"
                width={item.photo.w}
                height={item.photo.h}
                alt={pick(item.photo.alt)}
                draggable={false}
                className="max-h-[calc(100dvh-11rem)] w-auto max-w-full select-none rounded-2xl object-contain shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)]"
              />
              <figcaption className="mt-4 max-w-[48rem] text-center text-sm text-white/75">{captionOf(item, pick)}</figcaption>
            </figure>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={t.about.prevPhoto}
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/15 bg-black/30 p-3 hover:border-amber sm:block sm:left-6"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={t.about.nextPhoto}
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/15 bg-black/30 p-3 hover:border-amber sm:block sm:right-6"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </div>

          {/* phones: the arrows sit under the photo (and a swipe works too) */}
          <div className="flex justify-center gap-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:hidden">
            <button type="button" onClick={() => step(-1)} aria-label={t.about.prevPhoto} className="rounded-full border border-white/15 p-3">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => step(1)} aria-label={t.about.nextPhoto} className="rounded-full border border-white/15 p-3">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
