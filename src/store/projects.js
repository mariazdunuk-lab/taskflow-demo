import { defineStore } from 'pinia';
import { useTasksStore } from './tasks.js';

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [
      { id: 'general', title: 'Загальні' },
      { id: 'study', title: 'Навчання' },
      { id: 'personal', title: 'Особисті' },
    ],
    nextProjectId: 1,
  }),
  getters: {
    projectCount: state => state.projects.length,
    projectTitle: state => id => state.projects.find(project => project.id === id)?.title ?? 'Загальні',
    projectStats(state) {
      const counts = new Map(state.projects.map(project => [project.id, { taskCount: 0, completedCount: 0 }]));
      useTasksStore().tasks.forEach(task => {
        const count = counts.get(task.projectId);
        if (!count) return;
        count.taskCount += 1;
        if (task.status === 'done') count.completedCount += 1;
      });
      return state.projects.map(project => {
        const count = counts.get(project.id);
        return { ...project, ...count, incompleteCount: count.taskCount - count.completedCount,
          completionPercent: count.taskCount ? Math.round(count.completedCount / count.taskCount * 100) : 0 };
      });
    },
  },
  actions: {
    addProject(rawTitle) {
      const title = String(rawTitle ?? '').trim();
      if (title.length < 3 || title.length > 40) return null;
      if (this.projects.some(project => project.title.toLocaleLowerCase('uk-UA') === title.toLocaleLowerCase('uk-UA'))) return null;
      const project = { id: `project-${this.nextProjectId}`, title };
      this.nextProjectId += 1;
      this.projects.push(project);
      return project;
    },
  },
});
