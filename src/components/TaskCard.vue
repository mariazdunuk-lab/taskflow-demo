<template>
  <article class="task-card">
    <div class="task-card__top">
      <span class="task-card__status" :class="`status-${task.status}`">
        {{ statusText }}
      </span>
      <span class="task-card__priority" :class="`priority-${task.priority}`">
        {{ priorityText }}
      </span>
    </div>
    <h3 class="task-card__title">{{ task.title }}</h3>
    <p class="task-card__description">{{ task.description }}</p>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  task: { type: Object, required: true },
});

const statusLabels = {
  todo: 'Заплановано',
  progress: 'У роботі',
  done: 'Виконано',
};

const priorityLabels = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
};

const statusText = computed(() => statusLabels[props.task.status] ?? 'Невідомо');
const priorityText = computed(() => priorityLabels[props.task.priority] ?? 'Не визначено');
</script>
