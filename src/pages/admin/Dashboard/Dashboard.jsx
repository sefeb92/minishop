import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShoppingBag, Box, Eye, AlertTriangle, Ellipsis, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../utils/supabase';
import { getFirstProductImage } from '../../../utils/image';
import './Dashboard.css';


const baseSalesData = [
  { name: 'Mon', value: 2000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2500 },
  { name: 'Thu', value: 4000 },
  { name: 'Fri', value: 3500 },
  { name: 'Sat', value: 5000 },
  { name: 'Sun', value: 4500 },
];

const last30DaysSalesData = [
  { name: 'W1', value: 12000 },
  { name: 'W2', value: 15000 },
  { name: 'W3', value: 11000 },
  { name: 'W4', value: 18000 },
];

const ordersData = [
  { name: 'Completed', value: 65, color: '#10b981' },
  { name: 'Processing', value: 20, color: '#3b82f6' },
  { name: 'Shipping', value: 15, color: '#f59e0b' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        <p className="intro">
          <span className="dot" style={{ backgroundColor: payload[0].color }}></span>
          {`${(payload[0].value * 1000).toLocaleString()} đ`}
        </p>
      </div>
    );
  }
  return null;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const Dashboard = () => {
  const [salesRange, setSalesRange] = useState('Last 7 days');
  const [stats, setStats] = useState({
    totalProducts: 0,
    categoriesCount: 0,
    visibleProducts: 0,
    lowStock: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentSalesData = salesRange === 'Last 7 days' ? baseSalesData : last30DaysSalesData;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all products to calculate client-side stats quickly
        const { data: allProducts, error } = await supabase.from('products').select('*');
        if (error) throw error;

        if (allProducts) {
          const totalProducts = allProducts.length;
          
          const uniqueCategories = new Set(allProducts.map(p => p.category));
          const categoriesCount = uniqueCategories.size;

          const visibleProducts = allProducts.filter(p => p.status === 'Active').length;
          const lowStock = allProducts.filter(p => p.stock !== null && p.stock < 10).length;

          setStats({
            totalProducts,
            categoriesCount,
            visibleProducts,
            lowStock
          });

          // Fetch recent products
          const sorted = [...allProducts]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 6);
          
          setRecentProducts(sorted);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSalesRangeChange = (e) => {
    setSalesRange(e.target.value);
  };

  const handleActionClick = (productName) => {
    alert(`Action menu for: ${productName}`);
  };

  return (
    <div className="dashboard-container">
      {/* Greeting Admin */}
      <div className="admin-greeting-section" style={{ marginBottom: '25px', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#0f4c81', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '20px', marginTop: 0 }}>Xin chào, Administrator</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px', background: '#eef2ff', border: '1px solid #e0e7ff', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ color: '#1e3a8a', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Danh mục</h3>
            <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>Sắp xây dựng</span>
          </div>
          <div style={{ flex: '1', minWidth: '200px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ color: '#14532d', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Sản phẩm</h3>
            <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>Đang kết nối Live</span>
          </div>
          <div style={{ flex: '2', minWidth: '300px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ color: '#4b5563', margin: 0, fontSize: '1.6rem', fontWeight: 600 }}>Supabase Connected</h3>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h4>Total products</h4>
            <div className="number">{stats.totalProducts}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-light)', marginTop: '5px' }}>All products in database</div>
          </div>
          <div className="stat-icon icon-green-light"><ShoppingBag size={24} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h4>Categories</h4>
            <div className="number">{stats.categoriesCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-light)', marginTop: '5px' }}>Unique product categories</div>
          </div>
          <div className="stat-icon icon-blue-light"><Box size={24} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h4>Visible products</h4>
            <div className="number">{stats.visibleProducts}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-light)', marginTop: '5px' }}>Currently Active</div>
          </div>
          <div className="stat-icon icon-green-light"><Eye size={24} /></div>
        </div>
        <div className="stat-card" style={{ border: stats.lowStock > 0 ? '1px solid #fed7aa' : '1px solid var(--admin-border)', backgroundColor: stats.lowStock > 0 ? '#fffaf0' : '#fff' }}>
          <div className="stat-info">
            <h4 style={{ color: stats.lowStock > 0 ? '#ea580c' : undefined }}>Low stock</h4>
            <div className="number" style={{ color: stats.lowStock > 0 ? '#ea580c' : undefined }}>{stats.lowStock}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-light)', marginTop: '5px' }}>Products with stock &lt; 10</div>
          </div>
          <div className="stat-icon icon-orange-light"><AlertTriangle size={24} /></div>
        </div>
      </div>

      {/* Main Dashboard Content Grid */}
      <div className="dashboard-grid">
        
        {/* Sales Overview Chart */}
        <div className="card col-span-2">
          <div className="card-header">
            <h3>Sales overview</h3>
            <select className="form-control" style={{ width: 'auto', padding: '5px 10px', fontSize: '0.9rem' }} value={salesRange} onChange={handleSalesRangeChange}>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="chart-container" style={{ position: 'relative', height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentSalesData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `${value}`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" stroke="#0f9d58" strokeWidth={3} dot={{ r: 4, fill: '#0f9d58', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid var(--admin-border)', paddingTop: '20px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-light)', marginBottom: '5px' }}>Total sales</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>42,580,000 đ <span style={{ fontSize: '0.9rem', color: '#0f9d58', fontWeight: 500 }}><ArrowUp size={12}/> 18.6%</span></div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-light)', marginBottom: '5px' }}>Orders</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>128 <span style={{ fontSize: '0.9rem', color: '#0f9d58', fontWeight: 500 }}><ArrowUp size={12}/> 12.4%</span></div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-light)', marginBottom: '5px' }}>Average order</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>332,656 đ <span style={{ fontSize: '0.9rem', color: '#0f9d58', fontWeight: 500 }}><ArrowUp size={12}/> 5.7%</span></div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-light)', marginBottom: '5px' }}>Conversion rate</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>2.35% <span style={{ fontSize: '0.9rem', color: '#0f9d58', fontWeight: 500 }}><ArrowUp size={12}/> 8.1%</span></div>
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="card col-span-2">
          <div className="card-header">
            <h3>Recent products</h3>
            <Link to="/admin/products" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>+ Add product</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th colSpan="2">Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => {
                  const rawImage = getFirstProductImage(product.image);
                  const imageSrc = rawImage && (rawImage.startsWith('http') || rawImage.startsWith('/')) ? rawImage : `/${rawImage}`;
                  return (
                    <tr key={product.id}>
                      <td style={{ width: '50px' }}><img src={imageSrc} className="product-img-td" alt={product.name} /></td>
                      <td style={{ fontWeight: 500 }}>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{formatCurrency(Number(product.price))}</td>
                      <td>{product.stock ?? 0}</td>
                      <td>
                        <span className={`status-badge ${product.status === 'Active' ? 'status-active' : 'status-low'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn-dotted" onClick={() => handleActionClick(product.name)}>
                          <Ellipsis size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {recentProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders Overview */}
        <div className="card col-span-1">
          <div className="card-header">
            <h3>Orders overview</h3>
            <select className="form-control" style={{ width: 'auto', padding: '5px 10px', fontSize: '0.9rem' }}>
              <option>Last 7 days</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ordersData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value">
                    {ordersData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginLeft: '20px' }} className="orders-legend">
              {ordersData.map(item => (
                <div className="legend-item" key={item.name}>
                  <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                  <span>{item.name} <span style={{ fontWeight: 600 }}>({item.value}%)</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="card col-span-2" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3>Top categories</h3>
            <select className="form-control" style={{ width: 'auto', padding: '5px 10px', fontSize: '0.9rem' }}>
              <option>By sales</option>
            </select>
          </div>
          <div className="top-categories-list">
            <div className="category-item">
              <div className="cat-icon"><Box size={18}/> Furniture</div>
              <div className="cat-bar-container"><div className="cat-bar bg-green" style={{ width: '100%' }}></div></div>
              <div className="cat-value">18,450,000 đ</div>
            </div>
            <div className="category-item">
              <div className="cat-icon"><Box size={18}/> Decor</div>
              <div className="cat-bar-container"><div className="cat-bar bg-blue" style={{ width: '50%' }}></div></div>
              <div className="cat-value">9,200,000 đ</div>
            </div>
            <div className="category-item">
              <div className="cat-icon"><Box size={18}/> Lighting</div>
              <div className="cat-bar-container"><div className="cat-bar bg-yellow" style={{ width: '35%' }}></div></div>
              <div className="cat-value">6,780,000 đ</div>
            </div>
            <div className="category-item">
              <div className="cat-icon"><Box size={18}/> Storage</div>
              <div className="cat-bar-container"><div className="cat-bar bg-purple" style={{ width: '25%' }}></div></div>
              <div className="cat-value">4,360,000 đ</div>
            </div>
            <div className="category-item">
              <div className="cat-icon"><Box size={18}/> Kitchen</div>
              <div className="cat-bar-container"><div className="cat-bar bg-gray" style={{ width: '20%' }}></div></div>
              <div className="cat-value">3,790,000 đ</div>
            </div>
          </div>
        </div>

        {/* Stock Alert */}
        <div className="card col-span-1">
          <div className="card-header">
            <h3>Stock alert</h3>
            <select className="form-control" style={{ width: 'auto', padding: '5px 10px', fontSize: '0.9rem' }}>
              <option>All</option>
            </select>
          </div>
          <div className="stock-alert-list">
            {recentProducts.filter(p => p.stock !== null && p.stock < 10).map(product => {
              const rawImage = getFirstProductImage(product.image);
              const imageSrc = rawImage && (rawImage.startsWith('http') || rawImage.startsWith('/')) ? rawImage : `/${rawImage}`;
              return (
                <div className="stock-item" key={product.id}>
                  <img src={imageSrc} className="product-img-td" alt={product.name} />
                  <div className="stock-info">
                    <div>{product.name}</div>
                  </div>
                  <div className="stock-status">{product.stock} items left</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
