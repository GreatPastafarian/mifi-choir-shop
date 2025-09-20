import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import Products from './pages/admin/Products';
import ProductEdit from './pages/admin/ProductEdit';
import AdminDonationsPanel from './components/auth/AdminDonationsPanel';
import ContactsPage from './pages/ContactsPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/layout/ScrollToTop';
import CategoryPage from './pages/CategoryPage';
import FavoritesPage from './pages/FavoritesPage';

// Создаем обертку для ProductDetailsPage
const ProductDetailsPageWrapper = ({ addToCart }) => {
  const { toggleFavorite, favorites } = useAuth();
  return <ProductDetailsPage addToCart={addToCart} toggleFavorite={toggleFavorite} favorites={favorites} />;
};

// Защищенный маршрут для администратора
const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Сохраняем текущий путь для перенаправления после входа
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: location.pathname },
        replace: true,
      });
    } else if (user && user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate, location]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div className="spinner">
          <div className="spinner-ring"></div>
        </div>
      </div>
    );
  }

  return children;
};

// Защищенный маршрут для авторизованных пользователей
const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Сохраняем текущий путь для перенаправления после входа
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [isAuthenticated, loading, navigate, location]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div className="spinner">
          <div className="spinner-ring"></div>
        </div>
      </div>
    );
  }

  return children;
};

// Компонент для обработки несуществующих маршрутов
const NotFoundRoute = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn(`Страница не найдена: ${location.pathname}`);
  }, [location]);

  return <Navigate to="/404" replace />;
};

// Основной контент приложения
const AppContent = () => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('choirCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Нормализуем данные из localStorage
        return parsedCart.map((item) => ({
          ...item,
          // Используем base_price если доступен, иначе price
          price: item.price !== undefined ? item.price : item.base_price,
        }));
      } catch (e) {
        console.error('Ошибка парсинга корзины:', e);
        return [];
      }
    }
    return [];
  });

  const { favorites } = useAuth(); // Теперь это безопасно, потому что мы внутри AuthProvider

  useEffect(() => {
    // Нормализуем данные перед сохранением
    const normalizedCart = cart.map((item) => ({
      ...item,
      // Сохраняем price для совместимости
      price: item.price,
    }));
    localStorage.setItem('choirCart', JSON.stringify(normalizedCart));
  }, [cart]);

  const addToCart = (product) => {
    // Используем base_price если доступен, иначе price
    const price = product.base_price !== undefined ? product.base_price : product.price;

    const existingItem = cart.find((item) => item.id === product.id && item.variantId === product.variantId);

    if (existingItem) {
      const updatedCart = cart.map((item) =>
        item.id === product.id && item.variantId === product.variantId ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
          // Добавляем price для совместимости с компонентами корзины
          price: price,
        },
      ]);
    }
  };

  const updateCart = (newCart) => {
    // Нормализуем данные
    const normalizedCart = newCart.map((item) => ({
      ...item,
      price: item.price !== undefined ? item.price : item.base_price,
    }));
    setCart(normalizedCart);
  };

  const removeFromCart = (id, variantId) => {
    const updatedCart = cart.filter((item) => !(item.id === id && item.variantId === variantId));
    setCart(updatedCart);
  };

  const updateQuantity = (id, quantity, variantId) => {
    const updatedCart = cart.map((item) =>
      item.id === id && item.variantId === variantId ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setCart(updatedCart);
  };

  return (
    <Router>
      <div className="App">
        <ScrollToTop />
        <Header cartCount={cart.length} />
        <main>
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/shop" element={<ShopPage addToCart={addToCart} />} />
            <Route path="/category/:id" element={<CategoryPage addToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductDetailsPageWrapper addToCart={addToCart} />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/cart"
              element={
                <CartPage
                  cartItems={cart}
                  updateCart={updateCart}
                  removeFromCart={removeFromCart}
                  updateQuantity={updateQuantity}
                />
              }
            />
            <Route path="/checkout" element={<CheckoutPage cartItems={cart} updateCart={updateCart} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/favorites" element={<FavoritesPage addToCart={addToCart} />} />

            {/* Страница 404 */}
            <Route path="/404" element={<NotFoundPage />} />

            {/* Защищенные маршруты */}
            <Route
              path="/account/*"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />

            {/* Админ-панель */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <Products />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <AdminRoute>
                  <ProductEdit />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/edit/:id"
              element={
                <AdminRoute>
                  <ProductEdit />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/donations"
              element={
                <AdminRoute>
                  <AdminDonationsPanel />
                </AdminRoute>
              }
            />

            {/* Редиректы */}
            <Route path="*" element={<NotFoundRoute />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

// Основной компонент приложения, оборачивающий AppContent в AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
