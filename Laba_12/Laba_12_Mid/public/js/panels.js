// Содержимое вкладок. Каждая функция загружает данные с сервера и возвращает DOM-элемент.
// Ошибки (401/403) не ловятся здесь — их обрабатывает app.js в одном месте.
import { api } from './api.js';
import { el, icon, toast, formatDate } from './ui.js';

function scoreTag(value) {
  const type = value >= 90 ? 'ok' : value >= 70 ? 'info' : value >= 50 ? 'warn' : 'err';
  return el('span', { class: `tag tag-${type} score` }, String(value));
}

function panelHead(title, subtitle, ...actions) {
  return el(
    'div',
    { class: 'panel-head' },
    el('div', {}, el('h2', { class: 'card-title' }, title), el('p', { class: 'card-hint' }, subtitle)),
    ...actions,
  );
}

function table(headers, rows) {
  if (rows.length === 0) return el('div', { class: 'empty' }, 'Записей пока нет');
  return el(
    'div',
    { class: 'table-wrap' },
    el(
      'table',
      { class: 'table' },
      el('thead', {}, el('tr', {}, headers.map((header) => el('th', {}, header)))),
      el('tbody', {}, rows.map((cells) => el('tr', {}, cells.map((cell) => el('td', {}, cell))))),
    ),
  );
}

// ---------- Студент: мои оценки ----------
export async function gradesPanel(user) {
  const { grades } = await api(`/students/${user.id}/grades`);
  const values = grades.map((grade) => grade.value);
  const average = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  const stat = (value, label) =>
    el('div', { class: 'stat' }, el('div', { class: 'stat-value' }, value), el('div', { class: 'stat-label' }, label));

  return el(
    'div',
    {},
    panelHead('Мои оценки', 'Сервер отдаёт только оценки владельца сессии'),
    el(
      'div',
      { class: 'stats' },
      stat(String(average), 'средний балл'),
      stat(String(grades.length), 'оценок'),
      stat(String(values.length ? Math.max(...values) : '—'), 'лучший балл'),
    ),
    table(
      ['Предмет', 'Балл', 'Дата'],
      grades.map((grade) => [grade.subject, scoreTag(grade.value), el('span', { class: 'muted' }, formatDate(grade.date))]),
    ),
  );
}

// ---------- Преподаватель: журнал группы ----------
export async function journalPanel(user, { reload, onError }) {
  const { students, subjects, grades } = await api('/journal');

  const form = el(
    'form',
    { class: 'grade-form', novalidate: true },
    el('select', { class: 'input', name: 'studentId' }, students.map((s) => el('option', { value: s.id }, s.name))),
    el('select', { class: 'input', name: 'subject' }, subjects.map((name) => el('option', { value: name }, name))),
    el('input', { class: 'input', name: 'value', type: 'number', min: 0, max: 100, placeholder: 'Балл' }),
    el('button', { class: 'btn btn-primary', type: 'submit' }, 'Поставить'),
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = {
      studentId: Number(form.elements.studentId.value),
      subject: form.elements.subject.value,
      value: Number(form.elements.value.value),
    };
    if (form.elements.value.value === '') return toast('Введите балл от 0 до 100', 'warn');

    try {
      await api('/journal', { method: 'POST', body });
      toast('Оценка выставлена', 'ok');
      reload();
    } catch (error) {
      onError(error);
    }
  });

  return el(
    'div',
    {},
    panelHead('Журнал группы ИС 26-21', `Студентов: ${students.length} · оценок: ${grades.length}`),
    form,
    table(
      ['Студент', 'Предмет', 'Балл', 'Дата'],
      grades.map((g) => [g.studentName, g.subject, scoreTag(g.value), el('span', { class: 'muted' }, formatDate(g.date))]),
    ),
  );
}

// ---------- Преподаватель: аудит входов (творческое задание) ----------
const EVENT_LABELS = {
  login_success: ['Вход', 'ok'],
  login_failed: ['Ошибка входа', 'err'],
  logout: ['Выход', 'info'],
  access_denied: ['Отказ 403', 'warn'],
  session_expired: ['Сессия истекла', ''],
};

export async function auditPanel(user, { reload }) {
  const { events } = await api('/audit');
  const refresh = el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: reload }, 'Обновить');

  return el(
    'div',
    {},
    panelHead('Аудит входов', 'Последние 50 событий безопасности', refresh),
    table(
      ['Время', 'Событие', 'Логин', 'IP', 'Детали'],
      events.map((event) => {
        const [label, type] = EVENT_LABELS[event.type];
        return [
          el('span', { class: 'muted mono' }, formatDate(event.time)),
          el('span', { class: `tag ${type ? `tag-${type}` : ''}` }, label),
          el('code', {}, event.login),
          el('span', { class: 'muted mono' }, event.ip),
          el('span', { class: 'muted' }, event.details),
        ];
      }),
    ),
  );
}

// ---------- Экран «Доступ запрещён» ----------
export function forbiddenView(error, user) {
  return el(
    'div',
    { class: 'forbidden' },
    el('div', { class: 'forbidden-icon' }, icon('lock')),
    el('div', { class: 'forbidden-code' }, `HTTP ${error.status} · Forbidden`),
    el('h2', { class: 'forbidden-title' }, 'Доступ запрещён'),
    el('p', { class: 'forbidden-text' }, error.message),
    el(
      'p',
      { class: 'forbidden-text' },
      `Сервер проверил роль из вашей сессии (${user.role}) и не отдал данные. Вкладка видна специально: скрытая кнопка не защищает API.`,
    ),
  );
}
