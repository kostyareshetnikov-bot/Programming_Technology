// Настройки сервера
// Время жизни сессии можно сократить для теста: npm run start:short  (30 секунд)
const ttlArg = process.argv.find((arg) => arg.startsWith('--ttl='));

export const PORT = Number(process.env.PORT) || 3001;
export const SESSION_TTL_SEC = Number(process.env.SESSION_TTL_SEC || ttlArg?.split('=')[1]) || 15 * 60;

export const COOKIE_NAME = 'sid';

// Параметры cookie сессии
export const cookieOptions = {
  httpOnly: true, // JavaScript на странице не может прочитать cookie
  sameSite: 'strict', // cookie не уходит с запросами с чужих сайтов (защита от CSRF)
  secure: process.env.NODE_ENV === 'production', // только по HTTPS (на localhost — http)
  path: '/',
};
