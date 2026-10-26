<script setup>
const store = useSiteStore();
const mainEl = ref(null);

function focusMain() {
  mainEl.value?.focus({ preventScroll: true });
}
</script>

<template>
  <div>
    <a href="#main" class="skip-link" @click.prevent="focusMain">跳至主要內容</a>
    <LayoutSiteHeader :inert="store.menuOpen || undefined" />
    <LayoutMobileMenu />
    <main id="main" ref="mainEl" tabindex="-1" class="outline-none" :inert="store.menuOpen || undefined">
      <slot />
    </main>
    <LayoutSiteFooter :inert="store.menuOpen || undefined" />
  </div>
</template>
