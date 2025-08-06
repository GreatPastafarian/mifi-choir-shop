import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

function CategoryPage({ addToCart }) {
    const { id } = useParams();
    const [activeFilter] = useState('all');
    const [sortOption, setSortOption] = useState('default');

    // Определение категорий
    const categories = [
        { id: 1, name: "Одежда" },
        { id: 2, name: "Аксессуары" },
        { id: 3, name: "Музыка" },
        { id: 4, name: "Коллекционные издания" }
    ];

    // Примеры товаров для каждой категории
    const categoryProducts = {
        1: [
            {
                id: 5,
                name: "Свитшот с эмблемой хора",
                category: "Одежда",
                price: 2500,
                image: "sweatshirt"
            },
            {
                id: 9,
                name: "Футболка с логотипом",
                category: "Одежда",
                price: 1500,
                image: "tshirt"
            },
            {
                id: 10,
                name: "Толстовка с капюшоном",
                category: "Одежда",
                price: 2800,
                image: "hoodie"
            },
            {
                id: 11,
                name: "Поло с символикой",
                category: "Одежда",
                price: 2200,
                image: "polo"
            }
        ],
        2: [
            {
                id: 7,
                name: "Эко-сумка с принтом",
                category: "Аксессуары",
                price: 800,
                image: "bag"
            },
            {
                id: 12,
                name: "Значок хора",
                category: "Аксессуары",
                price: 300,
                image: "pin"
            },
            {
                id: 13,
                name: "Термокружка",
                category: "Аксессуары",
                price: 1200,
                image: "mug"
            },
            {
                id: 14,
                name: "Шарф с символикой",
                category: "Аксессуары",
                price: 1800,
                image: "scarf"
            }
        ],
        3: [
            {
                id: 6,
                name: "Лимитированная виниловая пластинка",
                category: "Музыка",
                price: 3500,
                image: "vinyl"
            },
            {
                id: 15,
                name: "CD с записью концерта",
                category: "Музыка",
                price: 800,
                image: "cd"
            },
            {
                id: 16,
                name: "Ноты любимых произведений",
                category: "Музыка",
                price: 1200,
                image: "sheet-music"
            },
            {
                id: 17,
                name: "Подарочный набор 'Песни Победы'",
                category: "Музыка",
                price: 2500,
                image: "victory-songs"
            }
        ],
        4: [
            {
                id: 8,
                name: "Подарочный набор к 60-летию хора",
                category: "Коллекционные издания",
                price: 5000,
                image: "gift-set"
            },
            {
                id: 18,
                name: "Юбилейная медаль",
                category: "Коллекционные издания",
                price: 2000,
                image: "medal"
            },
            {
                id: 19,
                name: "Эксклюзивный фотоальбом",
                category: "Коллекционные издания",
                price: 3500,
                image: "photo-album"
            },
            {
                id: 20,
                name: "Подарочная коробка 'Золотые голоса'",
                category: "Коллекционные издания",
                price: 4500,
                image: "golden-voices"
            }
        ]
    };

    const currentCategory = categories.find(cat => cat.id === parseInt(id));
    const products = categoryProducts[id] || [];

    // Фильтрация товаров
    const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter(product => product.price <= (activeFilter === 'low' ? 1500 : 3000));

    // Сортировка товаров
    let sortedProducts = [...filteredProducts];

    switch(sortOption) {
        case 'price_asc':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name_asc':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
            break;
        case 'name_desc':
            sortedProducts.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
            break;
        default:
            // Без сортировки
    }

    if (!currentCategory) {
        return (
            <div className="container" style={{ padding: '4rem 0' }}>
            <h1>Категория не найдена</h1>
            <p>Извините, запрашиваемая категория не существует.</p>
            <Link to="/shop" className="btn primary" style={{ marginTop: '1rem' }}>
            Вернуться в магазин
            </Link>
            </div>
        );
    }

    return (
        <div className="category-page">
        <div className="container">
        <div className="category-layout">
        {/* Левое меню категорий */}
        <div className="category-sidebar">
        <h2>КАТЕГОРИИ</h2>
        <ul className="category-list">
        {categories.map(category => (
            <li key={category.id}>
            <Link
            to={`/category/${category.id}`}
            className={`category-item ${id === category.id.toString() ? 'active' : ''}`}
            >
            {category.name}
            </Link>
            </li>
        ))}
        </ul>
        </div>

        {/* Основной контент */}
        <div className="category-content">
        {/* Путь навигации */}
        <div className="breadcrumb">
        <Link to="/">Главная</Link>
        <span>›</span>
        <Link to="/shop">Каталог</Link>
        <span>›</span>
        <span>{currentCategory ? currentCategory.name : 'Загрузка...'}</span>
        </div>

        {/* Заголовок категории */}
        <h1 className="category-title">{currentCategory ? currentCategory.name : 'Загрузка...'}</h1>

        {/* Сортировка и количество товаров */}
        <div className="filter-bar">
        <div className="sort-filter">
        <label>Сортировка:</label>
        <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        >
        <option value="default">Без сортировки</option>
        <option value="price_asc">По цене: от низкой к высокой</option>
        <option value="price_desc">По цене: от высокой к низкой</option>
        <option value="name_asc">По названию: от А до Я</option>
        <option value="name_desc">По названию: от Я до А</option>
        </select>
        </div>
        <div className="product-count">
        Всего найдено: {sortedProducts.length}
        </div>
        </div>

        {/* Грид с товарами */}
        <div className="items-grid">
        {sortedProducts.map(product => (
            <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
            />
        ))}
        </div>
        </div>
        </div>
        </div>
        </div>
    );
}

export default CategoryPage;
