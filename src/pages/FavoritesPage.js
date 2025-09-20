import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

function FavoritesPage({ addToCart }) {
  const { favorites, toggleFavorite } = useAuth();
  const [imageErrors, setImageErrors] = useState({});
  const [sizeSelections, setSizeSelections] = useState({});

  // Обработчик изменения размера
  const handleSizeChange = (item, size) => {
    setSizeSelections((prev) => ({
      ...prev,
      [item.id]: size,
    }));
  };

  // Обработчик добавления в корзину
  const handleAddToCart = (item) => {
    if (item.category === 'Одежда' && !sizeSelections[item.id]) {
      alert('Пожалуйста, выберите размер');
      return;
    }

    const itemToAdd = {
      ...item,
      selectedSize: sizeSelections[item.id],
      // Добавляем недостающие поля для совместимости с корзиной
      category_name: item.category_name || item.category,
      variantId: item.variantId || null,
      sku: item.sku || null,
      color: item.color || null,
    };

    addToCart(itemToAdd);
  };

  // Обработчик добавления всех товаров в корзину
  const handleAddAllToCart = () => {
    let hasErrors = false;
    const itemsToAdd = [];

    favorites.forEach((item) => {
      if (item.category === 'Одежда' && !sizeSelections[item.id]) {
        hasErrors = true;
      } else {
        itemsToAdd.push({
          ...item,
          selectedSize: sizeSelections[item.id],
          // Добавляем недостающие поля для совместимости с корзиной
          category_name: item.category_name || item.category,
          variantId: item.variantId || null,
          sku: item.sku || null,
          color: item.color || null,
        });
      }
    });

    if (hasErrors) {
      alert(
        "Для некоторых товаров не выбран размер. Пожалуйста, выберите размеры для всех товаров категории 'Одежда'."
      );
      return;
    }

    itemsToAdd.forEach((item) => {
      addToCart(item);
    });
  };

  // Обработчик удаления из избранного
  const handleRemoveFromFavorites = async (item) => {
    try {
      await toggleFavorite(item);
    } catch (err) {
      console.error('Ошибка при удалении из избранного:', err);
    }
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = (itemId) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  // Вычисление итоговой суммы
  const calculateTotal = () => {
    return favorites.reduce((sum, item) => {
      const price = item.base_price || item.price || 0;
      return sum + price;
    }, 0);
  };

  // Формирование правильного URL изображения
  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) return `${BASE_URL}${image}`;
    return `${BASE_URL}/uploads${image.startsWith('/') ? '' : '/'}${image}`;
  };

  return (
    <div className="favorites-page">
      <div className="favorites-container">
        <div className="favorites-header">
          <h1>Избранные вознаграждения</h1>
          <p>Выберите вознаграждения, которые вы хотите добавить к вашему пожертвованию</p>
        </div>

        {favorites.length > 0 ? (
          <div className="favorites-content">
            <div className="favorites-list">
              {favorites.map((item) => {
                const price = item.base_price || item.price || 0;
                const imageUrl = getImageUrl(item.images && item.images[0]);
                const hasImageError = imageErrors[item.id];
                // Используем category_name если доступен, иначе category
                const category = item.category_name || item.category;

                return (
                  <div key={item.id} className="favorite-item">
                    <Link to={`/product/${item.id}`} className="favorite-item-image-link">
                      <div className="favorite-item-image">
                        {!hasImageError ? (
                          <img src={imageUrl} alt={item.name} onError={() => handleImageError(item.id)} />
                        ) : (
                          <div className="favorite-image-placeholder">
                            <span>Нет изображения</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="favorite-item-details">
                      <Link to={`/product/${item.id}`} className="favorite-item-link">
                        <h3 className="favorite-item-name">{item.name}</h3>
                        <div className="favorite-item-category">{category}</div>

                        {/* Отображение размера для одежды */}
                        {item.category === 'Одежда' && (
                          <div className="favorite-size-selector">
                            <label htmlFor={`size-${item.id}`}>Размер:</label>
                            <select
                              id={`size-${item.id}`}
                              value={sizeSelections[item.id] || ''}
                              onChange={(e) => handleSizeChange(item, e.target.value)}
                            >
                              <option value="">Выберите размер</option>
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="XXL">XXL</option>
                            </select>
                          </div>
                        )}

                        <div className="favorite-item-price">Рекомендованное пожертвование: {price} ₽</div>
                      </Link>
                    </div>
                    <div className="favorite-item-actions">
                      <button className="favorites-btn favorites-btn-primary" onClick={() => handleAddToCart(item)}>
                        Добавить в корзину
                      </button>
                      <button
                        className="favorites-btn favorites-btn-secondary"
                        onClick={() => handleRemoveFromFavorites(item)}
                      >
                        Удалить из избранного
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="favorites-summary">
              <h2>Ваши избранные вознаграждения ({favorites.length})</h2>
              <div className="favorites-summary-content">
                <div className="favorites-summary-row">
                  <span>Количество:</span>
                  <span>{favorites.length}</span>
                </div>
                <div className="favorites-summary-row favorites-total">
                  <span>Итого:</span>
                  <span className="favorites-total-amount">{calculateTotal()} ₽</span>
                </div>
              </div>

              <div className="favorites-summary-actions">
                <button className="favorites-btn favorites-btn-primary" onClick={handleAddAllToCart}>
                  Добавить все в корзину
                </button>
                <Link to="/shop" className="favorites-btn favorites-btn-secondary">
                  Вернуться в каталог
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="favorites-empty">
            <p>У вас пока нет избранных товаров</p>
            <Link to="/shop" className="favorites-btn favorites-btn-primary">
              Перейти в каталог
            </Link>
          </div>
        )}

        <div className="favorites-footer">
          <div className="favorites-donation-note">
            <p>
              <strong>Важно:</strong> Рекомендованные суммы пожертвований помогают нам поддерживать качество сувенирной
              продукции. Вы можете выбрать любое вознаграждение и определить размер пожертвования самостоятельно.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FavoritesPage;
