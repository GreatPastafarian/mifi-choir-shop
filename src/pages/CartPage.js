import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl, getProductImageSet } from '../utils/imageUtils'; // 1. Импорт хелперов
import { MdShoppingCart } from 'react-icons/md';
import '../styles/pages/cart-page.css'; // 2. Импорт БЭМ-стилей

function CartPage({ cartItems, updateCart }) {
  const [items, setItems] = useState(cartItems);
  const [imageError, setImageError] = useState({});

  useEffect(() => {
    setItems(cartItems);
    setImageError({});
  }, [cartItems]);

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category_name || item.category || 'Без категории';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + price * quantity;
  }, 0);

  const updateQuantity = (id, quantity, variantId) => {
    const newItems = items
      .map((item) => (item.id === id && item.variantId === variantId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    setItems(newItems);
    updateCart(newItems);
  };

  const removeItem = (id, variantId) => {
    const newItems = items.filter((item) => !(item.id === id && item.variantId === variantId));
    setItems(newItems);
    updateCart(newItems);
  };

  const handleImageError = (itemIdKey) => {
    setImageError((prev) => ({ ...prev, [itemIdKey]: true }));
  };

  // 3. (НОВАЯ ЛОГИКА) Рендеринг атрибутов
  const renderAttributes = (attributes) => {
    if (!attributes || Object.keys(attributes).length === 0) {
      return null;
    }
    return Object.entries(attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  // 4. (УДАЛЕНО) Локальная функция getImageUrl

  return (
    <div className="cart-page">
      {/* Mobile Header (Contextual) */}
      <div className="cart-page__mobile-header">
        <h1 className="cart-page__mobile-title">Корзина</h1>
      </div>

      <div className="cart-page__container container">
        <h1 className="cart-page__title">Ваши выбранные вознаграждения</h1>

        <div className="cart-page__layout">
          <div className="cart-page__content">
            {Object.entries(groupedItems).map(([categoryName, categoryItems]) => (
              <section key={categoryName} className="cart-page__category-section">
                <h2 className="cart-page__category-title">{categoryName}</h2>
                <div className="cart-page__items-list">
                  {categoryItems.map((item) => {
                    const price = Number(item.price) || 0;
                    const quantity = Number(item.quantity) || 0;
                    const itemTotal = price * quantity;
                    const itemIdKey = `${item.id}-${item.variantId || 'no-variant'}`;

                    // 5. (ИЗМЕНЕНИЕ) Используем хелперы для изображений
                    const imageUrl = getImageUrl(item.images && item.images[0]);
                    const { sm: thumbSm, srcSet: thumbSrcSet } = getProductImageSet(imageUrl);
                    const hasImageError = imageError[itemIdKey];
                    const attributesText = renderAttributes(item.attributes);

                    return (
                      <article key={itemIdKey} className="cart-item-card">
                        <Link to={`/product/${item.id}`} className="cart-item-card__image-link">
                          <div className="cart-item-card__image-wrapper">
                            {!hasImageError ? (
                              <img
                                className="cart-item-card__image"
                                src={thumbSm} // Маленькая версия
                                srcSet={thumbSrcSet}
                                sizes="120px"
                                alt={item.name}
                                loading="lazy"
                                onError={() => handleImageError(itemIdKey)}
                              />
                            ) : (
                              <div className="cart-item-card__placeholder">
                                <div className="cart-item-card__placeholder-icon"></div>
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="cart-item-card__details">
                          <Link to={`/product/${item.id}`} className="cart-item-card__info-link">
                            <h3 className="cart-item-card__name">{item.name}</h3>
                            {item.category_name && <div className="cart-item-card__category">{item.category_name}</div>}
                            <div className="cart-item-card__price">Рекомендованное пожертвование: {price} ₽</div>

                            {/* 6. (ИЗМЕНЕНИЕ) Динамический рендер атрибутов */}
                            {attributesText && (
                              <div className="cart-item-card__variant">{attributesText}</div>
                            )}
                            {item.sku && <div className="cart-item-card__sku">(Арт: {item.sku})</div>}
                          </Link>

                          <div className="cart-item-card__controls">
                            <div className="quantity-selector">
                              <label>Количество:</label>
                              <div className="quantity-selector__control">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}>
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={quantity}
                                  onChange={(e) => {
                                    const value = Math.max(1, parseInt(e.target.value) || 1);
                                    updateQuantity(item.id, value, item.variantId);
                                  }}
                                  min="1"
                                />
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}>
                                  +
                                </button>
                              </div>
                            </div>
                            <button className="cart-item-card__remove-btn" onClick={() => removeItem(item.id, item.variantId)}>
                              Удалить
                            </button>
                          </div>
                        </div>
                        <div className="cart-item-card__total">{itemTotal} ₽</div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}

            {items.length === 0 && (
              <div className="cart-page__empty-state">
                <MdShoppingCart className="cart-page__empty-icon" />
                <p className="cart-page__empty-message">Вы еще не выбрали вознаграждения</p>
                <Link to="/shop" className="btn primary">
                  Перейти к выбору
                </Link>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <aside className="cart-page__summary">
              <div className="cart-summary-card">
                <h2 className="cart-summary-card__title">Сводка пожертвования</h2>
                <div className="cart-summary-card__content">
                  <div className="cart-summary-card__row">
                    <span>Сумма рекомендованного пожертвования:</span>
                    <span className="cart-summary-card__value">{subtotal} ₽</span>
                  </div>
                  <div className="cart-summary-card__note">
                    <p>
                      <strong>Важно:</strong> Фактический размер пожертвования вы определяете самостоятельно.
                    </p>
                    <p>Выбранные сувениры являются благодарностью за вашу поддержку хора МИФИ.</p>
                  </div>
                  <Link to="/checkout" className="btn primary btn-size-lg cart-summary-card__checkout-btn">
                    Подтвердить пожертвование
                  </Link>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartPage;
