import { Link, NavLink, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <i className="fa-solid fa-bag-shopping"></i>
          Mini Shop
        </Link>
        
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>Products</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink>
        </nav>

        <div className="header-search">
          <input type="text" id="searchInput" placeholder="Search products..." />
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>

        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Register</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
