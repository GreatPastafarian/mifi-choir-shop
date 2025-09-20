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
  },
  {
    tableName: 'donations',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Donation;
