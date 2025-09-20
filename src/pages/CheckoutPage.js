import React, { useState, useEffect, useCallback } from 'react';
import { MdArrowBack, MdOpenInNew, MdCheckCircle, MdAccessTime, MdArrowRight } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addDonationToHistory } from '../services/authService';
import { updateProductVariant } from '../services/productService';

function CheckoutPage({ cartItems, updateCart }) {
  const [step, setStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const { user, isAuthenticated, login: contextLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [donationId, setDonationId] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const progressClass = isAuthenticated
    ? step === 2
      ? 'active-step-2'
      : ''
    : step === 2
      ? 'active-step-2'
      : step === 3
        ? 'active-step-3'
        : '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    comment: '',
  });

  // Эффект для отслеживания изменений аутентификации
  useEffect(() => {
    if (!isCompleting && cartItems.length === 0) {
      navigate('/cart', { replace: true });
      return;
    }

    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));

      // Если пользователь аутентифицирован и находится на шаге 1, переключаемся на шаг 2
      if (step === 1) {
        setStep(2);
      }
    }
  }, [cartItems, navigate, isAuthenticated, user, isCompleting, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateContactForm = useCallback(() => {
    if (!formData.name || !formData.email) {
      setError('Имя и email обязательны для заполнения');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Некорректный формат email');
      return false;
    }
    return true;
  }, [formData.name, formData.email]);

  const handleNextStep = useCallback(() => {
    if (isProcessing) return;

    setIsProcessing(true);
    setError('');
    setSuccess('');

    setTimeout(() => {
      try {
        if (step === 1) {
          if (!validateContactForm()) {
            setIsProcessing(false);
            return;
          }
          setStep(2);
        } else if (step === 2) {
          setStep(3);
        }
      } finally {
        setTimeout(() => setIsProcessing(false), 100);
      }
    }, 10);
  }, [step, validateContactForm, isProcessing]);

  const handlePaymentRedirect = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setLoading(true);
    setError('');

    try {
      // Подготавливаем данные о товарах
      const itemsData = cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        variantId: item.variantId || null,
        sku: item.sku || null,
        size: item.size || null,
        color: item.color || null,
      }));

      // Подготавливаем данные для запроса
      const donationData = {
        amount: subtotal,
        payment_method: 'Онлайн-платеж',
        items: itemsData,
        comment: formData.comment || '',
        status: 'Ожидает проверки',
        contact: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
        },
      };

      // Добавляем userId или anonymousId
      if (isAuthenticated && user) {
        donationData.userId = user.id;
      } else {
        let anonymousId = localStorage.getItem('anonymousId');
        if (!anonymousId) {
          anonymousId = `anon-${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('anonymousId', anonymousId);
        }
        donationData.anonymousId = anonymousId;
      }

      // Отправляем данные на сервер
      const donation = await addDonationToHistory(donationData);
      setDonationId(donation.id);
      setPaymentInitiated(true);

      // Обновляем количество товаров на складе с обработкой ошибок
      for (const item of cartItems) {
        if (item.variantId) {
          try {
            await updateProductVariant(item.id, item.variantId, {
              quantity: item.quantity * -1, // уменьшаем количество
            });
          } catch (updateError) {
            console.error('Ошибка при обновлении варианта товара:', updateError);
            // Продолжаем выполнение, даже если не удалось обновить запас
          }
        }
      }

      // ОЧИСТКА КОРЗИНЫ ПОСЛЕ УСПЕШНОГО СОЗДАНИЯ ПОЖЕРТВОВАНИЯ
      updateCart([]);

      // Перенаправляем на оплату
      const paymentUrl = `https://endowment.mephi.ru/pay?edit[submitted][ya_rekomenduyu_popechitelskomu_sovetu_endaumenta_mifi_napravlyat]=Мужской хор&amount=${subtotal}&donation_id=${donation.id}`;
      window.open(paymentUrl, '_blank');
    } catch (err) {
      console.error('Ошибка при сохранении пожертвования:', err);
      setError(err.message || 'Не удалось сохранить данные пожертвования. Пожалуйста, свяжитесь с нами.');
    } finally {
      setLoading(false);
      setTimeout(() => setIsProcessing(false), 100);
    }
  }, [subtotal, cartItems, formData, isProcessing, isAuthenticated, user, updateCart]); // Добавляем updateCart в зависимости

  const handlePrevStep = useCallback(() => {
    if (isProcessing) return;

    setIsProcessing(true);
    setError('');

    setTimeout(() => {
      if (step > 1) setStep(step - 1);
      setTimeout(() => setIsProcessing(false), 100);
    }, 10);
  }, [step, isProcessing]);

  const handleViewHistory = useCallback(() => {
    if (isProcessing) return;

    setIsProcessing(true);
    setIsCompleting(true);
    // Убираем очистку корзины, так как она уже очищена после создания пожертвования
    // updateCart([]);

    if (isAuthenticated) {
      navigate('/account?tab=donations', { replace: true });
    } else {
      localStorage.setItem('postLoginRedirect', encodeURIComponent('/account?tab=donations'));
      setShowLoginModal(true);
    }

    setTimeout(() => setIsProcessing(false), 100);
  }, [isAuthenticated, navigate, isProcessing]); // Убираем updateCart из зависимостей

  const stepsClass = isAuthenticated ? 'two-steps' : 'three-steps';

  // Обработчик для входа через модальное окно
  const handleLoginSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isProcessing) return;

      setLoginError('');
      setIsProcessing(true);

      try {
        const email = e.target.email.value;
        const password = e.target.password.value;

        await contextLogin({ email, password });
        setShowLoginModal(false);

        const redirectPath = localStorage.getItem('postLoginRedirect') || '/account?tab=donations';
        localStorage.removeItem('postLoginRedirect');
        navigate(decodeURIComponent(redirectPath), { replace: true });
      } catch (err) {
        console.error('Ошибка при входе:', err);
        setLoginError('Неверный email или пароль');
      } finally {
        setTimeout(() => setIsProcessing(false), 100);
      }
    },
    [contextLogin, navigate, isProcessing]
  );

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Оформление пожертвования</h1>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <div className={`checkout-steps ${stepsClass} ${progressClass}`}>
          {!isAuthenticated && (
            <div className={`checkout-step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
              <div className="checkout-step-number">1</div>
              <div className="checkout-step-title">Контакты</div>
            </div>
          )}

          <div className={`checkout-step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
            <div className="checkout-step-number">{isAuthenticated ? 1 : 2}</div>
            <div className="checkout-step-title">Подтверждение</div>
          </div>

          <div className={`checkout-step ${step === 3 ? 'active' : ''}`}>
            <div className="checkout-step-number">{isAuthenticated ? 2 : 3}</div>
            <div className="checkout-step-title">Оплата</div>
          </div>
        </div>

        <div className="step-content">
          {step === 1 && !isAuthenticated && (
            <div className="step-contacts">
              <h2>Ваши контактные данные</h2>
              <p className="step-description">Пожалуйста, заполните форму ниже, чтобы мы могли связаться с вами.</p>

              <div className="form-group">
                <label htmlFor="name">ФИО *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Иванов Иван Иванович"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="example@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Телефон</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (XXX) XXX-XX-XX"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-confirmation">
              <h2>Подтверждение пожертвования</h2>
              <p className="step-description">Пожалуйста, проверьте данные перед оплатой.</p>

              <div className="order-summary-card">
                <h3>Ваш заказ</h3>
                <div className="order-items">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.variantId || 'no-variant'}`} className="order-item">
                      <div className="item-details">
                        <span className="item-name">
                          {item.name}
                          <span className="item-quantity-checkout"> × {item.quantity}</span>
                        </span>
                        {item.variantId && (
                          <div className="item-variant">
                            {item.size && `Размер: ${item.size}`}
                            {item.color && (item.size ? `, Цвет: ${item.color}` : `Цвет: ${item.color}`)}
                          </div>
                        )}
                      </div>
                      <span className="item-price">{item.price * item.quantity} ₽</span>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <span className="total-label">Итого:</span>
                  <span className="total-amount">{subtotal} ₽</span>
                </div>
              </div>

              <div className="contact-info-card">
                <h3>Контактная информация</h3>
                <div className="contact-details">
                  <div className="contact-row">
                    <span className="contact-label">ФИО:</span>
                    <span className="contact-value">{formData.name}</span>
                  </div>
                  <div className="contact-row">
                    <span className="contact-label">Email:</span>
                    <span className="contact-value">{formData.email}</span>
                  </div>
                  {formData.phone && (
                    <div className="contact-row">
                      <span className="contact-label">Телефон:</span>
                      <span className="contact-value">{formData.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="comment-section">
                <div className="form-group">
                  <label htmlFor="comment">Комментарий</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Ваш комментарий к пожертвованию..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-payment">
              {paymentInitiated ? (
                <div className="payment-confirmation">
                  <div className="confirmation-header">
                    <MdCheckCircle className="confirmation-icon" />
                    <h2>Оплата инициирована</h2>
                  </div>

                  <div className="confirmation-content">
                    <div className="donation-id-section">
                      <span className="id-label">Номер пожертвования:</span>
                      <span className="id-value">{donationId}</span>
                    </div>

                    <div className="status-section">
                      <div className="status-badge pending">
                        <MdAccessTime className="status-icon" />
                        <span>Ожидает проверки</span>
                      </div>
                      <p className="status-description">
                        После завершения оплаты ожидайте проверки вашего пожертвования администраторами.
                      </p>
                      <p className="status-additional-info">
                        Для проверки статуса пожертвования перейдите в личный кабинет.
                      </p>
                    </div>

                    <div className="confirmation-instructions">
                      <h3>Что дальше?</h3>
                      <ol>
                        <li>Завершите оплату на сайте эндаунмента МИФИ</li>
                        <li>Администраторы проверят ваше пожертвование в течение 1-2 рабочих дней</li>
                        <li>Статус вашего пожертвования обновится в личном кабинете</li>
                      </ol>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="payment-options">
                  <div className="payment-header">
                    <h2>Оплата пожертвования</h2>
                    <div className="payment-amount">
                      <span className="amount-label">Сумма к оплате:</span>
                      <span className="amount-value">{subtotal} ₽</span>
                    </div>
                  </div>

                  <div className="payment-methods">
                    <div className="payment-method-card">
                      <div className="method-header">
                        <h3>Безопасная оплата через эндаунмент МИФИ</h3>
                        <p className="method-description">Перейдите на сайт эндаунмента МИФИ для завершения оплаты</p>
                      </div>

                      <div className="method-features">
                        <div className="feature">
                          <MdCheckCircle className="feature-icon" />
                          <span>Безопасные платежи</span>
                        </div>
                        <div className="feature">
                          <MdCheckCircle className="feature-icon" />
                          <span>Поддержка 24/7</span>
                        </div>
                        <div className="feature">
                          <MdCheckCircle className="feature-icon" />
                          <span>Официальная квитанция</span>
                        </div>
                      </div>

                      <button
                        className="btn primary btn-size-payment"
                        onClick={handlePaymentRedirect}
                        disabled={loading || isProcessing}
                      >
                        {loading ? (
                          'Подготовка...'
                        ) : (
                          <>
                            <MdOpenInNew /> Перейти к оплате
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="payment-note">
                    <div className="note-header">
                      <h3>Информация об оплате</h3>
                    </div>
                    <div className="note-content">
                      <p>После нажатия кнопки:</p>
                      <ol>
                        <li>Откроется новая вкладка с сайтом эндаунмента МИФИ</li>
                        <li>Вы сможете завершить процесс оплаты</li>
                        <li>После оплаты ожидайте проверки администратором</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="step-actions">
          {step > 1 && step < 3 && !(isAuthenticated && step === 2) && (
            <button className="btn secondary btn-size-md" onClick={handlePrevStep} disabled={loading || isProcessing}>
              <MdArrowBack /> Назад
            </button>
          )}

          {step < 3 ? (
            <button className="btn primary btn-size-md" onClick={handleNextStep} disabled={loading || isProcessing}>
              {step === 1 ? 'Продолжить' : 'Перейти к оплате'}
            </button>
          ) : !paymentInitiated ? (
            <button className="btn secondary btn-size-md" onClick={handlePrevStep} disabled={loading || isProcessing}>
              <MdArrowBack /> Вернуться к подтверждению
            </button>
          ) : (
            <button className="btn primary btn-size-md" onClick={handleViewHistory} disabled={isProcessing}>
              Перейти в историю пожертвований <MdArrowRight />
            </button>
          )}
        </div>
      </div>

      {showLoginModal && (
        <div className="login-modal-overlay" onClick={() => !isProcessing && setShowLoginModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Вход в аккаунт</h3>
            <div className="login-form">
              <form onSubmit={handleLoginSubmit}>
                {loginError && <div className="alert error">{loginError}</div>}
                <div className="form-group">
                  <label htmlFor="modal-email">Email</label>
                  <input type="email" id="modal-email" name="email" required autoFocus disabled={isProcessing} />
                </div>
                <div className="form-group">
                  <label htmlFor="modal-password">Пароль</label>
                  <input type="password" id="modal-password" name="password" required disabled={isProcessing} />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="modal-primary-btn" disabled={isProcessing}>
                    {isProcessing ? 'Вход...' : 'Войти'}
                  </button>
                  <button
                    type="button"
                    className="modal-secondary-btn"
                    onClick={() => !isProcessing && navigate('/register')}
                    disabled={isProcessing}
                  >
                    Зарегистрироваться
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
