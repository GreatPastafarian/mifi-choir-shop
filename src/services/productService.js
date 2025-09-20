import api from './api';

// Получить все товары
export const getAllProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    throw error;
  }
};

// Получить товар по ID
export const getProductById = async (id) => {
  try {
    if (!id || id === 'undefined' || isNaN(parseInt(id))) {
      throw new Error('Некорректный ID товара');
    }

    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении товара:', error);
    throw error;
  }
};

// Получить популярные товары (по количеству продаж)
export const getPopularProducts = async () => {
  try {
    const response = await api.get('/products/popular');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении популярных товаров:', error);
    throw error;
  }
};

// Получить новые товары
export const getNewProducts = async () => {
  try {
    const response = await api.get('/products/new');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении новых товаров:', error);
    throw error;
  }
};

// Получить товары по категории
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении товаров по категории:', error);
    throw error;
  }
};

// Увеличить счетчик просмотров
export const incrementViewCount = async (productId) => {
  try {
    await api.post(`/products/${productId}/view`);
  } catch (error) {
    console.error('Ошибка при увеличении счетчика просмотров:', error);
  }
};

// Создать/обновить товар (только для администраторов)
export const saveProduct = async (productData) => {
  try {
    if (productData.id) {
      const response = await api.put(`/products/${productData.id}`, productData);
      return response.data;
    } else {
      const response = await api.post('/products', productData);
      return response.data;
    }
  } catch (error) {
    console.error('Ошибка при сохранении товара:', error);
    throw error;
  }
};

// Удалить товар (только для администраторов)
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    throw new Error(error.response?.data?.message || 'Ошибка при удалении товара');
  }
};

// Обновить вариант товара
export const updateProductVariant = async (productId, variantId, updateData) => {
  try {
    const response = await api.patch(`/products/${productId}/variants/${variantId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении варианта товара:', error);
    throw error;
  }
};

// Получить все категории
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    throw error;
  }
};

// Загрузка изображений
export const uploadImages = async (files) => {
  try {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.images;
  } catch (error) {
    console.error('Ошибка при загрузке изображений:', error);
    throw error;
  }
};
