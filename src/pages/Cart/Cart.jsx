import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getFirstProductImage } from '../../utils/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import './Cart.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleQtyChange = (productId, val) => {
    const quantity = parseInt(val, 10);
    if (!isNaN(quantity)) {
      updateQuantity(productId, quantity);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="cart-empty-state">
          <div className="cart-empty-icon">
            <ShoppingBag size={80} strokeWidth={1.5} />
          </div>
          <h2>Giỏ hàng của bạn đang trống!</h2>
          <p>Hãy thêm những sản phẩm thủ công mỹ nghệ xinh xắn để tô điểm cho không gian sống của bạn.</p>
          <button className="btn-continue-shopping btn" onClick={() => navigate('/products')}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1 className="cart-title">Giỏ hàng của bạn</h1>
      
      <div className="cart-layout">
        <div className="cart-items-section">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tổng cộng</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => {
                const product = item.product;
                const rawImage = getFirstProductImage(product.image);
                const imageSrc = rawImage && (rawImage.startsWith('http') || rawImage.startsWith('/'))
                  ? rawImage
                  : `/${rawImage}`;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="cart-item-info">
                        <img 
                          src={imageSrc} 
                          alt={product.name} 
                          className="cart-item-img"
                          onClick={() => navigate(`/product/${product.id}`)}
                        />
                        <div className="cart-item-details">
                          <span 
                            className="cart-item-name"
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            {product.name}
                          </span>
                          <span className="cart-item-category">{product.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="cart-price-cell">
                      {formatCurrency(product.price)}
                    </td>
                    <td>
                      <div className="cart-qty-control">
                        <button onClick={() => updateQuantity(product.id, item.quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <input 
                          type="text" 
                          value={item.quantity} 
                          onChange={(e) => handleQtyChange(product.id, e.target.value)}
                        />
                        <button onClick={() => updateQuantity(product.id, item.quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="cart-subtotal-cell">
                      {formatCurrency(product.price * item.quantity)}
                    </td>
                    <td>
                      <button 
                        className="btn-remove-item"
                        onClick={() => removeFromCart(product.id)}
                        title="Xóa sản phẩm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="cart-summary-section scroll-vertical">
          <h2 className="summary-title">Tóm tắt đơn hàng</h2>
          
          <div className="summary-row">
            <span>Tạm tính</span>
            <span>{formatCurrency(getCartTotal())}</span>
          </div>
          
          <div className="summary-row">
            <span>Phí vận chuyển</span>
            <span style={{ color: '#0f9d58', fontWeight: '500' }}>Miễn phí</span>
          </div>
          
          <div className="summary-row total">
            <span>Tổng cộng</span>
            <span>{formatCurrency(getCartTotal())}</span>
          </div>
          
          <button className="btn-checkout btn" onClick={() => navigate('/checkout')}>
            Tiến hành thanh toán
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
