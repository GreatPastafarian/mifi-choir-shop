import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // (ИЗМЕНЕНИЕ) Добавлен useNavigate
import { useAuth } from '../context/AuthContext';
// (ИЗМЕНЕНИЕ) Импортируем хелперы
import { getImageUrl, getProductImageSet } from '../utils/imageUtils';

function FavoritesPage({ addToCart }) {
  const { favorites, toggleFavorite } = useAuth();
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate(); // (ИЗМЕНЕНИЕ)

  // (ИЗМЕНЕНИЕ) Полностью удалены 'sizeSelections' и 'handleSizeChange'

  // (ИЗМЕНЕНИЕ) Упрощенный обработчик
  const handleAddToCart = (item) => {
    // Проверяем, есть ли у товара вообще варианты (по наличию attributes в 1-м варианте)
    // Это не 100% надежно, т.к. product неполный, но лучше, чем ничего.
    // Самое правильное - ВСЕГДА переходить на страницу товара.
    const hasVariants = item.variants && item.variants.length > 0 &&
    item.variants[0].attributes &&
    Object.keys(item.variants[0].attributes).length > 0;

    // (ИЗМЕНЕНИЕ) Твоя логика: в избранном варианты не нужны,
    // значит, для добавления в корзину нужно перейти на страницу товара.
    if (hasVariants) {
      navigate(`/product/${item.id}`);
      return;
    }

    // Если это простой товар (нет вариантов), добавляем его
    const itemToAdd = {
      ...item,
      category_name: item.category_name || item.category,
      variantId: item.variants[0]?.id || item.id, // ID "простого" варианта
      sku: item.variants[0]?.sku || null,
      attributes: {},
    };
    addToCart(itemToAdd);
  };

  const handleAddAllToCart = () => {
    // (ИЗМЕНЕНИЕ) Эта логика становится сложной.
    // Лучше уведомить пользователя, что нужно добавлять по одному.
    alert("Пожалуйста, добавьте товары в корзину по одному, чтобы выбрать нужные опции.");

    // Либо можно добавить все "простые" товары, а "сложные" проигнорировать,
    // но это запутает пользователя.
  };

  const handleRemoveFromFavorites = async (item) => {
    try {
      await toggleFavorite(item);
    } catch (err) {
      console.error('Ошибка при удалении из избранного:', err);
    }
  };

  const handleImageError = (itemId) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  const calculateTotal = () => {
    return favorites.reduce((sum, item) => {
      const price = item.base_price || item.price || 0;
      return sum + price;
    }, 0);
  };

  return (
    // (ИЗМЕНЕНИЕ) БЭМ-классы
    <div className="favorites-page">
    <div className="favorites-page__container container">
    <div className="favorites-page__header">
    <h1>Избранные вознаграждения</h1>
    <p>Выберите вознаграждения, которые вы хотите добавить к вашему пожертвованию</p>
    </div>

    {favorites.length > 0 ? (
      <div className="favorites-page__content">
      <div className="favorites-page__list">
      {favorites.map((item) => {
        const price = item.base_price || item.price || 0;

        // (ИЗМЕНЕНИЕ) Используем хелперы для изображений
        const imageUrl = getImageUrl(item.images && item.images[0]);
        const { sm: thumbSm, srcSet: thumbSrcSet } = getProductImageSet(imageUrl);
        const hasImageError = imageErrors[item.id];
        const category = item.category_name || item.category;

        return (
          <article key={item.id} className="favorite-item-card">
          <Link to={`/product/${item.id}`} className="favorite-item-card__image-link">
          <div className="favorite-item-card__image-wrapper">
          {!hasImageError ? (
            // (ИЗМЕНЕНИЕ) Адаптивное изображение
            <img
            className="favorite-item-card__image"
            src={thumbSm}
            srcSet={thumbSrcSet}
            sizes="120px"
            alt={item.name}
            loading="lazy"
            onError={() => handleImageError(item.id)}
            />
          ) : (
            <div className="favorite-item-card__placeholder">
            <span>Нет изображения</span>
            </div>
          )}
          </div>
          </Link>
          <div className="favorite-item-card__details">
          <Link to={`/product/${item.id}`} className="favorite-item-card__info-link">
          <div className="favorite-item-card__category">{category}</div>
          <h3 className="favorite-item-card__name">{item.name}</h3>

          {/* (ИЗМЕНЕНИЕ) Селектор размера полностью удален */}

          <div className="favorite-item-card__price">Рекомендованное пожертвование: {price} ₽</div>
          </Link>
          </div>
          <div className="favorite-item-card__actions">
          <button className="btn primary" onClick={() => handleAddToCart(item)}>
          Добавить в корзину
          </button>
          <button
          className="btn secondary"
          onClick={() => handleRemoveFromFavorites(item)}
          >
          Удалить из избранного
          </button>
          </div>
          </article>
        );
      })}
      </div>

      <aside className="favorites-page__summary">
      <div className="favorites-summary-card">
      <h2 className="favorites-summary-card__title">Ваши избранные ({favorites.length})</h2>
      <div className="favorites-summary-card__content">
      <div className="favorites-summary-card__row">
      <span>Количество:</span>
      <span>{favorites.length}</span>
      </div>
      <div className="favorites-summary-card__row favorites-summary-card__row--total">
      <span>Итого:</span>
      <span className="favorites-summary-card__total-amount">{calculateTotal()} ₽</span>
      </div>
      </div>

      <div className="favorites-summary-card__actions">
      <button className="btn primary" onClick={handleAddAllToCart}>
      Добавить все в корзину
      </button>
      <Link to="/shop" className="btn secondary">
      Вернуться в каталог
      </Link>
      </div>
      </div>
      </aside>
      </div>
    ) : (
      <div className="favorites-page__empty-state">
      <p>У вас пока нет избранных товаров</p>
      <Link to="/shop" className="btn primary">
      Перейти в каталог
      </Link>
      </div>
    )}

    <footer className="favorites-page__footer">
    <div className="favorites-page__donation-note">
    <p>
    <strong>Важно:</strong> Рекомендованные суммы пожертвований помогают нам поддерживать качество сувенирной
    продукции. Вы можете выбрать любое вознаграждение и определить размер пожертвования самостоятельно.
    </p>
    </div>
    </footer>
    </div>
    </div>
  );
}

export default FavoritesPage;
