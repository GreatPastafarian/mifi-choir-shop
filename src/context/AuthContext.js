import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
// --- ДОБАВЛЕН ИМПОРТ API ---
import api from '../services/api';
// ----------------------------
import {
  getCurrentUser,
  logout as authServiceLogout,
  getProfile,
  clearAuthData,
  login as authServiceLogin,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
} from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Используем ref для доступа к актуальному состоянию внутри замыканий
  const favoritesRef = useRef(favorites);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  // Загрузка избранного (с фоллбэком на localStorage)
  const loadFavorites = useCallback(async () => {
    try {
      const favoritesData = await getFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
      // Если не удалось загрузить с сервера (или нет токена), берем локальное
      const localFavorites = localStorage.getItem('choirFavorites');
      setFavorites(localFavorites ? JSON.parse(localFavorites) : []);
    }
  }, []);

  // Проверка авторизации при старте
  const checkAuth = useCallback(async () => {
    try {
      const currentUser = getCurrentUser();

      if (currentUser && currentUser.token) {
        try {
          // Пытаемся получить свежий профиль
          const profile = await getProfile();
          const fullUser = { ...currentUser, ...profile };
          setUser(fullUser);
          await loadFavorites();
        } catch (error) {
          console.error('Ошибка валидации сессии:', error);
          // Если токен протух, profile вернет ошибку.
          // Но мы не сбрасываем favorites жестко, чтобы не мигало
          setUser(null);
        }
      } else {
        setUser(null);
        const localFavorites = localStorage.getItem('choirFavorites');
        setFavorites(localFavorites ? JSON.parse(localFavorites) : []);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [loadFavorites]);

  // --- Обработчик "протухшего" токена (вызывается из api.js) ---
  useEffect(() => {
    const handleAutoLogout = () => {
      // Сохраняем избранное перед выходом
      if (favoritesRef.current.length > 0) {
        localStorage.setItem('choirFavorites', JSON.stringify(favoritesRef.current));
      }

      setUser(null);
      clearAuthData();
    };

    window.addEventListener('auth:logout', handleAutoLogout);

    // Запускаем проверку при монтировании
    checkAuth();

    return () => {
      window.removeEventListener('auth:logout', handleAutoLogout);
    };
  }, [checkAuth]);


  // Функция входа (вызывается из LoginPage)
  const login = async (credentials) => {
    try {
      // 1. Делаем запрос к API
      await authServiceLogin(credentials);

      // 2. Получаем то, что сохранилось в localStorage
      const currentUser = getCurrentUser();

      if (currentUser) {
        // 3. Обновляем стейт (оптимистично)
        setUser(currentUser);

        // 4. Подгружаем полные данные и избранное
        try {
          const profile = await getProfile();
          const fullUser = { ...currentUser, ...profile };
          setUser(fullUser);

          // Синхронизация локального избранного с сервером
          const localFavorites = JSON.parse(localStorage.getItem('choirFavorites') || '[]');
          if (localFavorites.length > 0) {
            for (const product of localFavorites) {
              try { await addToFavorites(product.id); } catch (e) {}
            }
            localStorage.removeItem('choirFavorites');
          }

          await loadFavorites();

        } catch (err) {
          console.warn('Не удалось подгрузить профиль сразу:', err);
        }

        // 5. Мердж чата (В ОТДЕЛЬНОМ БЛОКЕ TRY/CATCH)
        // Теперь api определен и это сработает
        const chatSessionId = localStorage.getItem('chatSessionId');
        if (chatSessionId) {
          try {
            await api.post('/contact/merge', { sessionId: chatSessionId });
            console.log('Чат успешно привязан');
            localStorage.removeItem('chatSessionId');
          } catch (chatError) {
            console.error('Не удалось привязать историю чата:', chatError);
          }
        }
      }
      return currentUser;
    } catch (error) {
      throw error;
    }
  };

  const setUserData = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    // Опционально: можно добавить синхронизацию избранного и чата здесь,
    // если вы хотите делать это и после регистрации
  };

  // Ручной выход
  const logout = async () => {
    // Сохраняем избранное локально перед выходом
    if (favorites.length > 0) {
      localStorage.setItem('choirFavorites', JSON.stringify(favorites));
    }

    await authServiceLogout();
    setUser(null);
    // Не очищаем setFavorites, оставляем их как "гостевые"
  };

  const toggleFavorite = async (product) => {
    try {
      const isCurrentlyFavorite = favorites.some((fav) => fav.id === product.id);

      if (isCurrentlyFavorite) {
        setFavorites((prev) => prev.filter((fav) => fav.id !== product.id));
        await removeFromFavorites(product.id);
      } else {
        setFavorites((prev) => [...prev, product]);
        await addToFavorites(product.id);
      }
    } catch (error) {
      console.error('Ошибка избранного:', error);
      await loadFavorites(); // Откат при ошибке
    }
  };

  const value = {
    user,
    favorites,
    login,
    logout,
    setUserData,
    toggleFavorite,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
