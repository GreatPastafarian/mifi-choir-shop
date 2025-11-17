import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategories, saveCategory, deleteCategory } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from '../../components/admin/ImageUploader';
// (ИЗМЕНЕНИЕ) Импортируем хелперы
import { getImageUrl, getProductImageSet } from '../../utils/imageUtils';
import { slugify } from '../../utils/slugify';

const initialState = {
    name: '',
    description: '',
    image: '',
    sort_order: 0,
    is_active: true,
};

function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialState);
    const [formLoading, setFormLoading] = useState(false);

    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const formRef = useRef(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllCategories();
            setCategories(data);
        } catch (err) {
            setError('Не удалось загрузить категории');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchCategories();
    }, [isAdmin, navigate]);

    // --- ОБРАБОТЧИКИ ТАБЛИЦЫ ---

    const handleDelete = async (categoryId) => {
        if (window.confirm('Вы уверены? Товары, связанные с этой категорией, останутся без категории.')) {
            try {
                await deleteCategory(categoryId);
                fetchCategories();
                if (isEditing && formData.id === categoryId) {
                    handleCancelEdit();
                }
            } catch (err) {
                setError('Не удалось удалить категорию');
                console.error(err);
            }
        }
    };

    const handleEditClick = (category) => {
        setFormData({
            ...category,
            image: category.image || '',
        });
        setIsEditing(true);
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- ОБРАБОТЧИКИ ФОРМЫ ---

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData(initialState);
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImagesUploaded = (newImages) => {
        setFormData((prev) => ({
            ...prev,
            image: newImages[0] || '',
        }));
    };

    const handleImageDelete = () => {
        setFormData((prev) => ({
            ...prev,
            image: '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            setError(null);

            const dataToSave = {
                ...formData,
                slug: slugify(formData.name)
            };

            await saveCategory(dataToSave);

            handleCancelEdit();
            await fetchCategories();

        } catch (err) {
            setError('Ошибка сохранения категории');
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };

    // (ИЗМЕНЕНИЕ) Локальная функция getImageUrl удалена

    // --- РЕНДЕРИНГ ---

    if (loading && categories.length === 0) {
        return (
            <div className="admin-categories__container admin-categories__container--centered">
            <h1>Загрузка...</h1>
            </div>
        );
    }

    return (
        <div className="admin-categories">
        <div className="admin-categories__container">

        {/* --- 1. СПИСОК КАТЕГОРИЙ --- */}
        <div className="admin-categories__list-section">
        <div className="admin-categories__header">
        <h1>Управление категориями</h1>
        <button
        className="btn primary"
        onClick={() => {
            handleCancelEdit();
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        >
        Добавить новую
        </button>
        </div>

        {error && !formLoading && <p className="admin-categories__error">{error}</p>}

        {categories.length === 0 && !loading ? (
            <p>Категории пока не созданы.</p>
        ) : (
            <div className="admin-categories__table-wrapper">
            <table className="admin-categories__table">
            <thead>
            <tr>
            <th>Изображение</th>
            <th>Название</th>
            <th>Описание</th>
            <th>Действия</th>
            </tr>
            </thead>
            <tbody>
            {categories.map((category) => {
                // (ИЗМЕНЕНИЕ) Используем хелперы
                const imageUrl = getImageUrl(category.image);
                const { sm: thumbSm } = getProductImageSet(imageUrl);

                return (
                    <tr key={category.id}>
                    <td data-label="Изображение">
                    <img
                    src={thumbSm} // Используем маленькую версию
                    alt={category.name}
                    className="admin-categories__table-img"
                    loading="lazy"
                    />
                    </td>
                    <td data-label="Название">{category.name}</td>
                    <td data-label="Описание" className="admin-categories__table-desc">
                    {category.description || '...'}
                    </td>
                    <td data-label="Действия">
                    <div className="admin-categories__table-actions">
                    <button
                    onClick={() => handleEditClick(category)}
                    className="btn secondary"
                    >
                    Редактировать
                    </button>
                    <button
                    onClick={() => handleDelete(category.id)}
                    className="btn secondary btn--danger"
                    >
                    Удалить
                    </button>
                    </div>
                    </td>
                    </tr>
                );
            })}
            </tbody>
            </table>
            </div>
        )}
        </div>

        {/* --- 2. ФОРМА РЕДАКТИРОВАНИЯ/СОЗДАНИЯ --- */}
        <form onSubmit={handleSubmit} className="admin-product-edit__form" ref={formRef}>
        <div className="admin-product-edit__form-section">
        <h2 className="admin-product-edit__section-title">
        {isEditing ? `Редактирование: ${formData.name}` : 'Добавить новую категорию'}
        </h2>

        {error && formLoading && <p className="admin-categories__error">{error}</p>}

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
        <label htmlFor="sort_order" className="admin-product-edit__label">Порядок сортировки</label>
        <input
        type="number" id="sort_order" name="sort_order"
        className="admin-product-edit__input"
        value={formData.sort_order} onChange={handleChange} min="0"
        />
        </div>
        </div>

        <div className="admin-product-edit__form-group">
        <label htmlFor="description" className="admin-product-edit__label">Описание</label>
        <textarea
        id="description" name="description" className="admin-product-edit__textarea"
        value={formData.description} onChange={handleChange} rows="5"
        ></textarea>
        </div>

        <div className="admin-product-edit__form-group">
        <label className="admin-product-edit__label">Параметры</label>
        <div className="admin-product-edit__checkbox-group">
        <label className="custom-checkbox">
        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
        <span className="custom-checkbox__box"></span>
        <span className="custom-checkbox__label-text">Активная (видна на сайте)</span>
        </label>
        </div>
        </div>
        </div>

        <div className="admin-product-edit__form-section">
        <h2 className="admin-product-edit__section-title">Изображение категории</h2>
        <ImageUploader
        currentImages={formData.image ? [getImageUrl(formData.image)] : []} // (ИЗМЕНЕНИЕ) Используем getImageUrl
        onImagesUploaded={handleImagesUploaded}
        onImageDelete={handleImageDelete}
        multiple={false}
        uploadType="category" // (ИЗМЕНЕНИЕ) Передаем тип
        />
        </div>

        <div className="admin-product-edit__footer-actions">
        {isEditing && (
            <button type="button" className="btn secondary" onClick={handleCancelEdit}>
            Отмена
            </button>
        )}
        <button type="submit" className="btn primary" disabled={formLoading}>
        {formLoading ? 'Сохранение...' : (isEditing ? 'Сохранить' : 'Создать')}
        </button>
        </div>
        </form>

        </div>
        </div>
    );
}

export default AdminCategories;
