const express = require('express');
const router = express.Router();
const upload = require('../utils/middleware/upload');
const { authenticateToken } = require('../utils/middleware/authMiddleware');
const { checkAdmin } = require('../utils/middleware/adminAuth');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// (ИЗМЕНЕНИЕ) Теперь 'профили' - это массивы размеров
const PROCESSING_PROFILES = {
  product: [
    { name: 'sm', width: 400, quality: 75 },
    { name: 'md', width: 800, quality: 80 },
    { name: 'lg', width: 1200, quality: 80 }, // Основной файл
  ],
  category: [
    { name: 'sm', width: 400, quality: 75 },
    { name: 'md', width: 800, quality: 78 },
    { name: 'lg', width: 1200, quality: 80 }, // Основной файл
  ],
  default: [
    { name: 'lg', width: 1080, quality: 70 }, // Один размер по умолчанию
  ],
};

// Хелпер для обработки одного файла в один размер
const processImage = (filePath, destination, options) => {
  return sharp(filePath)
  .resize({
    width: options.width,
    height: options.width, // Делаем квадратные превью
    fit: 'cover', // Обрезаем по центру, чтобы заполнить
  })
  .toFormat('webp', { quality: options.quality })
  .toFile(destination);
};

router.post('/images', authenticateToken, checkAdmin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Нет загруженных файлов' });
    }

    const uploadType = req.query.type || 'default';
    const profile = PROCESSING_PROFILES[uploadType] || PROCESSING_PROFILES.default;
    const uploadedImages = [];

    for (const file of req.files) {
      const originalName = path.parse(file.filename).name; // Напр., "image-123456"
      const baseWebpName = `${originalName}.webp`; // "image-123456.webp"
      const processingTasks = []; // Массив обещаний для sharp

      // 1. Создаем задачи для каждого размера
      profile.forEach(options => {
        // Имя файла будет "image-123456-sm.webp", "image-123456-md.webp" и т.д.
        // Для основного файла (lg) мы не добавляем суффикс
        const suffix = options.name === 'lg' ? '' : `-${options.name}`;
        const newFilename = `${originalName}${suffix}.webp`;
        const newPath = path.join(file.destination, newFilename);

        processingTasks.push(processImage(file.path, newPath, options));
      });

      try {
        // 2. Выполняем всю обработку параллельно
        await Promise.all(processingTasks);

        // 3. Удаляем оригинал
        fs.unlinkSync(file.path);

        // 4. Возвращаем БАЗОВЫЙ URL (без суффиксов)
        // Фронтенд будет сам добавлять "-sm", "-md"
        uploadedImages.push(`/uploads/${baseWebpName}`);

      } catch (procErr) {
        console.error(`Ошибка при обработке файла ${file.filename}:`, procErr);
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(500).json({ message: 'Ни один из файлов не удалось обработать' });
    }

    res.status(200).json({ images: uploadedImages }); // Отвечаем как и раньше

  } catch (error) {
    console.error('Ошибка при загрузке изображений:', error);
    res.status(500).json({
      message: 'Ошибка при загрузке изображений',
      error: error.message,
    });
  }
});

module.exports = router;
