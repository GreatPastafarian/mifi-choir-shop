import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AdminDashboard() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <h1>Доступ запрещен</h1>
        <p>У вас нет прав доступа к админ-панели.</p>
        <Link to="/" className="btn primary" style={{ marginTop: '1rem' }}>
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" style={{ marginTop: '4rem' }}>
      <div className="container">
        <h1>Панель управления</h1>

        <div
          className="admin-options-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '2rem',
          }}
        >
          <Link
            to="/admin/products"
            className="admin-option-card"
            style={{
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              boxShadow: 'var(--shadow-md)',
              textDecoration: 'none',
              color: 'var(--text-dark)',
              transition: 'all var(--transition-normal)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                color: 'var(--primary-accent)',
              }}
            >
              🛍️
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Управление товарами</h2>
            <p>Добавляйте, редактируйте и удаляйте товары и их вариации</p>
          </Link>

          <Link
            to="/admin/donations"
            className="admin-option-card"
            style={{
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              boxShadow: 'var(--shadow-md)',
              textDecoration: 'none',
              color: 'var(--text-dark)',
              transition: 'all var(--transition-normal)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                color: 'var(--primary-accent)',
              }}
            >
              💰
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Управление пожертвованиями</h2>
            <p>Проверяйте и одобряйте пожертвования с вознаграждениями</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
