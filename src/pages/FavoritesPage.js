import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function FavoritesPage({ favorites = [], addToCart, toggleFavorite }) {
    const [sizeSelections, setSizeSelections] = useState({});

    // Инициализируем выбор размеров при загрузке компонента
    useEffect(() => {
        const initialSizes = {};
        favorites.forEach(item => {
            if (item.category === "Одежда") {
                initialSizes[item.id] = item.selectedSize || '';
            }
        });
        setSizeSelections(initialSizes);
    }, [favorites]);

    const handleSizeChange = (itemId, size) => {
        setSizeSelections(prev => ({
            ...prev,
            [itemId]: size
        }));
    };

    const handleAddToCart = (item) => {
        // Для одежды проверяем выбран ли размер
        if (item.category === "Одежда" && !sizeSelections[item.id]) {
            alert("Пожалуйста, выберите размер");
            return;
        }

        // Создаем объект товара с выбранным размером (если есть)
        const itemToAdd = {
            ...item,
            selectedSize: sizeSelections[item.id] || null
        };

        addToCart(itemToAdd);
    };

    const handleAddAllToCart = () => {
        let hasErrors = false;

        // Сначала проверяем, все ли размеры выбраны
        favorites.forEach(item => {
            if (item.category === "Одежда" && !sizeSelections[item.id]) {
                hasErrors = true;
            }
        });

        if (hasErrors) {
            alert("Для некоторых товаров не выбран размер. Пожалуйста, выберите размеры для всех товаров категории 'Одежда'.");
            return;
        }

        // Добавляем все товары в корзину
        favorites.forEach(item => {
            const itemToAdd = {
                ...item,
                selectedSize: sizeSelections[item.id] || null
            };
            addToCart(itemToAdd);
        });
    };

    return (
        <div className="favorites-page">
        <div className="container">
        <div className="favorites-header">
        <h1>Избранные вознаграждения</h1>
        <p>Выберите вознаграждения, которые вы хотите добавить к вашему пожертвованию</p>
        </div>

        {favorites.length > 0 ? (
            <div className="favorites-container">
            <div className="favorites-list">
            {favorites.map(item => (
                <div key={item.id} className="favorite-item">
                <Link
                to={`/product/${item.id}`}
                className="item-image-link"
                >
                <div className="item-image">
                <div className={`image-placeholder ${item.image}`}></div>
                </div>
                </Link>
                <div className="item-details">
                <Link to={`/product/${item.id}`} className="item-link">
                <div className="item-category">{item.category}</div>
                <h3>{item.name}</h3>

                {/* Отображение размера для одежды */}
                {item.category === "Одежда" && (
                    <div className="size-selector" style={{ margin: '10px 0' }}>
                    <label htmlFor={`size-${item.id}`}>Размер:</label>
                    <select
                    id={`size-${item.id}`}
                    value={sizeSelections[item.id] || ''}
                    onChange={(e) => handleSizeChange(item.id, e.target.value)}
                    style={{
                        marginLeft: '10px',
                        padding: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                    >
                    <option value="">Выберите размер</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    </select>
                    </div>
                )}

                {item.category === "Одежда" && item.selectedSize && (
                    <div className="item-size" style={{
                        backgroundColor: '#f5f0e5',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        marginTop: '4px',
                        display: 'inline-block'
                    }}>
                    Размер: {item.selectedSize}
                    </div>
                )}

                <div className="item-price">Рекомендованное пожертвование: {item.price} ₽</div>
                </Link>
                </div>
                <div className="item-actions">
                <button
                className="btn primary"
                onClick={() => handleAddToCart(item)}
                >
                Добавить в корзину
                </button>
                <button
                className="btn secondary remove-favorite"
                onClick={() => toggleFavorite(item)}
                >
                Удалить из избранного
                </button>
                </div>
                </div>
            ))}
            </div>

            <div className="favorites-summary">
            <h2>Ваши избранные вознаграждения ({favorites.length})</h2>
            <div className="summary-content">
            <div className="summary-row">
            <span>Количество:</span>
            <span>{favorites.length}</span>
            </div>
            <div className="summary-row total">
            <span>Итого:</span>
            <span className="total-amount">
            {favorites.reduce((sum, item) => sum + item.price, 0)} ₽
            </span>
            </div>
            </div>

            <div className="summary-actions">
            <button
            className="btn primary"
            onClick={handleAddAllToCart}
            >
            Добавить все в корзину
            </button>
            <Link to="/shop" className="btn secondary">
            Вернуться в каталог
            </Link>
            </div>
            </div>
            </div>
        ) : (
            <div className="empty-favorites" style={{
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: '#f5f0e5',
                borderRadius: '8px',
                margin: '2rem 0'
            }}>
            <p style={{
                fontSize: '1.2rem',
                color: '#0a2240',
                marginBottom: '1rem'
            }}>
            У вас пока нет избранных товаров
            </p>
            <Link
            to="/shop"
            className="btn primary"
            style={{
                display: 'inline-block',
                padding: '0.8rem 1.5rem',
                fontSize: '1rem'
            }}
            >
            Перейти в каталог
            </Link>
            </div>
        )}

        <div className="favorites-footer">
        <div className="donation-note" style={{
            borderLeft: '3px solid var(--accent-gold)',
            paddingLeft: 'var(--space-md)',
            marginTop: 'var(--space-xl)',
            backgroundColor: 'var(--accent-beige)',
            padding: 'var(--space-md)'
        }}>
        <p><strong>Важно:</strong> Рекомендованные суммы пожертвований помогают нам поддерживать
        качество сувенирной продукции. Вы можете выбрать любое вознаграждение и определить
        размер пожертвования самостоятельно.</p>
        </div>
        </div>
        </div>
        </div>
    );
}

export default FavoritesPage;
