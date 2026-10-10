import type { ProjectStatus } from '../content/types';
import type { Timing } from '../lib/dates';
import { useLang } from '../i18n/useLang';

export function StatusTag({ status }: { status: ProjectStatus }) {
  const { t } = useLang();
  const tone =
    status === 'Active' ? 'text-accent' : status === 'Pending' ? 'text-ink2 border-dashed' : 'text-ink3';
  return <span className={`tag ${tone}`}>{t.status[status]}</span>;
}

/** "Upcoming" / "Now" tag; renders nothing for past items. */
export function TimingTag({ timing }: { timing: Timing }) {
  const { t } = useLang();
  if (timing === 'past') return null;
  return (
    <span className="tag border-accent bg-accent text-paper">
      {timing === 'upcoming' ? t.common.upcoming : t.common.ongoing}
    </span>
  );
}

export function KindTag({ children }: { children: string }) {
  return <span className="tag text-ink3">{children}</span>;
}
