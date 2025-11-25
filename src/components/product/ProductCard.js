import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// (ИЗМЕНЕНИЕ) Добавили MdShoppingCart
import { MdFavorite, MdFavoriteBorder, MdVisibility, MdShoppingCart } from 'react-icons/md';
import { getImageUrl, getProductImageSet } from '../../utils/imageUtils';
// (ИЗМЕНЕНИЕ) Импорт хука авторизации
import { useAuth } from '../../context/AuthContext';

function ProductCard({ product, addToCart, toggleFavorite, isFavorite = false, priority = false }) {
  const navigate = useNavigate();
  // (ИЗМЕНЕНИЕ) Получаем права админа
  const { isAdmin } = useAuth();

  const requiresSelection = product.category === 'Одежда';
  const price = product.base_price ?? product.price;
  const isNew = product.is_new;
  const images = product.images || [];
  const viewsCount = product.views_count || 0;
  // (ИЗМЕНЕНИЕ) Безопасное получение продаж
  const salesCount = product.salesCount || 0;

  const imageUrl = getImageUrl(images[0]);
  const { srcSet, lg } = getProductImageSet(imageUrl);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (requiresSelection) {
      navigate(`/product/${product.id}`);
    } else {
      addToCart(product);
    }
  };

  return (
    <div className="product-card">
      <div className="product-card__image-wrapper">
        <button
          className="product-card__favorite-btn"
          onClick={handleToggleFavorite}
          title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
        >
          {isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
        </button>

        {isNew && (
          <span className="product-card__badge">Новинка</span>
        )}

        {!isNew && product.is_preorder && (
          <span className="product-card__badge product-card__badge--preorder">Предзаказ</span>
        )}

        {/* (ИЗМЕНЕНИЕ) Счетчик продаж (Только для админа, СЛЕВА) */}
        {isAdmin && (
          <div className="product-card__sales" title="Количество продаж (видно только админу)">
            <MdShoppingCart />
            <span>{salesCount}</span>
          </div>
        )}

        {/* Счетчик просмотров (Для всех, СПРАВА) */}
        <div className="product-card__views" title="Количество просмотров">
          <MdVisibility />
          <span>{viewsCount}</span>
        </div>

        <Link to={`/product/${product.id}`} className="product-card__image-link">
          <img
            className="product-card__image"
            src={lg}
            srcSet={srcSet}
            sizes="(max-width: 600px) 45vw, (max-width: 900px) 30vw, 23vw"
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />
        </Link>
      </div>

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
