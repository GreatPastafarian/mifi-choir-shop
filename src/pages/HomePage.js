import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import choirBackground from '../assets/images/choir-background.jpg';
import { useAuth } from '../context/AuthContext';
// Импортируем сервисы для получения данных
import { getPopularProducts } from '../services/productService';

function HomePage({ addToCart }) {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { favorites = [], toggleFavorite } = useAuth();

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
      <div className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <h1>Загрузка данных...</h1>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section
        className="hero-banner"
        style={{
          background: `linear-gradient(rgba(10, 34, 64, 0.85), rgba(10, 34, 64, 0.85)), url(${choirBackground}) no-repeat center center/cover`,
        }}
      >
        <div className="hero-content">
          <h1>Поддержите искусство хора МИФИ. Получите сувенир в благодарность за ваше пожертвование!</h1>
          <Link to="/shop" className="btn primary">
            Выбрать вознаграждение
          </Link>
        </div>
      </section>

      <section className="how-it-works">
        <h2>Как это работает</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Выберите сувенир</h3>
            <p>Выберите вознаграждение из нашего каталога</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Сделайте пожертвование</h3>
            <p>Поддержите хор через наш фонд</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Получите вознаграждение</h3>
            <p>Заберите сувенир с благодарностью от хора</p>
          </div>
        </div>
      </section>

      {/* Изменено: только популярные товары, ограничено 4 товарами */}
      <section className="popular-items">
        <div className="container">
          <h2>Популярные вознаграждения</h2>
          <div className="items-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                toggleFavorite={toggleFavorite}
                isFavorite={favorites?.some((fav) => fav.id === product.id) || false}
              />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/shop" className="btn secondary">
              Посмотреть все вознаграждения
            </Link>
          </div>
        </div>
      </section>

      <section className="about-choir" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div
            className="about-content"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div className="about-text">
              <h2>Мужской академический хор МИФИ</h2>
              <p style={{ lineHeight: '1.6', color: '#555' }}>
                Академический мужской хор МИФИ — один из самых известных любительских коллективов России. В нем поют
                только мифисты — студенты и выпускники нашего вуза, а музыкальными руководителями традиционно являются
                выпускники Московской консерватории — талантливые хормейстеры, представители классической русской
                хоровой школы.
              </p>
              <p style={{ lineHeight: '1.6', color: '#555' }}>
                Сегодняшний репертуар Мужского хора МИФИ охватывает практически все жанры хоровой музыки: русская и
                западная классика, народные песни, военно-патриотические песни советского периода, произведения
                современных композиторов.
              </p>
              <Link to="/about" className="btn secondary">
                Узнать больше
              </Link>
            </div>
            <div className="about-image">
              <div
                className="image-placeholder choir-image"
                style={{
                  width: '100%',
                  paddingTop: '75%',
                  backgroundColor: '#e0e0e0',
                  borderRadius: 'var(--radius-md)',
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
