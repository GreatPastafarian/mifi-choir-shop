import React, { useState } from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdAccessTime, MdCheckCircle } from 'react-icons/md';
import YandexMap from '../components/YandexMap';

function ContactsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus({ type: 'error', message: 'Все поля обязательны для заполнения' });
      return;
    }

    if (!validateEmail(formData.email)) {
      setSubmitStatus({ type: 'error', message: 'Некорректный формат email' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.',
        });
        setFormData({ name: '', email: '', message: '' });

        setTimeout(() => {
          setSubmitStatus(null);
        }, 5000);
      } else {
        throw new Error(result.message || 'Ошибка при отправке');
      }
    } catch (err) {
      setSubmitStatus({
        type: 'error',
        message: err.message || 'Ошибка при отправке сообщения. Пожалуйста, попробуйте позже.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contacts-page">
    <div className="container">
    <h1 className="contacts-page__title">Контактная информация</h1>

    <div className="contacts-page__content">
    {/* Левая колонка: Детали */}
    <div className="contacts-details">
    <div className="contacts-details__item">
    <MdEmail className="contacts-details__icon" />
    <div>
    <h3 className="contacts-details__label">Email</h3>
    <p className="contacts-details__value">choir.mephi.donate@gmail.com</p>
    </div>
    </div>

    <div className="contacts-details__item">
    <MdPhone className="contacts-details__icon" />
    <div>
    <h3 className="contacts-details__label">Телефон</h3>
    <p className="contacts-details__value">+7 (918) 660-44-26</p>
    </div>
    </div>

    <div className="contacts-details__item">
    <MdLocationOn className="contacts-details__icon" />
    <div>
    <h3 className="contacts-details__label">Адрес</h3>
    <p className="contacts-details__value">г. Москва, Каширское шоссе, 64, корп. 1А</p>
    <p className="contacts-details__subvalue">«Национальный исследовательский ядерный университет МИФИ, учебно-лабораторный корпус»</p>
    <p className="contacts-details__subvalue">Актовый зал, 5 этаж</p>
    </div>
    </div>

    <div className="contacts-details__item">
    <MdAccessTime className="contacts-details__icon" />
    <div>
    <h3 className="contacts-details__label">График репетиций</h3>
    <p className="contacts-details__value">Понедельник, четверг: 17:00-22:00</p>
    </div>
    </div>
    </div>

    {/* Правая колонка: Карта */}
    <div className="contacts-map">
    <YandexMap />
    </div>
    </div>

    {/* Форма обратной связи */}
    <div className="contacts-form-section">
    <h2 className="contacts-form-section__title">Связаться с нами</h2>

    {submitStatus && (
      <div className={`contacts-alert contacts-alert--${submitStatus.type}`}>
      {submitStatus.type === 'success' && <MdCheckCircle className="contacts-alert__icon" />}
      {submitStatus.message}
      </div>
    )}

    <form className="contacts-form" onSubmit={handleSubmit}>
    <div className="contacts-form__group">
    <label htmlFor="name" className="contacts-form__label">Ваше имя *</label>
    <input
    type="text"
    id="name"
    name="name"
    className="contacts-form__input"
    value={formData.name}
    onChange={handleChange}
    required
    />
    </div>

    <div className="contacts-form__group">
    <label htmlFor="email" className="contacts-form__label">Email *</label>
    <input
    type="email"
    id="email"
    name="email"
    className="contacts-form__input"
    value={formData.email}
    onChange={handleChange}
    required
    />
    </div>

    <div className="contacts-form__group">
    <label htmlFor="message" className="contacts-form__label">Сообщение *</label>
    <textarea
    id="message"
    name="message"
    className="contacts-form__textarea"
    value={formData.message}
    onChange={handleChange}
    rows="5"
    required
    ></textarea>
    </div>

    <button
    type="submit"
    className="btn primary contacts-form__btn"
    disabled={isSubmitting}
    >
    {isSubmitting ? (
      <span className="contacts-form__loading">
      <span className="spinner"></span> Отправка...
      </span>
    ) : (
      'Отправить сообщение'
    )}
    </button>
    </form>
    </div>
    </div>
    </div>
  );
}

export default ContactsPage;
