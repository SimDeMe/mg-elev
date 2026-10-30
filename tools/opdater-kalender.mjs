// Henter skolekalenderens data fra smbi og gemmer den som assets/kalender-data.js.
// smbi's data.js er et ES-modul, som ikke kan indlæses via file://. Derfor pakkes
// det ind, så det lægger sig på window.MG_KALENDER.
//
// Brug:  node tools/opdater-kalender.mjs                (henter fra smbi.dk)
//        node tools/opdater-kalender.mjs ../smbi/skolekalender/data.js
import { readFile, writeFile } from 'node:fs/promises';

const kilde = process.argv[2] || 'https://smbi.dk/skolekalender/data.js';
const tekst = kilde.startsWith('http')
  ? await (await fetch(kilde)).text()
  : await readFile(kilde, 'utf8');

const navne = [...tekst.matchAll(/^export const (\w+)/gm)].map(m => m[1]);
if (!navne.includes('BEGIVENHEDER')) throw new Error('Fandt ikke BEGIVENHEDER i ' + kilde);

const ud =
  '// GENERERET af tools/opdater-kalender.mjs – ret ikke her, men i smbi/skolekalender/data.js.\n' +
  '// Kilde: ' + kilde + '\n' +
  'window.MG_KALENDER = (function () {\n' +
  tekst.replace(/^export const /gm, 'const ') +
  '\nreturn { ' + navne.join(', ') + ' };\n})();\n';

const maal = new URL('../assets/kalender-data.js', import.meta.url);
await writeFile(maal, ud);
console.log('Skrev', maal.pathname, '–', navne.join(', '));
