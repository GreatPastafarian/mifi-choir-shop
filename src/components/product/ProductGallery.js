import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function ProductGallery({ images, inStock, isFavorite, toggleFavorite }) {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState({});

  // Получаем базовый URL для изображений
  const imageBaseUrl = api.IMAGE_BASE_URL || 'http://localhost:5000';

  // Проверяем, что images - массив и имеет хотя бы одно изображение
  const validImages = Array.isArray(images) && images.length > 0 ? images : [];

  // Формируем правильный URL для изображений
  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg';

    // Если изображение уже содержит полный URL, возвращаем его
    if (image.startsWith('http')) {
      return image;
    }

    // Если изображение начинается с /uploads
    if (image.startsWith('/uploads')) {
      return `${imageBaseUrl}${image}`;
    }

    // Если изображение без префикса /uploads
    return `${imageBaseUrl}/uploads${image.startsWith('/') ? '' : '/'}${image}`;
  };

  const handleImageError = (index) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div
      className="product-gallery"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Основное изображение */}
      <div
        className="main-image"
        style={{
          position: 'relative',
          aspectRatio: '1/1',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {validImages.length > 0 && !imageError[currentImageIndex] ? (
          <img
            src={getImageUrl(validImages[currentImageIndex])}
            alt={`Товар - ${currentImageIndex + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={() => handleImageError(currentImageIndex)}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f9f9f9',
            }}
          >
            <div
              className="image-placeholder"
              style={{
                height: '80%',
                width: '80%',
                background:
                  'linear-gradient(45deg, #f0f0f0 25%, #e0e0e0 25%, #e0e0e0 50%, #f0f0f0 50%, #f0f0f0 75%, #e0e0e0 75%)',
                backgroundSize: '40px 40px',
              }}
            ></div>
          </div>
        )}

        {/* Индикатор наличия на складе */}
        {inStock > 0 ? (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              backgroundColor: '#4caf50',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
            }}
          >
            В наличии ({inStock})
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              backgroundColor: '#f44336',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
            }}
          >
            Нет в наличии
          </div>
        )}

        {/* Кнопка избранного */}
        {user && (
          <button
            type="button"
            onClick={toggleFavorite}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
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
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            {isFavorite ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#d32f2f">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#555">
                <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 8.5 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C11.45 18.01 8.5 15.1 8.5 11.5 8.5 9.07 10.47 7.1 13 7.1c2.53 0 4.5 1.97 4.5 4.4 0 3.59-2.95 6.49-7.1 10.05z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Миниатюры */}
      {validImages.length > 1 && (
        <div
          className="thumbnails"
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            padding: '0.5rem 0',
          }}
        >
          {validImages.map(
            (image, index) =>
              !imageError[index] && (
                <img
                  key={index}
                  src={getImageUrl(image)}
                  alt={`Миниатюра ${index + 1}`}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: currentImageIndex === index ? '2px solid #8d1f2c' : '1px solid #ddd',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  onClick={() => setCurrentImageIndex(index)}
                  onError={() => handleImageError(index)}
                />
              )
          )}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
