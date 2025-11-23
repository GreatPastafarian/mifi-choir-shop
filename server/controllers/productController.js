const fs = require('fs');
const path = require('path');
const { Product, Category, Variant, ProductImage, Donation } = require('../models');
const {
  normalizeProductsData,
  normalizeProductData,
} = require('../services/productDataService');

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

const deleteFileFromUrl = (imageUrl) => {
  if (!imageUrl) return;
  try {
    if (imageUrl.includes('/uploads/')) {
      const filename = imageUrl.split('/uploads/').pop();
      const filePath = path.join(__dirname, '..', 'public', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Файл удален: ${filePath}`);
      }
    }
  } catch (err) {
    console.error(`Ошибка при удалении файла ${imageUrl}:`, err);
  }
};

// Функция для подсчета продаж (парсит JSON items из донатов)
const getSalesMap = async () => {
  const approvedDonations = await Donation.findAll({
    where: { status: 'Завершено' },
    attributes: ['items'] // Нам нужны только товары
  });

  const salesCount = {};

  approvedDonations.forEach((donation) => {
    try {
      const items = typeof donation.items === 'string'
      ? JSON.parse(donation.items)
      : (donation.items || []);

      items.forEach((item) => {
        const pId = item.productId;
        salesCount[pId] = (salesCount[pId] || 0) + (item.quantity || 0);
      });
    } catch (e) {
      console.error('Ошибка парсинга items при подсчете продаж:', e);
    }
  });

  return salesCount;
};

// Функция для присоединения данных о продажах к массиву продуктов
const attachSalesCounts = async (products) => {
  const salesMap = await getSalesMap();

  return products.map((product) => {
    const plain = product.get({ plain: true });
    return {
      ...plain,
      salesCount: salesMap[plain.id] || 0,
    };
  });
};

// --- ОБЩИЕ НАСТРОЙКИ ЗАПРОСОВ ---
const commonInclude = [
  { model: Category, attributes: ['id', 'name', 'slug'], as: 'category' },
{ model: Variant, as: 'variants' },
{ model: ProductImage, as: 'images' },
];

const commonOrder = [
  ['created_at', 'DESC'],
[{ model: Variant, as: 'variants' }, 'id', 'ASC'],
[{ model: ProductImage, as: 'images' }, 'sort_order', 'ASC']
];

// --- КОНТРОЛЛЕРЫ ---

// Получить все товары (Магазин)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { is_active: true },
      include: commonInclude,
      order: commonOrder
    });

    // Добавляем статистику продаж
    const productsWithStats = await attachSalesCounts(products);

    res.json(normalizeProductsData(productsWithStats));
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить популярные товары
exports.getPopularProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { is_active: true },
      include: commonInclude,
      order: commonOrder
    });

    // Добавляем статистику
    const productsWithStats = await attachSalesCounts(products);

    // Сортировка: Сначала по продажам, потом по просмотрам
    const popularProducts = productsWithStats
    .sort((a, b) => {
      if (b.salesCount !== a.salesCount) return b.salesCount - a.salesCount;
      return (b.views_count || 0) - (a.views_count || 0);
    })
    .slice(0, 4);

    res.json(normalizeProductsData(popularProducts));
  } catch (error) {
    console.error('Ошибка при получении популярных:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить новые товары
exports.getNewProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { is_new: true, is_active: true },
      include: commonInclude,
      order: [
        ['publication_date', 'DESC'],
        [{ model: Variant, as: 'variants' }, 'id', 'ASC'],
        [{ model: ProductImage, as: 'images' }, 'sort_order', 'ASC']
      ],
      limit: 4,
    });

    // Добавляем статистику (чтобы админ видел продажи и тут)
    const productsWithStats = await attachSalesCounts(products);

    res.json(normalizeProductsData(productsWithStats));
  } catch (error) {
    console.error('Ошибка при получении новых:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить товары по категории
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { category_id: req.params.categoryId, is_active: true },
      include: commonInclude,
      order: commonOrder
    });

    // Добавляем статистику
    const productsWithStats = await attachSalesCounts(products);

    res.json(normalizeProductsData(productsWithStats));
  } catch (error) {
    console.error('Ошибка категории:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить товар по ID
exports.getProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return res.status(400).json({ message: 'Некорректный ID' });

    const product = await Product.findOne({
      where: { id: productId, is_active: true },
      include: commonInclude,
      order: [
        [{ model: Variant, as: 'variants' }, 'id', 'ASC'],
        [{ model: ProductImage, as: 'images' }, 'sort_order', 'ASC']
      ]
    });

    if (!product) return res.status(404).json({ message: 'Товар не найден' });

    // Для одного товара тоже считаем (хоть и неэффективно грузить всё, но надежно)
    // Можно оптимизировать, фильтруя донаты, но пока оставим так для простоты
    const salesMap = await getSalesMap();
    const productWithStats = {
      ...product.get({ plain: true }),
      salesCount: salesMap[product.id] || 0
    };

    res.json(normalizeProductData(productWithStats));
  } catch (error) {
    console.error('Ошибка товара:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Увеличить просмотры
exports.incrementViewCount = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.increment('views_count');
      res.json({ views_count: product.views_count + 1 });
    } else {
      res.status(404).json({ message: 'Товар не найден' });
    }
  } catch (error) {
    console.error('Ошибка счетчика:', error);
    res.status(200).json({ message: 'OK' });
  }
};

// --- АДМИНСКИЕ МЕТОДЫ ---

// Создать товар
exports.createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      details: JSON.stringify(req.body.details || []),
      base_price: parseFloat(req.body.base_price),
    };

    const product = await Product.create(productData);

    if (req.body.variants?.length) {
      const variants = req.body.variants.map(v => ({
        ...v,
        price: v.price ? parseFloat(v.price) : null,
                                                   product_id: product.id,
      }));
      await Variant.bulkCreate(variants);
    }

    if (req.body.images?.length) {
      const images = req.body.images.map((url, index) => ({
        image_url: url,
        product_id: product.id,
        sort_order: index,
      }));
      await ProductImage.bulkCreate(images);
    }

    const created = await Product.findOne({
      where: { id: product.id },
      include: commonInclude,
      order: [
        [{ model: Variant, as: 'variants' }, 'id', 'ASC'],
        [{ model: ProductImage, as: 'images' }, 'sort_order', 'ASC']
      ]
    });
    res.status(201).json(normalizeProductData(created));
  } catch (error) {
    console.error('Ошибка создания:', error);
    res.status(400).json({ message: 'Ошибка создания', error: error.message });
  }
};

// Обновить товар
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });

    const productData = {
      ...req.body,
      details: JSON.stringify(req.body.details || []),
      base_price: parseFloat(req.body.base_price),
    };
    await product.update(productData);

    if (req.body.variants) {
      await Variant.destroy({ where: { product_id: product.id } });
      if (req.body.variants.length > 0) {
        const variants = req.body.variants.map(v => ({
          ...v,
          price: v.price ? parseFloat(v.price) : null,
                                                     product_id: product.id,
        }));
        await Variant.bulkCreate(variants);
      }
    }

    if (req.body.images) {
      const currentImages = await ProductImage.findAll({ where: { product_id: product.id } });
      const newUrls = req.body.images;

      const toDelete = currentImages.filter(img => !newUrls.includes(img.image_url));
      toDelete.forEach(img => deleteFileFromUrl(img.image_url));

      await ProductImage.destroy({ where: { product_id: product.id } });
      if (req.body.images.length > 0) {
        const images = req.body.images.map((url, index) => ({
          image_url: url,
          product_id: product.id,
          sort_order: index
        }));
        await ProductImage.bulkCreate(images);
      }
    }

    const updated = await Product.findOne({
      where: { id: product.id },
      include: commonInclude,
      order: [
        [{ model: Variant, as: 'variants' }, 'id', 'ASC'],
        [{ model: ProductImage, as: 'images' }, 'sort_order', 'ASC']
      ]
    });
    res.json(normalizeProductData(updated));
  } catch (error) {
    console.error('Ошибка обновления:', error);
    res.status(400).json({ message: 'Ошибка обновления', error: error.message });
  }
};

// Удалить товар
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });

    const images = await ProductImage.findAll({ where: { product_id: product.id } });
    images.forEach(img => deleteFileFromUrl(img.image_url));

    await product.destroy();
    res.json({ message: 'Товар удален' });
  } catch (error) {
    console.error('Ошибка удаления:', error);
    res.status(500).json({ message: 'Ошибка удаления', error: error.message });
  }
};

// Админ: Список
exports.adminGetAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: commonInclude,
      order: commonOrder
    });

    // Админу тоже полезно видеть продажи
    const productsWithStats = await attachSalesCounts(products);

    res.json(normalizeProductsData(productsWithStats));
  } catch (error) {
    console.error('Ошибка админки (список):', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Админ: Один товар
exports.adminGetProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id },
      include: commonInclude,
      order: [
        [{ model: Variant, as: 'variants' }, 'id', 'ASC'],
        [{ model: ProductImage, as: 'images' }, 'sort_order', 'ASC']
      ]
    });

    if (!product) return res.status(404).json({ message: 'Товар не найден' });

    const salesMap = await getSalesMap();
    const productWithStats = {
      ...product.get({ plain: true }),
      salesCount: salesMap[product.id] || 0
    };

    res.json(normalizeProductData(productWithStats));
  } catch (error) {
    console.error('Ошибка админки (товар):', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};
