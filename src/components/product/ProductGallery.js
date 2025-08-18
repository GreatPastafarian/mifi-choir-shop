import React, { useState } from 'react';

function ProductGallery({ images, inStock, isFavorite = false, toggleFavorite = () => {} }) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleImageClick = (index) => {
        setActiveImageIndex(index);
        setIsFullscreen(true);
    };

    const handleFullscreenClose = () => {
        setIsFullscreen(false);
    };

    const handlePrevImage = (e) => {
        e.stopPropagation();
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className="product-gallery">
        {/* Основное изображение */}
        <div
        className="main-image"
        style={{
            position: 'relative',
            cursor: 'pointer',
            borderRadius: '8px',
            overflow: 'hidden'
        }}
        onClick={() => handleImageClick(activeImageIndex)}
        >
        <div className="image-container" style={{
            height: '500px',
            background: `url(${images[activeImageIndex]}) no-repeat center center/cover`,
            borderRadius: '8px'
        }} />

        {/* Наличие товара */}
        {inStock > 0 ? (
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#e8f5e9',
                color: '#388e3c',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontWeight: '600'
            }}>
            В наличии: {inStock} шт.
            </div>
        ) : (
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#ffebee',
                color: '#d32f2f',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontWeight: '600'
            }}>
            Нет в наличии
            </div>
        )}
        </div>

        {/* Миниатюры */}
        <div className="thumbnails" style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem',
            overflowX: 'auto',
            padding: '0.5rem 0'
        }}>
        {images.map((image, index) => (
            <div
            key={index}
            className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
            style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                border: index === activeImageIndex ? '2px solid #8d1f2c' : '1px solid #ddd',
                cursor: 'pointer',
                flexShrink: 0,
                background: `url(${image}) no-repeat center center/cover`
            }}
            onClick={() => setActiveImageIndex(index)}
            />
        ))}
        </div>

        {/* Модальное окно для полноэкранного просмотра изображения */}
        {isFullscreen && (
            <div
            className="fullscreen-modal"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.9)',
                          zIndex: 1000,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
            }}
            onClick={handleFullscreenClose}
            >
            <button
            onClick={handleFullscreenClose}
            style={{
                position: 'absolute',
                top: '2rem',
                right: '2rem',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '2rem',
                cursor: 'pointer'
            }}
            >
            &times;
            </button>

            <button
            onClick={handlePrevImage}
            style={{
                position: 'absolute',
                left: '2rem',
                background: 'rgba(255,255,255,0.2)',
                          border: 'none',
                          color: 'white',
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          fontSize: '1.5rem',
                          cursor: 'pointer'
            }}
            >
            {'<'}
            </button>

            <div
            className="fullscreen-image"
            style={{
                width: '90%',
                height: '90%',
                background: `url(${images[activeImageIndex]}) no-repeat center center/contain`
            }}
            />

            <button
            onClick={handleNextImage}
            style={{
                position: 'absolute',
                right: '2rem',
                background: 'rgba(255,255,255,0.2)',
                          border: 'none',
                          color: 'white',
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          fontSize: '1.5rem',
                          cursor: 'pointer'
            }}
            >
            {'>'}
            </button>
            </div>
        )}
        </div>
    );
}

export default ProductGallery;
