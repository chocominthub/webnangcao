# TechStore - Website Thương mại điện tử

Đồ án môn học **Lập trình Web nâng cao** – Cửa hàng công nghệ (linh kiện máy tính, điện thoại, laptop, phụ kiện, màn hình).

## Cấu trúc dự án

```
doanwebnangcao/
├── index.html          # Trang chủ, cấu trúc HTML
├── css/
│   └── styles.css      # Toàn bộ giao diện, responsive
├── js/
│   └── script.js       # Logic: giỏ hàng, tìm kiếm, lọc, sắp xếp, modal
└── README.md
```

## Chức năng

- **Trang chủ**: Banner, danh mục, lưới sản phẩm.
- **Danh mục**: Lọc theo Linh kiện PC, Điện thoại, Laptop, Phụ kiện, Màn hình.
- **Tìm kiếm**: Theo tên sản phẩm hoặc danh mục.
- **Sắp xếp**: Mặc định, giá tăng/giảm, tên A–Z.
- **Sản phẩm**: Thẻ sản phẩm, nút "Thêm vào giỏ", "Chi tiết".
- **Chi tiết sản phẩm**: Modal xem thông tin và thêm vào giỏ.
- **Giỏ hàng**: Sidebar mở/đóng, thêm/xóa sản phẩm, tăng/giảm số lượng, tổng tiền, lưu bằng `localStorage`.
- **Thanh toán**: Nút thanh toán (demo, có thể mở rộng).
- **Đăng nhập/Đăng ký**: Modal form (demo).
- **Liên hệ & Footer**: Thông tin liên hệ, liên kết.

## Cách chạy

1. Mở thư mục dự án trong máy.
2. Chạy trực tiếp file `index.html` bằng trình duyệt (double-click hoặc kéo vào trình duyệt).
3. Hoặc dùng Live Server trong VS Code/Cursor: chuột phải `index.html` → "Open with Live Server".

## Công nghệ

- HTML5
- CSS3 (biến CSS, Flexbox, Grid, responsive)
- JavaScript (ES6+, không dùng framework)
- Font: Be Vietnam Pro (Google Fonts)

## Mở rộng (gợi ý)

- Kết nối backend (Node.js, PHP, …) cho đăng nhập, đơn hàng, thanh toán.
- Thêm trang riêng cho từng danh mục hoặc chi tiết sản phẩm.
- Tích hợp cổng thanh toán (VNPay, Momo).
- Thay emoji sản phẩm bằng ảnh thật (upload hoặc URL).
