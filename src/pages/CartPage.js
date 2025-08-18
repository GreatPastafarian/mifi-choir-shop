import React, { useState } from 'react';
import { Link} from 'react-router-dom';

function CartPage({ cartItems, updateCart }) {
    const [items, setItems] = useState(cartItems);
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
        <div className="cart-items">
        {items.length > 0 ? (
            items.map(item => (
                <div key={item.id} className="cart-item">
                <div className="item-image">
                <div className={`image-placeholder ${item.image}`}></div>
                </div>
                <div className="item-details">
                <h3>{item.name}</h3>
                <div className="item-category">{item.category}</div>
                <div className="item-price">Рекомендованное пожертвование: {item.price} ₽</div>

                <div className="item-quantity">
                <label>Количество:</label>
                <div className="quantity-control">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                />
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                </div>

                <button
                className="remove-item"
                onClick={() => removeItem(item.id)}
                >
                Удалить
                </button>
                </div>
                <div className="item-total">
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
            <div className="cart-summary">
            <h2>Сводка пожертвования</h2>
            <div className="summary-row">
            <span>Сумма рекомендованного пожертвования:</span>
            <span>{subtotal} ₽</span>
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
