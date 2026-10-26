<script setup>
defineProps({
  size: { type: String, default: 'nav' },
});
</script>

<template>
  <img
    src="/assets/brand/nextera-logo.png"
    alt="NextEra BUSINESS MEDIA"
    width="253"
    height="202"
    decoding="async"
    :class="size === 'nav' ? 'h-12 w-auto sm:h-[58px]' : size === 'lg' ? 'h-36 w-auto sm:h-44' : 'h-20 w-auto'"
  />
</template>
