<script setup>
defineProps({
  file: { type: String, required: true },
});
</script>

<template>
  <iframe
    :src="file"
    title="Page viewer"
    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
  />
</template>

<style scoped>
iframe {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  border: 0;
  background: #fff;
}
</style>
