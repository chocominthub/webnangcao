/**
 * Tạo tài khoản admin cho TechStore
 * Chạy: node create-admin.js
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công!');

    // Xóa admin cũ nếu có
    await User.deleteOne({ email: 'admin' });

    // Tạo admin mới
    const admin = new User({
      name: 'Admin TechStore',
      email: 'admin',
      password: '12345678',
      phone: '1900xxxx',
      address: '123 Đường Công Nghệ, Q.1, TP.HCM',
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Tạo tài khoản admin thành công!');
    console.log('   Tài khoản: admin');
    console.log('   Mật khẩu : 12345678');
    console.log('   Role     : admin');
    console.log('\n👉 Đăng nhập tại: http://localhost:5000');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
}

createAdmin();
