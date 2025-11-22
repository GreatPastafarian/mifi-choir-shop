const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Donation = sequelize.define(
  'Donation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    anonymousId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    items: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Ожидает проверки', // ИЗМЕНИТЕ ЗДЕСЬ
    },
    // Тип получения
    delivery_type: {
      type: DataTypes.ENUM('pickup', 'delivery'),
                                  defaultValue: 'pickup',
                                    allowNull: false
    },
    // Данные доставки (JSON)
    // Здесь будет лежать полный адрес или ID точки самовывоза
    delivery_info: {
      type: DataTypes.JSONB, // Используем JSONB для PostgreSQL
      allowNull: true,
      defaultValue: {}
    },

    // ФИО получателя (может отличаться от плательщика)
    recipient_name: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // Телефон получателя
    recipient_phone: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'donations',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Donation;
