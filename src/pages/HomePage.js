import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';

import choirImage from '../assets/images/choir_bzk.jpg';
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
      <div className="container mt-5 text-center">
        <h1>Загрузка данных...</h1>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="home-page__hero">
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

      <section className="home-page__how-it-works">
        <h2 className="home-page__section-title">Как это работает</h2>
        <div className="home-page__steps">
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
      </section>

      {/* Изменено: только популярные товары, ограничено 4 товарами */}
      <section className="home-page__popular">
        <div className="container">
          <h2 className="home-page__popular-title">Популярные вознаграждения</h2>
          <div className="home-page__items-grid">
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                toggleFavorite={toggleFavorite}
                isFavorite={favorites?.some((fav) => fav.id === product.id) || false}
                priority={true}
              />
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/shop" className="btn secondary">
              Посмотреть все вознаграждения
            </Link>
          </div>
        </div>
      </section>

      <section className="home-page__about">
        <div className="container">
          <div className="home-page__about-content">
            <div className="home-page__about-text">
              <h2 className="home-page__about-title">Мужской академический хор МИФИ</h2>
              <p className="home-page__about-paragraph">
                Академический мужской хор МИФИ — один из самых известных любительских коллективов России. В нем поют
                только мифисты — студенты и выпускники нашего вуза, а музыкальными руководителями традиционно являются
                выпускники Московской консерватории — талантливые хормейстеры, представители классической русской
                хоровой школы.
              </p>
              <p className="home-page__about-paragraph">
                Сегодняшний репертуар Мужского хора МИФИ охватывает практически все жанры хоровой музыки: русская и
                западная классика, народные песни, военно-патриотические песни советского периода, произведения
                современных композиторов.
              </p>
              <Link to="/about" className="btn secondary">
                Узнать больше
              </Link>
            </div>
            <div className="home-page__about-image">
              <img src={choirImage} alt="Академический мужской хор МИФИ" className="home-page__image" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
