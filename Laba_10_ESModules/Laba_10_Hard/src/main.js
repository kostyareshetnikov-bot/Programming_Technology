import { addTask, removeTask } from "./modules/tasks.js";
import { moveTask, groupByColumn } from "./modules/columns.js";
import { loadTasks, saveTasks } from "./modules/storage.js";
import { progressPercent } from "./modules/stats.js";
import { renderBoard, renderStats, showMessage } from "./modules/ui.js";

const $ = (s) => document.querySelector(s);
let tasks = loadTasks();

function refresh() {
  renderBoard($("#board"), groupByColumn(tasks));
  renderStats($("#stats"), tasks.length, progressPercent(tasks));
  saveTasks(tasks);
}

$("#add-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const res = addTask(tasks, $("#title").value);
  tasks = res.tasks;
  if (res.error) {
    showMessage($("#message"), res.error);
  } else {
    showMessage($("#message"), "Задача добавлена", false);
    $("#title").value = "";
  }
  refresh();
});

$("#board").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === "left") tasks = moveTask(tasks, id, -1);
  if (action === "right") tasks = moveTask(tasks, id, 1);
  if (action === "delete") tasks = removeTask(tasks, id);
  showMessage($("#message"), "");
  refresh();
});

refresh();
