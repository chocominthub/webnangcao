/**
 * TechStore - Logic trang Checkout
 * Kết nối API để lưu đơn hàng vào MongoDB
 */

const API = 'http://localhost:5000/api';

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function getCart() {
    return JSON.parse(localStorage.getItem('techstore_cart') || '[]');
}

function getCartTotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ===== RENDER TÓM TẮT ĐƠN HÀNG =====
function renderOrderSummary() {
    const cart = getCart();
    const list = document.getElementById('orderSummaryList');
    const subtotalEl = document.getElementById('orderSubtotal');
    const totalEl = document.getElementById('orderTotal');
    const checkoutEmpty = document.getElementById('checkoutEmpty');
    const checkoutContent = document.getElementById('checkoutContent');

    if (cart.length === 0) {
        checkoutEmpty.classList.remove('hidden');
        checkoutContent.classList.add('hidden');
        return;
    }

    const total = getCartTotal(cart);

    list.innerHTML = cart.map(item => `
        <li class="order-summary-item">
            <div class="order-item-info">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" class="order-item-img">` : `<span class="order-item-emoji">${item.emoji || '📦'}</span>`}
                <div>
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-qty">x${item.qty}</div>
                </div>
            </div>
            <div class="order-item-price">${formatPrice(item.price * item.qty)}</div>
        </li>
    `).join('');

    subtotalEl.textContent = formatPrice(total);
    totalEl.textContent = formatPrice(total);
}

// ===== ĐIỀN THÔNG TIN USER NẾU ĐÃ ĐĂNG NHẬP =====
function prefillUserInfo() {
    const user = JSON.parse(localStorage.getItem('techstore_user') || 'null');
    if (!user) return;
    if (user.name) document.getElementById('fullName').value = user.name;
    if (user.email) document.getElementById('email').value = user.email;
    if (user.phone) document.getElementById('phone').value = user.phone;
    if (user.address) document.getElementById('address').value = user.address;
}

// ===== XỬ LÝ THANH TOÁN QR =====
function initPaymentPanel() {
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const panel = document.getElementById('paymentDetailsPanel');
    const qrImg = document.getElementById('paymentQrImage');

    function updateQR(method) {
        const info = method === 'transfer'
            ? 'Chuyen khoan ACB - 17543271 - VU HUY HOANG'
            : 'Momo - 0900 123 456 - VU HUY HOANG';
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(info)}`;
    }

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'transfer' || radio.value === 'momo') {
                panel.classList.remove('hidden');
                updateQR(radio.value);
            } else {
                panel.classList.add('hidden');
            }
        });
    });
}

// ===== ĐẶT HÀNG =====
async function handlePlaceOrder(e) {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }

    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cod';

    const btn = document.getElementById('btnPlaceOrder');
    btn.textContent = 'Đang đặt hàng...';
    btn.disabled = true;

    const orderData = {
        customerInfo: { name: fullName, email, phone, address },
        items: cart.map(item => ({
            product: item._id || String(item.id || '000000000000000000000001'),
            name: item.name,
            price: item.price,
            quantity: item.qty
        })),
        totalAmount: getCartTotal(cart),
        paymentMethod
    };

    const token = localStorage.getItem('techstore_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API}/orders`, {
            method: 'POST',
            headers,
            body: JSON.stringify(orderData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Lỗi đặt hàng');

        const orderId = data.order?._id || data.order?.id || 'TS' + Date.now();
        document.getElementById('orderCode').textContent = String(orderId).slice(-8).toUpperCase();
        document.getElementById('successModal').classList.add('active');
        document.getElementById('successModal').setAttribute('aria-hidden', 'false');
        localStorage.removeItem('techstore_cart');

    } catch (err) {
        alert('❌ Lỗi đặt hàng: ' + err.message);
        btn.textContent = 'Xác nhận đặt hàng';
        btn.disabled = false;
    }
}

// ===== KHỞI TẠO =====
document.addEventListener('DOMContentLoaded', () => {
    renderOrderSummary();
    prefillUserInfo();
    initPaymentPanel();

    const form = document.getElementById('checkoutForm');
    if (form) form.addEventListener('submit', handlePlaceOrder);
});
