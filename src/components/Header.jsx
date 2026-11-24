import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header({ cartCount = 0 }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="site-header">
      <Link to="/" className="logo">🌾 АгроМаркет</Link>
      <nav>
        <ul className="nav-links">
          <li><Link to="/">Каталог</Link></li>
          <li><a href="/#delivery">Доставка</a></li>
          <li><a href="/#contact">Контакты</a></li>
          {isAdmin && <li><Link to="/admin">Админка</Link></li>}
        </ul>
      </nav>
      <div className="header-user">
        <span className="cart">🛒 Корзина: {cartCount}</span>
        {user ? (
          <>
            <span>
              {user.name}
              {isAdmin && ' (админ)'}
            </span>
            <button type="button" className="header-button" onClick={logout}>Выйти</button>
          </>
        ) : (
          <Link to="/login" className="header-button">Войти</Link>
        )}
      </div>
    </header>
  );
}

export default Header;
