import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
  getCurrentUser,
  logout as authLogout,
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

  // Загрузка избранного
  const loadFavorites = useCallback(async () => {
    try {
      const favoritesData = await getFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
      // В случае ошибки загружаем из localStorage
      const localFavorites = localStorage.getItem('choirFavorites');
      if (localFavorites) {
        setFavorites(JSON.parse(localFavorites));
      } else {
        setFavorites([]);
      }
    }
  }, []);

  // Проверка и обновление состояния аутентификации
  const checkAuth = useCallback(async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.token) {
        try {
          // Загружаем полный профиль, включая роль
          const profile = await getProfile();
          // Объединяем данные из localStorage и профиль с сервера
          const fullUser = {
            ...currentUser,
            ...profile,
          };
          setUser(fullUser);

          // Загружаем избранное
          await loadFavorites();

          return true;
        } catch (error) {
          console.error('Ошибка загрузки профиля:', error);
          // Если ошибка аутентификации (401), очищаем данные
          if (error.response?.status === 401) {
            clearAuthData();
          }
          setUser(null);
          setFavorites([]);
          return false;
        }
      } else {
        setUser(null);
        // Загружаем избранное для неавторизованных пользователей
        const localFavorites = localStorage.getItem('choirFavorites');
        if (localFavorites) {
          setFavorites(JSON.parse(localFavorites));
        } else {
          setFavorites([]);
        }
        return false;
      }
    } catch (error) {
      console.error('Ошибка при загрузке пользователя:', error);
      setUser(null);
      setFavorites([]);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadFavorites]);

  // Инициализация при загрузке приложения
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      // Вызываем сервисный login, который сохранит токен в localStorage
      const response = await authServiceLogin(credentials);

      // После успешного входа сразу обновляем состояние из localStorage
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.token) {
        try {
          // Загружаем полный профиль
          const profile = await getProfile();
          const fullUser = {
            ...currentUser,
            ...profile,
          };
          setUser(fullUser);

          // Синхронизируем локальное избранное с сервером
          const localFavorites = JSON.parse(localStorage.getItem('choirFavorites') || '[]');

          // Добавляем все локальные избранные товары на сервер
          for (const product of localFavorites) {
            try {
              await addToFavorites(product.id);
            } catch (error) {
              // Игнорируем ошибки для товаров, уже находящихся в избранном
              if (error.response?.status !== 400) {
                console.error('Ошибка при добавлении в избранное:', error);
              }
            }
          }

          // Очищаем локальное избранное после синхронизации
          localStorage.removeItem('choirFavorites');

          // Загружаем актуальное избранное с сервера
          await loadFavorites();

          // Уведомляем систему об успешном входе
          window.dispatchEvent(new Event('auth:login'));

          return fullUser;
        } catch (error) {
          console.error('Ошибка загрузки профиля после входа:', error);
          // Если не удалось загрузить профиль, все равно считаем пользователя аутентифицированным
          setUser(currentUser);
          window.dispatchEvent(new Event('auth:login'));
          return currentUser;
        }
      }

      return response;
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Вызываем сервисный logout, который очистит данные
      await authLogout();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      // Устанавливаем пользователя как null
      setUser(null);

      // Сохраняем избранное в localStorage для неавторизованного доступа
      localStorage.setItem('choirFavorites', JSON.stringify(favorites));

      // Уведомляем систему о выходе
      window.dispatchEvent(new Event('auth:logout'));
    }
  };

  // Переключение избранного
  const toggleFavorite = async (product) => {
    try {
      const isCurrentlyFavorite = favorites.some((fav) => fav.id === product.id);

      if (isCurrentlyFavorite) {
        // Удалить из избранного
        await removeFromFavorites(product.id);
        setFavorites((prev) => prev.filter((fav) => fav.id !== product.id));
      } else {
        // Добавить в избранное
        await addToFavorites(product.id);
        setFavorites((prev) => [...prev, product]);
      }
    } catch (error) {
      console.error('Ошибка при изменении избранного:', error);
      throw error;
    }
  };

  // Проверяем, нужно ли перенаправить после входа
  const handlePostLoginRedirect = () => {
    const postLoginRedirect = localStorage.getItem('postLoginRedirect');
    if (postLoginRedirect) {
      localStorage.removeItem('postLoginRedirect');
      return decodeURIComponent(postLoginRedirect);
    }
    return '/account';
  };

  const value = {
    user,
    favorites,
    login,
    logout,
    toggleFavorite,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    checkAuth,
    handlePostLoginRedirect,
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
