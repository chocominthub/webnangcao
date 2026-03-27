/**
 * Script seed dữ liệu sản phẩm công nghệ vào MongoDB
 * Chạy: node seed.js
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');

const U = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80`;

const products = [
  // ===== LINH KIỆN PC =====
  {
    name: 'CPU Intel Core i5-13400F',
    category: 'linh-kien',
    price: 4990000,
    originalPrice: 5490000,
    description: 'CPU Intel thế hệ 13, 10 nhân 16 luồng (6P+4E), xung nhịp cơ bản 2.5GHz, boost 4.6GHz. Phù hợp gaming và làm việc văn phòng. Socket LGA1700.',
    image: U('1678435733095-6dccb4f1a5c8'),
    stock: 50,
    rating: 4.8,
    reviews: 124,
    badge: 'Bán chạy'
  },
  {
    name: 'CPU AMD Ryzen 5 5600X',
    category: 'linh-kien',
    price: 4290000,
    originalPrice: 4890000,
    description: 'CPU AMD AM4, 6 nhân 12 luồng, xung nhịp cơ bản 3.7GHz, boost 4.6GHz. Hiệu năng tuyệt vời, TDP 65W tiết kiệm điện.',
    image: U('1686195165991-74af7c2918d5'),
    stock: 35,
    rating: 4.7,
    reviews: 98,
    badge: 'Hot'
  },
  {
    name: 'VGA NVIDIA RTX 4060 Ti 8GB',
    category: 'linh-kien',
    price: 11990000,
    originalPrice: 13500000,
    description: 'Card đồ họa RTX 40 series, 8GB GDDR6 128-bit, hỗ trợ ray tracing và DLSS 3. Chiến mọi game AAA ở 1080p Ultra.',
    image: U('1555618254-84e2cf498b01'),
    stock: 20,
    rating: 4.9,
    reviews: 67,
    badge: 'Mới'
  },
  {
    name: 'RAM Corsair DDR4 16GB (2x8GB) 3200MHz',
    category: 'linh-kien',
    price: 890000,
    originalPrice: 1090000,
    description: 'Bộ nhớ RAM DDR4 dual channel 16GB, bus 3200MHz, tản nhiệt nhôm Vengeance LPX. Tương thích AMD & Intel.',
    image: U('1760708626495-91e1415be067'),
    stock: 100,
    rating: 4.6,
    reviews: 215,
    badge: ''
  },
  {
    name: 'SSD Samsung 970 EVO Plus 500GB NVMe M.2',
    category: 'linh-kien',
    price: 1150000,
    originalPrice: 1390000,
    description: 'Ổ cứng SSD chuẩn NVMe M.2 PCIe 3.0, tốc độ đọc 3500MB/s, ghi 3300MB/s. Bảo hành 5 năm.',
    image: U('1666868213704-1677b7f04c30'),
    stock: 80,
    rating: 4.8,
    reviews: 302,
    badge: 'Bán chạy'
  },
  {
    name: 'Mainboard ASUS B760M-A WiFi',
    category: 'linh-kien',
    price: 2890000,
    originalPrice: 3290000,
    description: 'Bo mạch chủ Intel B760, socket LGA1700, hỗ trợ CPU thế hệ 12/13/14, DDR4/DDR5, WiFi 6, PCIe 4.0.',
    image: U('1613483187550-1458bbdb0996'),
    stock: 25,
    rating: 4.7,
    reviews: 45,
    badge: ''
  },
  {
    name: 'PSU Cooler Master 650W 80+ Bronze',
    category: 'linh-kien',
    price: 950000,
    originalPrice: 1150000,
    description: 'Nguồn máy tính 650W, chứng nhận 80+ Bronze, bảo vệ quá áp/quá dòng/ngắn mạch. Bảo hành 5 năm.',
    image: U('1597872200969-2b65d56bd16b'),
    stock: 40,
    rating: 4.5,
    reviews: 88,
    badge: ''
  },

  // ===== ĐIỆN THOẠI =====
  {
    name: 'iPhone 15 Pro 256GB',
    category: 'dien-thoai',
    price: 29990000,
    originalPrice: 31990000,
    description: 'iPhone 15 Pro với chip A17 Pro titanium, camera 48MP ProRAW, Dynamic Island, cổng USB-C, quay phim 4K 60fps ProRes.',
    image: U('1695048133021-8ec09d89e6c0'),
    stock: 15,
    rating: 4.9,
    reviews: 456,
    badge: 'Hot'
  },
  {
    name: 'Samsung Galaxy S24 Ultra 256GB',
    category: 'dien-thoai',
    price: 32990000,
    originalPrice: 35990000,
    description: 'Flagship Samsung với bút S Pen tích hợp, camera 200MP Zoom quang 10x, chip Snapdragon 8 Gen 3, màn hình 6.8" Dynamic AMOLED 2X 120Hz.',
    image: U('1698778573682-346b14ab36f3'),
    stock: 12,
    rating: 4.8,
    reviews: 321,
    badge: 'Mới'
  },
  {
    name: 'Xiaomi 14 Ultra 512GB',
    category: 'dien-thoai',
    price: 23990000,
    originalPrice: 25990000,
    description: 'Điện thoại flagship Xiaomi, camera Leica Summilux, sensor 1 inch, chip Snapdragon 8 Gen 3, sạc nhanh 90W.',
    image: U('1598327105854-72d785f2d93d'),
    stock: 8,
    rating: 4.7,
    reviews: 134,
    badge: ''
  },
  {
    name: 'OPPO Find X7 Pro 256GB',
    category: 'dien-thoai',
    price: 21990000,
    originalPrice: 23990000,
    description: 'OPPO flagship với chip Dimensity 9300, camera Hasselblad zoom 6x, màn hình LTPO 120Hz, sạc siêu nhanh 100W.',
    image: U('1511707171634-5f897ff02aa9'),
    stock: 10,
    rating: 4.6,
    reviews: 89,
    badge: ''
  },

  // ===== LAPTOP =====
  {
    name: 'ASUS ROG Strix G16 (RTX 4060)',
    category: 'laptop',
    price: 35990000,
    originalPrice: 39990000,
    description: 'Laptop gaming cao cấp, Intel Core i7-13650HX, RTX 4060 8GB, RAM 16GB DDR5, SSD 512GB, màn hình 16" 165Hz QHD.',
    image: U('1618424181497-157f25b6ddd5'),
    stock: 8,
    rating: 4.8,
    reviews: 76,
    badge: 'Hot'
  },
  {
    name: 'Dell XPS 15 OLED (i7-13700H)',
    category: 'laptop',
    price: 42990000,
    originalPrice: 45990000,
    description: 'Laptop cao cấp sáng tạo nội dung, màn hình OLED 3.5K 60Hz, Intel i7-13700H, RTX 4060, RAM 32GB, SSD 1TB.',
    image: U('1496181133206-80ce9b88a853'),
    stock: 5,
    rating: 4.9,
    reviews: 52,
    badge: 'Cao cấp'
  },
  {
    name: 'Lenovo ThinkPad E14 Gen 5',
    category: 'laptop',
    price: 18990000,
    originalPrice: 21990000,
    description: 'Laptop văn phòng bền bỉ, Intel Core i5-1335U, RAM 16GB, SSD 512GB, màn hình 14" IPS, bàn phím spill-resistant.',
    image: U('1588872657578-7efd1f1555ed'),
    stock: 20,
    rating: 4.6,
    reviews: 113,
    badge: ''
  },
  {
    name: 'MacBook Air M3 15" 256GB',
    category: 'laptop',
    price: 34990000,
    originalPrice: 36990000,
    description: 'MacBook Air chip M3, màn hình Liquid Retina 15.3", pin 18 giờ, RAM 8GB Unified, SSD 256GB. Siêu mỏng 11.5mm.',
    image: U('1517336714731-489689fd1ca8'),
    stock: 10,
    rating: 4.9,
    reviews: 238,
    badge: 'Bán chạy'
  },

  // ===== PHỤ KIỆN =====
  {
    name: 'Bàn phím cơ Keychron K2 Pro',
    category: 'phu-kien',
    price: 1990000,
    originalPrice: 2290000,
    description: 'Bàn phím cơ không dây 75%, switch Gateron Pro, kết nối Bluetooth 5.1 / USB-C, hot-swappable, tương thích Mac/Windows.',
    image: U('1546435770-a3e426bf472b'),
    stock: 60,
    rating: 4.7,
    reviews: 187,
    badge: ''
  },
  {
    name: 'Chuột Logitech MX Master 3S',
    category: 'phu-kien',
    price: 2490000,
    originalPrice: 2890000,
    description: 'Chuột không dây cao cấp, cảm biến 8000 DPI, cuộn MagSpeed, kết nối Logi Bolt & Bluetooth, pin 70 ngày.',
    image: U('1491553895911-0055eca6402d'),
    stock: 45,
    rating: 4.8,
    reviews: 264,
    badge: 'Bán chạy'
  },
  {
    name: 'Tai nghe Sony WH-1000XM5',
    category: 'phu-kien',
    price: 7990000,
    originalPrice: 8990000,
    description: 'Tai nghe chống ồn ANC hàng đầu thế giới, driver 30mm, pin 30 giờ, chất âm Hi-Res, kết nối multipoint 2 thiết bị.',
    image: U('1577174881658-0f30ed549adc'),
    stock: 30,
    rating: 4.9,
    reviews: 412,
    badge: 'Hot'
  },
  {
    name: 'Webcam Logitech C920 HD Pro',
    category: 'phu-kien',
    price: 1890000,
    originalPrice: 2190000,
    description: 'Webcam Full HD 1080p 30fps, autofocus Carl Zeiss, tích hợp 2 mic stereo, cổng USB-A, tương thích mọi phần mềm họp.',
    image: U('1587614313085-5f21f34f5518'),
    stock: 55,
    rating: 4.6,
    reviews: 156,
    badge: ''
  },

  // ===== MÀN HÌNH =====
  {
    name: 'LG 27UK850 27" 4K IPS USB-C',
    category: 'man-hinh',
    price: 8990000,
    originalPrice: 10990000,
    description: 'Màn hình 27 inch 4K UHD, tấm nền IPS sRGB 99%, cổng USB-C 60W, HDR400, FreeSync, độ trễ 5ms.',
    image: U('1527800792452-506aacb2101f'),
    stock: 15,
    rating: 4.7,
    reviews: 93,
    badge: ''
  },
  {
    name: 'Samsung Odyssey G7 32" 240Hz',
    category: 'man-hinh',
    price: 11990000,
    originalPrice: 13990000,
    description: 'Màn hình gaming 32 inch WQHD 240Hz, cong 1000R, VA 1ms, G-Sync Compatible, HDR600, lý tưởng cho FPS/MOBA.',
    image: U('1542751110-b2ab6f3d0731'),
    stock: 10,
    rating: 4.8,
    reviews: 145,
    badge: 'Hot'
  },
  {
    name: 'Dell S2421HN 24" Full HD IPS',
    category: 'man-hinh',
    price: 3290000,
    originalPrice: 3890000,
    description: 'Màn hình văn phòng 24 inch Full HD 1080p, tấm nền IPS góc nhìn 178°, viền siêu mỏng 3 mặt, cổng HDMI x2, không flicker.',
    image: U('1585386959984-a4155224a1ad'),
    stock: 40,
    rating: 4.5,
    reviews: 198,
    badge: ''
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công!');

    // Xóa dữ liệu cũ
    await Product.deleteMany({});
    console.log('🗑️  Đã xóa dữ liệu cũ');

    // Thêm dữ liệu mới
    const inserted = await Product.insertMany(products);
    console.log(`✅ Đã thêm ${inserted.length} sản phẩm vào MongoDB!`);

    // Hiển thị danh sách
    inserted.forEach(p => console.log(`  - [${p.category}] ${p.name}: ${p.price.toLocaleString('vi-VN')}₫`));

    console.log('\n🎉 Seed hoàn tất!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi seed:', err.message);
    process.exit(1);
  }
}

seed();
