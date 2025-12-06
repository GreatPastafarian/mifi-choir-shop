import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, NavLink } from 'react-router-dom';
import { getProductsByCategory } from '../services/productService';
import { getCategoryById, getAllCategories } from '../services/categoryService';
import ProductCard from '../components/product/ProductCard';
import SortFilter from '../components/product/SortFilter';
import { useAuth } from '../context/AuthContext';

// Inline useMediaQuery hook (как в HomePage)
import useMediaQuery from '../hooks/useMediaQuery';

function CategoryPage({ addToCart }) {
  const { id } = useParams();
  const { favorites, toggleFavorite } = useAuth();

  const isMobile = useMediaQuery('(max-width: 768px)');

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
          getAllCategories(),
        ]);

        setCategory(categoryData);
        setProducts(productsData);
        setAllCategories(categoriesList);
      } catch (err) {
        console.error('Error fetching ', err);
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
        <Link to="/shop" className="btn primary">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-page__container">
        {/* Основной макет для десктопа */}
        {!isMobile ? (
          <div className="category-page__layout">
            <aside className="category-page__sidebar">
              <h3 className="category-page__sidebar-title">Категории</h3>
              <nav>
                <ul className="category-page__list">
                  {allCategories.map((cat) => (
                    <li key={cat.id}>
                      <NavLink
                        to={`/category/${cat.id}`}
                        className={({ isActive }) =>
                          isActive
                            ? 'category-page__item category-page__item--active'
                            : 'category-page__item'
                        }
                      >
                        {cat.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

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
                <SortFilter currentSort={sortOption} onSortChange={setSortOption} />
                <div className="category-page__count">
                  Найдено: {sortedProducts.length}{' '}
                  {sortedProducts.length === 1 ? 'товар' : 'товаров'}
                </div>
              </div>

              {sortedProducts.length === 0 ? (
                <div className="category-page__empty">
                  <p>В этой категории пока нет товаров.</p>
                  <Link to="/shop" className="btn secondary">
                    Вернуться назад
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
                      isFavorite={favorites.some((fav) => fav.id === product.id)}
                      priority={index < 4}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Мобильная версия с адаптивной сеткой
          <div className="category-page__content--mobile">


            <h1 className="category-page__title">{category.name}</h1>

            {category.description && (
              <p className="category-page__description">{category.description}</p>
            )}

            {/* Стики-тулбар */}
            <div className="category-page__sticky-toolbar">
              {/* Сортировка - Селектор */}
              <div className="category-page__sort-wrapper">
                <span className="category-page__sort-icon">⇅</span>
                <span className="category-page__sort-current">
                  {(() => {
                    const options = {
                      'popular': 'По популярности',
                      'newest': 'Новинки',
                      'price_asc': 'Цена: по возрастанию',
                      'price_desc': 'Цена: по убыванию',
                      'name_asc': 'Название (А-Я)',
                      'name_desc': 'Название (Я-А)',
                      'default': 'По умолчанию'
                    };
                    return options[sortOption] || 'Сортировка';
                  })()}
                </span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="category-page__native-select"
                >
                  <option value="default">По умолчанию</option>
                  <option value="popular">Сначала популярные</option>
                  <option value="newest">Сначала новые</option>
                  <option value="price_asc">Цена: по возрастанию</option>
                  <option value="price_desc">Цена: по убыванию</option>
                  <option value="name_asc">Название (А-Я)</option>
                  <option value="name_desc">Название (Я-А)</option>
                </select>
              </div>

              {/* Категории - Чипсы */}
              <div className="category-page__mobile-categories-scroll">
                <NavLink
                  to="/shop"
                  className="category-page__pill"
                  end
                >
                  Все
                </NavLink>
                {allCategories.map((cat) => (
                  <NavLink
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    className={({ isActive }) =>
                      isActive
                        ? 'category-page__pill category-page__pill--active'
                        : 'category-page__pill'
                    }
                  >
                    {cat.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Удалена неиспользуемая панель фильтров */}

            <div className="category-page__count">
              Найдено: {sortedProducts.length} {sortedProducts.length === 1 ? 'товар' : 'товаров'}
            </div>

            {sortedProducts.length === 0 ? (
              <div className="category-page__empty">
                <p>В этой категории пока нет товаров.</p>
                <Link to="/shop" className="btn secondary">
                  Вернуться назад
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
                    isFavorite={favorites.some((fav) => fav.id === product.id)}
                    priority={index < 4}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div >
  );
}

export default CategoryPage;
