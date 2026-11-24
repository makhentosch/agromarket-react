function Header({ cartCount = 0, user, onLogout }) {
  return (
    <header className="site-header">
      <a href="#" className="logo">🌾 АгроМаркет</a>
      <nav>
        <ul className="nav-links">
          <li><a href="#catalog">Каталог</a></li>
          <li><a href="#delivery">Доставка</a></li>
          <li><a href="#contact">Контакты</a></li>
          {user?.role === 'admin' && <li><a href="#orders">Заявки</a></li>}
        </ul>
      </nav>
      <div className="header-user">
        <span className="cart">🛒 Корзина: {cartCount}</span>
        {user ? (
          <>
            <span>
              {user.name}
              {user.role === 'admin' && ' (админ)'}
            </span>
            <button type="button" className="header-button" onClick={onLogout}>Выйти</button>
          </>
        ) : (
          <a href="#login" className="header-button">Войти</a>
        )}
      </div>
    </header>
  );
}

export default Header;
