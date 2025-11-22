const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authenticateToken } = require('../utils/middleware/authMiddleware');

// Все маршруты защищены (только для авторизованных)
router.use(authenticateToken);

router.get('/', addressController.getUserAddresses);
router.post('/', addressController.createAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router;
