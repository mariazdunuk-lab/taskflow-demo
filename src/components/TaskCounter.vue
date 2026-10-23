<script setup>
defineProps({ count: { type: Number, required: true } });
</script>

<template>
  <span class="tf3-counter" role="status">Знайдено: {{ count }}</span>
</template>
