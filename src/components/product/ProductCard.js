import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProductCard({ product, addToCart, toggleFavorite, isFavorite = false }) {
    const navigate = useNavigate();
    const requiresSelection = product.category === "Одежда";

    // Функция для прокрутки вверх и перехода на страницу товара
    const handleCardClick = (e) => {
        // Проверяем, был ли клик по кнопке или её дочерним элементам
        if (
            e.target.closest('button') ||
            e.target.closest('.favorite-icon') ||
            e.target.tagName === 'BUTTON' ||
            e.target.tagName === 'SVG' ||
            e.target.tagName === 'PATH'
        ) {
            return;
        }
        // Убираем window.scrollTo, так как это теперь делается автоматически
        navigate(`/product/${product.id}`);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (requiresSelection) {
            handleCardClick(e);
        } else {
            addToCart(product);
        }
    };

    const handleToggleFavorite = (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(product);
    };

    return (
        <div className="product-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <div className="product-image-wrapper" style={{ flex: 1, position: 'relative' }}>
        <div className="product-image">
        <div className={`image-placeholder ${product.image}`}></div>
        {product.isNew && (
            <div className="badge new-badge" style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                width: '5rem',
                padding: '4px 10px',
                backgroundColor: '#d4af37',
                color: '#0a2240',
                borderRadius: '4px',
                zIndex: 2
            }}>
            Новинка
            </div>
        )}
        </div>
        <button
        className="favorite-icon"
        onClick={handleToggleFavorite}
        style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}
        >
        {isFavorite ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#d32f2f">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#555">
            <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 8.5 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C11.45 18.01 8.5 15.1 8.5 11.5 8.5 9.07 10.47 7.1 13 7.1c2.53 0 4.5 1.97 4.5 4.4 0 3.59-2.95 6.49-7.1 10.05z"/>
            </svg>
        )}
        </button>
        </div>

        <div className="product-info" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1
        }}>
        <h3 className="product-name" style={{
            fontSize: '1.25rem',
            lineHeight: '1.4',
            height: '4.8rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
        }}>
        {product.name}
        </h3>
        <div className="price-and-button">
        <div className="product-price" style={{
            fontWeight: 'bold',
            marginBottom: '0.1rem',
            color: '#0a2240',
            fontSize: '1.5rem',
            textAlign: 'center'
        }}>
        {product.price} ₽
        </div>
        <button
        className="btn primary"
        onClick={handleAddToCart}
        style={{ width: '100%' }}
        >
        {requiresSelection ? "Подробнее" : "Выбрать вознаграждение"}
        </button>
        </div>
        </div>
        </div>
    );
}

export default ProductCard;
