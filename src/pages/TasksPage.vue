<script setup>
import { computed, nextTick, ref } from 'vue';
import AppTabbar from '../components/AppTabbar.vue';
import TaskCard from '../components/TaskCard.vue';
import TaskForm from '../components/TaskForm.vue';
import TaskCounter from '../components/TaskCounter.vue';
import TaskDetails from '../components/TaskDetails.vue';
import { taskState, addTask, updateTask, setTaskStatus, setTaskPriority } from '../store/tasks.js';
import { priorityOrder } from '../utils/tasks.js';
import '../css/task-form.css';

const selectedStatus = ref('all');
const selectedPriority = ref('all');
const sortOrder = ref('high-first');
const searchQuery = ref('');
const formVisible = ref(false);
const editingId = ref(null);
const formVersion = ref(0);
const formAnchor = ref(null);
const taskForm = ref(null);
const feedback = ref('');
const feedbackIsError = ref(false);
const feedbackAnchor = ref(null);
let formTrigger = null;
const editingTask = computed(() => taskState.tasks.find(task => task.id === editingId.value) ?? null);
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
    && (selectedPriority.value === 'all' || task.priority === selectedPriority.value)
    && task.title.toLocaleLowerCase('uk-UA').includes(searchQuery.value.trim().toLocaleLowerCase('uk-UA')))
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

async function openForm(id = null) {
  if (id !== null && !taskState.tasks.some(task => task.id === id)) return;
  formTrigger = document.activeElement;
  editingId.value = id;
  formVersion.value += 1;
  formVisible.value = true;
  feedback.value = '';
  feedbackIsError.value = false;
  await nextTick();
  formAnchor.value?.scrollIntoView({ block: 'start' });
  taskForm.value?.focusTitle();
}

function createTask() {
  return openForm();
}

function editTask(id) {
  return openForm(id);
}

async function cancelForm() {
  formVisible.value = false;
  editingId.value = null;
  await nextTick();
  if (formTrigger?.isConnected) formTrigger.focus({ preventScroll: true });
}

async function saveTask(data) {
  const isEditing = editingId.value !== null;
  const saved = isEditing ? updateTask({ ...data, id: editingId.value }) : addTask(data);
  if (!saved) {
    feedbackIsError.value = true;
    feedback.value = 'Не вдалося зберегти завдання. Перевірте дані форми.';
    return;
  }
  feedbackIsError.value = false;
  feedback.value = 'Завдання «' + saved.title + (isEditing ? '» оновлено.' : '» створено.');
  selectedStatus.value = 'all';
  selectedPriority.value = 'all';
  searchQuery.value = '';
  await cancelForm();
  feedbackAnchor.value?.scrollIntoView({ block: 'nearest' });
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
        <p>Створюйте та редагуйте завдання, шукайте потрібне й керуйте виконанням.</p>
        <button type="button" class="tf4-new-task" @click="createTask">+ Додати завдання</button>
      </header>
      <p v-if="feedback" ref="feedbackAnchor" class="tf4-feedback" :class="{ 'tf4-feedback--error': feedbackIsError }"
        :role="feedbackIsError ? 'alert' : 'status'">{{ feedback }}</p>
      <section v-if="formVisible" ref="formAnchor" class="tf4-form-section" aria-label="Форма завдання">
        <TaskForm :key="formVersion" ref="taskForm" :task="editingTask" @save="saveTask" @cancel="cancelForm" />
      </section>
      <section class="tf3-filters" aria-label="Фільтри завдань">
        <div class="tf4-field">
          <label for="task-search">Пошук за назвою</label>
          <input id="task-search" v-model="searchQuery" type="search" placeholder="Введіть частину назви…" autocomplete="off" />
        </div>
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
          <TaskCard v-for="task in filteredTasks" :key="task.id" :task="task" :editable="true"
            @status-change="handleStatusChange" @priority-change="handlePriorityChange" @task-select="handleTaskSelect" @edit="editTask" />
        </div>
        <div v-else class="tf3-empty" role="status">За обраними фільтрами та пошуком завдань не знайдено.</div>
      </section>
      <p class="tf3-state-note">Зміни діють до повного перезавантаження застосунку.</p>
    </main>
    <TaskDetails v-if="selectedTask" :task="selectedTask" @close="selectedTaskId = null" />
  </f7-page>
</template>
