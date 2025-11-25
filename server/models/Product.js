const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    materials: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    // --- ДОБАВЛЕНО ПОЛЕ DETAILS ---
    details: {
      type: DataTypes.TEXT, // Храним как JSON-строку
      allowNull: true,
      defaultValue: '[]',
    },
    // -----------------------------
    base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    is_new: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_preorder: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    publication_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Product;
