import { useParams, useNavigate } from 'react-router-dom';
import { products, formatCurrency } from '../data/products';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === parseInt(id));

  if (!product) {
    return (
      <div className="page-header">
        <h1>Sản phẩm không tồn tại</h1>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>Quay lại cửa hàng</button>
      </div>
    );
  }

  return (
    <div className="product-detail-container" style={{ padding: '40px 0' }}>
      <div className="product-detail-grid" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div className="product-detail-image" style={{ flex: '1', minWidth: '300px' }}>
          <img src={`/${product.image}`} alt={product.name} style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} />
        </div>
        <div className="product-detail-info" style={{ flex: '1', minWidth: '300px' }}>
          <div className="product-category" style={{ color: '#666', marginBottom: '10px' }}>{product.categoryName}</div>
          <h1 style={{ marginBottom: '20px' }}>{product.name}</h1>
          <div className="product-price" style={{ fontSize: '24px', fontWeight: 'bold', color: '#e63946', marginBottom: '20px' }}>{formatCurrency(product.price)}</div>
          <p style={{ marginBottom: '30px', lineHeight: '1.6' }}>{product.description}</p>
          
          <div className="product-actions" style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" style={{ flex: '1' }}>Thêm vào giỏ hàng</button>
            <button className="btn btn-outline" style={{ flex: '1' }}>Mua ngay</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
