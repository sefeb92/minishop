import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message);
    }
  };

  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      setEmail('admin@test.com');
      setPassword('123456');
    } else {
      setEmail('user@test.com');
      setPassword('123456');
    }
  };

  return (
    <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
      <div className="scroll-vertical" style={{ width: '100%', maxWidth: '400px', padding: '30px 25px', background: 'var(--scroll-bg)', borderLeft: '2px solid var(--border-color)', borderRight: '2px solid var(--border-color)', borderTop: 'none', borderBottom: 'none' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontFamily: "'Playfair Display', 'EB Garamond', serif", fontWeight: 900, fontSize: '1.8rem' }}>Đăng nhập</h2>
        {error && <div style={{ color: 'var(--cinnabar-red)', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', fontFamily: "'EB Garamond', serif" }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'rgba(253, 250, 242, 0.6)', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem' }} 
            required
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'rgba(253, 250, 242, 0.6)', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem' }} 
            required
          />
          <button type="submit" className="ink-btn-green" style={{ padding: '12px', width: '100%' }}>Đăng nhập</button>
        </form>

        <div style={{ marginTop: '25px', display: 'flex', gap: '10px', flexDirection: 'column', borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
          <p style={{ textAlign: 'center', margin: 0, fontSize: '0.95em', color: 'var(--text-light)', fontFamily: "'EB Garamond', serif", fontWeight: 700 }}>Tài khoản kiểm tra nhanh:</p>
          <div style={{ display: 'flex', gap: '10px' }}>
             <button type="button" onClick={() => handleQuickLogin('admin')} className="btn btn-outline" style={{ flex: 1, padding: '8px', borderColor: 'var(--border-color)', color: 'var(--text-dark)', fontWeight: 600, fontFamily: 'inherit', background: 'transparent', cursor: 'pointer' }}>Quản trị viên</button>
             <button type="button" onClick={() => handleQuickLogin('user')} className="btn btn-outline" style={{ flex: 1, padding: '8px', borderColor: 'var(--border-color)', color: 'var(--text-dark)', fontWeight: 600, fontFamily: 'inherit', background: 'transparent', cursor: 'pointer' }}>Người dùng</button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontFamily: "'EB Garamond', serif", fontWeight: 600 }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--cinnabar-red)', textDecoration: 'underline' }}>Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
