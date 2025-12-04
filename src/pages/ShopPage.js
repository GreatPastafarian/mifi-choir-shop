import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCategories } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import choirBackground from '../assets/images/choir-background.jpg';
import { getImageUrl } from '../utils/imageUtils';

// Hook for media query
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
};

function ShopPage({ addToCart }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

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
      <div className="container shop-page__status-container">
        <h1>Загрузка магазина...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container shop-page__status-container">
        <h1>Ошибка</h1>
        <p>{error}</p>
        <button
          className="btn primary shop-page__retry-btn"
          onClick={() => window.location.reload()}
        >
          Повторить попытку
        </button>
      </div>
    );
  }

  return (
    <div className="shop-page">
      {/* Mobile Header (Search & Filter) - REMOVED as per user request */}

      {isMobile ? (
        // --- MOBILE VIEW ---
        <>
          <section className="shop-hero shop-hero--mobile">
            <div className="container shop-hero__container">
              <div className="shop-hero__content">
                <h1>СУВЕНИРЫ</h1>
                <p>Академического Мужского Хора МИФИ</p>
                <div
                  className="shop-hero__scroll-indicator mobile-scroll-indicator"
                  onClick={() => {
                    const categoriesSection = document.querySelector('.shop-categories');
                    if (categoriesSection) {
                      categoriesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <span className="shop-hero__scroll-text">ПЕРЕЙТИ К СУВЕНИРАМ</span>
                  <div className="shop-hero__scroll-arrow"></div>
                </div>
              </div>
            </div>
          </section>

          <section className="shop-categories shop-categories--mobile">
            <div className="container">
              <div className="shop-categories__header">
                <h2>Категории товаров</h2>
                {isAdmin && (
                  <Link to="/admin" className="btn secondary">
                    Админ-панель
                  </Link>
                )}
              </div>
              {/* Mobile Grid (2 Columns) */}
              <div className="categories-grid categories-grid--mobile">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="category-card"
                    onClick={() => navigate(`/category/${category.id}`)}
                  >
                    <div className="category-image-wrapper">
                      <img
                        src={getImageUrl(category.image)}
                        alt={category.name}
                        className="category-image"
                      />
                    </div>
                    <div className="category-card__content">
                      <h3 className="category-card__title">{category.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        // --- DESKTOP VIEW (Restored) ---
        <>
          <section className="shop-hero">
            <div className="container shop-hero__container">
              <div className="shop-hero__content">
                <h1>Сувенирная продукция <span className="text-accent">Академического Мужского Хора МИФИ</span></h1>
                <p>Выберите вознаграждение за пожертвование и поддержите наш хор</p>
              </div>
              <div className="shop-hero__image-wrapper">
                <img src={choirBackground} alt="Хор МИФИ" className="shop-hero__image" />
              </div>
            </div>
            <div
              className="shop-hero__scroll-indicator"
              onClick={() => {
                const categoriesSection = document.querySelector('.shop-categories');
                if (categoriesSection) {
                  categoriesSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <span className="shop-hero__scroll-text">Перейти к сувенирам</span>
              <div className="shop-hero__scroll-arrow"></div>
            </div>
          </section>

          <section className="shop-categories">
            <div className="container">
              <div className="shop-categories__header">
                <h2>Категории товаров</h2>
                {isAdmin && (
                  <Link to="/admin" className="btn secondary">
                    Админ-панель
                  </Link>
                )}
              </div>

              {categories.length === 0 ? (
                <div className="shop-categories__empty">
                  <p>Нет доступных категорий</p>
                  {isAdmin && (
                    <Link to="/admin" className="btn primary">
                      Перейти в админ-панель
                    </Link>
                  )}
                </div>
              ) : (
                <div className="categories-grid">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="category-card"
                      onClick={() => navigate(`/category/${category.id}`)}
                    >
                      <div className="category-image-wrapper">
                        <img
                          src={getImageUrl(category.image)}
                          alt={category.name}
                          className="category-image"
                        />
                      </div>
                      <div className="category-card__content">
                        <h3 className="category-card__title">{category.name}</h3>
                        <p className="category-card__description">{category.description}</p>
                        <button className="btn primary category-card__button">
                          Перейти
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default ShopPage;
