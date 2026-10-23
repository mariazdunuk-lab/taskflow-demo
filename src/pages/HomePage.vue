<script setup>
import { computed, ref } from 'vue';
import AppTabbar from '../components/AppTabbar.vue';
import TaskCard from '../components/TaskCard.vue';
import TaskDetails from '../components/TaskDetails.vue';
import { taskState, setTaskStatus, setTaskPriority } from '../store/tasks.js';
import { priorityOrder } from '../utils/tasks.js';

const totalTasks = computed(() => taskState.tasks.length);
const completedTasks = computed(() => taskState.tasks.filter(task => task.status === 'done').length);
const progressTasks = computed(() => taskState.tasks.filter(task => task.status === 'progress').length);
const plannedTasks = computed(() => taskState.tasks.filter(task => task.status === 'todo').length);
const completionPercent = computed(() => totalTasks.value ? Math.round(completedTasks.value / totalTasks.value * 100) : 0);
const activeTasks = computed(() => taskState.tasks
  .filter(task => task.status !== 'done')
  .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.id - b.id)
  .slice(0, 3));
const selectedTaskId = ref(null);
const selectedTask = computed(() => taskState.tasks.find(task => task.id === selectedTaskId.value));

function handleStatusChange(payload) {
  setTaskStatus(payload);
}

function handlePriorityChange(payload) {
  setTaskPriority(payload);
}

function handleTaskSelect({ id }) {
  selectedTaskId.value = id;
}
</script>

<template>
  <f7-page name="home" class="tf3-page">
    <f7-navbar title="TaskFlow">
      <f7-nav-right><f7-link href="/about/" icon-f7="info_circle" aria-label="Про застосунок" /></f7-nav-right>
    </f7-navbar>
    <template #fixed><AppTabbar active="home" /></template>
    <main class="tf3-container">
      <header class="tf3-hero">
        <p class="tf3-eyebrow">TASKFLOW · ГОЛОВНА</p>
        <h1>Панель керування</h1>
        <p>Стежте за виконанням завдань і починайте з найважливішого.</p>
      </header>
      <section class="tf3-stat-grid" aria-label="Статистика завдань">
        <div class="tf3-stat"><span class="tf3-stat-label">Усього завдань</span><strong>{{ totalTasks }}</strong></div>
        <div class="tf3-stat"><span class="tf3-stat-label">У роботі</span><strong>{{ progressTasks }}</strong></div>
        <div class="tf3-stat"><span class="tf3-stat-label">Виконано</span><strong>{{ completedTasks }}</strong></div>
        <div class="tf3-stat"><span class="tf3-stat-label">Заплановано</span><strong>{{ plannedTasks }}</strong></div>
      </section>
      <section class="tf3-completion" aria-label="Виконання завдань">
        <div class="tf3-completion-heading"><span>Виконання завдань</span><strong>{{ completionPercent }}%</strong></div>
        <div class="tf3-progress" role="progressbar" aria-label="Відсоток виконаних завдань" :aria-valuenow="completionPercent" aria-valuemin="0" aria-valuemax="100">
          <span :style="{ width: `${completionPercent}%` }"></span>
        </div>
      </section>
      <section class="tf3-section">
        <div class="tf3-section-heading">
          <div><p class="tf3-eyebrow">НАЙВИЩИЙ ПРІОРИТЕТ СПОЧАТКУ</p><h2>Активні завдання</h2></div>
          <f7-link href="/tasks/" class="tf3-action">Усі завдання</f7-link>
        </div>
        <div v-if="activeTasks.length" class="tf3-task-grid">
          <TaskCard v-for="task in activeTasks" :key="task.id" :task="task"
            @status-change="handleStatusChange" @priority-change="handlePriorityChange" @task-select="handleTaskSelect" />
        </div>
        <div v-else class="tf3-empty">Наразі всі завдання виконані.</div>
      </section>
      <p class="tf3-state-note">Зміни діють до повного перезавантаження застосунку.</p>
    </main>
    <TaskDetails v-if="selectedTask" :task="selectedTask" @close="selectedTaskId = null" />
  </f7-page>
</template>
