/**
 * Institution logo on a small white tile (the source logos are grey on white). It lights up
 * with an amber glow when its card (a `.group`) is hovered or focused.
 */
export default function Logo({ name, className = 'h-11 w-11' }: { name?: string; className?: string }) {
  if (!name) return null;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 opacity-80 ring-1 ring-ink/10 transition-[opacity,box-shadow] duration-500 group-hover:opacity-100 group-hover:shadow-[0_0_0_1px_rgb(245_158_59/0.65),0_0_26px_2px_rgb(245_158_59/0.5)] group-focus-within:opacity-100 ${className}`}
    >
      <img src={`/img/logos/${name}.webp`} width={96} height={96} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
    </span>
  );
}
