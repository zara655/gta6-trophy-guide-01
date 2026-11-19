// Leonida Trophy Guide & Tracker — entry program (Node 22, standard library only).
//
// The guide itself is the app/ folder: plain static files (index.html, style.css,
// app.js, data/trophies.json) that a browser opens with no build step and no
// network access. This program hands the entry in: it copies app/ and
// screenshots/ from beside this file into the output directory and writes
// dossier.json with the vendored make.fun library, so the dossier is byte for
// byte what the scorer's own copy produces.
//
// Run it:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Preview: node serve.ts  (then open http://localhost:8080)

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log('dossier written to ' + join(out, 'dossier.json'));
