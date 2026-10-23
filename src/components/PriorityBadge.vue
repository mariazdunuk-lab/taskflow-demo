<script setup>
import { computed } from 'vue';

const props = defineProps({ priority: { type: String, required: true } });
const priorityInfo = computed(() => ({
  low: { label: 'Низький', className: 'tf3-priority--low' },
  medium: { label: 'Середній', className: 'tf3-priority--medium' },
  high: { label: 'Високий', className: 'tf3-priority--high' },
}[props.priority] ?? { label: 'Не визначено', className: 'tf3-priority--unknown' }));
</script>

<template>
  <span class="tf3-badge" :class="priorityInfo.className">{{ priorityInfo.label }}</span>
</template>
