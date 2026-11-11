import { useState } from 'react';
import Header from './components/Header.jsx';
import QuestionCard from './components/QuestionCard.jsx';
import Result from './components/Result.jsx';
import questions from './questions.js';

// Родитель хранит: текущий индекс вопроса, массив ответов и счёт
function App() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);

  const isFinished = current === questions.length;
  const selected = answers[current] ?? null;
  const isLast = current === questions.length - 1;
  const progress = (answers.length / questions.length) * 100;

  // Вызывается из QuestionCard при выборе варианта
  function handleAnswer(index) {
    if (selected !== null) return; // на вопрос уже ответили

    setAnswers([...answers, index]);
    if (index === questions[current].correct) {
      setScore(score + 1);
    }
  }

  function handleNext() {
    setCurrent(current + 1);
  }

  function handleRestart() {
    setCurrent(0);
    setAnswers([]);
    setScore(0);
  }

  return (
    <div className="page">
      <Header
        variant="15"
        title="Мини-викторина"
        accent="по React"
        subtitle="QuestionCard получает данные вопроса через props, а родитель хранит текущий индекс, ответы и счёт."
      />

      <div className="quiz">
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {isFinished ? (
          <Result
            score={score}
            questions={questions}
            answers={answers}
            onRestart={handleRestart}
          />
        ) : (
          <>
            <QuestionCard
              question={questions[current]}
              number={current + 1}
              total={questions.length}
              selected={selected}
              onAnswer={handleAnswer}
            />

            <div className="quiz-footer">
              <p className="quiz-score">
                Счёт: <b>{score}</b>
              </p>
              {selected === null && <p className="hint">Выберите вариант ответа</p>}
              <button className="btn btn-primary" onClick={handleNext} disabled={selected === null}>
                {isLast ? 'Завершить' : 'Далее →'}
              </button>
            </div>
          </>
        )}
      </div>

      <footer className="footer">Решетников К.А. · ИС 26-21</footer>
    </div>
  );
}

export default App;
