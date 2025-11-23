import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, NavLink } from 'react-router-dom';
import { getProductsByCategory } from '../services/productService';
import { getCategoryById, getAllCategories } from '../services/categoryService';
import ProductCard from '../components/product/ProductCard';
import SortFilter from '../components/product/SortFilter';
import { useAuth } from '../context/AuthContext';

function CategoryPage({ addToCart }) {
  const { id } = useParams();
  const { favorites, toggleFavorite } = useAuth();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortOption, setSortOption] = useState('default');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoryData, productsData, categoriesList] = await Promise.all([
          getCategoryById(id),
                                                                               getProductsByCategory(id),
                                                                               getAllCategories()
        ]);

        setCategory(categoryData);
        setProducts(productsData);
        setAllCategories(categoriesList);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // --- ЛОГИКА СОРТИРОВКИ ---
  const sortedProducts = useMemo(() => {
    let sorted = [...products];

    switch (sortOption) {
      case 'price_asc':
        sorted.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
        break;
      case 'price_desc':
        sorted.sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
        break;
      case 'name_asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.publication_date || 0) - new Date(a.publication_date || 0));
        break;
      case 'popular':
        sorted.sort((a, b) => {
          const salesDiff = (b.salesCount || 0) - (a.salesCount || 0);
          if (salesDiff !== 0) return salesDiff;
          return (b.views_count || 0) - (a.views_count || 0);
        });
        break;
      default:
        break;
    }
    return sorted;
  }, [products, sortOption]);


  if (loading) {
    return (
      <div className="category-page__container category-page__container--centered">
      <h1>Загрузка...</h1>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="category-page__container category-page__container--centered">
      <h1>Категория не найдена</h1>
      <Link to="/shop" className="btn primary">Вернуться в каталог</Link>
      </div>
    );
  }

  return (
    <div className="category-page">
    <div className="category-page__container">

    <div className="category-page__layout">
    {/* САЙДБАР С КАТЕГОРИЯМИ */}
    <aside className="category-page__sidebar">
    <h3 className="category-page__sidebar-title">Категории</h3>
    <nav>
    <ul className="category-page__list">
    {allCategories.map((cat) => (
      <li key={cat.id}>
      <NavLink
      to={`/category/${cat.id}`}
      className={({ isActive }) =>
      isActive ? "category-page__item category-page__item--active" : "category-page__item"
      }
      >
      {cat.name}
      </NavLink>
      </li>
    ))}
    </ul>
    </nav>
    </aside>

    {/* ОСНОВНОЙ КОНТЕНТ */}
    <div className="category-page__content">
    <div className="category-page__breadcrumb">
    <Link to="/">Главная</Link> <span>/</span>
    <Link to="/shop">Каталог</Link> <span>/</span>
    <span>{category.name}</span>
    </div>

    <h1 className="category-page__title">{category.name}</h1>

    {category.description && (
      <p className="category-page__description">{category.description}</p>
    )}

    <div className="category-page__toolbar">
    {/* ИСПРАВЛЕНО: Сначала фильтр (слева), потом счетчик (справа) */}
    <SortFilter currentSort={sortOption} onSortChange={setSortOption} />

    <div className="category-page__count">
    Найдено: {sortedProducts.length} {sortedProducts.length === 1 ? 'товар' : 'товаров'}
    </div>
    </div>

    {sortedProducts.length === 0 ? (
      <div className="category-page__empty">
      <p>В этой категории пока нет товаров.</p>
      <Link to="/shop" className="btn secondary">Вернуться назад</Link>
      </div>
    ) : (
      <div className="category-page__grid">
      {sortedProducts.map((product, index) => (
        <ProductCard
        key={product.id}
        product={product}
        addToCart={addToCart}
        toggleFavorite={toggleFavorite}
        isFavorite={favorites.some((fav) => fav.id === product.id)}
        // Для оптимизации загрузки первых картинок
        priority={index < 4}
        />
      ))}
      </div>
    )}
    </div>
    </div>

    </div>
    </div>
  );
}

export default CategoryPage;
