import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import SortFilter from '../components/product/SortFilter';
import { getCategories, getProductsByCategory } from '../services/productService';
import { useAuth } from '../context/AuthContext';


function CategoryPage({ addToCart }) {
  const { id } = useParams();
  const [sortOption, setSortOption] = useState('default');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  const { toggleFavorite, favorites } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Загружаем категории
        const categoriesData = await getCategories();
        setCategories(categoriesData);

        const categoryId = parseInt(id);
        const category = categoriesData.find((cat) => cat.id === categoryId);

        if (!category) {
          setError('Категория не найдена');
          setCurrentCategory(null);
          setProducts([]);
        } else {
          setCurrentCategory(category);
          // Загружаем товары для категории
          const productsData = await getProductsByCategory(categoryId);
          setProducts(productsData);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Сортировка товаров
  const sortedProducts = [...products];
  switch (sortOption) {
    case 'price_asc':
      sortedProducts.sort((a, b) => a.base_price - b.base_price);
      break;
    case 'price_desc':
      sortedProducts.sort((a, b) => b.base_price - a.base_price);
      break;
    case 'name_asc':
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      break;
    case 'name_desc':
      sortedProducts.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
      break;
    case 'newest':
      sortedProducts.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
      break;
    case 'popular':
      sortedProducts.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
      break;
    default:
      break;
  }

  if (error) {
    return (
      <div className="category-page__container category-page__container--centered">
      <h1>Ошибка</h1>
      <p>{error}</p>
      <Link to="/shop" className="btn primary">
      Вернуться в магазин
      </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="category-page__container category-page__container--centered">
      <h1>Загрузка данных...</h1>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="category-page__container category-page__container--centered">
      <h1>Категория не найдена</h1>
      <p>Извините, запрашиваемая категория не существует.</p>
      <Link to="/shop" className="btn primary">
      Вернуться в магазин
      </Link>
      </div>
    );
  }

  return (
    <div className="category-page">
    <div className="category-page__container">
    <div className="category-page__layout">

    {/* Левое меню категорий */}
    <aside className="category-page__sidebar">
    <h2 className="category-page__sidebar-title">КАТЕГОРИИ</h2>
    <ul className="category-page__list">
    {categories.map((category) => (
      <li key={category.id}>
      <Link
      to={`/category/${category.id}`}
      className={`category-page__item ${id === String(category.id) ? 'category-page__item--active' : ''}`}
      >
      {category.name}
      </Link>
      </li>
    ))}
    </ul>
    </aside>

    {/* Основной контент */}
    <div className="category-page__content">
    {/* Путь навигации */}
    <div className="category-page__breadcrumb">
    <Link to="/">Главная</Link>
    <span>›</span>
    <Link to="/shop">Каталог</Link>
    <span>›</span>
    <span>{currentCategory.name}</span>
    </div>

    <h1 className="category-page__title">{currentCategory.name}</h1>

    {currentCategory.description && (
      <div className="category-page__description">
      <p>{currentCategory.description}</p>
      </div>
    )}

    {/* Панель инструментов (Сортировка + Счетчик) */}
    <div className="category-page__toolbar">
    <SortFilter onSortChange={setSortOption} />
    <div className="category-page__count">
    Найдено: {sortedProducts.length} {sortedProducts.length === 1 ? 'товар' : 'товаров'}
    </div>
    </div>

    {/* Грид с товарами */}
    {sortedProducts.length === 0 ? (
      <div className="category-page__empty">
      <p>В этой категории пока нет товаров.</p>
      <Link to="/shop" className="btn primary">
      Перейти в общий каталог
      </Link>
      </div>
    ) : (
      <div className="category-page__grid">
      {sortedProducts.map((product, index) => (
        <ProductCard
        key={product.id}
        product={product}
        addToCart={addToCart}
        toggleFavorite={toggleFavorite}
        isFavorite={favorites?.some((fav) => fav.id === product.id) || false}
        // Первые 6 товаров грузим сразу
        priority={index < 6}
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
