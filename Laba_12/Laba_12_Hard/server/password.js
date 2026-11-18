// Хеширование паролей алгоритмом scrypt (встроен в Node.js, без сторонних библиотек).
// В базе хранится строка "scrypt$соль$хеш" — сам пароль нигде не сохраняется.
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  const [, salt, hash] = stored.split('$');
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  // сравнение за постоянное время — нельзя подобрать пароль по скорости ответа
  return timingSafeEqual(actual, expected);
}

// Хеш-«пустышка»: проверяем его, если логин не найден,
// чтобы ответ для несуществующего логина занимал столько же времени
export const DUMMY_HASH = hashPassword('dummy-password');
