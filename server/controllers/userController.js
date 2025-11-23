const { User, Donation, Variant, Product, sequelize } = require('../models');

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
  const t = await sequelize.transaction(); // Начинаем транзакцию

  try {
    const {
      amount,
      payment_method,
      items,
      anonymousId,
      status,
      delivery_type,
      delivery_info,
      recipient_name,
      recipient_phone
    } = req.body;

    console.log('--- ADD DONATION START ---'); // LOG

    // 1. Подготовка данных
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : (items || []);

    console.log('Parsed Items:', parsedItems); // LOG: Проверим, что пришло

    const donationData = {
      amount,
      payment_method,
      items: JSON.stringify(parsedItems),
      status: status || 'Ожидает проверки',
      delivery_type: delivery_type || 'pickup',
      delivery_info: delivery_info || {},
      recipient_name,
      recipient_phone
    };

    // Привязка пользователя
    if (req.user) {
      donationData.userId = req.user.id;
    } else if (req.anonymousId) {
      donationData.anonymousId = req.anonymousId;
    } else if (anonymousId) {
      donationData.anonymousId = anonymousId;
    } else {
      await t.rollback();
      return res.status(400).json({
        message: 'Требуется авторизация или анонимный ID',
      });
    }

    // 2. СПИСАНИЕ ОСТАТКОВ
    for (const item of parsedItems) {
      console.log(`Processing item: ${item.name}, variantId: ${item.variantId}`); // LOG

      if (item.variantId) {
        // ВАЖНО: Добавил { transaction: t } в findByPk
        const variant = await Variant.findByPk(item.variantId, {
          transaction: t,
          lock: t.LOCK.UPDATE // Блокируем строку для обновления (защита от гонки)
        });

        if (!variant) {
          throw new Error(`Вариант товара "${item.name}" (ID: ${item.variantId}) не найден`);
        }

        console.log(`Current quantity for variant ${variant.id}: ${variant.quantity}. Requested: ${item.quantity}`); // LOG

        if (variant.quantity < item.quantity) {
          throw new Error(`Недостаточно товара "${item.name}" на складе (доступно: ${variant.quantity})`);
        }

        // Уменьшаем количество
        await variant.decrement('quantity', { by: item.quantity, transaction: t });
        console.log(`Decremented quantity for variant ${variant.id}`); // LOG
      } else {
        console.warn(`Item "${item.name}" has no variantId! Skipping inventory check.`); // LOG
      }
    }

    // 3. Создание записи о заказе
    const donation = await Donation.create(donationData, { transaction: t });

    await t.commit();
    console.log('--- ADD DONATION SUCCESS ---'); // LOG
    res.status(201).json(donation);

  } catch (error) {
    await t.rollback();
    console.error('Ошибка при добавлении пожертвования:', error);
    res.status(500).json({ message: error.message || 'Ошибка сервера' });
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
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Форматируем данные перед отправкой (парсим items)
    const formattedDonations = donations.map((donation) => {
      const plainDonation = donation.get({ plain: true }); // Получаем чистый JS объект

      let parsedItems = [];
      try {
        // Если items уже объект (иногда sequelize делает это сам для JSON полей) или строка
        parsedItems = typeof plainDonation.items === 'string'
        ? JSON.parse(plainDonation.items)
        : plainDonation.items;
      } catch (e) {
        console.error(`Ошибка парсинга items для donation ${donation.id}:`, e);
      }

      return {
        ...plainDonation,
        items: parsedItems || [],
      };
    });

    res.json(formattedDonations);
  } catch (error) {
    console.error('Ошибка при получении данных для админки:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить статус пожертвования
const updateDonationStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status } = req.body;

    const donation = await Donation.findByPk(id, { transaction: t });
    if (!donation) {
      await t.rollback();
      return res.status(404).json({ message: 'Пожертвование не найдено' });
    }

    const oldStatus = donation.status;

    // Логика возврата товара
    // Если новый статус "Отклонено" И старый статус НЕ "Отклонено" -> Возвращаем товары
    if (status === 'Отклонено' && oldStatus !== 'Отклонено') {
      let items = [];
      try {
        items = typeof donation.items === 'string' ? JSON.parse(donation.items) : donation.items;
      } catch (e) {
        console.error('Ошибка парсинга items при возврате:', e);
      }

      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.variantId) {
            // Возвращаем количество обратно
            await Variant.increment('quantity', {
              by: item.quantity,
              where: { id: item.variantId },
              transaction: t
            });
          }
        }
      }
    }

    // Примечание: Если вы вдруг решите вернуть статус из "Отклонено" в "Ожидает проверки" или "Завершено",
    // по-хорошему нужно снова списывать товар. Но обычно поток идет только в одну сторону.
    // Если нужно, добавьте блок else if (oldStatus === 'Отклонено' && status !== 'Отклонено') { ...decrement... }

    await donation.update({ status }, { transaction: t });

    await t.commit();
    res.json({ message: 'Статус обновлен', donation });
  } catch (error) {
    await t.rollback();
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
