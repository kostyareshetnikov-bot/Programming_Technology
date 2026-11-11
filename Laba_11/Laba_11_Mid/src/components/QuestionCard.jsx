const LETTERS = ['A', 'B', 'C', 'D'];

// props: question — данные вопроса, number и total — номер и общее количество,
// selected — выбранный ответ (или null), onAnswer — функция родителя
function QuestionCard({ question, number, total, selected, onAnswer }) {
  const answered = selected !== null;
  const isCorrect = selected === question.correct;

  // После ответа подсвечиваем правильный вариант зелёным, ошибочный — красным
  function getOptionClass(index) {
    if (!answered) return 'option';
    if (index === question.correct) return 'option option-correct';
    if (index === selected) return 'option option-wrong';
    return 'option option-faded';
  }

  return (
    <div className="card">
      <p className="label">
        Вопрос {number} из {total}
      </p>
      <h2 className="question-text">{question.text}</h2>

      <div className="options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={getOptionClass(index)}
            onClick={() => onAnswer(index)}
            disabled={answered}
          >
            <span className="option-letter">{LETTERS[index]}</span>
            {option}
          </button>
        ))}
      </div>

      {answered && (
        <p className={isCorrect ? 'feedback feedback-ok' : 'feedback feedback-bad'}>
          {isCorrect
            ? 'Верно!'
            : `Неверно. Правильный ответ: ${LETTERS[question.correct]}`}
        </p>
      )}
    </div>
  );
}

export default QuestionCard;
