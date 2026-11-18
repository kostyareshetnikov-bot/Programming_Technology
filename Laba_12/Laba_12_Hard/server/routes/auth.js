// Маршруты /api/auth: вход, обновление токенов, выход
import { Router } from 'express';
import { REFRESH_COOKIE, refreshCookieOptions, ACCESS_TTL_SEC } from '../config.js';
import { findUserByLogin, findUserById, publicUser } from '../db.js';
import { verifyPassword, DUMMY_HASH } from '../password.js';
import { signAccessToken } from '../tokens.js';
import {
  createSession,
  rotateRefreshToken,
  findSessionByRefreshToken,
  revokeSession,
  revokeAllUserSessions,
} from '../sessions.js';
import { requireAccess } from '../auth.js';

export const authRouter = Router();

const REFRESH_ERRORS = {
  refresh_missing: 'Нет refresh token. Войдите в систему.',
  refresh_invalid: 'Refresh token недействителен. Войдите снова.',
  refresh_expired: 'Срок сессии истёк. Войдите снова.',
  refresh_reused: 'Refresh token использован повторно — возможна кража. Сессия отозвана.',
  session_revoked: 'Сессия завершена. Войдите снова.',
};

// Ответ с новой парой: access token — в теле (клиент держит его в памяти),
// refresh token — только в cookie HttpOnly
function sendTokens(res, user, session, refreshToken) {
  res.cookie(REFRESH_COOKIE, refreshToken, { ...refreshCookieOptions, maxAge: session.expiresAt - Date.now() });
  res.json({
    accessToken: signAccessToken(user, session.id),
    expiresIn: ACCESS_TTL_SEC,
    user: publicUser(user),
  });
}

// POST /api/auth/login
authRouter.post('/login', (req, res) => {
  const login = String(req.body?.login ?? '').trim();
  const password = String(req.body?.password ?? '');

  const fields = {};
  if (!login) fields.login = 'Введите логин';
  if (!password) fields.password = 'Введите пароль';
  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ code: 'validation', error: 'Заполните обязательные поля', fields });
  }

  const user = findUserByLogin(login);
  const passwordOk = verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordOk) {
    return res.status(401).json({ code: 'bad_credentials', error: 'Неверный логин или пароль' });
  }

  const { session, refreshToken } = createSession(user.id, req.get('User-Agent'));
  sendTokens(res, user, session, refreshToken);
});

// POST /api/auth/refresh — обмен refresh token на новую пару (ротация)
authRouter.post('/refresh', (req, res) => {
  const token = req.cookies[REFRESH_COOKIE];
  const result = token ? rotateRefreshToken(token) : { error: 'refresh_missing' };

  if (result.error) {
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
    return res.status(401).json({ code: result.error, error: REFRESH_ERRORS[result.error] });
  }

  sendTokens(res, findUserById(result.session.userId), result.session, result.refreshToken);
});

// POST /api/auth/logout — завершить текущую сессию (работает даже с истёкшим access token)
authRouter.post('/logout', (req, res) => {
  const session = findSessionByRefreshToken(req.cookies[REFRESH_COOKIE]);
  if (session) revokeSession(session.id);
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
  res.json({ message: 'Вы вышли из системы' });
});

// POST /api/auth/logout-all — завершить все сессии пользователя на всех устройствах
authRouter.post('/logout-all', requireAccess, (req, res) => {
  revokeAllUserSessions(req.user.id);
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
  res.json({ message: 'Все сессии завершены' });
});
