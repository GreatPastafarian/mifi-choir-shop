import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile,
  getDonationHistory,
  getNotificationSettings,
  updateNotificationSettings
} from '../services/authService';
import {
  getUserAddresses,
  createAddress,
  deleteAddress,
  updateAddress
} from '../services/addressService.js';
import { getZipCodeByAddress } from '../utils/dadataService';
import {
  MdPerson, MdHistory, MdExitToApp, MdLocationOn, MdAdd, MdDeleteOutline, MdSettings, MdEdit, MdSearch
} from 'react-icons/md';
import api from '../services/api';

function AccountPage() {
  const { user, logout, isAuthenticated, checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [donations, setDonations] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });

  // Адреса: состояние формы
  const [addressForm, setAddressForm] = useState({
    id: null, title: '', city: '', street: '', building: '', flat: '', zip_code: ''
  });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false); // Используем как модалку/форму
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    notify_rewards: true, notify_concerts: true, notify_personal: false, notify_monthly_report: true,
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Загрузка данных (без изменений)
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setProfileForm({ name: user.name || '', phone: user.phone || '' });
      const [donationsData, addressesData, settingsData] = await Promise.all([
        getDonationHistory(), getUserAddresses(), getNotificationSettings()
      ]);
      setDonations(donationsData);
      setAddresses(addressesData);
      setNotificationSettings(settingsData);

      const anonymousId = localStorage.getItem('anonymousId');
      if (anonymousId) {
        await api.post('/users/link-anonymous', { anonymousId });
        const updatedHistory = await getDonationHistory();
        setDonations(updatedHistory);
        localStorage.removeItem('anonymousId');
      }
    } catch (err) { console.error('Ошибка загрузки:', err); } finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) loadData(); else navigate('/login');
  }, [isAuthenticated, navigate, loadData]);

    const handleTabChange = (tab) => {
      setActiveTab(tab);
      setMessage({ type: '', text: '' });
      navigate(`/account?tab=${tab}`, { replace: true });
    };

    // --- ЛОГИКА АДРЕСОВ ---

    const openAddAddress = () => {
      setAddressForm({ id: null, title: '', city: '', street: '', building: '', flat: '', zip_code: '' });
      setIsEditingAddress(false);
      setIsAddressModalOpen(true);
    };

    const openEditAddress = (addr) => {
      setAddressForm({ ...addr });
      setIsEditingAddress(true);
      setIsAddressModalOpen(true);
    };

    const handleAddressSubmit = async (e) => {
      e.preventDefault();
      try {
        if (isEditingAddress) {
          const updated = await updateAddress(addressForm.id, addressForm);
          setAddresses(addresses.map(a => a.id === updated.id ? updated : a));
          setMessage({ type: 'success', text: 'Адрес обновлен' });
        } else {
          const created = await createAddress({ ...addressForm, title: addressForm.title || 'Новый адрес' });
          setAddresses([created, ...addresses]);
          setMessage({ type: 'success', text: 'Адрес добавлен' });
        }
        setIsAddressModalOpen(false);
      } catch (error) {
        setMessage({ type: 'error', text: 'Ошибка сохранения адреса' });
      }
    };

    const handleAutoZip = async () => {
      if (!addressForm.city || !addressForm.street) {
        alert('Заполните город и улицу'); return;
      }
      try {
        const zip = await getZipCodeByAddress(addressForm.city, addressForm.street, addressForm.building);
        if (zip) setAddressForm(prev => ({ ...prev, zip_code: zip }));
        else alert('Индекс не найден');
      } catch (e) { console.error(e); }
    };

    const handleDeleteAddress = async (id) => {
      if(!window.confirm('Удалить этот адрес?')) return;
      try {
        await deleteAddress(id);
        setAddresses(addresses.filter(a => a.id !== id));
      } catch (error) { console.error(error); }
    };

    // ... (handleProfileUpdate, handleSettingsSave - без изменений) ...
    const handleProfileUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await updateProfile(profileForm);
        await checkAuth();
        setMessage({ type: 'success', text: 'Профиль обновлен' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Ошибка обновления' });
      } finally {
        setLoading(false);
      }
    };

    const handleSettingsSave = async () => {
      try {
        await updateNotificationSettings(notificationSettings);
        setMessage({ type: 'success', text: 'Настройки сохранены' });
      } catch (e) {
        setMessage({ type: 'error', text: 'Ошибка сохранения' });
      }
    };

    const handleSettingsChange = (e) => {
      const { name, checked } = e.target;
      setNotificationSettings((prev) => ({ ...prev, [name]: checked }));
    };

    // --- РЕНДЕРЫ ---

    const renderAddressesTab = () => (
      <div className="account-main__tab-content">
      <div className="account-main__header">
      <h2 className="account-main__title">Мои адреса</h2>
      {!isAddressModalOpen && (
        <button className="btn secondary btn-size-sm" onClick={openAddAddress}>
        <MdAdd /> Добавить
        </button>
      )}
      </div>

      {isAddressModalOpen && (
        <div className="address-form">
        <h3 className="address-form__title">{isEditingAddress ? 'Редактировать адрес' : 'Новый адрес'}</h3>
        <form onSubmit={handleAddressSubmit}>
        <div className="profile-form__group" style={{marginBottom: '1rem'}}>
        <label className="profile-form__label">Название</label>
        <input className="profile-form__input" value={addressForm.title} onChange={e => setAddressForm({...addressForm, title: e.target.value})} placeholder="Например: Дом" />
        </div>
        <div className="address-form__grid">
        <div className="profile-form__group"><label className="profile-form__label">Город *</label><input className="profile-form__input" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} required /></div>
        <div className="profile-form__group"><label className="profile-form__label">Улица *</label><input className="profile-form__input" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} required /></div>
        <div className="profile-form__group"><label className="profile-form__label">Дом *</label><input className="profile-form__input" value={addressForm.building} onChange={e => setAddressForm({...addressForm, building: e.target.value})} required /></div>
        <div className="profile-form__group"><label className="profile-form__label">Кв/Офис</label><input className="profile-form__input" value={addressForm.flat} onChange={e => setAddressForm({...addressForm, flat: e.target.value})} /></div>
        <div className="profile-form__group">
        <label className="profile-form__label">Индекс</label>
        <div style={{display: 'flex', gap: '10px'}}>
        <input className="profile-form__input" value={addressForm.zip_code} onChange={e => setAddressForm({...addressForm, zip_code: e.target.value})} />
        <button type="button" className="btn secondary" onClick={handleAutoZip} title="Найти индекс"><MdSearch /></button>
        </div>
        </div>
        </div>
        <div className="address-form__actions">
        <button type="button" className="btn secondary" onClick={() => setIsAddressModalOpen(false)}>Отмена</button>
        <button type="submit" className="btn primary">Сохранить</button>
        </div>
        </form>
        </div>
      )}

      <div className="addresses-list">
      {addresses.length === 0 && !isAddressModalOpen && <div className="account-page__empty"><p>Нет сохраненных адресов.</p></div>}
      {addresses.map(addr => (
        <div key={addr.id} className="address-card">
        <div className="address-card__info">
        <span className="address-card__title">{addr.title || 'Адрес'}</span>
        <div className="address-card__text">
        {addr.zip_code ? `${addr.zip_code}, ` : ''}
        г. {addr.city}, ул. {addr.street}, д. {addr.building}
        {addr.flat ? `, кв. ${addr.flat}` : ''}
        </div>
        </div>
        <div style={{display: 'flex', gap: '0.5rem'}}>
        <button className="btn-icon-edit" onClick={() => openEditAddress(addr)} title="Редактировать">
        <MdEdit />
        </button>
        <button className="btn-icon-delete" onClick={() => handleDeleteAddress(addr.id)} title="Удалить">
        <MdDeleteOutline />
        </button>
        </div>
        </div>
      ))}
      </div>
      </div>
    );

    // ... (Остальные рендеры - Профиль и Донаты - остаются как в прошлом ответе) ...

    // --- ВСТАВЬТЕ СЮДА ОСТАЛЬНОЙ КОД ИЗ ПРОШЛОГО ОТВЕТА ---
    // Я сократил ответ, чтобы он влез. Если нужно, я пришлю полный файл целиком.

    const renderProfileTab = () => ( /* ... код из прошлого ответа ... */
    <div className="account-main__tab-content">
    <div className="account-main__header">
    <h2 className="account-main__title">Личные данные</h2>
    </div>
    <form onSubmit={handleProfileUpdate} className="profile-form">
    {/* ... поля формы ... */}
    <div className="profile-form__group">
    <label className="profile-form__label">Email</label>
    <input className="profile-form__input" type="email" value={user?.email || ''} disabled style={{backgroundColor: '#f0f0f0', color: '#666'}} />
    </div>
    <div className="profile-form__group">
    <label className="profile-form__label">ФИО</label>
    <input
    className="profile-form__input"
    type="text"
    value={profileForm.name}
    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
    />
    </div>
    <div className="profile-form__group">
    <label className="profile-form__label">Телефон</label>
    <input
    className="profile-form__input"
    type="tel"
    value={profileForm.phone}
    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
    />
    </div>
    <div className="profile-form__actions">
    <button type="submit" className="btn primary" disabled={loading}>
    {loading ? 'Сохранение...' : 'Сохранить изменения'}
    </button>
    </div>
    </form>
    </div>
    );

    const renderDonationsTab = () => ( /* ... код из прошлого ответа ... */
    <div className="account-main__tab-content">
    <div className="account-main__header">
    <h2 className="account-main__title">История пожертвований</h2>
    </div>
    <div className="donations-list">
    {donations.length === 0 ? (
      <div className="account-page__empty">
      <MdHistory size={48} style={{marginBottom: '1rem', color: '#ccc'}}/>
      <p>История пуста</p>
      <Link to="/shop" className="btn primary">Перейти в каталог</Link>
      </div>
    ) : (
      donations.map((donation) => {
        let statusClass = 'pending';
        if (donation.status === 'Завершено') statusClass = 'completed';
        if (donation.status === 'Отклонено') statusClass = 'rejected';

        return (
          <div key={donation.id} className="donation-card">
          <div className="donation-card__header">
          <span className="donation-card__date">
          {new Date(donation.createdAt).toLocaleDateString('ru-RU')}
          </span>
          <span className={`donation-card__status donation-card__status--${statusClass}`}>
          {donation.status}
          </span>
          </div>
          <div className="donation-card__body">
          <div className="donation-card__row">
          <span className="donation-card__label">Номер заказа:</span>
          <span className="donation-card__value" style={{fontFamily: 'monospace'}}>{donation.id}</span>
          </div>
          <div className="donation-card__row">
          <span className="donation-card__label">Сумма:</span>
          <span className="donation-card__value">{donation.amount} ₽</span>
          </div>
          {donation.items && donation.items.length > 0 && (
            <div className="donation-card__products">
            <div className="donation-card__products-title">Товары в заказе:</div>
            {donation.items.map((item, idx) => {
              const attrs = item.attributes ? Object.entries(item.attributes)
              .map(([k, v]) => `${v}`).join(', ') : '';
              return (
                <div key={idx} className="donation-card__product-item">
                <div style={{flex: 1}}>
                <span className="donation-card__product-name">{item.name}</span>
                {item.sku && <span className="donation-card__product-sku">{item.sku}</span>}
                {attrs && <span className="donation-card__product-meta">({attrs})</span>}
                </div>
                <span style={{fontWeight: 'bold'}}>x{item.quantity}</span>
                </div>
              );
            })}
            </div>
          )}
          {donation.delivery_type && (
            <div style={{marginTop: '1rem', fontSize: '0.9rem', color: '#666'}}>
            <strong>Получение: </strong>
            {donation.delivery_type === 'pickup' ? 'Самовывоз' : 'Доставка'}
            {donation.delivery_type === 'delivery' && donation.delivery_info && (
              <span style={{display: 'block', marginTop: '4px'}}>
              {donation.delivery_info.city}, {donation.delivery_info.street}, д. {donation.delivery_info.building}
              </span>
            )}
            </div>
          )}
          </div>
          </div>
        );
      })
    )}
    </div>
    </div>
    );

    if (!user) return null;
    return (
      <div className="account-page">
      <div className="account-page__container">
      <div className="account-page__header">
      <h1 className="account-page__title">Личный кабинет</h1>
      <button onClick={() => { logout(); navigate('/'); }} className="account-page__logout-btn">
      <MdExitToApp /> Выйти
      </button>
      </div>
      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'error' : 'success'}`} style={{marginBottom: '2rem'}}>
        {message.text}
        </div>
      )}
      <div className="account-page__content">
      <aside className="account-sidebar">
      <div className="account-sidebar__user">
      <div className="account-sidebar__avatar"><MdPerson size={40} /></div>
      <div className="account-sidebar__name">{user.name || 'Пользователь'}</div>
      <div className="account-sidebar__email">{user.email}</div>
      </div>
      <nav className="account-menu">
      <button className={`account-menu__item ${activeTab === 'profile' ? 'account-menu__item--active' : ''}`} onClick={() => handleTabChange('profile')}><MdPerson /> Профиль</button>
      <button className={`account-menu__item ${activeTab === 'addresses' ? 'account-menu__item--active' : ''}`} onClick={() => handleTabChange('addresses')}><MdLocationOn /> Мои адреса</button>
      <button className={`account-menu__item ${activeTab === 'donations' ? 'account-menu__item--active' : ''}`} onClick={() => handleTabChange('donations')}><MdHistory /> История заказов</button>
      <button className={`account-menu__item ${activeTab === 'settings' ? 'account-menu__item--active' : ''}`} onClick={() => handleTabChange('settings')}><MdSettings /> Настройки</button>
      </nav>
      </aside>
      <main className="account-main">
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'addresses' && renderAddressesTab()}
      {activeTab === 'donations' && renderDonationsTab()}
      </main>
      </div>
      </div>
      </div>
    );
}
export default AccountPage;
