const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  console.log('Проверка токена...');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Получен токен:', token ? 'да' : 'нет');

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Ошибка верификации токена:', err);
        return res.status(403).json({ message: 'Недействительный токен' });
      }
      console.log('Токен верифицирован, пользователь:', user);

      // Убедитесь, что роль из токена передается в req.user
      req.user = user;
      next();
    });
  } else if (req.body.anonymousId) {
    console.log('Анонимный запрос с ID:', req.body.anonymousId);
    req.anonymousId = req.body.anonymousId;
    next();
  } else {
    console.log('Требуется аутентификация');
    return res.status(401).json({ message: 'Требуется аутентификация' });
  }
};

module.exports = { authenticateToken };
