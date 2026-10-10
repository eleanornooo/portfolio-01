import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useLang } from '../i18n/useLang';

/**
 * Accessible modal built on the native <dialog> element: the rest of the page becomes
 * inert while it is open (focus stays inside), Esc closes it, clicking the backdrop
 * closes it, and focus returns to the element that opened it.
 */
export default function Dialog({
  open,
  onClose,
  title,
  children,
  className = '',
  variant = 'card',
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: 'card' | 'sheet';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const { t } = useLang();
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal();
      document.documentElement.style.overflow = 'hidden';
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onDialogClose = () => {
      document.documentElement.style.overflow = '';
      opener.current?.focus?.();
      onClose();
    };
    d.addEventListener('close', onDialogClose);
    return () => d.removeEventListener('close', onDialogClose);
  }, [onClose]);

  const sheet = variant === 'sheet';

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      onKeyDown={(e) => {
        // Keep Tab / Shift+Tab cycling inside the dialog.
        if (e.key !== 'Tab' || !ref.current) return;
        const items = [
          ...ref.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }}
      className={
        sheet
          ? `m-0 h-dvh max-h-none w-full max-w-none bg-paper p-0 text-ink backdrop:bg-ink/40 ${className}`
          : `w-[min(40rem,calc(100%-2rem))] max-h-[85dvh] rounded-[4px] border border-rule bg-paper p-0 text-ink shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)] backdrop:bg-ink/40 backdrop:backdrop-blur-[1px] ${className}`
      }
    >
      {open && (
        <div className={sheet ? 'flex h-full flex-col' : 'p-6 sm:p-8'}>
          <div className={`flex items-start justify-between gap-6 ${sheet ? 'page border-b border-rule py-4' : 'mb-5'}`}>
            <h2 id={titleId} className={sheet ? 'label pt-2' : 'font-serif text-h3'}>
              {title}
            </h2>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="-m-2 inline-flex items-center gap-1.5 p-2 text-sm text-ink2 hover:text-accent"
            >
              <span className={sheet ? '' : 'sr-only'}>{t.common.close}</span>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
