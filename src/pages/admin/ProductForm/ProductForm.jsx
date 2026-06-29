import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, UploadCloud } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { getProductImages } from '../../../utils/image';
import { broccoliPromos, parseProductDescription, serializeProductDescription } from '../../../utils/promotion';
import './ProductForm.css';

const initialFormState = {
  name: '',
  category: '',
  price: '',
  status: 'Active',
  description: '',
  image: '',
  stock: 10
};

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState(initialFormState);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) {
        console.error('Error fetching categories:', error);
      } else if (data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);
  const [imagesList, setImagesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Promotion States
  const [selectedPromo, setSelectedPromo] = useState('none');
  const [promoConfig, setPromoConfig] = useState({
    discountPercent: 10,
    discountAmount: 20000,
    tiers: [{ qty: 2, discount: 10 }],
    giftText: 'Hộp quà cao cấp & thiệp viết tay'
  });
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error fetching product:', error);
          alert('Không tìm thấy sản phẩm!');
          navigate('/admin/products');
        } else if (data) {
          const { desc, promo } = parseProductDescription(data.description);
          
          setFormData({
            name: data.name,
            category: data.category,
            price: promo && promo.originalPrice ? promo.originalPrice : data.price, // original price
            status: data.status,
            description: desc || '',
            image: data.image || '',
            stock: data.stock || 10
          });
          
          if (promo) {
            setSelectedPromo(promo.type || 'none');
            setPromoConfig({
              discountPercent: promo.type === 'discount_percent' ? promo.value : 10,
              discountAmount: promo.type === 'discount_amount' ? promo.value : 20000,
              tiers: promo.type === 'tiered' ? promo.tiers : [{ qty: 2, discount: 10 }],
              giftText: promo.type === 'free_gift' ? promo.gift : 'Hộp quà cao cấp & thiệp viết tay'
            });
          }
          
          if (data.image) {
            const parsedUrls = getProductImages(data.image);
            const imgList = parsedUrls.map(url => ({
              type: 'existing',
              url: url,
              preview: url.startsWith('http') || url.startsWith('/') ? url : `/${url}`
            }));
            setImagesList(imgList);
          }
        }
        setLoading(false);
      };
      
      fetchProduct();
    }
  }, [id, navigate, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const newItems = [];
    
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" không phải là hình ảnh hợp lệ!`);
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert(`Kích thước ảnh "${file.name}" không được vượt quá 5MB`);
        continue;
      }
      
      newItems.push({
        type: 'new',
        file: file,
        preview: ''
      });
    }

    if (newItems.length === 0) return;

    let loadedCount = 0;
    const itemsWithPreview = [...newItems];
    
    itemsWithPreview.forEach((item, idx) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        itemsWithPreview[idx].preview = reader.result;
        loadedCount++;
        if (loadedCount === itemsWithPreview.length) {
          setImagesList(prev => [...prev, ...itemsWithPreview]);
        }
      };
      reader.readAsDataURL(item.file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadAllImages = async () => {
    const finalUrls = [];
    
    for (let item of imagesList) {
      if (item.type === 'existing') {
        finalUrls.push(item.url);
      } else if (item.type === 'new') {
        try {
          const fileExt = item.file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          const filePath = `uploads/${fileName}`;
          
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(item.file);
          });

          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filePath,
              contentType: item.file.type,
              base64
            })
          });
          
          const result = await res.json();
          if (!result.success) throw new Error(result.message);
          
          finalUrls.push(result.url);
        } catch (error) {
          console.error(`Lỗi khi tải ảnh ${item.file.name}:`, error);
          throw error;
        }
      }
    }
    
    return finalUrls;
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.category || !formData.price) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (Tên, Danh mục, Giá)');
      return;
    }

    if (imagesList.length === 0) {
      alert('Vui lòng chọn ít nhất một hình ảnh sản phẩm!');
      return;
    }

    setSaving(true);
    
    try {
      // 1. Upload all images and get urls array
      const imageUrls = await uploadAllImages();
      const imageJsonValue = JSON.stringify(imageUrls);

      // 2. Parse price & promotion logic
      const originalPrice = Number(formData.price);
      let sellingPrice = originalPrice;
      let promoPayload = { type: selectedPromo, originalPrice: originalPrice };

      if (selectedPromo === 'discount_percent') {
        sellingPrice = Math.round(originalPrice * (1 - promoConfig.discountPercent / 100));
        promoPayload.value = promoConfig.discountPercent;
      } else if (selectedPromo === 'discount_amount') {
        sellingPrice = Math.max(0, originalPrice - promoConfig.discountAmount);
        promoPayload.value = promoConfig.discountAmount;
      } else if (selectedPromo === 'tiered') {
        promoPayload.tiers = promoConfig.tiers;
      } else if (selectedPromo === 'free_gift') {
        promoPayload.gift = promoConfig.giftText;
      }

      // 3. Serialize description and promotion to JSON
      const serializedDescription = serializeProductDescription(formData.description, promoPayload);

      const productPayload = {
        name: formData.name,
        category: formData.category,
        price: sellingPrice,
        status: formData.status,
        description: serializedDescription,
        image: imageJsonValue,
        stock: Number(formData.stock || 10)
      };

      if (isEditing) {
        const res = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productPayload)
        });
        const result = await res.json();
        
        if (!result.success) throw new Error(result.message);
        alert(`Sản phẩm "${formData.name}" đã được cập nhật thành công!`);
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productPayload)
        });
        const result = await res.json();

        if (!result.success) throw new Error(result.message);
        alert(`Sản phẩm "${formData.name}" đã được thêm thành công!`);
      }
      
      navigate('/admin/products');
    } catch (error) {
      alert('Lỗi khi lưu sản phẩm: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = (indexToDelete) => {
    setImagesList(prev => prev.filter((_, idx) => idx !== indexToDelete));
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải thông tin sản phẩm...</div>;
  }

  return (
    <div className="product-form-page">
      {/* Broccoli bounce animation styling */}
      <style>{`
        @keyframes broccoli-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.08); }
        }
        .broccoli-btn:hover span {
          animation: broccoli-bounce 0.6s ease infinite;
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <button 
          onClick={() => navigate('/admin/products')}
          className="btn-icon" 
          style={{ background: 'white', border: '1px solid #ddd', padding: '8px', borderRadius: '50%' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="section-title" style={{ margin: 0 }}>
          {isEditing ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
        </h2>
      </div>
      
      <div className="product-form-panel">
        <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Tên sản phẩm *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nhập tên sản phẩm" className="form-input" required />
            </div>
            
            <div className="form-group">
              <label>Danh mục *</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="form-input" required>
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Giá gốc (VNĐ) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Nhập giá gốc" className="form-input" required />
            </div>

            <div className="form-group">
              <label>Số lượng kho</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="Số lượng" className="form-input" />
            </div>
            
            <div className="form-group">
              <label>Trạng thái</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="form-input">
                <option value="Active">Đang bán</option>
                <option value="Inactive">Ngừng bán</option>
              </select>
            </div>
          </div>
          
          {/* Broccoli Promo Section */}
          <div className="form-group" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Gắn Túp lơ Khuyến mãi 🥦</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '15px' }}>
              {broccoliPromos.map(promo => {
                const isActive = selectedPromo === promo.id;
                return (
                  <button
                    key={promo.id}
                    type="button"
                    onClick={() => setSelectedPromo(promo.id)}
                    className="broccoli-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: isActive ? promo.color : '#ddd',
                      background: isActive ? promo.bgColor : '#fff',
                      color: isActive ? promo.color : '#444',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                      boxShadow: isActive ? `0 0 0 2px ${promo.color}33` : 'none'
                    }}
                    title={promo.desc}
                  >
                    <span 
                      style={{ 
                        fontSize: '1.2rem',
                        display: 'inline-block',
                        animation: isActive ? 'broccoli-bounce 1s infinite' : 'none' 
                      }}
                    >
                      {promo.emoji}
                    </span>
                    {promo.name}
                  </button>
                );
              })}
            </div>
            
            <div style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', marginBottom: '15px' }}>
              ℹ️ {broccoliPromos.find(p => p.id === selectedPromo)?.desc}
            </div>

            {/* Config Panels */}
            {selectedPromo === 'discount_percent' && (
              <div className="promo-panel discount-percent">
                <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Phần trăm giảm giá (%)</label>
                <input 
                  type="number" 
                  value={promoConfig.discountPercent}
                  onChange={(e) => setPromoConfig(prev => ({ ...prev, discountPercent: Number(e.target.value) }))}
                  className="form-input"
                  style={{ maxWidth: '200px' }}
                  min="0"
                  max="100"
                />
              </div>
            )}

            {selectedPromo === 'discount_amount' && (
              <div className="promo-panel discount-amount">
                <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Số tiền giảm trực tiếp (VNĐ)</label>
                <input 
                  type="number" 
                  value={promoConfig.discountAmount}
                  onChange={(e) => setPromoConfig(prev => ({ ...prev, discountAmount: Number(e.target.value) }))}
                  className="form-input"
                  style={{ maxWidth: '200px' }}
                  min="0"
                />
              </div>
            )}

            {selectedPromo === 'tiered' && (
              <div className="promo-panel tiered">
                <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '12px' }}>Cấu hình mua nhiều giảm giá sâu (Giá sỉ)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {promoConfig.tiers.map((tier, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>Mua từ</span>
                      <input 
                        type="number" 
                        value={tier.qty}
                        onChange={(e) => {
                          const newTiers = [...promoConfig.tiers];
                          newTiers[index].qty = Number(e.target.value);
                          setPromoConfig(prev => ({ ...prev, tiers: newTiers }));
                        }}
                        style={{ width: '70px', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        min="1"
                      />
                      <span>sản phẩm trở lên, giảm</span>
                      <input 
                        type="number" 
                        value={tier.discount}
                        onChange={(e) => {
                          const newTiers = [...promoConfig.tiers];
                          newTiers[index].discount = Number(e.target.value);
                          setPromoConfig(prev => ({ ...prev, tiers: newTiers }));
                        }}
                        style={{ width: '70px', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        min="0"
                        max="100"
                      />
                      <span>%</span>
                      {promoConfig.tiers.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setPromoConfig(prev => ({ ...prev, tiers: prev.tiers.filter((_, i) => i !== index) }));
                          }}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setPromoConfig(prev => ({ ...prev, tiers: [...prev.tiers, { qty: 2, discount: 10 }] }));
                  }}
                  style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', background: 'white', border: '1px solid #8b5cf6', color: '#8b5cf6', borderRadius: '6px', fontWeight: 600 }}
                >
                  + Thêm bậc số lượng
                </button>
              </div>
            )}

            {selectedPromo === 'free_gift' && (
              <div className="promo-panel free-gift">
                <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Món quà tặng kèm</label>
                <input 
                  type="text" 
                  value={promoConfig.giftText}
                  onChange={(e) => setPromoConfig(prev => ({ ...prev, giftText: e.target.value }))}
                  className="form-input"
                  placeholder="Ví dụ: Hộp quà cao cấp & thiệp viết tay"
                />
              </div>
            )}
          </div>
          
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>Hình ảnh sản phẩm (Chọn một hoặc nhiều ảnh) *</label>
            <input 
              type="file" 
              accept="image/*" 
              multiple
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              style={{ display: 'none' }} 
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div 
                className="image-upload-box" 
                onClick={() => fileInputRef.current?.click()} 
                style={{ 
                  cursor: 'pointer', 
                  border: '2px dashed #ddd', 
                  padding: '25px', 
                  textAlign: 'center',
                  borderRadius: '8px',
                  backgroundColor: '#fbfbfb',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#0f9d58'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#ddd'}
              >
                <UploadCloud size={36} style={{ color: '#888', marginBottom: '8px' }} />
                <p style={{ margin: '0 0 5px', fontWeight: '600', fontSize: '14px' }}>Nhấn để tải các hình ảnh lên</p>
                <span style={{ color: '#888', fontSize: '12px' }}>Hỗ trợ chọn nhiều file ảnh (Tối đa 5MB/ảnh)</span>
              </div>

              {imagesList.length > 0 && (
                <div className="image-previews-grid">
                  {imagesList.map((item, index) => (
                    <div key={index} className="preview-item">
                      <img src={item.preview} alt={`Preview ${index}`} />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(index)}
                        className="delete-btn"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>Mô tả chi tiết</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Nhập mô tả sản phẩm..." className="form-input textarea" rows="5"></textarea>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate('/admin/products')}
              disabled={saving}
            >
              Hủy bỏ
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleSaveProduct}
              disabled={saving}
            >
              {saving ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <ShoppingBag size={18}/> 
                  {isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
