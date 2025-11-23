const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
// Добавьте импорт uploadRoutes здесь
const uploadRoutes = require('./routes/uploadRoutes');
const addressRoutes = require('./routes/addressRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;



// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Разрешаем запросы с вашего домена и локального хоста
    const allowedOrigins = [
      'http://v2932600.hosted-by-vdsina.ru',
      'http://localhost:3000', // Для локальной разработки
    ];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Подключение маршрутов аутентификации и пользователей
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// Подключаем маршруты для продуктов, категорий и избранного
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/favorites', favoriteRoutes);

// Подключаем маршруты для адресов
app.use('/api/addresses', addressRoutes);

// API endpoint для контактов
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Валидация данных
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Все поля обязательны для заполнения',
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Некорректный формат email',
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
        pass: process.env.SMTP_PASS || 'your-email-password',
      },
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
            `,
    };

    // Отправляем email
    try {
      console.log('Пытаемся отправить email:', mailOptions);
      await transporter.sendMail(mailOptions);
      console.log('Письмо успешно отправлено');
    } catch (emailError) {
      console.error('Ошибка при отправке email:', emailError);
      throw emailError;
    }

    // Возвращаем успешный ответ
    res.status(200).json({
      success: true,
      message: 'Сообщение успешно отправлено!',
    });
  } catch (error) {
    console.error('Ошибка при отправке email:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при отправке сообщения. Пожалуйста, попробуйте позже.',
    });
  }
});

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  res.json({ message: 'Сервер работает!' });
});

// === ВАЖНО: Подключаем маршруты загрузки изображений ДО обработки 404 ===
app.use('/api/upload', uploadRoutes);

// Добавьте обслуживание статических файлов
const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  maxAge: oneWeek,
  immutable: true
}));

// Обслуживание статических файлов из build-папки в продакшене
if (process.env.NODE_ENV === 'production') {
  const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах
  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
    maxAge: oneWeek,
    immutable: true
  }));
  app.use(express.static(path.join(__dirname, '../build')));

  // Критично: обработка SPA ДОЛЖНА БЫТЬ ПОСЛЕДНЕЙ!
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Глобальная ошибка:', err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Синхронизация с БД и запуск сервера
const startServer = async () => {
  try {
    // Синхронизируем модели с БД
    await sequelize.sync({ alter: true });
    console.log('База данных синхронизирована');

    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(`API доступен по адресу: http://localhost:${PORT}/api/`);
    });
  } catch (error) {
    console.error('Не удалось запустить сервер:', error);
  }
};

startServer();
