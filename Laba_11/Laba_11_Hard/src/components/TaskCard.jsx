import { PRIORITIES } from '../data.js';

// props: task — данные задачи, canMoveLeft / canMoveRight — можно ли двигать,
// onMove и onDelete — функции родителя (сам TaskCard задачу не меняет)
function TaskCard({ task, canMoveLeft, canMoveRight, onMove, onDelete }) {
  return (
    <div className={task.status === 'done' ? 'task task-done' : 'task'}>
      <span className={`tag tag-${task.priority}`}>{PRIORITIES[task.priority]}</span>
      <p className="task-title">{task.title}</p>

      <div className="task-actions">
        <button
          className="btn-icon"
          onClick={() => onMove(task.id, -1)}
          disabled={!canMoveLeft}
          title="Переместить влево"
        >
          ←
        </button>
        <button
          className="btn-icon"
          onClick={() => onMove(task.id, 1)}
          disabled={!canMoveRight}
          title="Переместить вправо"
        >
          →
        </button>
        <button className="btn-icon btn-delete" onClick={() => onDelete(task.id)} title="Удалить">
          ✕
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
