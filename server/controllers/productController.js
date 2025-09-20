const { Product, Category, Variant, ProductImage } = require('../models');
const { Donation } = require('../models');

// Получить все товары
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug'],
          as: 'category',
        },
        {
          model: Variant,
          as: 'variants',
        },
        {
          model: ProductImage,
          as: 'images',
        },
      ],
      order: [['sort_order', 'ASC']],
    });

    // Преобразуем данные для клиента
    const clientProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      category_id: product.category_id,
      category_name: product.category.name,
      description: product.description,
      materials: product.materials,
      details: JSON.parse(product.details || '[]'),
      images: product.images.map((image) => image.image_url),
      base_price: parseFloat(product.base_price),
      is_new: product.is_new,
      publication_date: product.publication_date,
      views_count: product.views_count,
      sort_order: product.sort_order,
      is_active: product.is_active,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        quantity: variant.quantity,
        price: variant.price ? parseFloat(variant.price) : null,
        is_available: variant.is_available,
      })),
    }));

    res.json(clientProducts);
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    res.status(500).json({ message: 'Ошибка при получении товаров', error: error.message });
  }
};

// Получить популярные товары (на основе продаж)
exports.getPopularProducts = async (req, res) => {
  try {
    // Сначала получаем все товары
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug'],
          as: 'category',
        },
        {
          model: Variant,
          as: 'variants',
        },
        {
          model: ProductImage,
          as: 'images',
        },
      ],
    });

    // Получаем все одобренные пожертвования с товарами
    const approvedDonations = await Donation.findAll({
      where: {
        status: 'Одобрено',
      },
    });

    // Считаем продажи для каждого товара
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

    // Добавляем количество продаж к товарам
    const productsWithSales = products.map((product) => ({
      ...product.get({ plain: true }),
      salesCount: salesCount[product.id] || 0,
    }));

    // Сортируем по количеству продаж и берем топ-4
    const popularProducts = productsWithSales.sort((a, b) => b.salesCount - a.salesCount).slice(0, 4);

    // Преобразуем данные для клиента
    const clientProducts = popularProducts.map((product) => ({
      id: product.id,
      name: product.name,
      category_id: product.category_id,
      category_name: product.category.name,
      description: product.description,
      materials: product.materials,
      details: JSON.parse(product.details || '[]'),
      images: product.images.map((image) => image.image_url),
      base_price: parseFloat(product.base_price),
      is_new: product.is_new,
      publication_date: product.publication_date,
      views_count: product.views_count,
      sort_order: product.sort_order,
      is_active: product.is_active,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        quantity: variant.quantity,
        price: variant.price ? parseFloat(variant.price) : null,
        is_available: variant.is_available,
      })),
      salesCount: product.salesCount,
    }));

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
      where: { is_new: true },
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug'],
          as: 'category',
        },
        {
          model: Variant,
          as: 'variants',
        },
        {
          model: ProductImage,
          as: 'images',
        },
      ],
      order: [['publication_date', 'DESC']],
      limit: 4,
    });

    // Преобразуем данные для клиента
    const clientProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      category_id: product.category_id,
      category_name: product.category.name,
      description: product.description,
      materials: product.materials,
      details: JSON.parse(product.details || '[]'),
      images: product.images.map((image) => image.image_url),
      base_price: parseFloat(product.base_price),
      is_new: product.is_new,
      publication_date: product.publication_date,
      views_count: product.views_count,
      sort_order: product.sort_order,
      is_active: product.is_active,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        quantity: variant.quantity,
        price: variant.price ? parseFloat(variant.price) : null,
        is_available: variant.is_available,
      })),
    }));

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
      where: { category_id: req.params.categoryId },
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug'],
          as: 'category',
        },
        {
          model: Variant,
          as: 'variants',
        },
        {
          model: ProductImage,
          as: 'images',
        },
      ],
      order: [['sort_order', 'ASC']],
    });

    // Преобразуем данные для клиента
    const clientProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      category_id: product.category_id,
      category_name: product.category.name,
      description: product.description,
      materials: product.materials,
      details: JSON.parse(product.details || '[]'),
      images: product.images.map((image) => image.image_url),
      base_price: parseFloat(product.base_price),
      is_new: product.is_new,
      publication_date: product.publication_date,
      views_count: product.views_count,
      sort_order: product.sort_order,
      is_active: product.is_active,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        quantity: variant.quantity,
        price: variant.price ? parseFloat(variant.price) : null,
        is_available: variant.is_available,
      })),
    }));

    res.json(clientProducts);
  } catch (error) {
    console.error('Ошибка при получении товаров по категории:', error);
    res.status(500).json({ message: 'Ошибка при получении товаров по категории', error: error.message });
  }
};

// Получить товар по ID
// Получить товар по ID
exports.getProductById = async (req, res) => {
  try {
    // Добавляем проверку на корректность ID
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({
        message: 'Некорректный ID товара',
        receivedId: req.params.id,
      });
    }

    const product = await Product.findOne({
      where: { id: productId },
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug'],
          as: 'category',
        },
        {
          model: Variant,
          as: 'variants',
        },
        {
          model: ProductImage,
          as: 'images',
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    // Преобразуем данные для клиента
    const clientProduct = {
      id: product.id,
      name: product.name,
      category_id: product.category_id,
      category_name: product.category.name,
      description: product.description,
      materials: product.materials,
      details: product.details ? JSON.parse(product.details) : [],
      images: product.images.map((image) => image.image_url),
      base_price: parseFloat(product.base_price),
      is_new: product.is_new,
      publication_date: product.publication_date,
      views_count: product.views_count,
      sort_order: product.sort_order,
      is_active: product.is_active,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        quantity: variant.quantity,
        price: variant.price ? parseFloat(variant.price) : null,
        is_available: variant.is_available,
      })),
    };

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

    await product.update({
      views_count: product.views_count + 1,
    });

    res.json({ views_count: product.views_count + 1 });
  } catch (error) {
    console.error('Ошибка при увеличении счетчика просмотров:', error);
    res.status(500).json({ message: 'Ошибка при увеличении счетчика просмотров', error: error.message });
  }
};

// Создать новый товар (администратор)
exports.createProduct = async (req, res) => {
  try {
    // Обработка данных
    const productData = {
      ...req.body,
      details: JSON.stringify(req.body.details || []),
      base_price: parseFloat(req.body.base_price),
    };

    const product = await Product.create(productData);

    // Создаем варианты, если они предоставлены
    if (req.body.variants && req.body.variants.length > 0) {
      const variants = req.body.variants.map((variant) => ({
        ...variant,
        price: variant.price ? parseFloat(variant.price) : null,
        product_id: product.id,
      }));
      await Variant.bulkCreate(variants);
    }

    // Создаем изображения, если они предоставлены
    if (req.body.images && req.body.images.length > 0) {
      const images = req.body.images.map((url, index) => ({
        image_url: url,
        product_id: product.id,
        sort_order: index,
      }));
      await ProductImage.bulkCreate(images);
    }

    // Перезагружаем продукт с включениями
    const createdProduct = await Product.findOne({
      where: { id: product.id },
      include: [
        {
          model: Variant,
          as: 'variants',
        },
        {
          model: ProductImage,
          as: 'images',
        },
      ],
    });

    res.status(201).json(createdProduct);
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

    // Обработка данных
    const productData = {
      ...req.body,
      details: JSON.stringify(req.body.details || []),
      base_price: parseFloat(req.body.base_price),
    };

    await product.update(productData);

    // Обновляем варианты
    if (req.body.variants) {
      // Удаляем существующие варианты
      await Variant.destroy({ where: { product_id: product.id } });

      // Создаем новые варианты
      if (req.body.variants.length > 0) {
        const variants = req.body.variants.map((variant) => ({
          ...variant,
          price: variant.price ? parseFloat(variant.price) : null,
          product_id: product.id,
        }));
        await Variant.bulkCreate(variants);
      }
    }

    // Обновляем изображения
    if (req.body.images) {
      // Удаляем существующие изображения
      await ProductImage.destroy({ where: { product_id: product.id } });

      // Создаем новые изображения
      if (req.body.images.length > 0) {
        const images = req.body.images.map((url, index) => ({
          image_url: url,
          product_id: product.id,
          sort_order: index,
        }));
        await ProductImage.bulkCreate(images);
      }
    }

    // Перезагружаем продукт с включениями
    const updatedProduct = await Product.findOne({
      where: { id: product.id },
      include: [
        {
          model: Variant,
          as: 'variants',
        },
        {
          model: ProductImage,
          as: 'images',
        },
      ],
    });

    res.json(updatedProduct);
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
