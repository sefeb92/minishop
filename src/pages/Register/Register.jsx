import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [successMessage, setSuccessMessage] = useState('');
  
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!name || !email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    const result = await register(name, email, password);
    if (result.success) {
      setSuccessMessage('Đăng ký tài khoản thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản trước khi đăng nhập.');
      setName('');
      setEmail('');
      setPassword('');
    } else {
      let errMsg = 'Đăng ký thất bại. Vui lòng thử lại.';
      if (result.message) {
        errMsg = typeof result.message === 'object' ? JSON.stringify(result.message) : String(result.message);
      }
      setError(errMsg);
    }
  };

  return (
    <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
      <div className="scroll-vertical" style={{ width: '100%', maxWidth: '400px', padding: '30px 25px', background: 'var(--scroll-bg)', borderLeft: '2px solid var(--border-color)', borderRight: '2px solid var(--border-color)', borderTop: 'none', borderBottom: 'none' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontFamily: "'Playfair Display', 'EB Garamond', serif", fontWeight: 900, fontSize: '1.8rem' }}>Đăng ký</h2>
        {error && <div style={{ color: 'var(--cinnabar-red)', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', fontFamily: "'EB Garamond', serif" }}>{error}</div>}
        {successMessage && <div style={{ color: 'var(--ink-green, #2e7d32)', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', fontFamily: "'EB Garamond', serif" }}>{successMessage}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Họ và tên" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'rgba(253, 250, 242, 0.6)', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem' }} 
            required
          />
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
          <button type="submit" className="ink-btn-green" style={{ padding: '12px', width: '100%' }}>Đăng ký</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontFamily: "'EB Garamond', serif", fontWeight: 600 }}>
          Đã có tài khoản? <Link to="/login" style={{ color: 'var(--cinnabar-red)', textDecoration: 'underline' }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
