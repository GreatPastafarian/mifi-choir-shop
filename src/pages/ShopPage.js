// src/pages/ShopPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories } from '../data/products';
import choirBackground from '../assets/images/choir-background.jpg';

function ShopPage({ addToCart }) {
    const [activeCategory, setActiveCategory] = useState(null);
    const navigate = useNavigate();

    const categories = getCategories();

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
            padding: '0 16px'
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
        <h2>Категории товаров</h2>
        <div className="categories-grid">
        {categories.map(category => (
            <div
            key={category.id}
            className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => {
                setActiveCategory(activeCategory === category.id ? null : category.id);
                navigate(`/category/${category.id}`);
            }}
            >
            <div className="category-image">
            <div className={`image-placeholder ${category.image}`}></div>
            </div>
            <div className="category-info">
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <Link
            to={`/category/${category.id}`}
            className="btn secondary"
            onClick={(e) => e.stopPropagation()}
            >
            Смотреть товары
            </Link>
            </div>
            </div>
        ))}
        </div>
        </div>
        </section>
        </div>
    );
}

export default ShopPage;
