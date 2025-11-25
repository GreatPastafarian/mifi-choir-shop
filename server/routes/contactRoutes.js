const express = require('express');
const router = express.Router();
const {
    createMessage,
    getAllMessages,
    replyToUser,
    getUserMessages,
    mergeAnonymousMessages
} = require('../controllers/contactController');

const { authenticateToken, optionalAuth } = require('../utils/middleware/authMiddleware'); // Импортируем optionalAuth
const { checkAdmin } = require('../utils/middleware/adminAuth');

// --- ПУБЛИЧНЫЕ МАРШРУТЫ (Для чата) ---
// Используем optionalAuth: пускаем и с токеном, и без
router.post('/', optionalAuth, createMessage);
router.get('/my-history', optionalAuth, getUserMessages);

// --- ТОЛЬКО ДЛЯ АВТОРИЗОВАННЫХ ---
router.post('/merge', authenticateToken, mergeAnonymousMessages);

// --- АДМИНСКИЕ ---
router.get('/', authenticateToken, checkAdmin, getAllMessages);
router.post('/reply-group', authenticateToken, checkAdmin, replyToUser);

module.exports = router;
