const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../utils/sendEmail');

// GET /api/orders/myorders - Lấy đơn hàng của user đang đăng nhập
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ 'customerInfo.email': req.user.email })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// POST /api/orders - Tạo đơn hàng mới
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    
    // Gửi email xác nhận (không await để không block response)
    if (order.customerInfo && order.customerInfo.email) {
      sendOrderConfirmationEmail(order, order.customerInfo.email)
        .catch(err => console.error("Lỗi gửi email ngầm:", err));
    }

    res.status(201).json({ message: 'Đặt hàng thành công!', order });
  } catch (err) {
    res.status(400).json({ message: 'Lỗi tạo đơn hàng', error: err.message });
  }
});

// GET /api/orders - Lấy tất cả đơn hàng (admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// GET /api/orders/:id - Lấy chi tiết đơn hàng
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng
router.put('/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true }
    );
    res.json({ message: 'Cập nhật trạng thái thành công', order });
  } catch (err) {
    res.status(400).json({ message: 'Lỗi cập nhật', error: err.message });
  }
});

module.exports = router;
