import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { getProductImages } from '../../utils/image';
import { Heart, ShoppingCart, Truck, RotateCcw, ShieldCheck, Plus, Minus, Star } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import { parseProductDescription } from '../../utils/promotion';
import { useCart } from '../../context/CartContext';
import './ProductDetail.css';

const categoryNameMap = {
  'do-thu-cong': 'Đồ thủ công',
  'do-my-nghe': 'Đồ mỹ nghệ',
  'noi-that-gia-dung': 'Nội thất & Gia dụng',
};

// Dynamic helper to return realistic specifications based on category/name
const getProductSpecs = (product) => {
  const cat = product.category;
  const name = product.name.toLowerCase();
  
  let material = 'Chất liệu tự nhiên';
  let color = 'Tự nhiên / Đa dạng';
  let weight = '1.0 kg';
  
  if (cat === 'do-thu-cong') {
    material = name.includes('mây') ? 'Sợi mây tre tự nhiên' : 'Sợi cotton cao cấp';
    color = 'Nâu gỗ tự nhiên';
    weight = '0.5 kg';
  } else if (cat === 'do-my-nghe') {
    material = name.includes('gốm') ? 'Đất sét nung nhiệt độ cao' : 'Gỗ sồi mỹ nghệ';
    color = 'Men gốm / Sơn phủ mờ';
    weight = '1.2 kg';
  } else if (cat === 'noi-that-gia-dung') {
    material = name.includes('kệ') || name.includes('bàn') ? 'Gỗ sồi tự nhiên' : 'Thép không gỉ';
    color = 'Trắng gỗ sồi / Kim loại sáng';
    weight = '5.4 kg';
  }
  
  return {
    material,
    color,
    weight,
    origin: 'Việt Nam'
  };
};

const getPromoBoxStyle = (type) => {
  switch (type) {
    case 'bogo':
      return { borderColor: '#fee2e2', background: '#fff5f5', color: '#ef4444' };
    case 'free_shipping':
      return { borderColor: '#dbeafe', background: '#f0f7ff', color: '#2563eb' };
    case 'free_gift':
      return { borderColor: '#fef3c7', background: '#fffbeb', color: '#d97706' };
    case 'tiered':
      return { borderColor: '#eedffc', background: '#faf5ff', color: '#7c3aed' };
    default:
      return { borderColor: '#ffedd5', background: '#fff7ed', color: '#ea580c' };
  }
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error fetching product:', error);
          setProduct(null);
        } else if (data) {
          setProduct(data);
          const imgs = getProductImages(data.image);
          if (imgs.length > 0) {
            setActiveImage(imgs[0]);
          }
          
          // Fetch 4 related products from the same category (excluding current)
          const { data: related, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('category', data.category)
            .neq('id', data.id)
            .limit(4);
          
          if (!relatedError && related) {
            setRelatedProducts(related);
          }
        }
      } catch (err) {
        console.error('Error in fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [id]);

  const handleQuantityChange = (type) => {
    if (type === 'inc') {
      setQuantity(prev => prev + 1);
    } else if (type === 'dec') {
      setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`);
  };

  const handleWishlist = () => {
    alert(`Đã thêm sản phẩm "${product.name}" vào danh sách yêu thích!`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h3>Đang tải chi tiết sản phẩm...</h3>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-header" style={{ textAlign: 'center', padding: '50px 0' }}>
        <h1>Sản phẩm không tồn tại</h1>
        <button className="btn btn-primary" onClick={() => navigate('/products')} style={{ marginTop: '20px' }}>Quay lại cửa hàng</button>
      </div>
    );
  }

  // Parse description and promotion configuration
  const { desc, promo } = parseProductDescription(product.description);
  
  const categoryName = categoryNameMap[product.category] || product.category;
  const images = getProductImages(product.image);
  const mainImageSrc = activeImage && (activeImage.startsWith('http') || activeImage.startsWith('/')) 
    ? activeImage 
    : (activeImage ? `/${activeImage}` : '');
    
  const specs = getProductSpecs(product);

  // Dynamic price calculation
  const sellingPrice = Number(product.price);
  let originalPrice = sellingPrice;
  let discountPercent = 0;
  let showDiscount = false;

  if (promo) {
    if (promo.type === 'discount_percent') {
      originalPrice = promo.originalPrice || sellingPrice;
      discountPercent = promo.value;
      showDiscount = true;
    } else if (promo.type === 'discount_amount') {
      originalPrice = promo.originalPrice || sellingPrice;
      discountPercent = Math.round((1 - sellingPrice / originalPrice) * 100);
      showDiscount = true;
    }
  }

  const promoBoxStyle = promo && promo.type !== 'none' ? getPromoBoxStyle(promo.type) : {};

  return (
    <div className="product-detail-container" style={{ padding: '20px 0' }}>
      {/* Breadcrumb */}
      <div className="breadcrumb" style={{ marginBottom: '25px', fontSize: '0.9rem', color: '#888' }}>
        <Link to="/" style={{ color: '#666' }}>Trang chủ</Link> &gt;{' '}
        <Link to="/products" style={{ color: '#666' }}>Sản phẩm</Link> &gt;{' '}
        <span className="current" style={{ color: '#111', fontWeight: 500 }}>{product.name}</span>
      </div>

      <div className="product-detail-layout">
        
        {/* Column 1: Vertical gallery */}
        <div className="pd-gallery">
          {images.length > 1 && (
            <div className="pd-thumbnails">
              {images.map((img, index) => {
                const thumbSrc = img.startsWith('http') || img.startsWith('/') ? img : `/${img}`;
                const isActive = img === activeImage;
                return (
                  <img 
                    key={index}
                    src={thumbSrc}
                    alt={`Thumbnail ${index}`}
                    className={`pd-thumbnails-img ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                  />
                );
              })}
            </div>
          )}
          <div className="pd-main-img">
            <img src={mainImageSrc} alt={product.name} />
          </div>
        </div>

        {/* Column 2: Center Info */}
        <div className="pd-info">
          <div style={{ marginBottom: '15px' }}>
            <div className="pd-badge-instock seal-badge">Còn hàng</div>
          </div>
          <div className="pd-category">{categoryName}</div>
          <h1 className="pd-title">{product.name}</h1>
          
          <div className="pd-rating">
            <div style={{ display: 'flex', gap: '2px' }}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
            </div>
            <span>(48 đánh giá)</span>
          </div>

          <div className="pd-price-row">
            <div className="pd-price-current">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sellingPrice)}
            </div>
            {showDiscount && (
              <>
                <div className="pd-price-old">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                </div>
                <div className="pd-price-discount">-{discountPercent}%</div>
              </>
            )}
          </div>

          <p className="pd-desc">{desc}</p>

          {/* Broccoli Promo Box */}
          {promo && promo.type !== 'none' && (
            <div 
              className="pd-promo-box" 
              style={{ 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '20px', 
                border: '1px solid',
                borderColor: promoBoxStyle.borderColor,
                background: promoBoxStyle.background,
                color: promoBoxStyle.color,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🥦</span> 
                <span>Ưu đãi Túp lơ từ Mini Shop</span>
              </div>
              
              {promo.type === 'bogo' && (
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  🔥 MUA 1 TẶNG 1: Mua sản phẩm này, nhận ngay một sản phẩm cùng loại miễn phí!
                </div>
              )}
              {promo.type === 'free_shipping' && (
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  🚚 MIỄN PHÍ VẬN CHUYỂN: Ưu đãi Freeship toàn quốc riêng cho sản phẩm này!
                </div>
              )}
              {promo.type === 'free_gift' && (
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  🎁 QUÀ TẶNG KÈM: Nhận ngay "{promo.gift}" gửi kèm sản phẩm.
                </div>
              )}
              {promo.type === 'tiered' && (
                <div style={{ fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '6px' }}>💎 BẢNG GIÁ SỈ (MUA NHIỀU GIẢM SÂU):</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
                    {promo.tiers.map((tier, idx) => {
                      const tierPrice = Math.round(sellingPrice * (1 - tier.discount / 100));
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#111' }}>
                          <span>Mua từ {tier.qty} sản phẩm:</span>
                          <strong style={{ color: '#ef4444' }}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tierPrice)} / cái (-{tier.discount}%)
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {(promo.type === 'discount_percent' || promo.type === 'discount_amount') && (
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  🏷️ GIẢM GIÁ TRỰC TIẾP: Tiết kiệm lớn từ giá gốc sản phẩm!
                </div>
              )}
            </div>
          )}

          <div className="pd-action-row">
            {/* Quantity Selector */}
            <div className="pd-quantity">
              <button onClick={() => handleQuantityChange('dec')}><Minus size={14} /></button>
              <input type="text" value={quantity} readOnly />
              <button onClick={() => handleQuantityChange('inc')}><Plus size={14} /></button>
            </div>
            
            {/* Add to Cart Button */}
            <button className="pd-add-cart-btn ink-btn-green" onClick={handleAddToCart}>
              <ShoppingCart size={18} /> Thêm vào giỏ hàng
            </button>
            
            {/* Wishlist Button */}
            <button className="pd-wishlist-btn" onClick={handleWishlist}>
              <Heart size={18} />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pd-trust-row">
            <div className="pd-trust-item">
              <Truck size={18} />
              <span>Giao hàng miễn phí</span>
            </div>
            <div className="pd-trust-item">
              <RotateCcw size={18} />
              <span>Đổi trả 30 ngày</span>
            </div>
            <div className="pd-trust-item">
              <ShieldCheck size={18} />
              <span>Thanh toán bảo mật</span>
            </div>
          </div>
        </div>

        {/* Column 3: Stacked details & specs */}
        <div className="pd-side-cards">
          {/* Specification card */}
          <div className="pd-side-card scroll-vertical">
            <h4>Thông tin chi tiết</h4>
            <div className="pd-spec-list">
              <div className="pd-spec-row">
                <span className="pd-spec-label">Chất liệu</span>
                <span className="pd-spec-value">{specs.material}</span>
              </div>
              <div className="pd-spec-row">
                <span className="pd-spec-label">Màu sắc</span>
                <span className="pd-spec-value">{specs.color}</span>
              </div>
              <div className="pd-spec-row">
                <span className="pd-spec-label">Trọng lượng</span>
                <span className="pd-spec-value">{specs.weight}</span>
              </div>
              <div className="pd-spec-row">
                <span className="pd-spec-label">Xuất xứ</span>
                <span className="pd-spec-value">{specs.origin}</span>
              </div>
            </div>
          </div>

          {/* Delivery card */}
          <div className="pd-side-card scroll-vertical">
            <h4>Vận chuyển</h4>
            <div className="pd-spec-list">
              <div className="pd-spec-row">
                <span className="pd-spec-label">Giao hàng nhanh</span>
                <span className="pd-spec-value" style={{ textAlign: 'right' }}>2-5 ngày làm việc</span>
              </div>
              <div className="pd-spec-row">
                <span className="pd-spec-label">Giao hàng hỏa tốc</span>
                <span className="pd-spec-value" style={{ textAlign: 'right' }}>1-2 ngày làm việc</span>
              </div>
              <div className="pd-spec-row">
                <span className="pd-spec-label">Phí vận chuyển</span>
                <span className="pd-spec-value" style={{ textAlign: 'right' }}>30.000 VND</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section" style={{ marginTop: '50px', borderTop: '2px solid var(--border-color)', paddingTop: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '25px', color: 'var(--text-dark)', fontFamily: "'Playfair Display', serif" }}>Sản phẩm liên quan</h2>
          <div className="products-grid">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={{ ...p, price: Number(p.price) }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
