// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/nextera.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant-HK' },
      title: 'NextEra',
      meta: [
        { name: 'theme-color', content: '#FAF9F6' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'NextEra' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/assets/brand/nextera-mark.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@600;700&display=swap',
        },
      ],
    },
  },
});
