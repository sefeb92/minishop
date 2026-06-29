import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Box, ShoppingCart, Users, Settings, Search, Bell, LogOut, Menu, Home, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Tổng quan', path: '/admin/dashboard', icon: Home },
    { name: 'Danh mục', path: '/admin/categories', icon: Box },
    { name: 'Sản phẩm', path: '/admin/products', icon: ShoppingBag },
    { name: 'Người dùng', path: '/admin/users', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      alert('Searching for: ' + e.target.value);
    }
  };

  const handleNotification = () => {
    alert('You have 5 new notifications!');
  };

  const handleProfileDropdown = () => {
    alert('Profile dropdown clicked!');
  };

  return (
    <div className="admin-layout-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <ShoppingBag size={24} />
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--admin-text)' }}>ADMIN</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--admin-text-light)' }}>Quản trị hệ thống</div>
          </div>
        </div>
        
        <div className="nav-menu">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path}
              className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
          <button 
            onClick={handleLogout} 
            className="nav-item" 
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item" style={{ padding: '0 0 15px 0', fontSize: '0.95rem', color: 'var(--admin-text)' }}>
            <LogOut size={18} /> Back to Store
          </Link>
          &copy; 2026 Mini Shop. All rights reserved.
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Menu style={{ color: 'var(--admin-text-light)', cursor: 'pointer' }} />
            <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>
              {navItems.find(item => location.pathname.startsWith(item.path))?.name || 'Dashboard'}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Search..." onKeyPress={handleSearch} />
              <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--admin-text-light)', border: '1px solid var(--admin-border)', padding: '2px 6px', borderRadius: '4px' }}>Ctrl + K</div>
            </div>
            
            <div className="user-profile">
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleNotification}>
                <Bell size={20} style={{ color: '#6b7280' }} />
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</span>
              </div>
              <div className="avatar">A</div>
              <span style={{ fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={handleProfileDropdown}>
                Admin <ChevronDown size={14} />
              </span>
            </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
