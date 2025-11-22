import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserAddresses, createAddress, deleteAddress } from '../services/addressService';
import { createDonation } from '../services/authService'; // Предполагаем, что создание заказа там
import YandexMap from '../components/YandexMap'; // Ваш компонент карты
import '../styles/pages/checkout.css';

// Иконки
import { MdLocalShipping, MdStorefront, MdAdd, MdDeleteOutline, MdCheckCircle } from 'react-icons/md';

const PICKUP_POINTS = [
  { id: 1, name: 'Хоровая комната МИФИ', address: 'Москва, Каширское шоссе, 31, Г-014', coordinates: [55.649, 37.664] }
];

function CheckoutPage({ cartItems = [], clearCart }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // --- Состояния ---
  const [step, setStep] = useState(1); // 1: Контакты, 2: Доставка, 3: Подтверждение
  const [loading, setLoading] = useState(false);

  // Контакты
  const [contactInfo, setContactInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Доставка
  const [deliveryType, setDeliveryType] = useState('pickup'); // 'pickup' | 'delivery'
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState(PICKUP_POINTS[0].id);

  // Форма нового адреса
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    city: 'Москва', street: '', building: '', flat: '', zip_code: '', title: ''
  });

  // Итоговая сумма
  const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.price || item.base_price) * item.quantity), 0);

  // Загрузка адресов
  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    }
  }, [isAuthenticated]);

  const loadAddresses = async () => {
    try {
      const data = await getUserAddresses();
      setSavedAddresses(data);
      if (data.length > 0) setSelectedAddressId(data[0].id);
    } catch (err) {
      console.error('Не удалось загрузить адреса', err);
    }
  };

  // --- Обработчики ---

  const handleContactChange = (e) => {
    setContactInfo({ ...contactInfo, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async () => {
    if (!newAddress.city || !newAddress.street || !newAddress.building) {
      alert('Заполните обязательные поля (Город, Улица, Дом)');
      return;
    }
    try {
      setLoading(true);
      const saved = await createAddress(newAddress);
      setSavedAddresses([saved, ...savedAddresses]);
      setSelectedAddressId(saved.id);
      setIsAddingAddress(false);
      setNewAddress({ city: 'Москва', street: '', building: '', flat: '', zip_code: '', title: '' });
    } catch (err) {
      alert('Ошибка сохранения адреса');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Удалить этот адрес?')) {
      try {
        await deleteAddress(id);
        const updated = savedAddresses.filter(a => a.id !== id);
        setSavedAddresses(updated);
        if (selectedAddressId === id && updated.length > 0) setSelectedAddressId(updated[0].id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    // Формируем данные доставки
    let deliveryInfo = {};
    if (deliveryType === 'pickup') {
      const point = PICKUP_POINTS.find(p => p.id === selectedPickupPoint);
      deliveryInfo = { type: 'pickup', point };
    } else {
      if (isAuthenticated && !isAddingAddress) {
        const addr = savedAddresses.find(a => a.id === selectedAddressId);
        if (!addr) { alert('Выберите адрес доставки'); setLoading(false); return; }
        deliveryInfo = { type: 'delivery', address: addr };
      } else {
        // Для гостя или если вводим адрес вручную
        if (!newAddress.street) { alert('Введите адрес доставки'); setLoading(false); return; }
        deliveryInfo = { type: 'delivery', address: newAddress };
      }
    }

    const orderData = {
      amount: totalAmount,
      items: cartItems,
      contact: contactInfo,
      delivery_type: deliveryType,
      delivery_info: deliveryInfo,
    };

    try {
      // Здесь вызов API создания заказа (нужно реализовать в authService или donationService)
      // const result = await createDonation(orderData);
      console.log('Заказ отправлен:', orderData);

      // Имитация успеха
      setTimeout(() => {
        clearCart();
        navigate('/profile'); // Или на страницу успеха
      }, 1000);
    } catch (err) {
      alert('Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return <div className="checkout-page__empty">Корзина пуста</div>;
  }

  return (
    <div className="checkout-page">
    <div className="checkout-page__container">
    <h1 className="checkout-page__title">Оформление пожертвования</h1>

    {/* Прогресс бар */}
    <div className={`checkout-steps checkout-steps--step-${step}`}>
    <div className={`checkout-step ${step >= 1 ? 'checkout-step--active' : ''}`} onClick={() => setStep(1)}>
    <div className="checkout-step__number">1</div>
    <div className="checkout-step__label">Контакты</div>
    </div>
    <div className={`checkout-step ${step >= 2 ? 'checkout-step--active' : ''}`} onClick={() => step > 1 && setStep(2)}>
    <div className="checkout-step__number">2</div>
    <div className="checkout-step__label">Получение</div>
    </div>
    <div className={`checkout-step ${step >= 3 ? 'checkout-step--active' : ''}`}>
    <div className="checkout-step__number">3</div>
    <div className="checkout-step__label">Подтверждение</div>
    </div>
    </div>

    <div className="checkout-page__content">
    {/* ШАГ 1: КОНТАКТЫ */}
    {step === 1 && (
      <div className="checkout-section">
      <h2 className="checkout-section__title">Контактные данные</h2>
      <div className="form-group">
      <label className="form-group__label">Ваше имя</label>
      <input
      type="text" name="name" className="form-group__input"
      value={contactInfo.name} onChange={handleContactChange}
      />
      </div>
      <div className="form-group">
      <label className="form-group__label">Email</label>
      <input
      type="email" name="email" className="form-group__input"
      value={contactInfo.email} onChange={handleContactChange}
      />
      </div>
      <div className="form-group">
      <label className="form-group__label">Телефон</label>
      <input
      type="tel" name="phone" className="form-group__input"
      value={contactInfo.phone} onChange={handleContactChange}
      />
      </div>
      <button className="btn primary checkout-page__next-btn" onClick={() => setStep(2)}>
      Далее к доставке
      </button>
      </div>
    )}

    {/* ШАГ 2: ДОСТАВКА */}
    {step === 2 && (
      <div className="checkout-section">
      <h2 className="checkout-section__title">Способ получения</h2>

      {/* Табы переключения */}
      <div className="delivery-tabs">
      <button
      className={`delivery-tabs__btn ${deliveryType === 'pickup' ? 'active' : ''}`}
      onClick={() => setDeliveryType('pickup')}
      >
      <MdStorefront /> Самовывоз
      </button>
      <button
      className={`delivery-tabs__btn ${deliveryType === 'delivery' ? 'active' : ''}`}
      onClick={() => setDeliveryType('delivery')}
      >
      <MdLocalShipping /> Доставка
      </button>
      </div>

      {/* Контент Самовывоза */}
      {deliveryType === 'pickup' && (
        <div className="delivery-content">
        <p className="delivery-content__hint">Выберите пункт выдачи на карте или из списка:</p>
        <div className="pickup-points">
        {PICKUP_POINTS.map(point => (
          <div
          key={point.id}
          className={`pickup-card ${selectedPickupPoint === point.id ? 'selected' : ''}`}
          onClick={() => setSelectedPickupPoint(point.id)}
          >
          <div className="pickup-card__radio">
          <div className="radio-circle"></div>
          </div>
          <div className="pickup-card__info">
          <div className="pickup-card__name">{point.name}</div>
          <div className="pickup-card__address">{point.address}</div>
          </div>
          </div>
        ))}
        </div>
        <div className="delivery-map-wrapper">
        <YandexMap /> {/* Здесь должна быть ваша карта */}
        </div>
        </div>
      )}

      {/* Контент Доставки */}
      {deliveryType === 'delivery' && (
        <div className="delivery-content">
        {isAuthenticated && savedAddresses.length > 0 && !isAddingAddress ? (
          <div className="saved-addresses">
          <p className="delivery-content__hint">Выберите сохраненный адрес:</p>
          {savedAddresses.map(addr => (
            <div
            key={addr.id}
            className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
            onClick={() => setSelectedAddressId(addr.id)}
            >
            <div className="address-card__header">
            <span className="address-card__title">{addr.title || 'Адрес'}</span>
            <button className="address-card__delete" onClick={(e) => handleDeleteAddress(e, addr.id)}>
            <MdDeleteOutline />
            </button>
            </div>
            <div className="address-card__text">
            {addr.city}, {addr.street}, д. {addr.building}
            {addr.flat && `, кв. ${addr.flat}`}
            </div>
            </div>
          ))}
          <button className="btn secondary btn--full-width" onClick={() => setIsAddingAddress(true)}>
          <MdAdd /> Добавить новый адрес
          </button>
          </div>
        ) : (
          <div className="new-address-form">
          <h3 className="new-address-form__title">
          {isAuthenticated ? 'Новый адрес' : 'Адрес доставки'}
          </h3>
          <div className="form-grid">
          <div className="form-group">
          <label className="form-group__label">Город</label>
          <input className="form-group__input" name="city" value={newAddress.city} onChange={handleAddressChange} />
          </div>
          <div className="form-group">
          <label className="form-group__label">Улица</label>
          <input className="form-group__input" name="street" value={newAddress.street} onChange={handleAddressChange} />
          </div>
          <div className="form-group form-group--half">
          <label className="form-group__label">Дом</label>
          <input className="form-group__input" name="building" value={newAddress.building} onChange={handleAddressChange} />
          </div>
          <div className="form-group form-group--half">
          <label className="form-group__label">Кв/Офис</label>
          <input className="form-group__input" name="flat" value={newAddress.flat} onChange={handleAddressChange} />
          </div>
          <div className="form-group">
          <label className="form-group__label">Индекс</label>
          <input className="form-group__input" name="zip_code" value={newAddress.zip_code} onChange={handleAddressChange} />
          </div>
          {isAuthenticated && (
            <div className="form-group">
            <label className="form-group__label">Название (напр. Дом)</label>
            <input className="form-group__input" name="title" value={newAddress.title} onChange={handleAddressChange} />
            </div>
          )}
          </div>

          {isAuthenticated && (
            <div className="form-actions">
            <button className="btn primary" onClick={handleSaveAddress}>Сохранить адрес</button>
            {savedAddresses.length > 0 && (
              <button className="btn secondary" onClick={() => setIsAddingAddress(false)}>Отмена</button>
            )}
            </div>
          )}
          </div>
        )}
        </div>
      )}

      <div className="checkout-actions">
      <button className="btn secondary" onClick={() => setStep(1)}>Назад</button>
      <button className="btn primary" onClick={() => setStep(3)}>Далее к оплате</button>
      </div>
      </div>
    )}

    {/* ШАГ 3: ПОДТВЕРЖДЕНИЕ (Сводка) */}
    {step === 3 && (
      <div className="checkout-section">
      <h2 className="checkout-section__title">Подтверждение</h2>

      <div className="order-review">
      <div className="order-review__block">
      <h3>Получатель</h3>
      <p>{contactInfo.name}, {contactInfo.phone}</p>
      <p>{contactInfo.email}</p>
      </div>

      <div className="order-review__block">
      <h3>Способ получения</h3>
      {deliveryType === 'pickup' ? (
        <p>Самовывоз: {PICKUP_POINTS.find(p => p.id === selectedPickupPoint)?.name}</p>
      ) : (
        <p>Доставка: {isAuthenticated && !isAddingAddress
          ? (() => { const a = savedAddresses.find(s => s.id === selectedAddressId); return a ? `${a.city}, ${a.street}` : 'Адрес не выбран'; })()
          : `${newAddress.city}, ${newAddress.street}`
        }</p>
      )}
      </div>

      <div className="order-review__items">
      {cartItems.map(item => (
        <div key={item.id} className="review-item">
        <span>{item.name} x {item.quantity}</span>
        <span>{item.price * item.quantity} ₽</span>
        </div>
      ))}
      <div className="review-total">
      <span>Итого к оплате:</span>
      <span>{totalAmount} ₽</span>
      </div>
      </div>
      </div>

      <div className="checkout-actions">
      <button className="btn secondary" onClick={() => setStep(2)}>Назад</button>
      <button className="btn primary btn--large" onClick={handlePlaceOrder} disabled={loading}>
      {loading ? 'Обработка...' : 'Оформить пожертвование'}
      </button>
      </div>
      </div>
    )}

    </div>
    </div>
    </div>
  );
}

export default CheckoutPage;
