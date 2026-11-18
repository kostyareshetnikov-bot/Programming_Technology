// Генерация хеша для нового тестового пользователя:
//   npm run hash -- МойПароль
// Полученную строку вставьте в поле passwordHash в server/db.js
import { hashPassword } from '../server/password.js';

const password = process.argv[2];
if (!password) {
  console.log('Использование: npm run hash -- <пароль>');
  process.exit(1);
}
console.log(hashPassword(password));
