import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, ShoppingBag, ShoppingCart, Filter, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { getFirstProductImage } from '../../../utils/image';
import './Products.css';


const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories] = useState([
    { id: 1, name: 'noi-that-gia-dung', displayName: 'Nội thất & Gia dụng' },
    { id: 2, name: 'do-thu-cong', displayName: 'Đồ thủ công' },
    { id: 3, name: 'do-my-nghe', displayName: 'Đồ mỹ nghệ' }
  ]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
    } else if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditProduct = (product) => {
    navigate(`/admin/products/edit/${product.id}`);
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        const result = await res.json();
        
        if (!result.success) throw new Error(result.message);
        
        alert(`Đã xóa thành công "${name}".`);
        fetchProducts();
      } catch (error) {
        alert('Lỗi khi xóa sản phẩm: ' + error.message);
      }
    }
  };

  return (
    <div className="products-container" style={{ gridTemplateColumns: '250px 1fr' }}>
      {/* Left Sidebar - Quick Summary */}
      <div className="quick-summary">
        <h3 className="summary-title">Quick Summary</h3>
        <ul className="summary-list">
          <li className="summary-item">
            <div className="item-label"><ShoppingBag size={18} className="icon-blue" /> Products</div>
            <span className="item-value">{products.length}</span>
          </li>
          <li className="summary-item">
            <div className="item-label"><Box size={18} className="icon-green" /> Categories</div>
            <span className="item-value">{categories.length}</span>
          </li>
          <li className="summary-item">
            <div className="item-label"><ShoppingCart size={18} className="icon-orange" /> Orders</div>
            <span className="item-value">12</span>
          </li>
        </ul>
      </div>

      {/* Main Content Area - Tables */}
      <div className="products-main" style={{ maxWidth: '100%' }}>
        {/* Products Section */}
        <div className="section-header">
          <h2 className="section-title">Products</h2>
          <div className="section-actions">
            <button className="btn-secondary" onClick={() => fetchProducts()}><Filter size={16} /> Refresh</button>
            <button className="btn-primary" onClick={() => navigate('/admin/products/new')}>+ Add Product</button>
          </div>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>Đang tải danh sách sản phẩm...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const rawImage = getFirstProductImage(product.image);
                  const imageSrc = rawImage && (rawImage.startsWith('http') || rawImage.startsWith('/')) ? rawImage : `/${rawImage}`;
                  return (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td><img src={imageSrc} alt={product.name} className="table-img" /></td>
                      <td className="font-medium">{product.name}</td>
                      <td className="text-blue">{product.category}</td>
                      <td>{formatCurrency(Number(product.price))}</td>
                      <td>{product.stock ?? 0}</td>
                      <td>
                        <span className={`status-badge ${product.status === 'Active' ? 'active' : ''}`}>
                          <span className="status-dot"></span>
                          {product.status === 'Active' ? 'Đang bán' : 'Ngừng bán'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon text-blue" onClick={() => handleEditProduct(product)}><Edit size={16} /> Edit</button>
                          <button className="btn-icon text-red" onClick={() => handleDeleteProduct(product.id, product.name)}><Trash2 size={16} /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
