import { useState } from 'react';

// props: lesson — название занятия, maxScore — максимальный балл
// state: score — выбранная оценка, hover — звезда под курсором
function Rating({ lesson, maxScore }) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);

  // Массив номеров звёзд: [1, 2, ..., maxScore]
  const stars = Array.from({ length: maxScore }, (_, i) => i + 1);

  // Пока наводим мышь — подсвечиваем по hover, иначе по выбранной оценке
  const highlighted = hover || score;

  function getMessage() {
    if (score === 0) return 'Оценка ещё не выбрана';

    const percent = score / maxScore;
    if (percent >= 0.8) return 'Отличное занятие!';
    if (percent >= 0.5) return 'Неплохо, но есть что улучшить';
    return 'Занятие не понравилось';
  }

  return (
    <div className="card rating">
      <p className="label">Занятие</p>
      <h2 className="rating-lesson">{lesson}</h2>

      <div className={maxScore > 5 ? 'stars stars-small' : 'stars'} onMouseLeave={() => setHover(0)}>
        {stars.map((n) => (
          <button
            key={n}
            className={n <= highlighted ? 'star star-active' : 'star'}
            onClick={() => setScore(n)}
            onMouseEnter={() => setHover(n)}
            title={`Поставить ${n}`}
          >
            ★
          </button>
        ))}
      </div>

      <div className="rating-result">
        <span className="rating-score">{score}</span>
        <span className="rating-max">/ {maxScore}</span>
      </div>

      <p className="rating-message">{getMessage()}</p>

      <button className="btn btn-ghost" onClick={() => setScore(0)} disabled={score === 0}>
        Сбросить
      </button>
    </div>
  );
}

export default Rating;
