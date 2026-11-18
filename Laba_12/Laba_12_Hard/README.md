# ЛР №12 — Вариант 17 (повышенный): JWT с обновлением сессии

**Условие:** короткий access token, безопасная ротация refresh token и выход.

**Как сделано:**
- **Access token** — JWT (HS256), живёт 2 минуты. Клиент хранит его только в переменной JavaScript (в памяти вкладки) и отправляет в заголовке `Authorization: Bearer …`. В `localStorage` токен не кладётся.
- **Refresh token** — случайная строка в cookie `HttpOnly; SameSite=Strict; Path=/api/auth`. JavaScript её не видит. На сервере хранится только её SHA-256-хеш.
- **Ротация:** каждый `POST /api/auth/refresh` выдаёт новую пару, старый refresh token помечается использованным. Если старый токен придёт повторно, это признак кражи: сервер отзывает всю сессию (`refresh_reused`).
- **Проверка JWT на сервере:** подпись, алгоритм (только HS256, `alg: none` не пройдёт), срок `exp`, издатель `iss`, получатель `aud`, наличие `sub` и `sid`. Ещё сервер проверяет, что сессия `sid` не завершена, поэтому после выхода даже неистёкший access token перестаёт работать.
- **Выход:** `logout` отзывает текущую сессию, `logout-all` — все сессии пользователя.

**Творческое задание:**
1. Индикатор оставшегося времени access token: таймер и полоса прогресса.
2. Журнал запросов на странице: видно цепочку `401 token_expired → POST /refresh 200 → повтор 200`.
3. Разбор токена: три части разными цветами и таблица claims с пояснениями. Наглядно видно, что payload не зашифрован.
4. Список активных сессий (устройств) с завершением любой из них.

## Запуск
```bash
npm install
npm start            # http://localhost:3003; access 120 с, сессия 7 дней
npm run start:short  # access 20 с, сессия 90 с — для показа истечения на защите
```

Тестовые учётные записи (не реальные данные): `aliya` / `Jwt#2026`, `daniyar` / `Jwt#2026`.

Секрет подписи берётся из переменной окружения `JWT_SECRET`. Если она не задана, при каждом запуске генерируется случайный секрет. В коде и репозитории секрета нет.

## Структура
```
server/
├── index.js          — запуск сервера
├── app.js            — Express: middleware, заголовки безопасности, маршруты
├── config.js         — сроки токенов, параметры JWT и cookie
├── db.js             — тестовые пользователи (только хеши паролей)
├── password.js       — хеширование и проверка паролей (scrypt)
├── tokens.js         — выпуск и проверка access token (jsonwebtoken)
├── sessions.js       — сессии и refresh token: выдача, ротация, обнаружение повтора, отзыв
├── auth.js           — middleware requireAccess (проверка Bearer-токена)
└── routes/
    ├── auth.js       — /api/auth: login, refresh, logout, logout-all
    └── account.js    — /api: me, sessions (проверка владельца → 403)
public/
├── index.html
├── css/theme.css     — общая тема (одинаковая во всех трёх проектах)
├── css/style.css     — стили этого варианта
└── js/
    ├── api.js        — токен в памяти, авто-обновление при 401, единый refresh для параллельных запросов
    ├── jwt.js        — декодирование JWT только для показа (без проверки подписи)
    ├── dashboard.js  — таймер, разбор токена, журнал запросов, список сессий
    ├── ui.js         — общие функции интерфейса
    └── app.js        — вход/выход, кнопки, старт страницы
```

## Схема
```
Вход:      POST /api/auth/login ──▶ 200 { accessToken } + Set-Cookie: refresh_token (HttpOnly)
Запрос:    GET /api/me  [Authorization: Bearer access] ──▶ 200
Истёк:     GET /api/me ──▶ 401 token_expired
             └─▶ POST /api/auth/refresh (cookie) ──▶ 200 новый access + НОВЫЙ refresh (старый «использован»)
             └─▶ повтор GET /api/me ──▶ 200
Кража:     POST /api/auth/refresh со старым refresh ──▶ 401 refresh_reused, вся сессия отозвана
F5:        access пропал из памяти ──▶ POST /api/auth/refresh ──▶ 200, пользователь остаётся в системе
Выход:     POST /api/auth/logout ──▶ сессия отозвана, cookie очищена; старый access → 401 session_revoked
```

## API
| Метод | Адрес | Доступ | Ответы |
|---|---|---|---|
| POST | `/api/auth/login` | все | 200, 400, 401 |
| POST | `/api/auth/refresh` | cookie refresh | 200, 401 (`refresh_missing`, `refresh_expired`, `refresh_reused`, `session_revoked`) |
| POST | `/api/auth/logout` | cookie refresh | 200 |
| POST | `/api/auth/logout-all` | Bearer | 200, 401 |
| GET | `/api/me` | Bearer | 200, 401 (`no_token`, `token_expired`, `token_invalid`, `session_revoked`) |
| GET | `/api/sessions` | Bearer | 200 — только свои |
| GET / DELETE | `/api/sessions/:id` | Bearer, владелец | 200, 403 (чужая), 404 |

## Тесты
| № | Сценарий | Входные условия | Ожидаемый результат | Фактический | Статус |
|---|---|---|---|---|---|
| 1 | Корректный вход | `aliya` / `Jwt#2026` | 200, JWT из 3 частей; refresh только в cookie HttpOnly с `Path=/api/auth` | Совпадает | Пройден |
| 2 | Неверный пароль | `aliya` / `nope` | 401 `bad_credentials` | Совпадает | Пройден |
| 3 | Пустые поля | пустая форма | Подсветка полей, сервер — 400 | Совпадает | Пройден |
| 4 | Доступ без входа | `GET /api/me` без токена | 401 `no_token` | Совпадает | Пройден |
| 5 | Выход и повторный запрос | выйти → запрос со старым access и старой cookie | 401 `session_revoked` на оба | Совпадает | Пройден |
| 6 | Истекшая сессия | `start:short`: ждать 20 с → «Запросить /api/me»; ждать 90 с → любой запрос | Access: 401 → авто-refresh → 200. Сессия: 401 (`refresh_expired` или `session_revoked`) → экран входа | Совпадает | Пройден |
| 7 | Чужой ресурс | `aliya` открывает сессию `daniyar` по ID | 403 «Это сессия другого пользователя» | Совпадает | Пройден |
| 8 | Обновление страницы | войти → F5 | В журнале `POST /api/auth/refresh 200`, пользователь в системе | Совпадает | Пройден |

## Меры безопасности
- Access token короткий и хранится только в памяти; refresh token недоступен JavaScript.
- Ротация refresh token и обнаружение повторного использования.
- На сервере хранятся только хеши refresh token и паролей (SHA-256 / scrypt).
- Полная проверка JWT: подпись, алгоритм, `exp`, `iss`, `aud`, обязательные claims, активность сессии.
- Payload JWT не шифруется, поэтому в нём только ID и имя, без секретов.
- Проверка владельца сессии (403 на чужую), выход на всех устройствах.
- Cookie `SameSite=Strict` и узкий `Path` (CSRF), `Secure` в продакшене, заголовок CSP, вывод через `textContent` (XSS).
