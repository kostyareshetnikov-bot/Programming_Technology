import { COLUMNS } from "./columns.js";

function button(text, action, id, disabled = false) {
  const b = document.createElement("button");
  b.textContent = text;
  b.dataset.action = action;
  b.dataset.id = id;
  b.disabled = disabled;
  return b;
}

export function renderBoard(el, groups) {
  el.replaceChildren(
    ...groups.map((g, colIndex) => {
      const section = document.createElement("section");
      section.className = "column";
      const h = document.createElement("h2");
      h.textContent = `${g.title} (${g.tasks.length})`;
      const ul = document.createElement("ul");
      ul.append(
        ...g.tasks.map((t) => {
          const li = document.createElement("li");
          li.className = "card";
          const title = document.createElement("span");
          title.textContent = t.title;
          const controls = document.createElement("span");
          controls.append(
            button("←", "left", t.id, colIndex === 0),
            button("→", "right", t.id, colIndex === COLUMNS.length - 1),
            button("✕", "delete", t.id)
          );
          li.append(title, controls);
          return li;
        })
      );
      section.append(h, ul);
      return section;
    })
  );
}

export function renderStats(el, total, percent) {
  el.textContent = `Всего задач: ${total}; выполнено: ${percent}%`;
}

export function showMessage(el, text, isError = true) {
  el.textContent = text;
  el.className = isError ? "error" : "ok";
}
