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
      <div className="header-top">
        <p className="donation-notice">
          Это не магазин, а способ получить сувенир в благодарность за ваше пожертвование
        </p>
      </div>

      <div className="header-main">
        <div className="logo-container">
          <div
            className="header-column"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div className="logo-header" style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={choirLogo}
                alt="Логотип Хора МИФИ"
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  border: '2px solid #d4af37',
                  marginRight: '1rem',
                }}
              />
              <div>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#d4af37',
                    marginBottom: '0.25rem',
                  }}
                >
                  Хор МИФИ
                </h2>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: '#f0f0f0',
                    maxWidth: '200px',
                  }}
                >
                  Академический мужской хор
                </p>
              </div>
            </div>
          </div>
        </div>

        <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/">Главная</Link>
          <Link to="/shop">Каталог</Link>
          <Link to="/about">О хоре</Link>
          <Link to="/contacts">Контакты</Link>
          <Link to="/account">Личный кабинет</Link>
        </nav>

        <div className="header-icons">
          <Link to="/favorites" className="favorites-icon">
            <MdFavorite />
            {favoritesCount > 0 && <span className="favorites-count">{favoritesCount}</span>}
          </Link>
          <Link to="/cart" className="cart-icon">
            <MdShoppingCart />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
          <Link to="/account" className="user-icon">
            <MdPerson />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
