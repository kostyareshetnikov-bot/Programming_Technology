import { useState } from 'react';
import { PRIORITIES } from '../data.js';

const MAX_LENGTH = 60;

// props: onAdd — функция родителя для добавления задачи
// state: title, priority (управляемые поля) и error
function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const text = title.trim();

    if (text === '') {
      setError('Введите название задачи');
      return;
    }
    if (text.length > MAX_LENGTH) {
      setError(`Слишком длинное название (максимум ${MAX_LENGTH} символов)`);
      return;
    }

    onAdd(text, priority);
    setTitle('');
    setPriority('medium');
    setError('');
  }

  function handleChange(event) {
    setTitle(event.target.value);
    if (error) setError('');
  }

  return (
    <form className="card task-form" onSubmit={handleSubmit}>
      <div className="task-form-row">
        <input
          className={error ? 'input input-error' : 'input'}
          placeholder="Новая задача..."
          value={title}
          onChange={handleChange}
        />
        <select
          className="input task-form-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {Object.entries(PRIORITIES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" type="submit">
          Добавить
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}

export default TaskForm;
