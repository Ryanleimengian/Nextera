import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
let s = fs.readFileSync(path.join(root, 'assets/js/artworks.js'), 'utf8');
s = s.replace(/^\(function \(\) \{\r?\n/, '');
s = s.replace(
  /\r?\n  window\.NEXTERA_ART = \{ ArtPiece, ART_LABELS, PhoneFrame, BrowserChrome, FoodMotif \};\r?\n\}\)\(\);\r?\n?$/,
  '\nexport { ArtPiece, ART_LABELS, PhoneFrame, BrowserChrome, FoodMotif };\n',
);
fs.writeFileSync(path.join(root, 'app/utils/artworks.mjs'), s, 'utf8');
