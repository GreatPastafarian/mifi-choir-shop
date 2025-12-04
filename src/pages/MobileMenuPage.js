import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdEmail, MdPhone, MdLocationOn, MdExitToApp } from 'react-icons/md';
import { FaVk, FaYoutube, FaTelegram, FaRegCalendarAlt } from 'react-icons/fa';
import { IoEarth } from 'react-icons/io5';
import '../styles/pages/mobile-menu.css';

const MobileMenuPage = () => {
    const { user, logout, isAuthenticated } = useAuth();

    const handleChatClick = () => {
        // Trigger chat widget open logic if possible, or navigate to a chat page
        // Since the widget is global, we might need a context or event to open it.
        // For now, let's assume we can just toggle a class or use a global event.
        // Ideally, the SupportChatWidget should expose a way to open it.
        // But the user asked to "add it to navigation".
        // Let's add a button here that simulates opening the chat.
        const chatWidget = document.querySelector('.support-chat-widget');
        if (chatWidget) {
            const toggleBtn = chatWidget.querySelector('.support-chat-widget__toggle');
            if (toggleBtn) toggleBtn.click();
        }
    };

    return (
        <div className="mobile-menu">
            {/* Profile Section (Only if logged in) */}
            {isAuthenticated && (
                <div className="mobile-menu__section mobile-menu__section--profile">
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
                </div>
            )}

            {/* Main Navigation */}
            <div className="mobile-menu__section">
                <h3 className="mobile-menu__title">Меню</h3>
                <ul className="mobile-menu__list">
                    {!isAuthenticated && (
                        <>
                            <li><Link to="/login" className="mobile-menu__item-link">Войти</Link></li>
                            <li><Link to="/register" className="mobile-menu__item-link">Регистрация</Link></li>
                        </>
                    )}
                    <li><Link to="/about" className="mobile-menu__item-link">О хоре</Link></li>
                    <li><Link to="/contacts" className="mobile-menu__item-link">Контакты</Link></li>
                    <li>
                        <button className="mobile-menu__item-btn" onClick={handleChatClick}>
                            Написать нам
                        </button>
                    </li>
                    {isAuthenticated && user?.role === 'admin' && (
                        <li><Link to="/admin" className="mobile-menu__item-link">Админ-панель</Link></li>
                    )}
                </ul>
            </div>

            {/* Socials */}
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

            {/* Contacts Info */}
            <div className="mobile-menu__section">
                <h3 className="mobile-menu__title">Контакты</h3>
                <ul className="mobile-menu__contacts">
                    <li>
                        <MdEmail /> <span>choir.mephi.donate@gmail.com</span>
                    </li>
                    <li>
                        <MdPhone /> <span>+7 (918) 660-44-26</span>
                    </li>
                    <li>
                        <MdLocationOn /> <span>г. Москва, Каширское шоссе, 64, корп. 1А</span>
                    </li>
                </ul>
            </div>

            {/* Documents */}
            <div className="mobile-menu__section">
                <h3 className="mobile-menu__title">Документы</h3>
                <ul className="mobile-menu__list">
                    <li><a href="/oferta" className="mobile-menu__item-link">Оферта</a></li>
                    <li><a href="/privacy" className="mobile-menu__item-link">Политика конфиденциальности</a></li>
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
