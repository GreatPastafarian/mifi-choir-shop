import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext'; // Добавьте этот импорт

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Добавьте состояние загрузки
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/account';
  const { login: authLogin, clearAuthData } = useAuth(); // Получите функцию login из контекста

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Вызываем login с объектом { email, password }
      await login({ email, password });

      // Проверяем, был ли email сохранен в localStorage
      const user = JSON.parse(localStorage.getItem('user'));

      if (user && user.email) {
        console.log('Успешный вход с email:', user.email);
        navigate(from || '/');
      } else {
        // Если email не сохранен, очищаем данные и показываем ошибку
        clearAuthData();
        setError('Ошибка при входе. Попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      setError(error.message || 'Не удалось войти. Проверьте данные и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        maxWidth: '500px',
        margin: '4rem auto',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <h1
        style={{
          fontSize: '2.5rem',
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        Вход в аккаунт
      </h1>

      {error && (
        <div
          style={{
            backgroundColor: '#ffebee',
            color: '#b71c1c',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
            }}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
            }}
          >
            Пароль
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <button
          type="submit"
          className="btn primary"
          style={{
            padding: '0.75rem',
            fontSize: '1.1rem',
          }}
          disabled={loading} // Добавьте disabled при загрузке
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <div
        style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          borderTop: '1px solid #eee',
          paddingTop: '1.5rem',
        }}
      >
        <p style={{ marginBottom: '1rem' }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: '#8d1f2c', fontWeight: '600' }}>
            Зарегистрироваться
          </Link>
        </p>
        <Link to="/" style={{ color: '#8d1f2c', fontWeight: '600' }}>
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
