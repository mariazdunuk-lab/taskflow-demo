<script setup>
import { computed, nextTick, reactive, ref, useId } from 'vue';
import StatusBadge from './StatusBadge.vue';
import PriorityBadge from './PriorityBadge.vue';
import { getTaskErrors } from '../store/tasks.js';
import { formatDueDate } from '../utils/tasks.js';

const props = defineProps({
  task: { type: Object, default: null },
  projects: { type: Array, required: true },
  existingTasks: { type: Array, default: () => [] },
  defaultProject: { type: String, default: 'general' },
});
const emit = defineEmits(['save', 'cancel']);
const prefix = useId();
const titleInput = ref(null);
const formElement = ref(null);
const showErrors = ref(false);
const isEditing = computed(() => props.task !== null);
const defaults = () => ({
  title: '', description: '', status: 'todo', priority: 'medium', category: 'study', dueDate: '', projectId: props.defaultProject,
});
const form = reactive({
  title: props.task?.title ?? '',
  description: props.task?.description ?? '',
  status: props.task?.status ?? 'todo',
  priority: props.task?.priority ?? 'medium',
  category: props.task?.category ?? 'study',
  dueDate: props.task?.dueDate ?? '',
  projectId: props.task?.projectId ?? props.defaultProject,
});
const categories = { study: 'Навчання', work: 'Робота', personal: 'Особисте' };
const errors = computed(() => getTaskErrors(form, { editingTask: props.task, tasks: props.existingTasks, projects: props.projects }));
const titleRemaining = computed(() => 80 - form.title.length);
const descriptionRemaining = computed(() => 500 - form.description.length);

function fieldId(field) {
  return prefix + '-' + field;
}

function describedBy(field, hasHint = false) {
  return [
    hasHint ? fieldId(field + '-hint') : '',
    showErrors.value && errors.value[field] ? fieldId(field + '-error') : '',
  ].filter(Boolean).join(' ') || undefined;
}

function focusTitle() {
  titleInput.value?.focus({ preventScroll: true });
}

async function clearForm() {
  if (isEditing.value) return;
  Object.assign(form, defaults());
  showErrors.value = false;
  await nextTick();
  focusTitle();
}

async function submitForm() {
  showErrors.value = true;
  if (Object.keys(errors.value).length) {
    await nextTick();
    formElement.value?.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  emit('save', {
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    priority: form.priority,
    category: form.category,
    dueDate: form.dueDate,
    projectId: form.projectId,
  });
}

defineExpose({ focusTitle });
</script>

<template>
  <div class="tf4-form-panel">
    <div class="tf4-form-heading">
      <div>
        <p class="tf3-eyebrow">TASKFLOW · ФОРМА</p>
        <h2 :id="fieldId('heading')">{{ isEditing ? 'Редагування завдання' : 'Нове завдання' }}</h2>
        <p class="tf4-form-note"><span class="tf4-required">*</span> Обов'язкові поля</p>
      </div>
      <button type="button" class="tf4-close" @click="emit('cancel')">Закрити</button>
    </div>
    <form ref="formElement" class="tf4-form" :aria-labelledby="fieldId('heading')" novalidate @submit.prevent="submitForm">
      <div class="tf4-field tf4-field--wide">
        <label :for="fieldId('title')">Назва завдання <span class="tf4-required" aria-hidden="true">*</span></label>
        <input :id="fieldId('title')" ref="titleInput" v-model.trim="form.title" name="title" type="text" required
          placeholder="Наприклад: Підготувати презентацію" maxlength="80" autocomplete="off"
          :aria-invalid="showErrors && !!errors.title" :aria-describedby="describedBy('title', true)" />
        <small :id="fieldId('title-hint')">Від 3 до 80 символів. Залишилося: {{ titleRemaining }}.</small>
        <p v-if="showErrors && errors.title" :id="fieldId('title-error')" class="tf4-error" role="alert">{{ errors.title }}</p>
      </div>
      <div class="tf4-field tf4-field--wide">
        <label :for="fieldId('description')">Опис</label>
        <textarea :id="fieldId('description')" v-model.trim="form.description" name="description" rows="3" maxlength="500"
          placeholder="Що потрібно зробити?" :aria-invalid="showErrors && !!errors.description"
          :aria-describedby="describedBy('description', true)"></textarea>
        <small :id="fieldId('description-hint')">Необов'язкове поле. Залишилося: {{ descriptionRemaining }} із 500 символів.</small>
        <p v-if="showErrors && errors.description" :id="fieldId('description-error')" class="tf4-error" role="alert">{{ errors.description }}</p>
      </div>
      <div class="tf4-field">
        <label :for="fieldId('status')">Статус <span class="tf4-required" aria-hidden="true">*</span></label>
        <select :id="fieldId('status')" v-model="form.status" name="status" required
          :aria-invalid="showErrors && !!errors.status" :aria-describedby="describedBy('status')">
          <option value="todo">Заплановано</option>
          <option value="progress">У роботі</option>
          <option value="done">Виконано</option>
        </select>
        <p v-if="showErrors && errors.status" :id="fieldId('status-error')" class="tf4-error" role="alert">{{ errors.status }}</p>
      </div>
      <div class="tf4-field">
        <label :for="fieldId('priority')">Пріоритет <span class="tf4-required" aria-hidden="true">*</span></label>
        <select :id="fieldId('priority')" v-model="form.priority" name="priority" required
          :aria-invalid="showErrors && !!errors.priority" :aria-describedby="describedBy('priority')">
          <option value="low">Низький</option>
          <option value="medium">Середній</option>
          <option value="high">Високий</option>
        </select>
        <p v-if="showErrors && errors.priority" :id="fieldId('priority-error')" class="tf4-error" role="alert">{{ errors.priority }}</p>
      </div>
      <div class="tf4-field">
        <label :for="fieldId('category')">Категорія <span class="tf4-required" aria-hidden="true">*</span></label>
        <select :id="fieldId('category')" v-model="form.category" name="category" required
          :aria-invalid="showErrors && !!errors.category" :aria-describedby="describedBy('category')">
          <option v-for="(label, value) in categories" :key="value" :value="value">{{ label }}</option>
        </select>
        <p v-if="showErrors && errors.category" :id="fieldId('category-error')" class="tf4-error" role="alert">{{ errors.category }}</p>
      </div>
      <div class="tf4-field">
        <label :for="fieldId('dueDate')">Дата завершення</label>
        <input :id="fieldId('dueDate')" v-model="form.dueDate" name="dueDate" type="date" max="9999-12-31"
          :aria-invalid="showErrors && !!errors.dueDate"
          :aria-describedby="describedBy('dueDate', true)" />
        <small :id="fieldId('dueDate-hint')">Необов'язкове поле. Залиште порожнім для завдання без терміну.</small>
        <p v-if="showErrors && errors.dueDate" :id="fieldId('dueDate-error')" class="tf4-error" role="alert">{{ errors.dueDate }}</p>
      </div>
      <div class="tf4-field tf4-field--wide">
        <label :for="fieldId('projectId')">Проєкт</label>
        <select :id="fieldId('projectId')" v-model="form.projectId" name="projectId"
          :aria-invalid="showErrors && !!errors.projectId" :aria-describedby="describedBy('projectId')">
          <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.title }}</option>
        </select>
        <p v-if="showErrors && errors.projectId" :id="fieldId('projectId-error')" class="tf4-error" role="alert">{{ errors.projectId }}</p>
      </div>
      <div class="tf4-preview tf4-field--wide" aria-live="polite" aria-atomic="true">
        <strong>Попередній перегляд</strong>
        <h3>{{ form.title || 'Назва нового завдання' }}</h3>
        <p v-if="form.description" class="tf4-preview-description">{{ form.description }}</p>
        <div class="tf4-preview-meta">
          <StatusBadge :status="form.status" />
          <PriorityBadge :priority="form.priority" />
          <span>{{ categories[form.category] }}</span>
          <span>Проєкт: {{ projects.find(project => project.id === form.projectId)?.title ?? 'Загальні' }}</span>
          <span>Термін: {{ formatDueDate(form.dueDate) }}</span>
        </div>
      </div>
      <div class="tf4-actions tf4-field--wide">
        <button type="submit" class="tf4-save">{{ isEditing ? 'Зберегти зміни' : 'Створити завдання' }}</button>
        <button type="button" class="tf4-cancel" @click="emit('cancel')">Скасувати</button>
        <button v-if="!isEditing" type="button" class="tf4-clear" @click="clearForm">Очистити форму</button>
      </div>
    </form>
  </div>
</template>

