// Переключатель темы страницы

  document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");
  const icon = document.getElementById("theme-toggle-icon");
  if (!toggleBtn) return;

  const STORAGE_KEY = "site-theme";

  function applyTheme(isDark) {
    document.body.classList.toggle("dark-theme", isDark);
    icon.textContent = isDark ? "☀️" : "🌙";
    toggleBtn.setAttribute(
      "aria-label",
      isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"
    );
  }

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(STORAGE_KEY);
  } catch (e) {}
  applyTheme(savedTheme === "dark");

  toggleBtn.addEventListener("click", () => {
    const isDarkNow = document.body.classList.toggle("dark-theme");
    icon.textContent = isDarkNow ? "☀️" : "🌙";
    toggleBtn.setAttribute(
      "aria-label",
      isDarkNow ? "Переключить на светлую тему" : "Переключить на тёмную тему"
    );
    try {
      localStorage.setItem(STORAGE_KEY, isDarkNow ? "dark" : "light");
    } catch (e) {}
  });
});