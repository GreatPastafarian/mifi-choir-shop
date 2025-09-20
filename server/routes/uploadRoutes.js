const express = require('express');
const router = express.Router();
const upload = require('../utils/middleware/upload');
const { authenticateToken } = require('../utils/middleware/authMiddleware'); // Исправлен импорт
const { checkAdmin } = require('../utils/middleware/adminAuth'); // Добавлен правильный импорт

// Маршрут для загрузки изображений
router.post('/images', authenticateToken, checkAdmin, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Нет загруженных файлов' });
    }

    // Формируем URL для каждого загруженного файла
    const uploadedImages = req.files.map((file) => {
      return `/uploads/${file.filename}`;
    });

    res.status(200).json({ images: uploadedImages });
  } catch (error) {
    console.error('Ошибка при загрузке изображений:', error);
    res.status(500).json({
      message: 'Ошибка при загрузке изображений',
      error: error.message,
    });
  }
});

module.exports = router;
