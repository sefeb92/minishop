import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-logo">
              <i className="fa-solid fa-bag-shopping"></i>
              Mini Shop
            </div>
            <p className="footer-desc">Đồ dùng & trang trí cho cuộc sống tiện nghi và phong cách.</p>
            <div className="social-links">
              <a href="#"><i className="fa-brands fa-facebook"></i></a>
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
              <a href="#"><i className="fa-brands fa-youtube"></i></a>
              <a href="#"><i className="fa-brands fa-tiktok"></i></a>
            </div>
          </div>
          
          <div className="footer-col">
            <h3>Thông tin</h3>
            <ul>
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="#">Chính sách bảo mật</Link></li>
              <li><Link to="#">Điều khoản sử dụng</Link></li>
              <li><Link to="#">Chính sách đổi trả</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h3>Hỗ trợ khách hàng</h3>
            <ul>
              <li><Link to="#">Hướng dẫn mua hàng</Link></li>
              <li><Link to="#">Thanh toán & giao hàng</Link></li>
              <li><Link to="#">Bảo hành & đổi trả</Link></li>
              <li><Link to="#">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h3>Liên hệ</h3>
            <ul>
              <li><i className="fa-solid fa-location-dot"></i> Hà Nội, Việt Nam</li>
              <li><i className="fa-solid fa-phone"></i> 0123 456 789</li>
              <li><i className="fa-solid fa-envelope"></i> support@minishop.vn</li>
              <li><i className="fa-solid fa-clock"></i> 08:00 - 21:00 (T2 - CN)</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2025 Mini Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
