import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import SortFilter from '../components/product/SortFilter';
import { getCategories, getProductsByCategory } from '../data/products';

function CategoryPage({ addToCart, toggleFavorite, favorites }) {
    const { id } = useParams();
    const [sortOption, setSortOption] = useState('default');

    const categories = getCategories();
    const allProducts = getProductsByCategory(id);
    const currentCategory = categories.find(cat => cat.id === parseInt(id));

    // Сортировка товаров
    let sortedProducts = [...allProducts];

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
        case 'newest':
            sortedProducts.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));
            break;
        case 'popular':
            sortedProducts.sort((a, b) => b.salesCount - a.salesCount);
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

    const handleSortChange = (sort) => {
        setSortOption(sort);
    };

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
        <span>{currentCategory.name}</span>
        </div>

        {/* Заголовок категории */}
        <h1 className="category-title">{currentCategory.name}</h1>

        {/* Сортировка */}
        <SortFilter
        onSortChange={handleSortChange}
        />

        {/* Количество товаров */}
        <div className="product-count">
        Найдено: {sortedProducts.length} {sortedProducts.length === 1 ? 'товар' : 'товаров'}
        </div>

        {/* Грид с товарами */}
        <div className="items-grid">
        {sortedProducts.map(product => (
            <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
            toggleFavorite={toggleFavorite}
            isFavorite={favorites.some(fav => fav.id === product.id)}
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
