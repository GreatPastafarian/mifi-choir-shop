import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Всегда берем актуальный user из localStorage перед запросом
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error('Error parsing user for token', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
                              (error) => {
                                if (error.code === 'ECONNREFUSED') {
                                  throw new Error('Не удалось подключиться к серверу.');
                                }

                                if (error.response) {
                                  const { status, data } = error.response;

                                  switch (status) {
                                    case 401:
                                      // Токен протух. Чистим localStorage И кидаем событие для контекста
                                      localStorage.removeItem('user');
                                      // Это событие поймает AuthContext и обнулит стейт
                                      window.dispatchEvent(new Event('auth:logout'));
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

export default api;
export { BASE_URL };
