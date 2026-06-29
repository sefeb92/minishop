import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../utils/supabase';
import { Tag, ShoppingBag, Layers, Edit, Trash2 } from 'lucide-react';
import { getFirstProductImage } from '../../../utils/image';
import './Categories.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const categoryMeta = [
  { 
    id: 'noi-that-gia-dung', 
    displayName: 'Nội thất & Gia dụng', 
    description: 'Sản phẩm trang trí nhà cửa, nội thất và đồ dùng gia đình tiện ích.',
    colorClass: 'cat-furniture',
    icon: Layers
  },
  { 
    id: 'do-thu-cong', 
    displayName: 'Đồ thủ công', 
    description: 'Sản phẩm mây tre đan, dệt vải và đồ thủ công mỹ nghệ tinh tế.',
    colorClass: 'cat-handicraft',
    icon: Tag
  },
  { 
    id: 'do-my-nghe', 
    displayName: 'Đồ mỹ nghệ', 
    description: 'Sản phẩm điêu khắc gỗ, gốm sứ nghệ thuật và tranh treo tường.',
    colorClass: 'cat-art',
    icon: ShoppingBag
  }
];

const Categories = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setProducts(data);
        
        // Calculate category statistics
        const categoryStats = {};
        categoryMeta.forEach(cat => {
          const catProducts = data.filter(p => p.category === cat.id);
          const totalStock = catProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
          const totalValue = catProducts.reduce((sum, p) => sum + (Number(p.price) * (p.stock || 0)), 0);
          
          categoryStats[cat.id] = {
            count: catProducts.length,
            stock: totalStock,
            value: totalValue
          };
        });
        setStats(categoryStats);
      }
    } catch (err) {
      console.error('Error fetching categories data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  const handleEditProduct = (id) => {
    navigate(`/admin/products/edit/${id}`);
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        const result = await res.json();
        
        if (!result.success) throw new Error(result.message);
        
        alert(`Đã xóa thành công sản phẩm "${name}".`);
        fetchProducts();
      } catch (error) {
        alert('Lỗi khi xóa sản phẩm: ' + error.message);
      }
    }
  };

  // Filter products based on active selection
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const totalProductsCount = products.length;
  const totalStockCount = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValueSum = products.reduce((sum, p) => sum + (Number(p.price) * (p.stock || 0)), 0);

  return (
    <div className="admin-categories-page">
      <div className="admin-page-header">
        <h2>Quản Lý Danh Mục</h2>
        <p>Thống kê hiệu quả hoạt động và phân nhóm sản phẩm trong hệ thống.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>Đang tải dữ liệu danh mục...</div>
      ) : (
        <>
          {/* Categories Grid Cards */}
          <div className="categories-grid">
            {/* Total card */}
            <div 
              className={`category-card total-card ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              <div className="card-top">
                <div className="card-icon-container">
                  <Layers size={22} />
                </div>
                <div className="card-badge">Tất cả</div>
              </div>
              <h3 className="card-title">Tổng quan hệ thống</h3>
              <p className="card-desc">Hiển thị toàn bộ sản phẩm và chỉ số kho hàng của shop.</p>
              <div className="card-stats">
                <div className="stat-row">
                  <span>Sản phẩm:</span>
                  <strong>{totalProductsCount}</strong>
                </div>
                <div className="stat-row">
                  <span>Tồn kho:</span>
                  <strong>{totalStockCount} cái</strong>
                </div>
                <div className="stat-row">
                  <span>Tổng giá trị:</span>
                  <strong className="text-green">{formatCurrency(totalValueSum)}</strong>
                </div>
              </div>
            </div>

            {/* Individual categories */}
            {categoryMeta.map(cat => {
              const catStat = stats[cat.id] || { count: 0, stock: 0, value: 0 };
              const IconComponent = cat.icon;
              return (
                <div 
                  key={cat.id}
                  className={`category-card ${cat.colorClass} ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <div className="card-top">
                    <div className="card-icon-container">
                      <IconComponent size={22} />
                    </div>
                    <div className="card-badge">{catStat.count} SP</div>
                  </div>
                  <h3 className="card-title">{cat.displayName}</h3>
                  <p className="card-desc">{cat.description}</p>
                  <div className="card-stats">
                    <div className="stat-row">
                      <span>Sản phẩm:</span>
                      <strong>{catStat.count}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Tồn kho:</span>
                      <strong>{catStat.stock} cái</strong>
                    </div>
                    <div className="stat-row">
                      <span>Tổng trị giá:</span>
                      <strong className="text-green">{formatCurrency(catStat.value)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Products under category Section */}
          <div className="category-products-section card" style={{ marginTop: '30px' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                  Danh sách sản phẩm: {selectedCategory === 'all' ? 'Tất cả danh mục' : categoryMeta.find(c => c.id === selectedCategory)?.displayName}
                </h3>
                <span className="products-badge" style={{ backgroundColor: '#e6f4ea', color: '#0f9d58', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                  {filteredProducts.length} sản phẩm
                </span>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/admin/products/new')} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.9rem' }}>
                + Thêm sản phẩm
              </button>
            </div>

            <div className="table-container" style={{ marginTop: '20px', overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--admin-border)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--admin-text-light)', fontWeight: 600 }}>Hình ảnh</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--admin-text-light)', fontWeight: 600 }}>Tên sản phẩm</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--admin-text-light)', fontWeight: 600 }}>Danh mục</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--admin-text-light)', fontWeight: 600 }}>Đơn giá</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--admin-text-light)', fontWeight: 600 }}>Số lượng kho</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--admin-text-light)', fontWeight: 600 }}>Trạng thái</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--admin-text-light)', fontWeight: 600 }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const rawImage = getFirstProductImage(p.image);
                    const imageSrc = rawImage && (rawImage.startsWith('http') || rawImage.startsWith('/')) ? rawImage : `/${rawImage}`;
                    const displayName = categoryMeta.find(c => c.id === p.category)?.displayName || p.category;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                        <td style={{ padding: '12px 16px', width: '70px' }}>
                          <img src={imageSrc} className="product-img-td" alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.name}</td>
                        <td style={{ padding: '12px 16px', color: '#4f46e5', fontWeight: 500 }}>{displayName}</td>
                        <td style={{ padding: '12px 16px' }}>{formatCurrency(Number(p.price))}</td>
                        <td style={{ padding: '12px 16px' }}>{p.stock ?? 0} cái</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`status-badge ${p.status === 'Active' ? 'status-active' : 'status-low'}`} style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            backgroundColor: p.status === 'Active' ? '#e6f4ea' : '#fee2e2',
                            color: p.status === 'Active' ? '#0f9d58' : '#ef4444'
                          }}>
                            {p.status === 'Active' ? 'Đang bán' : 'Ngừng bán'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '15px' }}>
                            <button 
                              className="btn-icon text-blue" 
                              onClick={() => handleEditProduct(p.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontWeight: 500, padding: 0 }}
                            >
                              <Edit size={16} /> Sửa
                            </button>
                            <button 
                              className="btn-icon text-red" 
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 500, padding: 0 }}
                            >
                              <Trash2 size={16} /> Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                        Không có sản phẩm nào thuộc danh mục này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Categories;
