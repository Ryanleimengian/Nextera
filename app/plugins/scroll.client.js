export default defineNuxtPlugin(() => {
  const route = useRoute();
  watch(
    () => route.fullPath,
    (to, from) => {
      if (!from) return;
      if (to.path !== from.path) {
        window.scrollTo({ top: 0, behavior: 'auto' });
        nextTick(() => {
          const h = document.getElementById('page-title');
          h?.focus({ preventScroll: true });
        });
      }
    },
  );
});
