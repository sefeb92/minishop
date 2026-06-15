import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', background: '#fff' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Đăng nhập</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="Email" style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} />
          <input type="password" placeholder="Mật khẩu" style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} />
          <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>Đăng nhập</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: '#0066cc' }}>Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
