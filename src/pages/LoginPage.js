import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/account';

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Не удалось войти.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
    <div className="auth-card">
    <h1 className="auth-card__title">Вход в аккаунт</h1>

    {error && <div className="auth-card__error">{error}</div>}

    <form onSubmit={handleSubmit} className="auth-form">
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

    <button
    type="submit"
    className="btn primary auth-form__submit"
    disabled={loading}
    >
    {loading ? 'Вход...' : 'Войти'}
    </button>
    </form>

    <div className="auth-card__footer">
    <p>
    Нет аккаунта?{' '}
    <Link to="/register" className="auth-card__link">Зарегистрироваться</Link>
    </p>
    <Link to="/" className="auth-card__link">Вернуться на главную</Link>
    </div>
    </div>
    </div>
  );
}

export default LoginPage;
