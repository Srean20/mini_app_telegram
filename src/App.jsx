import React, { useEffect, useState } from 'react';
import { MdShoppingCart } from 'react-icons/md';
import ProductCard from './components/ProductCard';

// Temporary Mock Data for the phone shop
const MOCK_PRODUCTS = [
  {
    id: 1,
    title: 'iPhone 15 Pro Max - 256GB',
    price: 1199,
    category: 'Apple',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-blue-titanium-select?wid=512&hei=512&fmt=jpeg&qlt=95&.v=1692846360609'
  },
  {
    id: 2,
    title: 'Samsung Galaxy S24 Ultra',
    price: 1299,
    category: 'Samsung',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/kh/2401/gallery/kh-galaxy-s24-s928-sm-s928bzTQw-539401777?$650_519_PNG$'
  },
  {
    id: 3,
    title: 'AirPods Pro (2nd generation)',
    price: 249,
    category: 'Accessories',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=512&hei=512&fmt=jpeg&qlt=95&.v=1660803972361'
  },
  {
    id: 4,
    title: 'Samsung Galaxy Watch 6',
    price: 299,
    category: 'Accessories',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/kh/2307/gallery/kh-galaxy-watch6-r940-sm-r940nzkaasa-537406450?$650_519_PNG$'
  },
  {
    id: 5,
    title: 'iPhone 15 - 128GB',
    price: 799,
    category: 'Apple',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pink-select-202309?wid=512&hei=512&fmt=jpeg&qlt=95&.v=1692923782485'
  },
  {
    id: 6,
    title: 'Samsung Galaxy Z Fold5',
    price: 1799,
    category: 'Samsung',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/kh/2307/gallery/kh-galaxy-z-fold5-f946-sm-f946bzkoasa-537404616?$650_519_PNG$'
  }
];

const CATEGORIES = ['All', 'Apple', 'Samsung', 'Accessories'];

function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);

  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    // Initialize Telegram Web App SDK and notify it's ready
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  // Update Main Button in Telegram UI when cart changes
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
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="container">
      <header className="header">
        <h1 className="header-title">PhoneShop</h1>
        <button className="cart-button" onClick={() => {/* Handle Cart View */ }}>
          <MdShoppingCart size={24} />
          {cart.length > 0 && (
            <span className="cart-badge">{cart.length}</span>
          )}
        </button>
      </header>

      <div className="categories-list">
        {CATEGORIES.map(category => (
          <button
            key={category}
            className={`category-chip \${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
