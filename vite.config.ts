import { defineConfig, normalizePath } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

import path from 'path';
import { createRequire } from 'node:module';

import { viteStaticCopy } from 'vite-plugin-static-copy';

const require = createRequire(import.meta.url);
const pdfJsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = normalizePath(path.join(pdfJsDistPath, 'cmaps'));
const standardFontsDir = normalizePath(path.join(pdfJsDistPath, 'standard_fonts'));
const workerPath = normalizePath(path.join(pdfJsDistPath, 'build', 'pdf.worker.mjs'));

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    viteStaticCopy({
      targets: [
        { src: cMapsDir, dest: '' },
        { src: standardFontsDir, dest: '' },
        { src: workerPath, dest: 'assets' }, // Copy the worker file to the assets directory
      ],
    }),
  ],
  resolve: {
    alias: {
      // Create an alias for the worker file
      'pdfjs-dist/build/pdf.worker.mjs': path.resolve(
        __dirname,
        'node_modules/pdfjs-dist/build/pdf.worker.mjs'
      ),
    },
  },
});
