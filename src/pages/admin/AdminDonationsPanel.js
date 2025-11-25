import React, { useState, useEffect } from 'react';
import { MdRefresh, MdCheckCircle, MdCancel, MdSearch, MdVisibility, MdClose } from 'react-icons/md';
import api from '../../services/api';

function AdminDonationsPanel() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/admin/donations');
      setDonations(response.data);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      if (err.response?.status === 403) {
        setError('Доступ запрещен. Требуются права администратора');
      } else if (err.response?.status === 401) {
        setError('Пожалуйста, войдите в систему');
      } else {
        setError('Ошибка загрузки данных');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const updateStatus = async (donationId, newStatus) => {
    const action = newStatus === 'Завершено' ? 'подтвердить' : 'отклонить';
    if (!window.confirm(`Вы уверены, что хотите ${action} заказ?`)) return;

    try {
      await api.patch(`/users/admin/donations/${donationId}/status`, {
        status: newStatus,
      });
      setDonations((prev) =>
      prev.map((donation) => (donation.id === donationId ? { ...donation, status: newStatus } : donation))
      );

      if (selectedDonation && selectedDonation.id === donationId) {
        setSelectedDonation(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Ошибка обновления статуса');
      console.error('Ошибка:', err);
    }
  };

  const handleViewDetails = (donation) => {
    setSelectedDonation(donation);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDonation(null);
  };

  const safeParseItems = (items) => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') {
      try {
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Ошибка парсинга items:", e);
        return [];
      }
    }
    return [];
  };

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
    searchTerm === '' ||
    donation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (donation.user && donation.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  const modalItems = selectedDonation ? safeParseItems(selectedDonation.items) : [];

  return (
    <div className="admin-panel">
    <div className="admin-header">
    <h2>Управление заказами</h2>
    <button onClick={loadDonations} className="btn refresh-btn">
    <MdRefresh /> Обновить
    </button>
    </div>

    <div className="admin-filters">
    <div className="search-box">
    <MdSearch className="search-icon" />
    <input
    type="text"
    placeholder="Поиск по ID или email..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    />
    </div>
    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="status-filter">
    <option value="all">Все статусы</option>
    <option value="Ожидает проверки">Ожидает проверки</option>
    <option value="Завершено">Завершено</option>
    <option value="Отклонено">Отклонено</option>
    </select>
    </div>

    <div className="donations-table-container">
    <table className="donations-table">
    <thead>
    <tr>
    <th>ID</th>
    <th>Дата</th>
    <th>Пользователь</th>
    <th>Сумма</th>
    <th>Статус</th>
    <th>Действия</th>
    </tr>
    </thead>
    <tbody>
    {filteredDonations.map((donation) => (
      <tr key={donation.id}>
      <td className="donation-id" title={donation.id}>{donation.id.substring(0, 8)}...</td>
      <td className="donation-date">{new Date(donation.createdAt).toLocaleDateString('ru-RU')}</td>
      <td className="donation-user">{donation.user ? donation.user.email : 'Аноним'}</td>
      <td className="donation-amount">{donation.amount} ₽</td>
      <td className="donation-status">
      <span className={`status-badge ${donation.status.toLowerCase().replace(/\s+/g, '-')}`}>
      {donation.status}
      </span>
      </td>
      <td className="donation-actions">
      <button
      className="btn-circle action-view"
      onClick={() => handleViewDetails(donation)}
      title="Просмотреть детали"
      >
      <MdVisibility />
      </button>

      {donation.status === 'Ожидает проверки' && (
        <>
        <button
        onClick={() => updateStatus(donation.id, 'Завершено')}
        className="btn-circle action-approve"
        title="Подтвердить"
        >
        <MdCheckCircle />
        </button>
        <button
        onClick={() => updateStatus(donation.id, 'Отклонено')}
        className="btn-circle action-reject"
        title="Отклонить"
        >
        <MdCancel />
        </button>
        </>
      )}
      </td>
      </tr>
    ))}
    </tbody>
    </table>
    {filteredDonations.length === 0 && (
      <div className="no-data">Нет данных по выбранным фильтрам</div>
    )}
    </div>

    {/* --- МОДАЛЬНОЕ ОКНО --- */}
    {showModal && selectedDonation && (
      <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
      <h3>Детали заказа</h3>
      <button className="close-btn" onClick={closeModal}><MdClose /></button>
      </div>

      <div className="modal-body">
      <div className="detail-row">
      <strong>ID заказа:</strong> <span className="donation-id">{selectedDonation.id}</span>
      </div>
      <div className="detail-row">
      <strong>Статус:</strong>
      <span className={`status-badge ${selectedDonation.status.toLowerCase().replace(/\s+/g, '-')}`}>
      {selectedDonation.status}
      </span>
      </div>

      <div className="detail-section">
      <h4>Информация о получателе</h4>
      <p><strong>Имя:</strong> {selectedDonation.recipient_name || (selectedDonation.user && selectedDonation.user.name) || '-'}</p>
      <p><strong>Телефон:</strong> {selectedDonation.recipient_phone || (selectedDonation.user && selectedDonation.user.phone) || '-'}</p>
      <p><strong>Email:</strong> {(selectedDonation.user && selectedDonation.user.email) || '-'}</p>
      </div>

      <div className="detail-section">
      <h4>Способ получения: {selectedDonation.delivery_type === 'pickup' ? 'Самовывоз' : 'Курьер'}</h4>
      {selectedDonation.delivery_type === 'delivery' && selectedDonation.delivery_info ? (
        <div className="address-box">
        <p><strong>Город:</strong> {selectedDonation.delivery_info.city}</p>
        <p><strong>Улица:</strong> {selectedDonation.delivery_info.street}</p>
        <p><strong>Дом:</strong> {selectedDonation.delivery_info.building}, <strong>Кв:</strong> {selectedDonation.delivery_info.flat || '-'}</p>
        <p><strong>Индекс:</strong> {selectedDonation.delivery_info.zip || '-'}</p>
        </div>
      ) : (
        <p>Адрес выдачи: Москва, Каширское ш., 31 (НИЯУ МИФИ)</p>
      )}
      </div>

      <div className="detail-section">
      <h4>Состав заказа</h4>
      <ul className="items-list">
      {modalItems.length > 0 ? (
        modalItems.map((item, idx) => (
          <li key={idx} className="order-item">
          <div>
          <span>{item.name}</span>
          {item.sku && <span className="item-sku"> (Арт: {item.sku})</span>}
          {item.attributes && Object.keys(item.attributes).length > 0 && (
            <div style={{fontSize: '0.85rem', color: '#666', marginTop: '4px'}}>
            {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
            </div>
          )}
          </div>
          <span className="item-qty-price">{item.quantity} шт. × {item.price} ₽</span>
          </li>
        ))
      ) : (
        <li>Нет товаров или ошибка данных</li>
      )}
      </ul>
      <div className="total-row">
      <span>Итого к оплате:</span>
      <span>{selectedDonation.amount} ₽</span>
      </div>
      </div>

      {selectedDonation.comment && (
        <div className="detail-section">
        <h4>Комментарий к заказу</h4>
        <p style={{fontStyle: 'italic', color: '#555', background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #eee'}}>
        "{selectedDonation.comment}"
        </p>
        </div>
      )}
      </div>

      <div className="modal-footer">
      {selectedDonation.status === 'Ожидает проверки' && (
        <>
        <button onClick={() => updateStatus(selectedDonation.id, 'Завершено')} className="btn-text btn-approve">
        Подтвердить заказ
        </button>
        <button onClick={() => updateStatus(selectedDonation.id, 'Отклонено')} className="btn-text btn-reject">
        Отклонить
        </button>
        </>
      )}
      <button onClick={closeModal} className="btn-text btn-close">Закрыть</button>
      </div>
      </div>
      </div>
    )}
    </div>
  );
}

export default AdminDonationsPanel;
