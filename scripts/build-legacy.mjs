import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const lines = src.split(/\r?\n/);

const keep = (a, b) => lines.slice(a - 1, b).join('\n');

const body = [
  keep(7, 21),
  keep(75, 404),
  keep(619, 1889),
].join('\n\n');

const out = `import { reactive, computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { ArtPiece, BrowserChrome } from '../utils/artworks.mjs';

const reducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: true };

export function metaForRoute(r, C) {
  if (r.name === 'service') {
    const s = C.services.find((x) => x.slug === r.param);
    if (s) return [s.zh + '｜' + s.en + '｜NextEra', s.value];
  }
  if (r.name === 'case') {
    const c = C.cases.find((x) => x.slug === r.param);
    if (c) return [c.title + (c.concept ? '（概念示例）' : '') + '｜NextEra', c.summary];
  }
  const map = { work: C.seo.work, about: C.seo.about, contact: C.seo.contact, media: { title: 'NextEra Media｜商業 Podcast・Blog・影片製作', description: 'NextEra Media 專注商業 Podcast、Blog 及各類影片製作，記錄真實的商業對話。' } };
  if (map[r.name]) return [map[r.name].title, map[r.name].description];
  if (r.name === 'notfound') return ['找不到頁面｜NextEra', C.seo.home.description];
  return [C.seo.home.title, C.seo.home.description];
}

export function registerNextera(vueApp, { C, store }) {
${body.split('\n').map((l) => '  ' + l).join('\n')}

  const pages = {
    PageHome,
    PageService,
    PageWork,
    PageCase,
    PageAbout,
    PageMedia,
    PageContact,
    PageNotFound,
  };

  vueApp.directive('reveal', revealDirective);
  vueApp.component('art-piece', ArtPiece);
  vueApp.component('browser-chrome', BrowserChrome);

  Object.entries(pages).forEach(([name, comp]) => {
    vueApp.component(name, comp);
  });

  return pages;
}
`;

fs.mkdirSync(path.join(root, 'app/lib'), { recursive: true });
fs.writeFileSync(path.join(root, 'app/lib/nextera-legacy.mjs'), out);
console.log('wrote app/lib/nextera-legacy.mjs', out.length);
