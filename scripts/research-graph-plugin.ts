// Vite plugin: runs the hero network's force layout once at build time (and on content
// changes in dev) and serves the result as `virtual:research-graph`. The browser then
// only reads 165 numbers instead of running ~45 ms of physics during hydration.
import { build } from 'esbuild';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import type { Plugin } from 'vite';

const ID = 'virtual:research-graph';
const RESOLVED = `\0${ID}`;

export default function researchGraph(): Plugin {
  const root = process.cwd();
  return {
    name: 'research-graph',
    resolveId: (id) => (id === ID ? RESOLVED : null),
    async load(id) {
      if (id !== RESOLVED) return null;
      const out = await build({
        entryPoints: [path.join(root, 'src/lib/graph.ts')],
        bundle: true,
        write: false,
        platform: 'node',
        format: 'esm',
        define: { __BUILD_TIME__: '0' },
        metafile: true,
        logLevel: 'silent',
        plugins: [
          {
            name: 'empty-layout',
            setup(b) {
              b.onResolve({ filter: /^virtual:research-graph$/ }, () => ({ path: ID, namespace: 'v' }));
              b.onLoad({ filter: /.*/, namespace: 'v' }, () => ({ contents: 'export const positions = [];', loader: 'js' }));
            },
          },
        ],
      });
      for (const input of Object.keys(out.metafile.inputs)) {
        if (!input.startsWith('v:')) this.addWatchFile(path.resolve(root, input));
      }
      const dir = path.join(root, 'node_modules', '.research-graph');
      await mkdir(dir, { recursive: true });
      const file = path.join(dir, `graph-${Date.now()}.mjs`);
      await writeFile(file, out.outputFiles[0].text);
      const mod = await import(pathToFileURL(file).href);
      await rm(file, { force: true });
      const positions: Float32Array = mod.layoutGraph(mod.buildGraph());
      const nums = Array.from(positions, (v) => Math.round(v * 1e4) / 1e4);
      return `export const positions = ${JSON.stringify(nums)};`;
    },
  };
}
