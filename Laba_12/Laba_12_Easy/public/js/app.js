// Логика страницы: вход, выход, приватные заметки
import { api } from './api.js';
import { $, el, icon, renderIcons, toast, confirmDialog, setBusy, showFieldErrors, initials, formatDate } from './ui.js';

const authView = $('#authView');
const appView = $('#appView');
const loginForm = $('#loginForm');
const noteForm = $('#noteForm');
const checkForm = $('#checkForm');

// ---------- Экраны ----------

function showLogin(message = '', type = 'error') {
  appView.hidden = true;
  authView.hidden = false;
  loginForm.reset();
  showFieldErrors(loginForm);
  showLoginMessage(message, type);
  loginForm.elements.login.focus();
}

function showApp(user, expiresAt) {
  authView.hidden = true;
  appView.hidden = false;
  $('#userAvatar').textContent = initials(user.name);
  $('#userName').textContent = user.name;
  $('#userLogin').textContent = `@${user.login}`;
  const until = new Date(expiresAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  $('#sessionInfo').textContent = `Сессия активна до ${until}`;
  checkForm.reset();
  $('#checkResult').replaceChildren();
  loadNotes();
}

function showLoginMessage(message, type = 'error') {
  const box = $('#loginError');
  box.hidden = !message;
  box.className = `alert ${type === 'info' ? 'alert-info' : 'alert-error'}`;
  box.textContent = message;
}

// Ошибка запроса: 401 — сессии нет или она истекла, возвращаемся ко входу
function handleError(error) {
  if (error.status === 401) {
    showLogin(error.message, 'info');
    toast(error.message, 'warn');
  } else {
    toast(error.message, 'error');
  }
}

// ---------- Вход ----------

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const login = loginForm.elements.login.value.trim();
  const password = loginForm.elements.password.value;

  // Проверка на клиенте — только для удобства, сервер всё равно проверит сам
  const errors = {};
  if (!login) errors.login = 'Введите логин';
  if (!password) errors.password = 'Введите пароль';
  showFieldErrors(loginForm, errors);
  showLoginMessage('');
  if (Object.keys(errors).length > 0) return;

  const button = loginForm.querySelector('[type="submit"]');
  setBusy(button, true);
  try {
    const { user, expiresAt } = await api('/login', { method: 'POST', body: { login, password } });
    toast(`Добро пожаловать, ${user.name}!`, 'ok');
    showApp(user, expiresAt);
  } catch (error) {
    showFieldErrors(loginForm, error.fields);
    showLoginMessage(error.message);
    loginForm.elements.password.value = '';
  } finally {
    setBusy(button, false);
  }
});

// Кнопки тестовых логинов подставляют только логин, пароль вводится вручную
document.querySelectorAll('[data-login]').forEach((chip) => {
  chip.addEventListener('click', () => {
    loginForm.elements.login.value = chip.dataset.login;
    loginForm.elements.password.focus();
  });
});

// ---------- Выход (с подтверждением) ----------

$('#logoutBtn').addEventListener('click', async () => {
  const confirmed = await confirmDialog({
    title: 'Выйти из аккаунта?',
    text: 'Сессия будет удалена на сервере. Чтобы снова открыть заметки, придётся войти.',
    okText: 'Выйти',
  });
  if (!confirmed) return;

  try {
    await api('/logout', { method: 'POST' });
    toast('Вы вышли из системы', 'ok');
  } catch (error) {
    toast(error.message, 'error');
  }
  showLogin();
});

// ---------- Заметки ----------

async function loadNotes() {
  try {
    const { notes } = await api('/notes');
    renderNotes(notes);
  } catch (error) {
    handleError(error);
  }
}

function renderNotes(notes) {
  $('#notesCount').textContent = `Всего заметок: ${notes.length}`;
  const list = $('#notesList');
  if (notes.length === 0) {
    list.replaceChildren(el('div', { class: 'empty' }, 'Заметок пока нет — добавьте первую'));
    return;
  }
  list.replaceChildren(...notes.map(noteCard));
}

function noteCard(note) {
  return el(
    'article',
    { class: 'note' },
    el('p', { class: 'note-text' }, note.text),
    el(
      'div',
      { class: 'note-meta' },
      el('span', {}, el('span', { class: 'note-id' }, `#${note.id}`), ` · ${formatDate(note.createdAt)}`),
      el('button', { class: 'icon-btn', type: 'button', title: 'Удалить', onclick: () => deleteNote(note.id) }, icon('trash')),
    ),
  );
}

noteForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = noteForm.elements.text.value.trim();
  const errorBox = $('#noteError');
  errorBox.textContent = text ? '' : 'Напишите текст заметки';
  noteForm.elements.text.classList.toggle('is-invalid', !text);
  if (!text) return;

  try {
    await api('/notes', { method: 'POST', body: { text } });
    noteForm.reset();
    toast('Заметка добавлена', 'ok');
    loadNotes();
  } catch (error) {
    handleError(error);
  }
});

async function deleteNote(id) {
  try {
    await api(`/notes/${id}`, { method: 'DELETE' });
    toast(`Заметка #${id} удалена`, 'ok');
    loadNotes();
  } catch (error) {
    handleError(error);
  }
}

// ---------- Проверка доступа к заметке по номеру ----------

checkForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = Number(checkForm.elements.id.value);
  const result = $('#checkResult');
  if (!id) {
    result.replaceChildren(el('div', { class: 'check-result' }, 'Введите номер заметки'));
    return;
  }

  try {
    const { note } = await api(`/notes/${id}`);
    result.replaceChildren(
      el('div', { class: 'check-result' }, el('span', { class: 'tag tag-ok' }, '200 · ваша заметка'), el('p', {}, note.text)),
    );
  } catch (error) {
    if (error.status === 401) return handleError(error);
    result.replaceChildren(
      el('div', { class: 'check-result' }, el('span', { class: 'tag tag-err' }, `${error.status} · отказ`), el('p', {}, error.message)),
    );
  }
});

// ---------- Старт: если сессия жива (например, после F5) — сразу в заметки ----------

renderIcons();
try {
  const { user, expiresAt } = await api('/me');
  showApp(user, expiresAt);
} catch (error) {
  const showReason = error.code === 'session_expired' || error.status === 0;
  showLogin(showReason ? error.message : '', 'info');
}
