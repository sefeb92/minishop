import { Link } from 'react-router-dom';
import { formatCurrency } from '../data/products';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-img">
        <img src={`/${product.image}`} alt={product.name} />
        <div className="product-actions">
          <button className="action-btn" title="Thêm vào giỏ"><i className="fa-solid fa-cart-plus"></i></button>
          <button className="action-btn" title="Yêu thích"><i className="fa-regular fa-heart"></i></button>
          <Link to={`/product/${product.id}`} className="action-btn" title="Xem chi tiết"><i className="fa-solid fa-eye"></i></Link>
        </div>
      </div>
      <div className="product-info">
        <div className="product-category">{product.categoryName}</div>
        <Link to={`/product/${product.id}`} className="product-title">{product.name}</Link>
        <div className="product-price">{formatCurrency(product.price)}</div>
      </div>
    </div>
  );
};

export default ProductCard;
