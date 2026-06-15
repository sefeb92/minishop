# Hướng Dẫn Dùng Ảnh Cho Mini Shop

File này dùng để thiết kế slide và prompt demo Buổi 2.

## 1. Cách đưa ảnh vào project

Trong project `mini-shop`, đặt ảnh theo cấu trúc:

```text
mini-shop/
├─ index.html
├─ style.css
├─ script.js
├─ data/
│  └─ products.js
└─ assets/
   └─ images/
      ├─ banner/
      │  └─ banner-trang-chu-mini-shop.jpg
      └─ products/
         ├─ do-thu-cong/
         ├─ do-my-nghe/
         └─ noi-that-gia-dung/
```

Trong bộ ảnh đã chuẩn bị, chỉ cần copy nguyên folder `assets` vào project `mini-shop`.

## 2. Ảnh nào dùng để làm gì?

### Banner

- `assets/images/banner/banner-trang-chu-mini-shop.jpg`
  - Dùng cho hero banner đầu trang Home.
  - Đây là ảnh lớn để tạo cảm giác website thật.
  - Nên đặt bên phải hoặc làm nền hero, phần chữ đặt ở vùng còn trống.

### Đồ thủ công

- `assets/images/products/do-thu-cong/gio-may-dan.jpg`
- `assets/images/products/do-thu-cong/tranh-treo-macrame.jpg`
- `assets/images/products/do-thu-cong/khay-go-trang-tri.jpg`
- `assets/images/products/do-thu-cong/khay-go-hoa-van.jpg`

Dùng cho danh mục `Đồ thủ công`.

### Đồ mỹ nghệ

- `assets/images/products/do-my-nghe/binh-gom-trang-tri.jpg`
- `assets/images/products/do-my-nghe/bo-binh-gom-minimal.jpg`
- `assets/images/products/do-my-nghe/den-tre-thu-cong.jpg`
- `assets/images/products/do-my-nghe/den-long-tre.jpg`

Dùng cho danh mục `Đồ mỹ nghệ`.

### Nội thất/gia dụng

- `assets/images/products/noi-that-gia-dung/ke-go-trang-tri.jpg`
- `assets/images/products/noi-that-gia-dung/bo-ban-an-go.jpg`
- `assets/images/products/noi-that-gia-dung/sofa-phong-khach.jpg`
- `assets/images/products/noi-that-gia-dung/chau-cay-de-ban.jpg`

Dùng cho danh mục `Nội thất & gia dụng`.

## 3. Cách ghi đường dẫn trong dữ liệu mẫu

Trong `data/products.js`, mỗi sản phẩm nên có field `image`.

Ví dụ:

```js
{
  id: 1,
  name: "Giỏ mây đan",
  category: "do-thu-cong",
  price: 290000,
  image: "assets/images/products/do-thu-cong/gio-may-dan.jpg",
  description: "Giỏ mây đan thủ công, phù hợp để trang trí hoặc lưu trữ đồ nhỏ."
}
```

## 4. Điểm cần kiểm tra

- Hero banner dùng đúng ảnh `banner-trang-chu-mini-shop.jpg`.
- Product card không bị méo ảnh.
- Mỗi danh mục có ảnh sản phẩm đúng nhóm.
- Đường dẫn ảnh trong `products.js` khớp chính xác với tên file.
- Khi chuyển project sang máy khác, copy đủ folder `assets`.
