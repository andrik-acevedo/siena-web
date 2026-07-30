import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // Build-time constant governing the legal-document review scaffolding.
  //
  // This MUST be a define, not a plain exported boolean. The counsel-review
  // notes in src/content/legal/counselNotes.ts record open questions about our
  // own legal positions and must never reach a public bundle. A plain
  // `export const X = false` does NOT get the module tree-shaken out — this
  // was tested, and the notes were still present in the minified output.
  // Substituting the identifier at build time does eliminate them.
  //
  // Produce a copy for counsel with:  LEGAL_REVIEW=1 npm run build
  // Never deploy the output of a LEGAL_REVIEW=1 build publicly.
  define: {
    __LEGAL_REVIEW__: JSON.stringify(process.env.LEGAL_REVIEW === '1'),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  }
});