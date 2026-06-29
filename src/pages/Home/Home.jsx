import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { supabase } from '../../utils/supabase';
import './Home.css';

// Card width (255px) + gap (20px) = 275px per card slot
const CARD_SLOT = 275;

const getCategoryIcon = (slug) => {
  switch (slug) {
    case 'noi-that-gia-dung': return 'fa-couch';
    case 'do-thu-cong':       return 'fa-hand-sparkles';
    case 'do-my-nghe':        return 'fa-palette';
    default:                  return 'fa-tag';
  }
};

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts]             = useState([]);
  const [categories, setCategories]         = useState([]);
  const [loading, setLoading]               = useState(true);

  /* ── fetch categories ── */
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  /* ── fetch products ── */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from('products').select('*');
      if (activeCategory !== 'all') query = query.eq('category', activeCategory);
      const { data, error } = await query;
      if (!error && data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, [activeCategory]);

  const navigate = useNavigate();

  /* ── slider refs ── */
  const sliderRef     = useRef(null);
  const isDragging    = useRef(false);
  const startX        = useRef(0);
  const scrollStart   = useRef(0);
  const velocity      = useRef(0);
  const lastX         = useRef(0);
  const animFrameId   = useRef(null);
  const isJumping     = useRef(false); // prevent recursive scroll events during silent jump

  /* ── derived data ── */
  const filteredProducts = activeCategory === 'all' ? products.slice(0, 8) : products;

  // Triple the list so we have room to scroll left AND right infinitely
  const displayProducts = filteredProducts.length > 0
    ? [...filteredProducts, ...filteredProducts, ...filteredProducts]
    : [];

  const singleSetWidth = filteredProducts.length * CARD_SLOT;

  /* ── jump to middle set on load / category change ── */
  useEffect(() => {
    if (sliderRef.current && filteredProducts.length > 0) {
      // Disable smooth transition for this instant jump
      sliderRef.current.style.scrollBehavior = 'auto';
      sliderRef.current.scrollLeft = singleSetWidth;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProducts.length]);

  /* ── infinite loop boundary handler ── */
  const handleScroll = useCallback(() => {
    if (!sliderRef.current || filteredProducts.length === 0 || isJumping.current) return;
    const { scrollLeft } = sliderRef.current;

    if (scrollLeft >= singleSetWidth * 2) {
      // Scrolled into the third copy → silently jump back to first copy equivalent
      isJumping.current = true;
      sliderRef.current.scrollLeft = scrollLeft - singleSetWidth;
      isJumping.current = false;
    } else if (scrollLeft < singleSetWidth * 0.3) {
      // Scrolled into the leading buffer → silently jump forward to middle equivalent
      isJumping.current = true;
      sliderRef.current.scrollLeft = scrollLeft + singleSetWidth;
      isJumping.current = false;
    }
  }, [filteredProducts.length, singleSetWidth]);

  /* ── momentum animation ── */
  const momentumScroll = useCallback(() => {
    if (!sliderRef.current) return;
    velocity.current *= 0.92;
    sliderRef.current.scrollLeft += velocity.current;
    if (Math.abs(velocity.current) > 0.5) {
      animFrameId.current = requestAnimationFrame(momentumScroll);
    }
  }, []);

  /* ── drag handlers ── */
  const handleMouseDown = (e) => {
    if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    isDragging.current = true;
    sliderRef.current.style.cursor = 'grabbing';
    startX.current  = e.pageX;
    scrollStart.current = sliderRef.current.scrollLeft;
    lastX.current   = e.pageX;
    velocity.current = 0;
  };

  const handleMouseLeave = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (sliderRef.current) sliderRef.current.style.cursor = 'grab';
    animFrameId.current = requestAnimationFrame(momentumScroll);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (sliderRef.current) sliderRef.current.style.cursor = 'grab';
    animFrameId.current = requestAnimationFrame(momentumScroll);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const dx = e.pageX - lastX.current;
    velocity.current  = -dx * 1.5;
    lastX.current     = e.pageX;
    sliderRef.current.scrollLeft = scrollStart.current - (e.pageX - startX.current);
  };

  const handleWheel = (e) => {
    if (sliderRef.current) {
      e.preventDefault();
      sliderRef.current.scrollLeft += e.deltaY * 1.5;
    }
  };

  /* ── arrow button scroll ── */
  const scrollSlider = (dir) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  /* ── render ── */
  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-banner">
          <div className="hero-content">
            <h1>Sống đẹp mỗi ngày<br/>cùng Mini Shop</h1>
            <p>Sản phẩm chất lượng thủ công cho tổ ấm của bạn.</p>
            <button className="btn-cta" onClick={() => navigate('/products')}>Mua sắm ngay</button>

            <div className="hero-features">
              <div className="feature-item">
                <i className="fa-solid fa-truck-fast"></i>
                <div><strong>Giao hàng nhanh</strong><br/>Toàn quốc</div>
              </div>
              <div className="feature-item">
                <i className="fa-solid fa-shield-halved"></i>
                <div><strong>Bảo hành chính hãng</strong><br/>7 ngày đổi trả</div>
              </div>
            </div>
          </div>
          <div className="hero-image-side">
            <img src="/assets/images/banner/banner-trang-chu-mini-shop.jpg" alt="Sản phẩm nổi bật" />
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER ── */}
      <section className="categories-filter" id="categoryFilter">
        <button
          className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          <i className="fa-solid fa-border-all"></i> Tất cả
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`cat-pill ${activeCategory === cat.slug ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.slug)}
          >
            <i className={`fa-solid ${getCategoryIcon(cat.slug)}`}></i> {cat.name}
          </button>
        ))}
      </section>

      {/* ── FEATURED PRODUCTS (infinite loop slider) ── */}
      <section className="featured-products">
        <div className="section-title">
          <h2>Sản phẩm nổi bật</h2>
          <div className="slider-controls">
            <button className="slider-arrow" onClick={() => scrollSlider(-1)} aria-label="Cuộn trái">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="slider-arrow" onClick={() => scrollSlider(1)} aria-label="Cuộn phải">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            <Link to="/products" className="view-all">Xem tất cả →</Link>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Đang tải sản phẩm...</div>
        ) : (
          <div
            className="products-grid slider-mode"
            id="productsGrid"
            ref={sliderRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
          >
            {displayProducts.map((product, index) => (
              <ProductCard
                key={`${product.id}-${index}`}
                product={{ ...product, price: Number(product.price) }}
              />
            ))}
            {displayProducts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '50px 0', color: '#666', width: '100%' }}>
                Không có sản phẩm nào.
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default Home;
