// src/data/initialProducts.js
import productsData from './products';

// Создаем начальные данные с добавлением salesCount и viewsCount, если их нет
export default productsData.map((product) => ({
  ...product,
  salesCount: product.salesCount || 0,
  viewsCount: product.viewsCount || 0,
  publicationDate: product.publicationDate ? new Date(product.publicationDate) : new Date(),
}));
