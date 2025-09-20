const express = require('express');
const router = express.Router();
const { getFavorites, addToFavorites, removeFromFavorites } = require('../controllers/favoriteController');
// Заменяем импорт на существующие middleware
const { authenticateToken } = require('../utils/middleware/authMiddleware');

// Все маршруты требуют аутентификации
router.use(authenticateToken);

router.get('/', getFavorites);
router.post('/:productId', addToFavorites);
router.delete('/:productId', removeFromFavorites);

module.exports = router;
