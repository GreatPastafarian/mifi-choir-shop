import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    MdShoppingCart,
    MdPerson,
    MdFavorite
} from 'react-icons/md';

function Header({ cartCount, favoritesCount }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="header">
        <div className="header-top">
        <p className="donation-notice">
        Это не магазин, а способ получить сувенир в благодарность за ваше пожертвование
        </p>
        </div>

        <div className="header-main">
        <div className="logo-container">
        <div className="logo">
        <div className="logo-inner">
        <div className="logo-text">Хор МИФИ</div>
        <div className="logo-subtext">Академический мужской хор</div>
        </div>
        </div>
        </div>

        <button
        className="mobile-menu-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
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
