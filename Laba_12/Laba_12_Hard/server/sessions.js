// Сессии и refresh token с ротацией.
// Одна сессия = один вход с одного устройства. При каждом обновлении выдаётся НОВЫЙ refresh token,
// а старый помечается использованным. Если старый придёт ещё раз — его украли: отзываем всю сессию.
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { REFRESH_TTL_SEC } from './config.js';

const sessions = new Map(); // id -> { id, userId, userAgent, createdAt, lastUsedAt, expiresAt, rotations, revoked }
const refreshTokens = new Map(); // sha256(token) -> { sessionId, used }

// В памяти храним только хеш refresh token — утечка хранилища не даёт готовых токенов
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

function issueRefreshToken(sessionId) {
  const token = randomBytes(32).toString('base64url');
  refreshTokens.set(sha256(token), { sessionId, used: false });
  return token;
}

export function createSession(userId, userAgent = '') {
  const now = Date.now();
  const session = {
    id: randomUUID(),
    userId,
    userAgent: userAgent.slice(0, 160),
    createdAt: now,
    lastUsedAt: now,
    expiresAt: now + REFRESH_TTL_SEC * 1000,
    rotations: 0,
    revoked: false,
  };
  sessions.set(session.id, session);
  return { session, refreshToken: issueRefreshToken(session.id) };
}

// Ротация: старый refresh token → новый. Возвращает { session, refreshToken } или { error }
export function rotateRefreshToken(token) {
  const record = token ? refreshTokens.get(sha256(token)) : null;
  if (!record) return { error: 'refresh_invalid' };

  const session = sessions.get(record.sessionId);
  if (session.revoked) return { error: 'session_revoked' };

  if (record.used) {
    session.revoked = true; // повторное использование = кража токена
    return { error: 'refresh_reused' };
  }
  if (Date.now() > session.expiresAt) {
    session.revoked = true;
    return { error: 'refresh_expired' };
  }

  record.used = true;
  session.lastUsedAt = Date.now();
  session.rotations += 1;
  return { session, refreshToken: issueRefreshToken(session.id) };
}

export function getSession(id) {
  return sessions.get(id) ?? null;
}

export function findSessionByRefreshToken(token) {
  const record = token ? refreshTokens.get(sha256(token)) : null;
  return record ? getSession(record.sessionId) : null;
}

export function isActive(session) {
  return Boolean(session) && !session.revoked && Date.now() <= session.expiresAt;
}

export function revokeSession(id) {
  const session = sessions.get(id);
  if (session) session.revoked = true;
}

export function revokeAllUserSessions(userId) {
  for (const session of sessions.values()) {
    if (session.userId === userId) session.revoked = true;
  }
}

export function listUserSessions(userId) {
  return [...sessions.values()].filter((session) => session.userId === userId && isActive(session));
}
