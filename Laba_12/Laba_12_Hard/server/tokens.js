// Access token — JWT (header.payload.signature), подписанный HMAC-SHA256.
// Payload НЕ зашифрован: его может прочитать любой, поэтому секретов внутри нет.
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { JWT_SECRET, JWT_ALGORITHM, JWT_ISSUER, JWT_AUDIENCE, ACCESS_TTL_SEC } from './config.js';

export function signAccessToken(user, sessionId) {
  return jwt.sign({ name: user.name, sid: sessionId }, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    subject: String(user.id), // sub — кому выдан
    issuer: JWT_ISSUER, // iss — кто выдал
    audience: JWT_AUDIENCE, // aud — для кого предназначен
    expiresIn: ACCESS_TTL_SEC, // exp — когда истекает
    jwtid: randomUUID(), // jti — уникальный номер токена
  });
}

// Проверка: подпись, разрешённый алгоритм (только HS256, alg: none не пройдёт),
// срок действия (exp), издатель (iss) и получатель (aud). При ошибке бросает исключение
export function verifyAccessToken(token) {
  const payload = jwt.verify(token, JWT_SECRET, {
    algorithms: [JWT_ALGORITHM],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
  if (!payload.sub || !payload.sid) throw new jwt.JsonWebTokenError('missing claims');
  return payload;
}
