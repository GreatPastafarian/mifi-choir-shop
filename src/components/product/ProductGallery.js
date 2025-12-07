import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  MdFavorite,
  MdFavoriteBorder,
  MdClose,
  MdArrowBackIos,
  MdArrowForwardIos,
  MdZoomIn,
  MdZoomOut,
  MdFullscreen
} from 'react-icons/md';
import { getImageUrl, getProductImageSet } from '../../utils/imageUtils';
import '../../styles/pages/product-gallery.css';

function ProductGallery({ images, isFavorite, toggleFavorite }) {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState({});

  // Состояния для Lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const validImages = Array.isArray(images) && images.length > 0 ? images : [];

  // Сброс при смене товара
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageError({});
    setIsLightboxOpen(false);
    setZoomLevel(1);
  }, [images]);

  // Блокировка скролла
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isLightboxOpen]);

  // --- ФУНКЦИИ УПРАВЛЕНИЯ (Определяем ДО useEffect) ---

  const closeLightbox = useCallback((e) => {
    e?.stopPropagation();
    setIsLightboxOpen(false);
    setZoomLevel(1);
  }, []);

  const nextImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    setZoomLevel(1);
  }, [validImages.length]);

  const prevImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    setZoomLevel(1);
  }, [validImages.length]);

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const openLightbox = () => {
    if (validImages.length > 0) setIsLightboxOpen(true);
  };

    const handleImageError = (index) => {
      setImageError((prev) => ({ ...prev, [index]: true }));
    };

    // --- ЭФФЕКТ КЛАВИШ (Теперь функции уже определены) ---
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (!isLightboxOpen) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage(e);
        if (e.key === 'ArrowLeft') prevImage(e);
      };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, closeLightbox, nextImage, prevImage]);

    // --- РЕНДЕРИНГ ---

    // Текущее изображение
    const currentImage = validImages[currentImageIndex];
    const currentImageUrl = getImageUrl(currentImage);
    const { srcSet: mainSrcSet, lg: mainLg } = getProductImageSet(currentImageUrl);

    return (
      <div className="product-gallery">
      {/* === 1. ОБЫЧНЫЙ РЕЖИМ === */}
      <div className="product-gallery__main-wrapper" onClick={openLightbox}>
      {validImages.length > 0 && !imageError[currentImageIndex] ? (
        <img
        className="product-gallery__main-img"
        src={mainLg}
        srcSet={mainSrcSet}
        sizes="(max-width: 900px) 90vw, 50vw"
        alt={`Товар ${currentImageIndex + 1}`}
        loading="eager"
        onError={() => handleImageError(currentImageIndex)}
        />
      ) : (
        <div className="product-gallery__placeholder">
        <div className="product-gallery__placeholder-icon"></div>
        </div>
      )}

      <div className="product-gallery__overlay-hint">
      <MdFullscreen /> Развернуть
      </div>

      {user && (
        <button
        type="button"
        className="product-gallery__fav-btn"
        onClick={(e) => { e.stopPropagation(); toggleFavorite(); }}
        >
        {isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
        </button>
      )}
      </div>

      {/* Миниатюры */}
      {validImages.length > 1 && (
        <div className="product-gallery__thumbs">
        {validImages.map((image, index) => {
          if (imageError[index]) return null;
          const thumbUrl = getImageUrl(image);
          const { sm: thumbSm } = getProductImageSet(thumbUrl);

          return (
            <img
            key={index}
            src={thumbSm}
            alt={`Миниатюра ${index + 1}`}
            className={`product-gallery__thumb ${currentImageIndex === index ? 'active' : ''}`}
            loading="lazy"
            onClick={() => setCurrentImageIndex(index)}
            onError={() => handleImageError(index)}
            />
          );
        })}
        </div>
      )}

      {/* === 2. ЛАЙТБОКС === */}
      {isLightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
        <div className="lightbox__toolbar" onClick={(e) => e.stopPropagation()}>
        <span className="lightbox__counter">
        {currentImageIndex + 1} / {validImages.length}
        </span>
        <div className="lightbox__tools">
        <button onClick={handleZoomOut} disabled={zoomLevel <= 1}><MdZoomOut /></button>
        <button onClick={handleZoomIn} disabled={zoomLevel >= 3}><MdZoomIn /></button>
        <button onClick={closeLightbox} className="lightbox__close"><MdClose /></button>
        </div>
        </div>

        <div
        className="lightbox__content"
        style={{ transform: `scale(${zoomLevel})` }}
        onClick={(e) => e.stopPropagation()}
        >
        <img
        src={mainLg}
        alt="Full view"
        className="lightbox__image"
        draggable="false"
        />
        </div>

        {validImages.length > 1 && (
          <>
          <button className="lightbox__nav lightbox__nav--prev" onClick={prevImage}>
          <MdArrowBackIos />
          </button>
          <button className="lightbox__nav lightbox__nav--next" onClick={nextImage}>
          <MdArrowForwardIos />
          </button>
          </>
        )}
        </div>
      )}
      </div>
    );
}

export default ProductGallery;
