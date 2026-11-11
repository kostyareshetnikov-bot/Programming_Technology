import Header from './components/Header.jsx';
import Rating from './components/Rating.jsx';

// Родитель: передаёт каждому Rating название занятия и максимальный балл.
// У каждого Rating своё независимое состояние.
function App() {
  return (
    <div className="page">
      <Header
        variant="5"
        title="Оценка"
        accent="занятия"
        subtitle="Компонент Rating получает максимальный балл через props, а выбранную оценку хранит в собственном state."
      />

      <div className="ratings">
        <Rating lesson="React: props и state" maxScore={5} />
        <Rating lesson="JavaScript: ES-модули" maxScore={5} />
        <Rating lesson="Базы данных: JOIN" maxScore={10} />
      </div>

      <footer className="footer">Решетников К.А. · ИС 26-21</footer>
    </div>
  );
}

export default App;
