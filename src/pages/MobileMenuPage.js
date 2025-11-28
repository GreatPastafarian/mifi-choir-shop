import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdEmail, MdPhone, MdLocationOn, MdExitToApp } from 'react-icons/md';
import { FaVk, FaYoutube, FaTelegram, FaRegCalendarAlt } from 'react-icons/fa';
import { IoEarth } from 'react-icons/io5';
import '../styles/pages/mobile-menu.css';

const MobileMenuPage = () => {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <div className="mobile-menu">
            <div className="mobile-menu__header">
                <h2>Меню</h2>
            </div>

            <div className="mobile-menu__section">
                {isAuthenticated ? (
                    <div className="mobile-menu__profile">
                        <div className="mobile-menu__avatar">
                            <MdPerson />
                        </div>
                        <div className="mobile-menu__user-info">
                            <p className="mobile-menu__username">{user?.name || 'Пользователь'}</p>
                            <p className="mobile-menu__email">{user?.email}</p>
                            <Link to="/account" className="mobile-menu__link-btn">Личный кабинет</Link>
                        </div>
                    </div>
                ) : (
                    <div className="mobile-menu__auth-buttons">
                        <Link to="/login" className="mobile-menu__btn mobile-menu__btn--primary">Войти</Link>
                        <Link to="/register" className="mobile-menu__btn mobile-menu__btn--secondary">Регистрация</Link>
                    </div>
                )}
            </div>

            <div className="mobile-menu__section">
                <h3 className="mobile-menu__title">Навигация</h3>
                <ul className="mobile-menu__list">
                    <li><Link to="/about">О хоре</Link></li>
                    <li><Link to="/contacts">Контакты</Link></li>
                    {isAuthenticated && user?.role === 'admin' && (
                        <li><Link to="/admin">Админ-панель</Link></li>
                    )}
                </ul>
            </div>

            <div className="mobile-menu__section">
                <h3 className="mobile-menu__title">Мы в соцсетях</h3>
                <div className="mobile-menu__socials">
                    <a href="https://vk.com/choirmephi" target="_blank" rel="noopener noreferrer"><FaVk /></a>
                    <a href="https://www.youtube.com/@MEPHIchoir" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
                    <a href="https://t.me/choirmephi" target="_blank" rel="noopener noreferrer"><FaTelegram /></a>
                    <a href="https://malechoirmephi.timepad.ru/events/" target="_blank" rel="noopener noreferrer"><FaRegCalendarAlt /></a>
                    <a href="https://mephi.ru/students/culture/choir/about" target="_blank" rel="noopener noreferrer"><IoEarth /></a>
                </div>
            </div>

            <div className="mobile-menu__section">
                <h3 className="mobile-menu__title">Контакты</h3>
                <ul className="mobile-menu__contacts">
                    <li>
                        <MdEmail /> <span>choir.mephi.donate@gmail.com</span>
                    </li>
                    <li>
                        <MdPhone /> <span>+7 (916) 373-69-34</span>
                    </li>
                    <li>
                        <MdLocationOn /> <span>г. Москва, Каширское шоссе, 64, корп. 1А</span>
                    </li>
                </ul>
            </div>

            <div className="mobile-menu__section">
                <h3 className="mobile-menu__title">Документы</h3>
                <ul className="mobile-menu__list">
                    <li><a href="/oferta">Оферта</a></li>
                    <li><a href="/privacy">Политика конфиденциальности</a></li>
                </ul>
            </div>

            {isAuthenticated && (
                <div className="mobile-menu__section">
                    <button onClick={logout} className="mobile-menu__logout">
                        <MdExitToApp /> Выйти
                    </button>
                </div>
            )}

            {/* Spacer for bottom navigation */}
            <div style={{ height: '80px' }}></div>
        </div>
    );
};

export default MobileMenuPage;
