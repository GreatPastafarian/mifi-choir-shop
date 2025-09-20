// src/data/products.js
// Импортируем сегодняшнюю дату для удобства
const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const lastWeek = new Date();
lastWeek.setDate(today.getDate() - 7);
const lastMonth = new Date();
lastMonth.setDate(today.getDate() - 30);

const products = [
  {
    id: 1,
    name: 'Футболка с логотипом хора МИФИ',
    category: 'Одежда',
    price: 1500,
    description:
      'Качественная хлопковая футболка с вышитым логотипом мужского академического хора МИФИ. Доступна в размерах S-XXL.',
    materials: '100% хлопок, экологичные краски',
    details: ['Вышивка высокого качества', 'Устойчивость к стиркам', 'Мягкий комфортный материал'],
    images: [
      '/images/products/tshirt-front.jpg',
      '/images/products/tshirt-back.jpg',
      '/images/products/tshirt-detail.jpg',
    ],
    image: 'tshirt',
    isNew: true,
    publicationDate: yesterday, // Опубликовано вчера
    salesCount: 45, // Количество продаж
    viewsCount: 120, // Количество просмотров
  },
  {
    id: 2,
    name: 'Концертный диск',
    category: 'Музыка',
    price: 800,
    description: 'Аудио-CD с записью концерта хора МИФИ, прошедшего в Большом зале Московской консерватории.',
    materials: 'CD-R, полиграфическая упаковка',
    details: ['Запись в формате 16-bit/44.1kHz', 'Специальная упаковка с буклетом', 'Подписанный диск артистами'],
    images: ['/images/products/cd-cover.jpg', '/images/products/cd-back.jpg', '/images/products/cd-bonus.jpg'],
    image: 'cd',
    isNew: true,
    publicationDate: today, // Опубликовано сегодня
    salesCount: 32,
    viewsCount: 95,
  },
  {
    id: 3,
    name: 'Значок хора',
    category: 'Аксессуары',
    price: 300,
    description: 'Металлический значок с логотипом мужского академического хора МИФИ.',
    materials: 'Металл, эмаль',
    details: ['Высококачественная печать', 'Антикоррозийное покрытие', 'Компактный размер'],
    images: ['/images/products/pin-front.jpg', '/images/products/pin-back.jpg'],
    image: 'pin',
    isNew: false,
    publicationDate: lastWeek, // Опубликовано неделю назад
    salesCount: 120,
    viewsCount: 300,
  },
  {
    id: 4,
    name: 'Термокружка',
    category: 'Аксессуары',
    price: 1200,
    description: 'Термокружка объемом 350 мл с логотипом хора МИФИ.',
    materials: 'Нержавеющая сталь, эко-материалы',
    details: ['Двойные стенки для сохранения температуры', 'Съемная крышка', 'Легко моется'],
    images: ['/images/products/mug-front.jpg', '/images/products/mug-side.jpg'],
    image: 'mug',
    isNew: true,
    publicationDate: yesterday,
    salesCount: 28,
    viewsCount: 85,
  },
  {
    id: 5,
    name: 'Свитшот с эмблемой хора',
    category: 'Одежда',
    price: 2500,
    description: 'Качественный свитшот из плотного хлопка с вышитой эмблемой хора МИФИ.',
    materials: '100% хлопок',
    details: ['Вышивка высокого качества', 'Устойчивость к стиркам', 'Мягкий комфортный материал'],
    images: ['/images/products/sweatshirt-front.jpg', '/images/products/sweatshirt-back.jpg'],
    image: 'sweatshirt',
    isNew: false,
    publicationDate: lastMonth, // Опубликовано месяц назад
    salesCount: 75,
    viewsCount: 200,
  },
  {
    id: 6,
    name: 'Лимитированная виниловая пластинка',
    category: 'Музыка',
    price: 3500,
    description: 'Виниловая пластинка с записью концерта хора МИФИ.',
    materials: 'Винил премиум-класса',
    details: ['Лимитированный тираж', 'Эксклюзивная обложка', 'Запись в студийном качестве'],
    images: ['/images/products/vinyl-front.jpg', '/images/products/vinyl-back.jpg'],
    image: 'vinyl',
    isNew: true,
    publicationDate: today,
    salesCount: 15,
    viewsCount: 50,
  },
  {
    id: 7,
    name: 'Эко-сумка с принтом',
    category: 'Аксессуары',
    price: 800,
    description: 'Экологичная холщовая сумка с принтом хора МИФИ.',
    materials: 'Хлопковый холст',
    details: ['Экологичные материалы', 'Прочная ручка', 'Универсальный дизайн'],
    images: ['/images/products/bag-front.jpg', '/images/products/bag-back.jpg'],
    image: 'bag',
    isNew: true,
    publicationDate: yesterday,
    salesCount: 40,
    viewsCount: 110,
  },
  {
    id: 8,
    name: 'Подарочный набор к 60-летию хора',
    category: 'Коллекционные издания',
    price: 5000,
    description: 'Эксклюзивный набор, посвященный 60-летию хора МИФИ.',
    materials: 'Качественные материалы',
    details: ['Ограниченный тираж', 'Эксклюзивный дизайн', 'Подарочная упаковка'],
    images: ['/images/products/gift-set-front.jpg', '/images/products/gift-set-back.jpg'],
    image: 'gift-set',
    isNew: false,
    publicationDate: lastMonth,
    salesCount: 22,
    viewsCount: 60,
  },
];

// Получаем категории из товаров
export const getCategories = () => {
  const categories = {};
  products.forEach((product) => {
    if (!categories[product.category]) {
      categories[product.category] = {
        id: Object.keys(categories).length + 1,
        name: product.category,
        description: '',
        image: `${product.category.toLowerCase().replace(/\s+/g, '-')}-category`,
      };
    }
  });

  // Добавляем описания для некоторых категорий
  categories['Одежда'].description = 'Футболки, свитшоты, толстовки с символикой хора';
  categories['Аксессуары'].description = 'Значки, кружки, сумки и другие аксессуары';
  categories['Музыка'].description = 'Диски с записями концертов, ноты';
  categories['Коллекционные издания'].description = 'Ограниченные серии и эксклюзивные сувениры';

  return Object.values(categories);
};

// Получаем популярные товары (топ по продажам)
export const getPopularProducts = () => {
  return [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 4);
};

// Получаем новинки (отсортированные по дате публикации)
export const getNewProducts = () => {
  return [...products]
    .filter((product) => {
      // Новинкой считаем товар, опубликованный за последние 7 дней
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return product.publicationDate > oneWeekAgo;
    })
    .sort((a, b) => b.publicationDate - a.publicationDate);
};

// Получаем товары по категории
export const getProductsByCategory = (categoryId) => {
  const categories = getCategories();
  const categoryName = categories.find((cat) => cat.id === parseInt(categoryId))?.name;

  if (!categoryName) return [];

  return products.filter((product) => product.category === categoryName);
};

// Получаем товар по ID
export const getProductById = (id) => {
  return products.find((product) => product.id === parseInt(id)) || null;
};

// Получаем товары по фильтру
export const getFilteredProducts = (filterType) => {
  let filteredProducts = [...products];

  switch (filterType) {
    case 'new':
      // Новинки - товары за последние 7 дней
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return filteredProducts.filter((p) => p.publicationDate > oneWeekAgo);

    case 'popular':
      // Популярное - сортировка по количеству продаж
      return filteredProducts.sort((a, b) => b.salesCount - a.salesCount);

    case 'top-rated':
      // Топ по рейтингу (в реальном приложении здесь был бы рейтинг)
      return filteredProducts.sort((a, b) => b.viewsCount / (b.salesCount + 1) - a.viewsCount / (a.salesCount + 1));

    default:
      return filteredProducts;
  }
};

export const getRelatedProducts = (productId) => {
  const product = getProductById(productId);
  if (!product) return [];

  return products.filter((p) => p.category === product.category && p.id !== productId).slice(0, 3);
};

// Экспортируем сам массив товаров
export default products;
