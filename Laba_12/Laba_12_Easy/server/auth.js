// Middleware защиты маршрутов: пускает дальше только с живой сессией
import { COOKIE_NAME, cookieOptions } from './config.js';
import { getSession, destroySession } from './sessions.js';
import { findUserById } from './db.js';

export function requireAuth(req, res, next) {
  const session = getSession(req.cookies[COOKIE_NAME]);

  if (!session) {
    return res.status(401).json({ code: 'no_session', error: 'Требуется вход в систему' });
  }

  if (Date.now() > session.expiresAt) {
    destroySession(session.id);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    return res.status(401).json({ code: 'session_expired', error: 'Сессия истекла. Войдите снова.' });
  }

  req.session = session;
  req.user = findUserById(session.userId);
  next();
}
