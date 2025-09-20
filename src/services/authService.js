import api from './api';

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Ошибка парсинга пользователя из localStorage:', e);
      return null;
    }
  }
  return null;
};

export const clearAuthData = () => {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('user');
  localStorage.removeItem('anonymousId');
};

// Вход пользователя
export const login = async (credentials) => {
  try {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error('Email и пароль обязательны для входа');
    }

    const response = await api.post('/auth/login', { email, password });

    // Создаем полный объект пользователя
    const userDataWithToken = {
      token: response.data.token,
      id: response.data.user.id,
      email: response.data.user.email,
      name: response.data.user.name || '',
      phone: response.data.user.phone || '',
      address: response.data.user.address || '',
      role: response.data.user.role || 'user',
    };

    // Сохраняем полный объект пользователя
    localStorage.setItem('user', JSON.stringify(userDataWithToken));

    // Привязываем анонимные пожертвования к аккаунту ТОЛЬКО ЕСЛИ ЕСТЬ EMAIL
    const anonymousId = localStorage.getItem('anonymousId');
    if (anonymousId && userDataWithToken.email) {
      try {
        const linkResponse = await api.post('/users/link-anonymous', { anonymousId });
        console.log(`Привязано ${linkResponse.data.count} пожертвований`);
      } catch (linkError) {
        console.error('Ошибка привязки анонимных пожертвований:', linkError);
      }
    }

    return response.data;
  } catch (error) {
    console.error('Ошибка входа:', error);
    const errorMessage = error.response?.data?.message || 'Ошибка входа';
    throw new Error(errorMessage);
  }
};

// Регистрация пользователя
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);

    if (response.data.token) {
      // Создаем полный объект пользователя
      const userDataWithToken = {
        token: response.data.token,
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name || '',
        phone: response.data.user.phone || '',
        address: response.data.user.address || '',
        role: response.data.user.role || '',
      };

      // Сохраняем полный объект пользователя
      localStorage.setItem('user', JSON.stringify(userDataWithToken));

      // Привязываем анонимные пожертвования к аккаунту
      const anonymousId = localStorage.getItem('anonymousId');
      if (anonymousId) {
        try {
          const linkResponse = await api.post('/users/link-anonymous', { anonymousId });
          console.log(`Привязано ${linkResponse.data.count} пожертвований`);
        } catch (linkError) {
          console.error('Ошибка привязки анонимных пожертвований:', linkError);
        }
      }
    }

    return response.data;
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    throw new Error(error.response?.data?.message || 'Ошибка регистрации');
  }
};

// Выход пользователя
export const logout = async () => {
  // Для JWT на клиенте не требуется отправлять запрос на сервер для выхода
  // Просто очищаем данные аутентификации
  clearAuthData();

  // Дополнительно можно отправить событие о выходе
  window.dispatchEvent(new Event('auth:logout'));
};

// Получение профиля пользователя
export const getProfile = async () => {
  const user = getCurrentUser();
  if (!user || !user.token) {
    throw new Error('Пользователь не авторизован');
  }

  try {
    const response = await api.get('/users/me');
    // Убедимся, что у нас есть все необходимые поля
    const profileData = {
      id: response.data.id,
      email: response.data.email,
      name: response.data.name || '',
      phone: response.data.phone || '',
      address: response.data.address || '',
      createdAt: response.data.createdAt,
      role: response.data.role || 'user',
      notify_rewards: response.data.notify_rewards,
      notify_concerts: response.data.notify_concerts,
      notify_personal: response.data.notify_personal,
      notify_monthly_report: response.data.notify_monthly_report,
    };
    return profileData;
  } catch (error) {
    console.error('Ошибка при получении профиля:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      error,
    });
    // Если ошибка аутентификации, очищаем данные
    if (error.response?.status === 401) {
      clearAuthData();
    }
    throw new Error(error.response?.data?.message || 'Ошибка получения профиля');
  }
};

// Обновление профиля пользователя
export const updateProfile = async (profileData) => {
  const user = getCurrentUser();
  if (!user || !user.token) {
    throw new Error('Пользователь не авторизован');
  }

  try {
    const response = await api.put('/users/me', profileData);
    // Обновляем данные в localStorage
    const updatedUser = {
      ...user,
      ...response.data,
      createdAt: response.data.createdAt,
      role: response.data.role || user.role,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    // Если ошибка аутентификации, очищаем данные
    if (error.response?.status === 401) {
      clearAuthData();
    }
    throw new Error(error.response?.data?.message || 'Ошибка обновления профиля');
  }
};

// Получить историю пожертвований
export const getDonationHistory = async () => {
  try {
    const user = getCurrentUser();
    if (!user || !user.token) {
      throw new Error('Пользователь не авторизован');
    }
    const response = await api.get('/users/donations');
    // Упрощаем обработку даты
    const formattedDonations = response.data.map((donation) => {
      return {
        ...donation,
        createdAt: donation.createdAt || donation.created_at,
      };
    });
    return formattedDonations;
  } catch (error) {
    // Если ошибка аутентификации, очищаем данные
    if (error.response?.status === 401) {
      clearAuthData();
    }
    throw new Error(error.response?.data?.message || 'Ошибка получения истории пожертвований');
  }
};

// Добавить пожертвование в историю
export const addDonationToHistory = async (donationData) => {
  try {
    const user = getCurrentUser();
    let anonymousId = localStorage.getItem('anonymousId');

    // Создаем анонимный ID, если его нет
    if (!user && !anonymousId) {
      anonymousId = `anon-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('anonymousId', anonymousId);
    }

    // Создаем данные для запроса
    const requestData = {
      ...donationData,
      ...(user ? { userId: user.id } : { anonymousId }),
    };

    const response = await api.post('/users/donations', requestData);
    return response.data;
  } catch (error) {
    // Если ошибка аутентификации, повторяем запрос как анонимный
    if (error.response?.status === 401) {
      // Очищаем данные аутентификации
      clearAuthData();
      // Повторяем запрос как анонимный
      console.log('Повторная попытка как анонимный пользователь');
      return addDonationToHistory(donationData);
    }
    console.error('Ошибка при добавлении пожертвования:', error);
    throw new Error(error.response?.data?.message || 'Ошибка добавления пожертвования');
  }
};

// Получить настройки уведомлений
export const getNotificationSettings = async () => {
  try {
    const user = getCurrentUser();
    if (!user || !user.token) {
      throw new Error('Пользователь не авторизован');
    }
    const response = await api.get('/users/settings');
    return response.data;
  } catch (error) {
    // Если ошибка аутентификации, очищаем данные
    if (error.response?.status === 401) {
      clearAuthData();
    }
    throw new Error(error.response?.data?.message || 'Ошибка получения настроек');
  }
};

// Обновить настройки уведомлений
export const updateNotificationSettings = async (settings) => {
  try {
    const user = getCurrentUser();
    if (!user || !user.token) {
      throw new Error('Пользователь не авторизован');
    }
    const response = await api.put('/users/settings', settings);
    return response.data;
  } catch (error) {
    // Если ошибка аутентификации, очищаем данные
    if (error.response?.status === 401) {
      clearAuthData();
    }
    throw new Error(error.response?.data?.message || 'Ошибка обновления настроек');
  }
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ИЗБРАННЫМ =====
// Получить избранные товары
export const getFavorites = async () => {
  try {
    const user = getCurrentUser();
    if (!user || !user.token) {
      // Для неавторизованных пользователей возвращаем из localStorage
      const localFavorites = localStorage.getItem('choirFavorites');
      return localFavorites ? JSON.parse(localFavorites) : [];
    }

    const response = await api.get('/favorites');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении избранного:', error);
    // В случае ошибки возвращаем данные из localStorage
    const localFavorites = localStorage.getItem('choirFavorites');
    return localFavorites ? JSON.parse(localFavorites) : [];
  }
};

// Добавить товар в избранное
export const addToFavorites = async (productId) => {
  try {
    const user = getCurrentUser();
    if (!user || !user.token) {
      // Для неавторизованных пользователей сохраняем в localStorage
      const localFavorites = JSON.parse(localStorage.getItem('choirFavorites') || '[]');
      if (!localFavorites.some((item) => item.id === productId)) {
        // В реальном приложении нужно было бы получить данные товара по ID
        // Для упрощения просто добавляем ID
        localFavorites.push({ id: productId });
        localStorage.setItem('choirFavorites', JSON.stringify(localFavorites));
      }
      return;
    }

    await api.post(`/favorites/${productId}`);
  } catch (error) {
    console.error('Ошибка при добавлении в избранное:', error);
    throw error;
  }
};

// Удалить товар из избранного
export const removeFromFavorites = async (productId) => {
  try {
    const user = getCurrentUser();
    if (!user || !user.token) {
      // Для неавторизованных пользователей удаляем из localStorage
      const localFavorites = JSON.parse(localStorage.getItem('choirFavorites') || '[]');
      const updatedFavorites = localFavorites.filter((item) => item.id !== productId);
      localStorage.setItem('choirFavorites', JSON.stringify(updatedFavorites));
      return;
    }

    await api.delete(`/favorites/${productId}`);
  } catch (error) {
    console.error('Ошибка при удалении из избранного:', error);
    throw error;
  }
};
