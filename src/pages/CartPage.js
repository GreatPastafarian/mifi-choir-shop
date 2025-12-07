import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl, getProductImageSet } from '../utils/imageUtils';
import {
  MdShoppingCart,
  MdArrowBack,
  MdDelete,
  MdAdd,
  MdRemove,
  MdChevronRight,
  MdOutlineShoppingBag,
  MdCheckBoxOutlineBlank,
  MdCheckBox,
  MdDeleteOutline,
  MdRadioButtonUnchecked,
  MdRadioButtonChecked
} from 'react-icons/md';
import { IoGift } from 'react-icons/io5';
import useMediaQuery from '../hooks/useMediaQuery';
import '../styles/pages/cart-page.css';

function CartPage({ cartItems, updateCart }) {
  const [items, setItems] = useState(cartItems);
  const [imageError, setImageError] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

  // Инициализация выбранных товаров (все выбраны по умолчанию)
  useEffect(() => {
    setItems(cartItems);
    setImageError({});

    const initialSelected = {};
    cartItems.forEach(item => {
      const key = `${item.id}-${item.variantId || 'no-variant'}`;
      initialSelected[key] = true;
    });
    setSelectedItems(initialSelected);
  }, [cartItems]);

  // Группировка товаров по категориям
  const groupedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      const category = item.category_name || item.category || 'Без категории';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  }, [items]);

  // Сумма только выбранных товаров
  const selectedSubtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const key = `${item.id}-${item.variantId || 'no-variant'}`;
      if (selectedItems[key]) {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + price * quantity;
      }
      return sum;
    }, 0);
  }, [items, selectedItems]);

  // Количество выбранных товаров
  const totalSelectedItems = useMemo(() => {
    return Object.values(selectedItems).filter(Boolean).length;
  }, [selectedItems]);

  // Проверка, выбраны ли все товары
  const allItemsSelected = useMemo(() => {
    if (items.length === 0) return false;
    return items.every(item => {
      const key = `${item.id}-${item.variantId || 'no-variant'}`;
      return selectedItems[key];
    });
  }, [items, selectedItems]);

  // Проверка, выбран ли хотя бы один товар
  const hasSelectedItems = useMemo(() => {
    return totalSelectedItems > 0;
  }, [totalSelectedItems]);

  // Обновление количества товара
  const updateQuantity = (id, quantity, variantId) => {
    const newItems = items
    .map((item) => (item.id === id && item.variantId === variantId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
    setItems(newItems);
    updateCart(newItems);
  };

  // Удаление одного товара
  const removeItem = (id, variantId) => {
    const key = `${id}-${variantId || 'no-variant'}`;
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      delete newSelected[key];
      return newSelected;
    });

    const newItems = items.filter((item) => !(item.id === id && item.variantId === variantId));
    setItems(newItems);
    updateCart(newItems);
  };

  // Удаление всех выбранных товаров
  const removeSelectedItems = () => {
    const newItems = items.filter(item => {
      const key = `${item.id}-${item.variantId || 'no-variant'}`;
      return !selectedItems[key];
    });

    const newSelected = {};
    newItems.forEach(item => {
      const key = `${item.id}-${item.variantId || 'no-variant'}`;
      newSelected[key] = true;
    });

    setItems(newItems);
    setSelectedItems(newSelected);
    updateCart(newItems);
  };

  const handleImageError = (itemIdKey) => {
    setImageError((prev) => ({ ...prev, [itemIdKey]: true }));
  };

  const renderAttributes = (attributes) => {
    if (!attributes || Object.keys(attributes).length === 0) {
      return null;
    }
    return Object.entries(attributes)
    .map(([key, value]) => `${value}`)
    .join(', ');
  };

  // Переключение выбора отдельного товара
  const toggleSelectItem = (itemIdKey) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemIdKey]: !prev[itemIdKey]
    }));
  };

  // Выбрать все товары
  const selectAll = () => {
    const allSelected = {};
    items.forEach(item => {
      const key = `${item.id}-${item.variantId || 'no-variant'}`;
      allSelected[key] = true;
    });
    setSelectedItems(allSelected);
  };

  // Снять выделение со всех товаров
  const deselectAll = () => {
    setSelectedItems({});
  };

  // Быстрое увеличение/уменьшение количества
  const quickUpdateQuantity = (id, change, variantId) => {
    const item = items.find(item => item.id === id && item.variantId === variantId);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + change);
    updateQuantity(id, newQuantity, variantId);
  };

  // ====================== ДЕСКТОПНАЯ ВЕРСИЯ ======================
  // Компонент для десктопной карточки товара
  const DesktopCartItem = ({ item }) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    const itemTotal = price * quantity;
    const itemIdKey = `${item.id}-${item.variantId || 'no-variant'}`;
    const isSelected = selectedItems[itemIdKey];

    const imageUrl = getImageUrl(item.images && item.images[0]);
    const { sm: thumbSm, srcSet: thumbSrcSet } = getProductImageSet(imageUrl);
    const hasImageError = imageError[itemIdKey];
    const attributesText = renderAttributes(item.attributes);

    return (
      <article className="cart-item-card">
      <Link to={`/product/${item.id}`} className="cart-item-card__image-link">
      <div className="cart-item-card__image-wrapper">
      {!hasImageError ? (
        <img
        className="cart-item-card__image"
        src={thumbSm}
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
      <div className="cart-item-card__main-info">
      <Link to={`/product/${item.id}`} className="cart-item-card__info-link">
      <h3 className="cart-item-card__name">{item.name}</h3>
      {item.category_name && <div className="cart-item-card__category">{item.category_name}</div>}
      <div className="cart-item-card__price">Рекомендованное пожертвование: {price} ₽</div>

      {attributesText && (
        <div className="cart-item-card__variant">{attributesText}</div>
      )}
      {item.sku && <div className="cart-item-card__sku">(Арт: {item.sku})</div>}
      </Link>
      </div>

      <div className="cart-item-card__controls">
      <div className="cart-item-card__quantity-section">
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
      </div>

      <div className="cart-item-card__right-section">
      <div className="cart-item-card__selection-actions">
      <button
      className={`cart-item-card__checkbox ${isSelected ? 'checked' : ''}`}
      onClick={() => toggleSelectItem(itemIdKey)}
      aria-label={isSelected ? 'Отменить выбор' : 'Выбрать товар'}
      >
      {isSelected ? <MdRadioButtonChecked size={28} /> : <MdRadioButtonUnchecked size={28} />}
      </button>
      <button
      className="cart-item-card__remove-btn"
      onClick={() => removeItem(item.id, item.variantId)}
      title="Удалить товар"
      >
      Удалить
      </button>
      </div>
      <div className="cart-item-card__total">{itemTotal} ₽</div>
      </div>
      </div>
      </div>
      </article>
    );
  };

  // Компонент для пустой корзины (десктоп)
  const DesktopEmptyState = () => (
    <div className="cart-page__empty-state">
    <MdShoppingCart className="cart-page__empty-icon" />
    <p className="cart-page__empty-message">Вы еще не выбрали вознаграждения</p>
    <Link to="/shop" className="btn primary">
    Перейти к выбору
    </Link>
    </div>
  );

  // ====================== МОБИЛЬНАЯ ВЕРСИЯ ======================
  // Компонент для мобильной карточки товара
  const MobileCartItem = ({ item }) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    const itemTotal = price * quantity;
    const itemIdKey = `${item.id}-${item.variantId || 'no-variant'}`;
    const isSelected = selectedItems[itemIdKey];

    const imageUrl = getImageUrl(item.images && item.images[0]);
    const { sm: thumbSm } = getProductImageSet(imageUrl);
    const hasImageError = imageError[itemIdKey];
    const attributesText = renderAttributes(item.attributes);

    return (
      <div className={`cart-mobile-item ${isSelected ? 'selected' : ''}`}>
      <div className="cart-mobile-item__top">
      <div className="cart-mobile-item__selection">
      <button
      className={`cart-mobile-item__checkbox ${isSelected ? 'checked' : ''}`}
      onClick={() => toggleSelectItem(itemIdKey)}
      aria-label={isSelected ? 'Отменить выбор' : 'Выбрать товар'}
      >
      {isSelected ? <MdRadioButtonChecked size={20} /> : <MdRadioButtonUnchecked size={20} />}
      </button>
      </div>

      <Link to={`/product/${item.id}`} className="cart-mobile-item__image-link">
      <div className="cart-mobile-item__image-wrapper">
      {!hasImageError ? (
        <img
        className="cart-mobile-item__image"
        src={thumbSm}
        alt={item.name}
        loading="lazy"
        onError={() => handleImageError(itemIdKey)}
        />
      ) : (
        <div className="cart-mobile-item__image-placeholder">
        <IoGift size={20} color="#ccc" />
        </div>
      )}
      </div>
      </Link>

      <div className="cart-mobile-item__info">
      <Link to={`/product/${item.id}`} className="cart-mobile-item__name-link">
      <h3 className="cart-mobile-item__name">{item.name}</h3>
      </Link>

      {attributesText && (
        <div className="cart-mobile-item__variant">{attributesText}</div>
      )}

      <div className="cart-mobile-item__price">Цена: {price} ₽</div>

      {item.sku && <div className="cart-mobile-item__sku">Арт: {item.sku}</div>}
      </div>
      </div>

      <div className="cart-mobile-item__bottom">
      <div className="cart-mobile-item__quantity-control">
      <button
      className="cart-mobile-item__quantity-btn cart-mobile-item__quantity-btn--minus"
      onClick={() => quickUpdateQuantity(item.id, -1, item.variantId)}
      disabled={quantity <= 1}
      aria-label="Уменьшить количество"
      >
      <MdRemove size={16} />
      </button>

      <div className="cart-mobile-item__quantity-display">
      <span className="cart-mobile-item__quantity-value">{quantity}</span>
      <span className="cart-mobile-item__quantity-label">шт</span>
      </div>

      <button
      className="cart-mobile-item__quantity-btn cart-mobile-item__quantity-btn--plus"
      onClick={() => quickUpdateQuantity(item.id, 1, item.variantId)}
      aria-label="Увеличить количество"
      >
      <MdAdd size={16} />
      </button>
      </div>

      <div className="cart-mobile-item__right-section">
      <div className="cart-mobile-item__total">
      <span className="cart-mobile-item__total-label">Сумма:</span>
      <span className="cart-mobile-item__total-amount">{itemTotal} ₽</span>
      </div>

      <button
      className="cart-mobile-item__remove-btn"
      onClick={() => removeItem(item.id, item.variantId)}
      aria-label="Удалить товар"
      >
      <MdDelete size={18} />
      </button>
      </div>
      </div>
      </div>
    );
  };

  // Компонент для мобильного фиксированного футера
  const MobileFooter = () => {
    if (items.length === 0) return null;

    return (
      <div className="cart-mobile-footer">
      <div className="cart-mobile-footer__top">
      <button
      className="cart-mobile-footer__select-all"
      onClick={allItemsSelected ? deselectAll : selectAll}
      >
      <div className={`cart-mobile-footer__checkbox ${allItemsSelected ? 'checked' : ''}`}>
      {allItemsSelected ? <MdCheckBox size={18} /> : <MdCheckBoxOutlineBlank size={18} />}
      </div>
      <span>{allItemsSelected ? 'Снять всё' : 'Выбрать все'}</span>
      </button>

      <button
      className="cart-mobile-footer__delete-selected"
      onClick={removeSelectedItems}
      disabled={!hasSelectedItems}
      >
      <MdDeleteOutline size={18} />
      </button>
      </div>

      <div className="cart-mobile-footer__bottom">
      <div className="cart-mobile-footer__info">
      <div className="cart-mobile-footer__total">
      <span>Итого:</span>
      <span className="cart-mobile-footer__amount">{selectedSubtotal} ₽</span>
      </div>
      <div className="cart-mobile-footer__count">
      {totalSelectedItems} {totalSelectedItems === 1 ? 'товар' : totalSelectedItems <= 4 ? 'товара' : 'товаров'}
      </div>
      </div>

      <button
      className={`cart-mobile-footer__checkout-btn ${!hasSelectedItems ? 'disabled' : ''}`}
      onClick={() => hasSelectedItems && navigate('/checkout')}
      disabled={!hasSelectedItems}
      >
      Оформить
      <MdChevronRight size={20} />
      </button>
      </div>
      </div>
    );
  };

  // Компонент для пустой корзины на мобилке
  const MobileEmptyState = () => (
    <div className="cart-mobile-empty">
    <div className="cart-mobile-empty__icon">
    <MdOutlineShoppingBag size={64} />
    </div>
    <h2 className="cart-mobile-empty__title">Корзина пуста</h2>
    <p className="cart-mobile-empty__message">
    Добавьте товары из каталога, чтобы сделать пожертвование
    </p>
    <button
    className="cart-mobile-empty__btn"
    onClick={() => navigate('/shop')}
    >
    Перейти в каталог
    </button>
    </div>
  );

  // Десктопная версия
  if (!isMobile) {
    return (
      <div className="cart-page">
      <div className="cart-page__container container">
      <h1 className="cart-page__title">Ваши выбранные вознаграждения</h1>

      <div className="cart-page__layout">
      <div className="cart-page__content">
      {Object.entries(groupedItems).map(([categoryName, categoryItems]) => (
        <section key={categoryName} className="cart-page__category-section">
        <h2 className="cart-page__category-title">{categoryName}</h2>
        <div className="cart-page__items-list">
        {categoryItems.map((item) => (
          <DesktopCartItem key={`${item.id}-${item.variantId || 'no-variant'}`} item={item} />
        ))}
        </div>
        </section>
      ))}

      {items.length === 0 && <DesktopEmptyState />}
      </div>

      {items.length > 0 && (
        <aside className="cart-page__summary">
        <div className="cart-summary-card">
        <div className="cart-summary-card__header">
        <h2 className="cart-summary-card__title">Сводка пожертвования</h2>
        </div>

        <div className="cart-summary-card__selection-controls">
        <button
        className="cart-summary-card__select-all-btn"
        onClick={allItemsSelected ? deselectAll : selectAll}
        >
        <div className="cart-summary-card__checkbox-wrapper">
        {allItemsSelected ? <MdCheckBox size={22} /> : <MdCheckBoxOutlineBlank size={22} />}
        </div>
        <span>{allItemsSelected ? 'Снять выделение' : 'Выбрать все'}</span>
        </button>

        {hasSelectedItems && (
          <button
          className="cart-summary-card__delete-selected-btn"
          onClick={removeSelectedItems}
          >
          <div className="cart-summary-card__delete-icon">
          <MdDeleteOutline size={18} />
          </div>
          <span>Удалить выбранные</span>
          </button>
        )}
        </div>

        <div className="cart-summary-card__content">
        <div className="cart-summary-card__info">
        <div className="cart-summary-card__info-row">
        <span>Товаров:</span>
        <span className="cart-summary-card__info-value">{totalSelectedItems} шт</span>
        </div>
        <div className="cart-summary-card__info-row cart-summary-card__info-row--total">
        <span>Сумма:</span>
        <span className="cart-summary-card__info-value cart-summary-card__info-value--total">
        {selectedSubtotal} ₽
        </span>
        </div>
        </div>

        <div className="cart-summary-card__note">
        <p>
        <strong>Важно:</strong> Фактический размер пожертвования вы определяете самостоятельно.
        </p>
        <p>Выбранные сувениры являются благодарностью за вашу поддержку хора МИФИ.</p>
        </div>

        <button
        className={`btn primary btn-size-lg cart-summary-card__checkout-btn ${!hasSelectedItems ? 'disabled' : ''}`}
        onClick={() => hasSelectedItems && navigate('/checkout')}
        disabled={!hasSelectedItems}
        >
        Подтвердить пожертвование
        </button>
        </div>
        </div>
        </aside>
      )}
      </div>
      </div>
      </div>
    );
  }

  // Мобильная версия с новым дизайном
  return (
    <div className="cart-mobile">
    {/* Хедер */}
    <header className="cart-mobile__header">
    <h1 className="cart-mobile__title">Корзина</h1>
    </header>

    {/* Основной контент */}
    <main className="cart-mobile__content">
    {items.length === 0 ? (
      <MobileEmptyState />
    ) : (
      <div className="cart-mobile__items">
      {/* Информационная карточка - теперь в основном потоке, над товарами */}
      <div className="cart-mobile__info">
      <div className="cart-mobile__info-card">
      <div className="cart-mobile__info-icon">
      <IoGift size={20} />
      </div>
      <div className="cart-mobile__info-content">
      <p className="cart-mobile__info-text">
      Выбранные сувениры — благодарность за вашу поддержку хора МИФИ
      </p>
      </div>
      </div>
      </div>

      {/* Категории и товары */}
      {Object.entries(groupedItems).map(([categoryName, categoryItems]) => (
        <div key={categoryName} className="cart-mobile-category">
        <div className="cart-mobile-category__header">
        <h2 className="cart-mobile-category__title">{categoryName}</h2>
        <span className="cart-mobile-category__count">{categoryItems.length}</span>
        </div>
        <div className="cart-mobile-category__items">
        {categoryItems.map((item) => (
          <MobileCartItem key={`${item.id}-${item.variantId || 'no-variant'}`} item={item} />
        ))}
        </div>
        </div>
      ))}
      </div>
    )}
    </main>

    {/* Футер */}
    {items.length > 0 && <MobileFooter />}
    </div>
  );
}

export default CartPage;
