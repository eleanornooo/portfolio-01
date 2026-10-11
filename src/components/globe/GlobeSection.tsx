import { lazy, Suspense, useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { places as allPlaces, type Place } from '../../lib/places';
import { isLiteDevice, prefersReducedMotion, whenNear } from '../../lib/motion';
import { useLang } from '../../i18n/useLang';
import { arc, facing, rotate, toScreen, toVec, visible } from './globe-math';
import MaskText from '../MaskText';

const GlobeCanvas = lazy(() => import('./GlobeCanvas'));

const START = facing(40, -38);

/** Vector stand-in (graticule, arcs, places) shown before the WebGL globe loads, or without it. */
function GlobeFallback({ places, className = '' }: { places: Place[]; className?: string }) {
  const S = 100;
  const home = places.find((p) => p.home)!;
  const path = (pts: ReturnType<typeof arc>) => {
    let d = '';
    let pen = false;
    for (const p of pts) {
      const v = rotate(p, START.phi, START.theta);
      if (!visible(v)) {
        pen = false;
        continue;
      }
      const [x, y] = toScreen(v, S);
      d += `${pen ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
      pen = true;
    }
    return d;
  };
  const meridians = Array.from({ length: 12 }, (_, i) => i * 30 - 180).map((lon) =>
    path(Array.from({ length: 37 }, (_, k) => toVec(k * 5 - 90, lon))),
  );
  const parallels = [-60, -30, 0, 30, 60].map((lat) => path(Array.from({ length: 73 }, (_, k) => toVec(lat, k * 5 - 180))));
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className={className} aria-hidden="true" focusable="false">
      <circle cx={50} cy={50} r={40} className="fill-paper2 stroke-amber/30" strokeWidth={0.3} />
      <g fill="none" className="stroke-rule" strokeWidth={0.25}>
        {[...meridians, ...parallels].map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g fill="none" className="stroke-amber/60" strokeWidth={0.35} strokeDasharray="1 1.2">
        {places
          .filter((p) => p !== home)
          .map((p) => (
            <path key={p.id} d={path(arc(toVec(home.lat, home.lon), toVec(p.lat, p.lon)))} />
          ))}
      </g>
      {places.map((p) => {
        const v = rotate(toVec(p.lat, p.lon), START.phi, START.theta);
        if (v[2] <= 0) return null;
        const [x, y] = toScreen(v, S);
        return <circle key={p.id} cx={x.toFixed(2)} cy={y.toFixed(2)} r={p.home ? 1.4 : 1} className="fill-amber" />;
      })}
    </svg>
  );
}

export default function GlobeSection({ index }: { index: string }) {
  const { t, pick } = useLang();
  const places = allPlaces();
  const root = useRef<HTMLElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [env, setEnv] = useState({ reduced: false, lite: false });
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const detailsId = useId();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    setEnv({ reduced: prefersReducedMotion(), lite: isLiteDevice() });
    return whenNear(el, () => setLoad(true), '500px');
  }, []);

  const focusId = hover ?? selected;
  const current = places.find((p) => p.id === selected);
  const kinds = t.world.kinds;

  return (
    <section ref={root} id="world" aria-labelledby="world-title" className="tone-dark relative overflow-hidden pb-20 pt-12 md:pb-28 md:pt-16">
      {/* deep glow behind the globe */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_50%_at_30%_58%,rgb(226_87_43/0.22),transparent_70%),radial-gradient(30%_30%_at_75%_30%,rgb(245_158_59/0.08),transparent_70%)]"
      />
      <div className="page relative">
      <div className="grid-12 gap-y-6">
        <p className="eyebrow num col-span-4 md:col-span-3 md:pt-4">
          <span className="text-amber" aria-hidden="true">
            {index} ·{' '}
          </span>
          {t.world.label}
        </p>
        <div className="col-span-4 md:col-span-9">
          <h2 id="world-title" data-reveal="mask" className="display text-big">
            <MaskText lines={[t.world.title]} />
          </h2>
          <p data-reveal="up" className="prose-measure mt-6 text-lead text-ink2">
            {t.world.intro}
          </p>
        </div>
      </div>

      <div className="mt-10 grid items-center gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="relative mx-auto aspect-square w-full max-w-[36rem]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[6%] rounded-full shadow-[0_0_120px_30px_rgb(226_87_43/0.22),inset_0_0_60px_rgb(245_158_59/0.12)]"
          />
          <GlobeFallback
            places={places}
            className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
          />
          {load && (
            <Suspense fallback={null}>
              <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
                <GlobeCanvas
                  places={places}
                  focusId={focusId}
                  reduced={env.reduced}
                  lite={env.lite}
                  onReady={() => setReady(true)}
                />
              </div>
            </Suspense>
          )}
          <p className="absolute bottom-0 left-0 text-sm text-ink3" aria-hidden="true">
            {t.world.drag}
          </p>
        </div>

        <div data-reveal="up" className="glass rounded-[1.75rem] p-3 md:p-4">
          <ul className="divide-y divide-ink/10" onMouseLeave={() => setHover(null)}>
            {places.map((p) => {
              const on = p.id === selected;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={detailsId}
                    onMouseEnter={() => setHover(p.id)}
                    onFocus={() => setHover(p.id)}
                    onBlur={() => setHover(null)}
                    onClick={() => {
                      setSelected(on ? null : p.id);
                      setAll(false);
                    }}
                    className={`group grid w-full grid-cols-[1fr_auto] items-baseline gap-x-4 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-ink/[0.06] ${
                      on ? 'bg-ink/[0.08]' : ''
                    }`}
                  >
                    <span>
                      <span
                        className={`block font-serif text-[1.1875rem] leading-snug transition-colors group-hover:text-accent ${on ? 'text-accent' : ''}`}
                      >
                        {p.name}
                        {p.home && <span className="eyebrow ml-2 align-middle text-[0.625rem] text-amber">{t.world.home}</span>}
                      </span>
                      <span className="text-sm text-ink3">{pick(p.country)}</span>
                    </span>
                    <span className="num text-sm text-ink3">{t.world.items(p.items.length)}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div id={detailsId} aria-live="polite" className="mt-4 min-h-[9rem] px-3 pb-2">
            {current ? (
              <div key={current.id} className="place-details">
                <h3 className="eyebrow mb-3 font-sans text-amber">
                  {current.name} · {pick(current.country)}
                </h3>
                <ul className="space-y-2.5">
                  {(all ? current.items : current.items.slice(0, 6)).map((it, i) => (
                    <li
                      key={i}
                      className="grid grid-cols-[4.5rem_1fr] gap-x-3 text-sm"
                      style={{ '--i': i } as CSSProperties}
                    >
                      <span className="num text-ink3">{it.meta}</span>
                      <span>
                        <span className="label mr-2 text-[0.625rem]">{kinds[it.kind]}</span>
                        {it.href ? (
                          <Link to={it.href} className="link-quiet">
                            {it.title}
                          </Link>
                        ) : (
                          it.title
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                {current.items.length > 6 && !all && (
                  <p className="mt-3 text-sm">
                    <button type="button" className="link inline-flex items-center gap-1.5" onClick={() => setAll(true)}>
                      {t.world.more(current.items.length - 6)} <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-ink3">{t.world.select}</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
