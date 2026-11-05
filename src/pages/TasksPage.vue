<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useId } from 'vue';
import AppTabbar from '../components/AppTabbar.vue';
import TaskCard from '../components/TaskCard.vue';
import TaskForm from '../components/TaskForm.vue';
import TaskListControls from '../components/TaskListControls.vue';
import TaskCounter from '../components/TaskCounter.vue';
import TaskDetails from '../components/TaskDetails.vue';
import { taskState, addTask, updateTask, deleteTask, setTaskStatus, setTaskPriority } from '../store/tasks.js';
import { priorityOrder } from '../utils/tasks.js';
import '../css/task-form.css';
import '../css/task-list.css';

const selectedStatus = ref('all');
const selectedPriority = ref('all');
const sortOrder = ref('newest');
const searchQuery = ref('');
const onlyIncomplete = ref(false);
const listHeading = ref(null);
const deleteDialog = ref(null);
const deleteDialogId = useId();
const pendingDeleteId = ref(null);
const pendingDeleteTask = computed(() => taskState.tasks.find(task => task.id === pendingDeleteId.value) ?? null);
let deleteTrigger = null;
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
const visibleTasks = computed(() => {
  const term = searchQuery.value.trim().toLocaleLowerCase('uk-UA');
  const statusOrder = { progress: 0, todo: 1, done: 2 };
  const result = taskState.tasks.filter(task => {
    const matchesText = !term || `${task.title} ${task.description ?? ''}`.toLocaleLowerCase('uk-UA').includes(term);
    const matchesStatus = selectedStatus.value === 'all' || task.status === selectedStatus.value;
    const matchesPriority = selectedPriority.value === 'all' || task.priority === selectedPriority.value;
    const matchesIncomplete = !onlyIncomplete.value || task.status !== 'done';
    return matchesText && matchesStatus && matchesPriority && matchesIncomplete;
  });
  return result.sort((a, b) => {
    if (sortOrder.value === 'title') return a.title.localeCompare(b.title, 'uk-UA') || a.id - b.id;
    if (sortOrder.value === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority] || b.id - a.id;
    if (sortOrder.value === 'priorityAsc') return priorityOrder[b.priority] - priorityOrder[a.priority] || b.id - a.id;
    if (sortOrder.value === 'status') return statusOrder[a.status] - statusOrder[b.status] || b.id - a.id;
    if (sortOrder.value === 'dueDate' || sortOrder.value === 'dueDateDesc') {
      if (!a.dueDate && b.dueDate) return 1;
      if (a.dueDate && !b.dueDate) return -1;
      const difference = (a.dueDate || '').localeCompare(b.dueDate || '');
      return (sortOrder.value === 'dueDateDesc' ? -difference : difference) || b.id - a.id;
    }
    return b.id - a.id;
  });
});
const visibleCompletion = computed(() => visibleTasks.value.length
  ? Math.round(visibleTasks.value.filter(task => task.status === 'done').length / visibleTasks.value.length * 100)
  : 0);

function resetFilters() {
  searchQuery.value = '';
  selectedStatus.value = 'all';
  selectedPriority.value = 'all';
  sortOrder.value = 'newest';
  onlyIncomplete.value = false;
}

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
  resetFilters();
  await cancelForm();
  feedbackAnchor.value?.scrollIntoView({ block: 'nearest' });
}

async function handleDelete(id) {
  const task = taskState.tasks.find(item => item.id === Number(id));
  if (!task) return;
  deleteTrigger = document.activeElement;
  pendingDeleteId.value = task.id;
  await nextTick();
  deleteDialog.value?.showModal();
}

function cancelDelete() {
  deleteDialog.value?.close();
  pendingDeleteId.value = null;
  if (deleteTrigger?.isConnected) deleteTrigger.focus({ preventScroll: true });
}

async function confirmDelete() {
  const task = pendingDeleteTask.value;
  if (!task) return;
  cancelDelete();
  if (!deleteTask(task.id)) return;
  if (editingId.value === task.id) await cancelForm();
  if (selectedTaskId.value === task.id) selectedTaskId.value = null;
  feedbackIsError.value = false;
  feedback.value = `Завдання «${task.title}» видалено.`;
  await nextTick();
  listHeading.value?.focus({ preventScroll: true });
}

onBeforeUnmount(() => deleteDialog.value?.close());
</script>

<template>
  <f7-page name="tasks" class="tf3-page">
    <f7-navbar title="Мої завдання" />
    <template #fixed><AppTabbar active="tasks" /></template>
    <main class="tf3-container">
      <header class="tf3-hero">
        <p class="tf3-eyebrow">TASKFLOW · ЗАВДАННЯ</p>
        <h1>Мої завдання</h1>
        <p>Знаходьте, впорядковуйте та редагуйте завдання. Керуйте виконанням і видаляйте зайве.</p>
        <button type="button" class="tf4-new-task" @click="createTask">+ Додати завдання</button>
      </header>
      <p v-if="feedback" ref="feedbackAnchor" class="tf4-feedback" :class="{ 'tf4-feedback--error': feedbackIsError }"
        :role="feedbackIsError ? 'alert' : 'status'">{{ feedback }}</p>
      <section v-if="formVisible" ref="formAnchor" class="tf4-form-section" aria-label="Форма завдання">
        <TaskForm :key="formVersion" ref="taskForm" :task="editingTask" @save="saveTask" @cancel="cancelForm" />
      </section>
      <TaskListControls v-model:search="searchQuery" v-model:status="selectedStatus" v-model:priority="selectedPriority"
        v-model:sort="sortOrder" v-model:onlyIncomplete="onlyIncomplete" @reset="resetFilters" />
      <section class="tf3-section">
        <div class="tf3-section-heading">
          <h2 ref="listHeading" class="tf5-list-heading" tabindex="-1">Список завдань</h2>
          <div class="tf5-counts">
            <TaskCounter :count="visibleTasks.length" />
            <span>Усього: {{ taskState.tasks.length }}</span>
            <span class="tf5-completion" role="status">Виконано серед знайдених: {{ visibleCompletion }}%</span>
          </div>
        </div>
        <div v-if="!taskState.tasks.length" class="tf5-empty tf5-empty--all" role="status">
          <h3>Список завдань порожній</h3>
          <p>Усі завдання видалено. Створіть нове завдання, щоб продовжити роботу.</p>
          <button type="button" class="tf5-btn" @click="createTask">Створити перше завдання</button>
        </div>
        <div v-else-if="visibleTasks.length" class="tf3-task-grid">
          <TaskCard v-for="task in visibleTasks" :key="task.id" :task="task" :editable="true"
            @status-change="handleStatusChange" @priority-change="handlePriorityChange" @task-select="handleTaskSelect"
            @edit="editTask" @delete="handleDelete" />
        </div>
        <div v-else class="tf5-empty tf5-empty--filtered" role="status">
          <p>За поточними умовами завдань не знайдено.</p>
          <button type="button" class="tf5-btn" @click="resetFilters">Показати всі завдання</button>
        </div>
      </section>
      <p class="tf3-state-note">Зміни діють до повного перезавантаження застосунку.</p>
    </main>
    <TaskDetails v-if="selectedTask" :task="selectedTask" @close="selectedTaskId = null" />
    <dialog v-if="pendingDeleteTask" ref="deleteDialog" class="tf3-dialog tf5-delete-dialog"
      :aria-labelledby="`${deleteDialogId}-title`" :aria-describedby="`${deleteDialogId}-description`" @cancel.prevent="cancelDelete">
      <h2 :id="`${deleteDialogId}-title`">Видалити завдання?</h2>
      <p :id="`${deleteDialogId}-description`">Видалити завдання «{{ pendingDeleteTask.title }}» зі списку?</p>
      <div class="tf5-controls-actions">
        <button type="button" class="tf5-btn" autofocus @click="cancelDelete">Скасувати</button>
        <button type="button" class="tf5-btn tf5-danger" @click="confirmDelete">Видалити</button>
      </div>
    </dialog>
  </f7-page>
</template>
