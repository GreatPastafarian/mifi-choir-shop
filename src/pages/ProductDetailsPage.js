import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategories } from '../data/products'; // Добавляем импорт функции для получения категорий
import ProductGallery from '../components/product/ProductGallery';
import ProductDetails from '../components/product/ProductDetails';
import RelatedProducts from '../components/product/RelatedProducts';
import { getProductById, getRelatedProducts } from '../data/products';

function ProductDetailsPage({ addToCart, toggleFavorite = () => {}, favorites = [] }) {
    const { id } = useParams();
    const [inStock] = useState(10); // Количество в наличии
    const categories = getCategories(); // Получаем список всех категорий

    const product = getProductById(id); // Используем функцию напрямую

    if (!product) {
        return (
            <div className="container" style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 1rem'
            }}>
            <h1>Товар не найден</h1>
            <p>Извините, запрашиваемый товар не существует.</p>
            <Link to="/shop" className="btn primary" style={{ marginTop: '1rem' }}>
            Вернуться в магазин
            </Link>
            </div>
        );
    }

    // Находим ID категории по названию
    const category = categories.find(cat => cat.name === product.category);
    const categoryId = category ? category.id : '';

    // Проверяем, находится ли товар в избранном
    const isFavorite = favorites.some(fav => fav.id === product.id);

    const handleToggleFavorite = () => {
        toggleFavorite(product);
    };

    // Получаем похожие товары (товары из той же категории)
    const relatedProducts = getRelatedProducts(id);

    return (
        <div className="product-details-page">
        <div className="container" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem 4rem'
        }}>
        {/* Путь навигации */}
        <div className="breadcrumb" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '1rem'
        }}>
        <Link to="/">Главная</Link>
        <span>›</span>
        <Link to="/shop">Каталог</Link>
        <span>›</span>
        {categoryId ? (
            <Link to={`/category/${categoryId}`}>{product.category}</Link>
        ) : (
            <span>{product.category}</span>
        )}
        <span>›</span>
        <span>{product.name}</span>
        </div>

        <div className="product-details-container" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            marginTop: '1rem'
        }}>
        {/* Галерея изображений */}
        <ProductGallery
        images={product.images}
        inStock={inStock}
        isFavorite={isFavorite}
        toggleFavorite={handleToggleFavorite}
        />

        {/* Информация о товаре */}
        <ProductDetails
        product={product}
        inStock={inStock}
        addToCart={addToCart}
        isFavorite={isFavorite}
        toggleFavorite={handleToggleFavorite}
        />
        </div>

        {/* Описание товара */}
        <div className="product-description" style={{
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #eee'
        }}>
        {/* Описание будет отображаться в ProductDetails */}
        </div>

        {/* Похожие товары */}
        <RelatedProducts
        products={relatedProducts}
        addToCart={addToCart}
        toggleFavorite={toggleFavorite}
        favorites={favorites}
        />
        </div>
        </div>
    );
}

export default ProductDetailsPage;
