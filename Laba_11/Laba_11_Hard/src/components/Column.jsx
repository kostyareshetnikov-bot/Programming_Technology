import TaskCard from './TaskCard.jsx';

// props: status — данные колонки, tasks — задачи этой колонки,
// isFirst / isLast — крайняя ли колонка, onMove / onDelete — функции родителя
function Column({ status, tasks, isFirst, isLast, onMove, onDelete }) {
  return (
    <section className="column">
      <div className="column-header">
        <span className="column-dot" style={{ background: status.color }} />
        <h2 className="column-title">{status.title}</h2>
        <span className="column-count">{tasks.length}</span>
      </div>

      <div className="column-body">
        {tasks.length === 0 && <p className="column-empty">Нет задач</p>}

        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            canMoveLeft={!isFirst}
            canMoveRight={!isLast}
            onMove={onMove}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

export default Column;
