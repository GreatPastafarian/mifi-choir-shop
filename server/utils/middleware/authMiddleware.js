const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Неверный или истекший токен' });
    }
    req.user = user;
    next();
  });
};

// --- НОВАЯ ФУНКЦИЯ: Опциональная аутентификация ---
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Токена нет -> просто идем дальше, req.user будет undefined
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Токен есть, но он плохой -> игнорируем его, считаем юзера анонимом
      // (чтобы не ломать работу чата из-за старого токена)
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

module.exports = { authenticateToken, optionalAuth };
