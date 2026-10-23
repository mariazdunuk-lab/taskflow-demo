<script setup>
import { computed, useId } from 'vue';
import StatusBadge from './StatusBadge.vue';
import PriorityBadge from './PriorityBadge.vue';
import { formatDueDate } from '../utils/tasks.js';

const props = defineProps({ task: { type: Object, required: true } });
const emit = defineEmits(['status-change', 'priority-change', 'task-select']);
const titleId = useId();
const statuses = ['todo', 'progress', 'done'];
const priorities = ['low', 'medium', 'high'];
const dueDateLabel = computed(() => formatDueDate(props.task.dueDate));
const statusActionLabel = computed(() => ({
  todo: 'Взяти в роботу',
  progress: 'Завершити',
  done: 'Повернути в план',
}[props.task.status] ?? 'Змінити статус'));

function changeStatus() {
  const nextIndex = (statuses.indexOf(props.task.status) + 1) % statuses.length;
  emit('status-change', { id: props.task.id, status: statuses[nextIndex] });
}

function changePriority() {
  const nextIndex = (priorities.indexOf(props.task.priority) + 1) % priorities.length;
  emit('priority-change', { id: props.task.id, priority: priorities[nextIndex] });
}
</script>

<template>
  <f7-card class="tf3-task-card" :data-task-id="task.id" role="article" :aria-labelledby="titleId">
    <f7-card-content>
      <div class="tf3-card-heading">
        <h3 :id="titleId" class="tf3-card-title">{{ task.title }}</h3>
        <StatusBadge :status="task.status" />
      </div>
      <p class="tf3-card-description">{{ task.description }}</p>
      <div class="tf3-card-meta">
        <div class="tf3-meta-item"><span class="tf3-meta-label">Пріоритет</span><PriorityBadge :priority="task.priority" /></div>
        <div class="tf3-meta-item"><span class="tf3-meta-label">Термін</span><time class="tf3-meta-date" :datetime="task.dueDate || undefined">{{ dueDateLabel }}</time></div>
      </div>
      <div class="tf3-card-actions">
        <button type="button" class="tf3-action tf3-action--primary" @click="changeStatus">{{ statusActionLabel }}</button>
        <button type="button" class="tf3-action" @click="changePriority">Змінити пріоритет</button>
        <button type="button" class="tf3-action" @click="emit('task-select', { id: task.id })">Докладніше</button>
      </div>
    </f7-card-content>
  </f7-card>
</template>
