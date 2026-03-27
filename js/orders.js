/**
 * TechStore - Trang lịch sử đơn hàng
 */

const API = 'http://localhost:5000/api';

const STATUS_MAP = {
    pending:   { label: 'Chờ xác nhận', cls: 'status-pending',   icon: '⏳' },
    confirmed: { label: 'Đã xác nhận',  cls: 'status-confirmed', icon: '✅' },
    shipping:  { label: 'Đang giao',    cls: 'status-shipping',  icon: '🚚' },
    delivered: { label: 'Đã giao',      cls: 'status-delivered', icon: '🎉' },
    cancelled: { label: 'Đã hủy',       cls: 'status-cancelled', icon: '❌' }
};

const PAYMENT_MAP = {
    cod:      '💵 COD',
    transfer: '🏦 Chuyển khoản',
    vnpay:    '🔷 VNPay',
    momo:     '🟣 Momo'
};

function formatPrice(n) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function renderStats(orders) {
    const total = orders.length;
    const totalSpend = orders.reduce((s, o) => s + o.totalAmount, 0);
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const pending = orders.filter(o => o.status === 'pending').length;

    document.getElementById('ordersStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-value">${total}</div>
            <div class="stat-label">Tổng đơn hàng</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-value">${formatPrice(totalSpend)}</div>
            <div class="stat-label">Tổng chi tiêu</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🎉</div>
            <div class="stat-value">${delivered}</div>
            <div class="stat-label">Đã giao thành công</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-value">${pending}</div>
            <div class="stat-label">Chờ xác nhận</div>
        </div>
    `;
}

function renderOrders(orders) {
    const list = document.getElementById('ordersList');
    const empty = document.getElementById('ordersEmpty');

    if (orders.length === 0) {
        empty.classList.remove('hidden');
        return;
    }

    list.innerHTML = orders.map(order => {
        const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
        const orderId = String(order._id).slice(-8).toUpperCase();
        const itemsHtml = order.items.map(item => `
            <div class="order-item-row">
                <div class="order-item-thumb-emoji">📦</div>
                <div class="order-item-meta">
                    <div class="order-item-title">${item.name}</div>
                    <div class="order-item-unit">${formatPrice(item.price)} × ${item.quantity}</div>
                </div>
                <div class="order-item-subtotal">${formatPrice(item.price * item.quantity)}</div>
            </div>
        `).join('');

        return `
        <div class="order-card">
            <div class="order-card-header">
                <div class="order-id">
                    Mã đơn: <strong>#${orderId}</strong>
                    <span class="order-date"> &bull; ${formatDate(order.createdAt)}</span>
                </div>
                <span class="order-status-badge ${status.cls}">${status.icon} ${status.label}</span>
            </div>
            <div class="order-card-body">
                <div class="order-items-list">${itemsHtml}</div>
            </div>
            <div class="order-card-footer">
                <div class="order-delivery-info">
                    <span>👤 <strong>${order.customerInfo.name}</strong></span>
                    <span>📞 ${order.customerInfo.phone}</span>
                    <span>📍 ${order.customerInfo.address}</span>
                    <span class="payment-badge">${PAYMENT_MAP[order.paymentMethod] || order.paymentMethod}</span>
                </div>
                <div class="order-total-row">
                    <span class="order-total-label">Tổng cộng:</span>
                    <span class="order-total-amount">${formatPrice(order.totalAmount)}</span>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

async function loadOrders() {
    const user = JSON.parse(localStorage.getItem('techstore_user') || 'null');
    const token = localStorage.getItem('techstore_token');

    const loading = document.getElementById('ordersLoading');
    const content = document.getElementById('ordersContent');
    const loginRequired = document.getElementById('loginRequired');

    // Chưa đăng nhập
    if (!user || !token) {
        loading.classList.add('hidden');
        loginRequired.classList.remove('hidden');
        return;
    }

    // Cập nhật tên user trong header
    document.getElementById('userName').textContent = '👤 ' + user.name;
    document.getElementById('heroSubtitle').textContent = `Xin chào, ${user.name}! Đây là các đơn hàng của bạn.`;

    try {
        const res = await fetch(`${API}/orders/myorders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await res.json();

        loading.classList.add('hidden');
        content.classList.remove('hidden');

        renderStats(orders);
        renderOrders(orders);
    } catch (err) {
        loading.innerHTML = `<p style="color:var(--danger)">❌ Lỗi tải đơn hàng: ${err.message}</p>`;
    }
}

// Đăng xuất
document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('techstore_token');
    localStorage.removeItem('techstore_user');
    window.location.href = 'index.html';
});

// Khởi chạy
loadOrders();
