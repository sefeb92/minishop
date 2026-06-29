import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../data/products';
import { getFirstProductImage } from '../../utils/image';
import { parseProductDescription } from '../../utils/promotion';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const rawImage = getFirstProductImage(product.image);
  const imageSrc = rawImage && (rawImage.startsWith('http') || rawImage.startsWith('/'))
    ? rawImage
    : `/${rawImage}`;

  const { promo } = parseProductDescription(product.description);
  
  const renderPromoBadge = () => {
    if (!promo || promo.type === 'none') {
      return <div className="seal-badge">Mới</div>;
    }
    
    if (promo.type === 'discount_percent') {
      return (
        <div className="seal-badge">
          -{promo.value}%
        </div>
      );
    }
    if (promo.type === 'discount_amount') {
      const displayAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(promo.value);
      return (
        <div className="seal-badge">
          -{displayAmount}
        </div>
      );
    }
    if (promo.type === 'bogo') {
      return (
        <div className="seal-badge">
          Mua 1 Tặng 1
        </div>
      );
    }
    if (promo.type === 'tiered') {
      return (
        <div className="seal-badge">
          Bán sỉ
        </div>
      );
    }
    if (promo.type === 'free_gift') {
      return (
        <div className="seal-badge">
          Quà tặng
        </div>
      );
    }
    if (promo.type === 'free_shipping') {
      return (
        <div className="seal-badge">
          Freeship
        </div>
      );
    }
    
    return <div className="seal-badge">Mới</div>;
  };

  return (
    <div className="product-card scroll-vertical">
      {renderPromoBadge()}
      <button className="btn-wishlist"><i className="fa-regular fa-heart"></i></button>
      <img 
        src={imageSrc} 
        alt={product.name} 
        className="product-img" 
        onClick={() => navigate(`/product/${product.id}`)}
        style={{ cursor: 'pointer' }}
      />
      <div className="product-info">
        <h3 
          className="product-name" 
          onClick={() => navigate(`/product/${product.id}`)}
          style={{ cursor: 'pointer' }}
        >
          {product.name}
        </h3>
        <div className="product-price">{formatCurrency(product.price)}</div>
        <p className="product-desc">{product.description}</p>
        <button 
          className="btn-detail" 
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <span className="ink-dot"></span>
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
