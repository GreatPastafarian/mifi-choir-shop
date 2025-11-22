import api from './api';

// Получить все адреса пользователя
export const getUserAddresses = async () => {
    try {
        const response = await api.get('/addresses');
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении адресов:', error);
        throw error;
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
        const response = await api.delete(`/addresses/${id}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при удалении адреса:', error);
        throw error;
    }
};
