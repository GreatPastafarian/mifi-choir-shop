const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const { v4: uuidv4 } = require('uuid'); // Импортируем uuid

const Variant = sequelize.define(
  'Variant',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    attributes: {
        type: DataTypes.JSONB, // Тип данных JSONB (оптимизирован для PostgreSQL)
        allowNull: true,
        defaultValue: {},     // По умолчанию — пустой объект
      },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'variants',
    timestamps: false,
    hooks: {
      // Добавляем хук
      beforeValidate: (variant) => {
        if (!variant.sku) {
          // Генерируем SKU только если он не предоставлен
          // Формат: 8-значный UUID (для краткости)
          variant.sku = `SKU-${uuidv4().substring(0, 8).toUpperCase()}`;
        }
      },
    },
  }
);

module.exports = Variant;
