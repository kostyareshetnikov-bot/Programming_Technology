// Сборка Express-приложения: middleware, статика, маршруты API
import express from 'express';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'node:url';
import { authRouter } from './routes/auth.js';
import { notesRouter } from './routes/notes.js';

export const app = express();
const publicDir = fileURLToPath(new URL('../public', import.meta.url));

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Заголовки безопасности
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy':
      "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com",
  });
  if (req.path.startsWith('/api')) res.set('Cache-Control', 'no-store');
  next();
});

app.use(express.static(publicDir));

app.use('/api', authRouter);
app.use('/api/notes', notesRouter);

// Неизвестный адрес API
app.use('/api', (req, res) => {
  res.status(404).json({ code: 'not_found', error: 'Маршрут не найден' });
});

// Ошибки (например, сломанный JSON в теле запроса)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ code: 'error', error: status === 500 ? 'Внутренняя ошибка сервера' : 'Некорректный запрос' });
});
