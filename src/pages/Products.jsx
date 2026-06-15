import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = activeCategory === 'all' 
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <>
      <div className="page-header">
        <h1>Tất cả sản phẩm</h1>
        <p>Khám phá bộ sưu tập sản phẩm độc đáo của chúng tôi.</p>
      </div>

      <section className="categories-filter">
        <button className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}><i className="fa-solid fa-border-all"></i> Tất cả</button>
        <button className={`cat-pill ${activeCategory === 'noi-that-gia-dung' ? 'active' : ''}`} onClick={() => setActiveCategory('noi-that-gia-dung')}><i className="fa-solid fa-couch"></i> Nội thất & Gia dụng</button>
        <button className={`cat-pill ${activeCategory === 'do-thu-cong' ? 'active' : ''}`} onClick={() => setActiveCategory('do-thu-cong')}><i className="fa-solid fa-hand-sparkles"></i> Đồ thủ công</button>
        <button className={`cat-pill ${activeCategory === 'do-my-nghe' ? 'active' : ''}`} onClick={() => setActiveCategory('do-my-nghe')}><i className="fa-solid fa-palette"></i> Đồ mỹ nghệ</button>
      </section>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
};

export default Products;
