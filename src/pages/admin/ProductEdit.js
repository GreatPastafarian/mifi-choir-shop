import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, saveProduct, getCategories, createCategory } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from '../../components/admin/ImageUploader'; // Импортируем новый компонент

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    materials: '',
    details: [],
    images: [],
    base_price: '',
    is_new: true,
    publication_date: new Date().toISOString().split('T')[0],
    views_count: 0,
    sort_order: 0,
    is_active: true,
    variants: [],
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Состояния для добавления новой категории
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLoading, setNewCategoryLoading] = useState(false);
  const [newCategoryError, setNewCategoryError] = useState(null);
  const newCategoryInputRef = useRef(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);

        if (id && id !== 'new') {
          // Проверяем, что ID является числом
          const productId = parseInt(id);
          if (!isNaN(productId)) {
            const productData = await getProductById(productId);
            setFormData({
              ...productData,
              publication_date: productData.publication_date.split('T')[0],
            });
          } else {
            setError('Некорректный ID товара');
          }
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAdmin, navigate]);

  // Фокус на поле ввода при открытии формы добавления категории
  useEffect(() => {
    if (showAddCategory && newCategoryInputRef.current) {
      newCategoryInputRef.current.focus();
    }
  }, [showAddCategory]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Функция для добавления новой категории
  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      setNewCategoryError('Название категории не может быть пустым');
      return;
    }

    try {
      setNewCategoryLoading(true);
      setNewCategoryError(null);

      // Создаем slug из названия (транслитерация и замена пробелов на дефисы)
      const slug = newCategoryName
        .toLowerCase()
        .replace(/[^а-яa-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/а/g, 'a')
        .replace(/б/g, 'b')
        .replace(/в/g, 'v')
        .replace(/г/g, 'g')
        .replace(/д/g, 'd')
        .replace(/е/g, 'e')
        .replace(/ё/g, 'yo')
        .replace(/ж/g, 'zh')
        .replace(/з/g, 'z')
        .replace(/и/g, 'i')
        .replace(/й/g, 'y')
        .replace(/к/g, 'k')
        .replace(/л/g, 'l')
        .replace(/м/g, 'm')
        .replace(/н/g, 'n')
        .replace(/о/g, 'o')
        .replace(/п/g, 'p')
        .replace(/р/g, 'r')
        .replace(/с/g, 's')
        .replace(/т/g, 't')
        .replace(/у/g, 'u')
        .replace(/ф/g, 'f')
        .replace(/х/g, 'h')
        .replace(/ц/g, 'c')
        .replace(/ч/g, 'ch')
        .replace(/ш/g, 'sh')
        .replace(/щ/g, 'sch')
        .replace(/ъ/g, '')
        .replace(/ы/g, 'y')
        .replace(/ь/g, '')
        .replace(/э/g, 'e')
        .replace(/ю/g, 'yu')
        .replace(/я/g, 'ya');

      // Создаем новую категорию
      const newCategory = await createCategory({
        name: newCategoryName.trim(),
        slug: slug,
        description: '',
        image: '',
        sort_order: 0,
        is_active: true,
      });

      // Обновляем список категорий
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);

      // Выбираем новую категорию
      setFormData((prev) => ({
        ...prev,
        category_id: newCategory.id,
      }));

      // Сбрасываем форму добавления
      setNewCategoryName('');
      setShowAddCategory(false);
    } catch (err) {
      console.error('Ошибка при создании категории:', err);
      setNewCategoryError('Не удалось создить категорию. Возможно, такая категория уже существует.');
    } finally {
      setNewCategoryLoading(false);
    }
  };

  const handleCategorySelect = (e) => {
    const value = e.target.value;

    // Если выбрана опция "Добавить новую категорию"
    if (value === 'add-new') {
      setShowAddCategory(true);
      setNewCategoryName('');
      // Сбрасываем выбор, чтобы не было конфликта
      setFormData((prev) => ({
        ...prev,
        category_id: '',
      }));
    } else {
      // Обычный выбор категории
      setFormData((prev) => ({
        ...prev,
        category_id: value,
      }));
      // Скрываем форму добавления, если она открыта
      setShowAddCategory(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newCategoryName.trim()) {
      e.preventDefault();
      handleAddNewCategory();
    }
  };

  const handleArrayChange = (e, index, field) => {
    const newArray = [...formData[field]];
    newArray[index] = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: newArray,
    }));
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field, index) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      [field]: newArray,
    }));
  };

  const handleVariantChange = (e, index, field) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = field === 'price' || field === 'quantity' ? parseFloat(e.target.value) : e.target.value;
    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
    }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          sku: '',
          size: '',
          color: '',
          quantity: 0,
          price: null,
          is_available: true,
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
    }));
  };

  const handleImageChange = (e, index) => {
    const newImages = [...formData.images];
    newImages[index] = e.target.value;
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const addImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ''],
    }));
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  // Обработчик загрузки изображений через ImageUploader
  const handleImagesUploaded = (newImages) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Подготавливаем данные для отправки
      const productData = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        details: formData.details.filter((d) => d.trim() !== ''),
      };

      // Сохраняем товар
      const response = await saveProduct(productData);

      // После успешного сохранения перенаправляем на страницу редактирования с правильным ID
      if (id === 'new') {
        navigate(`/admin/products/edit/${response.id}`);
      } else {
        navigate('/admin/products');
      }
    } catch (err) {
      console.error('Ошибка сохранения товара:', err);
      setError('Ошибка сохранения товара');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <h1>Загрузка данных...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <h1>Ошибка</h1>
        <p>{error}</p>
        <Link to="/admin/products" className="btn primary" style={{ marginTop: '1rem' }}>
          Вернуться к списку товаров
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-product-edit">
      <div
        className="container"
        style={{
          maxWidth: '1200px',
          margin: '4rem auto',
          padding: '0 1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <h1>{id === 'new' ? 'Новый товар' : `Редактирование товара: ${formData.name}`}</h1>
          <Link to="/admin/products" className="btn secondary">
            Назад к списку товаров
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          }}
        >
          {/* Основная информация */}
          <div className="form-section" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Основная информация</h2>
            <div
              className="form-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
              }}
            >
              <div className="form-group">
                <label
                  htmlFor="name"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                  }}
                >
                  Название *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div className="form-group">
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                  }}
                >
                  Категория *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleCategorySelect}
                    required
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem',
                    }}
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                    <option value="add-new" style={{ fontWeight: 'bold', color: '#8d1f2c' }}>
                      + Добавить новую категорию
                    </option>
                  </select>

                  {/* Кнопка быстрого добавления категории */}
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(!showAddCategory)}
                    style={{
                      background: '#f5f0e5',
                      color: '#8d1f2c',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    title="Добавить новую категорию"
                  >
                    <span style={{ fontWeight: 'bold' }}>+</span>
                  </button>
                </div>

                {/* Форма добавления новой категории */}
                {showAddCategory && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '4px',
                      border: '1px solid #eee',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        ref={newCategoryInputRef}
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Название новой категории"
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        disabled={newCategoryLoading || !newCategoryName.trim()}
                        style={{
                          background: '#8d1f2c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.75rem',
                          cursor: 'pointer',
                          opacity: newCategoryLoading || !newCategoryName.trim() ? 0.7 : 1,
                        }}
                      >
                        {newCategoryLoading ? 'Создание...' : 'Создать'}
                      </button>
                    </div>

                    {newCategoryError && (
                      <div
                        style={{
                          color: '#c33',
                          fontSize: '0.85rem',
                          marginTop: '0.25rem',
                          paddingLeft: '0.25rem',
                        }}
                      >
                        {newCategoryError}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: '#666',
                        marginTop: '0.5rem',
                        paddingLeft: '0.25rem',
                      }}
                    >
                      Подсказка: Нажмите Enter для создания категории
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="base_price"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                  }}
                >
                  Базовая цена *
                </label>
                <input
                  type="number"
                  id="base_price"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div className="form-group">
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                  }}
                >
                  Параметры
                </label>
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleChange} />
                    Новинка
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                    Активный
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Описание */}
          <div className="form-section" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Описание</h2>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="description"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                }}
              >
                Описание *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  resize: 'vertical',
                }}
              ></textarea>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="materials"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                }}
              >
                Материалы и особенности
              </label>
              <textarea
                id="materials"
                name="materials"
                value={formData.materials}
                onChange={handleChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  resize: 'vertical',
                }}
              ></textarea>
            </div>

            <div className="form-group">
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                }}
              >
                Детали
              </label>
              {formData.details.map((detail, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <input
                    type="text"
                    value={detail}
                    onChange={(e) => handleArrayChange(e, index, 'details')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('details', index)}
                    style={{
                      background: '#f5f0e5',
                      color: '#8d1f2c',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    Удалить
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('details')}
                style={{
                  background: '#8d1f2c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  marginTop: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                Добавить деталь
              </button>
            </div>
          </div>

          {/* Изображения */}
          <div className="form-section" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Изображения</h2>

            {/* Новый компонент для загрузки изображений */}
            <ImageUploader currentImages={formData.images} onImagesUploaded={handleImagesUploaded} />

            {/* Старый способ добавления изображений через URL (опционально) */}
            <div
              style={{
                marginTop: '2rem',
                borderTop: '1px solid #eee',
                paddingTop: '1.5rem',
              }}
            >
              <h3
                style={{
                  marginBottom: '1rem',
                  fontSize: '1.2rem',
                  color: '#0a2240',
                }}
              >
                Или добавьте URL изображения вручную:
              </h3>

              {formData.images.map((image, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => handleImageChange(e, index)}
                    placeholder="URL изображения"
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      background: '#f5f0e5',
                      color: '#8d1f2c',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    Удалить
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImage}
                style={{
                  background: '#8d1f2c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  marginTop: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                Добавить URL изображения
              </button>
            </div>
          </div>

          {/* Варианты */}
          <div className="form-section" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Варианты товара</h2>
            {formData.variants.map((variant, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#f9f9f9',
                  padding: '1rem',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div className="form-group">
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                      }}
                    >
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(e, index, 'sku')}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                      }}
                    >
                      Размер
                    </label>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(e, index, 'size')}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                      }}
                    >
                      Цвет
                    </label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(e, index, 'color')}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                      }}
                    >
                      Доступен
                    </label>
                    <input
                      type="checkbox"
                      checked={variant.is_available}
                      onChange={(e) =>
                        handleVariantChange({ target: { value: e.target.checked } }, index, 'is_available')
                      }
                      style={{ marginLeft: '0.5rem' }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                  }}
                >
                  <div className="form-group">
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                      }}
                    >
                      Количество *
                    </label>
                    <input
                      type="number"
                      value={variant.quantity}
                      onChange={(e) => handleVariantChange(e, index, 'quantity')}
                      required
                      min="0"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                      }}
                    >
                      Цена (если отличается от базовой)
                    </label>
                    <input
                      type="number"
                      value={variant.price || ''}
                      onChange={(e) => handleVariantChange(e, index, 'price')}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  style={{
                    background: '#f5f0e5',
                    color: '#8d1f2c',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    marginTop: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  Удалить вариант
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariant}
              style={{
                background: '#8d1f2c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                marginTop: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Добавить вариант
            </button>
          </div>

          {/* Дополнительные настройки */}
          <div className="form-section" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Дополнительные настройки</h2>
            <div
              className="form-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
              }}
            >
              <div className="form-group">
                <label
                  htmlFor="publication_date"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                  }}
                >
                  Дата публикации
                </label>
                <input
                  type="date"
                  id="publication_date"
                  name="publication_date"
                  value={formData.publication_date}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="sort_order"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                  }}
                >
                  Порядок сортировки
                </label>
                <input
                  type="number"
                  id="sort_order"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '2rem',
            }}
          >
            <Link to="/admin/products" className="btn secondary">
              Отмена
            </Link>
            <button
              type="submit"
              className="btn primary"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
              }}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductEdit;
