// Маршруты входа и выхода
import { Router } from 'express';
import { COOKIE_NAME, cookieOptions } from '../config.js';
import { findUserByLogin, publicUser } from '../db.js';
import { verifyPassword, DUMMY_HASH } from '../password.js';
import { createSession, destroySession } from '../sessions.js';
import { requireAuth } from '../auth.js';

export const authRouter = Router();

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
    // одинаковый ответ для неверного логина и пароля — нельзя узнать, какие логины существуют
    return res.status(401).json({ code: 'bad_credentials', error: 'Неверный логин или пароль' });
  }

  destroySession(req.cookies[COOKIE_NAME]); // старую сессию (если была) удаляем
  const session = createSession(user.id);
  res.cookie(COOKIE_NAME, session.id, cookieOptions);
  res.json({ user: publicUser(user), expiresAt: session.expiresAt });
});

// POST /api/logout — уничтожение сессии на сервере и удаление cookie
authRouter.post('/logout', (req, res) => {
  destroySession(req.cookies[COOKIE_NAME]);
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.json({ message: 'Вы вышли из системы' });
});

// GET /api/me — кто сейчас вошёл (используется при обновлении страницы)
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user), expiresAt: req.session.expiresAt });
});
