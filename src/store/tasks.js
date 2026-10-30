import { reactive } from 'vue';
import initialTasks from '../data/tasks.js';

const allowedStatuses = ['todo', 'progress', 'done'];
const allowedPriorities = ['low', 'medium', 'high'];
const allowedCategories = ['study', 'work', 'personal'];

export const taskState = reactive({
  tasks: initialTasks.map(task => ({ category: 'study', ...task })),
});

export function localToday() {
  const date = new Date();
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && date.getFullYear() > 0
    && `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` === value;
}

export function getTaskErrors(data, { editingTask = null, today = localToday() } = {}) {
  const errors = {};
  const title = typeof data?.title === 'string' ? data.title.trim() : '';
  const description = typeof data?.description === 'string' ? data.description.trim() : '';

  if (!title) errors.title = 'Вкажіть назву завдання.';
  else if (title.length < 3) errors.title = 'Назва має містити щонайменше 3 символи.';
  else if (title.length > 80) errors.title = 'Максимальна довжина назви — 80 символів.';
  else if (!editingTask && taskState.tasks.some(task => task.title.trim().toLocaleLowerCase('uk-UA') === title.toLocaleLowerCase('uk-UA'))) {
    errors.title = 'Завдання з такою назвою вже існує.';
  }

  if (description.length > 300) errors.description = 'Опис не повинен перевищувати 300 символів.';
  if (!allowedStatuses.includes(data?.status)) errors.status = 'Оберіть коректний статус.';
  if (!allowedPriorities.includes(data?.priority)) errors.priority = 'Оберіть коректний пріоритет.';
  if (!allowedCategories.includes(data?.category)) errors.category = 'Оберіть коректну категорію.';
  if (!validDate(data?.dueDate)) errors.dueDate = 'Укажіть коректну дату завершення.';
  else if (data.dueDate < today && (!editingTask || data.dueDate !== editingTask.dueDate)) {
    errors.dueDate = 'Оберіть сьогоднішню або майбутню дату.';
  }
  return errors;
}

function normalizeTaskData(data, editingTask = null) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  if (Object.keys(getTaskErrors(data, { editingTask })).length) return null;
  return {
    title: data.title.trim(),
    description: typeof data.description === 'string' ? data.description.trim() : '',
    status: data.status,
    priority: data.priority,
    category: data.category,
    dueDate: data.dueDate,
  };
}

export function addTask(data) {
  const normalized = normalizeTaskData(data);
  if (!normalized) return null;
  const nextId = taskState.tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
  const newTask = { id: nextId, ...normalized };
  taskState.tasks.push(newTask);
  return newTask;
}

export function updateTask(data) {
  if (!data || typeof data !== 'object') return null;
  const task = taskState.tasks.find(item => item.id === data.id);
  if (!task) return null;
  const normalized = normalizeTaskData(data, task);
  if (!normalized) return null;
  Object.assign(task, normalized);
  return task;
}

export function setTaskStatus({ id, status } = {}) {
  if (!allowedStatuses.includes(status)) return;
  const task = taskState.tasks.find(item => item.id === id);
  if (task) task.status = status;
}

export function setTaskPriority({ id, priority } = {}) {
  if (!allowedPriorities.includes(priority)) return;
  const task = taskState.tasks.find(item => item.id === id);
  if (task) task.priority = priority;
}
