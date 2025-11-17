import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
// (ИЗМЕНЕНИЕ) Импортируем иконки и хелперы
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { getImageUrl, getProductImageSet } from '../../utils/imageUtils';

// (ИЗМЕНЕНИЕ) Принимаем 'selectionMade'
function ProductGallery({ images, inStock, selectionMade, isFavorite, toggleFavorite }) {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState({});

  const validImages = Array.isArray(images) && images.length > 0 ? images : [];

  // Сбрасываем на первое изображение, когда меняется ID продукта (список images)
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageError({});
  }, [images]);

  const handleImageError = (index) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  };

  // Получаем URL и srcSet для ТЕКУЩЕГО ВЫБРАННОГО изображения
  const currentImageUrl = getImageUrl(validImages[currentImageIndex]);
  const { srcSet: mainSrcSet, lg: mainLg } = getProductImageSet(currentImageUrl);

  // Функция для рендера бейджа наличия
  const renderStockBadge = () => {
    // Не показываем бейдж, если выбор варианта еще не сделан
    if (!selectionMade) {
      return null;
    }

    if (inStock > 0) {
      return (
        <div className="product-gallery__stock-badge product-gallery__stock-badge--in-stock">
        В наличии ({inStock})
        </div>
      );
    } else {
      return (
        <div className="product-gallery__stock-badge product-gallery__stock-badge--out-of-stock">
        Нет в наличии
        </div>
      );
    }
  };

  return (
    <div className="product-gallery">
    {/* --- Основное изображение --- */}
    <div className="product-gallery__main-image">
    {validImages.length > 0 && !imageError[currentImageIndex] ? (
      <img
      className="product-gallery__img"
      src={mainLg} // Fallback (1200px)
    srcSet={mainSrcSet} // Адаптивность
    sizes="(max-width: 900px) 90vw, 50vw" // Подсказка браузеру
    alt={`Изображение товара ${currentImageIndex + 1}`}
    loading="eager" // Главное изображение грузим сразу
    onError={() => handleImageError(currentImageIndex)}
    />
    ) : (
      <div className="product-gallery__placeholder">
      <div className="product-gallery__placeholder-icon"></div>
      </div>
    )}

    {/* --- Бейджи (Статус и Избранное) --- */}
    {renderStockBadge()}

    {user && (
      <button
      type="button"
      onClick={toggleFavorite}
      className="product-gallery__favorite-btn"
      >
      {/* (ИЗМЕНЕНИЕ) Иконки из react-icons */}
      {isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
      </button>
    )}
    </div>

    {/* --- Миниатюры --- */}
    {validImages.length > 1 && (
      <div className="product-gallery__thumbnails">
      {validImages.map((image, index) => {
        if (imageError[index]) return null;

        // Получаем URL и srcSet для КАЖДОЙ миниатюры
        const thumbUrl = getImageUrl(image);
        const { sm: thumbSm } = getProductImageSet(thumbUrl);

        return (
          <img
          key={index}
          src={thumbSm} // Грузим 400px (sm) версию для миниатюры
          alt={`Миниатюра ${index + 1}`}
          className={`product-gallery__thumbnail-img ${
            currentImageIndex === index ? 'product-gallery__thumbnail-img--active' : ''
          }`}
          loading="eager" // Миниатюры грузим "лениво"
          onClick={() => setCurrentImageIndex(index)}
          onError={() => handleImageError(index)}
          />
        );
      })}
      </div>
    )}
    </div>
  );
}

export default ProductGallery;
