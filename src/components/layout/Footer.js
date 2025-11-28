import React from 'react';
import { Link } from 'react-router-dom';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { FaVk, FaYoutube, FaTelegram, FaRegCalendarAlt } from 'react-icons/fa';
import { IoEarth } from 'react-icons/io5';
import choirLogo from '../../assets/images/logo.jpg';
import mephi_logo from '../../assets/images/mephi_logo.jpg';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main">
        {/* Логотип и информация */}
        <div className="footer__column">
          <div className="footer__logo-container">
            <img
              src={choirLogo}
              alt="Логотип Хора МИФИ"
              className="footer__logo-img"
            />
            <div className="footer__logo-text">
              <h2>Хор МИФИ</h2>
              <p>Академический мужской хор</p>
            </div>
          </div>

          <p className="footer__notice">
            Официальный проект при поддержке фонда хора МИФИ
          </p>

          <div className="footer__mephi-logo">
            <img
              src={mephi_logo}
              alt="Логотип МИФИ"
              className="footer__mephi-img"
            />
            <span className="footer__mephi-text">
              Московский инженерно-физический институт
            </span>
          </div>
        </div>

        {/* Контакты */}
        <div className="footer__column">
          <h3>Контакты</h3>
          <ul className="footer__contact-list">
            <li>
              <MdEmail />
              <span>choir.mephi.donate@gmail.com</span>
            </li>
            <li>
              <MdPhone />
              <span>+7 (918) 660-44-26</span>
            </li>
            <li>
              <MdLocationOn />
              <span>г. Москва, Каширское шоссе, 64, корп. 1А</span>
            </li>
          </ul>
        </div>

        {/* Меню */}
        <div className="footer__column">
          <h3>Меню</h3>
          <ul className="footer__links">
            {['Главная', 'Магазин', 'О хоре', 'Контакты', 'Личный кабинет'].map((item, index) => (
              <li key={index}>
                <Link to={item === 'Главная' ? '/' : `/${item.toLowerCase()}`}>
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Соцсети и документы */}
        <div className="footer__column">
          <h3>Мы в соцсетях</h3>
          <div className="footer__social">
            {[
              { icon: <FaVk />, url: 'https://vk.com/choirmephi', label: 'VK' },
              { icon: <FaYoutube />, url: 'https://www.youtube.com/@MEPHIchoir', label: 'YouTube' },
              { icon: <FaTelegram />, url: 'https://t.me/choirmephi', label: 'Telegram' },
              {
                icon: <FaRegCalendarAlt />,
                url: 'https://malechoirmephi.timepad.ru/events/',
                label: 'Timepad',
              },
              {
                icon: <IoEarth />,
                url: 'https://mephi.ru/students/culture/choir/about',
                label: 'Сайт МИФИ',
              },
            ].map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
              >
                <span className="footer__social-icon-wrapper">
                  {social.icon}
                </span>
                {social.label}
              </a>
            ))}
          </div>

          <h3>Документы</h3>
          <ul className="footer__links">
            <li>
              <a href="/oferta">Оферта</a>
            </li>
            <li>
              <a href="/privacy">Политика конфиденциальности</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} Мужской академический хор МИФИ. Все права защищены.</p>
      </div>
    </footer>
  );
}

export default Footer;
