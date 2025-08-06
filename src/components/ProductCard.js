import React from 'react';

function ProductCard({ product, addToCart }) {
    return (
        <div className="product-card">
        <div className="product-image">
        <div className={`image-placeholder ${product.image}`}></div>
        </div>
        <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">Рекомендованное пожертвование: {product.price} ₽</div>
        <button
        className="btn primary"
        onClick={() => addToCart(product)}
        >
        Выбрать вознаграждение
        </button>
        </div>
        </div>
    );
}

export default ProductCard;
