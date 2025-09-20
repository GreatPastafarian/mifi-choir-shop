import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCategories } from '../services/categoryService'; // Используем правильный сервис
import { useAuth } from '../context/AuthContext';
import choirBackground from '../assets/images/choir-background.jpg';

function ShopPage({ addToCart }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Загружаем категории
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (err) {
        setError('Не удалось загрузить категории');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
        <h1>Загрузка магазина...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container"
        style={{
          marginTop: '4rem',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h1>Ошибка</h1>
        <p>{error}</p>
        <button className="btn primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
          Повторить попытку
        </button>
      </div>
    );
  }

  return (
    <div className="shop-page">
      {/* Герой-баннер для магазина */}
      <section
        className="shop-hero"
        style={{
          height: '300px',
          background: `linear-gradient(rgba(10, 34, 64, 0.8), rgba(10, 34, 64, 0.8)), url(${choirBackground}) no-repeat center center/cover`,
          display: 'flex',
          alignItems: 'center',
          color: '#fff',
          padding: '0 16px',
        }}
      >
        <div className="container">
          <h1>Сувенирная продукция хора МИФИ</h1>
          <p>Выберите вознаграждение за пожертвование и поддержите наш хор</p>
        </div>
      </section>

      {/* Категории товаров */}
      <section className="shop-categories">
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <h2>Категории товаров</h2>
            {isAdmin && (
              <Link to="/admin" className="btn secondary">
                Админ-панель
              </Link>
            )}
          </div>

          {categories.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: 'var(--accent-beige)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <p style={{ marginBottom: '1rem' }}>Нет доступных категорий</p>
              {isAdmin && (
                <Link to="/admin" className="btn primary">
                  Перейти в админ-панель
                </Link>
              )}
            </div>
          ) : (
            <div
              className="categories-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="category-card"
                  style={{
                    background: 'white',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all var(--transition-normal)',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/category/${category.id}`)}
                >
                  <div
                    className="category-image"
                    style={{
                      height: '200px',
                      background: `url(${category.image || '/category-placeholder.jpg'}) no-repeat center center/cover`,
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '1rem',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                        color: 'white',
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '1.5rem',
                          lineHeight: '1.2',
                        }}
                      >
                        {category.name}
                      </h3>
                    </div>
                  </div>
                  <div className="category-info" style={{ padding: '1.5rem' }}>
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        lineHeight: '1.6',
                        marginBottom: '1.5rem',
                      }}
                    >
                      {category.description || 'Описание категории'}
                    </p>
                    <button
                      className="btn secondary"
                      style={{ width: '100%' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/category/${category.id}`);
                      }}
                    >
                      Смотреть товары
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ShopPage;
