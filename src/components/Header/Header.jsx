import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../utils/supabase';
import { getFirstProductImage } from '../../utils/image';
import './Header.css';


const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matches, setMatches] = useState([]);
  const searchRef = useRef(null);
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMatches([]);
      return;
    }

    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(5);

      if (!error && data) {
        setMatches(data);
      }
    };

    const timer = setTimeout(fetchMatches, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.trim().length > 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <i className="fa-solid fa-scroll"></i>
          Mini Shop
        </Link>
        
        <nav className="nav-links scroll-horizontal">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Trang chủ</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>Sản phẩm</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>Giới thiệu</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Liên hệ</NavLink>
          {user && <NavLink to="/orders" className={({ isActive }) => isActive ? 'active' : ''}>Đơn hàng</NavLink>}
        </nav>

        <div className="header-search" ref={searchRef}>
          <input 
            type="text" 
            id="searchInput" 
            placeholder="Tìm sản phẩm..." 
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if(searchQuery.trim()) setShowSuggestions(true); }}
          />
          <i className="fa-solid fa-magnifying-glass"></i>
          
          <div className={`search-suggestions ${showSuggestions ? 'show' : ''}`}>
            {matches.length > 0 ? (
              matches.map(p => {
                const rawImage = getFirstProductImage(p.image);
                const imageSrc = rawImage && (rawImage.startsWith('http') || rawImage.startsWith('/')) ? rawImage : `/${rawImage}`;
                return (
                  <div 
                    key={p.id} 
                    className="suggestion-item"
                    onClick={() => {
                      setShowSuggestions(false);
                      setSearchQuery('');
                      navigate(`/product/${p.id}`);
                    }}
                  >
                    <img src={imageSrc} className="suggestion-img" alt={p.name} />
                    <div className="suggestion-info">
                        <div className="suggestion-name">{p.name}</div>
                        <div className="suggestion-price">{formatCurrency(Number(p.price))}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="suggestion-empty">Không tìm thấy sản phẩm</div>
            )}
          </div>
        </div>

        <div className="header-actions">
          <Link to="/cart" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-cart-shopping"></i>
            <span>Giỏ hàng ({getCartCount()})</span>
          </Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <button className="btn btn-outline" onClick={() => navigate('/admin/dashboard')}>Admin</button>
              )}
              <span style={{ fontWeight: 'bold', marginLeft: '10px', marginRight: '10px' }}>{user.name}</span>
              <button className="btn btn-outline" onClick={() => { logout(); navigate('/'); }}>Đăng xuất</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => navigate('/login')}>Đăng nhập</button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>Đăng ký</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
