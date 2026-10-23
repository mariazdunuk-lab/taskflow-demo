<script setup>
import { computed } from 'vue';

const props = defineProps({ status: { type: String, required: true } });
const statusInfo = computed(() => ({
  todo: { label: 'Заплановано', className: 'tf3-status--todo' },
  progress: { label: 'У роботі', className: 'tf3-status--progress' },
  done: { label: 'Виконано', className: 'tf3-status--done' },
}[props.status] ?? { label: 'Невідомо', className: 'tf3-status--unknown' }));
</script>

<template>
  <span class="tf3-badge" :class="statusInfo.className">{{ statusInfo.label }}</span>
</template>
