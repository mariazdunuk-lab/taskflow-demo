<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useId } from 'vue';
import { storeToRefs } from 'pinia';
import AppTabbar from '../components/AppTabbar.vue';
import TaskCard from '../components/TaskCard.vue';
import TaskForm from '../components/TaskForm.vue';
import TaskListControls from '../components/TaskListControls.vue';
import TaskCounter from '../components/TaskCounter.vue';
import TaskDetails from '../components/TaskDetails.vue';
import { useTasksStore } from '../store/tasks.js';
import { useProjectsStore } from '../store/projects.js';
import '../css/task-form.css';
import '../css/task-list.css';

const taskStore = useTasksStore();
const projectStore = useProjectsStore();
const { tasks, visibleTasks, searchText, selectedStatus, selectedPriority, selectedProject, sortOrder, onlyIncomplete, onlyWithoutDueDate, visibleCompletion } = storeToRefs(taskStore);
const { projects, projectStats } = storeToRefs(projectStore);
const newProjectTitle = ref('');
const newProjectError = ref('');
const projectPrefix = useId();
const currentProject = computed(() => projectStats.value.find(project => project.id === selectedProject.value));
const bulkDialog = ref(null);
const bulkDialogId = useId();
const pendingBulkProject = ref(null);
let bulkTrigger = null;
const listHeading = ref(null);
const deleteDialog = ref(null);
const deleteDialogId = useId();
const pendingDeleteId = ref(null);
const pendingDeleteTask = computed(() => tasks.value.find(task => task.id === pendingDeleteId.value) ?? null);
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
const editingTask = computed(() => tasks.value.find(task => task.id === editingId.value) ?? null);
const selectedTaskId = ref(null);
const selectedTask = computed(() => tasks.value.find(task => task.id === selectedTaskId.value));
function resetFilters() {
  taskStore.resetFilters();
}

function createProject() {
  const project = projectStore.addProject(newProjectTitle.value);
  if (!project) {
    newProjectError.value = 'Назва: 3–40 символів. Не повторюйте назви проєктів.';
    return;
  }
  newProjectTitle.value = '';
  newProjectError.value = '';
  selectedProject.value = project.id;
  feedbackIsError.value = false;
  feedback.value = `Проєкт «${project.title}» створено.`;
}

async function requestBulkChange() {
  if (!currentProject.value?.taskCount) return;
  bulkTrigger = document.activeElement;
  pendingBulkProject.value = { id: currentProject.value.id, title: currentProject.value.title, taskCount: currentProject.value.taskCount };
  await nextTick();
  bulkDialog.value?.showModal();
}

function cancelBulkChange() {
  bulkDialog.value?.close();
  pendingBulkProject.value = null;
  if (bulkTrigger?.isConnected) bulkTrigger.focus({ preventScroll: true });
}

function confirmBulkChange() {
  const project = pendingBulkProject.value;
  if (!project || selectedProject.value !== project.id) { cancelBulkChange(); return; }
  const changed = taskStore.moveCurrentProjectToProgress();
  cancelBulkChange();
  feedbackIsError.value = false;
  feedback.value = `Проєкт «${project.title}»: переведено у роботу ${changed} завдань.`;
}

function handleStatusChange(payload) {
  taskStore.setTaskStatus(payload);
}

function handlePriorityChange(payload) {
  taskStore.setTaskPriority(payload);
}

function handleTaskSelect({ id }) {
  selectedTaskId.value = id;
}

async function openForm(id = null) {
  if (id !== null && !tasks.value.some(task => task.id === id)) return;
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
  const saved = isEditing ? taskStore.updateTask({ ...data, id: editingId.value }) : taskStore.addTask(data);
  if (!saved) {
    feedbackIsError.value = true;
    feedback.value = 'Не вдалося зберегти завдання. Перевірте дані форми.';
    return;
  }
  feedbackIsError.value = false;
  feedback.value = 'Завдання «' + data.title + (isEditing ? '» оновлено.' : '» створено.');
  await cancelForm();
  feedbackAnchor.value?.scrollIntoView({ block: 'nearest' });
}

async function handleDelete(id) {
  const task = tasks.value.find(item => item.id === Number(id));
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
  if (!taskStore.deleteTask(task.id)) return;
  if (editingId.value === task.id) await cancelForm();
  if (selectedTaskId.value === task.id) selectedTaskId.value = null;
  feedbackIsError.value = false;
  feedback.value = `Завдання «${task.title}» видалено.`;
  await nextTick();
  listHeading.value?.focus({ preventScroll: true });
}

onBeforeUnmount(() => { deleteDialog.value?.close(); bulkDialog.value?.close(); });
</script>

<template>
  <f7-page name="tasks" class="tf3-page">
    <f7-navbar title="Мої завдання" />
    <template #fixed><AppTabbar active="tasks" /></template>
    <main class="tf3-container">
      <header class="tf3-hero">
        <p class="tf3-eyebrow">TASKFLOW · ЗАВДАННЯ</p>
        <h1>Мої завдання і проєкти</h1>
        <p>Знаходьте, впорядковуйте та редагуйте завдання. Керуйте виконанням і видаляйте зайве.</p>
        <button type="button" class="tf4-new-task" @click="createTask">+ Додати завдання</button>
      </header>
      <section class="tf5-panel tf6-project-panel" aria-label="Мої проєкти">
        <h2>Мої проєкти</h2>
        <div class="tf6-project-list">
          <button v-for="project in projectStats" :key="project.id" type="button" class="tf6-project-pill"
            :data-project-id="project.id" :aria-pressed="selectedProject === project.id" @click="selectedProject = project.id">
            <span>{{ project.title }}</span><strong>{{ project.taskCount }}</strong><small>{{ project.completionPercent }}% виконано</small>
          </button>
        </div>
        <form class="tf6-project-form" novalidate @submit.prevent="createProject">
          <div class="tf5-control">
            <label :for="`${projectPrefix}-title`">Назва нового проєкту</label>
            <input :id="`${projectPrefix}-title`" v-model="newProjectTitle" maxlength="40" type="text" autocomplete="off"
              placeholder="Наприклад: Лабораторні" :aria-invalid="!!newProjectError"
              :aria-describedby="newProjectError ? `${projectPrefix}-error` : undefined" @input="newProjectError = ''" />
          </div>
          <button type="submit" class="tf5-btn tf5-btn--primary">Створити проєкт</button>
        </form>
        <p v-if="newProjectError" :id="`${projectPrefix}-error`" class="tf4-error" role="alert">{{ newProjectError }}</p>
      </section>
      <p v-if="feedback" ref="feedbackAnchor" class="tf4-feedback" :class="{ 'tf4-feedback--error': feedbackIsError }"
        :role="feedbackIsError ? 'alert' : 'status'">{{ feedback }}</p>
      <section v-if="formVisible" ref="formAnchor" class="tf4-form-section" aria-label="Форма завдання">
        <TaskForm :key="formVersion" ref="taskForm" :task="editingTask" :projects="projects" :existing-tasks="tasks"
          :default-project="selectedProject === 'all' ? 'general' : selectedProject" @save="saveTask" @cancel="cancelForm" />
      </section>
      <TaskListControls v-model:search="searchText" v-model:status="selectedStatus" v-model:priority="selectedPriority"
        v-model:sort="sortOrder" v-model:onlyIncomplete="onlyIncomplete" v-model:project="selectedProject" :projects="projects"
        v-model:onlyWithoutDueDate="onlyWithoutDueDate" @reset="resetFilters" />
      <section class="tf6-bulk" aria-label="Дії з проєктом">
        <p>{{ currentProject ? `Поточний проєкт: ${currentProject.title}` : 'Оберіть один проєкт для групової зміни статусу.' }}</p>
        <button type="button" class="tf5-btn" :disabled="!currentProject?.taskCount" @click="requestBulkChange">Усі завдання проєкту у роботу</button>
      </section>
      <section class="tf3-section">
        <div class="tf3-section-heading">
          <h2 ref="listHeading" class="tf5-list-heading" tabindex="-1">Список завдань</h2>
          <div class="tf5-counts">
            <TaskCounter :count="visibleTasks.length" />
            <span>Усього: {{ tasks.length }}</span>
            <span class="tf5-completion" role="status">Виконано серед знайдених: {{ visibleCompletion }}%</span>
          </div>
        </div>
        <div v-if="!tasks.length" class="tf5-empty tf5-empty--all" role="status">
          <h3>Список завдань порожній</h3>
          <p>Усі завдання видалено. Створіть нове завдання, щоб продовжити роботу.</p>
          <button type="button" class="tf5-btn" @click="createTask">Створити перше завдання</button>
        </div>
        <div v-else-if="visibleTasks.length" class="tf3-task-grid">
          <TaskCard v-for="task in visibleTasks" :key="task.id" :task="task" :project-title="projectStore.projectTitle(task.projectId)" :editable="true"
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
    <dialog v-if="pendingBulkProject" ref="bulkDialog" class="tf3-dialog tf5-delete-dialog"
      :aria-labelledby="`${bulkDialogId}-title`" @cancel.prevent="cancelBulkChange">
      <h2 :id="`${bulkDialogId}-title`">Перевести проєкт у роботу?</h2>
      <p>Усі завдання проєкту «{{ pendingBulkProject.title }}» ({{ pendingBulkProject.taskCount }}) отримають статус «У роботі», включно з виконаними та прихованими іншими фільтрами.</p>
      <div class="tf5-controls-actions">
        <button type="button" class="tf5-btn" autofocus @click="cancelBulkChange">Скасувати</button>
        <button type="button" class="tf5-btn tf5-btn--primary" @click="confirmBulkChange">Підтвердити</button>
      </div>
    </dialog>
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
