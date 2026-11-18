// Точка входа: запуск сервера
import { app } from './app.js';
import { PORT, SESSION_TTL_SEC } from './config.js';

app.listen(PORT, () => {
  console.log(`ЛР №12 · Вариант 8 · Роли student/teacher  →  http://localhost:${PORT}`);
  console.log(`Время жизни сессии: ${SESSION_TTL_SEC} с`);
});
