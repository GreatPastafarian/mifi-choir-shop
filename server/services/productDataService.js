export const normalizeProductData = (product) => {
  return {
    id: product.id,
    name: product.name,
    category_id: product.category_id,
    category_name: product.category?.name || product.category_name,
    description: product.description,
    materials: product.materials,
    details: Array.isArray(product.details)
      ? product.details
      : typeof product.details === 'string'
        ? JSON.parse(product.details || '[]')
        : [],
    images: Array.isArray(product.images)
      ? product.images.map((img) => (typeof img === 'string' ? img : img.image_url))
      : [],
    base_price: parseFloat(product.base_price || product.price || 0),
    is_new: product.is_new,
    publication_date: product.publication_date,
    views_count: product.views_count,
    sort_order: product.sort_order,
    is_active: product.is_active,
    variants: (product.variants || []).map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      quantity: variant.quantity,
      price: variant.price ? parseFloat(variant.price) : null,
      is_available: variant.is_available,
    })),
  };
};

export const normalizeProductsData = (products) => {
  return products.map((product) => normalizeProductData(product));
};
