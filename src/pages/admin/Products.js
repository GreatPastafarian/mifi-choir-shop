import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminProducts, deleteProduct } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
// (ИЗМЕНЕНИЕ) Импортируем хелперы
import { getImageUrl, getProductImageSet } from '../../utils/imageUtils';

// (ИЗМЕНЕНИЕ) Компонент ProductCard теперь использует <img>
const ProductCard = ({ product, categoryName, handleDelete, navigate }) => {

  // 1. Получаем базовый URL
  const imageUrl = getImageUrl(product.images && product.images[0]);
  // 2. Получаем набор картинок (нам нужен маленький 'sm' и 'srcSet')
  const { srcSet, sm } = getProductImageSet(imageUrl);

  return (
    <div className="admin-products__card">
    {/* 3. (ИЗМЕНЕНИЕ) Заменяем <div> на <img> */}
    <img
    className="admin-products__card-image"
    src={sm} // Фоллбэк на маленькую (400px)
  srcSet={srcSet} // Адаптивность
  sizes="300px" // Подсказка браузеру (т.к. колонка 300px)
  alt={product.name}
  />
  {product.is_new && (
    <div className="admin-products__card-badge">Новинка</div>
  )}

  <div className="admin-products__card-info">
  <div className="admin-products__card-info-header">
  <h3 className="admin-products__card-title">
  {product.name}
  </h3>
  <span className="admin-products__card-price">
  {product.base_price} ₽
  </span>
  </div>

  <div className="admin-products__card-category">
  {categoryName || 'Без категории'}
  </div>

  <div className="admin-products__card-actions">
  <button
  onClick={() =>
    navigate(`/admin/products/edit/${product.id}`)
  }
  className="btn secondary admin-products__card-button"
  >
  Редактировать
  </button>
  <button
  onClick={() => handleDelete(product.id)}
  className="btn secondary admin-products__card-button admin-products__card-button--delete"
  >
  Удалить
  </button>
  </div>
  </div>
  </div>
  );
};


function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsData, categoriesData] = await Promise.all([
          getAdminProducts(),
                                                                 getAllCategories(),
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, navigate]);

  const handleDelete = async (productId) => {
    if (window.confirm('Вы действительно хотите удалить этот товар?')) {
      try {
        setError(null);
        await deleteProduct(productId);
        setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
        );
      } catch (err) {
        console.error('Ошибка при удалении товара:', err);
        setError('Не удалось удалить товар');
      }
    }
  };

  // (ИЗМЕНЕНИЕ) Удалена локальная функция getImageUrl, т.к. она теперь в ProductCard

  // (НОВАЯ ЛОГИКА) Группировка товаров по категориям
  const groupedProducts = useMemo(() => {
    if (products.length === 0 || categories.length === 0) {
      return [];
    }

    const productsMap = new Map();
    const uncategorized = [];

    // 1. Распределяем товары по ID категории
    for (const product of products) {
      if (product.category_id && categories.find(c => c.id === product.category_id)) {
        if (!productsMap.has(product.category_id)) {
          productsMap.set(product.category_id, []);
        }
        productsMap.get(product.category_id).push(product);
      } else {
        uncategorized.push(product);
      }
    }

    // 2. Формируем массив секций
    const sections = [];

    // 3. Сначала добавляем секции для категорий, у которых есть товары
    for (const category of categories) {
      const categoryProducts = productsMap.get(category.id);
      if (categoryProducts && categoryProducts.length > 0) {
        sections.push({
          id: category.id,
          name: category.name,
          products: categoryProducts,
        });
      }
    }

    // 4. В конце добавляем секцию "Без категории", если там есть товары
    if (uncategorized.length > 0) {
      sections.push({
        id: 'uncategorized',
        name: 'Без категории',
        products: uncategorized,
      });
    }

    return sections;

  }, [products, categories]);


  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="admin-products__container admin-products__container--centered">
      <h1>Загрузка...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-products__container admin-products__container--centered">
      <h1>Ошибка</h1>
      <p>{error}</p>
      <button
      className="btn primary admin-products__retry-button"
      onClick={() => window.location.reload()}
      >
      Повторить попытку
      </button>
      </div>
    );
  }

  return (
    <div className="admin-products">
    <div className="admin-products__container">
    <div className="admin-products__header">
    <h1>Управление товарами</h1>
    <Link to="/admin/products/new" className="btn primary">
    Добавить товар
    </Link>
    </div>

    {products.length === 0 ? (
      <div className="admin-products__empty-state">
      <p className="admin-products__empty-text">Нет добавленных товаров</p>
      <Link to="/admin/products/new" className="btn primary">
      Добавить первый товар
      </Link>
      </div>
    ) : (
      <div className="admin-products__groups-wrapper">
      {groupedProducts.map((group) => (
        <section key={group.id} className="admin-products__category-group">
        <h2 className="admin-products__category-title">{group.name}</h2>
        <div className="admin-products__grid">
        {group.products.map((product) => (
          <ProductCard
          key={product.id}
          product={product}
          categoryName={group.name}
          // (ИЗМЕНЕНИЕ) getImageUrl больше не передаем
          handleDelete={handleDelete}
          navigate={navigate}
          />
        ))}
        </div>
        </section>
      ))}
      </div>
    )}
    </div>
    </div>
  );
}

export default Products;
