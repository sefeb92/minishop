import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { Loader2, Eye, EyeOff, CheckCircle2, ChevronRight, Ban } from 'lucide-react';
import './Orders.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    month: 'short',
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
      return 'Đang xử lý';
    case 'Completed':
      return 'Hoàn thành';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError('Đã xảy ra lỗi khi tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateError) throw updateError;
      
      // Update local state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.');
    }
  };

  const toggleExpandOrder = (orderId) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary-color)' }} />
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <h1 className="admin-orders-title">Quản lý Đơn hàng</h1>

      {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}

      <div className="admin-orders-tabs">
        <button 
          className={`admin-order-tab ${activeTab === 'All' ? 'active' : ''}`}
          onClick={() => { setActiveTab('All'); setExpandedOrderId(null); }}
        >
          Tất cả ({orders.length})
        </button>
        <button 
          className={`admin-order-tab ${activeTab === 'Pending' ? 'active' : ''}`}
          onClick={() => { setActiveTab('Pending'); setExpandedOrderId(null); }}
        >
          Chờ duyệt ({orders.filter(o => o.status === 'Pending').length})
        </button>
        <button 
          className={`admin-order-tab ${activeTab === 'Processing' ? 'active' : ''}`}
          onClick={() => { setActiveTab('Processing'); setExpandedOrderId(null); }}
        >
          Đang xử lý ({orders.filter(o => o.status === 'Processing').length})
        </button>
        <button 
          className={`admin-order-tab ${activeTab === 'Completed' ? 'active' : ''}`}
          onClick={() => { setActiveTab('Completed'); setExpandedOrderId(null); }}
        >
          Hoàn thành ({orders.filter(o => o.status === 'Completed').length})
        </button>
        <button 
          className={`admin-order-tab ${activeTab === 'Cancelled' ? 'active' : ''}`}
          onClick={() => { setActiveTab('Cancelled'); setExpandedOrderId(null); }}
        >
          Đã hủy ({orders.filter(o => o.status === 'Cancelled').length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="orders-table-wrapper admin-orders-empty">
          Không tìm thấy đơn hàng nào ở bộ lọc này.
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách hàng</th>
                <th>Điện thoại</th>
                <th>Ngày đặt</th>
                <th>Tổng cộng</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <>
                    <tr key={order.id}>
                      <td style={{ fontWeight: '600' }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td>{order.customer_name}</td>
                      <td>{order.phone}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                        {formatCurrency(order.total_price)}
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(order.status)}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>
                        <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="admin-order-btn btn-toggle-detail"
                            onClick={() => toggleExpandOrder(order.id)}
                            title={isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}
                          >
                            {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
                            Chi tiết
                          </button>

                          {order.status === 'Pending' && (
                            <>
                              <button 
                                className="admin-order-btn btn-approve"
                                onClick={() => handleUpdateStatus(order.id, 'Processing')}
                              >
                                <ChevronRight size={14} />
                                Duyệt
                              </button>
                              <button 
                                className="admin-order-btn btn-cancel"
                                onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                              >
                                <Ban size={14} />
                                Hủy đơn
                              </button>
                            </>
                          )}

                          {order.status === 'Processing' && (
                            <>
                              <button 
                                className="admin-order-btn btn-complete"
                                onClick={() => handleUpdateStatus(order.id, 'Completed')}
                              >
                                <CheckCircle2 size={14} />
                                Hoàn thành
                              </button>
                              <button 
                                className="admin-order-btn btn-cancel"
                                onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                              >
                                <Ban size={14} />
                                Hủy đơn
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="admin-order-row-expanded">
                        <td colSpan={7}>
                          <div className="admin-items-detail-card">
                            <h3 className="admin-items-detail-title">
                              Chi tiết đơn hàng #{order.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <p style={{ marginBottom: '15px', fontSize: '0.9rem' }}>
                              <strong>Địa chỉ nhận hàng:</strong> {order.shipping_address} | <strong>Email:</strong> {order.customer_email}
                            </p>
                            
                            <table className="order-items-table" style={{ width: '100%' }}>
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
                                    <td>{item.product_name}</td>
                                    <td style={{ textAlign: 'center' }}>x{item.quantity}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: '600' }}>
                                      {formatCurrency(item.unit_price * item.quantity)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
