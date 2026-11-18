// Vite config for a short whose cast uses the puppet engine (Ricks Clips characters or our characters on the Ricks
// Clips look). Copy to projects/<story>/vite.config.mjs and set the port. It maps /vendor/rc/* to the Ricks Clips kit
// (newZip, personal-use licence: keep the repo private), lets the dev server read it, and builds for modern Chrome.
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const RC = process.env.RC_TEMPLATES || fileURLToPath(new URL('../../newZip/RicksClips_Skill_V1.1/templates', import.meta.url));

export default defineConfig({
  resolve: { alias: [{ find: /^\/vendor\/rc\/(.*)$/, replacement: RC.replace(/\\/g, '/') + '/$1' }] },
  server: { host: '127.0.0.1', port: 5199, strictPort: true, fs: { allow: ['.', '../..', RC] } },
  build: { target: 'esnext' },
});
