<script setup>
import { onBeforeUnmount, onMounted, ref, useId } from 'vue';
import StatusBadge from './StatusBadge.vue';
import PriorityBadge from './PriorityBadge.vue';
import { formatDueDate } from '../utils/tasks.js';

defineProps({ task: { type: Object, required: true } });
const emit = defineEmits(['close']);
const dialog = ref(null);
const titleId = useId();
onMounted(() => dialog.value.showModal());
onBeforeUnmount(() => dialog.value?.close());
</script>

<template>
  <dialog ref="dialog" class="tf3-dialog" :aria-labelledby="titleId" @cancel.prevent="emit('close')">
    <div class="tf3-dialog-heading">
      <p class="tf3-eyebrow">Завдання № {{ task.id }}</p>
      <button type="button" class="tf3-action" autofocus @click="emit('close')">Закрити</button>
    </div>
    <h2 :id="titleId">{{ task.title }}</h2>
    <p class="tf3-card-description">{{ task.description }}</p>
    <div class="tf3-card-meta">
      <div class="tf3-meta-item"><span class="tf3-meta-label">Статус</span><StatusBadge :status="task.status" /></div>
      <div class="tf3-meta-item"><span class="tf3-meta-label">Пріоритет</span><PriorityBadge :priority="task.priority" /></div>
    </div>
    <p class="tf3-dialog-date">Термін: {{ formatDueDate(task.dueDate) }}</p>
  </dialog>
</template>
