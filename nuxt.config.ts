// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // 正式環境關閉 Devtools
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/nextera.css'],
  runtimeConfig: {
    public: {
      siteUrl: 'https://nexterasia.com',
      // 表單送往 Netlify Function（key 只在伺服器 WEB3FORMS_ACCESS_KEY）
      formEndpoint: '/.netlify/functions/contact',
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/about', '/contact', '/media', '/work', '/privacy', '/terms'],
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant-HK' },
      title: 'NextEra',
      meta: [
        { name: 'theme-color', content: '#FAF9F6' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'NextEra' },
        { property: 'og:url', content: 'https://nexterasia.com' },
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
