import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  const filteredProducts = activeCategory === 'all' 
    ? products.slice(0, 8)
    : products.filter(p => p.category === activeCategory);

  return (
    <>
      <section className="hero">
        <div className="hero-banner">
          <div className="hero-content">
            <h1>Sống đẹp mỗi ngày<br/>cùng Mini Shop</h1>
            <p>Sản phẩm chất lượng cho tổ ấm của bạn.</p>
            <button className="btn-cta" onClick={() => navigate('/products')}>Mua sắm ngay</button>
            
            <div className="hero-features">
              <div className="feature-item">
                <i className="fa-solid fa-truck-fast"></i>
                <div>
                  <strong>Giao hàng nhanh</strong><br/>
                  Toàn quốc
                </div>
              </div>
              <div className="feature-item">
                <i className="fa-solid fa-shield-halved"></i>
                <div>
                  <strong>Bảo hành chính hãng</strong><br/>
                  7 ngày đổi trả
                </div>
              </div>
              <div className="feature-item">
                <i className="fa-solid fa-headset"></i>
                <div>
                  <strong>Hỗ trợ 24/7</strong><br/>
                  Tư vấn tận tâm
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="categories-filter" id="categoryFilter">
        <button className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => handleCategoryClick('all')}><i className="fa-solid fa-border-all"></i> Tất cả</button>
        <button className={`cat-pill ${activeCategory === 'noi-that-gia-dung' ? 'active' : ''}`} onClick={() => handleCategoryClick('noi-that-gia-dung')}><i className="fa-solid fa-couch"></i> Nội thất & Gia dụng</button>
        <button className={`cat-pill ${activeCategory === 'do-thu-cong' ? 'active' : ''}`} onClick={() => handleCategoryClick('do-thu-cong')}><i className="fa-solid fa-hand-sparkles"></i> Đồ thủ công</button>
        <button className={`cat-pill ${activeCategory === 'do-my-nghe' ? 'active' : ''}`} onClick={() => handleCategoryClick('do-my-nghe')}><i className="fa-solid fa-palette"></i> Đồ mỹ nghệ</button>
      </section>

      <section className="featured-products">
        <div className="section-title">
          <h2>Sản phẩm nổi bật</h2>
          <Link to="/products" className="view-all">Xem tất cả &rarr;</Link>
        </div>
        
        <div className="products-grid slider-mode" id="productsGrid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;
