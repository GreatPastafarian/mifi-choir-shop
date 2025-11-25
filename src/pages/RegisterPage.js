import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUserData } = useAuth(); // Используем новый метод

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      // register возвращает { token, user: {...} }
      const response = await register({ name, email, password, phone });

      // Формируем объект пользователя для контекста
      const userToSave = {
        ...response.user,
        token: response.token
      };

      // Сохраняем в контекст без лишнего запроса к API
      setUserData(userToSave);

      navigate('/account');
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
    <div className="auth-card">
    <h1 className="auth-card__title">Регистрация</h1>

    {error && <div className="auth-card__error">{error}</div>}

    <form onSubmit={handleSubmit} className="auth-form">
    <div className="auth-form__group">
    <label htmlFor="name" className="auth-form__label">ФИО</label>
    <input
    type="text"
    id="name"
    className="auth-form__input"
    value={name}
    onChange={(e) => setName(e.target.value)}
    required
    />
    </div>

    <div className="auth-form__group">
    <label htmlFor="email" className="auth-form__label">Email</label>
    <input
    type="email"
    id="email"
    className="auth-form__input"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    />
    </div>

    <div className="auth-form__group">
    <label htmlFor="phone" className="auth-form__label">Телефон</label>
    <input
    type="tel"
    id="phone"
    className="auth-form__input"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    />
    </div>

    <div className="auth-form__group">
    <label htmlFor="password" className="auth-form__label">Пароль</label>
    <input
    type="password"
    id="password"
    className="auth-form__input"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    />
    </div>

    <div className="auth-form__group">
    <label htmlFor="confirmPassword" className="auth-form__label">Подтвердите пароль</label>
    <input
    type="password"
    id="confirmPassword"
    className="auth-form__input"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
    />
    </div>

    <button
    type="submit"
    className="btn primary auth-form__submit"
    disabled={loading}
    >
    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
    </button>
    </form>

    <div className="auth-card__footer">
    <p>
    Уже есть аккаунт?{' '}
    <Link to="/login" className="auth-card__link">Войти</Link>
    </p>
    <Link to="/" className="auth-card__link">Вернуться на главную</Link>
    </div>
    </div>
    </div>
  );
}

export default RegisterPage;
