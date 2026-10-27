<script setup>
import siteContent from '~/data/content.js';

const services = computed(() => siteContent.services);
const contact = computed(() => siteContent.contact);
const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t border-line bg-sand text-ink" aria-labelledby="footer-heading">
    <h2 id="footer-heading" class="sr-only">頁尾</h2>
    <div class="container py-16 lg:py-20">
      <div class="grid gap-12 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <BrandLogo size="md" />
          <p class="mt-6 max-w-sm text-[15px] leading-[1.85] text-ink/80">NextEra 結合營銷策略、創意內容、企業培訓及 AI 技術，協助澳門及香港中小企業完成日常營銷、提升團隊 AI 能力，並建立配合業務的網站及專屬工具。</p>
        </div>
        <nav class="lg:col-span-3" aria-label="服務">
          <p class="footer-title">服務</p>
          <ul class="mt-4 space-y-3 text-[15px]">
            <li v-for="s in services" :key="s.key">
              <NuxtLink :to="'/services/' + s.slug" class="footer-link">{{ s.short || s.zh }}</NuxtLink>
            </li>
          </ul>
        </nav>
        <nav class="lg:col-span-2" aria-label="網站">
          <p class="footer-title">網站</p>
          <ul class="mt-4 space-y-3 text-[15px]">
            <li><NuxtLink to="/" class="footer-link">首頁</NuxtLink></li>
            <li><NuxtLink to="/work" class="footer-link">案例與作品</NuxtLink></li>
            <li><NuxtLink to="/media" class="footer-link">NextEra Media</NuxtLink></li>
            <li><NuxtLink to="/about" class="footer-link">關於我們</NuxtLink></li>
            <li><NuxtLink to="/contact" class="footer-link">聯絡我們</NuxtLink></li>
          </ul>
        </nav>
        <div class="lg:col-span-3">
          <p class="footer-title">聯絡</p>
          <ul class="mt-4 space-y-3 text-[15px]">
            <li><NuxtLink to="/contact" class="footer-link">提交需求查詢</NuxtLink></li>
            <li v-if="contact.email"><a :href="'mailto:' + contact.email" class="footer-link">{{ contact.email }}</a></li>
            <li v-if="contact.whatsapp"><a :href="'https://wa.me/' + contact.whatsapp" class="footer-link" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            <li v-if="contact.social.facebook"><a :href="contact.social.facebook" class="footer-link" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li v-if="contact.social.instagram"><a :href="contact.social.instagram" class="footer-link" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div class="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-[13px] text-ink/70 sm:flex-row sm:items-center sm:justify-between">
        <p>© {{ year }} NextEra. 版權所有。</p>
        <nav class="flex flex-wrap gap-x-5 gap-y-2 self-start sm:self-auto" aria-label="法律文件">
          <NuxtLink to="/terms" class="underline-offset-4 hover:text-navy hover:underline">服務條款</NuxtLink>
          <NuxtLink to="/privacy" class="underline-offset-4 hover:text-navy hover:underline">私隱政策</NuxtLink>
        </nav>
      </div>
    </div>
  </footer>
</template>
