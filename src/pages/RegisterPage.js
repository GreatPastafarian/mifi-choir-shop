import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { useAuth } from '../context/AuthContext'; // Добавьте этот импорт

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // Получите функцию login из контекста

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      const userData = await register({ name, email, password, phone });
      authLogin(userData); // Обновите состояние аутентификации
      navigate('/account'); // Перенаправьте в личный кабинет
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="register-page"
      style={{
        maxWidth: '600px',
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
        Регистрация
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
            htmlFor="name"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
            }}
          >
            ФИО
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            htmlFor="phone"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
            }}
          >
            Телефон
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid ',
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

        <div>
          <label
            htmlFor="confirmPassword"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
            }}
          >
            Подтвердите пароль
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
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
          Уже есть аккаунт?{' '}
          <Link to="/login" style={{ color: '#8d1f2c', fontWeight: '600' }}>
            Войти
          </Link>
        </p>
        <Link to="/" style={{ color: '#8d1f2c', fontWeight: '600' }}>
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;
