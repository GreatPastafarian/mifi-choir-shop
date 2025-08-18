import React, { useState } from 'react';
import { MdPerson, MdShoppingCart, MdSettings } from 'react-icons/md';

function AccountPage() {
    const [activeTab, setActiveTab] = useState('profile');

    // Данные пользователя (в реальном приложении это приходило бы из API)
    const user = {
        name: "Иван Иванов",
        email: "ivan@example.com",
        phone: "+7 (999) 123-45-67",
        joined: "15 марта 2022"
    };

    // Пример истории пожертвований
    const donations = [
        { id: 1, date: "12.05.2023", amount: 3500, status: "Завершено", items: ["Футболка", "Концертный диск"] },
        { id: 2, date: "03.04.2023", amount: 1500, status: "Завершено", items: ["Значок хора"] },
        { id: 3, date: "18.02.2023", amount: 2800, status: "Завершено", items: ["Термокружка", "Значок хора"] }
    ];

    return (
        <div className="container">
        <h1>Личный кабинет</h1>

        <div className="account-container" style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="account-sidebar">
        <div className="account-user">
        <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
        }}>
        <MdPerson size={40} color="#8d1f2c" />
        </div>
        <h2>{user.name}</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Дата регистрации: {user.joined}</p>
        </div>

        <div className="account-menu">
        <button
        className={`account-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
        >
        <MdPerson /> Личные данные
        </button>
        <button
        className={`account-menu-item ${activeTab === 'donations' ? 'active' : ''}`}
        onClick={() => setActiveTab('donations')}
        >
        <MdShoppingCart /> История пожертвований
        </button>
        <button
        className={`account-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => setActiveTab('settings')}
        >
        <MdSettings /> Настройки
        </button>
        </div>
        </div>

        <div className="account-content">
        {activeTab === 'profile' && (
            <div className="account-profile">
            <h2>Личные данные</h2>
            <div className="form-group">
            <label>Имя</label>
            <input type="text" value={user.name} readOnly />
            </div>
            <div className="form-group">
            <label>Email</label>
            <input type="email" value={user.email} readOnly />
            </div>
            <div className="form-group">
            <label>Телефон</label>
            <input type="tel" value={user.phone} readOnly />
            </div>
            <div className="form-group">
            <label>Дата регистрации</label>
            <input type="text" value={user.joined} readOnly />
            </div>
            <button className="btn secondary">Редактировать данные</button>
            </div>
        )}

        {activeTab === 'donations' && (
            <div className="account-donations">
            <h2>История пожертвований</h2>
            {donations.length === 0 ? (
                <p>У вас пока нет истории пожертвований</p>
            ) : (
                <div className="donations-list">
                {donations.map(donation => (
                    <div key={donation.id} className="donation-item" style={{
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span><strong>Дата:</strong> {donation.date}</span>
                    <span style={{
                        backgroundColor: donation.status === 'Завершено' ? '#e8f5e9' : '#fff8e1',
                        color: donation.status === 'Завершено' ? '#388e3c' : '#e65100',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem'
                    }}>
                    {donation.status}
                    </span>
                    </div>
                    <p><strong>Сумма:</strong> {donation.amount} ₽</p>
                    <p><strong>Вознаграждения:</strong> {donation.items.join(', ')}</p>
                    </div>
                ))}
                </div>
            )}
            </div>
        )}

        {activeTab === 'settings' && (
            <div className="account-settings">
            <h2>Настройки</h2>
            <div className="form-group">
            <label>
            <input type="checkbox" defaultChecked /> Получать уведомления о новых вознаграждениях
            </label>
            </div>
            <div className="form-group">
            <label>
            <input type="checkbox" defaultChecked /> Получать информацию о концертах
            </label>
            </div>
            <div className="form-group">
            <label>
            <input type="checkbox" /> Получать персональные предложения
            </label>
            </div>
            <button className="btn primary">Сохранить настройки</button>
            </div>
        )}
        </div>
        </div>
        </div>
    );
}

export default AccountPage;
