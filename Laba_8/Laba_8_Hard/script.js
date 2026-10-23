// Лабораторная работа №8. Вариант 16: канбан-доска «План / В работе / Готово».
// Структура данных (массив объектов), хранится в localStorage:
// [ { "id": "k3x9a", "text": "Сделать отчёт", "status": "progress" }, ... ]

const KEY = "lab8_kanban";
const COLUMNS = [
  { id: "plan",     title: "План" },
  { id: "progress", title: "В работе" },
  { id: "done",     title: "Готово" }
];

const board = document.querySelector("#board");
const textInput = document.querySelector("#text");
const errorBox = document.querySelector("#error");

let cards = load();

// Чтение с проверкой формата: повреждённый JSON не ломает приложение
function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(c => c && typeof c.id === "string" && typeof c.text === "string"
      && COLUMNS.some(col => col.id === c.status));
  } catch (error) {
    return [];
  }
}

// Сохранение: массив -> JSON-строка, затем перерисовка
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cards));
  } catch (error) {
    errorBox.textContent = "Не удалось сохранить: хранилище недоступно.";
  }
  render();
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Перенос карточки в другую колонку (используется и кнопками, и drag-and-drop)
function moveCard(id, status) {
  const card = cards.find(c => c.id === id);
  if (!card || card.status === status) return;
  card.status = status;
  save();
}

function render() {
  board.replaceChildren();

  COLUMNS.forEach((col, colIndex) => {
    const section = document.createElement("section");
    section.className = "column";
    section.dataset.status = col.id;

    const inColumn = cards.filter(c => c.status === col.id);

    const title = document.createElement("h2");
    title.textContent = col.title + " ";
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = inColumn.length;
    title.append(count);
    section.append(title);

    if (inColumn.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "Пока пусто";
      section.append(empty);
    }

    inColumn.forEach(card => {
      const el = document.createElement("article");
      el.className = "card";
      el.draggable = true;

      el.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", card.id);
        el.classList.add("dragging");
      });
      el.addEventListener("dragend", () => el.classList.remove("dragging"));

      const text = document.createElement("p");
      text.textContent = card.text;

      const actions = document.createElement("div");
      actions.className = "actions";

      const left = document.createElement("button");
      left.type = "button";
      left.textContent = "←";
      left.title = "Перенести левее";
      left.disabled = colIndex === 0;
      left.addEventListener("click", () => moveCard(card.id, COLUMNS[colIndex - 1].id));

      const right = document.createElement("button");
      right.type = "button";
      right.textContent = "→";
      right.title = "Перенести правее";
      right.disabled = colIndex === COLUMNS.length - 1;
      right.addEventListener("click", () => moveCard(card.id, COLUMNS[colIndex + 1].id));

      const del = document.createElement("button");
      del.type = "button";
      del.className = "del";
      del.textContent = "Удалить";
      del.addEventListener("click", () => {
        cards = cards.filter(c => c.id !== card.id);
        save();
      });

      actions.append(left, right, del);
      el.append(text, actions);
      section.append(el);
    });

    // Колонка принимает перетаскиваемые карточки
    section.addEventListener("dragover", e => {
      e.preventDefault();
      section.classList.add("over");
    });
    section.addEventListener("dragleave", () => section.classList.remove("over"));
    section.addEventListener("drop", e => {
      e.preventDefault();
      section.classList.remove("over");
      moveCard(e.dataTransfer.getData("text/plain"), col.id);
    });

    board.append(section);
  });
}

function addCard() {
  const text = textInput.value.trim();
  if (!text) {                             // пустой ввод не создаёт карточку
    errorBox.textContent = "Введите текст карточки.";
    return;
  }
  errorBox.textContent = "";
  cards.push({ id: makeId(), text, status: "plan" });
  textInput.value = "";
  save();
}

document.querySelector("#add").addEventListener("click", addCard);
textInput.addEventListener("keydown", e => { if (e.key === "Enter") addCard(); });

document.querySelector("#clear").addEventListener("click", () => {
  if (!cards.length) return;
  if (confirm("Удалить все карточки?")) {
    cards = [];
    localStorage.removeItem(KEY);          // удаляем запись по ключу
    render();
  }
});

render();
