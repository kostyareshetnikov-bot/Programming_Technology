// Учебная «база данных» в памяти.
// Пользователи тестовые, пароли хранятся только в виде хешей scrypt.

export const users = [
  {
    id: 1,
    login: 'aliya',
    name: 'Алия Нурланова',
    passwordHash:
      'scrypt$ac17748a3890fff3009344cecd660eca$0478adeae3413f73d397bb552ad2568a54cdc5620758ee7c68b4af5b6acd91233cdcb88433c932d3649deb0aa437ecb4aeed5a73078d6eedc1a45407f169399c',
  },
  {
    id: 2,
    login: 'daniyar',
    name: 'Данияр Сапаров',
    passwordHash:
      'scrypt$407c3c41c9a85ec058db8c2394be8144$0710c9c30d7eb023a8ac385cdb14d7aedd0991432f897c2325d72cd75bcf90b068313bf50dd5f7ddec31e691691b298dece7b2128da64c76a2c7967615df89c9',
  },
];

export const findUserByLogin = (login) => users.find((user) => user.login === login.toLowerCase());
export const findUserById = (id) => users.find((user) => user.id === id);

export const publicUser = ({ id, login, name }) => ({ id, login, name });
