// src/utils/imageUtils.js
// (Этот файл НЕ ИСПОЛЬЗУЕТ BASE_URL)

/**
 * Генерирует URL изображения.
 * @param {string} imagePath - Путь из БД (напр., "/uploads/image-123.webp")
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return '/placeholder.png'; // Плейсхолдер из папки /public
    }
    if (imagePath.startsWith('http') || imagePath.startsWith('/placeholder')) {
        return imagePath;
    }
    // URL уже должен быть относительным, вида /uploads/filename.webp
    return imagePath;
};

/**
 * Генерирует пути к разным размерам изображения
 * @param {string} baseUrl - Базовый URL, напр., "/uploads/image-123.webp"
 */
export const getProductImageSet = (baseUrl) => {
    if (!baseUrl || !baseUrl.includes('.webp') || !baseUrl.startsWith('/uploads')) {
        const placeholder = '/placeholder.png';
        return {
            sm: placeholder,
            md: placeholder,
            lg: placeholder,
            srcSet: `${placeholder} 400w`,
        };
    }

    // Убираем ".webp", чтобы добавить суффиксы
    const base = baseUrl.replace('.webp', '');

    const sm = `${base}-sm.webp`;
    const md = `${base}-md.webp`;
    const lg = baseUrl; // "lg" - это наш базовый URL без суффикса

    return {
        sm,
        md,
        lg,
        // Строка для атрибута srcset
        srcSet: `${sm} 400w, ${md} 800w, ${lg} 1200w`,
    };
};
