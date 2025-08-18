require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS middleware для разработки
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// API endpoint для контактов
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Валидация данных
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Все поля обязательны для заполнения'
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Некорректный формат email'
        });
    }

    try {
        // Создаем транспорт для отправки email
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true' || false,
            auth: {
                user: process.env.SMTP_USER || 'your-email@gmail.com',
                pass: process.env.SMTP_PASS || 'your-email-password'
            }
        });

        // Опции письма
        const mailOptions = {
            from: `"Сообщение с сайта хора МИФИ" <${process.env.SMTP_USER || 'your-email@gmail.com'}>`,
            to: 'choir.mephi.donate@gmail.com', // Email хора для получения сообщений
            subject: 'Новое сообщение с сайта хора МИФИ',
            text: `Имя: ${name}\nEmail: ${email}\n\nСообщение:\n${message}`,
            html: `
            <h2>Новое сообщение с сайта хора МИФИ</h2>
            <p><strong>Имя:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Сообщение:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            `
        };

        // Отправляем email (в реальном приложении это нужно сделать)
        try {
            console.log('Пытаемся отправить email:', mailOptions);
            await transporter.sendMail(mailOptions);
            console.log('Письмо успешно отправлено');
        } catch (emailError) {
            console.error('Ошибка при отправке email:', emailError);
            throw emailError; // Это приведет к срабатыванию блока catch
        }

        // Возвращаем успешный ответ
        res.status(200).json({
            success: true,
            message: 'Сообщение успешно отправлено!'
        });
    } catch (error) {
        console.error('Ошибка при отправке email:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при отправке сообщения. Пожалуйста, попробуйте позже.'
        });
    }
});

// Обслуживание статических файлов из build-папки в продакшене
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`API доступен по адресу: http://localhost:${PORT}/api/contact`);
});
