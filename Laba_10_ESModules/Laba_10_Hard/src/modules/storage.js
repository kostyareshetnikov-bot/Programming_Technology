import { COLUMNS } from "./columns.js";
const KEY = "lab10_kanban";
const valid = (t) => t && typeof t.id === "string" && typeof t.title === "string" && COLUMNS.some((c) => c.id === t.status);

export function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(data) ? data.filter(valid) : [];
  } catch {
    return [];
  }
}
export function saveTasks(tasks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
}
