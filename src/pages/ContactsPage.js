import React from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdAccessTime } from 'react-icons/md';

function ContactsPage() {
    return (
        <div className="container">
        <h1>Контактная информация</h1>
        <div className="contact-info-page" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="contact-details">
        <div className="contact-item">
        <MdEmail size={24} color="#d4af37" />
        <div>
        <h3>Email</h3>
        <p>choir@mephi.ru</p>
        </div>
        </div>
        <div className="contact-item">
        <MdPhone size={24} color="#d4af37" />
        <div>
        <h3>Телефон</h3>
        <p>+7 (495) 123-45-67</p>
        </div>
        </div>
        <div className="contact-item">
        <MdLocationOn size={24} color="#d4af37" />
        <div>
        <h3>Адрес</h3>
        <p>г. Москва, Каширское шоссе, 31</p>
        <p>Московский инженерно-физический институт</p>
        <p>Актовый зал, 3 этаж</p>
        </div>
        </div>
        <div className="contact-item">
        <MdAccessTime size={24} color="#d4af37" />
        <div>
        <h3>График работы</h3>
        <p>Понедельник-пятница: 10:00-18:00</p>
        <p>Суббота: 10:00-15:00</p>
        <p>Воскресенье: выходной</p>
        </div>
        </div>
        </div>
        <div className="contact-map">
        <div className="image-placeholder" style={{ height: '400px', backgroundColor: '#e0e0e0' }}>
        <p>Карта с расположением (здесь будет карта)</p>
        </div>
        </div>
        </div>

        <div className="contact-form-section" style={{ marginTop: '3rem' }}>
        <h2>Связаться с нами</h2>
        <form className="contact-form" style={{ maxWidth: '600px', margin: '1.5rem 0' }}>
        <div className="form-group">
        <label htmlFor="name">Ваше имя *</label>
        <input type="text" id="name" name="name" required />
        </div>
        <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input type="email" id="email" name="email" required />
        </div>
        <div className="form-group">
        <label htmlFor="message">Сообщение *</label>
        <textarea id="message" name="message" rows="5" required></textarea>
        </div>
        <button type="submit" className="btn primary">Отправить сообщение</button>
        </form>
        </div>
        </div>
    );
}

export default ContactsPage;
