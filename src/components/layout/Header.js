import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdShoppingCart, MdPerson, MdFavorite } from 'react-icons/md';
import choirLogo from '../../assets/images/logo.jpg';
import { useAuth } from '../../context/AuthContext';

function Header({ cartCount }) {
  const { favorites } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Вычисляем количество избранных товаров
  const favoritesCount = favorites ? favorites.length : 0;

  return (
    <header className="header">
      <div className="header__top">
        <p className="header__donation-notice">
          Это не магазин, а способ получить сувенир в благодарность за ваше пожертвование
        </p>
      </div>

      <div className="header__main">
        <div className="header__logo-container">
          <Link to="/" className="header__logo-container">
            <img
              src={choirLogo}
              alt="Логотип Хора МИФИ"
              className="header__logo-img"
            />
            <div>
              <h2 className="header__logo-text">
                Хор МИФИ
              </h2>
              <p className="header__logo-subtext">
                Академический мужской хор
              </p>
            </div>
          </Link>
        </div>

        <button className="header__mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`header__nav ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="header__nav-link">Главная</Link>
          <Link to="/shop" className="header__nav-link">Каталог</Link>
          <Link to="/about" className="header__nav-link">О хоре</Link>
          <Link to="/contacts" className="header__nav-link">Контакты</Link>
          <Link to="/account" className="header__nav-link">Личный кабинет</Link>
        </nav>

        <div className="header__actions">
          <Link to="/favorites" className="header__icon">
            <MdFavorite />
            {favoritesCount > 0 && <span className="header__badge">{favoritesCount}</span>}
          </Link>
          <Link to="/cart" className="header__icon">
            <MdShoppingCart />
            {cartCount > 0 && <span className="header__badge">{cartCount}</span>}
          </Link>
          <Link to="/account" className="header__icon">
            <MdPerson />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
