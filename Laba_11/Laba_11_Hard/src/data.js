// Колонки доски (порядок важен — по нему перемещаются карточки)
export const STATUSES = [
  { id: 'todo', title: 'К выполнению', color: 'var(--muted)' },
  { id: 'progress', title: 'В работе', color: 'var(--yellow)' },
  { id: 'done', title: 'Готово', color: 'var(--green)' },
];

export const PRIORITIES = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

// Задачи по умолчанию (если в localStorage ничего нет)
export const START_TASKS = [
  { id: 1, title: 'Создать проект через Vite', priority: 'high', status: 'done' },
  { id: 2, title: 'Сделать компонент TaskCard', priority: 'medium', status: 'progress' },
  { id: 3, title: 'Добавить сохранение в localStorage', priority: 'low', status: 'todo' },
  { id: 4, title: 'Написать отчёт по лабораторной', priority: 'high', status: 'todo' },
];
