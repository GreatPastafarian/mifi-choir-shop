// server/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const {
  // Публичные
  getAllProducts,
  getProductById,
  getPopularProducts,
  getNewProducts,
  getProductsByCategory,
  incrementViewCount,
  // Админ (старые)
  createProduct,
  updateProduct,
  deleteProduct,
  // Админ (НОВЫЕ, которые мы добавили в controller)
  adminGetAllProducts,
  adminGetProductById,
} = require('../controllers/productController');

const { authenticateToken } = require('../utils/middleware/authMiddleware');
const { checkAdmin } = require('../utils/middleware/adminAuth');

// --- ПУБЛИЧНЫЕ МАРШРУТЫ (GET) ---
// (Сначала идут самые конкретные)
router.get('/', getAllProducts);
router.get('/popular', getPopularProducts);
router.get('/new', getNewProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.post('/:id/view', incrementViewCount);

// --- АДМИН-МАРШРУТЫ (GET) ---
// (Эти роуты также должны быть до '/:id')
// Мы используем наши новые контроллеры без фильтра
router.get('/admin', authenticateToken, checkAdmin, adminGetAllProducts);
router.get('/admin/:id', authenticateToken, checkAdmin, adminGetProductById);

// --- ПУБЛИЧНЫЙ РОУТ /:id (ПОЧТИ В КОНЦЕ) ---
// (Он должен быть ПОСЛЕ '/admin', '/new', '/popular')
router.get('/:id', getProductById);

// --- МАРШРУТЫ ЗАПИСИ (POST, PUT, DELETE) ---
// (Только для админов)
router.post('/', authenticateToken, checkAdmin, createProduct);
router.put('/:id', authenticateToken, checkAdmin, updateProduct);
router.delete('/:id', authenticateToken, checkAdmin, deleteProduct);

module.exports = router;
