import React, { useState, useEffect } from 'react';
// Убрали лишние импорты MdEmail и MdCheckCircle
import { MdRefresh, MdSearch, MdChatBubbleOutline, MdClose } from 'react-icons/md';
import api from '../../services/api';

function AdminMessages() {
    const [rawMessages, setRawMessages] = useState([]);
    const [groupedDialogs, setGroupedDialogs] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Модалка
    const [selectedDialog, setSelectedDialog] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/contact');
            setRawMessages(response.data);
        } catch (err) {
            setError('Не удалось загрузить сообщения');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    // --- ГРУППИРОВКА СООБЩЕНИЙ ---
    useEffect(() => {
        if (!rawMessages.length) {
            setGroupedDialogs([]);
            return;
        }

        const groups = {};

        rawMessages.forEach(msg => {
            const key = msg.userId ? `uid_${msg.userId}` : (msg.sessionId ? `sid_${msg.sessionId}` : `email_${msg.email}`);

            if (!groups[key]) {
                groups[key] = {
                    key,
                    user: { name: msg.name, email: msg.email, userId: msg.userId, sessionId: msg.sessionId },
                    messages: [],
                    hasNew: false,
                    lastDate: msg.createdAt
                };
            }

            groups[key].messages.push(msg);

            if (new Date(msg.createdAt) > new Date(groups[key].lastDate)) {
                groups[key].lastDate = msg.createdAt;
            }

            if (msg.status === 'NEW') {
                groups[key].hasNew = true;
            }
        });

        const dialogsArray = Object.values(groups).sort((a, b) => {
            if (a.hasNew !== b.hasNew) return a.hasNew ? -1 : 1;
            return new Date(b.lastDate) - new Date(a.lastDate);
        });

        setGroupedDialogs(dialogsArray);

    }, [rawMessages]);


    // Открытие диалога
    const handleOpenDialog = (dialog) => {
        const sortedMsgs = [...dialog.messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        setSelectedDialog({ ...dialog, messages: sortedMsgs });
        setReplyText('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDialog(null);
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return alert('Введите текст');

        setIsSending(true);
        try {
            const { userId, sessionId, email } = selectedDialog.user;

            await api.post('/contact/reply-group', {
                userId,
                sessionId,
                email,
                replyText
            });

            alert('Ответ отправлен!');
            loadMessages();
            closeModal();
        } catch (err) {
            alert('Ошибка: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSending(false);
        }
    };

    // Фильтрация
    const filteredDialogs = groupedDialogs.filter(dialog => {
        const matchesSearch = dialog.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dialog.user.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all'
        ? true
        : (filterStatus === 'NEW' ? dialog.hasNew : !dialog.hasNew);

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="loading">Загрузка...</div>;
    // Используем error, чтобы он не висел в предупреждениях
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="admin-panel">
        <div className="admin-header">
        <h2>Диалоги поддержки</h2>
        <button onClick={loadMessages} className="btn refresh-btn"><MdRefresh /> Обновить</button>
        </div>

        <div className="admin-filters">
        <div className="search-box">
        <MdSearch className="search-icon" />
        <input placeholder="Поиск..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="status-filter">
        <option value="all">Все диалоги</option>
        <option value="NEW">Требуют ответа</option>
        <option value="REPLIED">Завершенные</option>
        </select>
        </div>

        <div className="donations-table-container">
        <table className="donations-table">
        <thead>
        <tr>
        <th>Пользователь</th>
        <th>Email</th>
        <th>Сообщений</th>
        <th>Последнее</th>
        <th>Статус</th>
        <th>Действие</th>
        </tr>
        </thead>
        <tbody>
        {filteredDialogs.map((dialog) => (
            <tr key={dialog.key}>
            <td>
            <strong>{dialog.user.name}</strong>
            {dialog.user.userId && <span style={{fontSize:'0.8em', color:'#666', marginLeft:'5px'}}>(ID: {dialog.user.userId})</span>}
            </td>
            <td>{dialog.user.email}</td>
            <td>
            <div style={{display:'flex', gap:'5px'}}>
            <span className="badge-count">{dialog.messages.length} всего</span>
            {dialog.hasNew && <span className="badge-count badge-new">Есть новые</span>}
            </div>
            </td>
            <td>{new Date(dialog.lastDate).toLocaleString('ru-RU')}</td>
            <td>
            <span className={`status-badge ${dialog.hasNew ? 'status-new' : 'status-replied'}`}>
            {dialog.hasNew ? 'Ждет ответа' : 'Закрыт'}
            </span>
            </td>
            <td>
            <button className="btn-circle action-view" onClick={() => handleOpenDialog(dialog)}>
            <MdChatBubbleOutline />
            </button>
            </td>
            </tr>
        ))}
        </tbody>
        </table>
        {filteredDialogs.length === 0 && <div className="no-data">Диалогов нет</div>}
        </div>

        {/* МОДАЛКА ЧАТА (Используем классы из modal.css, который мы создали ранее) */}
        {showModal && selectedDialog && (
            <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight: '80vh', maxWidth: '600px' }}>
            <div className="modal-header">
            <h3>Чат с {selectedDialog.user.name}</h3>
            <button className="close-btn" onClick={closeModal}><MdClose /></button>
            </div>

            {/* Тело чата */}
            <div className="modal-body" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '400px' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f5f5f5' }}>
            {selectedDialog.messages.map(msg => (
                <div key={msg.id} style={{ marginBottom: '15px' }}>
                {/* Сообщение юзера */}
                <div style={{
                    background: 'white', padding: '10px 15px', borderRadius: '12px 12px 12px 0',
                    maxWidth: '85%', marginBottom: '5px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                <div style={{fontWeight:'600', fontSize:'0.85rem', color:'#8d1f2c'}}>{msg.name}</div>
                <div style={{whiteSpace: 'pre-wrap', lineHeight: '1.4'}}>{msg.message}</div>
                <div style={{fontSize:'0.7rem', color:'#999', textAlign:'right', marginTop: '4px'}}>
                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                </div>

                {/* Ответ админа */}
                {msg.status === 'REPLIED' && msg.admin_reply && (
                    <div style={{
                        background: '#e8f5e9', padding: '10px 15px', borderRadius: '12px 12px 0 12px',
                        maxWidth: '85%', marginLeft: 'auto', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                    <div style={{fontWeight:'600', fontSize:'0.85rem', color:'#2e7d32'}}>Вы (Админ)</div>
                    <div style={{whiteSpace: 'pre-wrap', lineHeight: '1.4'}}>{msg.admin_reply}</div>
                    <div style={{fontSize:'0.7rem', color:'#999', textAlign:'right', marginTop: '4px'}}>
                    {msg.reply_date ? new Date(msg.reply_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </div>
                    </div>
                )}
                </div>
            ))}
            </div>

            {/* Футер */}
            <div className="modal-footer" style={{ borderTop: '1px solid #ddd', padding: '15px', background: 'white' }}>
            <textarea
            style={{ width: '100%', minHeight: '60px', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '10px', resize: 'vertical' }}
            placeholder="Напишите ответ..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button className="btn-text btn-close" onClick={closeModal}>Закрыть</button>
            <button className="btn-text btn-approve" onClick={handleSendReply} disabled={isSending}>
            {isSending ? 'Отправка...' : 'Отправить ответ'}
            </button>
            </div>
            </div>
            </div>
            </div>
            </div>
        )}
        </div>
    );
}

export default AdminMessages;
