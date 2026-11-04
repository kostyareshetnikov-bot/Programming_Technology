// Модель задач: создание, проверка, удаление. Без DOM.
export const MAX_TITLE = 60;

export function validateTitle(raw) {
  const value = String(raw).trim();
  if (value === "") return { ok: false, error: "Введите название задачи" };
  if (value.length > MAX_TITLE) return { ok: false, error: `Не более ${MAX_TITLE} символов` };
  return { ok: true, value };
}

export function addTask(tasks, rawTitle) {
  const check = validateTitle(rawTitle);
  if (!check.ok) return { tasks, error: check.error };
  const exists = tasks.some((t) => t.title.toLowerCase() === check.value.toLowerCase());
  if (exists) return { tasks, error: "Такая задача уже есть" };
  const task = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: check.value, status: "todo" };
  return { tasks: [...tasks, task] };
}

export function removeTask(tasks, id) {
  return tasks.filter((t) => t.id !== id);
}
