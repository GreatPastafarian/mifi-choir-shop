import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, incrementViewCount } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import ProductGallery from '../components/product/ProductGallery';

function ProductDetailsPage({ addToCart, toggleFavorite, favorites = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Проверка на корректность ID
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

        // Проверяем, что данные пришли в ожидаемом формате
        if (!productData) {
          throw new Error('Товар не найден');
        }

        setProduct(productData);

        // Увеличиваем счетчик просмотров
        await incrementViewCount(productId);

        // Устанавливаем первый доступный вариант как выбранный
        if (productData.variants && productData.variants.length > 0) {
          const availableVariant = productData.variants.find((v) => v.is_available && v.quantity > 0);
          if (availableVariant) {
            setSelectedVariant(availableVariant);
          } else {
            // Если нет доступных вариантов, выбираем первый
            setSelectedVariant(productData.variants[0]);
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке товара:', err);
        setError(err.message || 'Товар не найден');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div
        className="container"
        style={{
          marginTop: '4rem',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h1>Загрузка товара...</h1>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        className="container"
        style={{
          marginTop: '4rem',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h1>Товар не найден</h1>
        <p>Извините, запрашиваемый товар не существует.</p>
        <Link to="/shop" className="btn primary" style={{ marginTop: '1rem' }}>
          Вернуться в магазин
        </Link>
      </div>
    );
  }

  // Проверяем, находится ли товар в избранном (безопасная проверка)
  const isFavorite = favorites?.some((fav) => fav.id === product.id) || false;

  const handleToggleFavorite = () => {
    toggleFavorite(product);
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1); // Сбрасываем количество при смене варианта
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Пожалуйста, выберите вариант товара');
      return;
    }

    if (selectedVariant.quantity < quantity) {
      alert('Недостаточно товара на складе');
      return;
    }

    const itemToAdd = {
      ...product,
      variantId: selectedVariant.id,
      sku: selectedVariant.sku,
      size: selectedVariant.size,
      color: selectedVariant.color,
      quantity,
      price: selectedVariant.price || product.base_price,
    };

    addToCart(itemToAdd);
  };

  return (
    <div className="product-details-page">
      <div
        className="container"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem 4rem',
        }}
      >
        {/* Путь навигации */}
        <div
          className="breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '1rem',
          }}
        >
          <Link to="/">Главная</Link>
          <span>›</span>
          <Link to="/shop">Каталог</Link>
          <span>›</span>
          <Link to={`/category/${product.category_id}`}>{product.category_name}</Link>
          <span>›</span>
          <span>{product.name}</span>
        </div>

        <div
          className="product-details-container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            marginTop: '1rem',
          }}
        >
          {/* Галерея изображений */}
          <ProductGallery
            images={product.images}
            inStock={selectedVariant ? selectedVariant.quantity : 0}
            isFavorite={isFavorite}
            toggleFavorite={handleToggleFavorite}
          />

          {/* Информация о товаре */}
          <div className="product-info">
            <div
              className="product-meta"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <span
                style={{
                  backgroundColor: '#f5f0e5',
                  color: '#8d1f2c',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {product.category_name}
              </span>

              {isAdmin && (
                <Link
                  to={`/admin/products/edit/${product.id}`}
                  style={{
                    marginLeft: 'auto',
                    color: 'var(--primary-accent)',
                    textDecoration: 'underline',
                  }}
                >
                  Редактировать товар
                </Link>
              )}
            </div>

            <h1
              style={{
                fontSize: '2.5rem',
                marginBottom: '1rem',
                lineHeight: '1.2',
              }}
            >
              {product.name}
            </h1>

            <div
              className="product-price-card"
              style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#8d1f2c',
                marginBottom: '2rem',
              }}
            >
              {selectedVariant && selectedVariant.price ? `${selectedVariant.price} ₽` : `${product.base_price} ₽`}
            </div>

            {/* Выбор варианта */}
            {product.variants && product.variants.length > 0 && (
              <div className="variant-selector" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Варианты:</h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '0.5rem',
                  }}
                >
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`variant-option ${selectedVariant?.id === variant.id ? 'selected' : ''}`}
                      style={{
                        padding: '0.75rem',
                        border:
                          selectedVariant?.id === variant.id
                            ? '2px solid #8d1f2c'
                            : variant.is_available && variant.quantity > 0
                              ? '1px solid #ddd'
                              : '1px solid #eee',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: selectedVariant?.id === variant.id ? '#8d1f2c' : 'white',
                        color: selectedVariant?.id === variant.id ? 'white' : '#333',
                        cursor: variant.is_available && variant.quantity > 0 ? 'pointer' : 'not-allowed',
                        opacity: variant.is_available && variant.quantity > 0 ? 1 : 0.5,
                        transition: 'all var(--transition-normal)',
                      }}
                      onClick={() => variant.is_available && variant.quantity > 0 && handleVariantSelect(variant)}
                    >
                      <div style={{ fontWeight: 600 }}>
                        {variant.size && variant.color
                          ? `${variant.size}, ${variant.color}`
                          : variant.size || variant.color || 'Стандарт'}
                      </div>
                      {variant.price && (
                        <div
                          style={{
                            fontSize: '0.85rem',
                            marginTop: '0.25rem',
                            opacity: 0.8,
                          }}
                        >
                          {variant.price} ₽
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: '0.75rem',
                          marginTop: '0.25rem',
                        }}
                      >
                        {variant.quantity > 0 ? `${variant.quantity} в наличии` : 'Нет в наличии'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Контроль количества */}
            <div
              className="quantity-selector"
              style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: '#f5f0e5',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <label
                  htmlFor="quantity"
                  style={{
                    fontWeight: '600',
                    fontSize: '1.1rem',
                  }}
                >
                  Количество:
                </label>
                <span
                  style={{
                    color: '#8d1f2c',
                    fontWeight: '600',
                    fontSize: '1.2rem',
                  }}
                >
                  {quantity} × {selectedVariant && selectedVariant.price ? selectedVariant.price : product.base_price} ₽
                  = {quantity * (selectedVariant && selectedVariant.price ? selectedVariant.price : product.base_price)}{' '}
                  ₽
                </span>
              </div>

              <div
                className="quantity-control"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => {
                    const value = Math.max(1, parseInt(e.target.value) || 1);
                    setQuantity(value);
                  }}
                  min="1"
                  max={selectedVariant ? selectedVariant.quantity : 0}
                  style={{
                    width: '60px',
                    height: '40px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1.1rem',
                  }}
                />
                <button
                  onClick={() =>
                    setQuantity((prev) => Math.min(selectedVariant ? selectedVariant.quantity : 0, prev + 1))
                  }
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Кнопки действий */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <button
                className="btn primary"
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  padding: '1rem',
                  fontSize: '1.1rem',
                }}
                disabled={!selectedVariant || selectedVariant.quantity < 1}
              >
                Добавить в корзину
              </button>
            </div>

            {/* Описание товара */}
            <div
              className="product-description"
              style={{
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid #eee',
              }}
            >
              <h2
                style={{
                  fontSize: '1.8rem',
                  marginBottom: '1.5rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #eee',
                }}
              >
                Описание
              </h2>

              <div className="description-content" style={{ marginBottom: '2rem' }}>
                <p
                  style={{
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                    color: '#555',
                  }}
                >
                  {product.description}
                </p>

                <h3
                  style={{
                    fontSize: '1.3rem',
                    marginBottom: '1rem',
                    color: '#0a2240',
                  }}
                >
                  Материалы и особенности
                </h3>
                <p
                  style={{
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                    color: '#555',
                  }}
                >
                  {product.materials}
                </p>

                <ul
                  style={{
                    listStyle: 'none',
                    paddingLeft: 0,
                    marginBottom: '1.5rem',
                  }}
                >
                  {product.details.map((detail, index) => (
                    <li
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                        color: '#555',
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#8d1f2c"
                        style={{ marginRight: '0.75rem' }}
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
