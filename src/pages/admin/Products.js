import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllProducts, deleteProduct } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../services/api';

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
        // Оптимизация: категории можно вынести в Context,
        // но пока оставим Promise.all
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
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

  // 2. ОПТИМИЗАЦИЯ ЛОГИКИ УДАЛЕНИЯ
  const handleDelete = async (productId) => {
    if (window.confirm('Вы действительно хотите удалить этот товар?')) {
      try {
        setError(null); // Сбрасываем предыдущие ошибки
        await deleteProduct(productId);
        // Обновляем state, не перезагружая все данные с сервера
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productId)
        );
      } catch (err) {
        console.error('Ошибка при удалении товара:', err);
        setError('Не удалось удалить товар');
      }
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return '/placeholder.jpg'; // Используем локальный плейсхолдер
    }
    if (imagePath.startsWith('http')) {
      return imagePath; // Это уже полный URL
    }

    // !! ВОТ ИСПРАВЛЕНИЕ:
    // Убираем 'public/' из начала пути, если он там есть
    const cleanPath = imagePath.startsWith('public/')
      ? imagePath.substring(7) // 7 — это длина 'public/'
      : imagePath;

    // Собираем URL с BASE_URL, убедившись, что нет двойных слэшей
    return `${BASE_URL}/${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;
  };

  // 3. ЗАМЕНА INLINE-СТИЛЕЙ НА БЭМ-КЛАССЫ

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
          <div className="admin-products__grid">
            {products.map((product) => {
              const category = categories.find(
                (c) => c.id === product.category_id
              );
              const imageUrl = getImageUrl(
                product.images && product.images[0]
              );

              return (
                <div key={product.id} className="admin-products__card">
                  <div
                    className="admin-products__card-image"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  >
                    {product.is_new && (
                      <div className="admin-products__card-badge">Новинка</div>
                    )}
                  </div>

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
                      {category ? category.name : 'Без категории'}
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
