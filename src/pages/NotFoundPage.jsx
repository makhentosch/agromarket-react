import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <main className="page page--narrow">
      <h1>Страница не найдена</h1>
      <p><Link to="/">Перейти в каталог</Link></p>
    </main>
  );
}

export default NotFoundPage;
