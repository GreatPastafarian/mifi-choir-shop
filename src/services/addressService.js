import api from './api';
// --- Методы для Адресов ---

// Получить список адресов
export const getUserAddresses = async () => {
  try {
    const response = await api.get('/addresses');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении адресов:', error);
    return [];
  }
};

// Создать новый адрес
export const createAddress = async (addressData) => {
  try {
    const response = await api.post('/addresses', addressData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании адреса:', error);
    throw error;
  }
};

// Удалить адрес
export const deleteAddress = async (id) => {
  try {
    await api.delete(`/addresses/${id}`);
    return id;
  } catch (error) {
    console.error('Ошибка при удалении адреса:', error);
    throw error;
  }
};

// Обновить адрес
export const updateAddress = async (id, addressData) => {
  try {
    const response = await api.put(`/addresses/${id}`, addressData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении адреса:', error);
    throw error;
  }
};
