import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAdminProductById, saveProduct, getCategories, createCategory } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from '../../components/admin/ImageUploader';
import { slugify } from '../../utils/slugify';


const initialState = {
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
};

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hasOptions, setHasOptions] = useState(false);

  // (ИСПРАВЛЕНИЕ ESLint) Эти переменные теперь будут использоваться
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
          const productId = parseInt(id);
          if (!isNaN(productId)) {
            const productData = await getAdminProductById(productId);

            let optionsExist = false;
            if (productData.variants && productData.variants.length > 0) {
              optionsExist = productData.variants.length > 1 ||
              (productData.variants[0] && productData.variants[0].attributes && Object.keys(productData.variants[0].attributes).length > 0);
            }
            setHasOptions(optionsExist);

            setFormData({
              ...productData,
              publication_date: productData.publication_date
                ? productData.publication_date.split('T')[0]
                : new Date().toISOString().split('T')[0],
                        details: productData.details || [],
                        images: productData.images || [],
                        // Гарантируем, что у товара всегда есть хотя бы 1 вариант
                        variants: (productData.variants && productData.variants.length > 0) ? productData.variants : [initialState.variants[0]],
            });
          } else {
            setError('Некорректный ID товара');
          }
        } else {
          setHasOptions(false);
          setFormData(prev => ({
            ...prev,
            variants: [{
              sku: '',
              attributes: {},
              quantity: 0,
              price: null,
              is_available: true
            }]
          }));
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

  // --- ЛОГИКА ДЛЯ "НОВОЙ КАТЕГОРИИ" ---
  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      setNewCategoryError('Название категории не может быть пустым');
      return;
    }
    try {
      setNewCategoryLoading(true);
      setNewCategoryError(null);
      const slug = slugify(newCategoryName);
      const newCategory = await createCategory({
        name: newCategoryName.trim(),
                                               slug: slug,
                                               description: '', image: '', sort_order: 0, is_active: true,
      });
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      setFormData((prev) => ({
        ...prev,
        category_id: newCategory.id,
      }));
      setNewCategoryName('');
      setShowAddCategory(false);
    } catch (err) {
      console.error('Ошибка при создании категории:', err);
      setNewCategoryError('Не удалось создать категорию. Возможно, такая категория уже существует.');
    } finally {
      setNewCategoryLoading(false);
    }
  };
  const handleCategorySelect = (e) => {
    const value = e.target.value;
    if (value === 'add-new') {
      setShowAddCategory(true);
      setNewCategoryName('');
      setFormData((prev) => ({ ...prev, category_id: '' }));
    } else {
      setFormData((prev) => ({ ...prev, category_id: value }));
      setShowAddCategory(false);
    }
  };
  // (ИСПРАВЛЕНИЕ ESLint) Эта функция теперь используется в JSX
  const handleCategoryKeyDown = (e) => {
    if (e.key === 'Enter' && newCategoryName.trim()) {
      e.preventDefault();
      handleAddNewCategory();
    }
  };
  // --- КОНЕЦ ЛОГИКИ КАТЕГОРИЙ ---


  // --- ОБРАБОТЧИКИ МАССИВОВ (details, images) ---
  const handleArrayChange = (e, index, field) => {
    const newArray = [...formData[field]];
    newArray[index] = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };
  const addArrayItem = (field) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };
  const removeArrayItem = (field, index) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  // --- ОБРАБОТЧИКИ 'variants' ---

  // Для товаров с опциями
  const handleVariantChange = (e, index, field) => {
    const newVariants = [...formData.variants];
    let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    if (['quantity', 'price', 'is_available'].includes(field)) { // Убрали 'sku'
      if (field === 'price') {
        value = value === '' ? null : parseFloat(value) || null;
      }
      if (field === 'quantity') {
        value = parseInt(value) || 0;
      }
      newVariants[index][field] = value;
    } else if (field !== 'sku') { // Игнорируем 'sku'
      if (!newVariants[index].attributes) {
        newVariants[index].attributes = {};
      }
      newVariants[index].attributes[field] = value;
    }
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  // Обработчик для "простого" варианта
  const handleSimpleVariantChange = (e, field) => {
    // Игнорируем 'sku'
    if (field === 'sku') return;

    const value = e.target.type === 'number' ? (parseInt(e.target.value) || 0) : e.target.value;

    setFormData(prev => {
      const newVariants = (prev.variants && prev.variants.length > 0)
      ? [...prev.variants]
      : [{}];

      newVariants[0] = {
        ...newVariants[0],
        attributes: {},
        is_available: true,
        [field]: field === 'price' ? (parseFloat(value) || null) : value
      };

      return { ...prev, variants: newVariants };
    });
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          sku: '',
          attributes: { size: '', color: '' },
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
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  // Переключатель чекбокса "Есть опции"
  const handleHasOptionsChange = (e) => {
    const checked = e.target.checked;
    setHasOptions(checked);

    if (checked && (formData.variants.length === 0 || !Object.keys(formData.variants[0].attributes).length)) {
      setFormData(prev => ({ ...prev, variants: [] }));
      addVariant();
    } else if (!checked) {
      setFormData(prev => ({
        ...prev,
        variants: [{
          id: (prev.variants[0] && prev.variants[0].id) || undefined,
                           sku: (prev.variants[0] && prev.variants[0].sku) || '',
                           attributes: {},
                           price: null,
                           quantity: (prev.variants[0] && prev.variants[0].quantity) || 0,
                           is_available: true
        }]
      }));
    }
  };

  // --- ОБРАБОТЧИКИ IMAGEUPLOADER ---
  const handleImagesUploaded = (newImages) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };
  const handleImageDelete = (imageUrlToDelete) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((url) => url !== imageUrlToDelete),
    }));
  };

  // --- ОТПРАВКА ФОРМЫ ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      let processedVariants = [];

      if (hasOptions) {
        // --- Логика для товара С ОПЦИЯМИ ---
        processedVariants = formData.variants.map((v, index) => {
          const cleanAttributes = {};
          if (v.attributes) {
            Object.keys(v.attributes).forEach(key => {
              if (v.attributes[key] && v.attributes[key].trim() !== '') {
                cleanAttributes[key] = v.attributes[key];
              }
            });
          }
          return {
            ...v,
            // 2. (ИСПРАВЛЕНИЕ SKU) Генерируем SKU здесь, если его нет
            sku: v.sku || `VAR-${formData.name.substring(0, 3).toUpperCase()}-${index}-${Date.now().toString().slice(-4)}`,
                                                  attributes: cleanAttributes,
                                                  price: v.price ? parseFloat(v.price) : null,
                                                  quantity: v.quantity ? parseInt(v.quantity) : 0,
          };
        })
        .filter(v => Object.keys(v.attributes).length > 0);

      } else {
        // --- Логика для ПРОСТОГО ТОВАРА ---
        const simpleVariant = (formData.variants && formData.variants[0]) || {};
        processedVariants.push({
          id: simpleVariant.id || undefined,
          // 2. (ИСПРАВЛЕНИЕ SKU) Генерируем SKU здесь, если его нет
          sku: simpleVariant.sku || `BASE-${formData.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
                               attributes: {},
                               quantity: parseInt(simpleVariant.quantity) || 0,
                               price: null,
                               is_available: true,
        });
      }

      if (processedVariants.length === 0) {
        if (hasOptions) {
          setError('Нужно добавить хотя бы один вариант (например, Размер/Цвет) и заполнить его.');
        } else {
          setError('Нужно указать Количество на складе.');
        }
        setLoading(false);
        return;
      }

      const productData = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        details: (formData.details || []).filter((d) => d && d.trim() !== ''),
        variants: processedVariants,
      };

      const response = await saveProduct(productData);

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

  // --- РЕНДЕРИНГ ---

  if (loading && id !== 'new') {
    return (
      <div className="admin-product-edit__container admin-product-edit__container--centered">
      <h1>Загрузка данных...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-product-edit__container admin-product-edit__container--centered">
      <h1>Ошибка</h1>
      <p>{error}</p>
      <Link to="/admin/products" className="btn primary">
      Вернуться к списку товаров
      </Link>
      </div>
    );
  }

  return (
    <div className="admin-product-edit">
    <div className="admin-product-edit__container">
    <div className="admin-product-edit__header">
    <h1>{id === 'new' ? 'Новый товар' : `Редактирование: ${formData.name}`}</h1>
    <Link to="/admin/products" className="btn secondary">
    Назад к списку
    </Link>
    </div>

    <form onSubmit={handleSubmit} className="admin-product-edit__form">
    {/* --- Основная информация --- */}
    <div className="admin-product-edit__form-section">
    <h2 className="admin-product-edit__section-title">Основная информация</h2>
    <div className="admin-product-edit__grid">

    <div className="admin-product-edit__form-group">
    <label htmlFor="name" className="admin-product-edit__label">Название *</label>
    <input
    type="text" id="name" name="name"
    className="admin-product-edit__input"
    value={formData.name} onChange={handleChange} required
    />
    </div>

    <div className="admin-product-edit__form-group">
    <label className="admin-product-edit__label">Категория *</label>
    <div className="admin-product-edit__category-group">
    <select
    id="category_id" name="category_id"
    className="admin-product-edit__select"
    value={formData.category_id} onChange={handleCategorySelect} required
    >
    <option value="">Выберите категорию</option>
    {categories.map((category) => (
      <option key={category.id} value={category.id}>{category.name}</option>
    ))}
    <option value="add-new">+ Добавить новую категорию</option>
    </select>
    <button
    type="button"
    onClick={() => setShowAddCategory(!showAddCategory)}
    className="admin-product-edit__add-category-toggle" title="Добавить новую категорию"
    > + </button>
    </div>

    {/* 3. (ВОССТАНОВЛЕННЫЙ JSX - ИСПРАВЛЕНИЕ ESLint) */}
    {showAddCategory && (
      <div className="admin-product-edit__add-category-form">
      <div className="admin-product-edit__add-category-input-group">
      <input
      ref={newCategoryInputRef}
      type="text"
      value={newCategoryName}
      onChange={(e) => setNewCategoryName(e.target.value)}
      onKeyDown={handleCategoryKeyDown}
      placeholder="Название новой категории"
      className="admin-product-edit__add-category-input"
      />
      <button
      type="button"
      onClick={handleAddNewCategory}
      disabled={newCategoryLoading || !newCategoryName.trim()}
      className="admin-product-edit__add-category-submit"
      >
      {newCategoryLoading ? '...' : 'Создать'}
      </button>
      </div>
      {newCategoryError && (
        <div className="admin-product-edit__add-category-error">
        {newCategoryError}
        </div>
      )}
      <div className="admin-product-edit__add-category-hint">
      Нажмите Enter для создания
      </div>
      </div>
    )}
    </div>

    <div className="admin-product-edit__form-group">
    <label htmlFor="base_price" className="admin-product-edit__label">Базовая цена *</label>
    <input
    type="number" id="base_price" name="base_price"
    className="admin-product-edit__input"
    value={formData.base_price} onChange={handleChange} required
    min="0" step="0.01"
    />
    </div>

    <div className="admin-product-edit__form-group">
    <label className="admin-product-edit__label">Параметры</label>
    <div className="admin-product-edit__checkbox-group">
    <label className="admin-product-edit__checkbox-label">
    <input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleChange} /> Новинка
    </label>
    <label className="admin-product-edit__checkbox-label">
    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Активный (виден на сайте)
    </label>
    </div>
    </div>
    </div>
    </div>

    {/* --- 4. (ВОССТАНОВЛЕННЫЙ JSX) Описание --- */}
    <div className="admin-product-edit__form-section">
    <h2 className="admin-product-edit__section-title">Описание</h2>
    <div className="admin-product-edit__form-group">
    <label htmlFor="description" className="admin-product-edit__label">Описание *</label>
    <textarea
    id="description" name="description" className="admin-product-edit__textarea"
    value={formData.description} onChange={handleChange} required rows="5"
    ></textarea>
    </div>
    <div className="admin-product-edit__form-group">
    <label htmlFor="materials" className="admin-product-edit__label">Материалы и особенности</label>
    <textarea
    id="materials" name="materials" className="admin-product-edit__textarea"
    value={formData.materials} onChange={handleChange} rows="3"
    ></textarea>
    </div>
    <div className="admin-product-edit__form-group">
    <label className="admin-product-edit__label">Детали (список)</label>
    {formData.details.map((detail, index) => (
      <div key={index} className="admin-product-edit__dynamic-item">
      <input
      type="text" value={detail}
      onChange={(e) => handleArrayChange(e, index, 'details')}
      className="admin-product-edit__dynamic-item-input"
      />
      <button
      type="button" onClick={() => removeArrayItem('details', index)}
      className="admin-product-edit__button--remove"
      > Удалить </button>
      </div>
    ))}
    <button
    type="button" onClick={() => addArrayItem('details')}
    className="admin-product-edit__button--add"
    > Добавить деталь </button>
    </div>
    </div>

    {/* --- 5. (ВОССТАНОВЛЕННЫЙ JSX) Изображения --- */}
    <div className="admin-product-edit__form-section">
    <h2 className="admin-product-edit__section-title">Изображения</h2>
    <ImageUploader
    currentImages={formData.images}
    onImagesUploaded={handleImagesUploaded}
    onImageDelete={handleImageDelete}
    />
    <div className="admin-product-edit__manual-upload">
    <h3 className="admin-product-edit__manual-upload-title">
    Или добавьте URL изображения вручную:
    </h3>
    {formData.images.map((image, index) => (
      <div key={index} className="admin-product-edit__dynamic-item">
      <input
      type="text"
      value={image}
      onChange={(e) => handleArrayChange(e, index, 'images')}
      placeholder="URL изображения"
      className="admin-product-edit__dynamic-item-input"
      />
      <button
      type="button"
      onClick={() => removeArrayItem('images', index)}
      className="admin-product-edit__button--remove"
      >
      Удалить
      </button>
      </div>
    ))}
    <button
    type="button"
    onClick={() => addArrayItem('images')}
    className="admin-product-edit__button--add"
    >
    Добавить URL
    </button>
    </div>
    </div>

    {/* --- Варианты и остатки (НОВАЯ ЛОГИКА) --- */}
    <div className="admin-product-edit__form-section">
    <h2 className="admin-product-edit__section-title">Варианты и остатки</h2>

    <div className="admin-product-edit__form-group">
    <div className="admin-product-edit__checkbox-group">
    <label className="admin-product-edit__checkbox-label">
    <input
    type="checkbox"
    name="hasOptions"
    checked={hasOptions}
    onChange={handleHasOptionsChange}
    />
    У этого товара есть опции (например, размер или цвет)
    </label>
    </div>
    </div>

    {!hasOptions ? (
      // --- РЕЖИМ "ПРОСТОГО ТОВАРА" ---
      <div className="admin-product-edit__variant-card">
      <p style={{marginBottom: '1rem', color: '#666'}}>
      Укажите общее количество товара на складе.
      </p>
      <div className="admin-product-edit__grid">
      <div className="admin-product-edit__form-group">
      <label className="admin-product-edit__label">Количество на складе *</label>
      <input
      type="number"
      value={formData.variants[0]?.quantity || 0}
      onChange={(e) => handleSimpleVariantChange(e, 'quantity')}
      required
      min="0"
      className="admin-product-edit__input"
      />
      </div>
      <div className="admin-product-edit__form-group">
      <label className="admin-product-edit__label">SKU (Артикул)</label>
      <input
      type="text"
      value={formData.variants[0]?.sku || ''}
      onChange={(e) => handleSimpleVariantChange(e, 'sku')}
      readOnly // (ИСПРАВЛЕНИЕ SKU)
    placeholder="Генерируется при сохранении..."
    className="admin-product-edit__input"
    />
    </div>
    </div>
    </div>

    ) : (
      // --- РЕЖИМ "ТОВАРА С ОПЦИЯМИ" ---
      <>
      {formData.variants.map((variant, index) => (
        <div key={index} className="admin-product-edit__variant-card">
        <div className="admin-product-edit__variant-grid-main">
        <div className="admin-product-edit__form-group">
        <label className="admin-product-edit__label">SKU</label>
        <input
        type="text"
        value={variant.sku}
        onChange={(e) => handleVariantChange(e, index, 'sku')}
        readOnly // (ИСПРАВЛЕНИЕ SKU)
      placeholder="Генерируется при сохранении..."
      className="admin-product-edit__input"
      />
      </div>

      <div className="admin-product-edit__form-group">
      <label className="admin-product-edit__label">Размер</label>
      <input
      type="text"
      value={variant.attributes?.size || ''}
      onChange={(e) => handleVariantChange(e, index, 'size')}
      className="admin-product-edit__input"
      />
      </div>

      <div className="admin-product-edit__form-group">
      <label className="admin-product-edit__label">Цвет</label>
      <input
      type="text"
      value={variant.attributes?.color || ''}
      onChange={(e) => handleVariantChange(e, index, 'color')}
      className="admin-product-edit__input"
      />
      </div>

      <div className="admin-product-edit__form-group">
      <label className="admin-product-edit__label">Доступен</label>
      <div className="admin-product-edit__checkbox-group">
      <input
      type="checkbox"
      checked={variant.is_available}
      onChange={(e) => handleVariantChange(e, index, 'is_available')}
      />
      </div>
      </div>
      </div>

      <div className="admin-product-edit__variant-grid-secondary">
      <div className="admin-product-edit__form-group">
      <label className="admin-product-edit__label">Количество *</label>
      <input
      type="number"
      value={variant.quantity}
      onChange={(e) => handleVariantChange(e, index, 'quantity')}
      required min="0"
      className="admin-product-edit__input"
      />
      </div>
      <div className="admin-product-edit__form-group">
      <label className="admin-product-edit__label">Цена (если отличается)</label>
      <input
      type="number"
      value={variant.price || ''}
      onChange={(e) => handleVariantChange(e, index, 'price')}
      min="0" step="0.01"
      className="admin-product-edit__input"
      />
      </div>
      </div>

      <button
      type="button"
      onClick={() => removeVariant(index)}
      className="admin-product-edit__button--remove"
      > Удалить вариант </button>
      </div>
      ))}

      <button
      type="button"
      onClick={addVariant}
      className="admin-product-edit__button--add"
      > Добавить вариант </button>
      </>
    )}
    </div>

    {/* --- Дополнительные настройки --- */}
    <div className="admin-product-edit__form-section">
    <h2 className="admin-product-edit__section-title">Дополнительные настройки</h2>
    <div className="admin-product-edit__grid">
    <div className="admin-product-edit__form-group">
    <label htmlFor="publication_date" className="admin-product-edit__label">Дата публикации</label>
    <input
    type="date" id="publication_date" name="publication_date"
    className="admin-product-edit__input"
    value={formData.publication_date} onChange={handleChange}
    />
    </div>
    <div className="admin-product-edit__form-group">
    <label htmlFor="sort_order" className="admin-product-edit__label">Порядок сортировки</label>
    <input
    type="number" id="sort_order" name="sort_order"
    className="admin-product-edit__input"
    value={formData.sort_order} onChange={handleChange} min="0"
    />
    </div>
    </div>
    </div>

    {/* --- Футер --- */}
    <div className="admin-product-edit__footer-actions">
    <Link to="/admin/products" className="btn secondary">Отмена</Link>
    <button type="submit" className="btn primary" disabled={loading}>
    {loading ? 'Сохранение...' : 'Сохранить'}
    </button>
    </div>
    </form>
    </div>
    </div>
  );
}

export default ProductEdit;
