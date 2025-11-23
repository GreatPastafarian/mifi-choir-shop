import React, { useState, useEffect, useCallback } from 'react';
// Removed unused icons and updateProductVariant
import { MdOpenInNew, MdCheckCircle, MdArrowRight, MdSearch, MdSave, MdDeleteOutline } from 'react-icons/md';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Service Imports
import { addDonationToHistory } from '../services/authService';
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} from '../services/addressService';
// REMOVED: import { updateProductVariant } from '../services/productService'; <--- This line caused the warning
import { getZipCodeByAddress } from '../utils/dadataService';
import { getImageUrl, getProductImageSet } from '../utils/imageUtils';

function CheckoutPage({ cartItems, updateCart }) {
  const [step, setStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const { user, isAuthenticated, login: contextLogin } = useAuth();
  const navigate = useNavigate();

  // UI States
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Order States
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [donationId, setDonationId] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  // Delivery and Address States
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    comment: '',
    isAnonymous: false,
    // Address
    address_title: '',
    city: '',
    street: '',
    building: '',
    flat: '',
    zip_code: ''
  });

  // Initialization
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

      // Load addresses from profile
      const fetchAddresses = async () => {
        try {
          const addresses = await getUserAddresses();
          setSavedAddresses(addresses);
          // Select default address if available
          if (addresses.length > 0) {
            const defAddr = addresses[0];
            setSelectedAddressId(defAddr.id);
            setFormData(prev => ({
              ...prev,
              address_title: defAddr.title || '',
              city: defAddr.city,
              street: defAddr.street,
              building: defAddr.building,
              flat: defAddr.flat || '',
              zip_code: defAddr.zip_code || ''
            }));
          }
        } catch (err) {
          console.error('Failed to load addresses:', err);
        }
      };
      fetchAddresses();
    }
  }, [cartItems, navigate, isAuthenticated, user, isCompleting]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // --- ADDRESS LOGIC ---

  const handleAddressSelect = (e) => {
    const val = e.target.value;
    setSelectedAddressId(val);

    if (val === 'new') {
      setFormData(prev => ({
        ...prev,
        address_title: '',
        city: '',
        street: '',
        building: '',
        flat: '',
        zip_code: ''
      }));
    } else {
      const addr = savedAddresses.find(a => a.id === Number(val));
      if (addr) {
        setFormData(prev => ({
          ...prev,
          address_title: addr.title || '',
          city: addr.city,
          street: addr.street,
          building: addr.building,
          flat: addr.flat || '',
          zip_code: addr.zip_code || ''
        }));
      }
    }
  };

  // Auto-find ZIP via DaData
  const handleAutoZip = async () => {
    if (!formData.city || !formData.street) {
      alert('Please fill in City, Street, and Building first');
      return;
    }
    setIsProcessing(true);
    try {
      const zip = await getZipCodeByAddress(formData.city, formData.street, formData.building);
      if (zip) {
        setFormData(prev => ({ ...prev, zip_code: zip }));
      } else {
        alert('Could not determine ZIP code. Please enter manually.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Save NEW address to profile
  const handleSaveNewAddress = async () => {
    if (!user) return;
    if (!formData.city || !formData.street || !formData.building) {
      alert('Fill in required address fields');
      return;
    }

    const finalTitle = formData.address_title || `${formData.street}, ${formData.building}`;

    setIsProcessing(true);
    try {
      const newAddress = await createAddress({
        title: finalTitle,
        city: formData.city,
        street: formData.street,
        building: formData.building,
        flat: formData.flat,
        zip_code: formData.zip_code
      });
      setSavedAddresses([newAddress, ...savedAddresses]);
      setSelectedAddressId(newAddress.id);
      setFormData(prev => ({ ...prev, address_title: finalTitle }));
      alert('Address saved to profile!');
    } catch (e) {
      alert('Error saving address');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update CURRENT address in profile
  const handleUpdateCurrentAddress = async () => {
    if (selectedAddressId === 'new' || !user) return;

    const finalTitle = formData.address_title || `${formData.street}, ${formData.building}`;

    setIsProcessing(true);
    try {
      const updated = await updateAddress(selectedAddressId, {
        title: finalTitle,
        city: formData.city,
        street: formData.street,
        building: formData.building,
        flat: formData.flat,
        zip_code: formData.zip_code
      });
      setSavedAddresses(savedAddresses.map(a => a.id === updated.id ? updated : a));
      alert('Address updated!');
    } catch (e) {
      alert('Error updating address');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete CURRENT address from profile
  const handleDeleteCurrentAddress = async () => {
    if (selectedAddressId === 'new' || !user) return;
    if (!window.confirm('Delete this address from saved list?')) return;

    setIsProcessing(true);
    try {
      await deleteAddress(selectedAddressId);
      const newList = savedAddresses.filter(a => a.id !== Number(selectedAddressId));
      setSavedAddresses(newList);
      setSelectedAddressId('new');
      setFormData(prev => ({ ...prev, address_title: '', city: '', street: '', building: '', flat: '', zip_code: '' }));
    } catch (e) {
      alert('Error deleting address');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Validation and Steps ---

  const validateContactForm = useCallback(() => {
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    if (deliveryType === 'delivery') {
      if (!formData.city || !formData.street || !formData.building) {
        setError('Please fill in delivery address (City, Street, Building)');
        return false;
      }
    }
    return true;
  }, [formData, deliveryType]);

  const handleNextStep = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError('');

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

  const handlePrevStep = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError('');
    setTimeout(() => {
      if (step > 1) setStep(step - 1);
      setTimeout(() => setIsProcessing(false), 100);
    }, 10);
  }, [step, isProcessing]);

  const handleCreateOrder = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const itemsData = cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        variantId: item.variantId || null,
        sku: item.sku || null,
        attributes: item.attributes || {},
      }));

      let finalDeliveryInfo = {};
      if (deliveryType === 'pickup') {
        finalDeliveryInfo = { type: 'pickup', text: 'Самовывоз (г. Москва, Каширское шоссе, 64, корп. 1А)' };
      } else {
        finalDeliveryInfo = {
          title: formData.address_title,
          city: formData.city,
          street: formData.street,
          building: formData.building,
          flat: formData.flat,
          zip: formData.zip_code
        };
      }

      const donationData = {
        amount: subtotal,
        payment_method: 'Онлайн-платеж',
        items: itemsData,
        comment: formData.comment || '',
        status: 'Ожидает проверки',
        delivery_type: deliveryType,
        delivery_info: finalDeliveryInfo,
        recipient_name: formData.name,
        recipient_phone: formData.phone,
        anonymousId: localStorage.getItem('anonymousId')
      };

      if (isAuthenticated && user) {
        donationData.userId = user.id;
        delete donationData.anonymousId;
      } else if (!donationData.anonymousId) {
        const newAnonId = `anon-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('anonymousId', newAnonId);
        donationData.anonymousId = newAnonId;
      }

      donationData.is_anonymous = formData.isAnonymous;

      // 1. Create order (Server now handles inventory deduction!)
      const donation = await addDonationToHistory(donationData);

      setDonationId(donation.id);
      setPaymentInitiated(true);

      setIsCompleting(true);
      setStep(3);
      updateCart([]);

      const paymentUrl = `https://endowment.mephi.ru/pay?edit[submitted][ya_rekomenduyu_popechitelskomu_sovetu_endaumenta_mifi_napravlyat]=Мужской хор&amount=${subtotal}&donation_id=${donation.id}`;
      window.open(paymentUrl, '_blank');

    } catch (err) {
      console.error('Order error:', err);
      setError(err.response?.data?.message || err.message || 'Error creating order');
      setIsCompleting(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewHistory = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    setIsCompleting(true);
    if (isAuthenticated) {
      navigate('/account?tab=donations', { replace: true });
    } else {
      localStorage.setItem('postLoginRedirect', encodeURIComponent('/account?tab=donations'));
      setShowLoginModal(true);
    }
    setTimeout(() => setIsProcessing(false), 100);
  }, [isAuthenticated, navigate, isProcessing]);

  const handleLoginSubmit = useCallback(async (e) => {
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
      setLoginError('Invalid email or password');
    } finally {
      setTimeout(() => setIsProcessing(false), 100);
    }
  }, [contextLogin, navigate, isProcessing]);


  // Helpers
  const renderAttributes = (attributes) => {
    if (!attributes || Object.keys(attributes).length === 0) return null;
    return Object.entries(attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  };

  const progressModifier = step === 2 ? 'checkout-steps--step-2' : step === 3 ? 'checkout-steps--step-3' : '';
  const stepsLayoutModifier = 'checkout-steps--three-steps';

  return (
    <div className="checkout-page">
    <div className="checkout-page__container">

    {/* Login Modal */}
    {showLoginModal && (
      <div className="checkout-auth-modal" onClick={() => !isProcessing && setShowLoginModal(false)}>
      <div className="checkout-auth-modal__content" onClick={(e) => e.stopPropagation()}>
      <h3 className="checkout-auth-modal__title">Вход в аккаунт</h3>
      <div className="checkout-auth-modal__form">
      <form onSubmit={handleLoginSubmit}>
      {loginError && <div className="alert error">{loginError}</div>}
      <div className="form-group">
      <label className="checkout-form__label">Email</label>
      <input className="checkout-form__input" type="email" name="email" required autoFocus disabled={isProcessing} />
      </div>
      <div className="form-group">
      <label className="checkout-form__label">Пароль</label>
      <input className="checkout-form__input" type="password" name="password" required disabled={isProcessing} />
      </div>
      <div className="checkout-auth-modal__actions">
      <button type="submit" className="btn primary checkout-auth-modal__btn" disabled={isProcessing}>Войти</button>
      </div>
      </form>
      </div>
      </div>
      </div>
    )}

    <div className="checkout-page__content-box">
    <h1 className="checkout-page__title">Оформление пожертвования</h1>

    {error && <div className="alert error">{error}</div>}

    <div className={`checkout-steps ${stepsLayoutModifier} ${progressModifier}`}>
    <div className={`checkout-steps__item ${step >= 1 ? 'checkout-steps__item--active' : ''} ${step > 1 ? 'checkout-steps__item--completed' : ''}`}>
    <div className="checkout-steps__number">1</div>
    <span className="checkout-steps__label">Контакты</span>
    </div>
    <div className={`checkout-steps__item ${step >= 2 ? 'checkout-steps__item--active' : ''} ${step > 2 ? 'checkout-steps__item--completed' : ''}`}>
    <div className="checkout-steps__number">2</div>
    <span className="checkout-steps__label">Подтверждение</span>
    </div>
    <div className={`checkout-steps__item ${step >= 3 ? 'checkout-steps__item--active' : ''}`}>
    <div className="checkout-steps__number">3</div>
    <span className="checkout-steps__label">Оплата</span>
    </div>
    </div>

    <div className="checkout-page__section">
    {/* STEP 1 */}
    {step === 1 && (
      <>
      <h2 className="checkout-page__section-title">1. Контактные данные</h2>
      <div className="form-group">
      <label className="checkout-form__label">ФИО *</label>
      <input className="checkout-form__input" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Иванов Иван Иванович" />
      </div>
      <div className="form-group">
      <label className="checkout-form__label">Email *</label>
      <input className="checkout-form__input" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="example@example.com" />
      </div>
      <div className="form-group">
      <label className="checkout-form__label">Телефон</label>
      <input className="checkout-form__input" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+7 (XXX) XXX-XX-XX" />
      </div>

      <h2 className="checkout-page__section-title">2. Способ получения</h2>
      <div className="checkout-delivery__tabs">
      <button className={`btn ${deliveryType === 'pickup' ? 'primary' : 'secondary'} checkout-delivery__tab-btn`} onClick={() => setDeliveryType('pickup')}>Самовывоз</button>
      <button className={`btn ${deliveryType === 'delivery' ? 'primary' : 'secondary'} checkout-delivery__tab-btn`} onClick={() => setDeliveryType('delivery')}>Доставка</button>
      </div>

      <div className="checkout-delivery__content">
      {deliveryType === 'pickup' ? (
        <div>
        <p className="checkout-delivery__text"><strong>Адрес:</strong> г. Москва, Каширское шоссе, 64, корп. 1А</p>
        <p className="checkout-delivery__text">Мы свяжемся с вами для уточнения времени.</p>
        </div>
      ) : (
        <div>
        {/* ADDRESS SELECTOR */}
        {user && savedAddresses.length > 0 && (
          <div className="form-group">
          <div style={{display: 'flex', alignItems: 'flex-end', gap: '10px'}}>
          <div style={{flex: 1}}>
          <label className="checkout-form__label">Выбрать сохраненный адрес:</label>
          <select
          className="checkout-form__select"
          value={selectedAddressId}
          onChange={handleAddressSelect}
          >
          {savedAddresses.map(addr => (
            <option key={addr.id} value={addr.id}>
            {addr.title || 'Адрес'} ({addr.city}, {addr.street})
            </option>
          ))}
          <option value="new">+ Ввести новый адрес</option>
          </select>
          </div>
          {selectedAddressId !== 'new' && (
            <div style={{display: 'flex', gap: '5px'}}>
            <button type="button" className="btn secondary" onClick={handleUpdateCurrentAddress} title="Обновить в профиле" style={{padding: '0.75rem'}} disabled={isProcessing}>
            <MdSave />
            </button>
            <button type="button" className="btn secondary" onClick={handleDeleteCurrentAddress} title="Удалить из профиля" style={{padding: '0.75rem', color: '#dc3545', borderColor: '#fee'}} disabled={isProcessing}>
            <MdDeleteOutline />
            </button>
            </div>
          )}
          </div>
          </div>
        )}

        {/* ADDRESS FIELDS */}
        <div className="form-group">
        <label className="checkout-form__label">Название адреса (например, Дом, Работа)</label>
        <input
        className="checkout-form__input"
        type="text"
        name="address_title"
        value={formData.address_title}
        onChange={handleChange}
        placeholder="Новый адрес"
        />
        </div>

        <div className="form-group">
        <label className="checkout-form__label">Город *</label>
        <input className="checkout-form__input" type="text" name="city" value={formData.city} onChange={handleChange} />
        </div>
        <div className="form-group">
        <label className="checkout-form__label">Улица *</label>
        <input className="checkout-form__input" type="text" name="street" value={formData.street} onChange={handleChange} />
        </div>

        <div className="checkout-form__row">
        <div className="form-group">
        <label className="checkout-form__label">Дом *</label>
        <input className="checkout-form__input" type="text" name="building" value={formData.building} onChange={handleChange} />
        </div>
        <div className="form-group">
        <label className="checkout-form__label">Кв./Офис</label>
        <input className="checkout-form__input" type="text" name="flat" value={formData.flat} onChange={handleChange} />
        </div>
        </div>

        <div className="form-group">
        <label className="checkout-form__label">Индекс</label>
        <div style={{display: 'flex', gap: '10px'}}>
        <input
        className="checkout-form__input"
        type="text"
        name="zip_code"
        value={formData.zip_code}
        onChange={handleChange}
        style={{flex: 1}}
        />
        <button
        type="button"
        className="btn secondary"
        onClick={handleAutoZip}
        title="Найти индекс по адресу"
        disabled={isProcessing}
        >
        <MdSearch /> Найти
        </button>
        </div>
        </div>

        {user && selectedAddressId === 'new' && (
          <button type="button" className="btn secondary" onClick={handleSaveNewAddress} style={{fontSize: '0.9rem'}} disabled={isProcessing}>
          <MdSave style={{marginRight: '5px'}}/> Сохранить этот адрес в профиль
          </button>
        )}
        </div>
      )}
      </div>

      <div className="form-group">
      <label className="checkout-form__label">Комментарий</label>
      <textarea className="checkout-form__textarea" name="comment" value={formData.comment} onChange={handleChange} rows="2" placeholder="Ваши пожелания..."></textarea>
      </div>

      <div className="form-group">
      <label className="custom-checkbox">
      <input type="checkbox" name="isAnonymous" checked={formData.isAnonymous} onChange={handleChange} />
      <span className="custom-checkbox__box"></span>
      <span className="custom-checkbox__label-text">Сделать пожертвование анонимным</span>
      </label>
      </div>

      <div className="checkout-page__actions">
      <Link to="/cart" className="btn secondary">Назад в корзину</Link>
      <button className="btn primary" onClick={handleNextStep}>Далее</button>
      </div>
      </>
    )}

    {/* STEP 2 */}
    {step === 2 && (
      <>
      <h2 className="checkout-page__section-title">Проверьте данные</h2>
      <div className="checkout-summary">
      <h3 className="checkout-summary__title">Ваш заказ</h3>
      <div className="checkout-summary__list">
      {cartItems.map((item, idx) => {
        const imageUrl = getImageUrl(item.images && item.images[0]);
        const { sm } = getProductImageSet(imageUrl);
        const attributesText = renderAttributes(item.attributes);

        return (
          <div key={idx} className="checkout-summary__item">
          <div className="checkout-summary__item-preview">
          <img src={sm} alt={item.name} className="checkout-summary__item-img" />
          </div>
          <div className="checkout-summary__item-info">
          <span className="checkout-summary__item-name">{item.name} <span className="checkout-summary__item-quantity">× {item.quantity}</span></span>
          {attributesText && <span className="checkout-summary__item-meta">{attributesText}</span>}
          </div>
          <span className="checkout-summary__item-price">{(Number(item.price) || 0) * item.quantity} ₽</span>
          </div>
        );
      })}
      </div>
      <div className="checkout-summary__total">
      <span>Итого к оплате:</span>
      <span className="checkout-summary__total-value">{subtotal} ₽</span>
      </div>
      </div>

      <div className="checkout-contact-view">
      <h3 className="checkout-contact-view__title">Доставка</h3>
      <div className="checkout-contact-view__row">
      <span className="checkout-contact-view__label">Способ:</span>
      <span>{deliveryType === 'pickup' ? 'Самовывоз' : 'Доставка'}</span>
      </div>
      {deliveryType === 'delivery' && (
        <div className="checkout-contact-view__row">
        <span className="checkout-contact-view__label">Адрес:</span>
        <span style={{textAlign: 'right', maxWidth: '60%'}}>
        {formData.address_title && <strong>{formData.address_title}: </strong>}
        {`${formData.city}, ${formData.street}, д. ${formData.building}, кв. ${formData.flat || '-'}`}
        </span>
        </div>
      )}
      <div className="checkout-contact-view__row">
      <span className="checkout-contact-view__label">Получатель:</span>
      <span>{formData.name}, {formData.phone}</span>
      </div>
      </div>

      <div className="checkout-page__actions">
      <button className="btn secondary" onClick={handlePrevStep} disabled={isProcessing}>Назад</button>
      <button className="btn primary" onClick={handleCreateOrder} disabled={isProcessing}>
      {isProcessing ? 'Обработка...' : 'Перейти к оплате'}
      </button>
      </div>
      </>
    )}

    {/* STEP 3 */}
    {step === 3 && (
      <div className="checkout-confirmation">
      {paymentInitiated ? (
        <>
        <MdCheckCircle className="checkout-confirmation__icon" />
        <h2 className="checkout-confirmation__title">Оплата инициирована</h2>
        <div className="checkout-confirmation__details">
        <span className="checkout-confirmation__label">Номер пожертвования:</span>
        <span className="checkout-confirmation__value">{donationId}</span>
        </div>
        <div style={{marginBottom: '2rem'}}>
        <span className="checkout-confirmation__badge">Ожидает проверки</span>
        <p style={{marginTop: '1rem', color: '#666'}}>Статус обновится после оплаты.</p>
        </div>
        <a href={`https://endowment.mephi.ru/pay?edit[submitted][ya_rekomenduyu_popechitelskomu_sovetu_endaumenta_mifi_napravlyat]=Мужской хор&amount=${subtotal}&donation_id=${donationId}`} target="_blank" rel="noopener noreferrer" className="btn primary">
        <MdOpenInNew style={{marginRight: 8}}/> Перейти к оплате
        </a>
        <div className="checkout-page__actions">
        <button className="btn secondary" onClick={handleViewHistory}>Перейти в историю <MdArrowRight /></button>
        </div>
        </>
      ) : (
        <div className="checkout-confirmation">
        <h2>Заказ создан!</h2>
        <p>Перенаправление...</p>
        </div>
      )}
      </div>
    )}
    </div>
    </div>
    </div>
    </div>
  );
}

export default CheckoutPage;
