const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['linh-kien', 'dien-thoai', 'laptop', 'phu-kien', 'man-hinh']
  },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  description: { type: String },
  image: { type: String, default: '💻' },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  badge: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
