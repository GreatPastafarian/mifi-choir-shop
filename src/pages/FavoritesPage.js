// src/pages/FavoritesPage.js
import React from 'react';
import { Link } from 'react-router-dom';

function FavoritesPage({ favorites = [], addToCart, toggleFavorite }) {
    return (
        <div className="favorites-page">
        <div className="container">
        <div className="favorites-header">
        <h1>Избранные вознаграждения</h1>
        <p>Выберите вознаграждения, которые вы хотите добавить к вашему пожертвованию</p>
        </div>

        {favorites.length > 0 ? (
            <div className="favorites-container">
            <div className="favorites-list">
            {favorites.map(item => (
                <div key={item.id} className="favorite-item">
                <div className="item-image">
                <div className={`image-placeholder ${item.image}`}></div>
                </div>
                <div className="item-details">
                <div className="item-category">{item.category}</div>
                <h3>{item.name}</h3>
                <div className="item-price">Рекомендованное пожертвование: {item.price} ₽</div>
                </div>
                <div className="item-actions">
                <button
                className="btn primary"
                onClick={() => addToCart(item)}
                >
                Добавить в корзину
                </button>
                <button
                className="btn secondary remove-favorite"
                onClick={() => toggleFavorite(item)}
                >
                Удалить из избранного
                </button>
                </div>
                </div>
            ))}
            </div>

            <div className="favorites-summary">
            <h2>Ваши избранные вознаграждения ({favorites.length})</h2>
            <div className="summary-content">
            <div className="summary-row">
            <span>Количество:</span>
            <span>{favorites.length}</span>
            </div>
            <div className="summary-row total">
            <span>Итого:</span>
            <span className="total-amount">
            {favorites.reduce((sum, item) => sum + item.price, 0)} ₽
            </span>
            </div>
            </div>

            <div className="summary-actions">
            <button
            className="btn primary"
            onClick={() => {
                favorites.forEach(item => addToCart(item));
                // Опционально: очистить избранное после добавления в корзину
                // favorites.forEach(item => toggleFavorite(item));
            }}
            >
            Добавить все в корзину
            </button>
            <Link to="/shop" className="btn secondary">
            Вернуться в каталог
            </Link>
            </div>
            </div>
            </div>
        ) : (
            <div className="empty-favorites" style={{
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: '#f5f0e5',
                borderRadius: '8px',
                margin: '2rem 0'
            }}>
            <p style={{
                fontSize: '1.2rem',
                color: '#0a2240',
                marginBottom: '1rem'
            }}>
            У вас пока нет избранных товаров
            </p>
            <Link
            to="/shop"
            className="btn primary"
            style={{
                display: 'inline-block',
                padding: '0.8rem 1.5rem',
                fontSize: '1rem'
            }}
            >
            Перейти в каталог
            </Link>
            </div>
        )}

        <div className="favorites-footer">
        <div className="donation-note" style={{
            borderLeft: '3px solid var(--accent-gold)',
            paddingLeft: 'var(--space-md)',
            marginTop: 'var(--space-xl)',
            backgroundColor: 'var(--accent-beige)',
            padding: 'var(--space-md)'
        }}>
        <p><strong>Важно:</strong> Рекомендованные суммы пожертвований помогают нам поддерживать
        качество сувенирной продукции. Вы можете выбрать любое вознаграждение и определить
        размер пожертвования самостоятельно.</p>
        </div>
        </div>
        </div>
        </div>
    );
}

export default FavoritesPage;
