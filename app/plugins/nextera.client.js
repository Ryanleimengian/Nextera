import content from '~/data/content.js';
import { registerNextera, metaForRoute } from '~/lib/nextera-legacy.mjs';
import { mapLegacyRoute } from '~/composables/mapLegacyRoute';

export default defineNuxtPlugin((nuxtApp) => {
  const store = useSiteStore();
  const runtimeConfig = useRuntimeConfig();
  const endpoint = (runtimeConfig.public.formEndpoint || content.contact.formEndpoint || '').trim();
  if (endpoint) content.contact.formEndpoint = endpoint;

  registerNextera(nuxtApp.vueApp, { C: content, store });
  nuxtApp.vueApp.config.globalProperties.$store = store;
  nuxtApp.vueApp.config.globalProperties.$content = content;
  nuxtApp.provide('store', store);
  nuxtApp.provide('content', content);

  const route = useRoute();
  watch(
    () => route.fullPath,
    () => {
      const legacy = mapLegacyRoute(route);
      const [title, description] = metaForRoute(legacy, content);
      useHead({
        title,
        meta: [{ name: 'description', content: description }],
      });
    },
    { immediate: true },
  );
});
