// The projection cobe uses internally, reproduced so arcs, labels and the static fallback
// line up exactly with its markers. Derived from cobe's shaders: a point on the unit
// sphere is rotated by J(theta, phi) and drawn on a disc of radius 0.8 × half the canvas.

export type Vec3 = [number, number, number];

const DEG = Math.PI / 180;

/** Location → point on the unit sphere, in cobe's convention. */
export function toVec(lat: number, lon: number): Vec3 {
  const la = lat * DEG;
  const lo = lon * DEG - Math.PI;
  const c = Math.cos(la);
  return [-c * Math.cos(lo), Math.sin(la), c * Math.sin(lo)];
}

/** Rotates a world point into view space (x right, y up, z toward the viewer). */
export function rotate([x, y, z]: Vec3, phi: number, theta: number): Vec3 {
  const c = Math.cos(theta);
  const e = Math.sin(theta);
  const d = Math.cos(phi);
  const f = Math.sin(phi);
  return [d * x + f * z, f * e * x + c * y - d * e * z, -f * c * x + e * y + d * c * z];
}

/** View point → CSS px on a square canvas of side `size`. */
export function toScreen([x, y]: Vec3, size: number): [number, number] {
  const half = size / 2;
  return [half + 0.8 * x * half, half - 0.8 * y * half];
}

/** Rotation that brings a location to the front and centre of the globe. */
export function facing(lat: number, lon: number): { phi: number; theta: number } {
  return { phi: 1.5 * Math.PI - lon * DEG, theta: Math.max(-0.6, Math.min(0.6, lat * DEG * 0.85)) };
}

/** The equivalent of `target` closest to `current` (so the globe takes the short way round). */
export function nearestAngle(current: number, target: number): number {
  const TAU = Math.PI * 2;
  return target + Math.round((current - target) / TAU) * TAU;
}

/** Points along the great circle from a to b, lifted off the surface in the middle. */
export function arc(a: Vec3, b: Vec3, samples = 48, lift = 0.22): Vec3[] {
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  const s = Math.sin(omega) || 1e-6;
  const pts: Vec3[] = [];
  const height = lift * Math.min(1, omega / 1.2) + 0.03;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const k1 = Math.sin((1 - t) * omega) / s;
    const k2 = Math.sin(t * omega) / s;
    const r = 1 + Math.sin(Math.PI * t) * height;
    pts.push([(a[0] * k1 + b[0] * k2) * r, (a[1] * k1 + b[1] * k2) * r, (a[2] * k1 + b[2] * k2) * r]);
  }
  return pts;
}

/** Whether a view-space point is in front of the globe (not hidden behind it). */
export function visible([x, y, z]: Vec3): boolean {
  return z > 0 || x * x + y * y > 1;
}
