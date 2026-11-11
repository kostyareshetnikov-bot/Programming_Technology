import { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import TaskForm from './components/TaskForm.jsx';
import Stats from './components/Stats.jsx';
import Column from './components/Column.jsx';
import { STATUSES, START_TASKS } from './data.js';

const STORAGE_KEY = 'lab11-kanban-tasks';

// Загружаем задачи из localStorage (если там пусто — берём стартовые)
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : START_TASKS;
  } catch {
    return START_TASKS;
  }
}

// Родитель хранит все карточки; статус карточки определяет её колонку
function App() {
  const [tasks, setTasks] = useState(loadTasks);

  // При каждом изменении задач сохраняем их в localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function addTask(title, priority) {
    const newTask = { id: Date.now(), title, priority, status: 'todo' };
    setTasks([...tasks, newTask]);
  }

  // direction: -1 — влево, 1 — вправо
  function moveTask(id, direction) {
    setTasks(
      tasks.map((task) => {
        if (task.id !== id) return task;

        const index = STATUSES.findIndex((s) => s.id === task.status);
        const next = STATUSES[index + direction];
        return next ? { ...task, status: next.id } : task;
      })
    );
  }

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  function clearDone() {
    setTasks(tasks.filter((task) => task.status !== 'done'));
  }

  const doneCount = tasks.filter((task) => task.status === 'done').length;

  return (
    <div className="page">
      <Header
        variant="19"
        title="Канбан-доска"
        accent="задач"
        subtitle="TaskCard получает задачу через props, а родитель хранит все карточки по статусам и перемещает их кнопками."
      />

      <div className="toolbar">
        <TaskForm onAdd={addTask} />
        <Stats total={tasks.length} done={doneCount} onClearDone={clearDone} />
      </div>

      <div className="board">
        {STATUSES.map((status, index) => (
          <Column
            key={status.id}
            status={status}
            tasks={tasks.filter((task) => task.status === status.id)}
            isFirst={index === 0}
            isLast={index === STATUSES.length - 1}
            onMove={moveTask}
            onDelete={deleteTask}
          />
        ))}
      </div>

      <footer className="footer">Решетников К.А. · ИС 26-21</footer>
    </div>
  );
}

export default App;
