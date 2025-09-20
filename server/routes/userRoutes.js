const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../utils/middleware/authMiddleware');
const userController = require('../controllers/userController');
const { checkAdmin } = require('../utils/middleware/adminAuth');

// Добавляем проверку для диагностики
console.log('userController:', {
  getProfile: typeof userController.getProfile,
  updateProfile: typeof userController.updateProfile,
  getNotificationSettings: typeof userController.getNotificationSettings,
  updateNotificationSettings: typeof userController.updateNotificationSettings,
  getDonationHistory: typeof userController.getDonationHistory,
  addDonation: typeof userController.addDonation,
});

// Основные маршруты профиля
router.get('/me', authenticateToken, userController.getProfile);
router.put('/me', authenticateToken, userController.updateProfile);

// Маршруты для настроек уведомлений
router.get('/settings', authenticateToken, userController.getNotificationSettings);
router.put('/settings', authenticateToken, userController.updateNotificationSettings);

// Маршруты для истории пожертвований
router.get('/donations', authenticateToken, userController.getDonationHistory);
router.post('/donations', authenticateToken, userController.addDonation);

router.post('/link-anonymous', authenticateToken, userController.linkAnonymousDonations);
router.post('/check-anonymous', userController.checkAnonymousDonations);

router.get('/admin/donations', authenticateToken, checkAdmin, userController.getAdminDonations);
router.patch('/admin/donations/:id/status', authenticateToken, checkAdmin, userController.updateDonationStatus);

module.exports = router;
