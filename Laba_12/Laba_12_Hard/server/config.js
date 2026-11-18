// Настройки сервера
// Короткие сроки для демонстрации истечения токенов: npm run start:short
import { randomBytes } from 'node:crypto';

const short = process.argv.includes('--short');

export const PORT = Number(process.env.PORT) || 3003;

// access token живёт недолго, refresh token — дольше
export const ACCESS_TTL_SEC = Number(process.env.ACCESS_TTL_SEC) || (short ? 20 : 120);
export const REFRESH_TTL_SEC = Number(process.env.REFRESH_TTL_SEC) || (short ? 90 : 7 * 24 * 60 * 60);

// Секрет подписи берётся из переменной окружения JWT_SECRET.
// Если её нет — генерируется случайный при каждом запуске: в коде и в репозитории секрета нет
export const JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString('hex');

// Ожидаемые параметры токена — сервер проверяет каждый из них
export const JWT_ALGORITHM = 'HS256';
export const JWT_ISSUER = 'lab12-auth-server';
export const JWT_AUDIENCE = 'lab12-web-client';

export const REFRESH_COOKIE = 'refresh_token';
export const refreshCookieOptions = {
  httpOnly: true, // JavaScript не может прочитать refresh token — не украдут через XSS
  sameSite: 'strict', // не отправляется с чужих сайтов (защита от CSRF)
  secure: process.env.NODE_ENV === 'production', // только HTTPS (на localhost — http)
  path: '/api/auth', // уходит только на маршруты /api/auth/*, а не с каждым запросом
};
