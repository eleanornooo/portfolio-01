// Translated copy of content data for the French site: every string goes through `tx`
// (i18n/content-fr.ts), except identifiers, links, dates and names, which are kept as is.
const KEEP = new Set([
  'id',
  'url',
  'href',
  'doi',
  'logo',
  'code',
  'date',
  'endDate',
  'start',
  'end',
  'year',
  'years',
  'lang',
  'type',
  'group',
  'status',
  'kind',
  'cohort',
  'name',
  'credits',
  'budget',
  'refs',
  'authors',
  'materialsUrl',
]);

export function txDeep<T>(value: T, tx: (s: string) => string): T {
  if (typeof value === 'string') return tx(value) as T;
  if (Array.isArray(value)) return value.map((v) => txDeep(v, tx)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = KEEP.has(k) ? v : txDeep(v, tx);
    return out as T;
  }
  return value;
}
