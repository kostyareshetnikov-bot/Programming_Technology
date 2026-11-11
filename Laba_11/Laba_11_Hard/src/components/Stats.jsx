// Компонент аналитики. props: total, done — числа, onClearDone — функция родителя
function Stats({ total, done, onClearDone }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="card stats">
      <div className="stats-numbers">
        <div>
          <p className="label">Всего</p>
          <p className="stats-value">{total}</p>
        </div>
        <div>
          <p className="label">Готово</p>
          <p className="stats-value">{done}</p>
        </div>
        <div>
          <p className="label">Прогресс</p>
          <p className="stats-value">{percent}%</p>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stats-bar-fill" style={{ width: `${percent}%` }} />
      </div>

      <button className="btn btn-ghost" onClick={onClearDone} disabled={done === 0}>
        Очистить выполненные
      </button>
    </div>
  );
}

export default Stats;
