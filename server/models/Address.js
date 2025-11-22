const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING, // Например "Дом", "Работа"
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    street: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    building: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    flat: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    zip_code: {
        type: DataTypes.STRING,
        allowNull: true, // Сделаем необязательным, но на фронте будем просить
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'addresses',
    timestamps: true,
});

module.exports = Address;
