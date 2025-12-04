import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, getProductImageSet } from '../utils/imageUtils';
import '../styles/pages/favorites-page.css';

function FavoritesPage({ addToCart }) {
  const { favorites, toggleFavorite } = useAuth();
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  // (НОВАЯ ЛОГИКА) Группировка по категориям
  const groupedFavorites = useMemo(() => {
    return favorites.reduce((acc, item) => {
      const category = item.category_name || item.category || 'Без категории';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  }, [favorites]);

  const hasProductVariants = (item) => {
    return item.variants && item.variants.length > 0 &&
      item.variants[0].attributes &&
      Object.keys(item.variants[0].attributes).length > 0;
  };

  const handleAddToCart = (item) => {
    if (!hasProductVariants(item)) {
      const itemToAdd = {
        ...item,
        quantity: 1,
        category_name: item.category_name || item.category,
        variantId: item.variants[0]?.id || item.id,
        sku: item.variants[0]?.sku || null,
        attributes: {},
        price: item.base_price || item.price || 0
      };
      addToCart(itemToAdd);
    } else {
      navigate(`/product/${item.id}`);
    }
  };

  const handleAddAllToCart = () => {
    const simpleItems = favorites.filter(item => !hasProductVariants(item));

    if (simpleItems.length === 0 && favorites.length > 0) {
      alert("Все ваши избранные товары требуют выбора опций. Пожалуйста, перейдите к каждому товару отдельно.");
      return;
    }

    simpleItems.forEach(item => {
      handleAddToCart(item);
    });

    if (simpleItems.length < favorites.length) {
      alert("Товары с выбором опций не были добавлены. Выберите их параметры на странице товара.");
    }
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
    <div className="favorites-page">
      {/* Mobile Header (Contextual) */}
      <div className="favorites-page__mobile-header">
        <h1 className="favorites-page__mobile-title">Избранное</h1>
      </div>

      <div className="favorites-page__container container">
        <div className="favorites-page__header">
          <h1>Избранные вознаграждения</h1>
          <p>Выберите вознаграждения, которые вы хотите добавить к вашему пожертвованию</p>
        </div>

        {favorites.length > 0 ? (
          <div className="favorites-page__content">

            {/* (ИЗМЕНЕНИЕ) Список с группировкой */}
            <div className="favorites-page__list">
              {Object.entries(groupedFavorites).map(([categoryName, categoryItems]) => (
                <section key={categoryName} className="favorites-page__category-section">
                  <h2 className="favorites-page__category-title">{categoryName}</h2>
                  <div className="favorites-page__items-group">
                    {categoryItems.map((item) => {
                      const price = item.base_price || item.price || 0;
                      const imageUrl = getImageUrl(item.images && item.images[0]);
                      const { sm: thumbSm, srcSet: thumbSrcSet } = getProductImageSet(imageUrl);
                      const hasImageError = imageErrors[item.id];
                      const category = item.category_name || item.category;
                      const hasVariants = hasProductVariants(item);

                      return (
                        <article key={item.id} className="favorite-item-card">
                          <Link to={`/product/${item.id}`} className="favorite-item-card__image-link">
                            <div className="favorite-item-card__image-wrapper">
                              {!hasImageError ? (
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
                                  <span>Нет фото</span>
                                </div>
                              )}
                            </div>
                          </Link>

                          <div className="favorite-item-card__details">
                            <Link to={`/product/${item.id}`} className="favorite-item-card__info-link">
                              <div className="favorite-item-card__category">{category}</div>
                              <h3 className="favorite-item-card__name">{item.name}</h3>
                            </Link>
                            {/* (ИЗМЕНЕНИЕ) Цена вынесена в отдельный блок внутри details, но сверстана лучше */}
                            <div className="favorite-item-card__price-block">
                              <span className="favorite-item-card__price-label">Пожертвование:</span>
                              <span className="favorite-item-card__price-value">{price} ₽</span>
                            </div>
                          </div>

                          <div className="favorite-item-card__actions">
                            {hasVariants ? (
                              <Link to={`/product/${item.id}`} className="btn primary btn--full-width">
                                Выбрать опции
                              </Link>
                            ) : (
                              <button className="btn primary btn--full-width" onClick={() => handleAddToCart(item)}>
                                В корзину
                              </button>
                            )}

                            <button
                              className="btn secondary btn--full-width"
                              onClick={() => handleRemoveFromFavorites(item)}
                            >
                              Удалить
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
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
                    Добавить доступные в корзину
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

        {/* Футер и примечание остались без изменений */}
        <footer className="favorites-page__footer">
          <div className="favorites-page__donation-note">
            <p><strong>Важно:</strong> Рекомендованные суммы пожертвований помогают нам поддерживать качество сувенирной продукции. Вы можете выбрать любое вознаграждение и определить размер пожертвования самостоятельно.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default FavoritesPage;
