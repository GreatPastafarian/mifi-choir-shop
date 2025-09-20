import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div
      className="not-found-page"
      style={{
        padding: '4rem 0',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Страница не найдена</h2>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Извините, запрашиваемая страница не существует.</p>
      <Link to="/" className="btn primary" style={{ padding: '0.8rem 1.5rem' }}>
        Вернуться на главную
      </Link>
    </div>
  );
}

export default NotFoundPage;
