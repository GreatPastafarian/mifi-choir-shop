const { User, Product, Variant, ProductImage, Category } = require('../models');
// Импортируем наш сервис
const { normalizeProductsData } = require('../services/productDataService');

// Получить избранные товары
exports.getFavorites = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Product,
          as: 'favorites',
          include: [
            // ВАЖНО: 'category' должна быть включена,
            // чтобы 'normalize' мог ее прочитать
            {
              model: Category,
              attributes: ['id', 'name', 'slug'],
              as: 'category',
            },
            { model: Variant, as: 'variants' },
            { model: ProductImage, as: 'images' },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (!user.favorites || user.favorites.length === 0) {
      return res.json([]);
    }

    // ИСПОЛЬЗУЕМ СЕРВИС
    const clientFavorites = normalizeProductsData(user.favorites);

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
