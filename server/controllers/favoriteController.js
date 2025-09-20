const { User, Product, Variant, ProductImage } = require('../models');

// Получить избранные товары
exports.getFavorites = async (req, res) => {
  try {
    // Добавляем проверку наличия req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Product,
          as: 'favorites',
          include: [
            { model: Variant, as: 'variants' },
            { model: ProductImage, as: 'images' },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем, есть ли избранные товары
    if (!user.favorites || user.favorites.length === 0) {
      return res.json([]);
    }

    // Преобразуем данные для клиента
    const clientFavorites = user.favorites.map((product) => ({
      id: product.id,
      name: product.name,
      category_id: product.category_id,
      description: product.description,
      materials: product.materials,
      details: product.details ? JSON.parse(product.details) : [],
      images: product.images ? product.images.map((image) => image.image_url) : [],
      base_price: parseFloat(product.base_price),
      is_new: product.is_new,
      publication_date: product.publication_date,
      views_count: product.views_count,
      sort_order: product.sort_order,
      is_active: product.is_active,
      variants: product.variants
        ? product.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            quantity: variant.quantity,
            price: variant.price ? parseFloat(variant.price) : null,
            is_available: variant.is_available,
          }))
        : [],
    }));

    res.json(clientFavorites);
  } catch (error) {
    console.error('Ошибка при получении избранного:', error);
    res.status(500).json({
      message: 'Ошибка при получении избранного',
      error: error.message,
    });
  }
};

// Добавить товар в избранное
exports.addToFavorites = async (req, res) => {
  try {
    // Добавляем проверку наличия req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const user = await User.findByPk(req.user.id);
    const productId = parseInt(req.params.productId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Некорректный ID товара' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    // Проверяем, не добавлен ли уже товар в избранное
    const favorites = await user.getFavorites();
    const isAlreadyFavorite = favorites.some((fav) => fav.id === product.id);

    if (!isAlreadyFavorite) {
      await user.addFavorite(product);
    }

    res.status(200).json({ message: 'Товар добавлен в избранное' });
  } catch (error) {
    console.error('Ошибка при добавлении в избранное:', error);
    res.status(500).json({
      message: 'Ошибка при добавлении в избранное',
      error: error.message,
    });
  }
};

// Удалить товар из избранного
exports.removeFromFavorites = async (req, res) => {
  try {
    // Добавляем проверку наличия req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const user = await User.findByPk(req.user.id);
    const productId = parseInt(req.params.productId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Некорректный ID товара' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    // Удаляем товар из избранного
    await user.removeFavorite(product);

    res.status(200).json({ message: 'Товар удален из избранного' });
  } catch (error) {
    console.error('Ошибка при удалении из избранного:', error);
    res.status(500).json({
      message: 'Ошибка при удалении из избранного',
      error: error.message,
    });
  }
};
