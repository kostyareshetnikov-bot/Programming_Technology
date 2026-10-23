// Лабораторная работа №8. Вариант 3: настройки темы и размера текста.
// Данные хранятся в localStorage в виде JSON-объекта: { "theme": "dark", "fontSize": 20 }

const KEY = "lab8_settings";                         // ключ в хранилище
const DEFAULTS = { theme: "light", fontSize: 18 };   // значения по умолчанию

const themeSelect = document.querySelector("#theme");
const sizeInput = document.querySelector("#size");
const sizeValue = document.querySelector("#sizeValue");
const jsonView = document.querySelector("#json");
const message = document.querySelector("#message");

// Чтение настроек: если данных нет или JSON повреждён — возвращаем значения по умолчанию
function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);           // для отсутствующего ключа вернётся null
    if (!raw) return { ...DEFAULTS };
    const data = JSON.parse(raw);                    // строка -> объект
    const size = Number(data.fontSize);
    return {
      theme: data.theme === "dark" ? "dark" : "light",
      fontSize: size >= 12 && size <= 32 ? size : DEFAULTS.fontSize
    };
  } catch (error) {
    message.textContent = "Сохранённые данные повреждены — применены настройки по умолчанию.";
    return { ...DEFAULTS };
  }
}

// Сохранение настроек: объект -> JSON-строка
function saveSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch (error) {
    message.textContent = "Не удалось сохранить: хранилище недоступно (запустите через Live Server).";
  }
}

// Применение настроек к интерфейсу
function apply(settings) {
  document.documentElement.dataset.theme = settings.theme;
  document.documentElement.style.fontSize = settings.fontSize + "px";
  themeSelect.value = settings.theme;
  sizeInput.value = settings.fontSize;
  sizeValue.textContent = settings.fontSize;
  jsonView.textContent = localStorage.getItem(KEY) ?? "(в хранилище пока ничего нет)";
}

// Текущее состояние формы
function readForm() {
  return { theme: themeSelect.value, fontSize: Number(sizeInput.value) };
}

function onChange() {
  const settings = readForm();
  saveSettings(settings);
  apply(settings);
  message.textContent = "Настройки сохранены.";
}

themeSelect.addEventListener("change", onChange);
sizeInput.addEventListener("input", onChange);

document.querySelector("#reset").addEventListener("click", () => {
  localStorage.removeItem(KEY);                      // удаляем запись по ключу
  apply({ ...DEFAULTS });
  message.textContent = "Настройки сброшены, запись удалена из хранилища.";
});

// Восстановление при запуске страницы
apply(loadSettings());
