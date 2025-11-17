import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// (ИЗМЕНЕНИЕ) Импортируем иконки для "Избранного"
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
// (ИЗМЕНЕНИЕ) Импортируем наши новые хелперы
import { getImageUrl, getProductImageSet } from '../../utils/imageUtils';

function ProductCard({ product, addToCart, toggleFavorite, isFavorite = false, priority = false }){
  const navigate = useNavigate();

  // Логика из старого файла
  const requiresSelection = product.category === 'Одежда';
  const price = product.base_price ?? product.price;
  const isNew = product.is_new;
  const images = product.images || [];

  // 1. ПОЛУЧАЕМ БАЗОВЫЙ URL
  const imageUrl = getImageUrl(images[0]);

  // 2. ПОЛУЧАЕМ НАБОР АДАПТИВНЫХ ИЗОБРАЖЕНИЙ
  const { srcSet, lg } = getProductImageSet(imageUrl);

  // --- ОБРАБОТЧИКИ ---

  const handleToggleFavorite = (e) => {
    e.stopPropagation(); // Останавливаем клик, чтобы не перейти на страницу
    e.preventDefault();
    toggleFavorite(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (requiresSelection) {
      navigate(`/product/${product.id}`); // Переход, если нужен выбор
    } else {
      addToCart(product);
    }
  };

  return (
    // (ИЗМЕНЕНИЕ) БЭМ-класс, убран onClick (теперь у нас ссылки)
    <div className="product-card">

    {/* (ИЗМЕНЕНИЕ) Новый wrapper для картинки и оверлеев */}
    <div className="product-card__image-wrapper">
    <button
    className="product-card__favorite-btn" // Новый БЭМ-класс
    onClick={handleToggleFavorite}
    >
    {/* (ИЗМЕНЕНИЕ) Чистая иконка из react-icons */}
    {isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
    </button>

    {isNew && (
      <span className="product-card__badge">Новинка</span> // Новый БЭМ-класс
    )}

    {/* (ИЗМЕНЕНИЕ) Кликабельная ссылка-обертка для <img> */}
    <Link to={`/product/${product.id}`} className="product-card__image-link">
    <img
    className="product-card__image"
    src={lg}
    srcSet={srcSet}
    sizes="(max-width: 600px) 45vw, (max-width: 900px) 30vw, 23vw"
    alt={product.name}
    // (ИЗМЕНЕНИЕ) Умная стратегия загрузки
    loading={priority ? "eager" : "lazy"}
    // (ОПЦИОНАЛЬНО) fetchPriority помогает браузеру еще сильнее
    fetchPriority={priority ? "high" : "auto"}
    />
    </Link>
  </div>

  {/* (ИЗМЕНЕНИЕ) Инфо-блок с БЭМ-классами */}
  <div className="product-card__info">
  <Link to={`/product/${product.id}`} className="product-card__title-link">
  <h3 className="product-card__title">{product.name}</h3>
  </Link>
  <div className="product-card__price-wrapper">
  <div className="product-card__price">{price} ₽</div>
  <button className="btn primary product-card__action-btn" onClick={handleAddToCart}>
  {requiresSelection ? 'Подробнее' : 'Выбрать вознаграждение'}
  </button>
  </div>
  </div>
  </div>
  );
}

export default ProductCard;
