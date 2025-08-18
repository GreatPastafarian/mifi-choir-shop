import React from 'react';
import { Link } from 'react-router-dom';
import {
    MdEmail,
    MdPhone,
    MdLocationOn
} from 'react-icons/md';
import { FaVk, FaYoutube, FaTelegram } from 'react-icons/fa';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { IoEarth } from 'react-icons/io5';
import choirLogo from '../../assets/images/logo.jpg';
import mephi_logo from '../../assets/images/mephi_logo.jpg';

function Footer() {
    return (
        <footer className="footer" style={{
            backgroundColor: '#0a2240',
            color: '#fff',
            padding: '3rem 1rem',
            fontFamily: "'Montserrat', sans-serif"
        }}>
        <div className="footer-main" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem'
        }}>
        {/* Логотип и информация */}
        <div className="footer-column" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
        <div className="logo-footer" style={{ display: 'flex', alignItems: 'center' }}>
        <img
        src={choirLogo}
        alt="Логотип Хора МИФИ"
        style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: '2px solid #d4af37',
            marginRight: '1rem'
        }}
        />
        <div>
        <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#d4af37',
            marginBottom: '0.25rem'
        }}>
        Хор МИФИ
        </h2>
        <p style={{
            fontSize: '0.9rem',
            color: '#f0f0f0',
            maxWidth: '200px'
        }}>
        Академический мужской хор
        </p>
        </div>
        </div>

        <p className="footer-notice" style={{
            fontSize: '0.85rem',
            color: '#c0c0c0',
            lineHeight: '1.5'
        }}>
        Официальный проект при поддержке фонда хора МИФИ
        </p>

        <div className="mephi-logo" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1rem'
        }}>
        <img
        src={mephi_logo}
        alt="Логотип МИФИ"
        style={{
            width: '50px',
            height: '50px',
        }}
        />
        <span style={{
            fontSize: '0.9rem',
            fontWeight: '500',
            color: '#f0f0f0'
        }}>
        Московский инженерно-физический институт
        </span>
        </div>
        </div>

        {/* Контакты */}
        <div className="footer-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#d4af37',
            marginBottom: '0.5rem',
            borderBottom: '1px solid #8d1f2c',
            paddingBottom: '0.5rem'
        }}>
        Контакты
        </h3>
        <ul className="contact-info" style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <MdEmail style={{ color: '#d4af37', fontSize: '1.25rem' }} />
        <span>choir.mephi.donate@gmail.com</span>
        </li>
        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <MdPhone style={{ color: '#d4af37', fontSize: '1.25rem' }} />
        <span>+7 (916) 373-69-34</span>
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <MdLocationOn style={{ color: '#d4af37', fontSize: '1.25rem', marginTop: '0.25rem' }} />
        <span>г. Москва, Каширское шоссе, 64, корп. 1А</span>
        </li>
        </ul>
        </div>

        {/* Меню */}
        <div className="footer-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#d4af37',
            marginBottom: '0.5rem',
            borderBottom: '1px solid #8d1f2c',
            paddingBottom: '0.5rem'
        }}>
        Меню
        </h3>
        <ul className="footer-links" style={{ listStyle: 'none', padding: 0 }}>
        {['Главная', 'Магазин', 'О хоре', 'Контакты', 'Личный кабинет'].map((item, index) => (
            <li key={index} style={{ marginBottom: '0.75rem' }}>
            <Link
            to={item === 'Главная' ? '/' : `/${item.toLowerCase()}`}
            style={{
                color: '#f0f0f0',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.95rem'
            }}
            >
            {item}
            </Link>
            </li>
        ))}
        </ul>
        </div>

        {/* Соцсети и документы */}
        <div className="footer-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#d4af37',
            marginBottom: '0.5rem',
            borderBottom: '1px solid #8d1f2c',
            paddingBottom: '0.5rem'
        }}>
        Мы в соцсетях
        </h3>
        <div className="social-links" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.5rem'
        }}>
        {[
            { icon: <FaVk />, url: 'https://vk.com/choirmephi', label: 'VK' },
            { icon: <FaYoutube />, url: 'https://www.youtube.com/@MEPHIchoir', label: 'YouTube' },
            { icon: <FaTelegram />, url: 'https://t.me/choirmephi', label: 'Telegram' },
            { icon: <FaRegCalendarAlt />, url: 'https://malechoirmephi.timepad.ru/events/', label: 'Timepad' },
            { icon: <IoEarth />, url: 'https://mephi.ru/students/culture/choir/about', label: 'Сайт МИФИ' }
        ].map((social, index) => (
            <a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '50px',
                                  color: '#fff',
                                  textDecoration: 'none',
                                  transition: 'all 0.3s ease',
                                  fontSize: '0.9rem'
            }}
            >
            <span style={{
                backgroundColor: '#8d1f2c',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
            {social.icon}
            </span>
            {social.label}
            </a>
        ))}
        </div>

        <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#d4af37',
            marginBottom: '0.5rem',
            borderBottom: '1px solid #8d1f2c',
            paddingBottom: '0.5rem'
        }}>
        Документы
        </h3>
        <ul className="footer-links" style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: '0.75rem' }}>
        <a
        href="/oferta"
        style={{
            color: '#f0f0f0',
            textDecoration: 'none',
            transition: 'color 0.3s ease',
            fontSize: '0.95rem'
        }}
        >
        Оферта
        </a>
        </li>
        <li>
        <a
        href="/privacy"
        style={{
            color: '#f0f0f0',
            textDecoration: 'none',
            transition: 'color 0.3s ease',
            fontSize: '0.95rem'
        }}
        >
        Политика конфиденциальности
        </a>
        </li>
        </ul>
        </div>
        </div>

        <div className="footer-bottom" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem 1rem 0',
            textAlign: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '3rem'
        }}>
        <p style={{
            color: '#c0c0c0',
            fontSize: '0.9rem',
            margin: 0
        }}>
        © {new Date().getFullYear()} Мужской академический хор МИФИ. Все права защищены.
        </p>
        </div>
        </footer>
    );
}

export default Footer;
