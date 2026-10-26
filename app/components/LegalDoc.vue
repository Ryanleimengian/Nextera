<script setup>
defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  updated: { type: String, required: true },
  intro: { type: String, default: '' },
});
</script>

<template>
  <div>
    <section class="relative overflow-hidden pb-12 pt-32 sm:pt-40 lg:pb-16" aria-labelledby="page-title">
      <div class="tech-grid mask-fade-r pointer-events-none absolute inset-0" aria-hidden="true"></div>
      <div class="container relative max-w-3xl">
        <p class="rise eyebrow text-gold-700">
          <span class="eyebrow-line" aria-hidden="true"></span>
          <span class="eyebrow-node" aria-hidden="true"></span>
          {{ eyebrow }}
        </p>
        <h1
          id="page-title"
          tabindex="-1"
          class="rise mt-6 font-serif-tc text-[clamp(2.1rem,4.5vw,3.4rem)] font-bold leading-[1.25] text-navy outline-none"
          style="animation-delay:80ms"
        >
          {{ title }}
        </h1>
        <p class="rise mt-5 text-[14px] text-ink/60" style="animation-delay:120ms">最後更新日期：{{ updated }}</p>
        <p v-if="intro" class="rise mt-7 text-[17px] leading-[1.85] text-ink/80" style="animation-delay:160ms">{{ intro }}</p>
      </div>
    </section>

    <section class="border-t border-line pb-24 lg:pb-32" aria-label="文件內容">
      <div class="container max-w-3xl">
        <div class="legal-prose">
          <slot />
        </div>
        <nav class="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-8 text-[15px]" aria-label="相關文件">
          <slot name="related" />
        </nav>
      </div>
    </section>
  </div>
</template>
