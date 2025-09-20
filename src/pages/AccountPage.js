import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MdPerson, MdSettings, MdEdit, MdSave, MdCancel, MdHistory, MdPayment, MdArrowBack } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getProfile,
  updateProfile,
  getDonationHistory,
  getNotificationSettings,
  updateNotificationSettings,
  login,
  register,
} from '../services/authService';
import api from '../services/api';

function AccountPage() {
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const { isAuthenticated, logout } = useAuth(); // ИСПРАВЛЕНО: добавлен logout в деструктуризацию
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    notify_rewards: true,
    notify_concerts: true,
    notify_personal: false,
    notify_monthly_report: true,
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'profile';
  });

  const checkAndLinkAnonymousDonations = async (profileData) => {
    const anonymousId = localStorage.getItem('anonymousId');

    // Проверяем, есть ли анонимный ID и email пользователя
    if (anonymousId && profileData?.email) {
      try {
        const response = await api.post('/users/check-anonymous', {
          anonymousId,
          email: profileData.email,
        });

        if (response.data.hasDonations && response.data.donationsCount > 0) {
          try {
            await api.post('/users/link-anonymous', { anonymousId });
            console.log(`Привязано ${response.data.donationsCount} пожертвований`);
            return true;
          } catch (linkError) {
            console.error('Ошибка привязки пожертвований:', linkError);
          }
        }
      } catch (checkError) {
        console.error('Ошибка проверки анонимных пожертвований:', checkError);
      }
    }
    return false;
  };

  // ДОБАВЛЕНО: useRef для отслеживания, был ли профиль уже загружен
  const profileLoadedRef = useRef(false);

  // ДОБАВЛЕНО: useCallback для стабилизации функции
  const loadProfileData = useCallback(async () => {
    if (profileLoadedRef.current) {
      return;
    }
    try {
      setLoading(true);
      const profileData = await getProfile();
      setProfile(profileData);
      profileLoadedRef.current = true;
      setFormData({
        name: profileData.name || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
      });

      // Загружаем настройки уведомлений
      const settings = await getNotificationSettings();
      setNotificationSettings(settings);

      // ПРОВЕРКА И ПРИВЯЗКА АНОНИМНЫХ ПОЖЕРТВОВАНИЙ
      const wasLinked = await checkAndLinkAnonymousDonations(profileData);

      // Если пожертвования были привязаны, обновляем историю
      if (wasLinked) {
        const donationData = await getDonationHistory();
        setDonations(donationData);
      } else {
        // Обновляем историю пожертвований при загрузке профиля
        const donationData = await getDonationHistory();
        setDonations(donationData);
      }
    } catch (err) {
      console.error('Ошибка при загрузке профиля:', err);
      setError('Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  }, []);

  // ДОБАВЛЕНО: эффект для первоначальной загрузки профиля
  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData();
    }
  }, [isAuthenticated, loadProfileData]);

  // ДОБАВЛЕНО: эффект для обработки параметра tab из URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');

    if (tab && ['profile', 'donations', 'settings'].includes(tab)) {
      setActiveTab(tab);

      // Если это вкладка пожертвований и мы еще не загрузили данные, загружаем их
      if (tab === 'donations' && donations.length === 0) {
        const loadDonations = async () => {
          try {
            setLoading(true);
            const donationData = await getDonationHistory();
            setDonations(donationData);
          } catch (err) {
            console.error('Ошибка при загрузке истории пожертвований:', err);
            setError('Не удалось загрузить историю пожертвований');
          } finally {
            setLoading(false);
          }
        };

        if (isAuthenticated) {
          loadDonations();
        }
      }
    }
  }, [location, donations.length, isAuthenticated]);

  // ДОБАВЛЕНО: сброс состояния при выходе из системы
  useEffect(() => {
    if (!isAuthenticated) {
      // Сбрасываем состояние при выходе
      setProfile(null);
      setFormData({
        name: '',
        phone: '',
        address: '',
      });
      setNotificationSettings({
        notify_rewards: true,
        notify_concerts: true,
        notify_personal: false,
        notify_monthly_report: true,
      });
      profileLoadedRef.current = false;

      // Проверяем, нужно ли открыть модальное окно входа из-за попытки доступа к защищенной странице
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');

      if (tab === 'donations') {
        setShowLoginModal(true);
      }
    }
  }, [isAuthenticated, location]);

  const handleLinkDonations = async () => {
    try {
      const anonymousId = localStorage.getItem('anonymousId');
      if (!anonymousId) {
        setError('Не удалось найти анонимный ID');
        return;
      }

      await api.post('/users/link-anonymous', { anonymousId });

      // Обновляем историю пожертвований
      const donationData = await getDonationHistory();
      setDonations(donationData);
      setShowLinkPrompt(false);
      setSuccess('Ваши пожертвования успешно привязаны к аккаунту');

      // ДОБАВЛЕНО: перезагружаем профиль после привязки
      await loadProfileData();

      // Автоматически переключаемся на вкладку истории пожертвований
      setActiveTab('donations');

      // Обновляем URL
      navigate('/account?tab=donations', { replace: true });
    } catch (err) {
      console.error('Ошибка при привязке пожертвований:', err);
      setError('Не удалось привязать пожертвования. Попробуйте позже.');
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');

    // Обновляем URL
    navigate(`/account?tab=${tab}`, { replace: true });

    // Загружаем историю пожертвований при активации вкладки
    if (tab === 'donations' && donations.length === 0) {
      try {
        setLoading(true);
        const donationData = await getDonationHistory();
        setDonations(donationData);
      } catch (err) {
        console.error('Ошибка при загрузке истории пожертвований:', err);
        setError('Не удалось загрузить историю пожертвований');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updatedProfile = await updateProfile(formData);
      setProfile(updatedProfile);
      setSuccess('Профиль успешно обновлен');
      setEditMode(false);
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      setError('Не удалось обновить профиль');
    }
  };

  const handleSettingsChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSettingsSave = async () => {
    setError('');
    setSuccess('');

    try {
      await updateNotificationSettings(notificationSettings);
      setSuccess('Настройки успешно сохранены');
    } catch (err) {
      console.error('Ошибка при сохранении настроек:', err);
      setError('Не удалось сохранить настройки');
    }
  };

  // Обработчик для входа через модальное окно
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await login(email, password);
      setShowLoginModal(false);

      // Проверяем, есть ли параметр tab в URL
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');

      // Если это переход из CheckoutPage, то перенаправляем в историю пожертвований
      if (tab === 'donations') {
        setActiveTab('donations');
        navigate('/account?tab=donations', { replace: true });
      } else {
        setActiveTab('profile');
        navigate('/account', { replace: true });
      }
    } catch (err) {
      setError('Неверный email или пароль');
    }
  };

  // Обработчик для регистрации через модальное окно
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await register({ name, email, password });
      setShowRegisterModal(false);
      setShowLoginModal(true);
      setSuccess('Регистрация прошла успешно! Теперь вы можете войти в свой аккаунт.');
    } catch (err) {
      setError(err.message || 'Ошибка регистрации');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="account-container">
        {showLoginModal && (
          <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Вход в аккаунт</h3>
                <button className="close-btn" onClick={() => setShowLoginModal(false)}>
                  <MdArrowBack /> Назад
                </button>
              </div>
              <div className="login-form">
                <form onSubmit={handleLoginSubmit}>
                  {error && <div className="alert error">{error}</div>}
                  <div className="form-group">
                    <label htmlFor="modal-email">Email</label>
                    <input type="email" id="modal-email" name="email" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="modal-password">Пароль</label>
                    <input type="password" id="modal-password" name="password" required />
                  </div>
                  <button type="submit" className="btn primary btn-size-md">
                    Войти
                  </button>
                </form>
                <div className="auth-buttons" style={{ marginTop: '1rem' }}>
                  <button
                    className="btn secondary btn-size-md"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowRegisterModal(true);
                    }}
                  >
                    Зарегистрироваться
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showRegisterModal && (
          <div className="login-modal-overlay" onClick={() => setShowRegisterModal(false)}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Регистрация</h3>
                <button className="close-btn" onClick={() => setShowRegisterModal(false)}>
                  <MdArrowBack /> Назад
                </button>
              </div>
              <div className="login-form">
                <form onSubmit={handleRegisterSubmit}>
                  {error && <div className="alert error">{error}</div>}
                  {success && <div className="alert success">{success}</div>}
                  <div className="form-group">
                    <label htmlFor="register-name">ФИО</label>
                    <input type="text" id="register-name" name="name" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="register-email">Email</label>
                    <input type="email" id="register-email" name="email" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="register-password">Пароль</label>
                    <input type="password" id="register-password" name="password" required />
                  </div>
                  <button type="submit" className="btn primary btn-size-md">
                    Зарегистрироваться
                  </button>
                </form>
                <div className="auth-buttons" style={{ marginTop: '1rem' }}>
                  <button
                    className="btn secondary btn-size-md"
                    onClick={() => {
                      setShowRegisterModal(false);
                      setShowLoginModal(true);
                    }}
                  >
                    Уже есть аккаунт? Войти
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showLoginModal && !showRegisterModal && (
          <div className="not-authorized">
            <h2>Для просмотра этой страницы необходимо войти в аккаунт</h2>
            <div className="auth-buttons">
              <button className="btn primary btn-size-md" onClick={() => setShowLoginModal(true)}>
                Войти
              </button>
              <button className="btn secondary btn-size-md" onClick={() => setShowRegisterModal(true)}>
                Зарегистрироваться
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading && !profile) {
    return (
      <div className="account-container">
        <div className="loading-spinner">Загрузка профиля...</div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>Личный кабинет</h1>
        <button className="logout-btn" onClick={logout}>
          Выйти
        </button>
      </div>

      {showLinkPrompt && (
        <div className="link-prompt">
          <div className="prompt-content">
            <h3>Привяжите ваши пожертвования к аккаунту</h3>
            <p>
              Мы обнаружили, что вы уже делали пожертвования на этом устройстве. Привяжите их к вашему аккаунту, чтобы
              отслеживать историю и получать уведомления.
            </p>
            <div className="prompt-actions">
              <button className="btn secondary" onClick={() => setShowLinkPrompt(false)}>
                Не сейчас
              </button>
              <button className="btn primary" onClick={handleLinkDonations}>
                Привязать пожертвования
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="account-content">
        <div className="account-sidebar">
          <div className="user-info">
            <div className="user-avatar">
              <MdPerson size={80} />
            </div>
            <h2>{profile?.name || 'Не указано'}</h2>
            <p className="user-joined">
              Участник с{' '}
              {profile?.createdAt
                ? (() => {
                    try {
                      let date;
                      if (typeof profile.createdAt === 'string') {
                        date = new Date(profile.createdAt);
                      } else {
                        date = profile.createdAt;
                      }

                      if (isNaN(date.getTime())) {
                        return 'даты неизвестно';
                      }

                      return date.toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      });
                    } catch (e) {
                      console.error('Ошибка форматирования даты:', e);
                      return 'даты неизвестно';
                    }
                  })()
                : 'даты неизвестно'}
            </p>
          </div>

          <div className="account-menu">
            <button
              className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              <MdPerson /> Личные данные
            </button>
            <button
              className={`menu-item ${activeTab === 'donations' ? 'active' : ''}`}
              onClick={() => handleTabChange('donations')}
            >
              <MdHistory /> История пожертвований
            </button>
            <button
              className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <MdSettings /> Настройки
            </button>
          </div>
        </div>

        <div className="account-main">
          {error && <div className="alert error">{error}</div>}

          {success && <div className="alert success">{success}</div>}

          {activeTab === 'profile' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Личные данные</h2>
                {!editMode && (
                  <button className="btn edit-profile-btn" onClick={handleEdit}>
                    <MdEdit /> Редактировать
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-group">
                    <label>ФИО</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={profile?.email || ''} disabled className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Телефон</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Адрес</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="form-input"
                    ></textarea>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn primary">
                      <MdSave /> Сохранить
                    </button>
                    <button type="button" className="btn secondary" onClick={handleCancel}>
                      <MdCancel /> Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="info-item">
                    <label>ФИО</label>
                    <p>{profile?.name || 'Не указано'}</p>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <p>{profile?.email || 'Не указан'}</p>
                  </div>
                  <div className="info-item">
                    <label>Телефон</label>
                    <p>{profile?.phone || 'Не указан'}</p>
                  </div>
                  <div className="info-item">
                    <label>Адрес</label>
                    <p>{profile?.address || 'Не указан'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="tab-content">
              <h2>История пожертвований</h2>
              {loading ? (
                <div className="loading-spinner">Загрузка истории...</div>
              ) : donations.length === 0 ? (
                <div className="empty-state">
                  <MdPayment size={48} />
                  <p>У вас пока нет истории пожертвований</p>
                  <button className="btn primary" onClick={() => navigate('/checkout')}>
                    Сделать пожертвование
                  </button>
                </div>
              ) : (
                <div className="donations-list">
                  {donations.map((donation) => (
                    <div key={donation.id} className="donation-item">
                      <div className="donation-header">
                        <span className="donation-date">
                          {new Date(donation.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                        <span className={`donation-status ${donation.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {donation.status}
                        </span>
                      </div>
                      <div className="donation-details">
                        <p>
                          <strong>Сумма:</strong> {donation.amount} ₽
                        </p>
                        <p>
                          <strong>Способ оплаты:</strong> {donation.payment_method}
                        </p>
                        <p>
                          <strong>Статус:</strong> {donation.status}
                        </p>
                        {donation.items && donation.items.length > 0 && (
                          <p>
                            <strong>Вознаграждения:</strong>{' '}
                            {donation.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-content">
              <h2>Настройки уведомлений</h2>
              <form className="settings-form">
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="notify_rewards"
                      checked={notificationSettings.notify_rewards}
                      onChange={handleSettingsChange}
                    />
                    <span>Получать уведомления о новых вознаграждениях</span>
                  </label>
                </div>
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="notify_concerts"
                      checked={notificationSettings.notify_concerts}
                      onChange={handleSettingsChange}
                    />
                    <span>Получать информацию о концертах и мероприятиях</span>
                  </label>
                </div>
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="notify_personal"
                      checked={notificationSettings.notify_personal}
                      onChange={handleSettingsChange}
                    />
                    <span>Получать персональные предложения</span>
                  </label>
                </div>
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="notify_monthly_report"
                      checked={notificationSettings.notify_monthly_report}
                      onChange={handleSettingsChange}
                    />
                    <span>Ежемесячная отчетность о пожертвованиях</span>
                  </label>
                </div>
                <button type="button" className="btn primary" onClick={handleSettingsSave}>
                  Сохранить настройки
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
