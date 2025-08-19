// src/pages/CartPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function CartPage({ cartItems, updateCart }) {
    const [items, setItems] = useState(cartItems);

    // Синхронизируем локальное состояние с пропсами
    useEffect(() => {
        setItems(cartItems);
    }, [cartItems]);

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updateQuantity = (id, quantity) => {
        const newItems = items.map(item =>
        item.id === id ? {...item, quantity} : item
        ).filter(item => item.quantity > 0);
        setItems(newItems);
        updateCart(newItems);
    };

    const removeItem = (id) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        updateCart(newItems);
    };

    return (
        <div className="cart-page">
        <h1>Ваши выбранные вознаграждения</h1>
        <div className="cart-container">
        <div className="cart-items" style={{
            minHeight: items.length === 1 ? 'auto' : '300px',
            display: 'flex',
            flexDirection: 'column'
        }}>
        {items.length > 0 ? (
            items.map(item => (
                <div key={`${item.id}-${item.selectedSize || 'no-size'}`} className="cart-item">
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
                <h3>{item.name}</h3>
                <div className="item-category">{item.category}</div>
                <div className="item-price">Рекомендованное пожертвование: {item.price} ₽</div>

                {/* Отображение размера для одежды */}
                {item.category === "Одежда" && item.selectedSize && (
                    <div className="item-size">
                    Размер: {item.selectedSize}
                    </div>
                )}
                </Link>

                <div className="item-quantity">
                <label>Количество:</label>
                <div className="quantity-control">
                <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                -
                </button>
                <input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                    const value = Math.max(1, parseInt(e.target.value) || 1);
                    updateQuantity(item.id, value);
                }}
                min="1"
                />
                <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                +
                </button>
                </div>
                </div>
                <button
                className="remove-item"
                onClick={() => removeItem(item.id)}
                >
                Удалить
                </button>
                </div>
                <div className="item-total" style={{ whiteSpace: 'nowrap' }}>
                {item.price * item.quantity} ₽
                </div>
                </div>
            ))
        ) : (
            <div className="empty-cart">
            <p>Вы еще не выбрали вознаграждения</p>
            <Link to="/shop" className="btn primary">Перейти к выбору</Link>
            </div>
        )}
        </div>

        {items.length > 0 && (
            <div className="cart-summary" style={{
                alignSelf: items.length === 1 ? 'center' : 'start',
                maxWidth: items.length === 1 ? '500px' : 'none'
            }}>
            <h2>Сводка пожертвования</h2>
            <div className="summary-row">
            <span>Сумма рекомендованного пожертвования:</span>
            <span style={{ whiteSpace: 'nowrap' }}>{subtotal} ₽</span>
            </div>
            <div className="note">
            <p><strong>Важно:</strong> Фактический размер пожертвования вы определяете самостоятельно.</p>
            <p>Выбранные сувениры являются благодарностью за вашу поддержку хора МИФИ.</p>
            </div>
            <Link to="/checkout" className="btn primary">Подтвердить пожертвование</Link>
            </div>
        )}
        </div>
        </div>
    );
}

export default CartPage;
