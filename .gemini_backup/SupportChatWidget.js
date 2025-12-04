import React, { useState, useEffect, useRef, useCallback } from 'react';
// Убрал неиспользуемую иконку MdOutlineEmail
import { MdChat, MdClose, MdSend, MdSupportAgent } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function SupportChatWidget() {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState('');
    const [isSending, setIsSending] = useState(false);

    const [contactInfo, setContactInfo] = useState({ name: '', email: '' });
    const [showContactForm, setShowContactForm] = useState(false);

    const messagesEndRef = useRef(null);

    // Оборачиваем в useCallback, чтобы ссылка на функцию не менялась
    const getSessionId = useCallback(() => {
        let sid = localStorage.getItem('chatSessionId');
        if (!sid) {
            sid = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('chatSessionId', sid);
        }
        return sid;
    }, []);

    // Оборачиваем в useCallback и добавляем зависимости
    const loadHistory = useCallback(async () => {
        try {
            const sid = getSessionId();
            const response = await api.get(`/contact/my-history?sessionId=${sid}`);
            setMessages(response.data);

            if (response.data.length === 0 && !isAuthenticated) {
                setShowContactForm(true);
            } else {
                setShowContactForm(false);
            }
        } catch (err) {
            console.error(err);
        }
    }, [isAuthenticated, getSessionId]); // Зависит от статуса авторизации

    // Теперь безопасно добавляем loadHistory в зависимости
    useEffect(() => {
        if (isOpen) {
            loadHistory();
            const interval = setInterval(loadHistory, 15000);
            return () => clearInterval(interval);
        }
    }, [isOpen, loadHistory]);

    // Скролл вниз
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen, showContactForm]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputMsg.trim()) return;

        if (!isAuthenticated && (!contactInfo.name || !contactInfo.email)) {
            return;
        }

        setIsSending(true);
        try {
            const payload = {
                message: inputMsg,
                sessionId: getSessionId(),
                name: user?.name || contactInfo.name,
                email: user?.email || contactInfo.email,
            };

            await api.post('/contact', payload);
            setInputMsg('');
            loadHistory();
        } catch (err) {
            console.error('Ошибка отправки:', err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="support-chat-widget">
            <button
                className={`chat-widget-btn support-chat-widget__toggle ${isOpen ? 'chat-widget-btn--hidden' : ''}`}
                onClick={() => setIsOpen(true)}
                title="Чат с поддержкой"
            >
                <MdChat />
            </button>

            <div className={`chat-window ${isOpen ? 'chat-window--open' : ''}`}>
                <div className="chat-window__header">
                    <div className="chat-window__title">
                        <MdSupportAgent /> Поддержка
                    </div>
                    <button className="chat-window__close" onClick={() => setIsOpen(false)}>
                        <MdClose />
                    </button>
                </div>

                <div className="chat-window__body">
                    {showContactForm && !isAuthenticated && (
                        <div className="chat-intro-form">
                            <p>Представьтесь, чтобы мы могли ответить вам на почту, если вы уйдете с сайта.</p>
                            <input
                                className="chat-input"
                                placeholder="Ваше имя"
                                value={contactInfo.name}
                                onChange={e => setContactInfo({ ...contactInfo, name: e.target.value })}
                            />
                            <input
                                className="chat-input"
                                placeholder="Email"
                                value={contactInfo.email}
                                onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                            />
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        // Логика группировки ответов админа
                        const isNextMsgSameReply =
                            index < messages.length - 1 &&
                            messages[index + 1].status === 'REPLIED' &&
                            messages[index + 1].reply_date === msg.reply_date;

                        const shouldShowReply = msg.status === 'REPLIED' && msg.admin_reply && !isNextMsgSameReply;

                        return (
                            <div key={msg.id} className="chat-message-group">
                                <div className="chat-message chat-message--user">
                                    <div className="chat-message__text">{msg.message}</div>
                                    <div className="chat-message__time">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {shouldShowReply && (
                                    <div className="chat-message chat-message--admin">
                                        <div className="chat-message__avatar"><MdSupportAgent /></div>
                                        <div className="chat-message__content">
                                            <div className="chat-message__text">{msg.admin_reply}</div>
                                            <div className="chat-message__time">
                                                {new Date(msg.reply_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {!showContactForm && messages.length === 0 && (
                        <div className="chat-empty-state">
                            Напишите нам, мы ответим здесь и на почту!
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-window__footer">
                    <form onSubmit={handleSend} className="chat-send-form">
                        <input
                            className="chat-send-input"
                            placeholder="Введите сообщение..."
                            value={inputMsg}
                            onChange={e => setInputMsg(e.target.value)}
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            className="chat-send-btn"
                            disabled={isSending || (!isAuthenticated && (!contactInfo.name || !contactInfo.email))}
                        >
                            <MdSend />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SupportChatWidget;
