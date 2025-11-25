const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const { sequelize } = require('./models');

// Импорты роутов
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const addressRoutes = require('./routes/addressRoutes');
const contactRoutes = require('./routes/contactRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- НАСТРОЙКА CORS (Правильная архитектура) ---
const corsOptions = {
  origin: function (origin, callback) {
    // 1. Разрешаем запросы без origin (например, мобильные приложения, Postman или когда фронт и бэк на одном домене)
    if (!origin) return callback(null, true);

    // 2. Список разрешенных доменов
    const allowedOrigins = [
      'http://localhost:3000',        // Локальная разработка
      'http://localhost:5000',
      'http://127.0.0.1:3000',        // Локальная разработка (альтернатива)
      process.env.CLIENT_URL,         // URL из .env (например, http://v2932600.hosted-by-vdsina.ru)
    ];

    // 3. Если вы разрабатываете в локальной сети (с телефона),
    // можно временно разрешить все локальные IP (начинаются с 192.168...)
    // В ПРОДАКШЕНЕ ЭТОТ БЛОК ЛУЧШЕ УБРАТЬ или оставить только для development режима
    if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://192.168.')) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`[CORS BLOCK] Заблокирован запрос с источника: ${origin}`);
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

// --- ПОДКЛЮЧЕНИЕ МАРШРУТОВ ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  res.json({ message: 'Сервер работает!' });
});

// Статика (uploads)
const oneWeek = 7 * 24 * 60 * 60 * 1000;
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  maxAge: oneWeek,
  immutable: true
}));

// Production Build
if (process.env.NODE_ENV === 'production') {
  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
    maxAge: oneWeek,
    immutable: true
  }));
  app.use(express.static(path.join(__dirname, '../build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error('Глобальная ошибка:', err);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      message: 'Ошибка доступа (CORS)',
                                detail: 'Ваш домен не находится в списке разрешенных.'
    });
  }

  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Запуск
const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('База данных синхронизирована');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('Не удалось запустить сервер:', error);
  }
};

startServer();
