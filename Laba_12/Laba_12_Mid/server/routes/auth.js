// Маршруты входа и выхода
import { Router } from 'express';
import { COOKIE_NAME, cookieOptions } from '../config.js';
import { findUserByLogin, findUserById, publicUser } from '../db.js';
import { verifyPassword, DUMMY_HASH } from '../password.js';
import { createSession, getSession, destroySession } from '../sessions.js';
import { requireAuth } from '../auth.js';
import { logEvent } from '../audit.js';

export const authRouter = Router();

const sessionInfo = ({ createdAt, expiresAt }) => ({ createdAt, expiresAt });

// POST /api/login — проверка логина и пароля, создание сессии
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
    logEvent(req, 'login_failed', login, user ? 'неверный пароль' : 'неизвестный логин');
    return res.status(401).json({ code: 'bad_credentials', error: 'Неверный логин или пароль' });
  }

  destroySession(req.cookies[COOKIE_NAME]);
  const session = createSession(user.id);
  res.cookie(COOKIE_NAME, session.id, cookieOptions);
  logEvent(req, 'login_success', user.login, user.role);
  res.json({ user: publicUser(user), session: sessionInfo(session) });
});

// POST /api/logout — уничтожение сессии на сервере и удаление cookie
authRouter.post('/logout', (req, res) => {
  const session = getSession(req.cookies[COOKIE_NAME]);
  if (session) logEvent(req, 'logout', findUserById(session.userId)?.login);
  destroySession(req.cookies[COOKIE_NAME]);
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.json({ message: 'Вы вышли из системы' });
});

// GET /api/me — текущий пользователь и его роль (роль хранится на сервере)
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user), session: sessionInfo(req.session) });
});
