const nodemailer = require('nodemailer');
const { ContactMessage } = require('../models');
const { Op } = require('sequelize');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// 1. Отправка сообщения (Чат)
exports.createMessage = async (req, res) => {
    try {
        const { name, email, message, sessionId } = req.body;
        // Если пользователь авторизован, берем его ID из токена
        const userId = req.user ? req.user.id : null;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Все поля обязательны' });
        }

        // Сохраняем в БД с привязкой
        await ContactMessage.create({
            name,
            email,
            message,
            status: 'NEW',
            userId,
            sessionId,
        });

        // Уведомление админу
        const mailOptions = {
            from: `"Чат поддержки" <${process.env.SMTP_USER}>`,
            to: 'choir.mephi.donate@gmail.com',
            subject: `Сообщение от ${name}`,
            html: `
            <h3>Новое сообщение в чате</h3>
            <p><strong>От:</strong> ${name} (${email})</p>
            <p><strong>Сообщение:</strong></p>
            <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
            ${message.replace(/\n/g, '<br>')}
            </blockquote>
            <p style="color: #888; font-size: 12px;">Ответьте через админ-панель, и пользователь получит ответ в чате и на почту.</p>
            `,
        };

        // Не блокируем ответ клиенту, но логируем ошибку
        transporter.sendMail(mailOptions).catch(err => {
            console.error('Ошибка отправки уведомления админу:', err);
            // Можно добавить логирование в файл или мониторинг
        });

        res.status(201).json({ success: true, message: 'Отправлено' });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
};

// 2. Получить историю чата (для Виджета)
exports.getUserMessages = async (req, res) => {
    try {
        const { sessionId } = req.query;
        const userId = req.user ? req.user.id : null;

        const whereClause = [];

        // Ищем сообщения либо по ID пользователя, либо по ID сессии
        if (userId) whereClause.push({ userId });
        if (sessionId) whereClause.push({ sessionId });

        if (whereClause.length === 0) {
            return res.json([]);
        }

        const messages = await ContactMessage.findAll({
            where: {
                [Op.or]: whereClause
            },
            order: [['created_at', 'ASC']], // Старые сверху (хронология)
        });

        res.json(messages);
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ message: 'Ошибка загрузки истории' });
    }
};

// 3. Слияние анонимной истории при входе
exports.mergeAnonymousMessages = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const userId = req.user.id;

        if (!sessionId) return res.status(400).json({ message: 'No session ID' });

        // Находим все сообщения этой сессии без владельца и присваиваем их текущему юзеру
        await ContactMessage.update(
            { userId },
            { where: { sessionId, userId: null } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Merge error:', error);
        res.status(500).json({ message: 'Ошибка объединения' });
    }
};

// 4. Админские методы (оставляем как было)
exports.getAllMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.findAll({ order: [['created_at', 'DESC']] });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.replyToUser = async (req, res) => {
    // Принимаем не ID сообщения, а идентификаторы юзера
    const { userId, sessionId, email, replyText } = req.body;

    if (!replyText) return res.status(400).json({ message: 'Текст ответа обязателен' });
    if (!email) return res.status(400).json({ message: 'Email обязателен' });

    try {
        // 1. Формируем условие поиска всех НЕОТВЕЧЕННЫХ сообщений этого человека
        const whereClause = {
            status: 'NEW',
            [Op.or]: []
        };

        if (userId) whereClause[Op.or].push({ userId });
        if (sessionId) whereClause[Op.or].push({ sessionId });
        // Fallback: если юзер не авторизован и сессия потерялась, ищем по email
        if (whereClause[Op.or].length === 0) {
            whereClause[Op.or].push({ email });
        }

        // 2. Отправляем ОДНО письмо на Email
        const mailOptions = {
            from: `"Хор МИФИ" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Ответ службы поддержки`,
            html: `
            <h3>Здравствуйте!</h3>
            <p>Мы получили ваши сообщения.</p>
            <hr />
            <p><strong>Наш ответ:</strong></p>
            <p style="font-size: 16px;">${replyText.replace(/\n/g, '<br>')}</p>
            <br />
            <p style="font-size: 12px; color: #777;">С уважением,<br/>Мужской хор МИФИ</p>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Ошибка отправки email при ответе:', emailError);
            return res.status(500).json({
                message: 'Ошибка отправки email. Проверьте настройки SMTP.',
                error: emailError.message
            });
        }

        // 3. Помечаем ВСЕ старые сообщения как отвеченные
        // Мы записываем текст ответа в последнее сообщение, или во все (для истории)
        await ContactMessage.update(
            {
                status: 'REPLIED',
                admin_reply: replyText, // Можно сохранить ответ, чтобы видеть его в истории
                reply_date: new Date(),
            },
            { where: whereClause }
        );

        res.json({ success: true, message: 'Ответ отправлен, диалог обновлен' });

    } catch (error) {
        console.error('Reply error:', error);
        res.status(500).json({ message: 'Ошибка сервера при ответе' });
    }
};
