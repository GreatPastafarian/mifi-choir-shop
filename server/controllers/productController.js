const { Product, Category, Variant, ProductImage, Donation } = require('../models');
// Импортируем наш сервис
const {
  normalizeProductsData,
  normalizeProductData,
} = require('../services/productDataService');

// Получить все товары
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { is_active: true },
      include: [
        { model: Category, attributes: ['id', 'name', 'slug'], as: 'category' },
        { model: Variant, as: 'variants' },
        { model: ProductImage, as: 'images' },
      ],
      order: [['sort_order', 'ASC']],
    });

    // ИСПОЛЬЗУЕМ СЕРВИС
    const clientProducts = normalizeProductsData(products);
    res.json(clientProducts);
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    res.status(500).json({ message: 'Ошибка при получении товаров', error: error.message });
  }
};

// Получить популярные товары (на основе продаж)
exports.getPopularProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { is_active: true },
      include: [
        { model: Category, attributes: ['id', 'name', 'slug'], as: 'category' },
        { model: Variant, as: 'variants' },
        { model: ProductImage, as: 'images' },
      ],
    });

    const approvedDonations = await Donation.findAll({
      where: { status: 'Одобрено' },
    });

    const salesCount = {};
    approvedDonations.forEach((donation) => {
      try {
        const items = JSON.parse(donation.items || '[]');
        items.forEach((item) => {
          if (!salesCount[item.productId]) {
            salesCount[item.productId] = 0;
          }
          salesCount[item.productId] += item.quantity;
        });
      } catch (e) {
        console.error('Ошибка парсинга items:', e);
      }
    });

    const productsWithSales = products.map((product) => ({
      ...product.get({ plain: true }), // Получаем чистый объект
                                                         salesCount: salesCount[product.id] || 0,
    }));

    const popularProducts = productsWithSales
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 4);

    // ИСПОЛЬЗУЕМ СЕРВИС
    const clientProducts = normalizeProductsData(popularProducts);
    res.json(clientProducts);
  } catch (error) {
    console.error('Ошибка при получении популярных товаров:', error);
    res.status(500).json({ message: 'Ошибка при получении популярных товаров', error: error.message });
  }
};

// Получить новые товары
exports.getNewProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { is_new: true, is_active: true },
      include: [
        { model: Category, attributes: ['id', 'name', 'slug'], as: 'category' },
        { model: Variant, as: 'variants' },
        { model: ProductImage, as: 'images' },
      ],
      order: [['publication_date', 'DESC']],
      limit: 4,
    });

    // ИСПОЛЬЗУЕМ СЕРВИС
    const clientProducts = normalizeProductsData(products);
    res.json(clientProducts);
  } catch (error) {
    console.error('Ошибка при получении новых товаров:', error);
    res.status(500).json({ message: 'Ошибка при получении новых товаров', error: error.message });
  }
};

// Получить товары по категории
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { category_id: req.params.categoryId, is_active: true },
      include: [
        { model: Category, attributes: ['id', 'name', 'slug'], as: 'category' },
        { model: Variant, as: 'variants' },
        { model: ProductImage, as: 'images' },
      ],
      order: [['sort_order', 'ASC']],
    });

    // ИСПОЛЬЗUЕМ СЕРВИС
    const clientProducts = normalizeProductsData(products);
    res.json(clientProducts);
  } catch (error) {
    console.error('Ошибка при получении товаров по категории:', error);
    res.status(500).json({ message: 'Ошибка при получении товаров по категории', error: error.message });
  }
};

// Получить товар по ID
exports.getProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({
        message: 'Некорректный ID товара',
        receivedId: req.params.id,
      });
    }

    const product = await Product.findOne({
      where: { id: productId, is_active: true },
      include: [
        { model: Category, attributes: ['id', 'name', 'slug'], as: 'category' },
        { model: Variant, as: 'variants' },
        { model: ProductImage, as: 'images' },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    // ИСПОЛЬЗУЕМ СЕРВИС (для одного товара)
    const clientProduct = normalizeProductData(product);
    res.json(clientProduct);
  } catch (error) {
    console.error('Ошибка при получении товара:', error);
    res.status(500).json({
      message: 'Ошибка при получении товара',
      error: error.message,
    });
  }
};

// Увеличить счетчик просмотров
exports.incrementViewCount = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    await product.update({ views_count: product.views_count + 1 });
    res.json({ views_count: product.views_count + 1 });
  } catch (error) {
    console.error('Ошибка при увеличении счетчика просмотров:', error);
    res.status(500).json({ message: 'Ошибка при увеличении счетчика просмотров', error: error.message });
  }
};

// Создать новый товар (администратор)
exports.createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      details: JSON.stringify(req.body.details || []),
      base_price: parseFloat(req.body.base_price),
    };

    const product = await Product.create(productData);

    if (req.body.variants && req.body.variants.length > 0) {
      const variants = req.body.variants.map((variant) => ({
        ...variant,
        price: variant.price ? parseFloat(variant.price) : null,
                                                           product_id: product.id,
      }));
      await Variant.bulkCreate(variants);
    }

    if (req.body.images && req.body.images.length > 0) {
      const images = req.body.images.map((url, index) => ({
        image_url: url,
        product_id: product.id,
        sort_order: index,
      }));
      await ProductImage.bulkCreate(images);
    }

    const createdProduct = await Product.findOne({
      where: { id: product.id },
      include: [
        { model: Variant, as: 'variants' },
        { model: ProductImage, as: 'images' },
        { model: Category, attributes: ['id', 'name', 'slug'], as: 'category' },
      ],
    });

    // ИСПОЛЬЗУЕМ СЕРВИС
    res.status(201).json(normalizeProductData(createdProduct));
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    res.status(400).json({
      message: 'Ошибка при создании товара',
      error: error.message,
    });
  }
};

// Обновить товар (администратор)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    const productData = {
      ...req.body,
      details: JSON.stringify(req.body.details || []),
      base_price: parseFloat(req.body.base_price),
    };
    await product.update(productData);

    if (req.body.variants) {
      await Variant.destroy({ where: { product_id: product.id } });
      if (req.body.variants.length > 0) {
        const variants = req.body.variants.map((variant) => ({
          ...variant,
          price: variant.price ? parseFloat(variant.price) : null,
                                                             product_id: product.id,
        }));
        await Variant.bulkCreate(variants);
      }
    }

    if (req.body.images) {
      await ProductImage.destroy({ where: { product_id: product.id } });
      if (req.body.images.length > 0) {
        const images = req.body.images.map((url, index) => ({
          image_url: url,
          product_id: product.id,
          sort_order: index,
        }));
        await ProductImage.bulkCreate(images);
      }
    }

    const updatedProduct = await Product.findOne({
      where: { id: product.id },
      include: [
        { model: Variant, as: 'variants' },
        { model: ProductImage, as: 'images' },
        { model: Category, attributes: ['id', 'name', 'slug'], as: 'category' },
      ],
    });

    // ИСПОЛЬЗУЕМ СЕРВИС
    res.json(normalizeProductData(updatedProduct));
  } catch (error) {
    console.error('Ошибка при обновлении товара:', error);
    res.status(400).json({
      message: 'Ошибка при обновлении товара',
      error: error.message,
    });
  }
};

// Удалить товар (администратор)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    await product.destroy();
    res.json({ message: 'Товар успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    res.status(500).json({
      message: 'Ошибка при удалении товара',
      error: error.message,
    });
  }
};

exports.adminGetAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      // where: { is_active: true }, // <-- УДАЛЕНО
      include: [
        { model: Category, attributes: ['id', 'name', 'slug'], as: 'category' },
        { model: Variant, as: 'variants' },
        { model: ProductImage, as: 'images' },
      ],
      order: [['sort_order', 'ASC']],
    });

    // ИСПОЛЬЗУЕМ СЕРВИС
    const clientProducts = normalizeProductsData(products);
    res.json(clientProducts);
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    res.status(500).json({ message: 'Ошибка при получении товаров', error: error.message });
  }
};

// НОВЫЙ МЕТОД ДЛЯ АДМИНКИ (без фильтра 'is_active')
exports.adminGetProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({
        message: 'Некорректный ID товара',
        receivedId: req.params.id,
      });
    }

    const product = await Product.findOne({
      where: { id: productId }, // <-- Только 'id', без 'is_active'
      include: [
        { model: Category, attributes: ['id', 'name', 'slug'], as: 'category' },
        { model: Variant, as: 'variants' },
        { model: ProductImage, as: 'images' },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    const clientProduct = normalizeProductData(product);
    res.json(clientProduct);
  } catch (error) {
    console.error('Ошибка при получении (admin) товара:', error);
    res.status(500).json({
      message: 'Ошибка при получении товара',
      error: error.message,
    });
  }
};
