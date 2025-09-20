const { User, Donation, sequelize } = require('../models');

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      // ИСПРАВЛЕНО: используем user.createdAt вместо user.created_at
      createdAt: user.createdAt,
      role: user.role,
      notify_rewards: user.notify_rewards,
      notify_concerts: user.notify_concerts,
      notify_personal: user.notify_personal,
      notify_monthly_report: user.notify_monthly_report,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Ошибка сервера',
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    await user.update({ name, phone, address });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role,
      // Добавляем настройки уведомлений в ответ
      notify_rewards: user.notify_rewards,
      notify_concerts: user.notify_concerts,
      notify_personal: user.notify_personal,
      notify_monthly_report: user.notify_monthly_report,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Ошибка сервера',
      error: error.message,
    });
  }
};

// Получить настройки уведомлений
const getNotificationSettings = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({
      notify_rewards: user.notify_rewards,
      notify_concerts: user.notify_concerts,
      notify_personal: user.notify_personal,
      notify_monthly_report: user.notify_monthly_report,
    });
  } catch (error) {
    console.error('Ошибка при получении настроек:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить настройки уведомлений
const updateNotificationSettings = async (req, res) => {
  try {
    const { notify_rewards, notify_concerts, notify_personal, notify_monthly_report } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    await user.update({
      notify_rewards,
      notify_concerts,
      notify_personal,
      notify_monthly_report,
    });

    res.json({ message: 'Настройки успешно обновлены' });
  } catch (error) {
    console.error('Ошибка при обновлении настроек:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить историю пожертвований пользователя
const getDonationHistory = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      where: { userId: req.user.id },
      order: [['created_at', 'DESC']],
    });

    // Преобразуем строки items в массивы
    const formattedDonations = donations.map((donation) => {
      let items = [];
      try {
        items = donation.items ? JSON.parse(donation.items) : [];
      } catch (e) {
        console.error('Ошибка парсинга items:', e);
      }

      return {
        id: donation.id,
        amount: donation.amount,
        payment_method: donation.payment_method,
        status: donation.status, // Важно: возвращаем статус
        items: items,
        createdAt: donation.createdAt || donation.created_at,
      };
    });

    res.json(formattedDonations);
  } catch (error) {
    console.error('Ошибка при получении истории пожертвований:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Добавить пожертвование в историю
const addDonation = async (req, res) => {
  try {
    const { amount, payment_method, items, anonymousId, status } = req.body;

    // Если пользователь авторизован, сохраняем с userId
    if (req.user) {
      const donation = await Donation.create({
        userId: req.user.id,
        amount,
        payment_method,
        items: JSON.stringify(items || []),
        status: status, // Убираем значение по умолчанию
      });
      res.status(201).json(donation);
    }
    // Если есть анонимный ID (из middleware), сохраняем с ним
    else if (req.anonymousId) {
      const donation = await Donation.create({
        anonymousId: req.anonymousId,
        amount,
        payment_method,
        items: JSON.stringify(items || []),
        status: status, // Убираем значение по умолчанию
      });
      res.status(201).json(donation);
    }
    // Если есть анонимный ID в теле запроса
    else if (anonymousId) {
      const donation = await Donation.create({
        anonymousId,
        amount,
        payment_method,
        items: JSON.stringify(items || []),
        status: status, // Убираем значение по умолчанию
      });
      res.status(201).json(donation);
    } else {
      res.status(400).json({
        message: 'Требуется авторизация или анонимный ID',
      });
    }
  } catch (error) {
    console.error('Ошибка при добавлении пожертвования:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const linkAnonymousDonations = async (req, res) => {
  try {
    // Проверяем, авторизован ли пользователь
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: 'Требуется авторизация',
      });
    }

    const { anonymousId } = req.body;

    // Проверяем, есть ли анонимные пожертвования для этого ID
    const anonymousDonationsCount = await Donation.count({
      where: {
        anonymousId,
        userId: null,
      },
    });

    if (anonymousDonationsCount === 0) {
      return res.status(404).json({
        message: 'Не найдено анонимных пожертвований для привязки',
      });
    }

    // Обновляем userId для анонимных пожертвований
    const [updatedCount] = await Donation.update(
      {
        userId: req.user.id,
        anonymousId: null,
      },
      {
        where: {
          anonymousId,
          userId: null,
        },
      }
    );

    res.json({
      message: `Привязано ${updatedCount} пожертвований`,
      count: updatedCount,
    });
  } catch (error) {
    console.error('Ошибка привязки пожертвований:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const checkAnonymousDonations = async (req, res) => {
  try {
    const { anonymousId, email } = req.body;

    // Проверяем, есть ли анонимные пожертвования с этим ID
    const donationsCount = await Donation.count({
      where: {
        anonymousId,
        userId: null,
      },
    });

    // Проверяем, есть ли пользователь с таким email
    const userExists = await User.findOne({
      where: { email },
    });

    res.json({
      hasDonations: donationsCount > 0,
      donationsCount,
      userExists: !!userExists,
    });
  } catch (error) {
    console.error('Ошибка проверки анонимных пожертвований:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить все пожертвования для админки
const getAdminDonations = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      include: [
        {
          model: User,
          as: 'user', // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ - указываем алиас, который использовался при определении ассоциации
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(donations);
  } catch (error) {
    console.error('Ошибка при получении данных для админки:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить статус пожертвования
const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const donation = await Donation.findByPk(id);
    if (!donation) {
      return res.status(404).json({ message: 'Пожертвование не найдено' });
    }

    await donation.update({ status });
    res.json({ message: 'Статус обновлен', donation });
  } catch (error) {
    console.error('Ошибка при обновлении статуса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getNotificationSettings,
  updateNotificationSettings,
  getDonationHistory,
  addDonation,
  linkAnonymousDonations,
  checkAnonymousDonations,
  getAdminDonations,
  updateDonationStatus,
};
