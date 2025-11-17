import { BASE_URL } from '../services/api';

// Получаем чистый домен сервера (например, "http://localhost:5000" из "http://localhost:5000/api")
const SERVER_URL = BASE_URL.replace(/\/api\/?$/, '');

/**
 * Генерирует полный URL изображения.
 * @param {string} imagePath - Путь из БД (напр., "/uploads/image-123.webp")
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return '/placeholder.png'; // Используем правильное расширение .png
    }

    // Если это уже полная ссылка (например, внешний URL)
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // Если это плейсхолдер (он лежит на фронтенде, в папке public)
    if (imagePath.startsWith('/placeholder')) {
        return imagePath;
    }

    // Если путь начинается с /uploads, добавляем домен сервера
    if (imagePath.startsWith('/uploads')) {
        return `${SERVER_URL}${imagePath}`;
    }

    // На случай, если путь без слэша в начале
    return `${SERVER_URL}/uploads/${imagePath}`;
};

/**
 * Генерирует пути к разным размерам изображения для srcset
 * @param {string} baseUrl - Базовый URL
 */
export const getProductImageSet = (baseUrl) => {
    // Сначала получаем полный URL через нашу функцию
    const fullUrl = getImageUrl(baseUrl);

    if (!fullUrl || fullUrl.includes('/placeholder.png')) {
        const placeholder = '/placeholder.png';
        return {
            sm: placeholder,
            md: placeholder,
            lg: placeholder,
            srcSet: `${placeholder} 400w`,
        };
    }

    // Убираем ".webp", чтобы добавить суффиксы
    const base = fullUrl.replace('.webp', '');

    // Генерируем полные пути для версий
    const sm = `${base}-sm.webp`;
    const md = `${base}-md.webp`;
    const lg = fullUrl; // lg - это и есть оригинал

    return {
        sm,
        md,
        lg,
        srcSet: `${sm} 400w, ${md} 800w, ${lg} 1200w`,
    };
};
