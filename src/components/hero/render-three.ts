// Desktop renderer: glassy 3D spheres linked by thin glowing lines, with signals pulsing
// along them. The backbone (core and research themes) is real glass (MeshPhysicalMaterial
// with transmission) around a glowing ember; the works are smaller clear-coated beads; every
// node carries a soft additive halo. World units are CSS pixels and the camera's view is
// offset so that perspective is centred on the network, exactly like NetworkSim.project()
// (used for hit-testing).
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  LineLoop,
  LineSegments,
  Matrix4,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PMREMGenerator,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { NodeKind } from '../../lib/graph';
import { CAMERA_Z, type NetworkSim } from './network-sim';
import { edgeBase, type NetworkRenderer, type Palette, type RGB } from './palette';

/** Sphere radius per kind, as a fraction of the network radius. */
const RADIUS: Record<NodeKind | 'dust', number> = {
  core: 0.085,
  theme: 0.058,
  project: 0.03,
  publication: 0.024,
  coauthor: 0.026,
  talk: 0.017,
  dust: 0,
};
const isGlass = (k: NodeKind | 'dust') => k === 'core' || k === 'theme';

// Additive glow sprites (halos, dust, signals). Sizes are world px; colours pass through as
// sRGB (the shader skips three's colour pipeline), so they match the site's tokens exactly.
const glowVertex = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uDpr;
  uniform float uCamZ;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uDpr * (uCamZ / -mv.z);
    gl_Position = projectionMatrix * mv;
    vColor = aColor;
    vAlpha = aAlpha;
  }
`;
const glowFragment = /* glsl */ `
  uniform float uCore;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float glow = pow(max(0.0, 1.0 - d), 2.4);
    float core = smoothstep(0.32, 0.18, d) * uCore;
    float a = (glow + core) * vAlpha;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;
const lineVertex = /* glsl */ `
  attribute vec4 aCol;
  varying vec4 vCol;
  void main() {
    vCol = aCol;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const lineFragment = /* glsl */ `
  varying vec4 vCol;
  void main() {
    gl_FragColor = vCol;
  }
`;

function glowMaterial(core: number) {
  return new ShaderMaterial({
    vertexShader: glowVertex,
    fragmentShader: glowFragment,
    uniforms: { uDpr: { value: 1 }, uCamZ: { value: CAMERA_Z }, uCore: { value: core } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}
const lineMaterial = () =>
  new ShaderMaterial({
    vertexShader: lineVertex,
    fragmentShader: lineFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

function glowPoints(count: number, core: number) {
  const geo = new BufferGeometry();
  const pos = new BufferAttribute(new Float32Array(count * 3), 3).setUsage(DynamicDrawUsage);
  const size = new BufferAttribute(new Float32Array(count), 1).setUsage(DynamicDrawUsage);
  const alpha = new BufferAttribute(new Float32Array(count), 1).setUsage(DynamicDrawUsage);
  const color = new BufferAttribute(new Float32Array(count * 3), 3);
  geo.setAttribute('position', pos);
  geo.setAttribute('aSize', size);
  geo.setAttribute('aAlpha', alpha);
  geo.setAttribute('aColor', color);
  const mat = glowMaterial(core);
  const points = new Points(geo, mat);
  points.frustumCulled = false;
  return { points, pos, size, alpha, color, mat };
}

const srgb = (c: RGB) => new Color().setRGB(c[0], c[1], c[2], 'srgb');
const mix = (a: RGB, b: RGB, k: number): RGB => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

export function createThreeRenderer(canvas: HTMLCanvasElement, sim: NetworkSim): NetworkRenderer {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.transmissionResolutionScale = 0.6;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.03).texture;
  scene.environment = env;
  room.dispose();
  pmrem.dispose();

  // A warm key light from the top right and a terracotta fill from below.
  const key = new DirectionalLight(0xffc48a, 2.2);
  key.position.set(0.6, 1, 0.8);
  const fill = new DirectionalLight(0xe2572b, 1.4);
  fill.position.set(-0.8, -0.6, 0.4);
  scene.add(key, fill);

  const camera = new PerspectiveCamera(30, 1, 1, CAMERA_Z * 4);
  camera.position.set(0, 0, CAMERA_Z);

  const n = sim.nodeCount;
  const all = sim.particles.length;
  const E = sim.edges.length;
  const S = sim.signals.length;
  const glassIdx: number[] = [];
  const beadIdx: number[] = [];
  for (let i = 0; i < n; i++) (isGlass(sim.particles[i].kind) ? glassIdx : beadIdx).push(i);

  // ---- spheres
  const sphere = new SphereGeometry(1, 48, 32);
  const small = new SphereGeometry(1, 24, 16);
  const glassMat = new MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.05,
    transmission: 1,
    thickness: 40,
    ior: 1.45,
    attenuationColor: new Color('#f59e3b'),
    attenuationDistance: 90,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: 0.4,
    iridescenceIOR: 1.25,
    envMapIntensity: 1.4,
  });
  const glass = new InstancedMesh(sphere, glassMat, glassIdx.length);
  const ember = new InstancedMesh(small, new MeshBasicMaterial({ toneMapped: false }), glassIdx.length);
  const beadMat = new MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.05,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.1,
    sheen: 0.4,
    sheenColor: new Color('#f59e3b'),
  });
  const beads = new InstancedMesh(small, beadMat, beadIdx.length);
  for (const m of [glass, ember, beads]) {
    m.frustumCulled = false;
    m.instanceMatrix.setUsage(DynamicDrawUsage);
  }
  beads.instanceColor = new InstancedBufferAttribute(new Float32Array(beadIdx.length * 3), 3).setUsage(DynamicDrawUsage);
  ember.instanceColor = new InstancedBufferAttribute(new Float32Array(glassIdx.length * 3), 3);

  // ---- halos (one per node), dust (one per citation), signals
  const halo = glowPoints(n, 0);
  const dust = glowPoints(all - n, 0.9);
  const sig = glowPoints(S, 1);

  // ---- edges and the zellige star outline
  const edgeGeo = new BufferGeometry();
  const edgePos = new BufferAttribute(new Float32Array(E * 6), 3).setUsage(DynamicDrawUsage);
  const edgeCol = new BufferAttribute(new Float32Array(E * 8), 4).setUsage(DynamicDrawUsage);
  edgeGeo.setAttribute('position', edgePos);
  edgeGeo.setAttribute('aCol', edgeCol);
  const edges = new LineSegments(edgeGeo, lineMaterial());
  edges.frustumCulled = false;

  const starGeo = new BufferGeometry();
  const starPos = new BufferAttribute(new Float32Array(16 * 3), 3);
  const starCol = new BufferAttribute(new Float32Array(16 * 4), 4);
  starGeo.setAttribute('position', starPos);
  starGeo.setAttribute('aCol', starCol);
  const star = new LineLoop(starGeo, lineMaterial());
  star.frustumCulled = false;

  scene.add(edges, star, dust.points, glass, ember, beads, halo.points, sig.points);

  let palette: Palette | null = null;
  let kindRGB: Record<string, RGB> = {};
  let haloRGB: Record<string, RGB> = {};
  let width = 1;
  let height = 1;
  const m4 = new Matrix4();
  const tmp = new Color();

  return {
    resize(w, h, dpr) {
      width = w;
      height = h;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      for (const g of [halo, dust, sig]) g.mat.uniforms.uDpr.value = dpr;
    },
    setPalette(p) {
      palette = p;
      const dim = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k];
      // Bead body colours (lit by the environment) and halo colours, per kind.
      kindRGB = {
        project: dim(p.vivid, 0.55),
        publication: [0.2, 0.15, 0.12],
        coauthor: dim(p.amber, 0.6),
        talk: [0.16, 0.16, 0.19],
      };
      haloRGB = {
        core: p.vivid,
        theme: p.amber,
        project: p.vivid,
        publication: p.amber,
        coauthor: p.amber,
        talk: p.ink3,
      };
      glassIdx.forEach((i, k) => {
        tmp.copy(srgb(sim.particles[i].kind === 'core' ? p.vivid : p.amber)).multiplyScalar(1.6);
        ember.setColorAt(k, tmp);
      });
      ember.instanceColor!.needsUpdate = true;
      for (let i = 0; i < n; i++) halo.color.array.set(haloRGB[sim.particles[i].kind] ?? p.amber, i * 3);
      halo.color.needsUpdate = true;
      for (let i = 0; i < all - n; i++) dust.color.array.set(mix(p.ink3, p.amber, 0.35), i * 3);
      dust.color.needsUpdate = true;
      for (let s = 0; s < S; s++) sig.color.array.set(mix(p.amber, [1, 1, 1], 0.25), s * 3);
      sig.color.needsUpdate = true;
    },
    render(sim, cx, cy, scale) {
      if (!palette) return;
      // Off-axis view: the projection centre is the network centre (cx, cy).
      const fullW = width * 3;
      const fullH = height * 3;
      camera.fov = (2 * Math.atan(fullH / 2 / CAMERA_Z) * 180) / Math.PI;
      camera.aspect = fullW / fullH;
      camera.setViewOffset(fullW, fullH, fullW / 2 - cx, fullH / 2 - cy, width, height);
      camera.updateProjectionMatrix();

      const v = sim.view;
      const at = (i: number, c: number) => v[i * 3 + c] * scale;
      const radius = (i: number) => {
        const part = sim.particles[i];
        const grow = 1 + sim.flash[i] * 0.22 + (i === sim.hovered ? 0.3 : 0);
        // On the star the spheres are small beads; they swell as they reach their place.
        return RADIUS[part.kind] * scale * grow * (0.45 + 0.55 * sim.progress[i]);
      };

      glassIdx.forEach((i, k) => {
        const r = radius(i);
        m4.makeScale(r, r, r).setPosition(at(i, 0), at(i, 1), at(i, 2));
        glass.setMatrixAt(k, m4);
        const e = r * (0.36 + sim.flash[i] * 0.12);
        m4.makeScale(e, e, e).setPosition(at(i, 0), at(i, 1), at(i, 2));
        ember.setMatrixAt(k, m4);
      });
      glass.instanceMatrix.needsUpdate = ember.instanceMatrix.needsUpdate = true;

      beadIdx.forEach((i, k) => {
        const r = radius(i);
        m4.makeScale(r, r, r).setPosition(at(i, 0), at(i, 1), at(i, 2));
        beads.setMatrixAt(k, m4);
        const base = kindRGB[sim.particles[i].kind] ?? kindRGB.publication;
        const hot = Math.max(sim.flash[i], i === sim.hovered ? 1 : 0);
        const c = mix(base, palette!.amber, hot * 0.85);
        beads.setColorAt(k, tmp.setRGB(c[0], c[1], c[2], 'srgb'));
      });
      beads.instanceMatrix.needsUpdate = true;
      beads.instanceColor!.needsUpdate = true;

      const hp = halo.pos.array as Float32Array;
      for (let i = 0; i < n; i++) {
        hp[i * 3] = at(i, 0);
        hp[i * 3 + 1] = at(i, 1);
        hp[i * 3 + 2] = at(i, 2);
        const glassy = isGlass(sim.particles[i].kind);
        halo.size.array[i] = radius(i) * (glassy ? 5.5 : 6.5);
        const hot = Math.max(sim.flash[i], i === sim.hovered ? 1 : 0);
        halo.alpha.array[i] = (glassy ? 0.42 : 0.2) * (0.5 + 0.5 * sim.progress[i]) * (1 + hot * 1.4);
      }
      halo.pos.needsUpdate = halo.size.needsUpdate = halo.alpha.needsUpdate = true;

      const dp = dust.pos.array as Float32Array;
      for (let i = n; i < all; i++) {
        const k = i - n;
        dp[k * 3] = at(i, 0);
        dp[k * 3 + 1] = at(i, 1);
        dp[k * 3 + 2] = at(i, 2);
        dust.size.array[k] = 7;
        dust.alpha.array[k] = 0.32 * (0.6 + 0.4 * sim.progress[i]);
      }
      dust.pos.needsUpdate = dust.size.needsUpdate = dust.alpha.needsUpdate = true;

      const ep = edgePos.array as Float32Array;
      const ec = edgeCol.array as Float32Array;
      for (let e = 0; e < E; e++) {
        const [a, b] = sim.edges[e];
        for (let c = 0; c < 3; c++) {
          ep[e * 6 + c] = at(a, c);
          ep[e * 6 + 3 + c] = at(b, c);
        }
        const hot = sim.hovered >= 0 && sim.isConnected(e, sim.hovered);
        const col = hot ? palette.amber : mix(palette.amber, palette.vivid, 0.4);
        const alpha = sim.edgeAlpha[e] * (hot ? 0.95 : edgeBase(sim, e) * 0.8);
        for (const k of [0, 4]) {
          ec[e * 8 + k] = col[0];
          ec[e * 8 + k + 1] = col[1];
          ec[e * 8 + k + 2] = col[2];
          ec[e * 8 + k + 3] = alpha;
        }
      }
      edgePos.needsUpdate = edgeCol.needsUpdate = true;

      const starAlpha = Math.max(0, 1 - sim.formed * 1.6) * 0.7;
      star.visible = starAlpha > 0.001;
      if (star.visible) {
        sim.star.forEach(([x, y], i) => {
          starPos.setXYZ(i, x * scale, y * scale, 0);
          starCol.setXYZW(i, palette!.amber[0], palette!.amber[1], palette!.amber[2], starAlpha);
        });
        starPos.needsUpdate = starCol.needsUpdate = true;
      }

      const sp = sig.pos.array as Float32Array;
      for (let s = 0; s < S; s++) {
        sp[s * 3] = sim.signalPos[s * 3] * scale;
        sp[s * 3 + 1] = sim.signalPos[s * 3 + 1] * scale;
        sp[s * 3 + 2] = sim.signalPos[s * 3 + 2] * scale;
        sig.size.array[s] = 26;
        sig.alpha.array[s] = sim.signalAlpha[s];
      }
      sig.pos.needsUpdate = sig.size.needsUpdate = sig.alpha.needsUpdate = true;

      renderer.render(scene, camera);
    },
    dispose() {
      for (const o of [halo.points, dust.points, sig.points, edges, star]) {
        o.geometry.dispose();
        (o.material as ShaderMaterial).dispose();
      }
      for (const m of [glass, ember, beads]) {
        m.dispose();
        (m.material as MeshPhysicalMaterial).dispose();
      }
      sphere.dispose();
      small.dispose();
      env.dispose();
      renderer.dispose();
    },
  };
}
