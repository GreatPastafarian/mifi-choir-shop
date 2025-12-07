import React, { useState, useEffect, useMemo, useRef } from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, incrementViewCount } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import ProductGallery from '../components/product/ProductGallery';
import { MdCheckCircle } from 'react-icons/md';
import '../styles/pages/product-details-page.css';

function ProductDetailsPage({ addToCart, toggleFavorite, favorites = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastViewedIdRef = useRef(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id || id === 'undefined' || isNaN(parseInt(id))) {
      setError('Некорректный ID товара');
      setLoading(false);
      navigate('/shop');
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productId = parseInt(id);
        const productData = await getProductById(productId);

        if (!productData) {
          throw new Error('Товар не найден');
        }

        setProduct(productData);

        if (lastViewedIdRef.current !== productId) {
          lastViewedIdRef.current = productId;
          try {
            await incrementViewCount(productId);
          } catch (viewError) {
            console.warn('Не удалось обновить счетчик просмотров:', viewError);
          }
        }

        setSelectedAttributes({});
        setQuantity(1);

      } catch (err) {
        console.error('Ошибка при загрузке товара:', err);
        setError(err.message || 'Товар не найден');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const availableAttributes = useMemo(() => {
    const attributesMap = {};
    if (product?.variants) {
      product.variants.forEach((variant) => {
        if (variant.is_available) {
          Object.keys(variant.attributes).forEach((key) => {
            const value = variant.attributes[key];
            if (value && value.trim() !== '') {
              if (!attributesMap[key]) attributesMap[key] = new Set();
              attributesMap[key].add(value);
            }
          });
        }
      });
    }
    Object.keys(attributesMap).forEach((key) => {
      attributesMap[key] = Array.from(attributesMap[key]);
    });
    return attributesMap;
  }, [product?.variants]);

  const attributeKeys = useMemo(() => Object.keys(availableAttributes), [availableAttributes]);
  const hasAttributes = attributeKeys.length > 0;

  const selectedVariant = useMemo(() => {
    if (!hasAttributes && product && product.variants.length > 0) {
      return product.variants[0];
    }
    if (hasAttributes) {
      if (attributeKeys.length !== Object.keys(selectedAttributes).length) {
        return null;
      }
      return product.variants.find((variant) => {
        return attributeKeys.every((key) => {
          return selectedAttributes[key] === variant.attributes[key];
        });
      });
    }
    return null;
  }, [selectedAttributes, product, hasAttributes, attributeKeys]);

  const [displayPrice, currentStock] = useMemo(() => {
    if (!product) {
      return [0, 0];
    }

    if (selectedVariant && selectedVariant.is_available) {
      const price = selectedVariant.price || product.base_price;
      const stock = selectedVariant.quantity;
      return [price, stock];
    }
    if (hasAttributes && !selectedVariant) {
      return [product.base_price, 0];
    }
    return [product.base_price, 0];
  }, [hasAttributes, selectedVariant, product]);

  useEffect(() => {
    if (currentStock === 0) {
      setQuantity(1);
    } else if (quantity > currentStock) {
      setQuantity(currentStock);
    } else if (quantity === 0 && currentStock > 0) {
      setQuantity(1);
    }
  }, [currentStock, quantity]);

  const handleAttributeSelect = (name, value) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [name]: value
    }));
    setQuantity(1);
  };

  useEffect(() => {
    if (product && hasAttributes && Object.keys(selectedAttributes).length === 0) {
      const firstAvailableVariant = product.variants.find(
        v => v.is_available && v.quantity > 0 && Object.keys(v.attributes).length > 0
      );

      if (firstAvailableVariant) {
        setSelectedAttributes(firstAvailableVariant.attributes);
      } else {
        const firstVariant = product.variants.find(v => Object.keys(v.attributes).length > 0);
        if (firstVariant) {
          setSelectedAttributes(firstVariant.attributes);
        }
      }
    }
  }, [product, hasAttributes, selectedAttributes]);

  const handleAddToCart = () => {
    if (currentStock < 1) {
      alert('Этого товара нет в наличии');
      return;
    }
    if (hasAttributes && !selectedVariant) {
      alert('Пожалуйста, выберите все доступные опции');
      return;
    }
    if (quantity > currentStock) {
      alert(`Недостаточно товара на складе (в наличии: ${currentStock})`);
      return;
    }

    const itemToAdd = {
      ...product,
      variantId: selectedVariant.id,
      sku: selectedVariant.sku,
      attributes: selectedVariant.attributes,
      quantity,
      price: displayPrice,
    };

    addToCart(itemToAdd);
  };

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) return 1;
      if (newQuantity > currentStock) return currentStock;
      return newQuantity;
    });
  };

  const handleQuantityInputChange = (e) => {
    let value = parseInt(e.target.value) || 1;
    if (value < 1) value = 1;
    if (value > currentStock && currentStock > 0) value = currentStock;
    setQuantity(value);
  };

  const isFavorite = favorites?.some((fav) => fav.id === product?.id) || false;

  const handleToggleFavorite = () => {
    if (product) {
      toggleFavorite(product);
    }
  };

  if (loading) {
    return (
      <div className="product-page__container product-page__container--centered">
      <h1>Загрузка товара...</h1>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-page__container product-page__container--centered">
      <h1>Товар не найден</h1>
      <p>Извините, запрашиваемый товар не существует.</p>
      <Link to="/shop" className="btn primary product-page__error-btn">
      Вернуться в магазин
      </Link>
      </div>
    );
  }

  // Текст для кнопки в зависимости от состояния
  const getButtonText = () => {
    if (currentStock === 0) return 'Нет в наличии';
    if (hasAttributes && !selectedVariant) return 'Выберите опции';
    return isMobile ? 'В корзину' : 'Добавить в корзину';
  };

  // Статус наличия текстом
  const getStockStatusText = () => {
    if (currentStock === 0) return 'Нет в наличии';
    if (currentStock < 10) return `Осталось ${currentStock} шт.`;
    return 'В наличии';
  };

  return (
    <div className="product-details-page">
    <div className="product-page__container">
    {/* Breadcrumbs - только для десктопа */}
    {!isMobile && (
      <div className="product-page__breadcrumb">
      <Link to="/">Главная</Link>
      <span>›</span>
      <Link to="/shop">Каталог</Link>
      <span>›</span>
      <Link to={`/category/${product.category_id}`}>{product.category_name}</Link>
      <span>›</span>
      <span>{product.name}</span>
      </div>
    )}

    <div className="product-page__main-content">
    <ProductGallery
    images={product.images}
    isFavorite={isFavorite}
    toggleFavorite={handleToggleFavorite}
    />

    <div className="product-page__info">
    {/* Для мобильных: заголовок и категория в одной строке */}
    {isMobile ? (
      <div className="product-page__mobile-header-row">
      <h1 className="product-page__title">{product.name}</h1>
      <div className="product-page__category-breadcrumb">
      <Link to="/shop" className="product-page__category-link">Категории</Link>
      <span className="product-page__category-separator"> : </span>
      <Link
      to={`/category/${product.category_id}`}
      className="product-page__category-link"
      >
      {product.category_name}
      </Link>
      </div>
      </div>
    ) : (
      // Для десктопа
      <>
      <div className="product-page__meta">
      <span className="product-page__category-badge">
      {product.category_name}
      </span>
      {isAdmin && (
        <Link
        to={`/admin/products/edit/${product.id}`}
        className="product-page__admin-edit-link"
        >
        Редактировать товар
        </Link>
      )}
      </div>
      <h1 className="product-page__title">{product.name}</h1>
      </>
    )}

    {/* Цена */}
    <div className="product-page__price">{displayPrice} ₽</div>

    {hasAttributes && (
      <div className="product-page__selectors">
      {attributeKeys.map((name) => (
        <div key={name} className="product-page__selector">
        <div className="product-page__selector-header">
        <h3 className="product-page__selector-title">{name}:</h3>
        {selectedAttributes[name] && (() => {
          const tempVariant = product.variants.find(v =>
          attributeKeys.every(key =>
          selectedAttributes[key] === v.attributes[key]
          )
          );
          if (tempVariant && !tempVariant.is_available) {
            return (
              <span className="product-page__selector-warning">
              Выбранный вариант недоступен
              </span>
            );
          }
          return null;
        })()}
        </div>
        <div className="product-page__selector-options">
        {availableAttributes[name].map((value) => {
          const tempAttributes = { ...selectedAttributes, [name]: value };
          const tempVariant = product.variants.find(v =>
          attributeKeys.every(key =>
          tempAttributes[key] === v.attributes[key]
          )
          );
          const isAvailable = tempVariant?.is_available && tempVariant.quantity > 0;

          return (
            <button
            key={value}
            className={`product-page__option-btn ${selectedAttributes[name] === value ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
            onClick={() => isAvailable && handleAttributeSelect(name, value)}
            disabled={!isAvailable}
            title={!isAvailable ? "Нет в наличии" : ""}
            >
            {value}
            {!isAvailable && <span className="product-page__option-stock"> (нет)</span>}
            </button>
          );
        })}
        </div>
        </div>
      ))}
      </div>
    )}

    {/* Для десктопа: количество и кнопка в основном потоке */}
    {!isMobile && (
      <>
      <div className="product-page__quantity-card">
      <div className="product-page__quantity-header">
      <label htmlFor="quantity" className="product-page__quantity-label">
      Количество:
      </label>
      <div className="product-page__quantity-info">
      <span className="product-page__quantity-total">
      {quantity} × {displayPrice} ₽ = {quantity * displayPrice} ₽
      </span>
      <span className={`product-page__quantity-stock ${currentStock === 0 ? 'out-of-stock' : currentStock < 10 ? 'low-stock' : 'in-stock'}`}>
      {getStockStatusText()}
      </span>
      </div>
      </div>

      <div className="product-page__quantity-control">
      <button
      className="product-page__quantity-btn"
      onClick={() => handleQuantityChange(-1)}
      disabled={quantity <= 1 || currentStock === 0}
      >
      -
      </button>
      <input
      type="number"
      id="quantity"
      className="product-page__quantity-input"
      value={quantity}
      onChange={handleQuantityInputChange}
      min="1"
      max={currentStock > 0 ? currentStock : 1}
      disabled={currentStock === 0}
      />
      <button
      className="product-page__quantity-btn"
      onClick={() => handleQuantityChange(1)}
      disabled={quantity >= currentStock || currentStock === 0}
      >
      +
      </button>
      </div>
      </div>

      <div className="product-page__actions">
      <button
      className={`btn ${currentStock > 0 && (!hasAttributes || selectedVariant) ? 'primary' : 'disabled'} product-page__add-btn`}
      onClick={handleAddToCart}
      disabled={currentStock === 0 || (hasAttributes && !selectedVariant)}
      >
      {getButtonText()}
      </button>
      </div>
      </>
    )}
    </div>

    <div className="product-page__description-section">
    <h2 className="product-page__description-title">Описание</h2>
    <div className="product-page__description-content">
    <p>{product.description}</p>
    {product.materials && (
      <>
      <h3>Материалы и особенности</h3>
      <p>{product.materials}</p>
      </>
    )}
    {product.details && product.details.length > 0 && (
      <ul className="product-page__details-list">
      {product.details.map((detail, index) => (
        <li key={index} className="product-page__details-item">
        <MdCheckCircle size={16} className="product-page__details-icon" />
        {detail}
        </li>
      ))}
      </ul>
    )}
    </div>
    </div>
    </div>
    </div>

    {/* Для мобильных: фиксированная панель с количеством, наличием и кнопкой */}
    {isMobile && (
      <div className="product-page__footer-controls">
      <div className="product-page__footer-grid">
      {/* Левая колонка, верхняя ячейка - количество */}
      <div className="product-page__quantity-control">
      <button
      className="product-page__quantity-btn"
      onClick={() => handleQuantityChange(-1)}
      disabled={quantity <= 1 || currentStock === 0}
      >
      -
      </button>
      <input
      type="number"
      id="quantity"
      className="product-page__quantity-input"
      value={quantity}
      onChange={handleQuantityInputChange}
      min="1"
      max={currentStock > 0 ? currentStock : 1}
      disabled={currentStock === 0}
      />
      <button
      className="product-page__quantity-btn"
      onClick={() => handleQuantityChange(1)}
      disabled={quantity >= currentStock || currentStock === 0}
      >
      +
      </button>
      </div>

      {/* Правая колонка, верхняя ячейка - расчет */}
      <div className="product-page__price-calculation">
      <span className="product-page__price-formula">
      {displayPrice} ₽ × {quantity} = <span className="product-page__total-sum">{quantity * displayPrice} ₽</span>
      </span>
      </div>

      {/* Левая колонка, нижняя ячейка - статус */}
      <div className="product-page__stock-status">
      <span className={`product-page__stock-badge ${currentStock === 0 ? 'out-of-stock' : currentStock < 10 ? 'low-stock' : 'in-stock'}`}>
      {getStockStatusText()}
      </span>
      </div>

      {/* Правая колонка, нижняя ячейка - кнопка */}
      <div className="product-page__add-button">
      <button
      className={`btn ${currentStock > 0 && (!hasAttributes || selectedVariant) ? 'primary' : 'disabled'}`}
      onClick={handleAddToCart}
      disabled={currentStock === 0 || (hasAttributes && !selectedVariant)}
      >
      В корзину
      </button>
      </div>
      </div>
      </div>
    )}
    </div>
  );
}

export default ProductDetailsPage;
