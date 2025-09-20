import api from './api';

// Получить все категории
export const getAllCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    throw error;
  }
};

// Создать/обновить категорию (только для администраторов)
export const saveCategory = async (categoryData) => {
  try {
    if (categoryData.id) {
      const response = await api.put(`/admin/categories/${categoryData.id}`, categoryData);
      return response.data;
    } else {
      const response = await api.post('/admin/categories', categoryData);
      return response.data;
    }
  } catch (error) {
    console.error('Ошибка при сохранении категории:', error);
    throw error;
  }
};

// Удалить категорию (только для администраторов)
export const deleteCategory = async (categoryId) => {
  try {
    await api.delete(`/admin/categories/${categoryId}`);
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    throw error;
  }
};
