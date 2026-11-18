// Главный модуль: вход, выход, вкладки по ролям, проверка доступа
import { api } from './api.js';
import { $, el, renderIcons, icon, toast, confirmDialog, setBusy, showFieldErrors, initials, formatDate } from './ui.js';
import { gradesPanel, journalPanel, auditPanel, forbiddenView } from './panels.js';

const ROLE_NAMES = { student: 'Студент', teacher: 'Преподаватель' };

// Разделы приложения. lockedVisible — показывать вкладку другим ролям (с замком),
// чтобы было видно: даже если нажать, сервер вернёт 403
const TABS = [
  { id: 'grades', title: 'Мои оценки', role: 'student', render: gradesPanel, lockedVisible: false },
  { id: 'journal', title: 'Журнал группы', role: 'teacher', render: journalPanel, lockedVisible: true },
  { id: 'audit', title: 'Аудит входов', role: 'teacher', render: auditPanel, lockedVisible: true },
];

const authView = $('#authView');
const appView = $('#appView');
const loginForm = $('#loginForm');
const panel = $('#panel');

let currentUser = null;

// ---------- Экраны ----------

function showLogin(message = '', type = 'error') {
  currentUser = null;
  appView.hidden = true;
  authView.hidden = false;
  loginForm.reset();
  showFieldErrors(loginForm);
  const box = $('#loginError');
  box.hidden = !message;
  box.className = `alert ${type === 'info' ? 'alert-info' : 'alert-error'}`;
  box.textContent = message;
  loginForm.elements.login.focus();
}

function showApp(user, session) {
  currentUser = user;
  authView.hidden = true;
  appView.hidden = false;

  $('#userAvatar').textContent = initials(user.name);
  $('#userName').textContent = user.name;
  $('#userRole').textContent = ROLE_NAMES[user.role];
  $('#greeting').textContent = `Здравствуйте, ${user.name.split(' ')[0]}`;
  $('#userInfo').textContent = user.group ? `${ROLE_NAMES[user.role]} · группа ${user.group}` : ROLE_NAMES[user.role];

  $('#sessionFacts').replaceChildren(
    el('dt', {}, 'Роль'),
    el('dd', {}, el('span', { class: `tag ${user.role === 'teacher' ? 'tag-info' : 'tag-ok'}` }, user.role)),
    el('dt', {}, 'Вход'),
    el('dd', {}, formatDate(session.createdAt)),
    el('dt', {}, 'Истекает'),
    el('dd', {}, formatDate(session.expiresAt)),
  );
  $('#checkHint').textContent =
    user.role === 'teacher'
      ? 'Преподаватель может открыть оценки любого студента (ID 1 или 2).'
      : `Ваш ID — ${user.id}. Чужие оценки сервер не отдаст: попробуйте ID ${user.id === 1 ? 2 : 1}.`;
  $('#checkForm').reset();
  $('#checkResult').replaceChildren();

  renderTabs();
  openTab(TABS.find((tab) => tab.role === user.role));
}

// ---------- Вкладки ----------

function renderTabs() {
  const visible = TABS.filter((tab) => tab.role === currentUser.role || tab.lockedVisible);
  const hasLocked = visible.some((tab) => tab.role !== currentUser.role);

  $('#tabs').replaceChildren(
    ...visible.map((tab) => {
      const locked = tab.role !== currentUser.role;
      return el(
        'button',
        { class: `tab ${locked ? 'is-locked' : ''}`, type: 'button', 'data-tab': tab.id, onclick: () => openTab(tab) },
        locked ? icon('lock') : null,
        tab.title,
      );
    }),
  );
  $('#tabsHint').textContent = hasLocked
    ? 'Разделы с замком — для другой роли. Они не скрыты специально: откройте, и сервер ответит 403.'
    : 'Все разделы доступны вашей роли.';
}

async function openTab(tab) {
  document.querySelectorAll('.tab').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.tab === tab.id);
  });
  panel.replaceChildren(el('div', { class: 'loading' }, 'Загрузка…'));

  try {
    const view = await tab.render(currentUser, { reload: () => openTab(tab), onError: handleError });
    panel.replaceChildren(view);
  } catch (error) {
    if (error.status === 403) {
      panel.replaceChildren(forbiddenView(error, currentUser));
      toast('403: недостаточно прав', 'error');
    } else {
      handleError(error);
    }
  }
}

// Общая обработка ошибок: 401 — сессии нет или она истекла
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

  const errors = {};
  if (!login) errors.login = 'Введите логин';
  if (!password) errors.password = 'Введите пароль';
  showFieldErrors(loginForm, errors);
  $('#loginError').hidden = true;
  if (Object.keys(errors).length > 0) return;

  const button = loginForm.querySelector('[type="submit"]');
  setBusy(button, true);
  try {
    const { user, session } = await api('/login', { method: 'POST', body: { login, password } });
    toast(`Вы вошли как ${ROLE_NAMES[user.role].toLowerCase()}`, 'ok');
    showApp(user, session);
  } catch (error) {
    showFieldErrors(loginForm, error.fields);
    const box = $('#loginError');
    box.className = 'alert alert-error';
    box.textContent = error.message;
    box.hidden = false;
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
    title: 'Выйти из журнала?',
    text: 'Сессия будет удалена на сервере, событие попадёт в журнал аудита.',
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

// ---------- Проверка доступа к оценкам по ID ----------

$('#checkForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = Number(event.target.elements.id.value);
  const result = $('#checkResult');
  if (!id) return result.replaceChildren(el('div', { class: 'check-result' }, 'Введите ID студента'));

  try {
    const { student, grades } = await api(`/students/${id}/grades`);
    result.replaceChildren(
      el(
        'div',
        { class: 'check-result' },
        el('span', { class: 'tag tag-ok' }, '200 · доступ разрешён'),
        el('p', {}, `${student.name}: оценок — ${grades.length}`),
      ),
    );
  } catch (error) {
    if (error.status === 401) return handleError(error);
    result.replaceChildren(
      el(
        'div',
        { class: 'check-result' },
        el('span', { class: 'tag tag-err' }, `${error.status} · отказ`),
        el('p', {}, error.message),
      ),
    );
  }
});

// ---------- Старт: восстановление сессии после F5 ----------

renderIcons();
try {
  const { user, session } = await api('/me');
  showApp(user, session);
} catch (error) {
  const showReason = error.code === 'session_expired' || error.status === 0;
  showLogin(showReason ? error.message : '', 'info');
}
