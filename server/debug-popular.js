const { Product, Donation, sequelize } = require('./models');

async function checkPopularity() {
    try {
        console.log('📡 Подключение к базе данных...');
        await sequelize.authenticate();
        console.log('✅ Подключено.');

        // 1. Получаем все активные товары
        const products = await Product.findAll({
            where: { is_active: true },
            attributes: ['id', 'name', 'views_count'] // Нам нужны только эти поля
        });
        console.log(`📦 Найдено активных товаров: ${products.length}`);

        // 2. Получаем завершенные донаты
        // ВАЖНО: Проверяем именно статус 'Завершено', как в контроллере
        const donations = await Donation.findAll({
            where: { status: 'Завершено' }
        });
        console.log(`💰 Найдено завершенных донатов: ${donations.length}`);

        // 3. Считаем продажи (1-в-1 логика из контроллера)
        const salesCount = {};

        donations.forEach(donation => {
            let items = [];
            try {
                // Пытаемся распарсить items
                items = typeof donation.items === 'string'
                ? JSON.parse(donation.items)
                : (donation.items || []);
            } catch (e) {
                console.error(`⚠️ Ошибка в донате ID ${donation.id}: неверный формат items`);
            }

            if (Array.isArray(items)) {
                items.forEach(item => {
                    // В CheckoutPage мы сохраняем id товара как 'productId'
                    const pId = item.productId;
                    if (pId) {
                        salesCount[pId] = (salesCount[pId] || 0) + (item.quantity || 0);
                    }
                });
            }
        });

        // 4. Формируем итоговую таблицу
        const report = products.map(p => {
            const sales = salesCount[p.id] || 0;
            const views = p.views_count || 0;
            return {
                ID: p.id,
                Название: p.name,
                'Продажи (шт)': sales,
                                    'Просмотры': views,
                                    // Для наглядности покажем общий "вес" сортировки
                                    'Приоритет': `1. Продажи (${sales}), 2. Просмотры (${views})`
            };
        });

        // 5. Сортируем так же, как в контроллере
        report.sort((a, b) => {
            // Сначала по продажам
            if (b['Продажи (шт)'] !== a['Продажи (шт)']) {
                return b['Продажи (шт)'] - a['Продажи (шт)'];
            }
            // Потом по просмотрам
            return b['Просмотры'] - a['Просмотры'];
        });

        // Вывод
        console.log('\n📊 РЕЗУЛЬТАТ СОРТИРОВКИ (ТОП ПОПУЛЯРНЫХ):');
        console.table(report);

    } catch (err) {
        console.error('❌ Ошибка:', err);
    } finally {
        await sequelize.close();
    }
}

checkPopularity();
