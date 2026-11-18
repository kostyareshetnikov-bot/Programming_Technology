// Журнал событий безопасности (творческое задание): входы, ошибки входа, выходы, отказы в доступе
const MAX_EVENTS = 200;
const events = [];
let nextId = 1;

// type: login_success | login_failed | logout | access_denied | session_expired
export function logEvent(req, type, login, details = '') {
  events.unshift({
    id: nextId++,
    time: Date.now(),
    type,
    login: String(login || '—').slice(0, 32),
    ip: (req.ip || '').replace('::ffff:', ''),
    details,
  });
  if (events.length > MAX_EVENTS) events.pop();
}

export const getEvents = () => events;
