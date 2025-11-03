import api from './api';

// 1. Получить ВСЕ
export const getAllCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке категорий:', error);
    throw error;
  }
};

// 2. Получить ОДНУ по ID
export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при загрузке категории ${id}:`, error);
    throw error;
  }
};

// 3. Сохранить (СОЗДАТЬ / ОБНОВИТЬ)
export const saveCategory = async (categoryData) => {
  try {
    const { id, ...data } = categoryData;


    if (id) {
      // Обновление
      const response = await api.put(`/categories/${id}`, data);
      return response.data;
    } else {
      // Создание
      const response = await api.post('/categories', data);
      return response.data;
    }
  } catch (error) {
    console.error('Ошибка при сохранении категории:', error);
    throw error;
  }
};

// 4. Удалить
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при удалении категории ${id}:`, error);
    throw error;
  }
};
