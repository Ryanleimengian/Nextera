<script setup>
const route = useRoute();
const slug = computed(() => String(route.params.slug || ''));
</script>

<template>
  <ClientOnly>
    <PageCase :slug="slug" />
  </ClientOnly>
</template>
