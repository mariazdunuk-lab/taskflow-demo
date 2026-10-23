<script setup>
import { computed, ref } from 'vue';
import AppTabbar from '../components/AppTabbar.vue';
import TaskCard from '../components/TaskCard.vue';
import TaskCounter from '../components/TaskCounter.vue';
import TaskDetails from '../components/TaskDetails.vue';
import { taskState, setTaskStatus, setTaskPriority } from '../store/tasks.js';
import { priorityOrder } from '../utils/tasks.js';

const selectedStatus = ref('all');
const selectedPriority = ref('all');
const sortOrder = ref('high-first');
const selectedTaskId = ref(null);
const selectedTask = computed(() => taskState.tasks.find(task => task.id === selectedTaskId.value));
const statusFilters = [
  { value: 'all', label: 'Усі' },
  { value: 'todo', label: 'Заплановано' },
  { value: 'progress', label: 'У роботі' },
  { value: 'done', label: 'Виконано' },
];
const priorityFilters = [
  { value: 'all', label: 'Усі' },
  { value: 'low', label: 'Низький' },
  { value: 'medium', label: 'Середній' },
  { value: 'high', label: 'Високий' },
];
const filteredTasks = computed(() => taskState.tasks
  .filter(task => (selectedStatus.value === 'all' || task.status === selectedStatus.value)
    && (selectedPriority.value === 'all' || task.priority === selectedPriority.value))
  .sort((a, b) => {
    const difference = priorityOrder[a.priority] - priorityOrder[b.priority];
    return (sortOrder.value === 'high-first' ? difference : -difference) || a.id - b.id;
  }));

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
  <f7-page name="tasks" class="tf3-page">
    <f7-navbar title="Мої завдання" />
    <template #fixed><AppTabbar active="tasks" /></template>
    <main class="tf3-container">
      <header class="tf3-hero">
        <p class="tf3-eyebrow">TASKFLOW · ЗАВДАННЯ</p>
        <h1>Мої завдання</h1>
        <p>Обирайте статус і пріоритет, змінюйте порядок та керуйте виконанням.</p>
      </header>
      <section class="tf3-filters" aria-label="Фільтри завдань">
        <div class="tf3-filter-group" role="group" aria-label="Статус">
          <span class="tf3-filter-title">Статус</span>
          <div class="tf3-filter-buttons">
            <button v-for="filter in statusFilters" :key="filter.value" type="button" class="tf3-filter-button"
              :class="{ 'is-active': selectedStatus === filter.value }" :aria-pressed="selectedStatus === filter.value"
              @click="selectedStatus = filter.value">{{ filter.label }}</button>
          </div>
        </div>
        <div class="tf3-filter-group" role="group" aria-label="Пріоритет">
          <span class="tf3-filter-title">Пріоритет</span>
          <div class="tf3-filter-buttons">
            <button v-for="filter in priorityFilters" :key="filter.value" type="button" class="tf3-filter-button"
              :class="{ 'is-active': selectedPriority === filter.value }" :aria-pressed="selectedPriority === filter.value"
              @click="selectedPriority = filter.value">{{ filter.label }}</button>
          </div>
        </div>
        <div class="tf3-sort">
          <label for="task-sort">Сортування</label>
          <select id="task-sort" v-model="sortOrder">
            <option value="high-first">Спочатку високий пріоритет</option>
            <option value="low-first">Спочатку низький пріоритет</option>
          </select>
        </div>
      </section>
      <section class="tf3-section">
        <div class="tf3-section-heading"><h2>Список завдань</h2><TaskCounter :count="filteredTasks.length" /></div>
        <div v-if="filteredTasks.length" class="tf3-task-grid">
          <TaskCard v-for="task in filteredTasks" :key="task.id" :task="task"
            @status-change="handleStatusChange" @priority-change="handlePriorityChange" @task-select="handleTaskSelect" />
        </div>
        <div v-else class="tf3-empty" role="status">За обраними фільтрами завдань не знайдено.</div>
      </section>
      <p class="tf3-state-note">Зміни діють до повного перезавантаження застосунку.</p>
    </main>
    <TaskDetails v-if="selectedTask" :task="selectedTask" @close="selectedTaskId = null" />
  </f7-page>
</template>
