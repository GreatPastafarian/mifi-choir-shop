// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { getPopularProducts } from '../data/products';
import choirBackground from '../assets/images/choir-background.jpg';

function HomePage({ addToCart,toggleFavorite, favorites}) {
    const popularItems = getPopularProducts();

    return (
        <div className="home-page">
        <section
        className="hero-banner"
        style={{
            background: `linear-gradient(rgba(10, 34, 64, 0.85), rgba(10, 34, 64, 0.85)), url(${choirBackground}) no-repeat center center/cover`
        }}
        >
        <div className="hero-content">
        <h1>Поддержите искусство хора МИФИ. Получите сувенир в благодарность за ваше пожертвование!</h1>
        <Link to="/shop" className="btn primary">Выбрать вознаграждение</Link>
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

        <section className="popular-items">
        <h2>Популярные вознаграждения</h2>
        <div className="items-grid">
        {popularItems.map(item => (
            <ProductCard
            key={item.id}
            product={item}
            addToCart={addToCart}
            toggleFavorite={toggleFavorite}
            isFavorite={favorites.some(fav => fav.id === item.id)}
            />
        ))}
        </div>
        </section>

        <section className="about-choir">
        <div className="about-content">
        <div className="about-text">
        <h2>Мужской академический хор МИФИ</h2>
        <p>Основанный в 1962 году, хор МИФИ является одним из старейших академических коллективов России. За годы существования хор дал сотни концертов в России и за рубежом, записал несколько альбомов духовной и классической музыки.</p>
        <p>Сегодня в репертуаре хора более 200 произведений русской и зарубежной классики, духовной музыки, народных песен и современных композиций.</p>
        <Link to="/about" className="btn secondary">Узнать больше</Link>
        </div>
        <div className="about-image">
        <div className="image-placeholder choir-image"></div>
        </div>
        </div>
        </section>
        </div>
    );
}

export default HomePage;
