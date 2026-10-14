
document.addEventListener("DOMContentLoaded", () => {
  const tabsEl = document.getElementById("tabs");
  const listEl = document.getElementById("orderList");
  const emptyMsg = document.getElementById("emptyMsg");

  if (!tabsEl || !listEl) return;

  const STORAGE_KEY = "lab11-orders";
  const CURRENCY = "₽";

  // Порядок статусов = порядок вкладок. Из него же считаются «вперёд/назад».
  const STATUSES = ["new", "progress", "ready"];

  const FORWARD_LABEL = {
    new: "Взять в работу",
    progress: "Отметить готовым",
  };
  const BACK_LABEL = {
    progress: "Вернуть в новые",
    ready: "Вернуть в работу",
  };
  const EMPTY_TEXT = {
    new: "Новых заказов нет.",
    progress: "Сейчас ничего не в работе.",
    ready: "Готовых заказов пока нет.",
  };

  // ===== Данные =====
  const defaultOrders = [
    { id: 101, customer: "Анна Смирнова", items: ["Пицца «Маргарита»", "Лимонад"], total: 1190, status: "new" },
    { id: 102, customer: "Игорь Волков", items: ["Бургер", "Картофель фри", "Кола"], total: 1450, status: "new" },
    { id: 103, customer: "Мария Орлова", items: ["Салат «Цезарь»"], total: 620, status: "progress" },
    { id: 104, customer: "Денис Ким", items: ["Паста карбонара", "Чай"], total: 940, status: "progress" },
    { id: 105, customer: "Елена Попова", items: ["Роллы «Филадельфия»", "Мисо-суп"], total: 1680, status: "ready" },
  ];

  let orders = loadOrders();
  let currentStatus = "new";

  function loadOrders() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // localStorage недоступен или данные повреждены — берём примеры
    }
    return defaultOrders.map((o) => ({ ...o }));
  }

  function saveOrders() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      // работаем без сохранения
    }
  }

  // ===== Рендер =====
  function formatMoney(value) {
    return value.toLocaleString("ru-RU") + " " + CURRENCY;
  }

  function createOrderCard(order) {
    const li = document.createElement("li");
    li.className = "order";
    li.dataset.id = order.id;

    // Шапка: номер и сумма
    const head = document.createElement("div");
    head.className = "order__head";

    const number = document.createElement("span");
    number.className = "order__number";
    number.textContent = "Заказ №" + order.id;

    const total = document.createElement("span");
    total.className = "order__total";
    total.textContent = formatMoney(order.total);

    head.append(number, total);

    // Клиент
    const customer = document.createElement("p");
    customer.className = "order__customer";
    customer.textContent = order.customer;

    // Состав
    const items = document.createElement("ul");
    items.className = "order__items";
    order.items.forEach((name) => {
      const item = document.createElement("li");
      item.textContent = name;
      items.appendChild(item);
    });

    // Кнопки смены статуса
    const actions = document.createElement("div");
    actions.className = "order__actions";

    if (BACK_LABEL[order.status]) {
      const back = document.createElement("button");
      back.type = "button";
      back.className = "btn-secondary";
      back.dataset.action = "back";
      back.textContent = "← " + BACK_LABEL[order.status];
      actions.appendChild(back);
    }

    if (FORWARD_LABEL[order.status]) {
      const forward = document.createElement("button");
      forward.type = "button";
      forward.className = "btn-submit btn-submit--inline";
      forward.dataset.action = "forward";
      forward.textContent = FORWARD_LABEL[order.status] + " →";
      actions.appendChild(forward);
    }

    li.append(head, customer, items, actions);
    return li;
  }

  function updateCounts() {
    STATUSES.forEach((status) => {
      const count = orders.filter((o) => o.status === status).length;
      document.getElementById("count-" + status).textContent = count;
    });
  }

  function render() {
    const visible = orders.filter((o) => o.status === currentStatus);

    listEl.innerHTML = "";
    visible.forEach((order) => listEl.appendChild(createOrderCard(order)));

    emptyMsg.hidden = visible.length !== 0;
    emptyMsg.textContent = EMPTY_TEXT[currentStatus];

    updateCounts();
  }

  // ===== Вкладки =====
  function setStatus(status, updateHash = true) {
    currentStatus = STATUSES.includes(status) ? status : "new";

    tabsEl.querySelectorAll(".tab").forEach((btn) => {
      const isActive = btn.dataset.status === currentStatus;
      btn.classList.toggle("tab--active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
      btn.tabIndex = isActive ? 0 : -1;
    });

    if (updateHash) history.replaceState(null, "", "#" + currentStatus);
    render();
  }

  tabsEl.addEventListener("click", (event) => {
    const btn = event.target.closest(".tab");
    if (btn) setStatus(btn.dataset.status);
  });

  tabsEl.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const step = event.key === "ArrowRight" ? 1 : -1;
    const idx = STATUSES.indexOf(currentStatus);
    const next = STATUSES[(idx + step + STATUSES.length) % STATUSES.length];
    setStatus(next);
    document.getElementById("tab-" + next).focus();
  });

  window.addEventListener("hashchange", () => setStatus(location.hash.slice(1), false));

  // ===== Смена статуса (делегирование событий) =====
  listEl.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;

    const id = Number(btn.closest(".order").dataset.id);
    const order = orders.find((o) => o.id === id);
    if (!order) return;

    const idx = STATUSES.indexOf(order.status);
    const shift = btn.dataset.action === "forward" ? 1 : -1;
    const newIdx = idx + shift;
    if (newIdx < 0 || newIdx >= STATUSES.length) return;

    order.status = STATUSES[newIdx];
    saveOrders();
    render(); // заказ уходит с текущей вкладки, счётчики пересчитываются
  });

  // ===== Старт =====
  setStatus(location.hash.slice(1) || "new", false);
});