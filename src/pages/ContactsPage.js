import React, { useState } from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdAccessTime, MdCheckCircle } from 'react-icons/md';
import YandexMap from '../components/YandexMap'; // Добавьте этот импорт

function ContactsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitStatus(null); // Сбросить статус при изменении формы
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация
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

        // Автоматический сброс сообщения об успехе через 5 секунд
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
    <div className="container">
      <h1>Контактная информация</h1>

      <div
        className="contact-info-page"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginTop: '2rem',
        }}
      >
        <div className="contact-details">
          <div
            className="contact-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <MdEmail size={24} color="#d4af37" style={{ marginRight: '1rem' }} />
            <div>
              <h3>Email</h3>
              <p>choir.mephi.donate@gmail.com</p>
            </div>
          </div>

          <div
            className="contact-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <MdPhone size={24} color="#d4af37" style={{ marginRight: '1rem' }} />
            <div>
              <h3>Телефон</h3>
              <p>+7 (916) 373-69-34</p>
            </div>
          </div>

          <div
            className="contact-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <MdLocationOn size={24} color="#d4af37" style={{ marginRight: '1rem' }} />
            <div>
              <h3>Адрес</h3>
              <p>г. Москва, Каширское шоссе, 64, корп. 1А</p>
              <p>«Национальный исследовательский ядерный университет МИФИ, учебно-лабораторный корпус»</p>
              <p>Актовый зал, 5 этаж</p>
            </div>
          </div>

          <div
            className="contact-item"
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <MdAccessTime size={24} color="#d4af37" style={{ marginRight: '1rem' }} />
            <div>
              <h3>График репетиций</h3>
              <p>Понедельник, четверг: 17:00-22:00</p>
            </div>
          </div>
        </div>

        <div
          className="contact-map"
          style={{
            height: '400px',
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <YandexMap />
        </div>
      </div>

      <div className="contact-form-section" style={{ marginTop: '3rem' }}>
        <h2>Связаться с нами</h2>

        {submitStatus && (
          <div
            style={{
              backgroundColor: submitStatus.type === 'success' ? '#e8f5e9' : '#ffebee',
              color: submitStatus.type === 'success' ? '#388e3c' : '#d32f2f',
              padding: '1rem',
              borderRadius: '4px',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {submitStatus.type === 'success' && <MdCheckCircle style={{ marginRight: '0.5rem' }} />}
            {submitStatus.message}
          </div>
        )}

        <form
          className="contact-form"
          style={{
            maxWidth: '600px',
            margin: '1.5rem 0',
          }}
          onSubmit={handleSubmit}
        >
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="name"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
              }}
            >
              Ваше имя *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'Open Sans, sans-serif',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
              }}
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'Open Sans, sans-serif',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="message"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
              }}
            >
              Сообщение *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'Open Sans, sans-serif',
                resize: 'vertical',
              }}
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn primary"
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? '0.7' : '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem' }}>Отправка...</span>
                <span
                  className="spinner"
                  style={{
                    border: '2px solid #ffffff',
                    borderTop: '2px solid #d4af37',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    animation: 'spin 1s linear infinite',
                  }}
                ></span>
              </span>
            ) : (
              'Отправить сообщение'
            )}
          </button>
        </form>
      </div>

      <style>
        {`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            `}
      </style>
    </div>
  );
}

export default ContactsPage;
