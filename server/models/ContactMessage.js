const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const ContactMessage = sequelize.define(
    'ContactMessage',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('NEW', 'REPLIED'),
                                        defaultValue: 'NEW',
                                            allowNull: false,
        },
        admin_reply: {
            type: DataTypes.TEXT,
            allowNull: true, // Поле для ответа админа
        },
        reply_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        // Связь с зарегистрированным пользователем
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        // ID сессии для анонимов (хранится в localStorage)
        sessionId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: 'contact_messages',
        timestamps: true, // created_at покажет, когда задали вопрос
        underscored: true,
    }
);

module.exports = ContactMessage;
