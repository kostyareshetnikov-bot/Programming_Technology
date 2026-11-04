// Творческий модуль: статистика по доске.
export function progressPercent(tasks) {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100);
}
