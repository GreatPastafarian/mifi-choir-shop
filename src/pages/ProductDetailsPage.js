import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, incrementViewCount } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import ProductGallery from '../components/product/ProductGallery';

// (Иконка для списка "детали")
import { MdCheckCircle } from 'react-icons/md';

function ProductDetailsPage({ addToCart, toggleFavorite, favorites = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        try {
          await incrementViewCount(productId);
        } catch (viewError) {
          console.warn('Не удалось обновить счетчик просмотров:', viewError);
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

  // Динамически получаем АТРИБУТЫ (S, M, L, Red...)
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

  // Определяем, есть ли у товара АТРИБУТЫ ("товар с выбором")
  const attributeKeys = useMemo(() => Object.keys(availableAttributes), [availableAttributes]);
  const hasAttributes = attributeKeys.length > 0;

  // Ищем ВЫБРАННЫЙ ВАРИАНT
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

  // 2. (ИСПРАВЛЕНИЕ ESLint) Определяем ЦЕНУ и ОСТАТОК
  const [displayPrice, currentStock] = useMemo(() => {

    // --- ИСПРАВЛЕНИЕ ---
    // Добавляем "защиту" на случай, если product === null
    if (!product) {
      return [0, 0]; // Возвращаем значения по умолчанию, пока продукт не загружен
    }
    // --- Конец исправления ---

    if (selectedVariant && selectedVariant.is_available) {
      const price = selectedVariant.price || product.base_price;
      const stock = selectedVariant.quantity;
      return [price, stock];
    }
    if (hasAttributes && !selectedVariant) {
      return [product.base_price, 0];
    }
    return [product.base_price, 0];

    // Также лучше поменять зависимость с product?.base_price на 'product'
  }, [hasAttributes, selectedVariant, product]);

  // Сбрасываем количество, если выбрали > чем есть
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
    // Убедимся, что продукт загружен, у него есть атрибуты,
    // и пользователь еще ничего не выбрал вручную
    if (product && hasAttributes && Object.keys(selectedAttributes).length === 0) {

      // 1. Ищем первый вариант, который ЕСТЬ В НАЛИЧИИ
      const firstAvailableVariant = product.variants.find(
        v => v.is_available && v.quantity > 0 && Object.keys(v.attributes).length > 0
      );

      if (firstAvailableVariant) {
        // Если нашли - устанавливаем его атрибуты
        setSelectedAttributes(firstAvailableVariant.attributes);
      } else {
        // 2. Если все не в наличии, выбираем просто первый вариант из списка
        const firstVariant = product.variants.find(v => Object.keys(v.attributes).length > 0);
        if (firstVariant) {
          setSelectedAttributes(firstVariant.attributes);
        }
      }
    }
  }, [product, hasAttributes, selectedAttributes]); // Зависимости

  const handleAddToCart = () => {
    if (currentStock < 1) {
      alert('Этого товара нет в наличии');
      return;
    }
    if (hasAttributes && !selectedVariant) {
      alert('Пожалуйста, выберите все доступные опции (например, размер и цвет)');
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

  // ----- РЕНДЕРИНГ -----

  if (loading) {
    return (
      <div className="container product-page__container--centered">
      <h1>Загрузка товара...</h1>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container product-page__container--centered">
      <h1>Товар не найден</h1>
      <p>Извините, запрашиваемый товар не существует.</p>
      <Link to="/shop" className="btn primary product-page__error-btn">
      Вернуться в магазин
      </Link>
      </div>
    );
  }

  return (
    <div className="product-details-page">
    <div className="product-page__container">
    {/* Хлебные крошки */}
    <div className="product-page__breadcrumb">
    <Link to="/">Главная</Link>
    <span>›</span>
    <Link to="/shop">Каталог</Link>
    <span>›</span>
    <Link to={`/category/${product.category_id}`}>{product.category_name}</Link>
    <span>›</span>
    <span>{product.name}</span>
    </div>

    <div className="product-page__main-content">
    {/* Галерея */}
    <ProductGallery
    images={product.images}
    inStock={currentStock}
    selectionMade={!!selectedVariant}
    isFavorite={isFavorite}
    toggleFavorite={handleToggleFavorite}
    />

    {/* Информация о товаре */}
    <div className="product-page__info">
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

    <div className="product-page__price">
    {displayPrice} ₽
    </div>

    {/* Динамический селектор вариантов */}
    {hasAttributes ? (
      <div className="product-page__selectors">
      {attributeKeys.map((name) => (
        <div key={name} className="product-page__selector">
        <h3 className="product-page__selector-title">{name}:</h3>
        <div className="product-page__selector-options">
        {availableAttributes[name].map((value) => {
          const isOptionAvailable = true; // (TODO: Add advanced availability check)

        return (
          <button
          key={value}
          className={`product-page__option-btn ${
            selectedAttributes[name] === value ? 'selected' : ''
          }`}
          onClick={() => handleAttributeSelect(name, value)}
          disabled={!isOptionAvailable}
          >
          {value}
          </button>
        );
        })}
        </div>
        </div>
      ))}
      </div>
    ) : (
      null // Это "простой" товар, селекторы не нужны
    )}

    {/* Контроль количества */}
    <div className="product-page__quantity-card">
    <div className="product-page__quantity-header">
    <label htmlFor="quantity" className="product-page__quantity-label">
    Количество:
    </label>
    <span className="product-page__quantity-total">
    {quantity} × {displayPrice} ₽ = {quantity * displayPrice} ₽
    </span>
    </div>

    <div className="product-page__quantity-control">
    <button
    className="product-page__quantity-btn"
    onClick={() => handleQuantityChange(-1)}
    disabled={quantity <= 1}
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

    {/* Кнопки действий */}
    <div className="product-page__actions">
    <button
    className="btn primary product-page__add-btn"
    onClick={handleAddToCart}
    disabled={currentStock === 0 || (hasAttributes && !selectedVariant)}
    >
    {currentStock > 0 ? 'Добавить в корзину' : 'Нет в наличии'}
    </button>
    </div>
    </div>

    {/* Описание товара */}
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
    </div>
  );
}

export default ProductDetailsPage;
