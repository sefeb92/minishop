export const products = [
  {
    id: 1,
    name: "Giỏ mây đan lưu trữ",
    category: "do-thu-cong",
    categoryName: "Đồ thủ công",
    price: 199000,
    image: "assets/images/products/do-thu-cong/gio-may-dan.jpg",
    description: "Thân thiện, tiện dụng"
  },
  {
    id: 2,
    name: "Tranh treo Macrame",
    category: "do-thu-cong",
    categoryName: "Đồ thủ công",
    price: 350000,
    image: "assets/images/products/do-thu-cong/tranh-treo-macrame.jpg",
    description: "Trang trí tường nghệ thuật"
  },
  {
    id: 3,
    name: "Khay gỗ trang trí",
    category: "do-thu-cong",
    categoryName: "Đồ thủ công",
    price: 250000,
    image: "assets/images/products/do-thu-cong/khay-go-trang-tri.jpg",
    description: "Gỗ tự nhiên nguyên khối"
  },
  {
    id: 4,
    name: "Khay gỗ hoa văn",
    category: "do-thu-cong",
    categoryName: "Đồ thủ công",
    price: 280000,
    image: "assets/images/products/do-thu-cong/khay-go-hoa-van.jpg",
    description: "Chạm khắc tinh xảo"
  },
  {
    id: 5,
    name: "Bình gốm Decor",
    category: "do-my-nghe",
    categoryName: "Đồ mỹ nghệ",
    price: 290000,
    image: "assets/images/products/do-my-nghe/binh-gom-trang-tri.jpg",
    description: "Gốm sứ cao cấp, trang nhã"
  },
  {
    id: 6,
    name: "Bộ bình gốm Minimal",
    category: "do-my-nghe",
    categoryName: "Đồ mỹ nghệ",
    price: 450000,
    image: "assets/images/products/do-my-nghe/bo-binh-gom-minimal.jpg",
    description: "Phong cách tối giản"
  },
  {
    id: 7,
    name: "Đèn tre thủ công",
    category: "do-my-nghe",
    categoryName: "Đồ mỹ nghệ",
    price: 590000,
    image: "assets/images/products/do-my-nghe/den-tre-thu-cong.jpg",
    description: "Ánh sáng ấm cúng"
  },
  {
    id: 8,
    name: "Đèn lồng tre",
    category: "do-my-nghe",
    categoryName: "Đồ mỹ nghệ",
    price: 320000,
    image: "assets/images/products/do-my-nghe/den-long-tre.jpg",
    description: "Đậm chất Á Đông"
  },
  {
    id: 9,
    name: "Kệ gỗ đa năng",
    category: "noi-that-gia-dung",
    categoryName: "Nội thất",
    price: 1293000,
    image: "assets/images/products/noi-that-gia-dung/ke-go-trang-tri.jpg",
    description: "Tiết kiệm không gian"
  },
  {
    id: 10,
    name: "Bàn ăn gỗ Sồi",
    category: "noi-that-gia-dung",
    categoryName: "Nội thất",
    price: 3490000,
    image: "assets/images/products/noi-that-gia-dung/bo-ban-an-go.jpg",
    description: "Gỗ sồi tự nhiên, bền đẹp"
  },
  {
    id: 11,
    name: "Sofa 2 chỗ Nordic",
    category: "noi-that-gia-dung",
    categoryName: "Nội thất",
    price: 2990000,
    image: "assets/images/products/noi-that-gia-dung/sofa-phong-khach.jpg",
    description: "Thiết kế tối giản, êm ái"
  },
  {
    id: 12,
    name: "Chậu cây để bàn",
    category: "noi-that-gia-dung",
    categoryName: "Trang trí",
    price: 150000,
    image: "assets/images/products/noi-that-gia-dung/chau-cay-de-ban.jpg",
    description: "Góc xanh mát"
  }
];

// Hàm format tiền tệ VNĐ
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
