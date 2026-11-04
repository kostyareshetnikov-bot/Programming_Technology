// Колонки и переходы между статусами.
export const COLUMNS = [
  { id: "todo", title: "К выполнению" },
  { id: "doing", title: "В работе" },
  { id: "done", title: "Готово" },
];

export function moveTask(tasks, id, direction) {
  return tasks.map((t) => {
    if (t.id !== id) return t;
    const index = COLUMNS.findIndex((c) => c.id === t.status) + direction;
    if (index < 0 || index >= COLUMNS.length) return t; // за границы не выходим
    return { ...t, status: COLUMNS[index].id };
  });
}

export function groupByColumn(tasks) {
  return COLUMNS.map((c) => ({ ...c, tasks: tasks.filter((t) => t.status === c.id) }));
}
