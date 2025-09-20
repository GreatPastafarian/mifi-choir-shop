import React, { useState, useEffect } from 'react';
import { MdRefresh, MdCheckCircle, MdSearch } from 'react-icons/md';
import api from '../../services/api';
import '../../styles/components/admin-panel.css';

function AdminDonationsPanel() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadDonations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/admin/donations');
      setDonations(response.data);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);

      // Добавляем более информативные сообщения об ошибках
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
    try {
      await api.patch(`/users/admin/donations/${donationId}/status`, {
        status: newStatus,
      });

      // Обновляем локальное состояние
      setDonations((prev) =>
        prev.map((donation) => (donation.id === donationId ? { ...donation, status: newStatus } : donation))
      );
    } catch (err) {
      setError('Ошибка обновления статуса');
      console.error('Ошибка:', err);
    }
  };

  // Фильтрация и поиск
  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      searchTerm === '' ||
      donation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donation.User && donation.User.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Панель управления пожертвованиями</h2>
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
                <td className="donation-id">{donation.id}</td>
                <td className="donation-date">{new Date(donation.createdAt).toLocaleDateString('ru-RU')}</td>
                <td className="donation-user">{donation.User ? donation.User.email : 'Аноним'}</td>
                <td className="donation-amount">{donation.amount} ₽</td>
                <td className="donation-status">
                  <span className={`status-badge ${donation.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {donation.status}
                  </span>
                </td>
                <td className="donation-actions">
                  {donation.status === 'Ожидает проверки' && (
                    <>
                      <button
                        onClick={() => updateStatus(donation.id, 'Завершено')}
                        className="btn success-btn"
                        title="Подтвердить пожертвование"
                      >
                        <MdCheckCircle /> Подтвердить
                      </button>
                      <button
                        onClick={() => updateStatus(donation.id, 'Отклонено')}
                        className="btn danger-btn"
                        title="Отклонить пожертвование"
                      >
                        Отклонить
                      </button>
                    </>
                  )}
                  {donation.status !== 'Ожидает проверки' && <span className="no-actions">Действий не требуется</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDonations.length === 0 && (
          <div className="no-data">
            {searchTerm || filterStatus !== 'all'
              ? 'Нет данных по выбранным фильтрам'
              : 'Нет пожертвований для отображения'}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDonationsPanel;
