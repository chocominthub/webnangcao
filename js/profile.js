/**
 * TechStore - Trang hồ sơ người dùng
 */

const API = 'http://localhost:5000/api';

function formatPrice(n) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function getInitials(name) {
    return name ? name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() : '?';
}

// ===== TABS SIDEBAR =====
document.querySelectorAll('.profile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const panel = btn.dataset.panel;
        document.querySelectorAll('.profile-nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.profile-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('panel-' + panel).classList.add('active');
    });
});

// ===== LOAD PROFILE =====
async function loadProfile() {
    const user = JSON.parse(localStorage.getItem('techstore_user') || 'null');
    const token = localStorage.getItem('techstore_token');

    if (!user || !token) {
        window.location.href = 'index.html';
        return;
    }

    // Header user info
    document.getElementById('userName').textContent = '👤 ' + user.name;

    try {
        const res = await fetch(`${API}/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const u = data.user;
        fillProfileUI(u);
        loadOrderStats(u.email, token);
    } catch (err) {
        console.error('Lỗi tải profile:', err.message);
        // Dùng dữ liệu localStorage nếu API lỗi
        fillProfileUI(user);
    }
}

function fillProfileUI(u) {
    // Hero
    document.getElementById('heroAvatar').textContent = getInitials(u.name) || '👤';
    document.getElementById('heroName').textContent = u.name || '—';
    document.getElementById('heroEmail').textContent = u.email || '—';
    document.getElementById('heroRole').textContent = u.role === 'admin' ? '👑 Admin' : '🙋 Thành viên';

    // Form info
    document.getElementById('profileName').value = u.name || '';
    document.getElementById('profileEmail').value = u.email || '';
    document.getElementById('profilePhone').value = u.phone || '';
    document.getElementById('profileAddress').value = u.address || '';
    document.getElementById('profileRole').value = u.role === 'admin' ? 'Quản trị viên' : 'Thành viên';
}

async function loadOrderStats(email, token) {
    try {
        const res = await fetch(`${API}/orders/myorders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await res.json();
        const totalSpend = orders.reduce((s, o) => s + o.totalAmount, 0);
        document.getElementById('statOrders').textContent = orders.length;
        document.getElementById('statSpend').textContent = formatPrice(totalSpend);
    } catch { /* bỏ qua */ }
}

// ===== LƯU THÔNG TIN CÁ NHÂN =====
document.getElementById('infoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('techstore_token');
    const btn = document.getElementById('btnSaveInfo');
    const msgEl = document.getElementById('infoMsg');

    btn.textContent = 'Đang lưu...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: document.getElementById('profileName').value,
                phone: document.getElementById('profilePhone').value,
                address: document.getElementById('profileAddress').value
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // Cập nhật localStorage
        const currentUser = JSON.parse(localStorage.getItem('techstore_user') || '{}');
        const updatedUser = { ...currentUser, ...data.user };
        localStorage.setItem('techstore_user', JSON.stringify(updatedUser));

        // Cập nhật UI hero
        fillProfileUI(data.user);

        msgEl.textContent = '✅ ' + data.message;
        msgEl.className = 'profile-message profile-success';
        msgEl.classList.remove('hidden');
        setTimeout(() => msgEl.classList.add('hidden'), 3000);
    } catch (err) {
        msgEl.textContent = '❌ ' + err.message;
        msgEl.className = 'profile-message profile-error';
        msgEl.classList.remove('hidden');
    } finally {
        btn.textContent = '💾 Lưu thay đổi';
        btn.disabled = false;
    }
});

// ===== ĐỔI MẬT KHẨU =====
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('techstore_token');
    const btn = document.getElementById('btnSavePw');
    const msgEl = document.getElementById('pwMsg');
    const newPw = document.getElementById('newPassword').value;
    const confirmPw = document.getElementById('confirmPassword').value;

    if (newPw !== confirmPw) {
        msgEl.textContent = '❌ Mật khẩu mới và xác nhận không khớp';
        msgEl.className = 'profile-message profile-error';
        msgEl.classList.remove('hidden');
        return;
    }

    btn.textContent = 'Đang cập nhật...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: document.getElementById('currentPassword').value,
                newPassword: newPw
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        msgEl.textContent = '✅ Đổi mật khẩu thành công! Vui lòng đăng nhập lại.';
        msgEl.className = 'profile-message profile-success';
        msgEl.classList.remove('hidden');
        document.getElementById('passwordForm').reset();

        // Đăng xuất sau 2 giây
        setTimeout(() => {
            localStorage.removeItem('techstore_token');
            localStorage.removeItem('techstore_user');
            window.location.href = 'index.html';
        }, 2000);
    } catch (err) {
        msgEl.textContent = '❌ ' + err.message;
        msgEl.className = 'profile-message profile-error';
        msgEl.classList.remove('hidden');
    } finally {
        btn.textContent = '🔐 Cập nhật mật khẩu';
        btn.disabled = false;
    }
});

// ===== ĐĂNG XUẤT =====
function doLogout() {
    localStorage.removeItem('techstore_token');
    localStorage.removeItem('techstore_user');
    window.location.href = 'index.html';
}
document.getElementById('btnLogout').addEventListener('click', doLogout);
document.getElementById('btnLogoutDanger').addEventListener('click', doLogout);

// ===== KHỞI CHẠY =====
loadProfile();
