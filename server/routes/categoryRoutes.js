const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
// Заменяем импорт на существующие middleware
const { authenticateToken } = require('../utils//middleware/authMiddleware');
const { checkAdmin } = require('../utils/middleware/adminAuth');

// Публичные маршруты
router.get('/', getAllCategories);

// Маршруты для администраторов
router.use(authenticateToken);
router.use(checkAdmin);

router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
