import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';
import { ShoppingBag, Loader2, Calendar } from 'lucide-react';
import './Orders.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'order-status-badge status-pending';
    case 'Processing':
      return 'order-status-badge status-processing';
    case 'Completed':
      return 'order-status-badge status-completed';
    case 'Cancelled':
      return 'order-status-badge status-cancelled';
    default:
      return 'order-status-badge';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'Pending':
      return 'Chờ duyệt';
    case 'Processing':
      return 'Đang đóng gói';
    case 'Completed':
      return 'Đã hoàn thành';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải lịch sử đơn hàng của bạn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="container">
        <div className="orders-empty-state">
          <div className="orders-empty-icon">
            <ShoppingBag size={80} strokeWidth={1.5} />
          </div>
          <h2>Đăng nhập để xem lịch sử mua hàng</h2>
          <p>Vui lòng đăng nhập tài khoản của bạn để theo dõi hành trình đơn hàng nhé.</p>
          <button className="ink-btn-green" onClick={() => navigate('/login')} style={{ border: 'none' }}>
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--cinnabar-red)' }} />
      </div>
    );
  }

  return (
    <div className="container orders-page">
      <h1 className="orders-title">Đơn hàng của tôi</h1>

      {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}

      {orders.length === 0 ? (
        <div className="orders-empty-state">
          <div className="orders-empty-icon">
            <ShoppingBag size={80} strokeWidth={1.5} />
          </div>
          <h2>Bạn chưa có đơn hàng nào!</h2>
          <p>Hãy xem danh sách các sản phẩm gỗ mỹ nghệ chất lượng của chúng tôi và chọn mua sản phẩm yêu thích.</p>
          <button className="ink-btn-green" onClick={() => navigate('/products')} style={{ border: 'none' }}>
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card scroll-vertical">
              <div className="order-card-header">
                <div className="order-meta-info">
                  <div className="order-meta-group">
                    <label>Mã Đơn Hàng</label>
                    <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="order-meta-group">
                    <label>Ngày Đặt Hàng</label>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                  <div className="order-meta-group">
                    <label>Tổng Giá Trị</label>
                    <span style={{ color: 'var(--cinnabar-red)' }}>{formatCurrency(order.total_price)}</span>
                  </div>
                </div>
                
                <div>
                  <span className={getStatusBadgeClass(order.status)}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
              
              <div className="order-card-body">
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th style={{ textAlign: 'center' }}>Số lượng</th>
                      <th style={{ textAlign: 'right' }}>Đơn giá</th>
                      <th style={{ textAlign: 'right' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items?.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="order-item-desc">
                            <span className="order-item-title">{item.product_name}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          x{item.quantity}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '600' }}>
                          {formatCurrency(item.unit_price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="order-card-footer">
                <span><strong>Địa chỉ nhận hàng:</strong> {order.shipping_address}</span>
                <span><strong>SĐT:</strong> {order.phone}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
