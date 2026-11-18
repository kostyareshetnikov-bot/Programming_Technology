// Middleware: пускает дальше только с действующим access token в заголовке Authorization
import { verifyAccessToken } from './tokens.js';
import { getSession, isActive } from './sessions.js';
import { findUserById } from './db.js';

export function requireAccess(req, res, next) {
  const [scheme, token] = (req.get('Authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ code: 'no_token', error: 'Требуется вход: нет access token' });
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 'token_expired', error: 'Срок действия access token истёк' });
    }
    return res.status(401).json({ code: 'token_invalid', error: 'Access token недействителен' });
  }

  // Токен подписан верно, но сессию могли завершить (выход) — тогда он больше не принимается
  const session = getSession(payload.sid);
  const user = findUserById(Number(payload.sub));
  if (!isActive(session) || !user) {
    return res.status(401).json({ code: 'session_revoked', error: 'Сессия завершена. Войдите снова.' });
  }

  req.user = user;
  req.token = payload;
  next();
}
