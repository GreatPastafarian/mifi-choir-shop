const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем папку для загрузок, если она не существует
const uploadDir = path.join(process.cwd(), 'public/uploads');
console.log('Upload directory path:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  console.log('Creating upload directory...');
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Проверяем права доступа
fs.access(uploadDir, fs.constants.W_OK, (err) => {
  if (err) {
    console.error('Cannot write to upload directory:', err);
  } else {
    console.log('Write access to upload directory: OK');
  }
});

// Настройка хранилища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Saving file to directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = 'image-' + uniqueSuffix + ext;
    console.log('Saving file as:', filename);
    cb(null, filename);
  },
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Только изображения форматов jpeg, jpg, png и gif допустимы!'));
  }
};

// Ограничение размера файла (5MB)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
