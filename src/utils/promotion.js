export const broccoliPromos = [
  { 
    id: 'none', 
    name: 'Không khuyến mãi', 
    color: '#9ca3af', 
    bgColor: '#f3f4f6', 
    emoji: '🥦',
    desc: 'Bán đúng giá gốc của sản phẩm.'
  },
  { 
    id: 'discount_percent', 
    name: 'Giảm giá %', 
    color: '#ea580c', 
    bgColor: '#ffedd5', 
    emoji: '🥦',
    desc: 'Giảm giá sản phẩm theo tỷ lệ %.'
  },
  { 
    id: 'discount_amount', 
    name: 'Giảm tiền mặt', 
    color: '#854d0e', 
    bgColor: '#fef3c7', 
    emoji: '🥦',
    desc: 'Giảm trực tiếp một số tiền mặt cố định.'
  },
  { 
    id: 'bogo', 
    name: 'Mua 1 Tặng 1', 
    color: '#ef4444', 
    bgColor: '#fee2e2', 
    emoji: '🥦',
    desc: 'Mua 1 sản phẩm được tặng thêm 1 sản phẩm cùng loại.'
  },
  { 
    id: 'tiered', 
    name: 'Mua nhiều giảm sâu', 
    color: '#8b5cf6', 
    bgColor: '#f5f3ff', 
    emoji: '🥦',
    desc: 'Giảm giá sỉ theo số lượng khách hàng mua tăng dần.'
  },
  { 
    id: 'free_gift', 
    name: 'Quà tặng kèm', 
    color: '#d97706', 
    bgColor: '#fef3c7', 
    emoji: '🥦',
    desc: 'Tặng kèm phần quà đặc biệt (hộp quà, thiệp...) khi mua.'
  },
  { 
    id: 'free_shipping', 
    name: 'Freeship sản phẩm', 
    color: '#2563eb', 
    bgColor: '#dbeafe', 
    emoji: '🥦',
    desc: 'Miễn phí vận chuyển toàn quốc riêng cho sản phẩm này.'
  }
];

export const parseProductDescription = (descField) => {
  if (!descField) return { desc: '', promo: { type: 'none' } };
  const trimmed = descField.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        desc: parsed.desc || '',
        promo: parsed.promo || { type: 'none' }
      };
    } catch {
      return { desc: descField, promo: { type: 'none' } };
    }
  }
  return { desc: descField, promo: { type: 'none' } };
};

export const serializeProductDescription = (desc, promo) => {
  if (!promo || promo.type === 'none') {
    return desc;
  }
  return JSON.stringify({
    desc: desc,
    promo: promo
  });
};
