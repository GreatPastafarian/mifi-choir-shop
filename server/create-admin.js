const bcrypt = require('bcryptjs');
const { User, sequelize } = require('./models');

require('dotenv').config({ path: '.env' });

async function createAdmin() {
  try {
    // Сначала синхронизируем структуру базы данных
    console.log('Синхронизация структуры базы данных...');
    await sequelize.sync();
    console.log('Структура базы данных синхронизирована успешно');

    // Проверяем, существует ли уже администратор
    const existingAdmin = await User.findOne({
      where: { email: 'admin@example.com' },
    });

    if (existingAdmin) {
      console.log('Администратор уже существует');
      process.exit(0);
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Создаем администратора
    const admin = await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    });

    console.log('Администратор успешно создан!');
    console.log('Email: admin_sample@example.com');
    console.log('Пароль: Malyavina_1987');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
    process.exit(1);
  }
}

createAdmin();
