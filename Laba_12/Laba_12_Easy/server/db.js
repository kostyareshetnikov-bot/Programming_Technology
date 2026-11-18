// Учебная «база данных» в памяти.
// Пользователи тестовые, пароли хранятся только в виде хешей scrypt.

export const users = [
  {
    id: 1,
    login: 'aliya',
    name: 'Алия Нурланова',
    passwordHash:
      'scrypt$14a11199787ac2599375de341df7ced2$73235798b625b793b3fb7a839375d922c448d6db7e1a9b8841a31b59aa76e1651e47b508824899c7046d0bb0e96a843dde486304a802f25b5537be5566d3447f',
  },
  {
    id: 2,
    login: 'daniyar',
    name: 'Данияр Сапаров',
    passwordHash:
      'scrypt$be26aeb01208432d9bc72ef120d234ff$063ee56c6ff56266f30ed763276d53d3cdf50b7c6cf18aaea784a3e7693868d4bc206439256c031598c91d6ebb19af74d7cb68bb6ac91d71b8fecb3aa915f10d',
  },
];

const now = Date.now();

export const notes = [
  { id: 1, ownerId: 1, text: 'Подготовить отчёт по ЛР №12: схема входа и 8 тестов', createdAt: now - 3_600_000 },
  { id: 2, ownerId: 1, text: 'Повторить: 401 — не вошёл, 403 — нет прав', createdAt: now - 7_200_000 },
  { id: 3, ownerId: 1, text: 'Купить тетрадь для матстата', createdAt: now - 86_400_000 },
  { id: 4, ownerId: 2, text: 'Личная заметка Данияра — Алия не должна её видеть', createdAt: now - 1_800_000 },
  { id: 5, ownerId: 2, text: 'Сдать СРО по базам данных', createdAt: now - 90_000_000 },
];

let nextNoteId = notes.length + 1;
export const createNoteId = () => nextNoteId++;

export const findUserByLogin = (login) => users.find((user) => user.login === login.toLowerCase());
export const findUserById = (id) => users.find((user) => user.id === id);

// Наружу отдаём пользователя без хеша пароля
export const publicUser = ({ id, login, name }) => ({ id, login, name });
