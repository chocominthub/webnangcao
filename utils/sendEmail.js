const nodemailer = require('nodemailer');

// Tạo transporter dùng cho việc gửi email qua SMTP
// Khuyên dùng các dịch vụ như Gmail, SendGrid, Mailgun,...
// Ở đây dùng Ethereal Email (dịch vụ fake SMTP để test nếu không có tài khoản thật)
const getTransporter = async () => {
    // Nếu có cấu hình email thật trong .env
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // Nếu không có, tự động tạo tài khoản test Ethereal
    console.log('Chưa cấu hình EMAIL_USER và EMAIL_PASS trong .env.');
    console.log('Đang tạo tài khoản email demo dùng tạm (Ethereal)...');
    
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });
};

const sendOrderConfirmationEmail = async (order, customerEmail) => {
    try {
        const transporter = await getTransporter();

        // Tạo danh sách sản phẩm hiển thị trong email
        let itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
                    ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                </td>
            </tr>
        `).join('');

        const totalFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount);

        // Nội dung HTML của email
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Xác nhận đơn hàng</h1>
                </div>
                
                <div style="padding: 20px;">
                    <p>Xin chào <strong>${order.customerInfo.name}</strong>,</p>
                    <p>Cảm ơn bạn đã đặt hàng tại TechStore. Đơn hàng của bạn đã được ghi nhận thành công và đang được xử lý.</p>
                    
                    <h3 style="border-bottom: 2px solid #2563eb; padding-bottom: 5px;">Thông tin đơn hàng #${order._id.toString().substring(0, 8)}</h3>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                                <th style="padding: 10px; text-align: center;">Số lượng</th>
                                <th style="padding: 10px; text-align: right;">Đơn giá</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">Tổng cộng:</td>
                                <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #dc2626; font-size: 18px;">
                                    ${totalFormatted}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <div style="margin-top: 20px; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <h4 style="margin-top: 0;">Thông tin giao hàng:</h4>
                        <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${order.customerInfo.address}</p>
                        <p style="margin: 5px 0;"><strong>Điện thoại:</strong> ${order.customerInfo.phone}</p>
                        <p style="margin: 5px 0;"><strong>Phương thức thanh toán:</strong> ${order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản / Thẻ'}</p>
                    </div>
                </div>
                
                <div style="background-color: #f3f4f6; color: #6b7280; text-align: center; padding: 15px; font-size: 12px;">
                    <p style="margin: 0;">© 2026 TechStore. Email này được gửi tự động, vui lòng không trả lời.</p>
                </div>
            </div>
        `;

        // Gửi mail
        const info = await transporter.sendMail({
            from: '"TechStore" <no-reply@techstore.com>', 
            to: customerEmail,
            subject: `Xác nhận đơn hàng #${order._id.toString().substring(0, 8)} - TechStore`,
            html: htmlContent,
        });

        console.log(`Đã gửi email đến ${customerEmail}`);
        
        // Nếu đang test bằng Ethereal, in ra link để xem email
        if(info.messageId && !process.env.EMAIL_USER) {
            console.log("Xem nội dung email test (Demo) tại: %s", nodemailer.getTestMessageUrl(info));
        }
        
    } catch (error) {
        console.error("Lỗi khi gửi email:", error);
    }
};

module.exports = {
    sendOrderConfirmationEmail
};
