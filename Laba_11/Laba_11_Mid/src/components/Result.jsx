// props: score, questions, answers — данные для итогов, onRestart — функция родителя
function Result({ score, questions, answers, onRestart }) {
  const percent = Math.round((score / questions.length) * 100);

  function getMessage() {
    if (percent === 100) return 'Идеально! Вы отлично знаете React.';
    if (percent >= 60) return 'Хороший результат, осталось немного подтянуть.';
    return 'Стоит ещё раз повторить теорию.';
  }

  return (
    <div className="card result">
      <p className="label">Итоги</p>

      <div className="result-circle" style={{ '--percent': percent }}>
        <div className="result-circle-inner">{percent}%</div>
      </div>

      <h2 className="result-score">
        {score} из {questions.length}
      </h2>
      <p className="result-message">{getMessage()}</p>

      <ul className="result-list">
        {questions.map((q, index) => {
          const ok = answers[index] === q.correct;
          return (
            <li key={index} className={ok ? 'result-item ok' : 'result-item bad'}>
              <span className="result-icon">{ok ? '✓' : '✕'}</span>
              {q.text}
            </li>
          );
        })}
      </ul>

      <button className="btn btn-primary" onClick={onRestart}>
        Пройти заново
      </button>
    </div>
  );
}

export default Result;
