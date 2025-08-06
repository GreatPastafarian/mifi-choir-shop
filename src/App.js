import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// Импорт новых страниц
import AboutPage from './pages/AboutPage';
import ContactsPage from './pages/ContactsPage';
import AccountPage from './pages/AccountPage';
import CategoryPage from './pages/CategoryPage';

// Иконки из Material Design Icons (убраны неиспользуемые)
import {
  MdShoppingCart,
  MdPerson,
  MdArrowBack,
  MdArrowForward,
  MdCheckCircle,
  MdEmail,
  MdPhone,
  MdLocationOn
} from 'react-icons/md';

const backgroundImageUrl = process.env.PUBLIC_URL + '/images/choir-background.jpg';

// Компонент шапки сайта
function Header({ cartCount }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
    <div className="header-top">
    <p className="donation-notice">
    Это не магазин, а способ получить сувенир в благодарность за ваше пожертвование
    </p>
    </div>

    <div className="header-main">
    <div className="logo-container">
    <div className="logo">
    <div className="logo-inner">
    <div className="logo-text">Хор МИФИ</div>
    <div className="logo-subtext">Академический мужской хор</div>
    </div>
    </div>
    </div>

    <button
    className="mobile-menu-toggle"
    onClick={() => setIsMenuOpen(!isMenuOpen)}
    >
    <span></span>
    <span></span>
    <span></span>
    </button>

    <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
    <Link to="/">Главная</Link>
    <Link to="/shop">Магазин</Link>
    <Link to="/about">О хоре</Link>
    <Link to="/contacts">Контакты</Link>
    <Link to="/account">Личный кабинет</Link>
    </nav>

    <div className="header-icons">
    <Link to="/cart" className="cart-icon">
    <MdShoppingCart />
    {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
    </Link>
    <Link to="/account" className="user-icon">
    <MdPerson />
    </Link>
    </div>
    </div>
    </header>
  );
}

// Компонент главной страницы
function HomePage({ addToCart }) {
  const popularItems = [
    { id: 1, name: "Футболка с логотипом", category: "Одежда", price: 1500, image: "tshirt" },
    { id: 2, name: "Концертный диск", category: "Музыка", price: 800, image: "cd" },
    { id: 3, name: "Значок хора", category: "Аксессуары", price: 300, image: "pin" },
    { id: 4, name: "Термокружка", category: "Аксессуары", price: 1200, image: "mug" },
  ];

  return (
    <div className="home-page">
    <section
    className="hero-banner"
    style={{
      background: `linear-gradient(rgba(10, 34, 64, 0.85), rgba(10, 34, 64, 0.85)), url(${backgroundImageUrl}) no-repeat center center/cover`
    }}
    >
    <div className="hero-content">
    <h1>Поддержите искусство хора МИФИ. Получите сувенир в благодарность за ваше пожертвование!</h1>
    <Link to="/shop" className="btn primary">Выбрать вознаграждение</Link>
    </div>
    </section>

    <section className="how-it-works">
    <h2>Как это работает</h2>
    <div className="steps">
    <div className="step">
    <div className="step-number">1</div>
    <h3>Выберите сувенир</h3>
    <p>Выберите вознаграждение из нашего каталога</p>
    </div>
    <div className="step">
    <div className="step-number">2</div>
    <h3>Сделайте пожертвование</h3>
    <p>Поддержите хор через наш фонд</p>
    </div>
    <div className="step">
    <div className="step-number">3</div>
    <h3>Получите вознаграждение</h3>
    <p>Заберите сувенир с благодарностью от хора</p>
    </div>
    </div>
    </section>

    <section className="popular-items">
    <h2>Популярные вознаграждения</h2>
    <div className="items-grid">
    {popularItems.map(item => (
      <ProductCard
      key={item.id}
      product={item}
      addToCart={addToCart}
      />
    ))}
    </div>
    </section>

    <section className="about-choir">
    <div className="about-content">
    <div className="about-text">
    <h2>Мужской академический хор МИФИ</h2>
    <p>Основанный в 1962 году, хор МИФИ является одним из старейших академических коллективов России. За годы существования хор дал сотни концертов в России и за рубежом, записал несколько альбомов духовной и классической музыки.</p>
    <p>Сегодня в репертуаре хора более 200 произведений русской и зарубежной классики, духовной музыки, народных песен и современных композиций.</p>
    <Link to="/about" className="btn secondary">Узнать больше</Link>
    </div>
    <div className="about-image">
    <div className="image-placeholder choir-image"></div>
    </div>
    </div>
    </section>
    </div>
  );
}

// Компонент карточки товара
function ProductCard({ product, addToCart }) {
  return (
    <div className="product-card">
    <div className="product-image">
    <div className={`image-placeholder ${product.image}`}></div>
    </div>
    <div className="product-info">
    <span className="product-category">{product.category}</span>
    <h3 className="product-name">{product.name}</h3>
    <div className="product-price">Рекомендованное пожертвование: {product.price} ₽</div>
    <button
    className="btn primary"
    onClick={() => addToCart(product)}
    >
    Выбрать вознаграждение
    </button>
    </div>
    </div>
  );
}

// Компонент страницы товара
function ProductPage({ addToCart }) {
  const [quantity, setQuantity] = useState(1);

  const product = {
    id: 1,
    name: "Футболка с логотипом хора МИФИ",
    category: "Одежда",
    price: 1500,
    description: "Качественная хлопковая футболка с вышитым логотипом мужского академического хора МИФИ. Доступна в размерах S-XXL.",
    materials: "100% хлопок, экологичные краски",
    details: [
      "Вышивка высокого качества",
      "Устойчивость к стиркам",
      "Мягкий комфортный материал"
    ]
  };

  return (
    <div className="product-page">
    <div className="product-gallery">
    <div className="main-image">
    <div className="image-placeholder tshirt-large"></div>
    </div>
    <div className="thumbnails">
    <div className="thumbnail"></div>
    <div className="thumbnail"></div>
    <div className="thumbnail"></div>
    </div>
    </div>

    <div className="product-details">
    <div className="donation-badge">Вознаграждение за пожертвование</div>
    <h1>{product.name}</h1>
    <div className="product-meta">
    <span className="category">{product.category}</span>
    </div>

    <div className="recommended-donation">
    <span>Рекомендованное пожертвование:</span>
    <div className="price">{product.price} ₽</div>
    </div>

    <div className="quantity-selector">
    <label htmlFor="quantity">Количество:</label>
    <div className="quantity-control">
    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
    <input
    type="number"
    id="quantity"
    value={quantity}
    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
    min="1"
    />
    <button onClick={() => setQuantity(q => q + 1)}>+</button>
    </div>
    </div>

    <button
    className="btn primary add-to-cart"
    onClick={() => addToCart({...product, quantity})}
    >
    Добавить к пожертвованию
    </button>

    <div className="donation-impact">
    <h3>Ваш вклад поддерживает:</h3>
    <ul>
    <li><MdCheckCircle /> Обновление нотной библиотеки</li>
    <li><MdCheckCircle /> Концертные костюмы</li>
    <li><MdCheckCircle /> Гастрольные поездки</li>
    <li><MdCheckCircle /> Организацию концертов</li>
    </ul>
    </div>

    <div className="product-description">
    <h3>Описание</h3>
    <p>{product.description}</p>

    <h3>Материалы и особенности</h3>
    <p>{product.materials}</p>
    <ul>
    {product.details.map((detail, index) => (
      <li key={index}>{detail}</li>
    ))}
    </ul>
    </div>
    </div>
    </div>
  );
}

// Компонент корзины
function CartPage({ cartItems, updateCart }) {
  const [items, setItems] = useState(cartItems);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const updateQuantity = (id, quantity) => {
    const newItems = items.map(item =>
    item.id === id ? {...item, quantity} : item
    ).filter(item => item.quantity > 0);

    setItems(newItems);
    updateCart(newItems);
  };

  const removeItem = (id) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    updateCart(newItems);
  };

  return (
    <div className="cart-page">
    <h1>Ваши выбранные вознаграждения</h1>

    <div className="cart-container">
    <div className="cart-items">
    {items.length > 0 ? (
      items.map(item => (
        <div key={item.id} className="cart-item">
        <div className="item-image">
        <div className={`image-placeholder ${item.image}`}></div>
        </div>
        <div className="item-details">
        <h3>{item.name}</h3>
        <div className="item-category">{item.category}</div>
        <div className="item-price">Рекомендованное пожертвование: {item.price} ₽</div>

        <div className="item-quantity">
        <label>Количество:</label>
        <div className="quantity-control">
        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
        <input
        type="number"
        value={item.quantity}
        onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
        min="1"
        />
        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
        </div>
        </div>

        <button
        className="remove-item"
        onClick={() => removeItem(item.id)}
        >
        Удалить
        </button>
        </div>
        <div className="item-total">
        {item.price * item.quantity} ₽
        </div>
        </div>
      ))
    ) : (
      <div className="empty-cart">
      <p>Вы еще не выбрали вознаграждения</p>
      <Link to="/shop" className="btn primary">Перейти к выбору</Link>
      </div>
    )}
    </div>

    {items.length > 0 && (
      <div className="cart-summary">
      <h2>Сводка пожертвования</h2>
      <div className="summary-row">
      <span>Сумма рекомендованного пожертвования:</span>
      <span>{subtotal} ₽</span>
      </div>

      <div className="note">
      <p><strong>Важно:</strong> Фактический размер пожертвования вы определяете самостоятельно.</p>
      <p>Выбранные сувениры являются благодарностью за вашу поддержку хора МИФИ.</p>
      </div>

      <Link to="/checkout" className="btn primary">Подтвердить пожертвование</Link>
      </div>
    )}
    </div>
    </div>
  );
}

// Компонент оформления заказа
function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    comment: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

    const prevStep = () => {
      if (step > 1) setStep(step - 1);
    };

      return (
        <div className="checkout-page">
        <h1>Оформление пожертвования</h1>

        <div className="checkout-steps">
        <div className={`step ${step === 1 ? 'active' : ''}`}>
        <div className="step-number">1</div>
        <div className="step-title">Контакты</div>
        </div>
        <div className={`step ${step === 2 ? 'active' : ''}`}>
        <div className="step-number">2</div>
        <div className="step-title">Подтверждение</div>
        </div>
        <div className={`step ${step === 3 ? 'active' : ''}`}>
        <div className="step-number">3</div>
        <div className="step-title">Оплата</div>
        </div>
        </div>

        <div className="step-content">
        {step === 1 && (
          <div className="contact-form">
          <div className="form-group">
          <label htmlFor="name">ФИО *</label>
          <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          />
          </div>

          <div className="form-row">
          <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          />
          </div>

          <div className="form-group">
          <label htmlFor="phone">Телефон *</label>
          <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
          />
          </div>
          </div>

          <div className="form-group">
          <label htmlFor="comment">Комментарий (необязательно)</label>
          <textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleInputChange}
          rows="4"
          ></textarea>
          </div>
          </div>
        )}

        {step === 2 && (
          <div className="confirmation">
          <div className="summary-box">
          <h3>Ваши данные</h3>
          <p><strong>ФИО:</strong> {formData.name}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Телефон:</strong> {formData.phone}</p>
          {formData.comment && <p><strong>Комментарий:</strong> {formData.comment}</p>}
          </div>

          <div className="donation-note">
          <h3>Важная информация</h3>
          <p>Пожертвование осуществляется в фонд поддержки мужского академического хора МИФИ. Выбранные вами сувениры будут переданы вам как благодарность за вашу поддержку.</p>
          <p>После подтверждения вы получите реквизиты для перевода пожертвования и инструкции по получению вознаграждения.</p>
          </div>
          </div>
        )}

        {step === 3 && (
          <div className="payment-instructions">
          <div className="success-icon">
          <MdCheckCircle />
          </div>
          <h2>Пожертвование успешно оформлено!</h2>

          <div className="instructions">
          <h3>Инструкция по оплате:</h3>
          <ol>
          <li>Откройте приложение вашего банка для перевода средств</li>
          <li>Используйте следующие реквизиты:</li>
          </ol>

          <div className="payment-details">
          <p><strong>Получатель:</strong> Фонд поддержки хора МИФИ</p>
          <p><strong>ИНН:</strong> 1234567890</p>
          <p><strong>КПП:</strong> 987654321</p>
          <p><strong>Расчетный счет:</strong> 40702810500000012345</p>
          <p><strong>Банк:</strong> ПАО Сбербанк</p>
          <p><strong>БИК:</strong> 044525225</p>
          <p><strong>Корр. счет:</strong> 30101810400000000225</p>
          </div>

          <p className="note">После перевода средств свяжитесь с нами по телефону +7 (495) 123-45-67 или email choir@mephi.ru для уточнения деталей получения вознаграждения.</p>
          </div>
          </div>
        )}
        </div>

        <div className="step-actions">
        {step > 1 && step < 3 && (
          <button className="btn secondary" onClick={prevStep}>
          <MdArrowBack /> Назад
          </button>
        )}

        {step < 3 ? (
          <button className="btn primary" onClick={nextStep}>
          {step === 1 ? 'Продолжить' : 'Подтвердить пожертвование'} <MdArrowForward />
          </button>
        ) : (
          <Link to="/" className="btn primary">
          Вернуться на главную
          </Link>
        )}
        </div>
        </div>
      );
}

// Компонент подвала сайта
function Footer() {
  return (
    <footer className="footer">
    <div className="footer-main">
    <div className="footer-column">
    <div className="logo-footer">
    <div className="logo">
    <div className="logo-inner">
    <div className="logo-text">Хор МИФИ</div>
    <div className="logo-subtext">Академический мужской хор</div>
    </div>
    </div>
    </div>
    <p className="footer-notice">
    Официальный проект при поддержке фонда хора МИФИ
    </p>
    <div className="mephi-logo">
    <div className="mephi-emblem"></div>
    <span>Московский инженерно-физический институт</span>
    </div>
    </div>

    <div className="footer-column">
    <h3>Контакты</h3>
    <ul className="contact-info">
    <li><MdEmail /> choir@mephi.ru</li>
    <li><MdPhone /> +7 (495) 123-45-67</li>
    <li><MdLocationOn /> г. Москва, Каширское шоссе, 31</li>
    </ul>
    </div>

    <div className="footer-column">
    <h3>Меню</h3>
    <ul className="footer-links">
    <li><Link to="/">Главная</Link></li>
    <li><Link to="/shop">Магазин</Link></li>
    <li><Link to="/about">О хоре</Link></li>
    <li><Link to="/contacts">Контакты</Link></li>
    <li><Link to="/account">Личный кабинет</Link></li>
    </ul>
    </div>

    <div className="footer-column">
    <h3>Мы в соцсетях</h3>
    <div className="social-links">
    <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="social-icon vk">VK</a>
    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon youtube">YouTube</a>
    </div>

    <h3>Документы</h3>
    <ul className="footer-links">
    <li><a href="/oferta">Оферта</a></li>
    <li><a href="/privacy">Политика конфиденциальности</a></li>
    </ul>
    </div>
    </div>

    <div className="footer-bottom">
    <p>© {new Date().getFullYear()} Мужской академический хор МИФИ. Все права защищены.</p>
    </div>
    </footer>
  );
}
// Страница магазина
function ShopPage({ addToCart }) {
  const [activeCategory, setActiveCategory] = useState(null);

  // Категории товаров
  const categories = [
    {
      id: 1,
      name: "Одежда",
      description: "Футболки, свитшоты, толстовки с символикой хора",
      image: "clothing-category"
    },
    {
      id: 2,
      name: "Аксессуары",
      description: "Значки, кружки, сумки и другие аксессуары",
      image: "accessories-category"
    },
    {
      id: 3,
      name: "Музыка",
      description: "Диски с записями концертов, ноты",
      image: "music-category"
    },
    {
      id: 4,
      name: "Коллекционные издания",
      description: "Ограниченные серии и эксклюзивные сувениры",
      image: "collectibles-category"
    }
  ];

  // Новинки
  const newItems = [
    { id: 5, name: "Свитшот с эмблемой хора", category: "Одежда", price: 2500, image: "sweatshirt" },
    { id: 6, name: "Лимитированная виниловая пластинка", category: "Музыка", price: 3500, image: "vinyl" },
    { id: 7, name: "Эко-сумка с принтом", category: "Аксессуары", price: 800, image: "bag" },
    { id: 8, name: "Подарочный набор к 60-летию хора", category: "Коллекционные издания", price: 5000, image: "gift-set" }
  ];

  // Новости
  const news = [
    {
      id: 1,
      title: "Хор МИФИ выступил на фестивале 'Академическая весна'",
      date: "15 мая 2023",
      excerpt: "Наши хористы получили специальный приз жюри за лучшее исполнение духовной музыки",
      image: "news-1"
    },
    {
      id: 2,
      title: "Открыт предзаказ на новый альбом 'Песни Победы'",
      date: "28 апреля 2023",
      excerpt: "Сборник военных песен в современной аранжировке уже доступен для предзаказа",
      image: "news-2"
    },
    {
      id: 3,
      title: "Мастер-класс от художественного руководителя хора",
      date: "10 апреля 2023",
      excerpt: "Александр Петров проведет открытый урок для всех желающих 25 мая в Актовом зале МИФИ",
      image: "news-3"
    }
  ];
  const backgroundImageUrl = process.env.PUBLIC_URL + '/images/choir-background.jpg';
  return (
    <div className="shop-page">
    {/* Герой-баннер для магазина */}
 <section
  className="shop-hero"
  style={{
    height: '300px',
    background: `linear-gradient(rgba(10, 34, 64, 0.8), rgba(10, 34, 64, 0.8)), url(${backgroundImageUrl}) no-repeat center center/cover`,
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    padding: '0 16px'
  }}
>
  <div className="container">
    <h1>Сувенирная продукция хора МИФИ</h1>
    <p>Выберите вознаграждение за пожертвование и поддержите наш хор</p>
  </div>
</section>

    {/* Категории товаров */}
    <section className="shop-categories">
    <div className="container">
    <h2>Категории товаров</h2>
    <div className="categories-grid">
    {categories.map(category => (
      <div
      key={category.id}
      className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
      onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
      >
      <div className="category-image">
      <div className={`image-placeholder ${category.image}`}></div>
      </div>
      <div className="category-info">
      <h3>{category.name}</h3>
      <p>{category.description}</p>
      <Link to={`/category/${category.id}`} className="btn secondary">
      Смотреть товары
      </Link>
      </div>
      </div>
    ))}
    </div>
    </div>
    </section>

    {/* Новинки */}
    <section className="new-items">
    <div className="container">
    <div className="section-header">
    <h2>Новинки</h2>
    <Link to="/shop?filter=new" className="view-all">Все новинки</Link>
    </div>
    <div className="items-grid">
    {newItems.map(item => (
      <ProductCard
      key={item.id}
      product={item}
      addToCart={addToCart}
      />
    ))}
    </div>
    </div>
    </section>

    {/* Новости */}
    <section className="shop-news">
    <div className="container">
    <div className="section-header">
    <h2>Новости хора</h2>
    <Link to="/news" className="view-all">Все новости</Link>
    </div>
    <div className="news-grid">
    {news.map(item => (
      <div key={item.id} className="news-card">
      <div className="news-image">
      <div className={`image-placeholder ${item.image}`}></div>
      </div>
      <div className="news-content">
      <span className="news-date">{item.date}</span>
      <h3>{item.title}</h3>
      <p>{item.excerpt}</p>
      <Link to={`/news/${item.id}`} className="read-more">
      Читать далее
      </Link>
      </div>
      </div>
    ))}
    </div>
    </div>
    </section>
    </div>
  );
}
// Главный компонент приложения
function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('choirCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('choirCart', JSON.stringify(cart));
  }, [cart]);

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
        return [...prevCart, { ...product, quantity: product.quantity || 1 }];
      }
    });
  };

  const updateCart = (newCart) => {
    setCart(newCart);
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <Router>
    <div className="app">
    <Header cartCount={cartCount} />

    <main>
    <Routes>
    <Route path="/" element={<HomePage addToCart={addToCart} />} />
    <Route path="/shop" element={<ShopPage addToCart={addToCart} />} />
    <Route path="/product/:id" element={<ProductPage addToCart={addToCart} />} />
    <Route path="/cart" element={<CartPage cartItems={cart} updateCart={updateCart} />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contacts" element={<ContactsPage />} />
    <Route path="/account" element={<AccountPage />} />
    <Route path="/category/:id" element={<CategoryPage addToCart={addToCart} />} />
    </Routes>
    </main>

    <Footer />
    </div>
    </Router>
  );
}

export default App;
