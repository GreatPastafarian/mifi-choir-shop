import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// (ИЗМЕНЕНИЕ) Импортируем иконки
import { MdOutlineStore, MdOutlineMonetizationOn, MdOutlineCategory } from 'react-icons/md';

function AdminDashboard() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="admin-dashboard__access-denied container">
      <h1>Доступ запрещен</h1>
      <p>У вас нет прав доступа к админ-панели.</p>
      <Link to="/" className="btn primary admin-dashboard__home-link">
      Вернуться на главную
      </Link>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
    <div className="container">
    <h1>Панель управления</h1>

    <div className="admin-dashboard__grid">

    {/* (ИЗМЕНЕНИЕ) Карточка 1: Товары (с классом-модификатором) */}
    <Link
    to="/admin/products"
    className="admin-dashboard__card admin-dashboard__card--products"
    >
    <MdOutlineStore className="admin-dashboard__card-icon" />
    <h2 className="admin-dashboard__card-title">Управление товарами</h2>
    <p className="admin-dashboard__card-description">
    Добавляйте, редактируйте и удаляйте товары
    </p>
    </Link>

    {/* (ИЗМЕНЕНИЕ) Карточка 2: Пожертвования (с классом-модификатором) */}
    <Link
    to="/admin/donations"
    className="admin-dashboard__card admin-dashboard__card--donations"
    >
    <MdOutlineMonetizationOn className="admin-dashboard__card-icon" />
    <h2 className="admin-dashboard__card-title">Управление пожертвованиями</h2>
    <p className="admin-dashboard__card-description">
    Проверяйте и одобряйте пожертвования
    </p>
    </Link>

    {/* (ИЗМЕНЕНИЕ) Карточка 3: Категории (с классом-модификатором) */}
    <Link
    to="/admin/categories"
    className="admin-dashboard__card admin-dashboard__card--categories"
    >
    <MdOutlineCategory className="admin-dashboard__card-icon" />
    <h2 className="admin-dashboard__card-title">Управление категориями</h2>
    <p className="admin-dashboard__card-description">
    Создавайте и редактируйте категории товаров
    </p>
    </Link>

    </div>
    </div>
    </div>
  );
}

export default AdminDashboard;
