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
            // This is a bit hacky, but without a context for the chat, it's the quickest way.
            // Better approach: The user said "add it to navigation".
            // Maybe they mean a link to a contact form or just a button here.
            // I'll add a button "Написать нам" which is clear.
            const toggleBtn = chatWidget.querySelector('.support-chat-widget__toggle');
            if (toggleBtn) toggleBtn.click();
        }
    };

    return (
        <div className="mobile-menu">
            {/* Profile Section - Compact Card */}
            <div className="mobile-menu__profile-card">
                {isAuthenticated ? (
                    <Link to="/account" className="mobile-menu__profile-link">
                        <div className="mobile-menu__avatar">
                            <MdPerson />
                        </div>
                        <div className="mobile-menu__user-info">
                            <p className="mobile-menu__username">{user?.name || 'Пользователь'}</p>
                            <p className="mobile-menu__email">{user?.email}</p>
                        </div>
                        <div className="mobile-menu__profile-arrow">›</div>
                    </Link>
                ) : (
                    <div className="mobile-menu__auth-row">
                        <Link to="/login" className="mobile-menu__auth-btn mobile-menu__auth-btn--login">Войти</Link>
                        <Link to="/register" className="mobile-menu__auth-btn mobile-menu__auth-btn--register">Регистрация</Link>
                    </div>
                )}
            </div>

            <div className="mobile-menu__grid">
                {/* Navigation Links */}
                <div className="mobile-menu__card">
                    <ul className="mobile-menu__list">
                        <li><Link to="/about">О хоре</Link></li>
                        <li><Link to="/contacts">Контакты</Link></li>
                        <li><button className="mobile-menu__text-btn" onClick={handleChatClick}>Написать нам</button></li>
                        {isAuthenticated && user?.role === 'admin' && (
                            <li><Link to="/admin">Админ-панель</Link></li>
                        )}
                    </ul>
                </div>

                {/* Socials */}
                <div className="mobile-menu__card">
                    <div className="mobile-menu__socials">
                        <a href="https://vk.com/choirmephi" target="_blank" rel="noopener noreferrer"><FaVk /></a>
                        <a href="https://www.youtube.com/@MEPHIchoir" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
                        <a href="https://t.me/choirmephi" target="_blank" rel="noopener noreferrer"><FaTelegram /></a>
                        <a href="https://malechoirmephi.timepad.ru/events/" target="_blank" rel="noopener noreferrer"><FaRegCalendarAlt /></a>
                        <a href="https://mephi.ru/students/culture/choir/about" target="_blank" rel="noopener noreferrer"><IoEarth /></a>
                    </div>
                </div>

                {/* Contacts & Docs */}
                <div className="mobile-menu__card">
                    <ul className="mobile-menu__mini-list">
                        <li><a href="/oferta">Оферта</a></li>
                        <li><a href="/privacy">Конфиденциальность</a></li>
                        <li><a href="tel:+79163736934">+7 (916) 373-69-34</a></li>
                        <li><a href="mailto:choir.mephi.donate@gmail.com">choir.mephi.donate@gmail.com</a></li>
                    </ul>
                </div>

                {isAuthenticated && (
                    <button onClick={logout} className="mobile-menu__logout-btn">
                        <MdExitToApp /> Выйти
                    </button>
                )}
            </div>

            {/* Spacer for bottom navigation */}
            <div style={{ height: '70px' }}></div>
        </div>
    );
};

export default MobileMenuPage;
