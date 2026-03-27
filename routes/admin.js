const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Cấu hình Multer lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// Áp dụng adminAuth cho toàn bộ admin routes
router.use(adminAuth);

// ===== UPLOAD HÌNH ẢNH =====
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không tìm thấy file ảnh' });
    }
    // Trả về đường dẫn để lưu vào database
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ message: 'Upload thành công!', imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi upload ảnh', error: err.message });
  }
});

// ===== THỐNG KÊ TỔNG QUAN =====
router.get('/stats', async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, orders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.find().sort({ createdAt: -1 }).limit(10)
    ]);
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    res.json({
      totalProducts, totalOrders, totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      recentOrders: orders
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// ===== QUẢN LÝ SẢN PHẨM =====
router.get('/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Thêm sản phẩm thành công!', product });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json({ message: 'Cập nhật thành công!', product });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===== QUẢN LÝ ĐƠN HÀNG =====
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json({ message: 'Cập nhật trạng thái thành công!', order });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa đơn hàng' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===== QUẢN LÝ NGƯỜI DÙNG =====
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: 'Cập nhật quyền thành công!', user });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/users/:id/toggle-active', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    if (user.email === 'admin') return res.status(400).json({ message: 'Không thể vô hiệu hóa tài khoản admin gốc' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: user.isActive ? 'Đã kích hoạt tài khoản!' : 'Đã vô hiệu hóa tài khoản!', user });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    if (user.email === 'admin') return res.status(400).json({ message: 'Không thể xóa tài khoản admin gốc' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa người dùng' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
