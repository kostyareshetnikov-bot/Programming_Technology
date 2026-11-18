// Главный модуль: вход, выход, обновление токена, сессии
import { api, login, logout, refresh, setHandlers } from './api.js';
import { $, el, renderIcons, toast, confirmDialog, setBusy, showFieldErrors, initials } from './ui.js';
import { renderToken, startTimer, stopTimer, addLog, clearLog, renderSessions } from './dashboard.js';

const authView = $('#authView');
const appView = $('#appView');
const loginForm = $('#loginForm');

// api.js сообщает о каждом запросе, новом токене и о конце сессии
setHandlers({
  onRequest: addLog,
  onToken: renderToken,
  onSessionEnd: (error) => {
    showLogin(error.message, 'info');
    toast(error.message, 'warn');
  },
});

// Ошибки 401 уже обработаны в api.js (переход ко входу), остальные показываем
function report(error) {
  if (error.status !== 401) toast(error.message, 'error');
}

// ---------- Экраны ----------

function showLogin(message = '', type = 'error') {
  stopTimer();
  appView.hidden = true;
  authView.hidden = false;
  loginForm.reset();
  showFieldErrors(loginForm);
  showLoginMessage(message, type);
  loginForm.elements.login.focus();
}

function showLoginMessage(message, type = 'error') {
  const box = $('#loginError');
  box.hidden = !message;
  box.className = `alert ${type === 'info' ? 'alert-info' : 'alert-error'}`;
  box.textContent = message;
}

function showApp(user) {
  authView.hidden = true;
  appView.hidden = false;
  $('#userAvatar').textContent = initials(user.name);
  $('#userName').textContent = user.name;
  $('#userLogin').textContent = `@${user.login}`;
  $('#greeting').textContent = `Здравствуйте, ${user.name.split(' ')[0]}`;
  $('#checkForm').reset();
  $('#checkResult').replaceChildren();
  startTimer();
  loadSessions();
}

// ---------- Вход ----------

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const loginValue = loginForm.elements.login.value.trim();
  const password = loginForm.elements.password.value;

  const errors = {};
  if (!loginValue) errors.login = 'Введите логин';
  if (!password) errors.password = 'Введите пароль';
  showFieldErrors(loginForm, errors);
  showLoginMessage('');
  if (Object.keys(errors).length > 0) return;

  const button = loginForm.querySelector('[type="submit"]');
  setBusy(button, true);
  try {
    clearLog();
    const { user } = await login(loginValue, password);
    toast(`Добро пожаловать, ${user.name}!`, 'ok');
    showApp(user);
  } catch (error) {
    showFieldErrors(loginForm, error.fields);
    showLoginMessage(error.message);
    loginForm.elements.password.value = '';
  } finally {
    setBusy(button, false);
  }
});

document.querySelectorAll('[data-login]').forEach((chip) => {
  chip.addEventListener('click', () => {
    loginForm.elements.login.value = chip.dataset.login;
    loginForm.elements.password.focus();
  });
});

// ---------- Выход ----------

$('#logoutBtn').addEventListener('click', async () => {
  const confirmed = await confirmDialog({
    title: 'Выйти?',
    text: 'Сессия будет отозвана на сервере: refresh token и текущий access token перестанут работать.',
    okText: 'Выйти',
  });
  if (!confirmed) return;
  await logout().catch(report);
  showLogin();
  toast('Вы вышли из системы', 'ok');
});

$('#logoutAllBtn').addEventListener('click', async () => {
  const confirmed = await confirmDialog({
    title: 'Выйти на всех устройствах?',
    text: 'Будут завершены все сессии этого пользователя, включая открытые в других браузерах.',
    okText: 'Завершить все',
  });
  if (!confirmed) return;
  try {
    await logout({ everywhere: true });
    showLogin();
    toast('Все сессии завершены', 'ok');
  } catch (error) {
    report(error);
  }
});

// ---------- Токен ----------

$('#callMeBtn').addEventListener('click', async () => {
  try {
    const { user } = await api('/me');
    toast(`200 OK: сервер узнал вас — ${user.name}`, 'ok');
  } catch (error) {
    report(error);
  }
});

$('#refreshBtn').addEventListener('click', async () => {
  try {
    await refresh();
    toast('Получена новая пара токенов (refresh token заменён)', 'ok');
    loadSessions();
  } catch (error) {
    showLogin(error.message, 'info');
  }
});

$('#clearLogBtn').addEventListener('click', clearLog);

// ---------- Сессии ----------

async function loadSessions() {
  try {
    const { sessions } = await api('/sessions');
    renderSessions(sessions, { onEnd: endSession, onCopy: copyId });
  } catch (error) {
    report(error);
  }
}

async function endSession(session) {
  if (session.current) return $('#logoutBtn').click();
  try {
    await api(`/sessions/${session.id}`, { method: 'DELETE' });
    toast('Сессия на другом устройстве завершена', 'ok');
    loadSessions();
  } catch (error) {
    report(error);
  }
}

async function copyId(id) {
  try {
    await navigator.clipboard.writeText(id);
    toast('ID сессии скопирован', 'ok');
  } catch {
    toast(id, 'info');
  }
}

$('#reloadSessionsBtn').addEventListener('click', loadSessions);

// ---------- Проверка доступа к сессии по ID ----------

$('#checkForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = event.target.elements.id.value.trim();
  const result = $('#checkResult');
  if (!id) return result.replaceChildren(el('div', { class: 'check-result' }, 'Вставьте ID сессии'));

  try {
    const { session } = await api(`/sessions/${encodeURIComponent(id)}`);
    result.replaceChildren(
      el(
        'div',
        { class: 'check-result' },
        el('span', { class: 'tag tag-ok' }, '200 · ваша сессия'),
        el('p', {}, session.current ? 'Это текущая вкладка' : 'Сессия на другом устройстве'),
      ),
    );
  } catch (error) {
    if (error.status === 401) return;
    result.replaceChildren(
      el('div', { class: 'check-result' }, el('span', { class: 'tag tag-err' }, `${error.status} · отказ`), el('p', {}, error.message)),
    );
  }
});

// ---------- Старт: после F5 access token пропал из памяти — пробуем получить новый по cookie ----------

renderIcons();
clearLog();
try {
  const { user } = await refresh();
  showApp(user);
} catch (error) {
  const silent = error.code === 'refresh_missing';
  showLogin(silent ? '' : error.message, 'info');
}
