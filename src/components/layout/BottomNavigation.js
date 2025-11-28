import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdHome, MdStore, MdShoppingCart, MdFavorite, MdMenu } from 'react-icons/md';
import '../../styles/layout/bottom-navigation.css';

const BottomNavigation = ({ cartCount, favoritesCount }) => {
    return (
        <nav className="bottom-nav">
            <NavLink
                to="/"
                className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}
                end
            >
                <MdHome className="bottom-nav__icon" />
                <span className="bottom-nav__label">Главная</span>
            </NavLink>

            <NavLink
                to="/shop"
                className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}
            >
                <MdStore className="bottom-nav__icon" />
                <span className="bottom-nav__label">Каталог</span>
            </NavLink>

            <NavLink
                to="/cart"
                className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}
            >
                <div className="bottom-nav__icon-wrapper">
                    <MdShoppingCart className="bottom-nav__icon" />
                    {cartCount > 0 && <span className="bottom-nav__badge">{cartCount}</span>}
                </div>
                <span className="bottom-nav__label">Корзина</span>
            </NavLink>

            <NavLink
                to="/favorites"
                className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}
            >
                <div className="bottom-nav__icon-wrapper">
                    <MdFavorite className="bottom-nav__icon" />
                    {favoritesCount > 0 && <span className="bottom-nav__badge">{favoritesCount}</span>}
                </div>
                <span className="bottom-nav__label">Избранное</span>
            </NavLink>

            <NavLink
                to="/menu"
                className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}
            >
                <MdMenu className="bottom-nav__icon" />
                <span className="bottom-nav__label">Меню</span>
            </NavLink>
        </nav>
    );
};

export default BottomNavigation;
