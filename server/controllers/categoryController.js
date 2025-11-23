const { Category } = require('../models');

// Получить все категории
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']],
    });

    const clientCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      sort_order: category.sort_order,
      is_active: category.is_active,
    }));

    res.json(clientCategories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ message: 'Ошибка при получении категорий', error: error.message });
  }
};

// --- ДОБАВИТЬ ЭТУ ФУНКЦИЮ ---
// Получить одну категорию по ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    // Возвращаем данные
    res.json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
  } catch (error) {
    console.error('Ошибка при получении категории:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};
// -----------------------------

// Создать новую категорию (администратор)
exports.createCategory = async (req, res) => {
  try {
    if (!req.body.slug || req.body.slug.trim() === '') {
      return res.status(400).json({
        message: 'Slug не может быть пустым',
        error: 'Slug validation failed',
      });
    }

    if (!/^[a-z0-9-]+$/.test(req.body.slug)) {
      return res.status(400).json({
        message: 'Slug может содержать только латинские буквы, цифры и дефисы',
        error: 'Slug validation failed',
      });
    }

    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error('Ошибка при создании категории:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Категория с таким названием или slug уже существует',
        error: error.message,
      });
    }

    res.status(400).json({
      message: 'Ошибка при создании категории',
      error: error.message,
    });
  }
};

// Обновить категорию (администратор)
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    await category.update(req.body);
    res.json(category);
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    res.status(400).json({
      message: 'Ошибка при обновлении категории',
      error: error.message,
    });
  }
};

// Удалить категорию (администратор)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    await category.destroy();
    res.json({ message: 'Категория успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    res.status(500).json({
      message: 'Ошибка при удалении категории',
      error: error.message,
    });
  }
};
