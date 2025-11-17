import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAdminProductById, saveProduct, getCategories } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from '../../components/admin/ImageUploader';
import { MdAdd, MdDeleteOutline, MdClose } from 'react-icons/md';

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
    // (ИЗМЕНЕНИЕ) 'sort_order' удален
    is_active: true,
    variants: [],
};

// Хелпер для получения Декартова произведения (для генерации вариантов)
const getCartesianProduct = (arrays) => {
  if (!arrays || arrays.length === 0) {
    return [];
  }
  return arrays.reduce(
    (acc, current) => {
      return acc.flatMap(d => {
        return current.map(e => {
          return [d, e].flat();
        });
      });
    },
    [[]]
  );
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

  // --- (НОВАЯ ЛОГИКА) State для генератора опций ---
  const [optionSetup, setOptionSetup] = useState([
    { id: 1, name: 'Размер', values: '' },
  ]);
  // --------------------------------------------------

  // --- (НОВАЯ ЛОГИКА) Восстановление optionSetup из formData.variants при загрузке ---
  const loadOptionsFromVariants = useCallback((variants) => {
    if (!variants || variants.length === 0) {
      setHasOptions(false);
      return;
    }

    const attributeKeys = new Set();
    variants.forEach(v => {
      if (v.attributes) {
        Object.keys(v.attributes).forEach(key => attributeKeys.add(key));
      }
    });

    if (attributeKeys.size === 0) {
      setHasOptions(false); // Это "простой" товар
      return;
    }

    setHasOptions(true);
    const loadedOptions = Array.from(attributeKeys).map((name, index) => {
      const valuesSet = new Set();
      variants.forEach(v => {
        if (v.attributes[name]) {
          valuesSet.add(v.attributes[name]);
        }
      });
      return {
        id: index + 1,
        name: name,
        values: Array.from(valuesSet).join(', '),
      };
    });
    setOptionSetup(loadedOptions);

  }, []); // useCallback, т.к. используется в useEffect

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);

        if (id && id !== 'new') {
          const productId = parseInt(id);
          if (!isNaN(productId)) {
            const productData = await getAdminProductById(productId);

            const initialVariants = (productData.variants && productData.variants.length > 0) ? productData.variants : [{
              sku: '', attributes: {}, quantity: 0, price: null, is_available: true
            }];

            setFormData({
              ...productData,
              publication_date: productData.publication_date
                ? productData.publication_date.split('T')[0]
                : new Date().toISOString().split('T')[0],
                        details: productData.details || [],
                        images: productData.images || [],
                        variants: initialVariants,
            });

            // (НОВАЯ ЛОГИКА)
            loadOptionsFromVariants(initialVariants);

          } else {
            setError('Некорректный ID товара');
          }
        } else {
          // Это новый товар
          setHasOptions(false);
          setFormData(prev => ({
            ...prev,
            variants: [{
              sku: '', attributes: {}, quantity: 0, price: null, is_available: true
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
  }, [id, isAdmin, navigate, loadOptionsFromVariants]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategorySelect = (e) => {
    setFormData((prev) => ({ ...prev, category_id: e.target.value }));
  };

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

  // --- (НОВАЯ ЛОГИКА) ОБРАБОТЧИКИ ГЕНЕРАТОРА ОПЦИЙ ---

  // Обновление имени опции (напр., "Размер")
  const handleOptionNameChange = (id, newName) => {
    setOptionSetup(prev =>
    prev.map(opt => (opt.id === id ? { ...opt, name: newName } : opt))
    );
  };

  // Обновление значений опции (напр., "S, M, L")
  const handleOptionValuesChange = (id, newValues) => {
    setOptionSetup(prev =>
    prev.map(opt => (opt.id === id ? { ...opt, values: newValues } : opt))
    );
  };

  // Добавить новую опцию (напр., "Цвет")
  const handleAddOption = () => {
    setOptionSetup(prev => [
      ...prev,
      { id: Date.now(), name: '', values: '' },
    ]);
  };

  // Удалить опцию
  const handleRemoveOption = (id) => {
    setOptionSetup(prev => prev.filter(opt => opt.id !== id));
  };

  // --- (НОВАЯ ЛОГИКА) ГЕНЕРАЦИЯ ВАРИАНТОВ ---
  const handleGenerateVariants = () => {
    // 1. Фильтруем и парсим опции
    const validOptions = optionSetup
    .map(opt => ({
      name: opt.name.trim(),
                 values: opt.values.split(',').map(v => v.trim()).filter(Boolean),
    }))
    .filter(opt => opt.name && opt.values.length > 0);

    if (validOptions.length === 0) {
      setFormData(prev => ({ ...prev, variants: [] }));
      return;
    }

    // 2. Получаем имена и массивы значений
    const optionNames = validOptions.map(opt => opt.name);
    const optionValueArrays = validOptions.map(opt => opt.values);

    // 3. Получаем Декартово произведение (все комбинации)
    //    Напр.: [['S', 'Red'], ['S', 'Blue'], ['M', 'Red'], ['M', 'Blue']]
    const combinations = getCartesianProduct(optionValueArrays);

    const oldVariants = formData.variants || [];

    // 4. Создаем новые варианты, сохраняя старые данные
    const newVariants = combinations.map(combo => {
      const attributes = {};
      optionNames.forEach((name, i) => {
        attributes[name] = combo[i];
      });

      // Ищем старый вариант, чтобы сохранить цену/кол-во
      const oldVariant = oldVariants.find(v => {
        if (!v.attributes) return false;
        // Сравниваем
        return (
          Object.keys(v.attributes).length === Object.keys(attributes).length &&
          Object.keys(v.attributes).every(key => v.attributes[key] === attributes[key])
        );
      });

      return {
        id: oldVariant?.id || undefined,
        sku: oldVariant?.sku || '', // SKU тоже сохраняем
        attributes: attributes,
        quantity: oldVariant?.quantity || 0,
        price: oldVariant?.price || null,
        is_available: oldVariant?.is_available !== undefined ? oldVariant.is_available : true,
      };
    });

    setFormData(prev => ({ ...prev, variants: newVariants }));
  };


  // --- (ОБНОВЛЕННАЯ ЛОГИКА) ОБРАБОТЧИКИ 'variants' ---
  // Этот обработчик теперь работает с ТАБЛИЦЕЙ сгенерированных вариантов

  const handleVariantChange = (e, index, field) => {
    const newVariants = [...formData.variants];
    const variant = newVariants[index];
    if (!variant) return;

    let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    if (field === 'price') {
      value = value === '' ? null : parseFloat(value) || null;
      variant.price = value;
    } else if (field === 'quantity') {
      value = parseInt(value) || 0;
      variant.quantity = value;
    } else if (field === 'is_available') {
      variant.is_available = value;
    }
    // (ИЗМЕНЕНИЕ) Логика 'sku' удалена, т.к. поле readOnly

    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  // Обработчик для "простого" варианта
  const handleSimpleVariantChange = (e, field) => {
    // (ИЗМЕНЕНИЕ) Игнорируем 'sku'
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

  // Переключатель чекбокса "Есть опции"
  const handleHasOptionsChange = (e) => {
    const checked = e.target.checked;
    setHasOptions(checked);

    if (!checked) {
      // Если убираем опции, сбрасываем к одному варианту
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
    } else {
      // Если добавляем опции, показываем генератор
      // (но пока не генерируем, ждем нажатия кнопки)
      if (formData.variants.length <= 1 && Object.keys(formData.variants[0]?.attributes || {}).length === 0) {
        setFormData(prev => ({ ...prev, variants: [] }));
      }
    }
  };

  // ... (handleImagesUploaded, handleImageDelete) ... (без изменений)
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
          // (ИЗМЕНЕНИЕ) Генерируем SKU здесь, если его нет
          return {
            ...v,
            sku: v.sku || `VAR-${formData.name.substring(0, 3).toUpperCase()}-${index}-${Date.now().toString().slice(-4)}`,
                                                  attributes: v.attributes, // Атрибуты уже есть
                                                  price: v.price ? parseFloat(v.price) : null,
                                                  quantity: v.quantity ? parseInt(v.quantity) : 0,
          };
        });
      } else {
        // --- Логика для ПРОСТОГО ТОВАРА ---
        const simpleVariant = (formData.variants && formData.variants[0]) || {};
        processedVariants.push({
          id: simpleVariant.id || undefined,
          sku: simpleVariant.sku || `BASE-${formData.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
                               attributes: {},
                               quantity: parseInt(simpleVariant.quantity) || 0,
                               price: null, // У простого товара цена = base_price
                               is_available: true,
        });
      }

      if (processedVariants.length === 0) {
        if (hasOptions) {
          setError('Нужно сгенерировать и заполнить хотя бы один вариант.');
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
    </select>
    {/* (ИЗМЕНЕНИЕ) Текст кнопки */}
    <Link
    to="/admin/categories"
    className="admin-product-edit__manage-category-btn"
    title="Управление категориями"
    >
    Управление категориями
    </Link>
    </div>
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
    <label className="custom-checkbox">
    <input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleChange} />
    <span className="custom-checkbox__box"></span>
    <span className="custom-checkbox__label-text">Новинка</span>
    </label>
    <label className="custom-checkbox">
    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
    <span className="custom-checkbox__box"></span>
    <span className="custom-checkbox__label-text">Активный (виден на сайте)</span>
    </label>
    </div>
    </div>
    </div>
    </div>

    {/* --- Описание --- */}
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
      > <MdDeleteOutline /> Удалить </button>
      </div>
    ))}
    <button
    type="button" onClick={() => addArrayItem('details')}
    className="admin-product-edit__button--add"
    > <MdAdd /> Добавить деталь </button>
    </div>
    </div>

    {/* --- Изображения --- */}
    <div className="admin-product-edit__form-section">
    <h2 className="admin-product-edit__section-title">Изображения</h2>
    <ImageUploader
    currentImages={formData.images}
    onImagesUploaded={handleImagesUploaded}
    onImageDelete={handleImageDelete}
    uploadType="product"
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
      <MdDeleteOutline /> Удалить
      </button>
      </div>
    ))}
    <button
    type="button"
    onClick={() => addArrayItem('images')}
    className="admin-product-edit__button--add"
    >
    <MdAdd /> Добавить URL
    </button>
    </div>
    </div>

    {/* --- (ПОЛНЫЙ РЕФАКТОРИНГ) Варианты и остатки --- */}
    <div className="admin-product-edit__form-section">
    <h2 className="admin-product-edit__section-title">Варианты и остатки</h2>

    <div className="admin-product-edit__form-group">
    <label className="custom-checkbox">
    <input
    type="checkbox"
    name="hasOptions"
    checked={hasOptions}
    onChange={handleHasOptionsChange}
    />
    <span className="custom-checkbox__box"></span>
    <span className="custom-checkbox__label-text">У этого товара есть опции (например, размер или цвет)</span>
    </label>
    </div>

    {!hasOptions ? (
      // --- РЕЖИМ "ПРОСТОГО ТОВАРА" ---
      <div className="admin-product-edit__variant-card">
      <p className="admin-product-edit__variant-hint">
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
      {/* (ИЗМЕНЕНИЕ) SKU readOnly */}
      <input
      type="text"
      value={formData.variants[0]?.sku || ''}
      readOnly
      placeholder="Генерируется при сохранении..."
      className="admin-product-edit__input"
      />
      </div>
      </div>
      </div>

    ) : (
      // --- РЕЖИМ "ТОВАРА С ОПЦИЯМИ" ---
      <>
      {/* --- Генератор опций --- */}
      <div className="admin-product-edit__option-generator">
      <h3 className="admin-product-edit__option-generator-title">1. Определите опции</h3>
      {optionSetup.map((opt) => (
        <div key={opt.id} className="admin-product-edit__option-item">
        <input
        type="text"
        placeholder="Название (напр., Размер)"
        value={opt.name}
        onChange={(e) => handleOptionNameChange(opt.id, e.target.value)}
        className="admin-product-edit__input admin-product-edit__option-item-name"
        />
        <input
        type="text"
        placeholder="Значения (напр., S, M, L)"
        value={opt.values}
        onChange={(e) => handleOptionValuesChange(opt.id, e.target.value)}
        className="admin-product-edit__input admin-product-edit__option-item-values"
        />
        <button
        type="button"
        onClick={() => handleRemoveOption(opt.id)}
        className="admin-product-edit__button--remove-option"
        >
        <MdClose />
        </button>
        </div>
      ))}
      <button
      type="button"
      onClick={handleAddOption}
      className="admin-product-edit__button--add-option"
      >
      <MdAdd /> Добавить опцию
      </button>
      <button
      type="button"
      onClick={handleGenerateVariants}
      className="btn primary"
      style={{marginTop: '1rem', width: '100%'}}
      >
      2. Сгенерировать варианты
      </button>
      </div>

      {/* --- Редактор вариантов (Таблица) --- */}
      {formData.variants && formData.variants.length > 0 && (
        <div className="admin-product-edit__variant-editor">
        <h3 className="admin-product-edit__variant-editor-title">3. Отредактируйте варианты</h3>
        <div className="admin-product-edit__variant-table-wrapper">
        <table className="admin-product-edit__variant-table">
        <thead>
        <tr>
        <th>Вариант</th>
        <th>Цена (если отличается)</th>
        <th>Количество *</th>
        <th>SKU</th>
        <th>Доступен</th>
        </tr>
        </thead>
        <tbody>
        {formData.variants.map((variant, index) => (
          <tr key={index}>
          <td data-label="Вариант">
          {Object.values(variant.attributes).join(' / ')}
          </td>
          <td data-label="Цена">
          <input
          type="number"
          value={variant.price || ''}
          onChange={(e) => handleVariantChange(e, index, 'price')}
          min="0" step="0.01"
          className="admin-product-edit__input"
          placeholder="Базовая"
          />
          </td>
          <td data-label="Количество">
          <input
          type="number"
          value={variant.quantity || 0}
          onChange={(e) => handleVariantChange(e, index, 'quantity')}
          required min="0"
          className="admin-product-edit__input"
          />
          </td>
          <td data-label="SKU">
          {/* (ИЗМЕНЕНИЕ) SKU readOnly */}
          <input
          type="text"
          value={variant.sku || ''}
          readOnly
          className="admin-product-edit__input"
          placeholder="Генерируется..."
          />
          </td>
          <td data-label="Доступен">
          <label className="custom-checkbox">
          <input
          type="checkbox"
          checked={variant.is_available}
          onChange={(e) => handleVariantChange(e, index, 'is_available')}
          />
          <span className="custom-checkbox__box"></span>
          </label>
          </td>
          </tr>
        ))}
        </tbody>
        </table>
        </div>
        </div>
      )}
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

    {/* (ИЗМЕНЕНИЕ) Блок 'sort_order' полностью удален */}

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
