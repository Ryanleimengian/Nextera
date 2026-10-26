<script setup>
import siteContent from '~/data/content.js';

const store = useSiteStore();
const services = computed(() => siteContent.services);

const servicesOpen = ref(false);
const scrolled = ref(false);
const servicesWrap = ref(null);
const servicesBtn = ref(null);

const active = computed(() => {
  const n = store.route.name;
  return {
    services: n === 'service',
    work: n === 'work' || n === 'case',
    about: n === 'about',
    contact: n === 'contact',
    media: n === 'media',
  };
});

const route = useRoute();
watch(() => route.path, () => { servicesOpen.value = false; });

function onScroll() {
  scrolled.value = window.scrollY > 8;
}
function onDocClick(e) {
  if (servicesOpen.value && servicesWrap.value && !servicesWrap.value.contains(e.target)) servicesOpen.value = false;
}
function onKey(e) {
  if (e.key === 'Escape' && servicesOpen.value) {
    servicesOpen.value = false;
    servicesBtn.value?.focus();
  }
}
function onServicesFocusOut(e) {
  if (servicesWrap.value && !servicesWrap.value.contains(e.relatedTarget)) servicesOpen.value = false;
}
function openMenu() {
  store.menuOpen = true;
}

onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  document.removeEventListener('click', onDocClick);
  document.removeEventListener('keydown', onKey);
});

</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 border-b bg-paper/95 backdrop-blur-md transition-[border-color,box-shadow] duration-300"
    :class="scrolled ? 'border-line shadow-[0_8px_30px_-24px_rgba(26,41,58,0.4)]' : 'border-transparent'"
  >
    <div class="container flex h-[72px] items-center justify-between gap-6 sm:h-[84px]">
      <NuxtLink to="/" class="shrink-0 rounded-sm" aria-label="NextEra 首頁">
        <BrandLogo />
      </NuxtLink>

      <nav aria-label="主要導覽" class="hidden lg:block">
        <ul class="flex items-center gap-1">
          <li ref="servicesWrap" class="relative" @focusout="onServicesFocusOut">
            <button
              ref="servicesBtn"
              type="button"
              class="nav-link"
              :class="{ 'is-active': active.services }"
              aria-controls="services-menu"
              :aria-expanded="servicesOpen ? 'true' : 'false'"
              @click="servicesOpen = !servicesOpen"
            >
              服務
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform" :class="servicesOpen ? 'rotate-180' : ''" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <div v-show="servicesOpen" id="services-menu" class="absolute left-1/2 top-full mt-3 w-[400px] -translate-x-1/2 border border-line bg-paper p-2 shadow-[0_24px_60px_-30px_rgba(26,41,58,0.4)]">
              <ul>
                <li v-for="s in services" :key="s.key">
                  <NuxtLink
                    :to="'/services/' + s.slug"
                    class="group flex gap-4 px-4 py-3.5 transition hover:bg-sand"
                    :aria-current="route.params.slug === s.slug ? 'page' : undefined"
                    @click="servicesOpen = false"
                  >
                    <span class="font-display text-lg text-gold-600">{{ s.no }}</span>
                    <span>
                      <span class="block text-[15px] font-semibold text-navy">{{ s.zh }}</span>
                      <span class="mt-0.5 block text-[11px] tracking-[0.16em] text-ink/60">{{ s.en.toUpperCase() }}</span>
                    </span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </li>
          <li><NuxtLink to="/work" class="nav-link" :class="{ 'is-active': active.work }" :aria-current="active.work ? 'page' : undefined">案例與作品</NuxtLink></li>
          <li><NuxtLink to="/media" class="nav-link" :class="{ 'is-active': active.media }" :aria-current="active.media ? 'page' : undefined">NextEra Media</NuxtLink></li>
          <li><NuxtLink to="/about" class="nav-link" :class="{ 'is-active': active.about }" :aria-current="active.about ? 'page' : undefined">關於我們</NuxtLink></li>
          <li><NuxtLink to="/contact" class="nav-link" :class="{ 'is-active': active.contact }" :aria-current="active.contact ? 'page' : undefined">聯絡我們</NuxtLink></li>
        </ul>
      </nav>

      <div class="flex items-center gap-2">
        <NuxtLink to="/contact" class="btn btn-primary btn-sm hidden sm:inline-flex">預約需求諮詢</NuxtLink>
        <button
          id="menu-button"
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center border border-navy/20 text-navy transition hover:bg-sand lg:hidden"
          aria-controls="mobile-menu"
          :aria-expanded="store.menuOpen ? 'true' : 'false'"
          @click="openMenu"
        >
          <span class="sr-only">開啟選單</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M8 16h12" /></svg>
        </button>
      </div>
    </div>
  </header>
</template>
