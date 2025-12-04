import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';

import choirImage from '../assets/images/choir_bzk.jpg';
import { useAuth } from '../context/AuthContext';
// Импортируем сервисы для получения данных
import { getPopularProducts } from '../services/productService';

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

function HomePage({ addToCart }) {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { favorites = [], toggleFavorite } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Загружаем только популярные товары
        const popular = await getPopularProducts();

        // Ограничиваем список до 4 товаров
        setPopularProducts(popular.slice(0, 4));
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h1>Загрузка данных...</h1>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Mobile Header Overlay - REMOVED as per user request */}

      {/* HERO SECTION: Separated Logic */}
      {isMobile ? (
        // MOBILE HERO (Compact: Text Restored, No Image)
        <section className="home-page__hero home-page__hero--mobile">
          <div className="container home-page__hero-container">
            <div className="home-page__hero-content">
              <h1 className="home-page__hero-title">
                Поддержите искусство <br />
                <span className="text-accent">Академического Мужского Хора МИФИ</span>
              </h1>
              <p className="home-page__hero-subtitle">
                Получите уникальный сувенир в благодарность за ваше пожертвование и станьте частью нашей истории.
              </p>
              <Link to="/shop" className="btn primary large home-page__hero-btn">
                Выбрать вознаграждение
              </Link>
            </div>
          </div>
        </section>
      ) : (
        // DESKTOP HERO (Restored from User Snippet)
        <section className="home-page__hero home-page__hero--desktop">
          <div className="container home-page__hero-container">
            <div className="home-page__hero-content">
              <h1 className="home-page__hero-title">
                Поддержите искусство <br />
                <span className="text-accent">Академического Мужского Хора МИФИ</span>
              </h1>
              <p className="home-page__hero-subtitle">
                Получите уникальный сувенир в благодарность за ваше пожертвование и станьте частью нашей истории.
              </p>
              <Link to="/shop" className="btn primary large">
                Выбрать вознаграждение
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS: Separated Logic */}
      <section className="home-page__how-it-works">
        <h2 className="home-page__section-title">Как это работает</h2>
        {isMobile ? (
          // MOBILE STEPS (Vertical but with Full Text)
          <div className="home-page__steps home-page__steps--mobile">
            <div className="home-page__step-card">
              <div className="home-page__step-number">1</div>
              <div className="home-page__step-text">
                <h3>Выберите сувенир</h3>
                <p>Выберите вознаграждение из нашего каталога</p>
              </div>
            </div>
            <div className="home-page__step-card">
              <div className="home-page__step-number">2</div>
              <div className="home-page__step-text">
                <h3>Сделайте пожертвование</h3>
                <p>Поддержите хор через наш фонд</p>
              </div>
            </div>
            <div className="home-page__step-card">
              <div className="home-page__step-number">3</div>
              <div className="home-page__step-text">
                <h3>Получите вознаграждение</h3>
                <p>Заберите сувенир с благодарностью от хора</p>
              </div>
            </div>
          </div>
        ) : (
          // DESKTOP STEPS (Horizontal Original)
          <div className="home-page__steps home-page__steps--desktop">
            <div className="home-page__step">
              <div className="home-page__step-number">1</div>
              <div>
                <h3 className="home-page__step-title">Выберите сувенир</h3>
                <p>Выберите вознаграждение из нашего каталога</p>
              </div>
            </div>
            <div className="home-page__step">
              <div className="home-page__step-number">2</div>
              <div>
                <h3 className="home-page__step-title">Сделайте пожертвование</h3>
                <p>Поддержите хор через наш фонд</p>
              </div>
            </div>
            <div className="home-page__step">
              <div className="home-page__step-number">3</div>
              <div>
                <h3 className="home-page__step-title">Получите вознаграждение</h3>
                <p>Заберите сувенир с благодарностью от хора</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Popular Items - Horizontal Scroll on Mobile */}
      <section className="home-page__popular">
        <div className="container">
          <div className="home-page__popular-header">
            <h2 className="home-page__popular-title">{isMobile ? 'Популярное' : 'Популярные вознаграждения'}</h2>
            {isMobile && <Link to="/shop" className="home-page__popular-link">Все</Link>}
          </div>

          <div className={`home-page__items-container ${isMobile ? 'scroll-container' : 'grid-container'}`}>
            {popularProducts.map((product) => (
              <div key={product.id} className="home-page__item-wrapper">
                <ProductCard
                  product={product}
                  addToCart={addToCart}
                  toggleFavorite={toggleFavorite}
                  isFavorite={favorites?.some((fav) => fav.id === product.id) || false}
                  priority={true}
                />
              </div>
            ))}
          </div>

          {!isMobile && (
            <div className="text-center mt-4">
              <Link to="/shop" className="btn secondary">
                Посмотреть все вознаграждения
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="home-page__about">
        <div className="container">
          <div className="home-page__about-content">
            <div className="home-page__about-image-wrapper">
              <img src={choirImage} alt="Академический мужской хор МИФИ" className="home-page__image" />
            </div>
            <div className="home-page__about-text">
              <h2 className="home-page__about-title">
                {isMobile ? 'О нашем хоре' : 'Мужской академический хор МИФИ'}
              </h2>
              <p className="home-page__about-paragraph">
                Академический мужской хор МИФИ — один из самых известных любительских коллективов России.
                В нем поют студенты и выпускники, объединенные любовью к музыке.
              </p>
              {!isMobile && (
                <p className="home-page__about-paragraph">
                  Сегодняшний репертуар Мужского хора МИФИ охватывает практически все жанры хоровой музыки: русская и
                  западная классика, народные песни, военно-патриотические песни советского периода, произведения
                  современных композиторов.
                </p>
              )}
              <Link to="/about" className="btn secondary home-page__about-btn">
                {isMobile ? 'Узнать историю хора' : 'Узнать больше'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
