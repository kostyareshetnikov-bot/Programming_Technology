// Хранилище серверных сессий.
// Браузер получает только случайный идентификатор (sid) в cookie,
// а кто вошёл и до какого времени — знает только сервер.
import { randomBytes } from 'node:crypto';
import { SESSION_TTL_SEC } from './config.js';

const sessions = new Map(); // sid -> { id, userId, createdAt, expiresAt }

export function createSession(userId) {
  const session = {
    id: randomBytes(32).toString('base64url'), // 256 бит — угадать невозможно
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_SEC * 1000,
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id) {
  return id ? sessions.get(id) ?? null : null;
}

export function destroySession(id) {
  if (id) sessions.delete(id);
}
