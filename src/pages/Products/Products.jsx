import { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard/ProductCard';
import { supabase } from '../../utils/supabase';
import './Products.css';

const getCategoryIcon = (slug) => {
  switch (slug) {
    case 'noi-that-gia-dung':
      return 'fa-couch';
    case 'do-thu-cong':
      return 'fa-hand-sparkles';
    case 'do-my-nghe':
      return 'fa-palette';
    default:
      return 'fa-tag';
  }
};

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) {
        console.error('Error fetching categories:', error);
      } else if (data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from('products').select('*');
      
      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching products:', error);
      } else if (data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [activeCategory]);

  return (
    <>
      <div className="page-header">
        <h1>Tất cả sản phẩm</h1>
        <p>Khám phá bộ sưu tập sản phẩm độc đáo của chúng tôi.</p>
      </div>

      <section className="categories-filter">
        <button 
          className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`} 
          onClick={() => setActiveCategory('all')}
        >
          <i className="fa-solid fa-border-all"></i> Tất cả
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={`cat-pill ${activeCategory === cat.slug ? 'active' : ''}`} 
            onClick={() => setActiveCategory(cat.slug)}
          >
            <i className={`fa-solid ${getCategoryIcon(cat.slug)}`}></i> {cat.name}
          </button>
        ))}
      </section>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>Đang tải sản phẩm...</div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={{ ...product, price: Number(product.price) }} />
          ))}
          {products.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px 0', color: '#666' }}>Không có sản phẩm nào.</div>
          )}
        </div>
      )}
    </>
  );
};

export default Products;
