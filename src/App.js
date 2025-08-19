import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Импорт страниц
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ContactsPage from './pages/ContactsPage';
import AccountPage from './pages/AccountPage';
import FavoritesPage from './pages/FavoritesPage';
import ScrollToTop from './components/layout/ScrollToTop';

// Компоненты
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Импортируем данные о продуктах
import initialProducts from './data/products'; // Это default export

function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('choirCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('choirFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  // Добавляем состояние для продуктов
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    localStorage.setItem('choirCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('choirFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    // Сохраняем данные о продуктах в localStorage
    localStorage.setItem('choirProducts', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    // Загружаем данные о продуктах при старте приложения
    const savedProducts = localStorage.getItem('choirProducts');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const toggleFavorite = (product) => {
    setFavorites(prevFavorites => {
      const isFavorite = prevFavorites.some(fav => fav.id === product.id);
      if (isFavorite) {
        return prevFavorites.filter(fav => fav.id !== product.id);
      } else {
        return [...prevFavorites, product];
      }
    });
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
        item.id === product.id
        ? { ...item, quantity: item.quantity + (product.quantity || 1) }
        : item
        );
      } else {
        // Обновляем данные о продукте
        const updatedProducts = products.map(p =>
        p.id === product.id
        ? { ...p, salesCount: (p.salesCount || 0) + (product.quantity || 1) }
        : p
        );

        setProducts(updatedProducts);

        return [...prevCart, { ...product, quantity: product.quantity || 1 }];
      }
    });
  };

  const updateCart = (newCart) => {
    setCart(newCart);
  };

  const cartCount = cart.length;
  const favoritesCount = favorites.length;

  return (
    <Router>
    <ScrollToTop />
    <div className="app">
    <Header
    cartCount={cartCount}
    favoritesCount={favoritesCount}
    />
    <main>
    <Routes>
    <Route
    path="/"
    element={
      <HomePage
      addToCart={addToCart}
      toggleFavorite={toggleFavorite}
      favorites={favorites}
      />
    }
    />
    <Route
    path="/shop"
    element={
      <ShopPage
      addToCart={addToCart}
      toggleFavorite={toggleFavorite}
      favorites={favorites}
      />
    }
    />
    <Route
    path="/category/:id"
    element={
      <CategoryPage
      addToCart={addToCart}
      toggleFavorite={toggleFavorite}
      favorites={favorites}
      />
    }
    />
    <Route
    path="/product/:id"
    element={
      <ProductDetailsPage
      addToCart={addToCart}
      toggleFavorite={toggleFavorite}
      favorites={favorites}
      />
    }
    />
    <Route
    path="/cart"
    element={
      <CartPage
      cartItems={cart}
      updateCart={updateCart}
      />
    }
    />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contacts" element={<ContactsPage />} />
    <Route path="/account" element={<AccountPage />} />
    <Route
    path="/favorites"
    element={
      <FavoritesPage
      favorites={favorites}
      addToCart={addToCart}
      toggleFavorite={toggleFavorite}
      />
    }
    />
    </Routes>
    </main>
    <Footer />
    </div>
    </Router>
  );
}

export default App;
