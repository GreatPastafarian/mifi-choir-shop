const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    salesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Добавляем поля для настроек уведомлений
    notify_rewards: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notify_concerts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notify_personal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notify_monthly_report: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user',
      allowNull: false,
    },
  },
  {
    tableName: 'users',
    timestamps: true, // Включаем временные метки
    underscored: true,
    hooks: {
      beforeUpdate: (user) => {
        user.updated_at = new Date();
      },
    },
  }
);

module.exports = User;
