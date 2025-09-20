// src/components/product/RelatedProducts.js
import React from 'react';
import ProductCard from './ProductCard';

function RelatedProducts({ products, addToCart, toggleFavorite, favorites }) {
  return (
    <div
      className="related-products"
      style={{
        marginTop: '2rem',
        padding: '0 1rem',
      }}
    >
      <h2
        style={{
          fontSize: '2rem',
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        Похожие товары
      </h2>

      <div
        className="items-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
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
