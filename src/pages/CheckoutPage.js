import React, { useState } from 'react';
import { MdArrowBack, MdArrowForward, MdCheckCircle } from 'react-icons/md';
import { Link } from 'react-router-dom';

function CheckoutPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        comment: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
    };

        const prevStep = () => {
            if (step > 1) setStep(step - 1);
        };

            return (
                <div className="checkout-page">
                <h1>Оформление пожертвования</h1>

                <div className="checkout-steps">
                <div className={`step ${step === 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-title">Контакты</div>
                </div>
                <div className={`step ${step === 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-title">Подтверждение</div>
                </div>
                <div className={`step ${step === 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-title">Оплата</div>
                </div>
                </div>

                <div className="step-content">
                {step === 1 && (
                    <div className="contact-form">
                    <div className="form-group">
                    <label htmlFor="name">ФИО *</label>
                    <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    />
                    </div>

                    <div className="form-row">
                    <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="phone">Телефон *</label>
                    <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    />
                    </div>
                    </div>

                    <div className="form-group">
                    <label htmlFor="comment">Комментарий (необязательно)</label>
                    <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows="4"
                    ></textarea>
                    </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="confirmation">
                    <div className="summary-box">
                    <h3>Ваши данные</h3>
                    <p><strong>ФИО:</strong> {formData.name}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Телефон:</strong> {formData.phone}</p>
                    {formData.comment && <p><strong>Комментарий:</strong> {formData.comment}</p>}
                    </div>

                    <div className="donation-note">
                    <h3>Важная информация</h3>
                    <p>Пожертвование осуществляется в фонд поддержки мужского академического хора МИФИ. Выбранные вами сувениры будут переданы вам как благодарность за вашу поддержку.</p>
                    <p>После подтверждения вы получите реквизиты для перевода пожертвования и инструкции по получению вознаграждения.</p>
                    </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="payment-instructions">
                    <div className="success-icon">
                    <MdCheckCircle />
                    </div>
                    <h2>Пожертвование успешно оформлено!</h2>

                    <div className="instructions">
                    <h3>Инструкция по оплате:</h3>
                    <ol>
                    <li>Откройте приложение вашего банка для перевода средств</li>
                    <li>Используйте следующие реквизиты:</li>
                    </ol>

                    <div className="payment-details">
                    <p><strong>Получатель:</strong> Фонд поддержки хора МИФИ</p>
                    <p><strong>ИНН:</strong> 1234567890</p>
                    <p><strong>КПП:</strong> 987654321</p>
                    <p><strong>Расчетный счет:</strong> 40702810500000012345</p>
                    <p><strong>Банк:</strong> ПАО Сбербанк</p>
                    <p><strong>БИК:</strong> 044525225</p>
                    <p><strong>Корр. счет:</strong> 30101810400000000225</p>
                    </div>

                    <p className="note">После перевода средств свяжитесь с нами по телефону +7 (495) 123-45-67 или email choir@mephi.ru для уточнения деталей получения вознаграждения.</p>
                    </div>
                    </div>
                )}
                </div>

                <div className="step-actions">
                {step > 1 && step < 3 && (
                    <button className="btn secondary" onClick={prevStep}>
                    <MdArrowBack /> Назад
                    </button>
                )}

                {step < 3 ? (
                    <button className="btn primary" onClick={nextStep}>
                    {step === 1 ? 'Продолжить' : 'Подтвердить пожертвование'} <MdArrowForward />
                    </button>
                ) : (
                    <Link to="/" className="btn primary">
                    Вернуться на главную
                    </Link>
                )}
                </div>
                </div>
            );
}

export default CheckoutPage;
