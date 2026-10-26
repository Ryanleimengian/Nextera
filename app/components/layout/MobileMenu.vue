<script setup>
import siteContent from '~/data/content.js';

const store = useSiteStore();
const route = useRoute();
const panel = ref(null);
const closeBtn = ref(null);
const restoreFocus = ref(true);

const links = [
  { to: '/work', t: '案例與作品' },
  { to: '/media', t: 'NextEra Media' },
  { to: '/about', t: '關於我們' },
  { to: '/contact', t: '聯絡我們' },
];

watch(
  () => store.menuOpen,
  async (v) => {
    if (import.meta.client) {
      document.documentElement.style.overflow = v ? 'hidden' : '';
      await nextTick();
      if (v) closeBtn.value?.focus();
      else if (restoreFocus.value) document.getElementById('menu-button')?.focus();
    }
  },
);

watch(() => route.path, () => {
  if (store.menuOpen) close(false);
});

function close(restore = true) {
  restoreFocus.value = restore !== false;
  store.menuOpen = false;
}

function onKey(e) {
  if (e.key === 'Escape') {
    close(true);
    return;
  }
  if (e.key !== 'Tab' || !panel.value) return;
  const f = Array.from(panel.value.querySelectorAll('a[href], button'));
  const first = f[0];
  const last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
</script>

<template>
  <Transition name="menu">
    <div
      v-if="store.menuOpen"
      id="mobile-menu"
      ref="panel"
      class="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-paper lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="網站選單"
      @keydown="onKey"
    >
      <div class="container flex h-[72px] shrink-0 items-center justify-between sm:h-[84px]">
        <NuxtLink to="/" aria-label="NextEra 首頁" @click="close(false)">
          <BrandLogo />
        </NuxtLink>
        <button ref="closeBtn" type="button" class="inline-flex h-11 w-11 items-center justify-center border border-navy/20 text-navy" @click="close(true)">
          <span class="sr-only">關閉選單</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <nav aria-label="手機導覽" class="container flex-1 pb-10 pt-4">
        <p class="eyebrow text-gold-700"><span class="eyebrow-line" aria-hidden="true" /><span class="eyebrow-node" aria-hidden="true" />服務</p>
        <ul class="mt-3 border-t border-line">
          <li v-for="s in siteContent.services" :key="s.key" class="menu-item border-b border-line">
            <NuxtLink :to="'/services/' + s.slug" class="flex items-baseline gap-4 py-4" @click="close(false)">
              <span class="font-display text-base text-gold-600">{{ s.no }}</span>
              <span class="font-serif-tc text-[19px] font-bold text-navy">{{ s.zh }}</span>
            </NuxtLink>
          </li>
        </ul>
        <ul class="mt-8 border-t border-line">
          <li v-for="l in links" :key="l.to" class="menu-item border-b border-line">
            <NuxtLink :to="l.to" class="block py-4 font-serif-tc text-[22px] font-bold text-navy" @click="close(false)">{{ l.t }}</NuxtLink>
          </li>
        </ul>
        <NuxtLink to="/contact" class="btn btn-primary mt-10 w-full" @click="close(false)">預約需求諮詢</NuxtLink>
      </nav>
    </div>
  </Transition>
</template>
