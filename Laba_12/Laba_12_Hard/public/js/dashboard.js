// Отрисовка панели: разбор токена с таймером, журнал запросов, список сессий
import { $, el, icon, formatDate, formatSeconds } from './ui.js';
import { decodeJwt, CLAIMS } from './jwt.js';

// ---------- Access token и таймер ----------

let tokenTimes = null; // { iat, exp } в миллисекундах
let timerId = null;

export function renderToken(token) {
  if (!token) {
    tokenTimes = null;
    return;
  }
  const { header, payload, parts } = decodeJwt(token);
  tokenTimes = { iat: payload.iat * 1000, exp: payload.exp * 1000 };

  // Сам токен показываем сокращённо: три части разными цветами
  const short = (part) => (part.length > 28 ? `${part.slice(0, 28)}…` : part);
  $('#jwtRaw').replaceChildren(
    el('span', { class: 'jwt-h' }, short(parts[0])),
    el('span', { class: 'jwt-dot' }, '.'),
    el('span', { class: 'jwt-p' }, short(parts[1])),
    el('span', { class: 'jwt-dot' }, '.'),
    el('span', { class: 'jwt-s' }, short(parts[2])),
  );
  $('#jwtHeader').textContent = JSON.stringify(header, null, 2);

  $('#jwtClaims').replaceChildren(
    ...Object.entries(payload).flatMap(([key, value]) => {
      const shown = key === 'iat' || key === 'exp' ? `${value} → ${formatDate(value * 1000)}` : String(value);
      return [
        el('dt', {}, key),
        el('dd', {}, el('span', { class: 'claim-value', title: shown }, shown), el('span', { class: 'claim-desc' }, CLAIMS[key] ?? '')),
      ];
    }),
  );
  updateTimer();
}

function updateTimer() {
  if (!tokenTimes) return;
  const left = (tokenTimes.exp - Date.now()) / 1000;
  const total = (tokenTimes.exp - tokenTimes.iat) / 1000;
  const expired = left <= 0;

  $('#tokenTimer').textContent = formatSeconds(left);
  $('#tokenHint').textContent = expired
    ? 'истёк — следующий запрос получит 401 и токен обновится сам'
    : 'до истечения access token';

  const status = $('#tokenStatus');
  status.className = `tag ${expired ? 'tag-warn' : 'tag-ok'}`;
  status.textContent = expired ? 'истёк' : 'действует';

  const bar = $('#tokenProgress');
  bar.style.width = `${Math.max(0, (left / total) * 100)}%`;
  bar.classList.toggle('is-low', left < total * 0.25);
}

export function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(updateTimer, 500);
}

export function stopTimer() {
  clearInterval(timerId);
}

// ---------- Журнал запросов ----------

const MAX_LOG = 40;

export function addLog({ method, path, status, code }) {
  const log = $('#requestLog');
  log.querySelector('.log-empty')?.remove();

  const type = status < 300 ? 'ok' : status === 401 ? 'warn' : 'err';
  const time = new Date().toLocaleTimeString('ru-RU');
  log.prepend(
    el(
      'li',
      {},
      el('span', { class: 'log-time' }, time),
      el(
        'span',
        { class: 'log-path', title: path },
        el('span', { class: 'log-method' }, method),
        ` ${path}`,
        code ? el('span', { class: 'log-code' }, code) : null,
      ),
      el('span', { class: `tag tag-${type}` }, String(status)),
    ),
  );
  while (log.children.length > MAX_LOG) log.lastChild.remove();
}

export function clearLog() {
  $('#requestLog').replaceChildren(el('li', { class: 'log-empty' }, 'Запросов пока нет'));
}

// ---------- Сессии ----------

// Короткое название устройства по User-Agent
function deviceName(userAgent) {
  const browser =
    [['Edg/', 'Edge'], ['OPR/', 'Opera'], ['Firefox/', 'Firefox'], ['Chrome/', 'Chrome'], ['Safari/', 'Safari']].find(
      ([mark]) => userAgent.includes(mark),
    )?.[1] ?? 'Другой клиент';
  const os =
    [['Windows', 'Windows'], ['Android', 'Android'], ['iPhone', 'iPhone'], ['Mac OS', 'macOS'], ['Linux', 'Linux']].find(
      ([mark]) => userAgent.includes(mark),
    )?.[1] ?? '';
  return os ? `${browser} · ${os}` : browser;
}

export function renderSessions(sessions, { onEnd, onCopy }) {
  const list = $('#sessionsList');
  if (sessions.length === 0) {
    list.replaceChildren(el('div', { class: 'empty' }, 'Активных сессий нет'));
    return;
  }

  list.replaceChildren(
    ...sessions.map((session) =>
      el(
        'div',
        { class: `session ${session.current ? 'is-current' : ''}` },
        el('div', { class: 'session-icon' }, icon('device')),
        el(
          'div',
          { class: 'session-main' },
          el(
            'div',
            { class: 'session-title' },
            deviceName(session.userAgent),
            session.current ? el('span', { class: 'tag tag-ok' }, 'эта вкладка') : null,
          ),
          el(
            'div',
            { class: 'session-meta' },
            `Вход ${formatDate(session.createdAt)} · обновлений токена: ${session.rotations} · ID `,
            el('button', { class: 'link-btn', type: 'button', title: 'Скопировать ID', onclick: () => onCopy(session.id) }, `${session.id.slice(0, 8)}…`),
          ),
        ),
        el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => onEnd(session) }, 'Завершить'),
      ),
    ),
  );
}
