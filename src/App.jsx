import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MdShoppingCart, MdAdminPanelSettings } from 'react-icons/md';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';
import ProductCard from './components/ProductCard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const CATEGORIES = ['All', 'Apple', 'Samsung', 'Accessories'];

// Component for Protected Routes
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading">Checking authentication...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function Home() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Fetch products from Firestore
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tg]);

  useEffect(() => {
    if (tg && tg.MainButton) {
      if (cart.length > 0) {
        const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
        tg.MainButton.text = `Checkout ($${totalPrice.toFixed(2)})`;
        tg.MainButton.show();
      } else {
        tg.MainButton.hide();
      }
    }
  }, [cart, tg]);

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
  };

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="container">
      <header className="header">
        <h1 className="header-title">PhoneShop</h1>
        <div className="header-actions">
           <button className="admin-entry-btn" onClick={() => window.location.href='/login'}>
            <MdAdminPanelSettings size={24} />
          </button>
          <button className="cart-button">
            <MdShoppingCart size={24} />
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </button>
        </div>
      </header>

      <div className="categories-list">
        {CATEGORIES.map(category => (
          <button
            key={category}
            className={`category-chip ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={handleAddToCart}
            />
          ))
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;

