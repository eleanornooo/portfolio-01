// Desktop renderer: three.js points with a soft glow shader, hairline edges and signals.
// World units are CSS pixels and the camera's view is offset so that perspective is
// centred on the network, exactly like NetworkSim.project() (used for hit-testing).
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  ColorManagement,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  LinearSRGBColorSpace,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { CAMERA_Z, type NetworkSim } from './network-sim';
import { edgeBase, kindAlpha, kindColor, type NetworkRenderer, type Palette } from './palette';

ColorManagement.enabled = false; // colours are the site's sRGB tokens, passed through as-is

const vertex = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uDpr;
  uniform float uCamZ;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * 2.8 * uDpr * (uCamZ / -mv.z);
    gl_Position = projectionMatrix * mv;
    vColor = aColor;
    vAlpha = aAlpha;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float core = smoothstep(0.38, 0.3, d);
    float glow = pow(max(0.0, 1.0 - d), 2.2) * 0.42;
    float a = (core + glow) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

function pointsMaterial(dpr: number, additive = false) {
  return new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: { uDpr: { value: dpr }, uCamZ: { value: CAMERA_Z } },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: additive ? AdditiveBlending : NormalBlending,
  });
}

export function createThreeRenderer(canvas: HTMLCanvasElement, sim: NetworkSim): NetworkRenderer {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 1, CAMERA_Z * 4);
  camera.position.set(0, 0, CAMERA_Z);

  const n = sim.particles.length;
  const E = sim.edges.length;
  const S = sim.signals.length;

  // ---- nodes
  const nodeGeo = new BufferGeometry();
  const nodePos = new BufferAttribute(new Float32Array(n * 3), 3);
  const nodeSize = new BufferAttribute(new Float32Array(n), 1);
  const nodeAlpha = new BufferAttribute(new Float32Array(n), 1);
  const nodeColor = new BufferAttribute(new Float32Array(n * 3), 3);
  nodeGeo.setAttribute('position', nodePos);
  nodeGeo.setAttribute('aSize', nodeSize);
  nodeGeo.setAttribute('aAlpha', nodeAlpha);
  nodeGeo.setAttribute('aColor', nodeColor);
  const nodeMat = pointsMaterial(1);
  const nodes = new Points(nodeGeo, nodeMat);
  nodes.frustumCulled = false;

  // ---- edges (vertex alpha via 4-component colours)
  const edgeGeo = new BufferGeometry();
  const edgePos = new BufferAttribute(new Float32Array(E * 6), 3);
  const edgeCol = new BufferAttribute(new Float32Array(E * 8), 4);
  edgeGeo.setAttribute('position', edgePos);
  edgeGeo.setAttribute('color', edgeCol);
  const edges = new LineSegments(edgeGeo, new LineBasicMaterial({ vertexColors: true, transparent: true, depthTest: false }));
  edges.frustumCulled = false;

  // ---- star outline (the zellige starting state)
  const starGeo = new BufferGeometry();
  starGeo.setAttribute('position', new BufferAttribute(new Float32Array(16 * 3), 3));
  const starMat = new LineBasicMaterial({ transparent: true, depthTest: false });
  const star = new LineLoop(starGeo, starMat);
  star.frustumCulled = false;

  // ---- signals
  const sigGeo = new BufferGeometry();
  const sigPos = new BufferAttribute(new Float32Array(S * 3), 3);
  const sigAlpha = new BufferAttribute(new Float32Array(S), 1);
  const sigColor = new BufferAttribute(new Float32Array(S * 3), 3);
  sigGeo.setAttribute('position', sigPos);
  sigGeo.setAttribute('aSize', new BufferAttribute(new Float32Array(S).fill(5.5), 1));
  sigGeo.setAttribute('aAlpha', sigAlpha);
  sigGeo.setAttribute('aColor', sigColor);
  const sigMat = pointsMaterial(1);
  const signals = new Points(sigGeo, sigMat);
  signals.frustumCulled = false;

  scene.add(star, edges, nodes, signals);

  let palette: Palette | null = null;
  let width = 1;
  let height = 1;

  return {
    resize(w, h, dpr) {
      width = w;
      height = h;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      nodeMat.uniforms.uDpr.value = dpr;
      sigMat.uniforms.uDpr.value = dpr;
    },
    setPalette(p) {
      palette = p;
      sim.particles.forEach((part, i) => nodeColor.array.set(kindColor(part.kind, p), i * 3));
      nodeColor.needsUpdate = true;
      for (let s = 0; s < S; s++) sigColor.array.set(p.vivid, s * 3);
      sigColor.needsUpdate = true;
      starMat.color.setRGB(...p.accent);
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
      const pos = nodePos.array as Float32Array;
      for (let i = 0; i < n; i++) {
        pos[i * 3] = v[i * 3] * scale;
        pos[i * 3 + 1] = v[i * 3 + 1] * scale;
        pos[i * 3 + 2] = v[i * 3 + 2] * scale;
        const part = sim.particles[i];
        const hover = i === sim.hovered ? 1.55 : 1;
        nodeSize.array[i] = part.size * (1 + sim.flash[i] * 0.55) * hover;
        nodeAlpha.array[i] = kindAlpha(part.kind) * (0.55 + 0.45 * sim.progress[i]);
      }
      nodePos.needsUpdate = nodeSize.needsUpdate = nodeAlpha.needsUpdate = true;

      const ep = edgePos.array as Float32Array;
      const ec = edgeCol.array as Float32Array;
      for (let e = 0; e < E; e++) {
        const [a, b] = sim.edges[e];
        ep.set(pos.subarray(a * 3, a * 3 + 3), e * 6);
        ep.set(pos.subarray(b * 3, b * 3 + 3), e * 6 + 3);
        const hot = sim.hovered >= 0 && sim.isConnected(e, sim.hovered);
        const col = hot ? palette.accent : palette.ink;
        const alpha = sim.edgeAlpha[e] * (hot ? 0.8 : edgeBase(sim, e));
        for (const k of [0, 4]) {
          ec[e * 8 + k] = col[0];
          ec[e * 8 + k + 1] = col[1];
          ec[e * 8 + k + 2] = col[2];
          ec[e * 8 + k + 3] = alpha;
        }
      }
      edgePos.needsUpdate = edgeCol.needsUpdate = true;

      const sp = starGeo.getAttribute('position') as BufferAttribute;
      sim.star.forEach(([x, y], i) => sp.setXYZ(i, x * scale, y * scale, 0));
      sp.needsUpdate = true;
      starMat.opacity = Math.max(0, 1 - sim.formed * 1.6) * 0.5;
      star.visible = starMat.opacity > 0.001;

      const sg = sigPos.array as Float32Array;
      for (let s = 0; s < S; s++) {
        sg[s * 3] = sim.signalPos[s * 3] * scale;
        sg[s * 3 + 1] = sim.signalPos[s * 3 + 1] * scale;
        sg[s * 3 + 2] = sim.signalPos[s * 3 + 2] * scale;
        sigAlpha.array[s] = sim.signalAlpha[s];
      }
      sigPos.needsUpdate = sigAlpha.needsUpdate = true;

      renderer.render(scene, camera);
    },
    dispose() {
      for (const o of [nodes, edges, star, signals]) {
        o.geometry.dispose();
        (o.material as ShaderMaterial).dispose();
      }
      renderer.dispose();
    },
  };
}
