/**
 * Сервис для нормализации (унификации) данных о продуктах
 * перед отправкой на клиент.
 */

/**
 * Нормализует ОДИН объект продукта.
 * @param {object} product - Объект продукта Sequelize (или plain object)
 * @returns {object} - Нормализованный объект для клиента
 */
const normalizeProductData = (product) => {
  // .get({ plain: true }) - лучший способ получить чистый объект из Sequelize
  const plainProduct = product.get ? product.get({ plain: true }) : product;

  const normalized = {
    id: plainProduct.id,
    name: plainProduct.name,
    category_id: plainProduct.category_id,
    // Важна проверка, что category была включена в запрос (included)
    category_name: plainProduct.category ? plainProduct.category.name : null,
    description: plainProduct.description,
    materials: plainProduct.materials,
    // Безопасный парсинг JSON (как у тебя и было)
    details: JSON.parse(plainProduct.details || '[]'),
    // Проверки на наличие связей
    images: plainProduct.images
    ? plainProduct.images.map((image) => image.image_url)
    : [],
    base_price: parseFloat(plainProduct.base_price),
    is_new: plainProduct.is_new,
    publication_date: plainProduct.publication_date,
      views_count: plainProduct.views_count,
      sort_order: plainProduct.sort_order,
      is_active: plainProduct.is_active,
      variants: plainProduct.variants
      ? plainProduct.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        quantity: variant.quantity,
        price: variant.price ? parseFloat(variant.price) : null,
                                                is_available: variant.is_available,
      }))
      : [],
  };

  // Особый случай для getPopularProducts, который добавляет salesCount
  if (plainProduct.salesCount !== undefined) {
    normalized.salesCount = plainProduct.salesCount;
  }

  return normalized;
};

/**
 * Нормализует МАССИВ продуктов.
 * @param {Array<object>} products - Массив объектов продуктов Sequelize
 * @returns {Array<object>} - Массив нормализованных объектов
 */
const normalizeProductsData = (products) => {
  if (!products || !Array.isArray(products)) {
    return [];
  }
  return products.map(normalizeProductData);
};

module.exports = {
  normalizeProductData,
  normalizeProductsData,
};
