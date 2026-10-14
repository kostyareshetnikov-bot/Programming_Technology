
document.addEventListener("DOMContentLoaded", () => {

    // ===== ДАННЫЕ (редактируйте под себя) =====
    const student = {
      name: "Решетников Константин",
      group: "ИС 26-21 ТИПО",
      status: "Студент · Информационные системы",
  
      about: {
        title: "О себе",
        paragraphs: [
          "Студент группы ИС 26-21 ТИПО. Изучаю веб-разработку и программирование, интересуюсь созданием удобных интерфейсов.",
          "Люблю разбираться, как устроены вещи изнутри, и доводить небольшие учебные проекты до рабочего состояния.",
        ],
        facts: [
          { label: "Направление", value: "Информационные системы" },
          { label: "Группа", value: "ИС 26-21 ТИПО" },
          { label: "Интересы", value: "Frontend, алгоритмы, дизайн интерфейсов" },
        ],
      },
  
      skills: {
        title: "Навыки",
        items: [
          { name: "HTML", level: 85 },
          { name: "CSS", level: 75 },
          { name: "JavaScript", level: 65 },
          { name: "Git", level: 50 },
          { name: "Алгоритмы", level: 60 },
        ],
      },
  
      contacts: {
        title: "Контакты",
        items: [
          { label: "E-mail", value: "student@example.com", href: "mailto:student@example.com" },
          { label: "Telegram", value: "@username", href: "https://t.me/username" },
          { label: "GitHub", value: "github.com/username", href: "https://github.com/username" },
        ],
      },
    };
  
    // ===== DOM =====
    const tabsEl = document.getElementById("tabs");
    const panelEl = document.getElementById("tabPanel");
    const avatarEl = document.getElementById("profileAvatar");
    const nameEl = document.getElementById("profileName");
    const metaEl = document.getElementById("profileMeta");
  
    if (!tabsEl || !panelEl) return;
  
    // ===== Шапка профиля =====
    const initials = student.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  
    avatarEl.textContent = initials;
    nameEl.textContent = student.name;
    metaEl.textContent = student.status;
  
    // ===== Рендереры вкладок (каждый возвращает DOM-элемент) =====
    function renderAbout(data) {
      const wrap = document.createElement("div");
  
      data.paragraphs.forEach((text) => {
        const p = document.createElement("p");
        p.className = "about__text";
        p.textContent = text;
        wrap.appendChild(p);
      });
  
      const dl = document.createElement("dl");
      dl.className = "facts";
      data.facts.forEach((fact) => {
        const row = document.createElement("div");
        row.className = "facts__row";
  
        const dt = document.createElement("dt");
        dt.textContent = fact.label;
  
        const dd = document.createElement("dd");
        dd.textContent = fact.value;
  
        row.append(dt, dd);
        dl.appendChild(row);
      });
      wrap.appendChild(dl);
  
      return wrap;
    }
  
    function renderSkills(data) {
      const list = document.createElement("ul");
      list.className = "skills";
  
      data.items.forEach((skill) => {
        const li = document.createElement("li");
        li.className = "skill";
  
        const head = document.createElement("div");
        head.className = "skill__head";
  
        const name = document.createElement("span");
        name.textContent = skill.name;
  
        const percent = document.createElement("span");
        percent.className = "skill__percent";
        percent.textContent = skill.level + "%";
  
        head.append(name, percent);
  
        const bar = document.createElement("div");
        bar.className = "skill__bar";
  
        const fill = document.createElement("div");
        fill.className = "skill__fill";
        fill.style.width = "0%";
        bar.appendChild(fill);
  
        li.append(head, bar);
        list.appendChild(li);
  
        // небольшая задержка, чтобы сработала CSS-анимация заполнения
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            fill.style.width = skill.level + "%";
          });
        });
      });
  
      return list;
    }
  
    function renderContacts(data) {
      const list = document.createElement("ul");
      list.className = "contacts";
  
      data.items.forEach((contact) => {
        const li = document.createElement("li");
        li.className = "contacts__item";
  
        const label = document.createElement("span");
        label.className = "contacts__label";
        label.textContent = contact.label;
  
        const link = document.createElement("a");
        link.href = contact.href;
        link.textContent = contact.value;
        if (contact.href.startsWith("http")) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
  
        li.append(label, link);
        list.appendChild(li);
      });
  
      return list;
    }
  
    // ===== Конфигурация вкладок =====
    const tabs = [
      { id: "about", render: renderAbout },
      { id: "skills", render: renderSkills },
      { id: "contacts", render: renderContacts },
    ];
  
    // ===== Построение кнопок вкладок из данных =====
    tabs.forEach((tab) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab";
      btn.id = "tab-" + tab.id;
      btn.dataset.tab = tab.id;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-controls", "tabPanel");
      btn.textContent = student[tab.id].title;
      tabsEl.appendChild(btn);
    });
  
    // ===== Переключение вкладки =====
    function showTab(id, updateHash = true) {
      const tab = tabs.find((t) => t.id === id) || tabs[0];
  
      tabsEl.querySelectorAll(".tab").forEach((btn) => {
        const isActive = btn.dataset.tab === tab.id;
        btn.classList.toggle("tab--active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
        btn.tabIndex = isActive ? 0 : -1;
      });
  
      panelEl.setAttribute("aria-labelledby", "tab-" + tab.id);
      panelEl.innerHTML = "";
      panelEl.appendChild(tab.render(student[tab.id]));
  
      // перезапуск анимации появления панели
      panelEl.classList.remove("tab-panel--enter");
      void panelEl.offsetWidth;
      panelEl.classList.add("tab-panel--enter");
  
      if (updateHash) history.replaceState(null, "", "#" + tab.id);
    }
  
    // Клик по вкладке (делегирование)
    tabsEl.addEventListener("click", (event) => {
      const btn = event.target.closest(".tab");
      if (btn) showTab(btn.dataset.tab);
    });
  
    // Навигация стрелками ← → по вкладкам
    tabsEl.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const current = tabs.findIndex((t) => document.getElementById("tab-" + t.id).classList.contains("tab--active"));
      const step = event.key === "ArrowRight" ? 1 : -1;
      const next = (current + step + tabs.length) % tabs.length;
      showTab(tabs[next].id);
      document.getElementById("tab-" + tabs[next].id).focus();
    });
  
    // Поддержка ручного изменения хэша / кнопок «назад-вперёд»
    window.addEventListener("hashchange", () => {
      showTab(location.hash.slice(1), false);
    });
  
    // Начальная вкладка: из хэша или первая
    showTab(location.hash.slice(1) || tabs[0].id, false);
  });