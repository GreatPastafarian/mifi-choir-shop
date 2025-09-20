// src/components/product/ProductDetails.js
import React, { useState } from 'react';
import { MdCheckCircle } from 'react-icons/md';

function ProductDetails({ product, inStock, addToCart, isFavorite, toggleFavorite }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    // Для товаров с размерами проверяем выбор размера
    if (product.category === 'Одежда' && !selectedSize) {
      alert('Пожалуйста, выберите размер');
      return;
    }

    const itemToAdd = {
      ...product,
      quantity,
      selectedSize,
    };

    addToCart(itemToAdd);
  };

  return (
    <div className="product-info">
      <div
        className="product-meta"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <span
          style={{
            backgroundColor: '#f5f0e5',
            color: '#8d1f2c',
            padding: '4px 10px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {product.category}
        </span>
        <button
          onClick={toggleFavorite}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginLeft: 'auto',
            position: 'relative',
            width: '48px',
            height: '48px',
          }}
        >
          {isFavorite ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#d32f2f">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#333">
              <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 8.5 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C11.45 18.01 8.5 15.1 8.5 11.5 8.5 9.07 10.47 7.1 13 7.1c2.53 0 4.5 1.97 4.5 4.4 0 3.59-2.95 6.49-7.1 10.05z" />
            </svg>
          )}
          <span className="heart-tooltip">Добавить в избранное</span>
        </button>
      </div>

      <h1
        style={{
          fontSize: '2.5rem',
          marginBottom: '1rem',
          lineHeight: '1.2',
        }}
      >
        {product.name}
      </h1>

      <div
        className="product-price-card"
        style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: '#8d1f2c',
          marginBottom: '2rem',
        }}
      >
        Рекомендованное пожертвование: {product.price} ₽
      </div>

      {/* Выбор размера для одежды */}
      {product.category === 'Одежда' && (
        <div className="size-selector" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Размер:</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
              <button
                key={size}
                className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                style={{
                  padding: '0.5rem 1rem',
                  border: selectedSize === size ? '2px solid #8d1f2c' : '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: selectedSize === size ? '#8d1f2c' : 'white',
                  color: selectedSize === size ? 'white' : '#333',
                  cursor: 'pointer',
                  fontWeight: selectedSize === size ? '600' : '400',
                }}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Контроль количества */}
      <div
        className="quantity-selector"
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f5f0e5',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <label
            htmlFor="quantity"
            style={{
              fontWeight: '600',
              fontSize: '1.1rem',
            }}
          >
            Количество:
          </label>
          <span
            style={{
              color: '#8d1f2c',
              fontWeight: '600',
              fontSize: '1.2rem',
            }}
          >
            {quantity} × {product.price} ₽ = {quantity * product.price} ₽
          </span>
        </div>

        <div
          className="quantity-control"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #ddd',
              backgroundColor: '#fff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            -
          </button>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => {
              const value = Math.max(1, parseInt(e.target.value) || 1);
              setQuantity(value);
            }}
            min="1"
            max={inStock}
            style={{
              width: '60px',
              height: '40px',
              textAlign: 'center',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1.1rem',
            }}
          />
          <button
            onClick={() => setQuantity((q) => Math.min(inStock, q + 1))}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #ddd',
              backgroundColor: '#fff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Кнопки действий */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <button
          className="btn primary"
          onClick={handleAddToCart}
          style={{
            flex: 1,
            padding: '1rem',
            fontSize: '1.1rem',
          }}
        >
          Добавить в корзину
        </button>
      </div>

      {/* Описание товара */}
      <div
        className="product-description"
        style={{
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid #eee',
        }}
      >
        <h2
          style={{
            fontSize: '1.8rem',
            marginBottom: '1.5rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #eee',
          }}
        >
          Описание
        </h2>

        <div className="description-content" style={{ marginBottom: '2rem' }}>
          <p
            style={{
              lineHeight: '1.6',
              marginBottom: '1.5rem',
              color: '#555',
            }}
          >
            {product.description}
          </p>

          <h3
            style={{
              fontSize: '1.3rem',
              marginBottom: '1rem',
              color: '#0a2240',
            }}
          >
            Материалы и особенности
          </h3>
          <p
            style={{
              lineHeight: '1.6',
              marginBottom: '1.5rem',
              color: '#555',
            }}
          >
            {product.materials}
          </p>

          <ul
            style={{
              listStyle: 'none',
              paddingLeft: 0,
              marginBottom: '1.5rem',
            }}
          >
            {product.details.map((detail, index) => (
              <li
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  color: '#555',
                }}
              >
                <MdCheckCircle size={16} color="#8d1f2c" style={{ marginRight: '0.75rem' }} />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
