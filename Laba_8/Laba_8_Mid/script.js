// Лабораторная работа №8. Вариант 8: To-Do со статусом, удалением и фильтром.
// Структура данных (массив объектов), хранится в localStorage:
// [ { "id": "k3x9a", "text": "Сделать лабу", "done": false }, ... ]

const KEY = "lab8_todo";

const taskInput = document.querySelector("#task");
const errorBox = document.querySelector("#error");
const list = document.querySelector("#list");
const emptyBox = document.querySelector("#empty");
const counter = document.querySelector("#counter");
const filterButtons = document.querySelectorAll("[data-filter]");

let filter = "all";   // текущий фильтр: all | active | done
let tasks = load();

// Чтение из хранилища с защитой от пустых и повреждённых данных
function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    // оставляем только корректные объекты задач
    return parsed.filter(t => t && typeof t.id === "string"
      && typeof t.text === "string" && typeof t.done === "boolean");
  } catch (error) {
    return [];
  }
}

// Сохранение: массив объектов -> JSON-строка, затем перерисовка
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch (error) {
    errorBox.textContent = "Не удалось сохранить: хранилище недоступно.";
  }
  render();
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Отрисовка списка с учётом фильтра
function render() {
  list.replaceChildren();

  const visible = tasks.filter(t =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done);

  visible.forEach(task => {
    const li = document.createElement("li");
    if (task.done) li.classList.add("done");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = task.done;
    check.setAttribute("aria-label", "Выполнено");
    check.addEventListener("change", () => {
      task.done = check.checked;
      save();
    });

    const text = document.createElement("span");
    text.textContent = task.text;           // textContent — защита от вставки HTML

    const del = document.createElement("button");
    del.type = "button";
    del.className = "del";
    del.textContent = "Удалить";
    del.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      save();
    });

    li.append(check, text, del);
    list.append(li);
  });

  emptyBox.hidden = visible.length > 0;
  const left = tasks.filter(t => !t.done).length;
  counter.textContent = `Всего: ${tasks.length}, осталось выполнить: ${left}`;
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) {                              // пустой ввод не создаёт запись
    errorBox.textContent = "Введите текст задачи.";
    return;
  }
  errorBox.textContent = "";
  tasks.push({ id: makeId(), text, done: false });
  taskInput.value = "";
  save();
}

document.querySelector("#add").addEventListener("click", addTask);
taskInput.addEventListener("keydown", e => { if (e.key === "Enter") addTask(); });

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    filterButtons.forEach(b => b.classList.toggle("active", b === btn));
    render();
  });
});

render();
