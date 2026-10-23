export const priorityOrder = { high: 0, medium: 1, low: 2 };

export function formatDueDate(value) {
  if (!value) return 'Без терміну';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'Дата не визначена';
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
