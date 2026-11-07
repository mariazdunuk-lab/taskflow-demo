import { defineStore } from 'pinia';
import initialTasks from '../data/tasks.js';
import { useProjectsStore } from './projects.js';
import { priorityOrder } from '../utils/tasks.js';

const allowedStatuses = ['todo', 'progress', 'done'];
const allowedPriorities = ['low', 'medium', 'high'];
const allowedCategories = ['study', 'work', 'personal'];

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && date.getFullYear() > 0
    && `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` === value;
}

export function getTaskErrors(data, { editingTask = null, tasks = [], projects = [] } = {}) {
  const errors = {};
  const title = typeof data?.title === 'string' ? data.title.trim() : '';
  const description = typeof data?.description === 'string' ? data.description.trim() : '';
  if (!title) errors.title = 'Вкажіть назву завдання.';
  else if (title.length < 3) errors.title = 'Назва має містити щонайменше 3 символи.';
  else if (title.length > 80) errors.title = 'Максимальна довжина назви — 80 символів.';
  else if (!editingTask && tasks.some(task => task.title.trim().toLocaleLowerCase('uk-UA') === title.toLocaleLowerCase('uk-UA'))) {
    errors.title = 'Завдання з такою назвою вже існує.';
  }
  if (description.length > 500) errors.description = 'Опис не повинен перевищувати 500 символів.';
  if (!allowedStatuses.includes(data?.status)) errors.status = 'Оберіть коректний статус.';
  if (!allowedPriorities.includes(data?.priority)) errors.priority = 'Оберіть коректний пріоритет.';
  if (!allowedCategories.includes(data?.category)) errors.category = 'Оберіть коректну категорію.';
  if (data?.dueDate && !validDate(data.dueDate)) errors.dueDate = 'Укажіть коректну дату завершення.';
  if (!projects.some(project => project.id === data?.projectId)) errors.projectId = 'Оберіть проєкт зі списку.';
  return errors;
}

function normalizeValues(data, projects) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const projectId = String(data.projectId ?? 'general');
  return {
    title: String(data.title ?? '').trim(),
    description: String(data.description ?? '').trim(),
    status: allowedStatuses.includes(data.status) ? data.status : 'todo',
    priority: allowedPriorities.includes(data.priority) ? data.priority : 'medium',
    category: allowedCategories.includes(data.category) ? data.category : 'study',
    dueDate: String(data.dueDate ?? ''),
    projectId: projects.some(project => project.id === projectId) ? projectId : 'general',
  };
}

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: initialTasks.map(task => ({ category: 'study', ...task, projectId: task.projectId ?? 'general' })),
    searchText: '', selectedStatus: 'all', selectedPriority: 'all', selectedProject: 'all', sortOrder: 'newest',
    onlyIncomplete: false, onlyWithoutDueDate: false,
  }),
  getters: {
    totalTasks: state => state.tasks.length,
    completedTasks: state => state.tasks.filter(task => task.status === 'done').length,
    progressTasks: state => state.tasks.filter(task => task.status === 'progress').length,
    plannedTasks: state => state.tasks.filter(task => task.status === 'todo').length,
    completionPercent() { return this.totalTasks ? Math.round(this.completedTasks / this.totalTasks * 100) : 0; },
    activeTasks: state => state.tasks.filter(task => task.status !== 'done')
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || b.id - a.id).slice(0, 3),
    visibleTasks(state) {
      const term = state.searchText.trim().toLocaleLowerCase('uk-UA');
      const statusOrder = { progress: 0, todo: 1, done: 2 };
      const filtered = state.tasks.filter(task =>
        (!term || `${task.title} ${task.description ?? ''}`.toLocaleLowerCase('uk-UA').includes(term))
        && (state.selectedStatus === 'all' || task.status === state.selectedStatus)
        && (state.selectedPriority === 'all' || task.priority === state.selectedPriority)
        && (state.selectedProject === 'all' || task.projectId === state.selectedProject)
        && (!state.onlyIncomplete || task.status !== 'done')
        && (!state.onlyWithoutDueDate || !task.dueDate));
      return filtered.sort((a, b) => {
        if (state.sortOrder === 'title') return a.title.localeCompare(b.title, 'uk-UA') || a.id - b.id;
        if (state.sortOrder === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority] || b.id - a.id;
        if (state.sortOrder === 'priorityAsc') return priorityOrder[b.priority] - priorityOrder[a.priority] || b.id - a.id;
        if (state.sortOrder === 'status') return statusOrder[a.status] - statusOrder[b.status] || b.id - a.id;
        if (state.sortOrder === 'dueDate' || state.sortOrder === 'dueDateDesc') {
          if (!a.dueDate && b.dueDate) return 1;
          if (a.dueDate && !b.dueDate) return -1;
          const difference = (a.dueDate || '').localeCompare(b.dueDate || '');
          return (state.sortOrder === 'dueDateDesc' ? -difference : difference) || b.id - a.id;
        }
        return b.id - a.id;
      });
    },
    visibleCompletion() {
      return this.visibleTasks.length ? Math.round(this.visibleTasks.filter(task => task.status === 'done').length / this.visibleTasks.length * 100) : 0;
    },
  },
  actions: {
    addTask(data) {
      const { projects } = useProjectsStore();
      const normalized = normalizeValues(data, projects);
      if (!normalized || Object.keys(getTaskErrors(normalized, { tasks: this.tasks, projects })).length) return false;
      const id = this.tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
      this.tasks.unshift({ id, ...normalized });
      return true;
    },
    updateTask(data) {
      if (!data || typeof data !== 'object') return false;
      const task = this.tasks.find(item => item.id === Number(data.id));
      if (!task) return false;
      const { projects } = useProjectsStore();
      const normalized = normalizeValues(data, projects);
      if (!normalized || Object.keys(getTaskErrors(normalized, { editingTask: task, tasks: this.tasks, projects })).length) return false;
      Object.assign(task, normalized);
      return true;
    },
    deleteTask(id) {
      const index = this.tasks.findIndex(task => task.id === Number(id));
      if (index === -1) return false;
      this.tasks.splice(index, 1);
      return true;
    },
    setTaskStatus({ id, status } = {}) {
      if (!allowedStatuses.includes(status)) return false;
      const task = this.tasks.find(item => item.id === Number(id));
      if (!task) return false;
      task.status = status;
      return true;
    },
    setTaskPriority({ id, priority } = {}) {
      if (!allowedPriorities.includes(priority)) return false;
      const task = this.tasks.find(item => item.id === Number(id));
      if (!task) return false;
      task.priority = priority;
      return true;
    },
    moveCurrentProjectToProgress() {
      if (!useProjectsStore().projects.some(project => project.id === this.selectedProject)) return 0;
      let changed = 0;
      this.tasks.forEach(task => {
        if (task.projectId === this.selectedProject && task.status !== 'progress') {
          task.status = 'progress';
          changed += 1;
        }
      });
      return changed;
    },
    resetFilters() {
      this.searchText = '';
      this.selectedStatus = 'all';
      this.selectedPriority = 'all';
      this.selectedProject = 'all';
      this.sortOrder = 'newest';
      this.onlyIncomplete = false;
      this.onlyWithoutDueDate = false;
    },
  },
});
