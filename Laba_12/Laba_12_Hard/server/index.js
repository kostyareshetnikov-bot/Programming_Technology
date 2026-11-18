// Точка входа: запуск сервера
import { app } from './app.js';
import { PORT, ACCESS_TTL_SEC, REFRESH_TTL_SEC } from './config.js';

app.listen(PORT, () => {
  console.log(`ЛР №12 · Вариант 17 · JWT + refresh  →  http://localhost:${PORT}`);
  console.log(`Access token: ${ACCESS_TTL_SEC} с, refresh token (сессия): ${REFRESH_TTL_SEC} с`);
  if (!process.env.JWT_SECRET) console.log('JWT_SECRET не задан — сгенерирован случайный секрет на время запуска');
});
