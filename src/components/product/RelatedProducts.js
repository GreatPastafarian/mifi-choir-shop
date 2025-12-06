// src/components/product/RelatedProducts.js
import React from 'react';
import ProductCard from './ProductCard';

import '../styles/components/related-products.css';

function RelatedProducts({ products, addToCart, toggleFavorite, favorites }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="related-products">
      <h2 className="related-products__title">
        Похожие товары
      </h2>

      <div className="related-products__grid">
        {products.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            addToCart={addToCart}
            toggleFavorite={toggleFavorite}
            isFavorite={favorites.some((fav) => fav.id === item.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
