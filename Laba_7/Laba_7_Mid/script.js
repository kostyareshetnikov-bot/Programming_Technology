
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("taskForm");
    const input = document.getElementById("taskInput");
    const errorMsg = document.getElementById("taskError");
    const tabsEl = document.getElementById("tabs");
    const listEl = document.getElementById("taskList");
    const emptyMsg = document.getElementById("emptyMsg");
  
    if (!form || !listEl) return;
  
    const STORAGE_KEY = "lab10-tasks";
    const FILTERS = ["all", "active", "done"];
  
    const EMPTY_TEXT = {
      all: "Задач пока нет. Добавьте первую выше.",
      active: "Активных задач нет — всё сделано!",
      done: "Выполненных задач пока нет.",
    };
  
    // ===== Состояние =====
    let tasks = loadTasks();
    let currentFilter = "all";
  
    function loadTasks() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        // localStorage недоступен или данные повреждены — начинаем с примеров
      }
      return [
        { id: 1, text: "Прочитать конспект по JavaScript", done: true },
        { id: 2, text: "Сделать лабораторную работу", done: false },
        { id: 3, text: "Подготовиться к защите", done: false },
      ];
    }
  
    function saveTasks() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (e) {
        // игнорируем — работа продолжается без сохранения
      }
    }
  
    function nextId() {
      return tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
    }
  
    // ===== Рендер =====
    function getVisibleTasks() {
      if (currentFilter === "active") return tasks.filter((t) => !t.done);
      if (currentFilter === "done") return tasks.filter((t) => t.done);
      return tasks;
    }
  
    function createTaskItem(task) {
      const li = document.createElement("li");
      li.className = "task" + (task.done ? " task--done" : "");
      li.dataset.id = task.id;
  
      const label = document.createElement("label");
      label.className = "task__label";
  
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task__check";
      checkbox.checked = task.done;
  
      const text = document.createElement("span");
      text.className = "task__text";
      text.textContent = task.text; // textContent — без риска HTML-инъекций
  
      label.append(checkbox, text);
  
      const del = document.createElement("button");
      del.type = "button";
      del.className = "task__delete";
      del.textContent = "Удалить";
      del.setAttribute("aria-label", "Удалить задачу: " + task.text);
  
      li.append(label, del);
      return li;
    }
  
    function updateCounts() {
      const done = tasks.filter((t) => t.done).length;
      document.getElementById("count-all").textContent = tasks.length;
      document.getElementById("count-done").textContent = done;
      document.getElementById("count-active").textContent = tasks.length - done;
    }
  
    function render() {
      const visible = getVisibleTasks();
  
      listEl.innerHTML = "";
      visible.forEach((task) => listEl.appendChild(createTaskItem(task)));
  
      emptyMsg.hidden = visible.length !== 0;
      emptyMsg.textContent = EMPTY_TEXT[currentFilter];
  
      updateCounts();
    }
  
    // ===== Вкладки =====
    function setFilter(filter, updateHash = true) {
      currentFilter = FILTERS.includes(filter) ? filter : "all";
  
      tabsEl.querySelectorAll(".tab").forEach((btn) => {
        const isActive = btn.dataset.filter === currentFilter;
        btn.classList.toggle("tab--active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
        btn.tabIndex = isActive ? 0 : -1;
      });
  
      if (updateHash) history.replaceState(null, "", "#" + currentFilter);
      render();
    }
  
    tabsEl.addEventListener("click", (event) => {
      const btn = event.target.closest(".tab");
      if (btn) setFilter(btn.dataset.filter);
    });
  
    tabsEl.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const step = event.key === "ArrowRight" ? 1 : -1;
      const idx = FILTERS.indexOf(currentFilter);
      const next = FILTERS[(idx + step + FILTERS.length) % FILTERS.length];
      setFilter(next);
      document.getElementById("tab-" + next).focus();
    });
  
    window.addEventListener("hashchange", () => setFilter(location.hash.slice(1), false));
  
    // ===== Добавление задачи =====
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = input.value.trim();
  
      if (text === "") {
        errorMsg.hidden = false;
        input.classList.add("invalid");
        input.focus();
        return;
      }
  
      tasks.unshift({ id: nextId(), text, done: false }); // новые — сверху
      saveTasks();
  
      input.value = "";
      errorMsg.hidden = true;
      input.classList.remove("invalid");
      input.focus();
  
      render();
    });
  
    input.addEventListener("input", () => {
      errorMsg.hidden = true;
      input.classList.remove("invalid");
    });
  
    // ===== Смена статуса и удаление (делегирование событий) =====
    listEl.addEventListener("change", (event) => {
      if (!event.target.classList.contains("task__check")) return;
      const id = Number(event.target.closest(".task").dataset.id);
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
  
      task.done = event.target.checked;
      saveTasks();
      render(); // задача «уйдёт» из вкладки, если статус больше ей не соответствует
    });
  
    listEl.addEventListener("click", (event) => {
      const btn = event.target.closest(".task__delete");
      if (!btn) return;
      const id = Number(btn.closest(".task").dataset.id);
      tasks = tasks.filter((t) => t.id !== id);
      saveTasks();
      render();
    });
  
    // ===== Старт =====
    setFilter(location.hash.slice(1) || "all", false);
  });