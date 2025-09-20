import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import SortFilter from '../components/product/SortFilter';
// ЗАМЕНА: Используем сервисы вместо mock-данных
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

  // Получаем toggleFavorite и favorites из контекста
  const { toggleFavorite, favorites } = useAuth();

  // Загружаем данные при монтировании и при изменении id
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Загружаем категории
        const categoriesData = await getCategories();
        setCategories(categoriesData);

        // Находим текущую категорию
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
    // Без сортировки
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1>Ошибка</h1>
        <p>{error}</p>
        <Link to="/shop" className="btn primary" style={{ marginTop: '1rem' }}>
          Вернуться в магазин
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1>Загрузка данных...</h1>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
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
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/category/${category.id}`}
                    className={`category-item ${id === String(category.id) ? 'active' : ''}`}
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

            {/* Описание категории */}
            {currentCategory.description && (
              <div className="category-description" style={{ marginBottom: '2rem' }}>
                <p>{currentCategory.description}</p>
              </div>
            )}

            {/* Сортировка */}
            <SortFilter onSortChange={handleSortChange} />

            {/* Количество товаров */}
            <div className="product-count">
              Найдено: {sortedProducts.length} {sortedProducts.length === 1 ? 'товар' : 'товаров'}
            </div>

            {/* Грид с товарами */}
            {sortedProducts.length === 0 ? (
              <div className="no-products">
                <p>В этой категории пока нет товаров.</p>
                <Link to="/shop" className="btn primary" style={{ marginTop: '1rem' }}>
                  Перейти в общий каталог
                </Link>
              </div>
            ) : (
              <div className="items-grid">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addToCart={addToCart}
                    toggleFavorite={toggleFavorite}
                    isFavorite={favorites?.some((fav) => fav.id === product.id) || false}
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
