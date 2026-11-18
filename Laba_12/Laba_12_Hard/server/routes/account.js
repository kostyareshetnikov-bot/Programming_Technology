// Защищённые данные аккаунта: профиль и список сессий (устройств)
import { Router } from 'express';
import { requireAccess } from '../auth.js';
import { publicUser } from '../db.js';
import { getSession, listUserSessions, revokeSession, isActive } from '../sessions.js';

export const accountRouter = Router();
accountRouter.use(requireAccess);

const sessionView = (session, currentId) => ({
  id: session.id,
  userAgent: session.userAgent,
  createdAt: session.createdAt,
  lastUsedAt: session.lastUsedAt,
  expiresAt: session.expiresAt,
  rotations: session.rotations,
  current: session.id === currentId,
});

// Найти сессию и проверить, что она принадлежит текущему пользователю
function findOwnSession(req, res) {
  const session = getSession(req.params.id);
  if (!isActive(session)) {
    res.status(404).json({ code: 'not_found', error: 'Сессия не найдена или уже завершена' });
    return null;
  }
  if (session.userId !== req.user.id) {
    res.status(403).json({ code: 'forbidden', error: 'Это сессия другого пользователя — доступ запрещён' });
    return null;
  }
  return session;
}

// GET /api/me
accountRouter.get('/me', (req, res) => {
  res.json({ user: publicUser(req.user), tokenExpiresAt: req.token.exp * 1000 });
});

// GET /api/sessions — мои активные сессии
accountRouter.get('/sessions', (req, res) => {
  const list = listUserSessions(req.user.id)
    .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
    .map((session) => sessionView(session, req.token.sid));
  res.json({ sessions: list });
});

// GET /api/sessions/:id — одна сессия (только своя)
accountRouter.get('/sessions/:id', (req, res) => {
  const session = findOwnSession(req, res);
  if (session) res.json({ session: sessionView(session, req.token.sid) });
});

// DELETE /api/sessions/:id — завершить свою сессию на другом устройстве
accountRouter.delete('/sessions/:id', (req, res) => {
  const session = findOwnSession(req, res);
  if (!session) return;
  revokeSession(session.id);
  res.json({ message: 'Сессия завершена' });
});
