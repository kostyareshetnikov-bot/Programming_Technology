// Учебная «база данных» в памяти.
// Пользователи тестовые, пароли хранятся только в виде хешей scrypt.

export const ROLES = { student: 'Студент', teacher: 'Преподаватель' };

export const users = [
  {
    id: 1,
    login: 'aliya',
    name: 'Алия Нурланова',
    role: 'student',
    group: 'ИС 26-21',
    passwordHash:
      'scrypt$3156aa844a4508d4f06b1e898b8f2709$e14facb5460762a74c987ec961b968f78231ec7e26a59e0d3c2a8130f95ea683200af362977d489eca75f01f5894f3f762e1641e9089f638772c0fa7459bf10d',
  },
  {
    id: 2,
    login: 'daniyar',
    name: 'Данияр Сапаров',
    role: 'student',
    group: 'ИС 26-21',
    passwordHash:
      'scrypt$6584b9f9ed2034bf22c54550b4a81b09$c3e078091701390b65e9a41fc7f0903d460de483bb147e7418b002e81a5556b6e64932d3f79f3f72dbfec3cb25dec18d193afb11dafde103f0dc53691f2772f9',
  },
  {
    id: 3,
    login: 'ivanova',
    name: 'Светлана Иванова',
    role: 'teacher',
    group: null,
    passwordHash:
      'scrypt$9badd0945062c24c7f06101780c0085c$3791222c65e55e86a367bc25549d988fda2cec0f2ec32d8bcb03d2401706c14b357c4e904d3708c1358a0a19abeb4f6a301c881e899f41afe5fae10b43ba3ec6',
  },
];

export const SUBJECTS = ['Технология программирования', 'Базы данных', 'Математическая статистика', 'Основы ИИ'];

const day = 86_400_000;
const now = Date.now();

export const grades = [
  { id: 1, studentId: 1, subject: 'Технология программирования', value: 95, date: now - 1 * day },
  { id: 2, studentId: 1, subject: 'Базы данных', value: 88, date: now - 3 * day },
  { id: 3, studentId: 1, subject: 'Математическая статистика', value: 74, date: now - 5 * day },
  { id: 4, studentId: 2, subject: 'Технология программирования', value: 81, date: now - 2 * day },
  { id: 5, studentId: 2, subject: 'Основы ИИ', value: 67, date: now - 4 * day },
  { id: 6, studentId: 2, subject: 'Базы данных', value: 45, date: now - 6 * day },
];

let nextGradeId = grades.length + 1;
export const createGradeId = () => nextGradeId++;

export const findUserByLogin = (login) => users.find((user) => user.login === login.toLowerCase());
export const findUserById = (id) => users.find((user) => user.id === id);
export const students = () => users.filter((user) => user.role === 'student');

// Наружу отдаём пользователя без хеша пароля
export const publicUser = ({ id, login, name, role, group }) => ({ id, login, name, role, group });
