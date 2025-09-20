import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../services/api';

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

  const safeCalculateSubtotal = (items) => {
    return items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
  };

  const subtotal = safeCalculateSubtotal(items);

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

  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) return `${BASE_URL}${image}`;
    return `${BASE_URL}/uploads${image.startsWith('/') ? '' : '/'}${image}`;
  };

  const handleImageError = (itemId, variantId, index) => {
    setImageError((prev) => ({
      ...prev,
      [`${itemId}-${variantId || 'no-variant'}-${index}`]: true,
    }));
  };

  return (
    <div className={'container'}>
      <h1 className={'pageTitle'}>Ваши выбранные вознаграждения</h1>

      <div className={'cartLayout'}>
        <div className={'cartContent'}>
          {Object.entries(groupedItems).map(([categoryName, categoryItems]) => (
            <div key={categoryName} className={'categorySection'}>
              <h2 className={'categoryTitle'}>{categoryName}</h2>
              <div className={'cartItemsList'}>
                {categoryItems.map((item) => {
                  const price = Number(item.price) || 0;
                  const quantity = Number(item.quantity) || 0;
                  const itemTotal = price * quantity;
                  const itemIdKey = `${item.id}-${item.variantId || 'no-variant'}`;

                  const validImages = Array.isArray(item.images) && item.images.length > 0 ? item.images : [];

                  const hasImageError = imageError[`${item.id}-${item.variantId || 'no-variant'}-0`];

                  return (
                    <div key={itemIdKey} className={'cartItemCard'}>
                      <Link to={`/product/${item.id}`} className={'cartItemImageLink'}>
                        <div className={'cartItemImageContainer'}>
                          {validImages.length > 0 && !hasImageError ? (
                            <img
                              src={getImageUrl(validImages[0])}
                              alt={item.name}
                              className={'cartItemImage'}
                              onError={() => handleImageError(item.id, item.variantId, 0)}
                            />
                          ) : (
                            <div className={'cartImagePlaceholder'}>
                              <div className={'imagePlaceholderIcon'}></div>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className={'cartItemDetails'}>
                        <Link to={`/product/${item.id}`} className={'cartItemLink'}>
                          <h3 className={'cartItemName'}>{item.name}</h3>
                          {item.category_name && <div className={'cartItemCategory'}>{item.category_name}</div>}
                          <div className={'cartItemPrice'}>Рекомендованное пожертвование: {price} ₽</div>

                          {item.variantId && (
                            <div className={'cartItemVariant'}>
                              {item.size && `Размер: ${item.size}`}
                              {item.color && (item.size ? `, Цвет: ${item.color}` : `Цвет: ${item.color}`)}
                              {item.sku && ` (Арт: ${item.sku})`}
                            </div>
                          )}
                        </Link>

                        <div className={'cartItemControls'}>
                          <div className={'quantitySelector'}>
                            <label>Количество:</label>
                            <div className={'quantityControl'}>
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

                          <button className={'removeItemButton'} onClick={() => removeItem(item.id, item.variantId)}>
                            Удалить
                          </button>
                        </div>
                      </div>

                      <div className={'cartItemTotal'}>{itemTotal} ₽</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className={'emptyCartState'}>
              <div className={'emptyCartIcon'}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <p className={'emptyCartMessage'}>Вы еще не выбрали вознаграждения</p>
              <Link to="/shop" className={`${'btn'} ${'btnPrimary'}`}>
                Перейти к выбору
              </Link>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={'cartSummary'}>
            <div className={'summaryCard'}>
              <h2 className={'summaryTitle'}>Сводка пожертвования</h2>
              <div className={'summaryContent'}>
                <div className={'summaryRow'}>
                  <span>Сумма рекомендованного пожертвования:</span>
                  <span className={'summaryValue'}>{subtotal} ₽</span>
                </div>

                <div className={'summaryNote'}>
                  <p>
                    <strong>Важно:</strong> Фактический размер пожертвования вы определяете самостоятельно.
                  </p>
                  <p>Выбранные сувениры являются благодарностью за вашу поддержку хора МИФИ.</p>
                </div>

                <Link to="/checkout" className={`${'btn'} ${'btnPrimary'} ${'btnLarge'} ${'fullWidth'}`}>
                  Подтвердить пожертвование
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
