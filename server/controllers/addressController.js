const { Address } = require('../models');

// Получить все адреса текущего пользователя
exports.getUserAddresses = async (req, res) => {
    try {
        const addresses = await Address.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']]
        });
        res.json(addresses);
    } catch (error) {
        console.error('Ошибка при получении адресов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Добавить новый адрес
exports.createAddress = async (req, res) => {
    try {
        const { title, city, street, building, flat, zip_code, comment } = req.body;

        // Простая валидация
        if (!city || !street || !building) {
            return res.status(400).json({ message: 'Город, улица и дом обязательны' });
        }

        const newAddress = await Address.create({
            user_id: req.user.id,
            title: title || 'Новый адрес',
            city,
            street,
            building,
            flat,
            zip_code,
            comment
        });

        res.status(201).json(newAddress);
    } catch (error) {
        console.error('Ошибка при создании адреса:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Удалить адрес
exports.deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const deletedCount = await Address.destroy({
            where: {
                id: addressId,
                user_id: req.user.id // Защита: удаляем только свои адреса
            }
        });

        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Адрес не найден' });
        }

        res.json({ message: 'Адрес удален' });
    } catch (error) {
        console.error('Ошибка при удалении адреса:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
