const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getPopularProducts,
  getNewProducts,
  getProductsByCategory,
  incrementViewCount,
} = require('../controllers/productController');
// Заменяем импорт на существующие middleware
const { authenticateToken } = require('../utils/middleware/authMiddleware');
const { checkAdmin } = require('../utils/middleware/adminAuth');

// Публичные маршруты
router.get('/', getAllProducts);
router.get('/popular', getPopularProducts);
router.get('/new', getNewProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProductById);
router.post('/:id/view', incrementViewCount);

// ===== ИСПРАВЛЕНИЕ: Добавляем обработку маршрутов с префиксом /admin =====
// Это нужно для совместимости с текущим клиентским кодом
router.use('/admin', authenticateToken, checkAdmin);

router.get('/admin', getAllProducts);
router.get('/admin/popular', getPopularProducts);
router.get('/admin/new', getNewProducts);
router.get('/admin/category/:categoryId', getProductsByCategory);
router.get('/admin/:id', getProductById);

// Основные маршруты для администраторов
router.use(authenticateToken);
router.use(checkAdmin);

router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Добавляем маршруты с префиксом /admin для операций записи
router.post('/admin', createProduct);
router.put('/admin/:id', updateProduct);
router.delete('/admin/:id', deleteProduct);

module.exports = router;
