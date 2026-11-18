// Middleware защиты маршрутов
import { COOKIE_NAME, cookieOptions } from './config.js';
import { getSession, destroySession } from './sessions.js';
import { findUserById, ROLES } from './db.js';
import { logEvent } from './audit.js';

// 1) Есть ли живая сессия? Нет — 401
export function requireAuth(req, res, next) {
  const session = getSession(req.cookies[COOKIE_NAME]);

  if (!session) {
    return res.status(401).json({ code: 'no_session', error: 'Требуется вход в систему' });
  }

  if (Date.now() > session.expiresAt) {
    destroySession(session.id);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    logEvent(req, 'session_expired', findUserById(session.userId)?.login);
    return res.status(401).json({ code: 'session_expired', error: 'Сессия истекла. Войдите снова.' });
  }

  req.session = session;
  req.user = findUserById(session.userId);
  next();
}

// 2) Подходит ли роль? Нет — 403. Роль берётся из сессии на сервере, а не из запроса клиента
export function requireRole(...roles) {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) return next();

    logEvent(req, 'access_denied', req.user.login, `${req.method} ${req.originalUrl}`);
    res.status(403).json({
      code: 'forbidden',
      error: `Доступ запрещён: раздел только для роли «${roles.map((role) => ROLES[role]).join(', ')}»`,
      yourRole: req.user.role,
    });
  };
}
