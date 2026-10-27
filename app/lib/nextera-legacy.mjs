import * as Vue from 'vue';
import { reactive, computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { compile } from '@vue/compiler-dom';
import { ArtPiece, ART_COMPONENTS, BrowserChrome, PhoneFrame, FoodMotif } from '../utils/artworks.mjs';

const reducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: true };

/** Production 為 runtime-only Vue：就地編譯 template → render，讓所有引用共用同一物件。 */
function compileOptionsComponent(comp, seen = new WeakSet()) {
  if (!comp || typeof comp !== 'object') return comp;
  if (seen.has(comp)) return comp;
  seen.add(comp);

  if (comp.components) {
    for (const name of Object.keys(comp.components)) {
      comp.components[name] = compileOptionsComponent(comp.components[name], seen);
    }
  }
  if (typeof comp.template === 'string' && !comp.render) {
    const { code } = compile(comp.template, { mode: 'function', hoistStatic: true });
    comp.render = new Function('Vue', code)(Vue);
    delete comp.template;
  }
  return comp;
}

export function metaForRoute(r, C) {
  if (r.name === 'service') {
    const s = C.services.find((x) => x.slug === r.param);
    if (s) return [s.zh + '｜' + s.en + '｜NextEra', s.value];
  }
  if (r.name === 'case') {
    const c = C.cases.find((x) => x.slug === r.param);
    if (c) return [c.title + (c.concept ? '（概念示例）' : '') + '｜NextEra', c.summary];
  }
  const map = {
    work: C.seo.work,
    about: C.seo.about,
    contact: C.seo.contact,
    privacy: C.seo.privacy,
    terms: C.seo.terms,
    media: { title: 'NextEra Media｜商業 Podcast・Blog・影片製作', description: 'NextEra Media 專注商業 Podcast、Blog 及各類影片製作，記錄真實的商業對話。' },
  };
  if (map[r.name]) return [map[r.name].title, map[r.name].description];
  if (r.name === 'notfound') return ['找不到頁面｜NextEra', C.seo.home.description];
  return [C.seo.home.title, C.seo.home.description];
}

export function registerNextera(vueApp, { C, store }) {
    /* ---------------- Helpers ---------------- */
    const pad = (n) => String(n).padStart(2, '0');
    const serviceByKey = (key) => C.services.find((s) => s.key === key);
    const serviceBySlug = (slug) => C.services.find((s) => s.slug === slug);
    const categoryByKey = (key) => C.categories.find((c) => c.key === key);
    const serviceHref = (s) => '/services/' + s.slug;
    const contactHref = (serviceKey, extra) => {
      const q = new URLSearchParams();
      if (serviceKey) q.set('service', serviceKey);
      if (extra) Object.entries(extra).forEach(([k, v]) => q.set(k, v));
      const qs = q.toString();
      return '/contact' + (qs ? '?' + qs : '');
    };
    const casesForService = (key) => C.cases.filter((c) => categoryByKey(c.category).service === key);
  
  
    /* ---------------- Reveal directive ---------------- */
    let revealObserver = null;
    const revealDirective = {
      mounted(el, binding) {
        if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
        if (!revealObserver) {
          revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); }
            });
          }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
        }
        el.classList.add(binding.arg === 'line' ? 'line-reveal' : 'reveal');
        if (binding.value) el.style.transitionDelay = binding.value * 90 + 'ms';
        revealObserver.observe(el);
      },
      unmounted(el) { if (revealObserver) revealObserver.unobserve(el); },
    };
  
    /* ---------------- Shared components ---------------- */
    const ArrowIcon = {
      template: `<svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>`,
    };
  
    const BrandLogo = {
      props: { size: { type: String, default: 'nav' } },
      template: `
        <img src="/assets/brand/nextera-logo.png" alt="NextEra BUSINESS MEDIA" width="253" height="202"
          :class="size === 'nav' ? 'h-12 w-auto sm:h-[58px]' : size === 'lg' ? 'h-36 w-auto sm:h-44' : 'h-20 w-auto'" decoding="async" />`,
    };
  
    const Eyebrow = {
      props: { text: String, light: Boolean },
      template: `<p class="eyebrow" :class="light ? 'text-gold-300' : 'text-gold-700'"><span class="eyebrow-line" aria-hidden="true"></span><span class="eyebrow-node" aria-hidden="true"></span>{{ text }}</p>`,
    };
  
    const NEURAL_NODES = [[60, 520], [150, 420], [110, 300], [240, 340], [300, 200], [210, 150], [380, 300], [420, 140], [500, 240], [540, 90], [470, 420], [340, 460], [560, 380], [260, 540], [330, 70]];
    const NEURAL_EDGES = [[0, 1], [1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [5, 4], [4, 6], [4, 7], [7, 8], [7, 9], [8, 9], [6, 8], [6, 10], [6, 11], [3, 11], [10, 12], [8, 12], [11, 13], [0, 13], [10, 11], [5, 14], [14, 7]];
    const NEURAL_SIGNALS = [[1, 3], [4, 7], [6, 10], [8, 9], [11, 13], [5, 14]];
    const NEURAL_PULSE = [3, 7, 10, 14];
  
    const NeuralField = {
      props: { dark: Boolean },
      computed: {
        nodes() { return NEURAL_NODES; },
        edges() { return NEURAL_EDGES.map(([a, b]) => [NEURAL_NODES[a], NEURAL_NODES[b]]); },
        signals() { return NEURAL_SIGNALS.map(([a, b]) => [NEURAL_NODES[a], NEURAL_NODES[b]]); },
        pulse() { return NEURAL_PULSE.map((i) => NEURAL_NODES[i]); },
      },
      template: `
        <svg class="neural pointer-events-none" viewBox="0 0 600 600" fill="none" aria-hidden="true">
          <line v-for="(e, i) in edges" :key="'e' + i" :x1="e[0][0]" :y1="e[0][1]" :x2="e[1][0]" :y2="e[1][1]" :stroke="dark ? '#D8C49A' : '#1A293A'" :stroke-opacity="dark ? .22 : .14" stroke-width="1" />
          <line v-for="(e, i) in signals" :key="'s' + i" class="signal" pathLength="1" :style="{ animationDelay: (i * 0.75) + 's' }" :x1="e[0][0]" :y1="e[0][1]" :x2="e[1][0]" :y2="e[1][1]" stroke="#B69860" stroke-width="1.6" stroke-linecap="round" />
          <circle v-for="(n, i) in pulse" :key="'p' + i" class="pulse" :style="{ animationDelay: (i * 0.9) + 's' }" :cx="n[0]" :cy="n[1]" r="7" stroke="#B69860" stroke-width="1" />
          <g v-for="(n, i) in nodes" :key="'n' + i">
            <rect :x="n[0] - 3" :y="n[1] - 3" width="6" height="6" :transform="'rotate(45 ' + n[0] + ' ' + n[1] + ')'" :fill="i % 3 === 0 ? '#B69860' : (dark ? '#1A293A' : '#FAF9F6')" stroke="#B69860" stroke-width="1" />
          </g>
        </svg>`,
    };
  
    const toNum = (s) => parseFloat(String(s).replace(/,/g, ''));
    const fmtNum = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  
    const MetricViz = {
      props: { metrics: Array, internal: Boolean },
      data() { return { p: 0, shown: false }; },
      computed: {
        rows() {
          return this.metrics.map((m) => {
            const b = toNum(m.before), a = toNum(m.after);
            const d = (String(m.after).split('.')[1] || '').length;
            return { ...m, b, a, d, bw: Math.max(1.2, (b / a) * 100) };
          });
        },
      },
      mounted() {
        if (reducedMotion.matches || !('IntersectionObserver' in window)) { this.shown = true; this.p = 1; return; }
        this.io = new IntersectionObserver((es) => {
          if (!es[0].isIntersecting) return;
          this.io.disconnect();
          this.shown = true;
          const t0 = performance.now(), dur = 1600;
          const step = (t) => { const k = Math.min(1, (t - t0) / dur); this.p = 1 - Math.pow(1 - k, 3); if (k < 1) requestAnimationFrame(step); };
          requestAnimationFrame(step);
        }, { threshold: 0.3 });
        this.io.observe(this.$el);
      },
      beforeUnmount() { if (this.io) this.io.disconnect(); },
      methods: { val(r) { return fmtNum(r.a * this.p, r.d); } },
      template: `
        <div class="tech-grid-dark relative mt-8 overflow-hidden bg-navy p-6 text-paper sm:p-8" :class="shown ? 'viz-on' : ''">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="font-mono text-[11px] tracking-[0.18em] text-gold-300">INSIGHTS_DASHBOARD<span class="caret"></span></p>
            <p class="flex items-center gap-4 text-[12px] text-paper/70">
              <span class="flex items-center gap-2"><span class="h-2 w-5 bg-paper/30" aria-hidden="true"></span>{{ internal ? '運營前' : '合作前' }}</span>
              <span class="flex items-center gap-2"><span class="viz-bar h-2 w-5" aria-hidden="true"></span>{{ internal ? '運營期間' : '合作期間' }}</span>
            </p>
          </div>
          <div class="mt-6 grid gap-px bg-white/10 sm:grid-cols-2">
            <div v-for="(r, i) in rows" :key="r.label" class="bg-navy/95 p-5">
              <p class="text-[13px] text-paper/75">{{ r.label }}</p>
              <div class="mt-2 flex items-end justify-between gap-3">
                <p class="font-display text-[clamp(2rem,4vw,2.6rem)] leading-none tabular-nums text-paper">{{ val(r) }}</p>
                <p class="viz-chip shrink-0 font-mono text-[12px] text-gold-300" :style="{ transitionDelay: (0.9 + i * 0.12) + 's' }">{{ r.change }}</p>
              </div>
              <div class="mt-5 space-y-2" aria-hidden="true">
                <div class="flex items-center gap-3">
                  <div class="h-1.5 flex-1 bg-white/[0.06]"><div class="viz-grow h-full bg-paper/35" :style="{ width: r.bw + '%', transitionDelay: (i * 0.12) + 's' }"></div></div>
                  <span class="w-14 text-right font-mono text-[11px] tabular-nums text-paper/60">{{ r.before }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="h-1.5 flex-1 bg-white/[0.06]"><div class="viz-grow viz-bar h-full" :style="{ width: '100%', transitionDelay: (0.15 + i * 0.12) + 's' }"></div></div>
                  <span class="w-14 text-right font-mono text-[11px] tabular-nums text-gold-300">{{ r.after }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>`,
    };
  
    const countUp = {
      data() { return { p: 0, shown: false }; },
      mounted() {
        if (reducedMotion.matches || !('IntersectionObserver' in window)) { this.shown = true; this.p = 1; return; }
        this.io = new IntersectionObserver((es) => {
          if (!es[0].isIntersecting) return;
          this.io.disconnect();
          this.shown = true;
          const t0 = performance.now(), dur = 1600;
          const step = (t) => { const k = Math.min(1, (t - t0) / dur); this.p = 1 - Math.pow(1 - k, 3); if (k < 1) requestAnimationFrame(step); };
          requestAnimationFrame(step);
        }, { threshold: 0.3 });
        this.io.observe(this.$el);
      },
      beforeUnmount() { if (this.io) this.io.disconnect(); },
    };
  
    const KpiViz = {
      mixins: [countUp],
      props: { kpis: Array, split: Object },
      computed: {
        rows() {
          return this.kpis.map((k) => {
            const s = String(k.display || k.value);
            const m = s.match(/^([\d,.]+)(.*)$/);
            return { ...k, n: toNum(m[1]), d: (m[1].split('.')[1] || '').length, suf: m[2] };
          });
        },
        parts() {
          if (!this.split) return [];
          const tot = this.split.parts.reduce((a, x) => a + x.v, 0);
          return this.split.parts.map((x) => ({ ...x, w: (x.v / tot) * 100, pct: Math.round((x.v / tot) * 100) }));
        },
      },
      template: `
        <div class="tech-grid-dark relative mt-8 overflow-hidden bg-navy p-6 text-paper sm:p-8" :class="shown ? 'viz-on' : ''">
          <p class="font-mono text-[11px] tracking-[0.18em] text-gold-300">INSIGHTS_DASHBOARD<span class="caret"></span></p>
          <div class="mt-6 grid grid-cols-2 gap-px bg-white/10 md:grid-cols-3">
            <div v-for="(r, i) in rows" :key="r.label" class="bg-navy/95 p-5">
              <p class="text-[13px] text-paper/75">{{ r.label }}</p>
              <p class="mt-2 font-display text-[clamp(1.8rem,3.6vw,2.4rem)] leading-none tabular-nums text-paper">{{ fmt(r) }}</p>
              <p class="viz-chip mt-3 font-mono text-[12px] text-gold-300" :style="{ transitionDelay: (0.6 + i * 0.1) + 's' }">{{ r.change }}</p>
            </div>
          </div>
          <div v-if="split" class="mt-6">
            <div class="flex items-center justify-between text-[13px] text-paper/75"><span>{{ split.label }}</span><span class="font-mono text-[11px] text-paper/60">TOTAL {{ split.parts.reduce((a, x) => a + x.v, 0) }}</span></div>
            <div class="mt-3 flex h-2.5 gap-px overflow-hidden bg-white/[0.06]" aria-hidden="true">
              <div v-for="(x, i) in parts" :key="x.t" class="viz-grow h-full" :class="i === 0 ? 'viz-bar' : 'bg-paper/35'" :style="{ width: x.w + '%', transitionDelay: (0.3 + i * 0.5) + 's' }"></div>
            </div>
            <p class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-paper/70">
              <span v-for="(x, i) in parts" :key="x.t" class="flex items-center gap-2"><span class="h-2 w-4" :class="i === 0 ? 'viz-bar' : 'bg-paper/35'" aria-hidden="true"></span>{{ x.t }} {{ x.v }} 位（約 {{ x.pct }}%）</span>
            </p>
          </div>
        </div>`,
      methods: { fmt(r) { return fmtNum(r.n * this.p, r.d) + r.suf; } },
    };
  
    const ConceptBadge = {
      props: { light: Boolean },
      template: `<span class="badge-concept" :class="light ? 'border-gold-300/60 text-gold-300' : ''">概念示例</span>`,
    };
  
    const CaseCover = {
      components: { ArtPiece },
      props: { item: { type: Object, required: true }, hero: Boolean },
      computed: {
        style() { return { aspectRatio: this.item.cover.ratio }; },
        inner() {
          const art = this.item.cover.art;
          const base = { account: 'w-[62%]', social: 'w-[78%]', slides: 'w-[86%]', browser: 'w-[94%]', chat: 'w-[84%]' }[art] || 'w-[86%]';
          if (!this.hero) return base;
          return base + ' ' + ({ account: 'md:w-[30%]', social: 'md:w-[38%]', slides: 'md:w-[60%]', browser: 'md:w-[70%]', chat: 'md:w-[62%]' }[art] || 'md:w-[60%]');
        },
        label() { return this.item.cover.alt || '封面：' + this.item.title + (this.item.concept ? '（概念設計）' : ''); },
      },
      template: `
        <div class="cover relative flex items-center justify-center overflow-hidden" :class="['tone-' + item.cover.tone, hero ? 'md:!aspect-[16/9]' : '']" :style="style">
          <span class="cover-line" aria-hidden="true"></span>
          <img v-if="item.cover.image" :src="item.cover.image" :alt="label" loading="lazy" decoding="async" class="cover-inner relative w-[86%] rounded-md border border-line bg-white shadow-[0_18px_40px_-20px_rgba(11,27,51,0.45)]" />
          <div v-else class="cover-inner relative" :class="inner">
            <art-piece :art="item.cover.art" :label="label" :data="item.cover.data" />
          </div>
        </div>`,
    };
  
    const CaseCard = {
      components: { CaseCover, ConceptBadge, ArrowIcon },
      props: { item: { type: Object, required: true }, headingLevel: { type: String, default: 'h3' } },
      computed: {
        category() { return categoryByKey(this.item.category); },
      },
      template: `
        <article class="case-card group">
          <a :href="'/work/' + item.slug" class="block focus-visible:outline-offset-8">
            <case-cover :item="item" />
            <div class="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span class="text-[12px] font-semibold tracking-[0.16em] text-gold-700">{{ category.label }}</span>
              <concept-badge v-if="item.concept" />
              <span v-else class="text-[12px] text-ink/70">{{ item.platform }}・{{ item.internal ? '內部運營' : '實際項目' }}</span>
            </div>
            <component :is="headingLevel" class="mt-2 font-serif-tc text-[clamp(1.35rem,2.2vw,1.75rem)] font-bold leading-snug text-navy [overflow-wrap:anywhere] [word-break:keep-all]">{{ item.title }}</component>
            <p class="mt-2 max-w-xl text-[15px] leading-[1.85] text-ink/80">{{ item.summary }}</p>
            <span class="link-arrow mt-4 text-navy">查看項目<arrow-icon /></span>
          </a>
        </article>`,
    };
  
    const CaseGrid = {
      components: { CaseCard },
      props: { items: { type: Array, required: true }, headingLevel: String },
      template: `
        <ul class="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:gap-x-16">
          <li v-for="(c, i) in items" :key="c.slug" :class="i % 2 === 1 ? 'md:mt-28' : ''" v-reveal="i % 2">
            <case-card :item="c" :heading-level="headingLevel" />
          </li>
        </ul>`,
    };
  
    const FaqList = {
      props: { items: { type: Array, required: true }, idPrefix: { type: String, default: 'faq' } },
      data() { return { open: this.items.map((_, i) => i === 0) }; },
      template: `
        <ul class="border-t border-line">
          <li v-for="(f, i) in items" :key="f.q" class="border-b border-line">
            <h3>
              <button type="button" :id="idPrefix + '-btn-' + i" class="faq-btn" :aria-expanded="open[i] ? 'true' : 'false'" :aria-controls="idPrefix + '-panel-' + i" @click="open[i] = !open[i]">
                <span class="flex gap-4"><span class="pt-1 font-display text-sm text-gold-700">{{ String(i + 1).padStart(2, '0') }}</span>{{ f.q }}</span>
                <span class="faq-icon" aria-hidden="true"></span>
              </button>
            </h3>
            <div :id="idPrefix + '-panel-' + i" role="region" :aria-labelledby="idPrefix + '-btn-' + i" class="faq-panel" :class="{ 'is-open': open[i] }">
              <div><p class="max-w-2xl pb-7 pl-9 pr-8 text-[15px] leading-[1.9] text-ink/80">{{ f.a }}</p></div>
            </div>
          </li>
        </ul>`,
    };
  
    const ProcessSteps = {
      props: { steps: { type: Array, required: true }, dark: Boolean },
      computed: {
        cols() { return this.steps.length >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'; },
      },
      template: `
        <ol class="grid gap-10 sm:grid-cols-2 lg:gap-8" :class="cols">
          <li v-for="(s, i) in steps" :key="s.t" class="relative" v-reveal="i">
            <div class="flex items-center gap-4">
              <span class="font-display text-[2.6rem] leading-none" :class="dark ? 'text-gold-300' : 'text-gold-600'">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="flow-line h-px flex-1" :class="dark ? 'bg-white/20' : 'bg-line'" :style="{ animationDelay: (i * 0.6) + 's' }" v-reveal:line></span>
            </div>
            <p class="sys-label mt-4" :class="dark ? '!text-gold-300/80' : ''" aria-hidden="true">STEP_{{ String(i + 1).padStart(2, '0') }}</p>
            <h3 class="mt-2 font-serif-tc text-xl font-bold" :class="dark ? 'text-paper' : 'text-navy'">{{ s.t }}</h3>
            <p class="mt-2 text-[15px] leading-[1.8]" :class="dark ? 'text-paper/75' : 'text-ink/80'">{{ s.d }}</p>
          </li>
        </ol>`,
    };
  
    const ServiceVisual = {
      components: { ArtPiece },
      props: { service: { type: Object, required: true } },
      template: `
        <div class="service-visual relative overflow-hidden" :class="service.visual === 'slides' ? 'tone-navy' : (service.visual === 'webai' ? 'tone-stone' : 'tone-sand')">
          <span class="cover-line" aria-hidden="true"></span>
          <div v-if="service.visual === 'social'" class="relative mx-auto w-[72%] py-[9%]"><art-piece art="social" /></div>
          <div v-else-if="service.visual === 'slides'" class="relative mx-auto w-[86%] py-[10%]"><art-piece art="slides" /></div>
          <div v-else class="relative grid grid-cols-[1.35fr_1fr] items-center gap-[4%] px-[6%] py-[9%]">
            <art-piece art="browser" />
            <art-piece art="chat" :compact="true" label="概念設計：品牌內容 AI 助理精簡介面" />
          </div>
          <span class="absolute left-4 top-4 badge-concept bg-paper/90">概念示例</span>
        </div>`,
    };
  
    const CtaBand = {
      components: { ArrowIcon, Eyebrow, NeuralField },
      props: { eyebrow: String, title: String, text: String, href: String, label: String },
      template: `
        <section class="relative overflow-hidden bg-navy text-paper" :aria-label="title">
          <div class="tech-grid-dark mask-fade-r pointer-events-none absolute inset-0" aria-hidden="true"></div>
          <neural-field dark class="absolute -right-24 top-1/2 hidden h-[150%] -translate-y-1/2 opacity-70 md:block" />
          <svg class="pointer-events-none absolute -right-20 top-0 h-full w-[46%] opacity-25" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 400 L400 0" stroke="#B69860" stroke-width="1" />
          </svg>
          <div class="container relative py-20 lg:py-28">
            <div class="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div class="lg:col-span-8">
                <eyebrow :text="eyebrow || 'START A CONVERSATION'" light />
                <h2 class="mt-5 font-serif-tc text-[clamp(1.9rem,4vw,3.25rem)] font-bold leading-[1.3]">{{ title }}</h2>
                <p v-if="text" class="mt-5 max-w-2xl text-[17px] leading-[1.85] text-paper/80">{{ text }}</p>
              </div>
              <div class="lg:col-span-4 lg:text-right">
                <a :href="href" class="btn btn-gold">{{ label }}<arrow-icon /></a>
              </div>
            </div>
          </div>
        </section>`,
    };
  
    const SectionHead = {
      components: { Eyebrow },
      props: { eyebrow: String, title: String, text: String, id: String },
      template: `
        <div class="grid gap-6 lg:grid-cols-12 lg:gap-10">
          <div class="lg:col-span-4" v-reveal><eyebrow :text="eyebrow" /></div>
          <div class="lg:col-span-8">
            <h2 :id="id" class="h2" v-reveal><span v-for="t in title.split('\\n')" :key="t" class="block">{{ t }}</span></h2>
            <p v-if="text" class="lead mt-5 max-w-2xl" v-reveal="1">{{ text }}</p>
            <slot></slot>
          </div>
        </div>`,
    };
  
    /* ---------------- Pages ---------------- */
    const PageHome = {
      components: { ArtPiece, ArrowIcon, Eyebrow, ConceptBadge, ServiceVisual, CaseGrid, ProcessSteps, FaqList, SectionHead, NeuralField },
      computed: {
        services() { return C.services; },
        featured() {
          const real = C.cases.filter((c) => !c.concept);
          const covered = new Set(real.map((c) => c.category));
          const concepts = C.cases.filter((c) => c.concept && !covered.has(c.category));
          return real.concat(concepts).slice(0, 4);
        },
        process() { return C.home.process; },
        faqs() { return C.home.faqs; },
        markets() { return C.site.markets; },
      },
      methods: { serviceHref, contactHref },
      template: `
        <div>
          <!-- Hero -->
          <section class="relative overflow-hidden pb-20 pt-32 sm:pt-40 lg:pb-28 lg:pt-44" aria-labelledby="page-title">
            <div class="tech-grid mask-fade-r pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <neural-field class="absolute -right-[6%] top-[6%] hidden h-[94%] opacity-80 lg:block" />
            <svg class="pointer-events-none absolute right-0 top-0 hidden h-full w-1/2 lg:block" viewBox="0 0 600 800" preserveAspectRatio="none" aria-hidden="true">
              <path class="draw-line" pathLength="1" d="M40 800 L600 120" stroke="#B69860" stroke-width="1" fill="none" />
            </svg>
            <div class="container relative grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
              <div class="lg:col-span-6">
                <p class="rise eyebrow text-gold-700" style="animation-delay:60ms"><span class="eyebrow-line" aria-hidden="true"></span><span class="eyebrow-node" aria-hidden="true"></span>AI-DRIVEN MARKETING CONSULTANCY<span class="caret" aria-hidden="true"></span></p>
                <h1 id="page-title" tabindex="-1" class="mt-7 font-serif-tc text-[clamp(1.9rem,3.9vw,3.5rem)] font-bold leading-[1.3] tracking-[0.01em] text-navy outline-none">
                  <span class="rise block lg:whitespace-nowrap" style="animation-delay:140ms">為品牌創造影響力，</span>
                  <span class="rise block lg:whitespace-nowrap" style="animation-delay:240ms">為企業開啟<span class="text-gold-600">下一階段</span>。</span>
                </h1>
                <p class="rise mt-7 max-w-[34rem] text-[17px] leading-[1.9] text-ink/85" style="animation-delay:340ms">從品牌代營運、企業 AI 培訓，到網頁與專屬 AI 開發，NextEra 將策略、創意與技術轉化為可執行的方案。</p>
                <div class="rise mt-10 flex flex-col gap-3 sm:flex-row" style="animation-delay:440ms">
                  <a href="/contact" class="btn btn-primary">預約需求諮詢<arrow-icon /></a>
                  <a href="/?section=services" class="btn btn-outline">探索服務</a>
                </div>
                <ul class="rise mt-14 border-t border-line" style="animation-delay:540ms" aria-label="三項核心服務">
                  <li v-for="s in services" :key="s.key" class="border-b border-line">
                    <a :href="serviceHref(s)" class="group flex items-center gap-5 py-4">
                      <span class="font-mono text-[13px] text-gold-600">[{{ s.no }}]</span>
                      <span class="flex-1 text-[15px] font-medium text-navy">{{ s.short || s.zh }}</span>
                      <span class="text-navy/60 transition group-hover:translate-x-1 group-hover:text-navy"><arrow-icon /></span>
                    </a>
                  </li>
                </ul>
              </div>
  
              <div class="rise lg:col-span-6" style="animation-delay:260ms">
                <div class="hero-collage relative mx-auto aspect-[1/1.02] w-full max-w-[620px]">
                  <span class="hud-corners" aria-hidden="true"></span>
                  <span class="absolute -top-9 right-0 hidden items-center gap-2 sys-label sm:flex" aria-hidden="true"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-gold"></span>STRATEGY · CREATIVE · AI</span>
                  <div class="absolute right-0 top-0 w-[80%] tone-stone p-[3%]"><art-piece art="browser" label="概念設計：品牌官網預覽" /></div>
                  <div class="absolute bottom-[2%] left-0 w-[46%] tone-sand p-[3%] shadow-[0_30px_60px_-36px_rgba(26,41,58,0.5)]"><art-piece art="social" label="概念設計：社交貼文系列" /></div>
                  <div class="absolute bottom-0 right-[3%] w-[48%] shadow-[0_30px_60px_-36px_rgba(26,41,58,0.5)]"><art-piece art="flow" :compact="true" label="概念設計：AI 內容生成及人工審核流程" /></div>
                  <span class="absolute left-0 top-[4%] badge-concept bg-paper">概念示例</span>
                  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true"><span class="scanline"></span></div>
                </div>
              </div>
            </div>
          </section>
  
          <!-- Services -->
          <section id="services" class="border-t border-line py-24 lg:py-32" aria-labelledby="services-title">
            <div class="container">
              <section-head id="services-title" eyebrow="OUR SERVICES・三項核心服務" :title="'由日常營銷到專屬工具，\\n一個團隊協助落實。'" text="三項服務可以獨立合作，也可以按業務階段組合。每項服務都會先確認範圍與交付物，再開始執行。" />
  
              <div class="mt-20 space-y-24 lg:space-y-32">
                <article v-for="(s, i) in services" :key="s.key" class="grid items-center gap-10 lg:grid-cols-12 lg:gap-16" :aria-labelledby="'svc-' + s.key">
                  <div class="lg:col-span-5" :class="i % 2 === 1 ? 'lg:order-2' : ''">
                    <div class="flex items-baseline gap-4" v-reveal>
                      <span class="font-display text-[clamp(3rem,6vw,5rem)] leading-none text-gold-600">{{ s.no }}</span>
                      <span class="font-mono text-[12px] tracking-[0.14em] text-ink/60">// {{ s.en.toUpperCase() }}</span>
                    </div>
                    <p class="mt-6 text-[17px] font-medium text-gold-700" v-reveal>{{ s.question }}</p>
                    <h3 :id="'svc-' + s.key" class="mt-2 font-serif-tc text-[clamp(1.7rem,3vw,2.5rem)] font-bold leading-[1.3] text-navy" v-reveal>{{ s.zh }}</h3>
                    <p class="mt-5 text-[16px] leading-[1.9] text-ink/85" v-reveal="1">{{ s.value }}</p>
                    <ul class="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2" v-reveal="2">
                      <li v-for="h in s.highlights" :key="h" class="flex gap-3 text-[15px] text-ink"><span class="mt-[11px] h-px w-4 shrink-0 bg-gold" aria-hidden="true"></span>{{ h }}</li>
                    </ul>
                    <div class="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4" v-reveal="3">
                      <a :href="contactHref(s.key)" class="btn btn-primary">{{ s.cta }}<arrow-icon /></a>
                      <a :href="serviceHref(s)" class="link-arrow text-navy">了解服務詳情<arrow-icon /></a>
                    </div>
                  </div>
                  <div class="relative lg:col-span-7" :class="i % 2 === 1 ? 'lg:order-1' : ''" v-reveal="1">
                    <span class="hud-corners" aria-hidden="true"></span>
                    <service-visual :service="s" />
                  </div>
                </article>
              </div>
            </div>
          </section>
  
          <!-- Featured work -->
          <section class="bg-sand py-24 lg:py-32" aria-labelledby="work-title">
            <div class="container">
              <section-head id="work-title" eyebrow="SELECTED WORK・精選案例與作品" title="從策略到成果，看看我們如何落實。">
                <p class="mt-5 max-w-2xl text-[15px] leading-[1.85] text-ink/80" v-reveal="1">包括已獲當事人同意公開的實際項目及 NextEra 內部運營成果；標示「概念示例」的為 NextEra 原創示範，用以說明服務方法與交付形式，並非真實客戶項目。</p>
              </section-head>
              <div class="mt-16"><case-grid :items="featured" /></div>
              <div class="mt-20 flex justify-center"><a href="/work" class="btn btn-outline">瀏覽所有案例<arrow-icon /></a></div>
            </div>
          </section>
  
          <!-- Process -->
          <section class="relative overflow-hidden bg-navy py-24 text-paper lg:py-32" aria-labelledby="process-title">
            <div class="tech-grid-dark mask-fade-c pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <svg class="pointer-events-none absolute -left-10 bottom-0 h-[70%] w-[40%] opacity-30" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true"><path d="M0 400 L400 0" stroke="#B69860" stroke-width="1" /></svg>
            <div class="container relative">
              <div class="grid gap-6 lg:grid-cols-12 lg:gap-10">
                <div class="lg:col-span-4" v-reveal><eyebrow text="HOW WE WORK・合作流程" light /></div>
                <div class="lg:col-span-8">
                  <h2 id="process-title" class="h2 text-paper" v-reveal>先講清楚範圍，再穩定執行。</h2>
                  <p class="mt-5 max-w-2xl text-[17px] leading-[1.85] text-paper/80" v-reveal="1">合作前，我們會以書面確認工作範圍、時程、修改安排及雙方責任，讓執行期間的期望一致。</p>
                </div>
              </div>
              <div class="mt-16"><process-steps :steps="process" dark /></div>
            </div>
          </section>
  
          <!-- Philosophy -->
          <section class="py-24 lg:py-32" aria-labelledby="philosophy-title">
            <div class="container grid gap-10 lg:grid-cols-12">
              <div class="lg:col-span-4" v-reveal><eyebrow text="OUR BELIEF・品牌理念" /></div>
              <div class="lg:col-span-8">
                <h2 id="philosophy-title" class="font-serif-tc text-[clamp(1.9rem,4.2vw,3.4rem)] font-bold leading-[1.45] text-navy" v-reveal>
                  <span class="block">以<span class="text-gold-600">策略</span>定義方向，</span>
                  <span class="block">以<span class="text-gold-600">創意</span>建立影響力，</span>
                  <span class="block">以 <span class="text-gold-600">AI</span> 提升執行效率。</span>
                </h2>
                <div class="mt-12 border-t border-line pt-8" v-reveal="1">
                  <p class="text-[15px] leading-[1.85] text-ink/80">優先服務澳門及香港中小企業：</p>
                  <ul class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-serif-tc text-[clamp(1.05rem,1.6vw,1.3rem)] font-bold text-navy">
                    <li v-for="(m, i) in markets" :key="m" class="flex items-center gap-3">{{ m }}<span v-if="i < markets.length - 1" class="text-gold" aria-hidden="true">／</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
  
          <!-- FAQ -->
          <section class="border-t border-line bg-sand/60 py-24 lg:py-32" aria-labelledby="faq-title">
            <div class="container grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div class="lg:col-span-4">
                <div class="lg:sticky lg:top-32" v-reveal>
                  <eyebrow text="FAQ・常見問題" />
                  <h2 id="faq-title" class="h2 mt-6">合作前，<br />你可能想了解的事。</h2>
                  <a href="/contact" class="link-arrow mt-8 text-navy">提出其他問題<arrow-icon /></a>
                </div>
              </div>
              <div class="lg:col-span-8"><faq-list :items="faqs" id-prefix="home-faq" /></div>
            </div>
          </section>
        </div>`,
    };
  
    const PageService = {
      components: { ArrowIcon, Eyebrow, ServiceVisual, CaseGrid, ProcessSteps, FaqList, SectionHead, CtaBand },
      props: { slug: String },
      computed: {
        s() { return serviceBySlug(this.slug); },
        related() { return this.s ? casesForService(this.s.key) : []; },
        others() { return C.services.filter((x) => x.slug !== this.slug); },
        allDeliverables() {
          if (!this.s.sub) return [{ label: null, items: this.s.deliverables }];
          return this.s.sub.map((b) => ({ label: b.label + '．' + b.zh, items: b.deliverables }));
        },
      },
      methods: {
        contactHref, serviceHref,
        scrollToRelated() { document.getElementById('related-work').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' }); },
      },
      template: `
        <div v-if="s">
          <section class="relative overflow-hidden pb-20 pt-32 sm:pt-40 lg:pb-24" aria-labelledby="page-title">
            <div class="tech-grid mask-fade-r pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <div class="container relative">
              <nav aria-label="麵包屑" class="text-[13px] text-ink/70">
                <ol class="flex flex-wrap items-center gap-2">
                  <li><a href="/" class="hover:text-navy hover:underline">首頁</a></li>
                  <li aria-hidden="true">／</li>
                  <li><a href="/?section=services" class="hover:text-navy hover:underline">服務</a></li>
                  <li aria-hidden="true">／</li>
                  <li aria-current="page" class="text-navy">{{ s.short || s.zh }}</li>
                </ol>
              </nav>
              <div class="mt-12 grid items-center gap-14 lg:grid-cols-12 lg:gap-14">
                <div class="lg:col-span-5">
                  <div class="rise flex items-baseline gap-4">
                    <span class="font-display text-[clamp(3rem,6vw,5rem)] leading-none text-gold-600">{{ s.no }}</span>
                    <span class="font-mono text-[12px] tracking-[0.14em] text-ink/60">// {{ s.en.toUpperCase() }}</span>
                  </div>
                  <h1 id="page-title" tabindex="-1" class="rise mt-6 font-serif-tc text-[clamp(2rem,4.2vw,3.4rem)] font-bold leading-[1.3] text-navy outline-none" style="animation-delay:100ms">{{ s.zh }}</h1>
                  <p class="rise mt-4 text-[17px] font-medium text-gold-700" style="animation-delay:180ms">{{ s.question }}</p>
                  <p class="rise mt-4 text-[17px] leading-[1.9] text-ink/85" style="animation-delay:240ms">{{ s.value }}</p>
                  <div class="rise mt-9 flex flex-wrap items-center gap-x-7 gap-y-4" style="animation-delay:320ms">
                    <a :href="contactHref(s.key)" class="btn btn-primary">{{ s.cta }}<arrow-icon /></a>
                    <button v-if="related.length" type="button" class="link-arrow text-navy" @click="scrollToRelated">查看相關作品<arrow-icon /></button>
                  </div>
                </div>
                <div class="rise relative lg:col-span-7" style="animation-delay:200ms">
                  <span class="hud-corners" aria-hidden="true"></span>
                  <service-visual :service="s" />
                  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true"><span class="scanline"></span></div>
                </div>
              </div>
            </div>
          </section>
  
          <!-- Audience & problems -->
          <section class="border-t border-line py-20 lg:py-28" aria-labelledby="fit-title">
            <div class="container grid gap-14 lg:grid-cols-12 lg:gap-10">
              <div class="lg:col-span-5">
                <eyebrow text="WHO IT'S FOR・適合對象" />
                <h2 id="fit-title" class="h2 mt-6">這項服務適合：</h2>
                <ul class="mt-8 border-t border-line">
                  <li v-for="a in s.audiences" :key="a" class="flex gap-4 border-b border-line py-4 text-[15px] leading-[1.8] text-ink" v-reveal>
                    <span class="mt-[12px] h-px w-5 shrink-0 bg-gold" aria-hidden="true"></span>{{ a }}
                  </li>
                </ul>
              </div>
              <div class="lg:col-span-6 lg:col-start-7">
                <eyebrow text="COMMON CHALLENGES・常見業務問題" />
                <h2 class="h2 mt-6">你可能正面對：</h2>
                <ol class="mt-8 space-y-8">
                  <li v-for="(p, i) in s.problems" :key="p.t" class="grid grid-cols-[3rem_1fr] gap-2" v-reveal="i % 2">
                    <span class="font-display text-2xl text-gold-600">{{ String(i + 1).padStart(2, '0') }}</span>
                    <div>
                      <h3 class="font-serif-tc text-lg font-bold text-navy">{{ p.t }}</h3>
                      <p class="mt-1.5 text-[15px] leading-[1.8] text-ink/80">{{ p.d }}</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </section>
  
          <!-- Scope -->
          <section class="bg-sand py-20 lg:py-28" aria-labelledby="scope-title">
            <div class="container">
              <section-head id="scope-title" eyebrow="SCOPE・工作範圍" :title="s.key === 'training' ? '培訓模組與形式' : (s.key === 'webai' ? '兩個清楚的子項' : '我們負責的工作')" />
  
              <!-- Managed -->
              <template v-if="s.key === 'managed'">
                <ol class="mt-14 grid gap-px border border-line bg-line md:grid-cols-2">
                  <li v-for="(it, i) in s.scope" :key="it.t" class="bg-paper p-7 lg:p-9" v-reveal="i % 2">
                    <span class="font-display text-lg text-gold-600">{{ String(i + 1).padStart(2, '0') }}</span>
                    <h3 class="mt-3 font-serif-tc text-lg font-bold text-navy">{{ it.t }}</h3>
                    <p class="mt-2 text-[15px] leading-[1.8] text-ink/80">{{ it.d }}</p>
                  </li>
                  <li class="bg-navy p-7 text-paper lg:p-9">
                    <p class="text-[12px] font-semibold tracking-[0.18em] text-gold-300">可另行討論</p>
                    <ul class="mt-4 flex flex-wrap gap-2">
                      <li v-for="x in s.extras" :key="x" class="border border-white/25 px-3 py-1.5 text-[14px]">{{ x }}</li>
                    </ul>
                    <p class="mt-4 text-[14px] leading-[1.8] text-paper/75">{{ s.extrasNote }}</p>
                  </li>
                </ol>
              </template>
  
              <!-- Training -->
              <template v-else-if="s.key === 'training'">
                <h3 class="mt-14 text-[13px] font-semibold tracking-[0.18em] text-gold-700">培訓模組</h3>
                <ol class="mt-4 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                  <li v-for="(m, i) in s.modules" :key="m" class="bg-paper p-6" v-reveal="i % 4">
                    <span class="font-display text-lg text-gold-600">{{ String(i + 1).padStart(2, '0') }}</span>
                    <p class="mt-3 font-serif-tc text-[17px] font-bold leading-snug text-navy">{{ m }}</p>
                  </li>
                </ol>
                <div class="mt-14 grid gap-10 lg:grid-cols-12">
                  <div class="lg:col-span-7">
                    <h3 class="text-[13px] font-semibold tracking-[0.18em] text-gold-700">培訓形式</h3>
                    <ul class="mt-4 border-t border-line">
                      <li v-for="f in s.formats" :key="f.t" class="grid gap-1 border-b border-line py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                        <span class="font-serif-tc text-[17px] font-bold text-navy">{{ f.t }}</span>
                        <span class="text-[15px] leading-[1.8] text-ink/80">{{ f.d }}</span>
                      </li>
                    </ul>
                  </div>
                  <div class="lg:col-span-5">
                    <h3 class="text-[13px] font-semibold tracking-[0.18em] text-gold-700">實際工作情境練習</h3>
                    <p class="mt-4 text-[15px] leading-[1.8] text-ink/80">以企業實際工作作練習，培訓完成時已有可直接使用的成果，例如：</p>
                    <ul class="mt-5 space-y-3">
                      <li v-for="p in s.practice" :key="p" class="flex gap-3 text-[15px] text-ink"><span class="mt-[11px] h-px w-4 shrink-0 bg-gold" aria-hidden="true"></span>{{ p }}</li>
                    </ul>
                  </div>
                </div>
              </template>
  
              <!-- Web & AI -->
              <template v-else>
                <div class="mt-14 grid gap-px border border-line bg-line lg:grid-cols-2">
                  <div v-for="b in s.sub" :key="b.key" class="bg-paper p-8 lg:p-11" v-reveal>
                    <div class="flex items-baseline gap-4">
                      <span class="font-display text-[2.6rem] leading-none text-gold-600">{{ b.label }}</span>
                      <span class="text-[12px] font-semibold tracking-[0.2em] text-ink/60">{{ b.en.toUpperCase() }}</span>
                    </div>
                    <h3 class="mt-4 font-serif-tc text-[1.6rem] font-bold text-navy">{{ b.zh }}</h3>
                    <ul class="mt-6 border-t border-line">
                      <li v-for="it in b.items" :key="it" class="flex gap-3 border-b border-line py-3.5 text-[15px] text-ink"><span class="mt-[11px] h-px w-4 shrink-0 bg-gold" aria-hidden="true"></span>{{ it }}</li>
                    </ul>
                  </div>
                </div>
                <div class="mt-8 flex gap-4 border-l-2 border-gold bg-paper p-6 text-[15px] leading-[1.85] text-ink/85" role="note">
                  <p><strong class="font-semibold text-navy">開發範圍說明：</strong>{{ s.capabilityNote }}</p>
                </div>
              </template>
            </div>
          </section>
  
          <!-- Deliverables -->
          <section class="py-20 lg:py-28" aria-labelledby="deliver-title">
            <div class="container">
              <section-head id="deliver-title" eyebrow="DELIVERABLES・具體交付物" title="合作完成時，你會得到：" />
              <div class="mt-12 grid gap-10" :class="allDeliverables.length > 1 ? 'lg:grid-cols-2' : ''">
                <div v-for="g in allDeliverables" :key="g.label || 'all'">
                  <h3 v-if="g.label" class="mb-4 font-serif-tc text-lg font-bold text-navy">{{ g.label }}</h3>
                  <ol class="border-t border-navy">
                    <li v-for="(d, i) in g.items" :key="d" class="flex items-baseline gap-5 border-b border-line py-5" v-reveal>
                      <span class="font-display text-lg text-gold-600">{{ String(i + 1).padStart(2, '0') }}</span>
                      <span class="font-serif-tc text-[clamp(1.1rem,1.8vw,1.4rem)] font-bold text-navy">{{ d }}</span>
                    </li>
                  </ol>
                </div>
              </div>
              <p class="mt-10 max-w-3xl border-l-2 border-gold pl-5 text-[15px] leading-[1.85] text-ink/85"><strong class="font-semibold text-navy">合作方式：</strong>{{ s.engagement }}</p>
            </div>
          </section>
  
          <!-- Process -->
          <section class="bg-navy py-20 text-paper lg:py-28" aria-labelledby="svc-process-title">
            <div class="container">
              <div class="grid gap-6 lg:grid-cols-12 lg:gap-10">
                <div class="lg:col-span-4"><eyebrow text="PROCESS・合作流程" light /></div>
                <h2 id="svc-process-title" class="h2 text-paper lg:col-span-8">由了解需要，到交付成果。</h2>
              </div>
              <div class="mt-14"><process-steps :steps="s.process" dark /></div>
            </div>
          </section>
  
          <!-- Related work -->
          <section id="related-work" class="py-20 lg:py-28" aria-labelledby="related-title">
            <div class="container">
              <section-head id="related-title" eyebrow="RELATED WORK・相關作品" title="相關作品與概念示例" />
              <div v-if="related.length" class="mt-14"><case-grid :items="related" /></div>
              <p v-else class="mt-10 text-[15px] text-ink/80">此服務的作品將於稍後更新。</p>
              <div class="mt-16"><a href="/work" class="btn btn-outline">瀏覽所有案例<arrow-icon /></a></div>
            </div>
          </section>
  
          <!-- FAQ -->
          <section class="border-t border-line bg-sand/60 py-20 lg:py-28" aria-labelledby="svc-faq-title">
            <div class="container grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div class="lg:col-span-4"><eyebrow text="FAQ・常見問題" /><h2 id="svc-faq-title" class="h2 mt-6">關於{{ s.key === 'webai' ? '網站與專屬 AI' : (s.key === 'training' ? '企業培訓' : '代營運') }}</h2></div>
              <div class="lg:col-span-8"><faq-list :items="s.faqs" :id-prefix="s.key + '-faq'" /></div>
            </div>
          </section>
  
          <!-- Other services -->
          <section class="py-16 lg:py-20" aria-label="其他服務">
            <div class="container">
              <p class="text-[12px] font-semibold tracking-[0.18em] text-gold-700">其他服務</p>
              <ul class="mt-4 grid border-t border-line md:grid-cols-2">
                <li v-for="o in others" :key="o.key" class="border-b border-line md:odd:border-r md:odd:pr-8 md:even:pl-8">
                  <a :href="serviceHref(o)" class="group flex items-center gap-5 py-6">
                    <span class="font-display text-xl text-gold-600">{{ o.no }}</span>
                    <span class="flex-1 font-serif-tc text-lg font-bold text-navy">{{ o.short || o.zh }}</span>
                    <span class="text-navy transition group-hover:translate-x-1"><arrow-icon /></span>
                  </a>
                </li>
              </ul>
            </div>
          </section>
  
          <cta-band :title="'與我們討論你的' + (s.key === 'managed' ? '代營運需要' : (s.key === 'training' ? '培訓需要' : '網站或 AI 項目'))" text="分享你的業務目標與目前的挑戰，我們會協助你確認合適的範圍與下一步。" :href="contactHref(s.key)" :label="s.cta" />
        </div>
        <page-not-found v-else />`,
    };
  
    const PageWork = {
      components: { CaseGrid, Eyebrow },
      data() {
        const q = store.route.query.category;
        return { filter: q && C.cases.some((x) => x.category === q) ? q : 'all' };
      },
      watch: {
        '$store.route.query.category'(q) { this.filter = q && C.cases.some((x) => x.category === q) ? q : 'all'; },
      },
      computed: {
        filters() {
          const cats = C.categories.filter((c) => C.cases.some((x) => x.category === c.key));
          return [{ key: 'all', label: '全部', count: C.cases.length }].concat(cats.map((c) => ({ key: c.key, label: c.label, count: C.cases.filter((x) => x.category === c.key).length })));
        },
        items() { return this.filter === 'all' ? C.cases : C.cases.filter((c) => c.category === this.filter); },
        hasConcept() { return C.cases.some((c) => c.concept); },
      },
      methods: {
        setFilter(k) {
          this.filter = k;
          history.replaceState(null, '', k === 'all' ? '/work' : '/work?category=' + k);
        },
      },
      template: `
        <div>
          <section class="relative overflow-hidden pb-12 pt-32 sm:pt-40" aria-labelledby="page-title">
            <div class="tech-grid mask-fade-r pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <div class="container relative grid gap-8 lg:grid-cols-12 lg:gap-10">
              <div class="lg:col-span-4"><p class="rise eyebrow text-gold-700"><span class="eyebrow-line" aria-hidden="true"></span><span class="eyebrow-node" aria-hidden="true"></span>OUR WORK</p></div>
              <div class="lg:col-span-8">
                <h1 id="page-title" tabindex="-1" class="rise font-serif-tc text-[clamp(2.3rem,5vw,4.2rem)] font-bold leading-[1.2] text-navy outline-none" style="animation-delay:80ms">案例與作品</h1>
                <p class="rise lead mt-6 max-w-2xl" style="animation-delay:160ms">由社交內容、團隊培訓到網站與 AI 工具，看看每項服務如何轉化為具體的交付成果。</p>
                <p v-if="hasConcept" class="rise mt-6 max-w-2xl border-l-2 border-gold pl-5 text-[15px] leading-[1.85] text-ink/85" style="animation-delay:220ms" role="note">實際項目及標示「內部運營」的 NextEra 自家帳號均已獲當事人同意公開，成效數據附有期間、比較基準及來源。標示<strong class="font-semibold text-navy">「概念示例」</strong>的為 NextEra 原創示範，並非真實客戶項目，亦不包含成效數據。</p>
              </div>
            </div>
          </section>
  
          <section class="pb-24 lg:pb-32" aria-label="作品列表">
            <div class="container">
              <div class="sticky top-[72px] z-20 -mx-5 border-y border-line bg-paper/95 px-5 py-4 backdrop-blur sm:top-[84px] sm:mx-0 sm:px-0">
                <div role="group" aria-label="按服務分類篩選" class="flex gap-2 overflow-x-auto">
                  <button v-for="f in filters" :key="f.key" type="button" class="filter-btn" :class="{ 'is-active': filter === f.key }" :aria-pressed="filter === f.key ? 'true' : 'false'" @click="setFilter(f.key)">
                    {{ f.label }}<span class="ml-1.5 tabular-nums opacity-60">{{ f.count }}</span>
                  </button>
                </div>
              </div>
              <p class="sr-only" aria-live="polite">顯示 {{ items.length }} 個項目</p>
              <div class="mt-14"><case-grid :key="filter" :items="items" heading-level="h2" /></div>
            </div>
          </section>
        </div>`,
    };
  
    const PageCase = {
      components: { ArtPiece, ArrowIcon, CaseCover, ConceptBadge, Eyebrow, CtaBand, MetricViz, KpiViz },
      props: { slug: String },
      computed: {
        c() { return C.cases.find((x) => x.slug === this.slug); },
        index() { return C.cases.findIndex((x) => x.slug === this.slug); },
        category() { return categoryByKey(this.c.category); },
        service() { return serviceByKey(this.category.service); },
        prev() { return C.cases[(this.index - 1 + C.cases.length) % C.cases.length]; },
        next() { return C.cases[(this.index + 1) % C.cases.length]; },
        tones() { return { trend: 'tone-stone', audience: 'tone-sand', stats: 'tone-sand', account: 'tone-stone', social: 'tone-sand', reel: 'tone-sand', calendar: 'tone-sand', brand: 'tone-sand', slides: 'tone-navy', worksheet: 'tone-sand', prompt: 'tone-sand', sop: 'tone-sand', browser: 'tone-stone', phone: 'tone-stone', sitemap: 'tone-stone', form: 'tone-stone', chat: 'tone-navy', flow: 'tone-sand', review: 'tone-stone' }; },
        artWidth() { return { account: 'max-w-[340px]', stats: 'max-w-[460px]', audience: 'max-w-[560px]', social: 'max-w-[460px]', reel: 'max-w-[520px]', phone: 'max-w-[460px]', flow: 'max-w-[460px]', review: 'max-w-[460px]', worksheet: 'max-w-[520px]', prompt: 'max-w-[520px]', sitemap: 'max-w-[560px]' }; },
      },
      methods: { contactHref },
      template: `
        <article v-if="c">
          <header class="relative overflow-hidden pb-12 pt-32 sm:pt-40" aria-labelledby="page-title">
            <div class="tech-grid mask-fade-r pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <div class="container relative">
              <a href="/work" class="link-arrow link-arrow-back text-[14px] text-navy"><arrow-icon />所有案例</a>
              <div class="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-10">
                <div class="lg:col-span-8">
                  <div class="rise flex flex-wrap items-center gap-3">
                    <a :href="'/work?category=' + c.category" class="text-[12px] font-semibold tracking-[0.16em] text-gold-700 hover:underline">{{ category.label }}</a>
                    <concept-badge v-if="c.concept" />
                  </div>
                  <h1 id="page-title" tabindex="-1" class="rise mt-4 font-serif-tc text-[clamp(2.1rem,4.6vw,3.8rem)] font-bold leading-[1.25] text-navy outline-none [overflow-wrap:anywhere] [word-break:keep-all]" style="animation-delay:80ms">{{ c.title }}</h1>
                  <p class="rise lead mt-6 max-w-2xl" style="animation-delay:160ms">{{ c.summary }}</p>
                </div>
              </div>
            </div>
          </header>
  
          <div class="container">
            <template v-if="c.shots">
              <div class="rise grid gap-6" :class="c.shots.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'" style="animation-delay:220ms">
                <figure v-for="s in c.shots" :key="s.src" class="cover flex flex-col p-[5%]" :class="'tone-' + c.cover.tone">
                  <div class="flex flex-1 items-center"><img :src="s.src" :alt="s.alt" :width="s.w" :height="s.h" loading="lazy" decoding="async" class="relative h-auto w-full rounded-md border border-line bg-white shadow-[0_18px_40px_-20px_rgba(11,27,51,0.45)]" /></div>
                  <figcaption class="relative mt-4 text-[13px] font-semibold tracking-[0.12em]" :class="c.cover.tone === 'navy' ? 'text-gold-300' : 'text-gold-700'">{{ s.caption }}</figcaption>
                </figure>
              </div>
              <p class="mt-3 text-[13px] text-ink/70">{{ c.shotNote }}</p>
            </template>
            <template v-else>
              <div class="rise" style="animation-delay:220ms"><case-cover :item="c" hero /></div>
              <p class="mt-3 text-[13px] text-ink/70">概念示例：畫面為 NextEra 原創設計，用以說明交付形式，並非真實客戶作品。</p>
            </template>
  
            <dl class="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2" :class="c.link ? 'lg:grid-cols-5' : 'lg:grid-cols-4'">
              <div class="bg-paper p-6"><dt class="meta-label">行業</dt><dd class="mt-2 text-[15px] text-navy">{{ c.industry }}</dd></div>
              <div class="bg-paper p-6"><dt class="meta-label">服務範圍</dt><dd class="mt-2 text-[15px] leading-relaxed text-navy">{{ c.scope.join('、') }}</dd></div>
              <div class="bg-paper p-6"><dt class="meta-label">{{ c.internal ? '運營時期' : '合作時期' }}</dt><dd class="mt-2 text-[15px] text-navy">{{ c.period }}</dd></div>
              <div class="bg-paper p-6"><dt class="meta-label">{{ c.internal ? '相關服務' : '對應服務' }}</dt><dd class="mt-2 text-[15px]"><a :href="'/services/' + service.slug" class="text-navy underline decoration-gold underline-offset-4 hover:decoration-navy">{{ service.short || service.zh }}</a></dd></div>
              <div v-if="c.link" class="bg-paper p-6"><dt class="meta-label">平台</dt><dd class="mt-2 text-[15px]"><a :href="c.link" target="_blank" rel="noopener noreferrer" class="text-navy underline decoration-gold underline-offset-4 hover:decoration-navy">{{ c.platform }} 帳號<span class="sr-only">（在新分頁開啟）</span></a></dd></div>
            </dl>
            <p v-if="c.capability" class="mt-6 border-l-2 border-gold bg-sand/60 p-5 text-[15px] leading-[1.85] text-ink/85" role="note">{{ c.capability }}</p>
            <p v-if="c.internalNote" class="mt-6 border-l-2 border-gold bg-sand/60 p-5 text-[15px] leading-[1.85] text-ink/85" role="note">{{ c.internalNote }}</p>
          </div>
  
          <section v-if="c.challenge" class="py-20 lg:py-28" aria-labelledby="challenge-title">
            <div class="container grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div class="lg:col-span-4"><eyebrow text="CHALLENGE・挑戰與目標" /></div>
              <div class="lg:col-span-8">
                <h2 id="challenge-title" class="h2">客戶挑戰與目標</h2>
                <p class="mt-6 text-[17px] leading-[1.9] text-ink/85" v-reveal>{{ c.challenge }}</p>
                <h3 class="mt-10 text-[13px] font-semibold tracking-[0.18em] text-gold-700">目標</h3>
                <ol class="mt-4 border-t border-line">
                  <li v-for="(g, i) in c.goals" :key="g" class="flex gap-5 border-b border-line py-4" v-reveal="i">
                    <span class="font-display text-lg text-gold-600">{{ String(i + 1).padStart(2, '0') }}</span>
                    <span class="text-[16px] text-navy">{{ g }}</span>
                  </li>
                </ol>
              </div>
            </div>
          </section>
  
          <section v-if="c.strategy" class="bg-sand py-20 lg:py-28" aria-labelledby="strategy-title">
            <div class="container grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div class="lg:col-span-4"><eyebrow text="APPROACH・策略與執行" /></div>
              <div class="lg:col-span-8">
                <h2 id="strategy-title" class="h2">策略及執行方案</h2>
                <ol class="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
                  <li v-for="(st, i) in c.strategy" :key="st.t" class="bg-paper p-7" v-reveal="i % 2">
                    <span class="font-display text-lg text-gold-600">{{ String(i + 1).padStart(2, '0') }}</span>
                    <h3 class="mt-3 font-serif-tc text-lg font-bold text-navy">{{ st.t }}</h3>
                    <p class="mt-2 text-[15px] leading-[1.8] text-ink/80">{{ st.d }}</p>
                  </li>
                </ol>
              </div>
            </div>
          </section>
  
          <section v-if="c.gallery" class="py-20 lg:py-28" aria-labelledby="gallery-title">
            <div class="container">
              <div class="grid gap-6 lg:grid-cols-12 lg:gap-10">
                <div class="lg:col-span-4"><eyebrow text="DELIVERABLES・作品與交付成果" /></div>
                <div class="lg:col-span-8">
                  <h2 id="gallery-title" class="h2">作品與交付成果</h2>
                  <p v-if="c.mediaNote" class="mt-5 text-[15px] leading-[1.85] text-ink/80">{{ c.mediaNote }}</p>
                </div>
              </div>
              <div class="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2">
                <figure v-for="(g, i) in c.gallery" :key="g.art + i" :class="g.wide ? 'md:col-span-2' : ''" v-reveal="i % 2">
                  <div class="gallery-frame flex items-center justify-center overflow-hidden px-[6%] py-[7%]" :class="tones[g.art]">
                    <div class="w-full" :class="artWidth[g.art] || (g.wide ? 'max-w-[980px]' : 'max-w-[560px]')"><art-piece :art="g.art" :label="g.alt" :data="g.data" /></div>
                  </div>
                  <figcaption class="mt-4 flex gap-3 text-[14px] text-ink/80"><span class="font-display text-gold-600">{{ String(i + 1).padStart(2, '0') }}</span>{{ g.caption }}</figcaption>
                </figure>
              </div>
            </div>
          </section>
  
          <section class="py-20 lg:py-28" :class="c.gallery ? 'border-t border-line' : ''" aria-labelledby="result-title">
            <div class="container grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div class="lg:col-span-4"><eyebrow text="RESULTS・成效" /></div>
              <div class="lg:col-span-8">
                <h2 id="result-title" class="h2">可驗證的成效</h2>
                <template v-if="c.results.kpis">
                  <dl class="mt-8 grid gap-x-8 gap-y-3 border-y border-line py-6 text-[14px] sm:grid-cols-[7rem_1fr]">
                    <dt class="font-semibold text-gold-700">數據期間</dt><dd class="text-ink">{{ c.results.period }}</dd>
                    <dt class="font-semibold text-gold-700">數據來源</dt><dd class="text-ink">{{ c.results.source }}</dd>
                  </dl>
                  <kpi-viz :kpis="c.results.kpis" :split="c.results.split" />
                  <ul class="mt-8 space-y-3">
                    <li v-for="n in c.results.notes" :key="n" class="flex gap-3 text-[14px] leading-[1.8] text-ink/80"><span class="mt-[11px] h-px w-4 shrink-0 bg-gold" aria-hidden="true"></span>{{ n }}</li>
                  </ul>
                </template>
                <template v-else-if="c.results.metrics.length">
                  <dl class="mt-8 grid gap-x-8 gap-y-3 border-y border-line py-6 text-[14px] sm:grid-cols-[7rem_1fr]">
                    <dt class="font-semibold text-gold-700">{{ c.internal ? '運營期間' : '合作期間' }}</dt><dd class="text-ink">{{ c.results.period }}</dd>
                    <dt class="font-semibold text-gold-700">比較基準</dt><dd class="text-ink">{{ c.results.baseline }}</dd>
                    <dt class="font-semibold text-gold-700">數據來源</dt><dd class="text-ink">{{ c.results.source }}</dd>
                  </dl>
                  <metric-viz :metrics="c.results.metrics" :internal="c.internal" />
                  <div class="mt-8 overflow-x-auto">
                    <table class="w-full min-w-[520px] border-collapse text-left">
                      <caption class="sr-only">{{ c.internal ? '運營前後' : '合作前後' }}的 {{ c.platform }} 數據比較</caption>
                      <thead>
                        <tr class="border-b border-navy text-[12px] tracking-[0.12em] text-ink/70">
                          <th scope="col" class="py-3 pr-4 font-semibold">指標</th>
                          <th scope="col" class="py-3 pr-4 text-right font-semibold">{{ c.internal ? '運營前' : '合作前' }}</th>
                          <th scope="col" class="py-3 pr-4 text-right font-semibold">{{ c.internal ? '運營期間' : '合作期間' }}</th>
                          <th scope="col" class="py-3 text-right font-semibold">變化</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="m in c.results.metrics" :key="m.label" class="border-b border-line">
                          <th scope="row" class="py-5 pr-4 text-[15px] font-semibold text-navy">{{ m.label }}</th>
                          <td class="py-5 pr-4 text-right tabular-nums text-ink/80">{{ m.before }}</td>
                          <td class="py-5 pr-4 text-right font-display text-2xl tabular-nums text-navy">{{ m.after }}</td>
                          <td class="py-5 text-right text-[14px] font-semibold text-gold-700">{{ m.change }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <ul class="mt-8 space-y-3">
                    <li v-for="n in c.results.notes" :key="n" class="flex gap-3 text-[14px] leading-[1.8] text-ink/80"><span class="mt-[11px] h-px w-4 shrink-0 bg-gold" aria-hidden="true"></span>{{ n }}</li>
                  </ul>
                </template>
                <template v-else>
                  <p class="mt-6 border-l-2 border-gold pl-5 text-[16px] leading-[1.85] text-navy">{{ c.results.note }}</p>
                  <h3 v-if="c.results.plan" class="mt-10 text-[13px] font-semibold tracking-[0.18em] text-gold-700">正式合作時的衡量方式</h3>
                  <ul v-if="c.results.plan" class="mt-4 border-t border-line">
                    <li v-for="p in c.results.plan" :key="p" class="flex gap-4 border-b border-line py-4 text-[15px] leading-[1.8] text-ink"><span class="mt-[12px] h-px w-4 shrink-0 bg-gold" aria-hidden="true"></span>{{ p }}</li>
                  </ul>
                </template>
              </div>
            </div>
          </section>
  
          <cta-band eyebrow="RELATED SERVICE" :title="'想為你的品牌建立類似方案？'" :text="'此項目對應「' + (service.short || service.zh) + '」服務。告訴我們你的情況，我們會協助你確認合適的範圍。'" :href="contactHref(service.key, { case: c.slug })" :label="service.cta" />
  
          <nav class="border-b border-line" aria-label="其他案例">
            <div class="container grid sm:grid-cols-2">
              <a :href="'/work/' + prev.slug" class="group border-b border-line py-8 sm:border-b-0 sm:border-r sm:pr-8">
                <span class="text-[12px] font-semibold tracking-[0.16em] text-gold-700">上一個項目</span>
                <span class="mt-2 block font-serif-tc text-xl font-bold text-navy group-hover:underline">{{ prev.title }}</span>
              </a>
              <a :href="'/work/' + next.slug" class="group py-8 sm:pl-8 sm:text-right">
                <span class="text-[12px] font-semibold tracking-[0.16em] text-gold-700">下一個項目</span>
                <span class="mt-2 block font-serif-tc text-xl font-bold text-navy group-hover:underline">{{ next.title }}</span>
              </a>
            </div>
          </nav>
        </article>
        <page-not-found v-else />`,
    };
  
    const PageAbout = {
      components: { BrandLogo, Eyebrow, ArrowIcon, CtaBand },
      computed: {
        services() { return C.services; },
        markets() { return C.site.markets; },
        team() { return C.team; },
        realCases() { return C.cases.filter((c) => !c.concept); },
      },
      data: () => ({
        principles: [
          { t: '先確認範圍，再開始執行', d: '工作範圍、時程、修改安排及雙方責任，會在合作前以書面確認。' },
          { t: '重要內容經你確認', d: '內容日曆、設計素材、網站設計稿等成果，均經你確認後才進入下一步。' },
          { t: 'AI 產出必經人工審核', d: '使用 AI 的內容會核對事實、品牌語氣及資料安全，才會交付或發布。' },
          { t: '成果可交接、可延續', d: '以文件、模板與 SOP 交付，讓團隊在合作後仍能持續使用。' },
        ],
        pillars: [
          { t: '執行', d: '由代營運團隊處理日常營銷內容，建立穩定的品牌形象與發布節奏。', s: 'managed' },
          { t: '能力', d: '透過企業培訓，讓內部團隊掌握 AI，建立可重用的工作流程。', s: 'training' },
          { t: '工具', d: '建立配合業務的網站及專屬 AI 工具，讓查詢與日常工作更順暢。', s: 'webai' },
        ],
      }),
      methods: { href(key) { return '/services/' + serviceByKey(key).slug; } },
      template: `
        <div>
          <section class="relative overflow-hidden pb-20 pt-32 sm:pt-40 lg:pb-28" aria-labelledby="page-title">
            <div class="tech-grid mask-fade-r pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <div class="container relative grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
              <div class="lg:col-span-7">
                <p class="rise eyebrow text-gold-700"><span class="eyebrow-line" aria-hidden="true"></span><span class="eyebrow-node" aria-hidden="true"></span>ABOUT NEXTERA</p>
                <h1 id="page-title" tabindex="-1" class="rise mt-6 font-serif-tc text-[clamp(2.3rem,5vw,4.2rem)] font-bold leading-[1.25] text-navy outline-none" style="animation-delay:80ms">關於 NextEra</h1>
                <p class="rise lead mt-7 max-w-2xl" style="animation-delay:160ms">NextEra 是一間 AI-driven Marketing Consultancy，結合營銷策略、創意內容、企業培訓及 AI 技術，協助企業完成日常營銷執行、提升團隊 AI 應用能力，並建立配合業務需要的網站及專屬工具。</p>
              </div>
              <div class="rise flex justify-center lg:col-span-5 lg:justify-end" style="animation-delay:200ms">
                <div class="relative px-10 py-12">
                  <span class="absolute inset-0 border border-line" aria-hidden="true"></span>
                  <brand-logo size="lg" />
                </div>
              </div>
            </div>
          </section>
  
          <section class="bg-sand py-20 lg:py-28" aria-labelledby="belief-title">
            <div class="container grid gap-10 lg:grid-cols-12">
              <div class="lg:col-span-4"><eyebrow text="OUR BELIEF・品牌理念" /></div>
              <h2 id="belief-title" class="font-serif-tc text-[clamp(1.9rem,4.2vw,3.4rem)] font-bold leading-[1.45] text-navy lg:col-span-8" v-reveal>
                <span class="block">以<span class="text-gold-600">策略</span>定義方向，</span>
                <span class="block">以<span class="text-gold-600">創意</span>建立影響力，</span>
                <span class="block">以 <span class="text-gold-600">AI</span> 提升執行效率。</span>
              </h2>
            </div>
          </section>
  
          <section class="py-20 lg:py-28" aria-labelledby="pillars-title">
            <div class="container">
              <div class="grid gap-6 lg:grid-cols-12 lg:gap-10">
                <div class="lg:col-span-4"><eyebrow text="WHAT WE DO・三項服務" /></div>
                <h2 id="pillars-title" class="h2 lg:col-span-8">執行、能力與工具，<br />由同一個團隊連貫處理。</h2>
              </div>
              <ol class="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
                <li v-for="(p, i) in pillars" :key="p.t" class="flex flex-col bg-paper p-8 lg:p-10" v-reveal="i">
                  <span class="font-display text-[2.4rem] leading-none text-gold-600">{{ String(i + 1).padStart(2, '0') }}</span>
                  <h3 class="mt-6 font-serif-tc text-2xl font-bold text-navy">{{ p.t }}</h3>
                  <p class="mt-3 flex-1 text-[15px] leading-[1.85] text-ink/80">{{ p.d }}</p>
                  <a :href="href(p.s)" class="link-arrow mt-6 text-navy">{{ $content.services.find(x => x.key === p.s).short || $content.services.find(x => x.key === p.s).zh }}<arrow-icon /></a>
                </li>
              </ol>
            </div>
          </section>
  
          <section class="bg-navy py-20 text-paper lg:py-28" aria-labelledby="team-title">
            <div class="container">
              <div class="grid gap-6 lg:grid-cols-12 lg:gap-10">
                <div class="lg:col-span-4"><eyebrow text="OUR TEAM・團隊" light /></div>
                <div class="lg:col-span-8">
                  <h2 id="team-title" class="h2 text-paper">團隊專業</h2>
                  <p class="mt-5 max-w-2xl text-[17px] leading-[1.85] text-paper/80">{{ team.intro }}</p>
                </div>
              </div>
              <ul v-if="team.members.length" class="mt-14 space-y-16">
                <li v-for="m in team.members" :key="m.name" class="border-t border-white/15 pt-12">
                  <div class="grid gap-10 lg:grid-cols-12 lg:gap-10">
                    <div class="lg:col-span-4">
                      <div class="relative mx-auto max-w-[320px] lg:mx-0">
                        <span class="hud-corners" aria-hidden="true"></span>
                        <img v-if="m.photo" :src="m.photo" :alt="m.name + ' 的相片'" width="512" height="660" loading="lazy" decoding="async" class="aspect-[4/5] w-full object-cover" :class="m.color ? '' : 'grayscale'" />
                        <div v-else class="tech-grid-dark flex aspect-[4/5] w-full items-center justify-center border border-white/15 bg-navy-900" aria-hidden="true">
                          <span class="font-display text-[clamp(4rem,9vw,6.5rem)] leading-none text-gold-300">{{ m.monogram }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="lg:col-span-8">
                      <p class="sys-label !text-gold-300/80">TEAM_MEMBER</p>
                      <h3 class="mt-3 font-serif-tc text-[clamp(1.6rem,3vw,2.2rem)] font-bold">{{ m.name }}</h3>
                      <p class="mt-1 text-[15px] font-semibold text-gold-300">{{ m.role }}</p>
                      <p v-if="m.bio" class="mt-5 max-w-2xl text-[16px] leading-[1.85] text-paper/80">{{ m.bio }}</p>
                      <ul v-if="m.skills" class="mt-6 flex flex-wrap gap-2" aria-label="專長">
                        <li v-for="s in m.skills" :key="s" class="border border-white/20 px-3 py-1.5 text-[13px] text-paper/85">{{ s }}</li>
                      </ul>
                      <div v-if="m.highlights" class="mt-8 grid gap-6 md:grid-cols-2">
                        <div v-for="h in m.highlights" :key="h.t" class="border-l-2 border-gold-300 pl-5">
                          <h4 class="font-serif-tc text-[17px] font-bold">{{ h.t }}</h4>
                          <ul class="mt-3 space-y-2.5">
                            <li v-for="p in h.points" :key="p" class="flex gap-3 text-[14px] leading-[1.7] text-paper/80"><span class="mt-[10px] h-px w-3 shrink-0 bg-gold" aria-hidden="true"></span>{{ p }}</li>
                          </ul>
                          <a v-if="h.caseSlug" :href="'/work/' + h.caseSlug" class="link-arrow mt-4 text-[14px] text-gold-300">查看內部運營成果<arrow-icon /></a>
                        </div>
                      </div>
                      <template v-if="m.experience">
                        <h4 class="mt-10 font-mono text-[12px] tracking-[0.16em] text-gold-300">{{ m.experienceTitle || '過往經歷' }}</h4>
                        <ol class="mt-4 grid gap-px border border-white/15 bg-white/15" :class="m.experience.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'">
                          <li v-for="x in m.experience" :key="x.org" class="bg-navy p-6">
                            <p class="font-serif-tc text-[17px] font-bold">{{ x.org }}</p>
                            <p v-if="x.role" class="mt-1 text-[13px] text-gold-300">{{ x.role }}</p>
                            <ul class="mt-4 space-y-2.5">
                              <li v-for="p in x.points" :key="p" class="flex gap-3 text-[14px] leading-[1.7] text-paper/80"><span class="mt-[10px] h-px w-3 shrink-0 bg-gold" aria-hidden="true"></span>{{ p }}</li>
                            </ul>
                          </li>
                        </ol>
                      </template>
                    </div>
                  </div>
                  <div v-if="m.evidence" class="mt-10 grid gap-6 md:grid-cols-2">
                    <figure v-for="e in m.evidence" :key="e.src">
                      <img :src="e.src" :alt="e.alt" :width="e.w" :height="e.h" loading="lazy" decoding="async" class="h-auto w-full border border-white/15 bg-white" />
                      <figcaption class="mt-3 text-[13px] leading-[1.7] text-paper/70">{{ e.caption }}</figcaption>
                    </figure>
                  </div>
                  <p v-if="m.note" class="mt-6 border-l-2 border-gold-300 pl-4 text-[13px] leading-[1.8] text-paper/70" role="note">{{ m.note }}</p>
                </li>
              </ul>
              <h3 class="mt-16 font-mono text-[12px] tracking-[0.16em] text-gold-300">團隊能力</h3>
              <ol class="mt-4 grid gap-px border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-3">
                <li v-for="(t, i) in team.capabilities" :key="t.t" class="bg-navy p-7 lg:p-9" v-reveal="i % 3">
                  <span class="font-display text-lg text-gold-300">{{ String(i + 1).padStart(2, '0') }}</span>
                  <h3 class="mt-3 font-serif-tc text-lg font-bold">{{ t.t }}</h3>
                  <p class="mt-2 text-[15px] leading-[1.8] text-paper/75">{{ t.d }}</p>
                </li>
              </ol>
              <div v-if="realCases.length" class="mt-12 flex flex-col gap-4 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-[15px] text-paper/80">社交媒體運營經驗包括：<template v-for="(c, i) in realCases" :key="c.slug"><a :href="'/work/' + c.slug" class="font-semibold text-paper underline decoration-gold-300 underline-offset-4 hover:decoration-paper">{{ c.industry }}（{{ c.platform }}）</a><span v-if="i < realCases.length - 1">、</span></template></p>
                <a href="/work" class="link-arrow shrink-0 text-gold-300">瀏覽所有案例<arrow-icon /></a>
              </div>
            </div>
          </section>
  
          <section class="border-t border-line py-20 lg:py-28" aria-labelledby="principles-title">
            <div class="container grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div class="lg:col-span-4">
                <eyebrow text="HOW WE WORK・工作原則" />
                <h2 id="principles-title" class="h2 mt-6">我們的工作原則</h2>
              </div>
              <ol class="border-t border-line lg:col-span-8">
                <li v-for="(p, i) in principles" :key="p.t" class="grid gap-2 border-b border-line py-7 sm:grid-cols-[4rem_1fr]" v-reveal>
                  <span class="font-display text-2xl text-gold-600">{{ String(i + 1).padStart(2, '0') }}</span>
                  <div>
                    <h3 class="font-serif-tc text-xl font-bold text-navy">{{ p.t }}</h3>
                    <p class="mt-2 text-[15px] leading-[1.85] text-ink/80">{{ p.d }}</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>
  
          <section class="bg-sand py-20 lg:py-24" aria-labelledby="markets-title">
            <div class="container grid gap-8 lg:grid-cols-12 lg:gap-10">
              <div class="lg:col-span-4"><eyebrow text="WHO WE SERVE・服務對象" /></div>
              <div class="lg:col-span-8">
                <h2 id="markets-title" class="h2">優先服務澳門及香港中小企業</h2>
                <ul class="mt-8 flex flex-wrap gap-3">
                  <li v-for="m in markets" :key="m" class="border border-navy/20 bg-paper px-5 py-2.5 font-serif-tc text-[17px] font-bold text-navy">{{ m }}</li>
                </ul>
              </div>
            </div>
          </section>
  
          <cta-band title="告訴我們，你想改善哪一部分。" text="分享你的業務目標與目前的挑戰，我們將協助你梳理適合的合作方向。" href="/contact" label="預約需求諮詢" />
        </div>`,
    };
  
    /* ---------------- Contact form ---------------- */
    const OPTIONS = {
      platforms: ['Facebook', 'Instagram', '小紅書', 'Threads', 'YouTube', '其他'],
      managedIssue: ['發布不穩定，缺乏內容規劃', '品牌形象不一致', '缺乏設計或短影片製作能力', '沒有內部人手管理', '希望內容帶來更多查詢', '其他'],
      trainingSize: ['1–5 人', '6–15 人', '16–30 人', '30 人以上', '未確定'],
      aiLevel: ['大部分同事未曾使用', '部分同事偶爾使用', '已在日常工作中使用'],
      projectTypes: ['品牌官網', 'Landing Page', '查詢表單／預約入口', '品牌內容 AI 助理', '企業知識庫助理', '客戶查詢助理', '營銷報告／自動化流程', '未確定'],
      startTime: ['一個月內', '一至三個月內', '三個月後', '未確定'],
    };
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRe = /^[+\d][\d\s()-]{5,19}$/;
    function isValidLink(v) {
      if (/\s/.test(v)) return false;
      try { const u = new URL(/^https?:\/\//i.test(v) ? v : 'https://' + v); return /\.[a-z]{2,}$/i.test(u.hostname); } catch (e) { return false; }
    }
  
    const ContactForm = {
      components: { ArrowIcon },
      props: { preset: Object },
      data() {
        return {
          opts: OPTIONS,
          services: C.services,
          form: this.blank(),
          errors: {},
          touched: {},
          status: 'idle',
          alert: '',
          submitError: '',
          endpoint: (C.contact.formEndpoint || '').trim(),
        };
      },
      computed: {
        /* 本機 nuxt dev 走示範；正式／netlify 走 Function */
        demo() { return import.meta.dev || !this.endpoint; },
        has() { return { managed: this.form.services.includes('managed'), training: this.form.services.includes('training'), webai: this.form.services.includes('webai') }; },
        fromCase() { return this.preset && this.preset.case ? C.cases.find((c) => c.slug === this.preset.case) : null; },
        selectedLabels() { return this.form.services.map((k) => serviceByKey(k).zh); },
      },
      watch: {
        preset: { immediate: true, handler(p) { this.applyPreset(p); } },
        form: { deep: true, handler() { Object.keys(this.touched).forEach((f) => { if (this.touched[f]) this.validate(f); }); if (this.alert && !this.errorFields().length) this.alert = ''; } },
      },
      methods: {
        blank() {
          return { name: '', company: '', email: '', phone: '', website: '', services: [], platforms: [], managedIssue: '', trainingSize: '', aiLevel: '', trainingGoal: '', projectTypes: [], currentSystems: '', integration: '', message: '', startTime: '', hp_company: '' };
        },
        applyPreset(p) {
          if (!p) return;
          let key = p.service;
          if (!key && p.case) { const c = C.cases.find((x) => x.slug === p.case); if (c) key = categoryByKey(c.category).service; }
          if (key && serviceByKey(key) && !this.form.services.includes(key)) this.form.services.push(key);
        },
        fields() {
          const f = ['name', 'company', 'email', 'phone', 'website', 'services'];
          if (this.has.managed) f.push('platforms', 'managedIssue');
          if (this.has.training) f.push('trainingSize', 'aiLevel');
          if (this.has.webai) f.push('projectTypes');
          f.push('message');
          return f;
        },
        errorFields() { return this.fields().filter((f) => this.errors[f]); },
        validate(f) {
          const v = this.form[f];
          const t = typeof v === 'string' ? v.trim() : v;
          let m = '';
          switch (f) {
            case 'name': if (!t) m = '請輸入你的姓名'; break;
            case 'company': if (!t) m = '請輸入公司名稱'; break;
            case 'email': if (!t) m = '請輸入電郵地址'; else if (!emailRe.test(t)) m = '電郵格式不正確，例如 name@company.com'; break;
            case 'phone': if (t && !phoneRe.test(t)) m = '電話格式不正確，可包括地區碼，例如 +853 6xxx xxxx'; break;
            case 'website': if (t && !isValidLink(t)) m = '連結格式不正確，例如 https://example.com'; break;
            case 'services': if (!t.length) m = '請選擇最少一項感興趣的服務'; break;
            case 'platforms': if (this.has.managed && !t.length) m = '請選擇最少一個平台'; break;
            case 'managedIssue': if (this.has.managed && !t) m = '請選擇目前最主要的問題'; break;
            case 'trainingSize': if (this.has.training && !t) m = '請選擇預計參與人數'; break;
            case 'aiLevel': if (this.has.training && !t) m = '請選擇團隊目前的 AI 使用程度'; break;
            case 'projectTypes': if (this.has.webai && !t.length) m = '請選擇最少一項項目需求'; break;
            case 'message': if (!t) m = '請簡述你的需求'; else if (t.length < 20) m = '請至少輸入 20 個字（目前 ' + t.length + ' 個字）'; break;
          }
          this.errors[f] = m;
          return !m;
        },
        touch(f) { this.touched[f] = true; this.validate(f); },
        focusField(f) {
          const el = document.getElementById('f-' + f) || document.querySelector('[name="' + f + '"]');
          if (el) el.focus();
        },
        payload() {
          const f = this.form;
          const join = (arr) => (arr && arr.length ? arr.join('、') : '');
          const data = {
            name: f.name.trim(),
            company: f.company.trim(),
            email: f.email.trim(),
            phone: f.phone.trim(),
            website: f.website.trim(),
            services: join(this.selectedLabels),
            message: f.message.trim(),
            startTime: f.startTime,
            sourceCase: this.fromCase ? this.fromCase.slug : '',
          };
          if (this.has.managed) Object.assign(data, { platforms: join(f.platforms), managedIssue: f.managedIssue });
          if (this.has.training) Object.assign(data, { trainingSize: f.trainingSize, aiLevel: f.aiLevel, trainingGoal: f.trainingGoal.trim() });
          if (this.has.webai) Object.assign(data, { projectTypes: join(f.projectTypes), currentSystems: f.currentSystems.trim(), integration: f.integration.trim() });
          if (!this.demo) {
            Object.assign(data, {
              subject: 'NextEra 網站查詢｜' + (f.company.trim() || f.name.trim() || '新提交'),
              hp_company: f.hp_company,
              botcheck: !!f.hp_company,
            });
          }
          return data;
        },
        async submit() {
          this.submitError = '';
          const fields = this.fields();
          fields.forEach((f) => { this.touched[f] = true; this.validate(f); });
          const bad = this.errorFields();
          if (bad.length) {
            this.alert = '有 ' + bad.length + ' 個欄位需要修正，請檢查標示的項目。';
            await nextTick();
            this.focusField(bad[0]);
            return;
          }
          this.alert = '';
          this.status = 'submitting';
          /* 蜜罐被填：假裝成功，不送出 */
          if (this.form.hp_company) {
            await new Promise((r) => setTimeout(r, 600));
            this.status = 'success';
            await nextTick();
            if (this.$refs.result) this.$refs.result.focus();
            return;
          }
          if (this.demo) {
            await new Promise((r) => setTimeout(r, 1000));
            this.status = 'demo-success';
          } else {
            try {
              const res = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(this.payload()),
              });
              const json = await res.json().catch(() => ({}));
              if (!res.ok || json.success === false) throw new Error(json.message || ('HTTP ' + res.status));
              this.status = 'success';
            } catch (e) {
              this.status = 'idle';
              this.submitError = '提交未能完成，你的資料尚未送出。請稍後再試。';
              return;
            }
          }
          await nextTick();
          if (this.$refs.result) this.$refs.result.focus();
        },
        reset() {
          this.form = this.blank();
          this.errors = {}; this.touched = {}; this.alert = ''; this.submitError = ''; this.status = 'idle';
          this.applyPreset(this.preset);
          nextTick(() => this.focusField('name'));
        },
        err(f) { return this.errors[f] ? 'e-' + f : null; },
      },
      template: `
        <div class="border border-line bg-white p-6 sm:p-10">
          <div v-if="demo" class="flex gap-3 border-l-2 border-gold bg-sand/70 px-4 py-3 text-[14px] leading-relaxed text-ink" role="note">
            <p><strong class="font-semibold text-navy">示範模式：</strong>本機開發環境不會呼叫正式表單服務，提交內容不會被寄出或儲存。</p>
          </div>
  
          <div v-if="status === 'demo-success' || status === 'success'" ref="result" tabindex="-1" class="py-10 text-center outline-none" role="status">
            <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold-700">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
            </span>
            <template v-if="status === 'success'">
              <h2 class="mt-6 font-serif-tc text-2xl font-bold text-navy">已收到你的查詢</h2>
              <p class="mx-auto mt-3 max-w-md text-[15px] leading-[1.85] text-ink/80">我們已確認收到資料，會按你提供的聯絡方式跟進。</p>
            </template>
            <template v-else>
              <h2 class="mt-6 font-serif-tc text-2xl font-bold text-navy">示範提交完成</h2>
              <p class="mx-auto mt-3 max-w-md text-[15px] leading-[1.85] text-ink/80">表單驗證通過。由於目前為示範模式，<strong class="font-semibold text-navy">你的資料並未寄出，也沒有被儲存</strong>。</p>
            </template>
            <dl class="mx-auto mt-8 max-w-md divide-y divide-line border border-line text-left text-sm">
              <div class="flex justify-between gap-4 px-4 py-3"><dt class="text-ink/70">公司名稱</dt><dd class="text-right font-medium text-navy">{{ form.company }}</dd></div>
              <div class="flex justify-between gap-4 px-4 py-3"><dt class="text-ink/70">感興趣的服務</dt><dd class="text-right font-medium text-navy">{{ selectedLabels.join('、') }}</dd></div>
            </dl>
            <button type="button" class="btn btn-outline mt-8" @click="reset">重新填寫</button>
          </div>
  
          <form v-else class="mt-7" novalidate aria-labelledby="form-title" @submit.prevent="submit">
            <h2 id="form-title" class="font-serif-tc text-2xl font-bold text-navy">需求查詢表單</h2>
            <p class="mt-2 text-[13px] text-ink/70">標示 <span class="text-error" aria-hidden="true">*</span> 的欄位為必填。</p>
            <p v-if="fromCase" class="mt-4 border border-line bg-sand/60 px-4 py-3 text-[14px] text-ink">由案例「{{ fromCase.title }}」進入，已預選相關服務。</p>
  
            <div v-if="alert" class="mt-5 border border-error/40 bg-error/5 px-4 py-3 text-sm font-medium text-error" role="alert">{{ alert }}</div>
            <div v-if="submitError" class="mt-5 border border-error/40 bg-error/5 px-4 py-3 text-sm font-medium text-error" role="alert">{{ submitError }}</div>
  
            <fieldset :disabled="status === 'submitting'" class="mt-8 space-y-9">
              <legend class="sr-only">聯絡資料與需求</legend>
  
              <div class="grid gap-5 sm:grid-cols-2">
                <div>
                  <label for="f-name" class="label">姓名 <span class="text-error" aria-hidden="true">*</span></label>
                  <input id="f-name" v-model="form.name" type="text" autocomplete="name" required maxlength="80" class="input" :aria-invalid="errors.name ? 'true' : 'false'" :aria-describedby="err('name')" @blur="touch('name')" />
                  <p v-if="errors.name" id="e-name" class="field-error">{{ errors.name }}</p>
                </div>
                <div>
                  <label for="f-company" class="label">公司名稱 <span class="text-error" aria-hidden="true">*</span></label>
                  <input id="f-company" v-model="form.company" type="text" autocomplete="organization" required maxlength="120" class="input" :aria-invalid="errors.company ? 'true' : 'false'" :aria-describedby="err('company')" @blur="touch('company')" />
                  <p v-if="errors.company" id="e-company" class="field-error">{{ errors.company }}</p>
                </div>
                <div>
                  <label for="f-email" class="label">電郵 <span class="text-error" aria-hidden="true">*</span></label>
                  <input id="f-email" v-model="form.email" type="email" inputmode="email" autocomplete="email" required maxlength="160" placeholder="name@company.com" class="input" :aria-invalid="errors.email ? 'true' : 'false'" :aria-describedby="err('email')" @blur="touch('email')" />
                  <p v-if="errors.email" id="e-email" class="field-error">{{ errors.email }}</p>
                </div>
                <div>
                  <label for="f-phone" class="label">聯絡電話 <span class="font-normal text-ink/60">（選填）</span></label>
                  <input id="f-phone" v-model="form.phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="24" class="input" :aria-invalid="errors.phone ? 'true' : 'false'" :aria-describedby="err('phone')" @blur="touch('phone')" />
                  <p v-if="errors.phone" id="e-phone" class="field-error">{{ errors.phone }}</p>
                </div>
                <div class="sm:col-span-2">
                  <label for="f-website" class="label">網站或社交連結 <span class="font-normal text-ink/60">（選填）</span></label>
                  <input id="f-website" v-model="form.website" type="url" inputmode="url" autocomplete="url" maxlength="300" placeholder="https://" class="input" :aria-invalid="errors.website ? 'true' : 'false'" :aria-describedby="err('website')" @blur="touch('website')" />
                  <p v-if="errors.website" id="e-website" class="field-error">{{ errors.website }}</p>
                </div>
              </div>
  
              <fieldset :aria-describedby="err('services')" :aria-invalid="errors.services ? 'true' : 'false'">
                <legend class="label">感興趣的服務 <span class="font-normal text-ink/60">（可複選）</span> <span class="text-error" aria-hidden="true">*</span></legend>
                <div class="mt-3 grid gap-3 md:grid-cols-3">
                  <label v-for="(s, i) in services" :key="s.key" class="option-card">
                    <input :id="i === 0 ? 'f-services' : null" v-model="form.services" type="checkbox" name="services" :value="s.key" @change="touch('services')" />
                    <span>
                      <span class="block font-display text-sm text-gold-700">{{ s.no }}</span>
                      <span class="mt-1 block text-[15px] font-semibold leading-snug text-navy">{{ s.short || s.zh }}</span>
                    </span>
                  </label>
                </div>
                <p v-if="errors.services" id="e-services" class="field-error">{{ errors.services }}</p>
              </fieldset>
  
              <transition name="expand">
                <fieldset v-if="has.managed" class="sub-fieldset">
                  <legend class="sub-legend">代營運需要</legend>
                  <fieldset :aria-describedby="err('platforms')">
                    <legend class="label">主要平台 <span class="text-error" aria-hidden="true">*</span></legend>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <label v-for="(p, i) in opts.platforms" :key="p" class="chip-check">
                        <input :id="i === 0 ? 'f-platforms' : null" v-model="form.platforms" type="checkbox" name="platforms" :value="p" @change="touch('platforms')" /><span>{{ p }}</span>
                      </label>
                    </div>
                    <p v-if="errors.platforms" id="e-platforms" class="field-error">{{ errors.platforms }}</p>
                  </fieldset>
                  <div class="mt-6">
                    <label for="f-managedIssue" class="label">目前最主要的問題 <span class="text-error" aria-hidden="true">*</span></label>
                    <select id="f-managedIssue" v-model="form.managedIssue" class="input select" :aria-invalid="errors.managedIssue ? 'true' : 'false'" :aria-describedby="err('managedIssue')" @change="touch('managedIssue')" @blur="touch('managedIssue')">
                      <option value="" disabled>請選擇</option>
                      <option v-for="o in opts.managedIssue" :key="o" :value="o">{{ o }}</option>
                    </select>
                    <p v-if="errors.managedIssue" id="e-managedIssue" class="field-error">{{ errors.managedIssue }}</p>
                  </div>
                </fieldset>
              </transition>
  
              <transition name="expand">
                <fieldset v-if="has.training" class="sub-fieldset">
                  <legend class="sub-legend">培訓需要</legend>
                  <div class="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label for="f-trainingSize" class="label">預計參與人數 <span class="text-error" aria-hidden="true">*</span></label>
                      <select id="f-trainingSize" v-model="form.trainingSize" class="input select" :aria-invalid="errors.trainingSize ? 'true' : 'false'" :aria-describedby="err('trainingSize')" @change="touch('trainingSize')" @blur="touch('trainingSize')">
                        <option value="" disabled>請選擇</option>
                        <option v-for="o in opts.trainingSize" :key="o" :value="o">{{ o }}</option>
                      </select>
                      <p v-if="errors.trainingSize" id="e-trainingSize" class="field-error">{{ errors.trainingSize }}</p>
                    </div>
                    <fieldset :aria-describedby="err('aiLevel')">
                      <legend class="label">團隊 AI 使用程度 <span class="text-error" aria-hidden="true">*</span></legend>
                      <div class="mt-3 space-y-2">
                        <label v-for="(o, i) in opts.aiLevel" :key="o" class="flex items-center gap-3 text-[15px] text-ink">
                          <input :id="i === 0 ? 'f-aiLevel' : null" v-model="form.aiLevel" type="radio" name="aiLevel" :value="o" class="accent-navy h-4 w-4" @change="touch('aiLevel')" />{{ o }}
                        </label>
                      </div>
                      <p v-if="errors.aiLevel" id="e-aiLevel" class="field-error">{{ errors.aiLevel }}</p>
                    </fieldset>
                  </div>
                  <div class="mt-6">
                    <label for="f-trainingGoal" class="label">學習目標 <span class="font-normal text-ink/60">（選填）</span></label>
                    <textarea id="f-trainingGoal" v-model="form.trainingGoal" rows="3" maxlength="600" placeholder="例如：希望同事能用 AI 完成每月內容日曆初稿" class="input"></textarea>
                  </div>
                </fieldset>
              </transition>
  
              <transition name="expand">
                <fieldset v-if="has.webai" class="sub-fieldset">
                  <legend class="sub-legend">網頁與 AI 項目需要</legend>
                  <fieldset :aria-describedby="err('projectTypes')">
                    <legend class="label">項目需求 <span class="font-normal text-ink/60">（可複選）</span> <span class="text-error" aria-hidden="true">*</span></legend>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <label v-for="(p, i) in opts.projectTypes" :key="p" class="chip-check">
                        <input :id="i === 0 ? 'f-projectTypes' : null" v-model="form.projectTypes" type="checkbox" name="projectTypes" :value="p" @change="touch('projectTypes')" /><span>{{ p }}</span>
                      </label>
                    </div>
                    <p v-if="errors.projectTypes" id="e-projectTypes" class="field-error">{{ errors.projectTypes }}</p>
                  </fieldset>
                  <div class="mt-6 grid gap-6 sm:grid-cols-2">
                    <div>
                      <label for="f-currentSystems" class="label">現有系統 <span class="font-normal text-ink/60">（選填）</span></label>
                      <input id="f-currentSystems" v-model="form.currentSystems" type="text" maxlength="200" placeholder="例如：Wix 網站、Shopify、Google Workspace" class="input" />
                    </div>
                    <div>
                      <label for="f-integration" class="label">整合需要 <span class="font-normal text-ink/60">（選填）</span></label>
                      <input id="f-integration" v-model="form.integration" type="text" maxlength="200" placeholder="例如：查詢需寄到電郵及試算表" class="input" />
                    </div>
                  </div>
                </fieldset>
              </transition>
  
              <div>
                <div class="flex items-baseline justify-between gap-3">
                  <label for="f-message" class="label">需求描述 <span class="text-error" aria-hidden="true">*</span></label>
                  <span class="text-xs tabular-nums text-ink/60" aria-hidden="true">{{ form.message.length }} / 1000</span>
                </div>
                <textarea id="f-message" v-model="form.message" rows="5" required maxlength="1000" placeholder="例如：目前的業務目標、遇到的挑戰，以及希望改善的部分。" class="input" :aria-invalid="errors.message ? 'true' : 'false'" :aria-describedby="errors.message ? 'e-message hint-message' : 'hint-message'" @blur="touch('message')"></textarea>
                <p id="hint-message" class="mt-1.5 text-[13px] text-ink/70">請至少輸入 20 個字，方便我們初步了解情況。</p>
                <p v-if="errors.message" id="e-message" class="field-error">{{ errors.message }}</p>
              </div>
  
              <div class="sm:max-w-xs">
                <label for="f-startTime" class="label">預計開始時間 <span class="font-normal text-ink/60">（選填）</span></label>
                <select id="f-startTime" v-model="form.startTime" class="input select">
                  <option value="">請選擇</option>
                  <option v-for="o in opts.startTime" :key="o" :value="o">{{ o }}</option>
                </select>
              </div>

              <!-- 蜜罐：對真人隱藏，機器人常會填寫 -->
              <div class="hp-field" aria-hidden="true">
                <label for="f-hp">公司網站</label>
                <input id="f-hp" v-model="form.hp_company" type="text" name="hp_company" tabindex="-1" autocomplete="off" />
              </div>
            </fieldset>
  
            <div class="mt-10 flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-[13px] leading-relaxed text-ink/70">資料處理方式請參閱 <a href="/privacy" class="font-medium text-navy underline underline-offset-4">私隱政策</a>。</p>
              <button type="submit" class="btn btn-primary min-w-[12rem]" :disabled="status === 'submitting'" :aria-busy="status === 'submitting' ? 'true' : 'false'">
                <template v-if="status === 'submitting'"><span class="spinner" aria-hidden="true"></span>提交中…</template>
                <template v-else>{{ demo ? '提交需求（示範）' : '提交需求' }}</template>
              </button>
            </div>
            <p class="sr-only" aria-live="polite">{{ status === 'submitting' ? '正在處理提交' : '' }}</p>
          </form>
        </div>`,
    };
  
    const PageMedia = {
      components: { Eyebrow, ArrowIcon, CtaBand },
      computed: { m() { return C.media; } },
      template: `
        <div>
          <section class="relative overflow-hidden pb-16 pt-32 sm:pt-40" aria-labelledby="page-title">
            <div class="tech-grid mask-fade-r pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <div class="container relative">
              <p class="rise eyebrow text-gold-700"><span class="eyebrow-line" aria-hidden="true"></span><span class="eyebrow-node" aria-hidden="true"></span>NEXTERA MEDIA</p>
              <h1 id="page-title" tabindex="-1" class="rise mt-6 font-serif-tc text-[clamp(2.3rem,5vw,4.2rem)] font-bold leading-[1.2] text-navy outline-none" style="animation-delay:80ms">NextEra Media</h1>
              <p class="rise mt-3 font-mono text-[13px] tracking-[0.14em] text-gold-700" style="animation-delay:140ms">{{ m.tagline.toUpperCase() }}</p>
              <p class="rise lead mt-6 max-w-2xl" style="animation-delay:200ms">{{ m.bio }}</p>
              <div class="rise mt-8 flex flex-wrap gap-4" style="animation-delay:260ms">
                <a :href="m.instagram" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Instagram @{{ m.handle }}<arrow-icon /></a>
                <a :href="m.youtubeUrl" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">YouTube {{ m.channel }}<arrow-icon /></a>
              </div>
            </div>
          </section>
  
          <section class="pb-20" aria-labelledby="media-account">
            <div class="container">
              <figure class="cover tone-sand flex flex-col p-[5%] md:p-[4%]">
                <img :src="m.profile.src" :alt="m.profile.alt" :width="m.profile.w" :height="m.profile.h" loading="lazy" decoding="async" class="relative h-auto w-full rounded-md border border-line bg-white shadow-[0_18px_40px_-20px_rgba(11,27,51,0.45)]" />
                <figcaption class="relative mt-4 text-[13px] font-semibold tracking-[0.12em] text-gold-700">Instagram 帳號主頁</figcaption>
              </figure>
              <p class="mt-3 text-[13px] text-ink/70">{{ m.shotNote }}</p>
            </div>
          </section>
  
          <section class="border-t border-line py-20 lg:py-28" aria-labelledby="media-formats">
            <div class="container grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div class="lg:col-span-4"><eyebrow text="FORMATS・內容形式" /></div>
              <div class="lg:col-span-8">
                <h2 id="media-formats" class="h2">我們製作的內容</h2>
                <ol class="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
                  <li v-for="f in m.formats" :key="f.no" class="bg-paper p-7">
                    <span class="font-display text-[1.6rem] leading-none text-gold-600">{{ f.no }}</span>
                    <h3 class="mt-4 font-serif-tc text-lg font-bold text-navy">{{ f.t }}</h3>
                    <p class="mt-3 text-[14px] leading-[1.8] text-ink/80">{{ f.d }}</p>
                  </li>
                </ol>
              </div>
            </div>
          </section>
  
          <section class="border-t border-line py-20 lg:py-28" aria-labelledby="media-episodes">
            <div class="container">
              <div class="flex flex-wrap items-end justify-between gap-6">
                <div><eyebrow text="PODCAST・商業對談" /><h2 id="media-episodes" class="h2 mt-6">Podcast 內容</h2></div>
                <a :href="m.instagram" target="_blank" rel="noopener noreferrer" class="link-arrow text-navy">到 Instagram 收看<arrow-icon /></a>
              </div>
              <div class="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:max-w-3xl">
                <figure v-for="e in m.episodes" :key="e.src">
                  <img :src="e.src" :alt="e.no + '「' + e.title + '」封面'" width="466" height="621" loading="lazy" decoding="async" class="aspect-[3/4] w-full object-cover" />
                  <figcaption class="mt-3">
                    <span class="font-mono text-[11px] tracking-[0.14em] text-gold-700">{{ e.no }}</span>
                    <p class="mt-1 text-[14px] font-semibold leading-snug text-navy">{{ e.title }}</p>
                  </figcaption>
                </figure>
              </div>
              <p class="mt-6 text-[13px] text-ink/70">封面取自 Instagram 公開帖子；標題按封面文字整理。</p>
            </div>
          </section>
  
          <section class="border-t border-line py-20 lg:py-28" aria-labelledby="media-video">
            <div class="container grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
              <div class="lg:col-span-5">
                <eyebrow text="VIDEO・影片" />
                <h2 id="media-video" class="h2 mt-6">影片製作</h2>
                <p class="mt-5 text-[15px] leading-[1.85] text-ink/85">Podcast 對談同步製作為長片，於 YouTube 頻道發布。</p>
                <a :href="m.youtubeUrl" target="_blank" rel="noopener noreferrer" class="link-arrow mt-6 text-navy">到 YouTube 頻道收看<arrow-icon /></a>
              </div>
              <div class="lg:col-span-7">
                <div class="grid gap-6">
                  <a v-for="v in m.videos" :key="v.id" :href="'https://youtu.be/' + v.id" target="_blank" rel="noopener noreferrer" class="group grid items-center gap-4 sm:grid-cols-[220px_1fr]">
                    <img :src="v.src" :alt="'YouTube 影片封面：' + v.title" :width="v.w" :height="v.h" decoding="async" class="h-auto w-full rounded-md border border-line transition group-hover:opacity-90" />
                    <span>
                      <span class="block text-[15px] font-semibold leading-snug text-navy">{{ v.title }}</span>
                      <span class="mt-1.5 block font-mono text-[12px] text-ink/70">片長 {{ v.length }}</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </section>
  
          <cta-band title="想為你的品牌製作內容？" text="無論是 Podcast、Blog 或影片，告訴我們你想記錄的故事，我們會協助你確認合適的形式。" href="/contact?service=media" label="查詢內容製作" />
        </div>`,
    };
  
    const PageContact = {
      components: { ContactForm, Eyebrow },
      computed: {
        preset() { return { service: store.route.query.service, case: store.route.query.case }; },
        contact() { return C.contact; },
        channels() {
          const c = C.contact; const list = [];
          if (c.whatsapp) list.push({ label: 'WhatsApp', value: '傳送訊息', href: 'https://wa.me/' + c.whatsapp, ext: true });
          if (c.email) list.push({ label: '電郵', value: c.email, href: 'mailto:' + c.email });
          if (c.bookingUrl) list.push({ label: '預約時段', value: '選擇諮詢時間', href: c.bookingUrl, ext: true });
          return list;
        },
      },
      data: () => ({
        steps: [
          { t: '提交需求', d: '簡單說明業務目標、感興趣的服務及目前的挑戰。' },
          { t: '初步了解', d: '我們會先檢視資料，如有需要會向你了解更多細節。' },
          { t: '需求諮詢', d: '一起討論合適的服務範圍、時程及下一步安排。' },
        ],
      }),
      template: `
        <div>
          <section class="relative overflow-hidden pb-24 pt-32 sm:pt-40 lg:pb-32" aria-labelledby="page-title">
            <div class="tech-grid mask-fade-r pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <div class="container relative grid gap-14 lg:grid-cols-12 lg:gap-12">
              <div class="lg:col-span-5">
                <p class="rise eyebrow text-gold-700"><span class="eyebrow-line" aria-hidden="true"></span><span class="eyebrow-node" aria-hidden="true"></span>CONTACT</p>
                <h1 id="page-title" tabindex="-1" class="rise mt-6 font-serif-tc text-[clamp(1.9rem,3.6vw,2.9rem)] font-bold leading-[1.35] text-navy outline-none" style="animation-delay:80ms">告訴我們，<br />你想改善哪一部分。</h1>
                <p class="rise lead mt-6" style="animation-delay:160ms">分享你的業務目標與目前的挑戰，我們將協助你梳理適合的合作方向。</p>
  
                <ol class="mt-12 border-t border-line">
                  <li v-for="(s, i) in steps" :key="s.t" class="grid grid-cols-[3rem_1fr] gap-2 border-b border-line py-5">
                    <span class="font-display text-xl text-gold-600">{{ String(i + 1).padStart(2, '0') }}</span>
                    <div><p class="font-serif-tc text-[17px] font-bold text-navy">{{ s.t }}</p><p class="mt-1 text-[14px] leading-[1.8] text-ink/80">{{ s.d }}</p></div>
                  </li>
                </ol>
  
                <div v-if="channels.length" class="mt-10">
                  <p class="text-[12px] font-semibold tracking-[0.18em] text-gold-700">其他聯絡方式</p>
                  <ul class="mt-3 space-y-2">
                    <li v-for="c in channels" :key="c.label"><a :href="c.href" :target="c.ext ? '_blank' : null" :rel="c.ext ? 'noopener noreferrer' : null" class="link-arrow text-navy">{{ c.label }}：{{ c.value }}</a></li>
                  </ul>
                </div>
              </div>
              <div class="lg:col-span-7"><contact-form :preset="preset" /></div>
            </div>
          </section>
        </div>`,
    };
  
    const PageNotFound = {
      template: `
        <section class="pb-32 pt-40" aria-labelledby="page-title">
          <div class="container max-w-2xl">
            <p class="eyebrow text-gold-700"><span class="eyebrow-line" aria-hidden="true"></span><span class="eyebrow-node" aria-hidden="true"></span>404</p>
            <h1 id="page-title" tabindex="-1" class="mt-6 font-serif-tc text-4xl font-bold text-navy outline-none">找不到這個頁面</h1>
            <p class="lead mt-5">頁面可能已移除，或網址有誤。</p>
            <div class="mt-10 flex flex-wrap gap-3"><a href="/" class="btn btn-primary">返回首頁</a><a href="/work" class="btn btn-outline">瀏覽案例</a></div>
          </div>
        </section>`,
    };

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

  // 先編譯所有畫作／共用子元件，再編譯頁面（就地修改，避免巢狀引用拿到未編譯原稿）
  const sharedSeen = new WeakSet();
  Object.values(ART_COMPONENTS).forEach((c) => compileOptionsComponent(c, sharedSeen));
  compileOptionsComponent(FoodMotif, sharedSeen);
  compileOptionsComponent(PhoneFrame, sharedSeen);
  compileOptionsComponent(BrowserChrome, sharedSeen);
  compileOptionsComponent(ArtPiece, sharedSeen);

  vueApp.component('art-piece', ArtPiece);
  vueApp.component('browser-chrome', BrowserChrome);
  vueApp.component('phone-frame', PhoneFrame);
  vueApp.component('food-motif', FoodMotif);

  Object.entries(pages).forEach(([name, comp]) => {
    vueApp.component(name, compileOptionsComponent(comp, sharedSeen));
  });

  return pages;
}
