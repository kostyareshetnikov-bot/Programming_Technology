// Общие функции интерфейса (одинаковые во всех трёх проектах ЛР №12)

export const $ = (selector, root = document) => root.querySelector(selector);

// Создание элемента без innerHTML: данные с сервера вставляются как текст,
// поэтому HTML-код в заметке или имени не выполнится (защита от XSS)
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class') node.className = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value === true) node.setAttribute(key, '');
    else if (value !== false && value != null) node.setAttribute(key, value);
  }
  node.append(...children.flat().filter((child) => child != null && child !== false));
  return node;
}

// Всплывающее уведомление: type = ok | error | warn | info
export function toast(message, type = 'info') {
  let box = $('.toasts');
  if (!box) {
    box = el('div', { class: 'toasts' });
    document.body.append(box);
  }
  const item = el('div', { class: `toast toast-${type}`, role: 'status' }, message);
  box.append(item);
  setTimeout(() => item.classList.add('toast-hide'), 3200);
  setTimeout(() => item.remove(), 3600);
}

// Диалог подтверждения на основе <dialog>, возвращает Promise<boolean>
export function confirmDialog({ title, text, okText = 'Да' }) {
  const dialog = $('#confirmDialog');
  $('.dialog-title', dialog).textContent = title;
  $('.dialog-text', dialog).textContent = text;
  $('[value="ok"]', dialog).textContent = okText;
  dialog.showModal();
  return new Promise((resolve) => {
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'ok'), { once: true });
  });
}

export function setBusy(button, busy) {
  button.disabled = busy;
  button.classList.toggle('is-busy', busy);
}

// Подсветка ошибок у полей формы: errors = { login: 'текст', password: 'текст' }
export function showFieldErrors(form, errors = {}) {
  form.querySelectorAll('.input').forEach((input) => {
    const message = errors[input.name] || '';
    input.classList.toggle('is-invalid', Boolean(message));
    const hint = form.querySelector(`[data-error-for="${input.name}"]`);
    if (hint) hint.textContent = message;
  });
}

export function initials(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatSeconds(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const minutes = String(Math.floor(s / 60)).padStart(2, '0');
  const seconds = String(s % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export const icons = {
  lock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  device: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
};

// Иконка из статичного SVG выше (не из пользовательских данных)
export function icon(name) {
  const span = el('span', { class: 'icon' });
  span.innerHTML = icons[name];
  return span;
}

// Вставить иконки во все элементы с атрибутом data-icon="..."
export function renderIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((node) => {
    node.innerHTML = icons[node.dataset.icon];
  });
}
