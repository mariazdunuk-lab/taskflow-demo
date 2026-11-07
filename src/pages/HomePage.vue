<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import AppTabbar from '../components/AppTabbar.vue';
import TaskCard from '../components/TaskCard.vue';
import TaskDetails from '../components/TaskDetails.vue';
import { useTasksStore } from '../store/tasks.js';
import { useProjectsStore } from '../store/projects.js';
import '../css/task-list.css';

const taskStore = useTasksStore();
const projectStore = useProjectsStore();
const { tasks, totalTasks, completedTasks, progressTasks, plannedTasks, completionPercent, activeTasks } = storeToRefs(taskStore);
const { projectCount, projectStats } = storeToRefs(projectStore);
const selectedTaskId = ref(null);
const selectedTask = computed(() => tasks.value.find(task => task.id === selectedTaskId.value));

function handleStatusChange(payload) {
  taskStore.setTaskStatus(payload);
}

function handlePriorityChange(payload) {
  taskStore.setTaskPriority(payload);
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
        <p>Стежте за виконанням завдань і починайте з найважливішого. Проєктів: {{ projectCount }}.</p>
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
      <section class="tf5-panel" aria-label="Стан проєктів">
        <h2>Стан проєктів</h2>
        <div class="tf6-project-list">
          <article v-for="project in projectStats" :key="project.id" class="tf6-project-summary" :data-project-id="project.id">
            <h3>{{ project.title }}</h3>
            <p>Невиконаних: <strong>{{ project.incompleteCount }}</strong></p>
            <p>Виконано: {{ project.completedCount }} із {{ project.taskCount }} · {{ project.completionPercent }}%</p>
          </article>
        </div>
      </section>
      <section class="tf3-section">
        <div class="tf3-section-heading">
          <div><p class="tf3-eyebrow">НАЙВИЩИЙ ПРІОРИТЕТ СПОЧАТКУ</p><h2>Активні завдання</h2></div>
          <f7-link href="/tasks/" class="tf3-action">Усі завдання</f7-link>
        </div>
        <div v-if="activeTasks.length" class="tf3-task-grid">
          <TaskCard v-for="task in activeTasks" :key="task.id" :task="task" :project-title="projectStore.projectTitle(task.projectId)"
            @status-change="handleStatusChange" @priority-change="handlePriorityChange" @task-select="handleTaskSelect" />
        </div>
        <div v-else class="tf3-empty">Наразі всі завдання виконані.</div>
      </section>
      <p class="tf3-state-note">Зміни діють до повного перезавантаження застосунку.</p>
    </main>
    <TaskDetails v-if="selectedTask" :task="selectedTask" @close="selectedTaskId = null" />
  </f7-page>
</template>
