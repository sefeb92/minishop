import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import './Checkout.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  // Autofill if user is logged in
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // If cart is empty and not success, redirect to cart
  useEffect(() => {
    if (cart.length === 0 && !success) {
      navigate('/products');
    }
  }, [cart, success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !address) {
      setError('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Ghi thông tin chung vào bảng orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user ? user.id : null,
          customer_name: name,
          customer_email: email,
          shipping_address: address,
          phone: phone,
          total_price: getCartTotal(),
          status: 'Pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Ghi chi tiết các sản phẩm vào bảng order_items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Cập nhật số lượng tồn kho sản phẩm (nếu có trường stock)
      for (const item of cart) {
        if (item.product.stock !== undefined) {
          const newStock = Math.max(0, item.product.stock - item.quantity);
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product.id);
        }
      }

      // Đặt trạng thái thành công
      setOrderId(orderData.id.slice(0, 8).toUpperCase());
      clearCart();
      setSuccess(true);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Đã xảy ra lỗi khi xử lý đơn đặt hàng của bạn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container">
        <div className="checkout-success-view">
          <div className="success-icon">
            <ShieldCheck size={80} strokeWidth={1.5} />
          </div>
          <h2>Đặt hàng thành công!</h2>
          <p>
            Cảm ơn bạn đã mua sắm tại <strong>Mini Shop</strong>. Mã đơn hàng của bạn là <strong>#{orderId}</strong>.
            <br />
            Chúng tôi đã nhận được thông tin đơn hàng và sẽ liên hệ giao hàng sớm nhất.
          </p>
          <div className="btn-group">
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              Về Trang chủ
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>
              Xem Đơn hàng của tôi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: 'var(--text-light)', fontWeight: '500' }}>
          <ArrowLeft size={16} />
          Quay lại Giỏ hàng
        </button>
      </div>

      <h1 className="checkout-title">Thanh toán đơn hàng</h1>

      <div className="checkout-layout">
        <div className="checkout-form-section scroll-vertical">
          <h2 className="checkout-section-title">Thông tin giao nhận hàng</h2>
          {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #fee2e2' }}>{error}</div>}
          
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group-row">
              <div className="form-group">
                <label>Họ và tên khách hàng *</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại nhận hàng *</label>
                <input 
                  type="tel" 
                  placeholder="Ví dụ: 0987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Địa chỉ Email nhận hóa đơn *</label>
              <input 
                type="email" 
                placeholder="Ví dụ: email@cua-ban.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Địa chỉ nhận hàng chi tiết *</label>
              <textarea 
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-place-order btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang xử lý đơn hàng...
                </>
              ) : (
                'Xác nhận Đặt hàng'
              )}
            </button>
          </form>
        </div>

        <div className="checkout-summary-section scroll-vertical">
          <h2 className="summary-title">Đơn hàng của bạn</h2>
          
          <div className="checkout-items-list">
            {cart.map((item) => (
              <div key={item.product.id} className="checkout-item">
                <span className="checkout-item-name-qty">
                  {item.product.name} <strong style={{ color: 'var(--text-light)' }}>x{item.quantity}</strong>
                </span>
                <span className="checkout-item-price">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Tạm tính</span>
            <span>{formatCurrency(getCartTotal())}</span>
          </div>
          
          <div className="summary-row">
            <span>Phí vận chuyển</span>
            <span style={{ color: '#0f9d58', fontWeight: '500' }}>Miễn phí</span>
          </div>

          <div className="summary-row total checkout-summary-total">
            <span>Tổng số tiền</span>
            <span>{formatCurrency(getCartTotal())}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
