// Данные викторины. correct — индекс правильного варианта
const questions = [
  {
    text: 'Как в React передаются данные от родителя к дочернему компоненту?',
    options: ['Через state', 'Через props', 'Через localStorage', 'Через CSS-классы'],
    correct: 1,
  },
  {
    text: 'Что возвращает хук useState?',
    options: [
      'Только текущее значение',
      'Массив: значение и функцию-сеттер',
      'Объект с методами get и set',
      'Промис',
    ],
    correct: 1,
  },
  {
    text: 'Можно ли изменять props внутри дочернего компонента?',
    options: [
      'Да, в любой момент',
      'Только внутри useEffect',
      'Нет, props доступны только для чтения',
      'Только если это число',
    ],
    correct: 2,
  },
  {
    text: 'Какая запись передаёт функцию в onClick, а не вызывает её сразу?',
    options: [
      'onClick={handleClick()}',
      'onClick="handleClick"',
      'onClick={handleClick}',
      'onClick={call(handleClick)}',
    ],
    correct: 2,
  },
  {
    text: 'Что происходит после вызова функции-сеттера состояния?',
    options: [
      'Страница перезагружается',
      'Компонент повторно рендерится',
      'Ничего не происходит',
      'Сбрасываются все props',
    ],
    correct: 1,
  },
  {
    text: 'Как правильно добавить элемент в массив, который хранится в state?',
    options: [
      'items.push(x)',
      'setItems([...items, x])',
      'items = [...items, x]',
      'setItems(items.push(x))',
    ],
    correct: 1,
  },
];

export default questions;
