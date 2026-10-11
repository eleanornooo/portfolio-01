import type { ProjectStatus } from '../content/types';
import type { Timing } from '../lib/dates';
import { useLang } from '../i18n/useLang';

export function StatusTag({ status }: { status: ProjectStatus }) {
  const { t } = useLang();
  const tone =
    status === 'Active' ? 'text-accent' : status === 'Pending' ? 'border-dashed text-ink2' : 'text-ink3';
  return <span className={`tag ${tone}`}>{t.status[status]}</span>;
}

/** "Upcoming" / "Now" tag; renders nothing for past items. */
export function TimingTag({ timing }: { timing: Timing }) {
  const { t } = useLang();
  if (timing === 'past') return null;
  return (
    <span className="badge-glow inline-flex items-center rounded-full bg-amber px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase leading-4 tracking-[0.14em] text-[#160b05]">
      {timing === 'upcoming' ? t.common.upcoming : t.common.ongoing}
    </span>
  );
}

export function KindTag({ children }: { children: string }) {
  return <span className="tag text-ink3">{children}</span>;
}
