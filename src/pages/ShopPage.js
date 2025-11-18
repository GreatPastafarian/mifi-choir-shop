import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCategories } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import choirBackground from '../assets/images/choir-background.jpg';
import { getImageUrl, getProductImageSet } from '../utils/imageUtils';

function ShopPage({ addToCart }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

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
    {/* Герой-баннер */}
    <section
    className="shop-hero"
    style={{
      // Единственный оправданный inline-стиль: динамическая картинка
      backgroundImage: `url(${choirBackground})`,
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
      {categories.map((category) => {
        const imageUrl = getImageUrl(category.image);
        const { sm, srcSet } = getProductImageSet(imageUrl);

        return (
          <div
          key={category.id}
          className="category-card"
          onClick={() => navigate(`/category/${category.id}`)}
          >
          <div className="category-image-wrapper">
          <img
          className="category-image"
          src={sm}
          srcSet={srcSet}
          sizes="(max-width: 600px) 100vw, 300px"
          alt={category.name}
          loading="lazy"
          />
          </div>

          <div className="category-card__content">
          <h3 className="category-card__title">
          {category.name}
          </h3>

          <p className="category-card__description">
          {category.description || 'Описание категории'}
          </p>

          <button
          className="btn secondary category-card__button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/category/${category.id}`);
          }}
          >
          Смотреть товары
          </button>
          </div>
          </div>
        );
      })}
      </div>
    )}
    </div>
    </section>
    </div>
  );
}

export default ShopPage;
