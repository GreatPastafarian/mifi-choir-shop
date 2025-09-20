// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', ''); // Убираем /api для статических файлов

// Создаем базовый экземпляр axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Не удалось подключиться к серверу. Проверьте, запущен ли сервер.');
    }

    // Более детальная обработка ошибок
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Очищаем данные аутентификации
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          break;
        case 403:
          throw new Error(data.message || 'Доступ запрещен');
        case 404:
          throw new Error(data.message || 'Ресурс не найден');
        case 500:
          throw new Error(data.message || 'Внутренняя ошибка сервера');
        default:
          throw new Error(data.message || `Ошибка ${status}`);
      }
    }

    return Promise.reject(error);
  }
);

// Перехватчик для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL }; // Экспортируем BASE_URL для использования в компонентах
