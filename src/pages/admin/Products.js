import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllProducts, deleteProduct } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([getAllProducts(), getAllCategories()]);

        setProducts(productsData);
        setCategories(categoriesData);
        setLoading(false);
      } catch (err) {
        setError('Не удалось загрузить данные');
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, navigate]);

  const handleDelete = async (productId) => {
    if (window.confirm('Вы действительно хотите удалить этот товар?')) {
      try {
        await deleteProduct(productId);
        // Полностью перезагружаем данные после удаления
        const [productsData, categoriesData] = await Promise.all([getAllProducts(), getAllCategories()]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Ошибка при удалении товара:', err);
        setError('Не удалось удалить товар');
        // Перезагружаем данные в случае ошибки
        const productsData = await getAllProducts();
        setProducts(productsData);
      }
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <h1>Загрузка...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <h1>Ошибка</h1>
        <p>{error}</p>
        <button className="btn primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
          Повторить попытку
        </button>
      </div>
    );
  }

  return (
    <div className="admin-products" style={{ marginTop: '4rem' }}>
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <h1>Управление товарами</h1>
          <Link to="/admin/products/new" className="btn primary">
            Добавить товар
          </Link>
        </div>

        {products.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: 'var(--accent-beige)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <p style={{ marginBottom: '1rem' }}>Нет добавленных товаров</p>
            <Link to="/admin/products/new" className="btn primary">
              Добавить первый товар
            </Link>
          </div>
        ) : (
          <div
            className="products-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {products.map((product) => {
              const category = categories.find((c) => c.id === product.category_id);
              return (
                <div
                  key={product.id}
                  className="product-card"
                  style={{
                    background: 'white',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all var(--transition-normal)',
                  }}
                >
                  <div
                    className="product-image"
                    style={{
                      height: '200px',
                      background: `url(${product.images && product.images[0] ? product.images[0] : '/placeholder.jpg'}) no-repeat center center/cover`,
                      position: 'relative',
                    }}
                  >
                    {product.is_new && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: '#d4af37',
                          color: '#0a2240',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                        }}
                      >
                        Новинка
                      </div>
                    )}
                  </div>

                  <div className="product-info" style={{ padding: '1.5rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '1.25rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.4',
                        }}
                      >
                        {product.name}
                      </h3>
                      <span
                        style={{
                          backgroundColor: 'var(--accent-beige)',
                          color: 'var(--primary-dark)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: '600',
                        }}
                      >
                        {product.base_price} ₽
                      </span>
                    </div>

                    {category && (
                      <div
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.9rem',
                          marginBottom: '1rem',
                        }}
                      >
                        {category.name}
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '1rem',
                      }}
                    >
                      <button
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        className="btn secondary"
                        style={{ flex: 1 }}
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="btn secondary"
                        style={{
                          flex: 1,
                          backgroundColor: 'var(--text-light)',
                          color: '#d32f2f',
                          border: '1px solid #d32f2f',
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
