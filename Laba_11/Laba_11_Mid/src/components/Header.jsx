// Шапка страницы: все данные приходят через props
function Header({ variant, title, accent, subtitle }) {
  return (
    <header className="header">
      <span className="header-badge">ЛР №11 · Вариант {variant}</span>
      <h1 className="header-title">
        {title} <span>{accent}</span>
      </h1>
      <p className="header-subtitle">{subtitle}</p>
    </header>
  );
}

export default Header;
