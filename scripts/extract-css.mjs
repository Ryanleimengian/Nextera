import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const h = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const m = h.match(/<style type="text\/tailwindcss">([\s\S]*?)<\/style>\s*<style>([\s\S]*?)<\/style>/);
const css = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n${m[1]}\n${m[2]}`;
fs.writeFileSync(path.join(root, 'app/assets/css/nextera.css'), css, 'utf8');
