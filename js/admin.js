/**
 * TechStore - Admin Dashboard Logic
 */

const API = 'http://localhost:5000/api';
let token = localStorage.getItem('techstore_token');
let user = JSON.parse(localStorage.getItem('techstore_user') || 'null');

// ===== KIỂM TRA QUYỀN ADMIN =====
function checkAdmin() {
  if (!user || !token || user.role !== 'admin') {
    alert('Bạn cần đăng nhập với tài khoản Admin để truy cập trang này!');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// ===== UTILITIES =====
function fmt(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function shortId(id) { return String(id).slice(-8).toUpperCase(); }

const STATUS_LABELS = {
  pending: '⏳ Chờ xác nhận',
  confirmed: '✅ Đã xác nhận',
  shipping: '🚚 Đang giao',
  delivered: '🎉 Đã giao',
  cancelled: '❌ Đã hủy'
};
const STATUS_CLASSES = {
  pending: 'badge-pending', confirmed: 'badge-confirmed',
  shipping: 'badge-shipping', delivered: 'badge-delivered', cancelled: 'badge-cancelled'
};

// ===== SIDEBAR NAVIGATION =====
let currentPanel = 'dashboard';
function switchPanel(name) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  document.querySelector(`[data-panel="${name}"]`).classList.add('active');
  currentPanel = name;
  const titles = {
    dashboard: '📊 Dashboard',
    products: '📦 Quản lý sản phẩm',
    orders: '🛒 Quản lý đơn hàng',
    users: '👥 Quản lý người dùng'
  };
  document.getElementById('topbarTitle').textContent = titles[name] || name;
  if (name === 'products') loadProducts();
  if (name === 'orders') loadOrders();
  if (name === 'users') loadUsers();
}

document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
});

// ===== DASHBOARD STATS =====
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/admin/stats`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    document.getElementById('statProducts').textContent = data.totalProducts;
    document.getElementById('statOrders').textContent = data.totalOrders;
    document.getElementById('statRevenue').textContent = fmt(data.totalRevenue);
    document.getElementById('statUsers').textContent = data.totalUsers;
    document.getElementById('pendingBadge').textContent = data.pendingOrders || '0';

    // Lấy đơn hàng gần đây
    const tbody = document.getElementById('recentOrdersBody');
    if (!data.recentOrders.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Chưa có đơn hàng nào</td></tr>';
      return;
    }
    tbody.innerHTML = data.recentOrders.map(o => `
      <tr>
        <td><code style="font-size:.8rem">#${shortId(o._id)}</code></td>
        <td>${o.customerInfo?.name || '—'}</td>
        <td>${o.items?.length} sản phẩm</td>
        <td><strong>${fmt(o.totalAmount)}</strong></td>
        <td><span class="badge ${STATUS_CLASSES[o.status]}">${STATUS_LABELS[o.status]}</span></td>
        <td style="color:var(--text-muted);font-size:.82rem">${fmtDate(o.createdAt)}</td>
      </tr>`).join('');
  } catch (err) { console.error('Lỗi stats:', err); }
}

// ===== SẢN PHẨM =====
let allProducts = [];
let currentProductPage = 1;
const PRODUCTS_PER_PAGE = 5;

async function loadProducts() {
  const search = document.getElementById('productSearch').value.trim();
  const category = document.getElementById('productCategoryFilter').value;
  let url = `${API}/admin/products?`;
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (category !== 'all') url += `category=${category}`;

  const tbody = document.getElementById('productsBody');
  tbody.innerHTML = '<tr class="loading-row"><td colspan="8">Đang tải...</td></tr>';

  try {
    const res = await fetch(url, { headers: authHeaders() });
    allProducts = await res.json();
    currentProductPage = 1;
    renderProductsPage();
  } catch (err) { tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--danger)">Lỗi: ${err.message}</td></tr>`; }
}

function renderProductsPage() {
  const tbody = document.getElementById('productsBody');
  if (!allProducts.length) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="icon">📦</div>Không có sản phẩm nào</div></td></tr>';
    renderProductPagination();
    return;
  }
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  if (currentProductPage > totalPages) currentProductPage = totalPages;
  const start = (currentProductPage - 1) * PRODUCTS_PER_PAGE;
  const pageProducts = allProducts.slice(start, start + PRODUCTS_PER_PAGE);

  tbody.innerHTML = pageProducts.map(p => `
    <tr>
      <td>${p.image ? `<img src="${p.image}&w=60" class="product-img-thumb" onerror="this.style.display='none'">` : `<div class="product-img-thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem">${p.emoji||'📦'}</div>`}</td>
      <td style="max-width:200px"><div style="font-weight:600;font-size:.88rem">${p.name}</div><div style="font-size:.76rem;color:var(--text-muted)">${p.description?.slice(0,50)||''}</div></td>
      <td>${CATEGORY_NAMES[p.category]||p.category}</td>
      <td><strong>${fmt(p.price)}</strong>${p.originalPrice ? `<br><del style="font-size:.77rem;color:var(--text-muted)">${fmt(p.originalPrice)}</del>` : ''}</td>
      <td>${p.stock ?? '—'}</td>
      <td>⭐ ${p.rating||'—'}</td>
      <td>${p.badge ? `<span class="badge" style="background:#fef3c7;color:#92400e">${p.badge}</span>` : '<span style="color:var(--text-muted)">—</span>'}</td>
      <td>
        <div style="display:flex;gap:.35rem">
          <button class="btn btn-edit btn-icon-sm btn-sm" title="Sửa" onclick="editProduct('${p._id}')">✏️</button>
          <button class="btn btn-del btn-icon-sm btn-sm" title="Xóa" onclick="deleteProduct('${p._id}','${p.name.replace(/'/g,"\\'")}')">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
  renderProductPagination();
}

function renderProductPagination() {
  let paginationEl = document.getElementById('productPagination');
  if (!paginationEl) {
    paginationEl = document.createElement('div');
    paginationEl.id = 'productPagination';
    paginationEl.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:.5rem;padding:1rem;';
    const tableWrap = document.getElementById('productsBody').closest('.table-wrap');
    tableWrap.parentElement.appendChild(paginationEl);
  }
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }
  let html = `<button class="btn btn-outline btn-sm" onclick="goProductPage(${currentProductPage - 1})" ${currentProductPage<=1?'disabled':''}>← Trước</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="btn ${i===currentProductPage?'btn-primary':'btn-outline'} btn-sm" onclick="goProductPage(${i})">${i}</button>`;
  }
  html += `<button class="btn btn-outline btn-sm" onclick="goProductPage(${currentProductPage + 1})" ${currentProductPage>=totalPages?'disabled':''}>Tiếp →</button>`;
  html += `<span style="font-size:.82rem;color:var(--text-muted);margin-left:.5rem">Trang ${currentProductPage}/${totalPages} (${allProducts.length} SP)</span>`;
  paginationEl.innerHTML = html;
}

function goProductPage(page) {
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  if (page < 1 || page > totalPages) return;
  currentProductPage = page;
  renderProductsPage();
}

const CATEGORY_NAMES = {
  'linh-kien': 'Linh kiện PC', 'dien-thoai': 'Điện thoại',
  'laptop': 'Laptop', 'phu-kien': 'Phụ kiện', 'man-hinh': 'Màn hình'
};

// Search & filter debounce
let searchTimer;
document.getElementById('productSearch').addEventListener('input', () => {
  clearTimeout(searchTimer); searchTimer = setTimeout(loadProducts, 350);
});
document.getElementById('productCategoryFilter').addEventListener('change', loadProducts);

// --- Modal thêm/sửa sản phẩm ---
function openProductModal(product = null) {
  document.getElementById('productModal').classList.remove('hidden');
  document.getElementById('productModalAlert').classList.add('hidden');
  document.getElementById('productForm').reset();
  if (product) {
    document.getElementById('productModalTitle').textContent = 'Sửa sản phẩm';
    document.getElementById('productId').value = product._id;
    document.getElementById('pName').value = product.name || '';
    document.getElementById('pCategory').value = product.category || '';
    document.getElementById('pPrice').value = product.price || '';
    document.getElementById('pOriginalPrice').value = product.originalPrice || '';
    document.getElementById('pStock').value = product.stock ?? 0;
    document.getElementById('pRating').value = product.rating || 0;
    document.getElementById('pImageFile').value = ''; // Reset file input
    document.getElementById('pImage').value = product.image || '';
    const preview = document.getElementById('imagePreview');
    if (product.image) {
      preview.src = product.image;
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
      preview.src = '';
    }
    document.getElementById('pDescription').value = product.description || '';
    document.getElementById('pBadge').value = product.badge || '';
  } else {
    document.getElementById('productModalTitle').textContent = 'Thêm sản phẩm mới';
    document.getElementById('productId').value = '';
    document.getElementById('pImageFile').value = '';
    document.getElementById('pImage').value = '';
    const preview = document.getElementById('imagePreview');
    preview.style.display = 'none';
    preview.src = '';
  }
}

// Xử lý hiển thị ảnh preview khi chọn file
document.getElementById('pImageFile').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('imagePreview');
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
    reader.readAsDataURL(file);
  }
});
function closeProductModal() { document.getElementById('productModal').classList.add('hidden'); }
document.getElementById('btnAddProduct').addEventListener('click', () => openProductModal());
document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
document.getElementById('cancelProductModal').addEventListener('click', closeProductModal);

function editProduct(id) {
  const p = allProducts.find(p => p._id === id);
  if (p) openProductModal(p);
}

document.getElementById('saveProductBtn').addEventListener('click', async () => {
  const id = document.getElementById('productId').value;
  const alertEl = document.getElementById('productModalAlert');
  let imageUrl = document.getElementById('pImage').value;
  const imageFile = document.getElementById('pImageFile').files[0];

  const btn = document.getElementById('saveProductBtn');
  btn.textContent = 'Đang lưu...'; btn.disabled = true;

  try {
    // Nếu có file mới, upload file trước
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const uploadRes = await fetch(`${API}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Không set Content-Type để browser tự set boundary
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || 'Lỗi upload ảnh');
      imageUrl = uploadData.imageUrl;
    }

    const body = {
      name: document.getElementById('pName').value,
      category: document.getElementById('pCategory').value,
      price: Number(document.getElementById('pPrice').value),
      originalPrice: Number(document.getElementById('pOriginalPrice').value) || undefined,
      stock: Number(document.getElementById('pStock').value),
      rating: Number(document.getElementById('pRating').value) || 0,
      image: imageUrl,
      description: document.getElementById('pDescription').value,
      badge: document.getElementById('pBadge').value || undefined
    };

    if (!body.name || !body.category || !body.price) {
      alertEl.textContent = 'Vui lòng điền đầy đủ thông tin bắt buộc (*)';
      alertEl.className = 'alert alert-error'; alertEl.classList.remove('hidden'); 
      btn.textContent = '💾 Lưu sản phẩm'; btn.disabled = false;
      return;
    }
    const url = id ? `${API}/admin/products/${id}` : `${API}/admin/products`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alertEl.textContent = '✅ ' + data.message;
    alertEl.className = 'alert alert-success'; alertEl.classList.remove('hidden');
    setTimeout(() => { closeProductModal(); loadProducts(); }, 800);
  } catch (err) {
    alertEl.textContent = '❌ ' + err.message;
    alertEl.className = 'alert alert-error'; alertEl.classList.remove('hidden');
  } finally { btn.textContent = '💾 Lưu sản phẩm'; btn.disabled = false; }
});

// --- Xóa sản phẩm ---
function deleteProduct(id, name) {
  openConfirm(`Bạn có chắc muốn xóa sản phẩm "<strong>${name}</strong>" không?`, async () => {
    await fetch(`${API}/admin/products/${id}`, { method: 'DELETE', headers: authHeaders() });
    loadProducts();
  });
}

// ===== ĐƠN HÀNG =====
async function loadOrders() {
  const status = document.getElementById('orderStatusFilter').value;
  let url = `${API}/admin/orders?status=${status}`;
  const tbody = document.getElementById('ordersBody');
  tbody.innerHTML = '<tr class="loading-row"><td colspan="9">Đang tải...</td></tr>';
  try {
    const res = await fetch(url, { headers: authHeaders() });
    const orders = await res.json();
    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><div class="icon">🛒</div>Không có đơn hàng nào</div></td></tr>'; return;
    }
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><code style="font-size:.8rem;cursor:pointer;color:var(--primary)" onclick="viewOrderDetail('${o._id}')">#${shortId(o._id)}</code></td>
        <td><div style="font-weight:600;font-size:.88rem">${o.customerInfo?.name||'—'}</div><div style="font-size:.76rem;color:var(--text-muted)">${o.customerInfo?.email||''}</div></td>
        <td style="font-size:.84rem">${o.customerInfo?.phone||'—'}</td>
        <td style="font-size:.82rem">${o.items?.map(i=>`${i.name} x${i.quantity}`).join('<br>')||'—'}</td>
        <td><strong>${fmt(o.totalAmount)}</strong></td>
        <td style="font-size:.82rem">${PAYMENT_NAMES[o.paymentMethod]||o.paymentMethod}</td>
        <td>
          <select class="status-select" onchange="updateOrderStatus('${o._id}', this.value)">
            ${Object.entries(STATUS_LABELS).map(([v,l])=>`<option value="${v}" ${o.status===v?'selected':''}>${l}</option>`).join('')}
          </select>
        </td>
        <td style="color:var(--text-muted);font-size:.8rem">${fmtDate(o.createdAt)}</td>
        <td><button class="btn btn-del btn-icon-sm" onclick="deleteOrder('${o._id}')">🗑️</button></td>
      </tr>`).join('');
  } catch (err) { tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--danger)">${err.message}</td></tr>`; }
}

const PAYMENT_NAMES = { cod: '💵 COD', transfer: '🏦 CK', vnpay: '🔷 VNPay', momo: '🟣 Momo' };

document.getElementById('orderStatusFilter').addEventListener('change', loadOrders);

async function updateOrderStatus(id, status) {
  try {
    const res = await fetch(`${API}/admin/orders/${id}/status`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    document.getElementById('pendingBadge').textContent = '...';
    loadDashboard(); // Cập nhật badge
  } catch (err) { alert('Lỗi: ' + err.message); }
}

function deleteOrder(id) {
  openConfirm('Bạn có chắc muốn ẩn đơn hàng này không?<br><small style="color:var(--text-muted)">Đơn hàng sẽ bị ẩn khỏi danh sách</small>', async () => {
    // Ẩn đơn hàng bằng cách đổi trạng thái thành cancelled thay vì xóa
    await fetch(`${API}/admin/orders/${id}/status`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status: 'cancelled' })
    });
    loadOrders();
  });
}

// Modal chi tiết đơn hàng
function viewOrderDetail(id) {
  const allOrders = []; // lazy - re-fetch
  fetch(`${API}/admin/orders?status=all`, { headers: authHeaders() }).then(r => r.json()).then(orders => {
    const o = orders.find(x => x._id === id);
    if (!o) return;
    document.getElementById('orderDetailBody').innerHTML = `
      <div style="margin-bottom:1rem">
        <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:.35rem">MÃ ĐƠN HÀNG</div>
        <div style="font-family:monospace;font-size:1rem;font-weight:700">#${shortId(o._id)}</div>
      </div>
      <div class="form-grid-2" style="margin-bottom:1rem">
        <div><div style="font-size:.8rem;color:var(--text-muted)">Khách hàng</div><strong>${o.customerInfo?.name}</strong></div>
        <div><div style="font-size:.8rem;color:var(--text-muted)">Email</div>${o.customerInfo?.email||'—'}</div>
        <div><div style="font-size:.8rem;color:var(--text-muted)">Điện thoại</div>${o.customerInfo?.phone||'—'}</div>
        <div><div style="font-size:.8rem;color:var(--text-muted)">Thanh toán</div>${PAYMENT_NAMES[o.paymentMethod]||o.paymentMethod}</div>
      </div>
      <div style="margin-bottom:1rem"><div style="font-size:.8rem;color:var(--text-muted)">Địa chỉ giao hàng</div>${o.customerInfo?.address||'—'}</div>
      <hr style="border:none;border-top:1px solid var(--border);margin:1rem 0">
      <div style="font-weight:700;margin-bottom:.75rem">Sản phẩm đặt</div>
      ${o.items.map(i=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid var(--border)">
          <span style="font-size:.88rem">${i.name} <span style="color:var(--text-muted)">x${i.quantity}</span></span>
          <strong>${fmt(i.price*i.quantity)}</strong>
        </div>`).join('')}
      <div style="display:flex;justify-content:space-between;margin-top:1rem;font-size:1.1rem"><span>Tổng cộng:</span><strong style="color:var(--primary)">${fmt(o.totalAmount)}</strong></div>
    `;
    document.getElementById('orderDetailModal').classList.remove('hidden');
  });
}
document.getElementById('closeOrderModal').addEventListener('click', () => document.getElementById('orderDetailModal').classList.add('hidden'));
document.getElementById('cancelOrderModal').addEventListener('click', () => document.getElementById('orderDetailModal').classList.add('hidden'));

// ===== NGƯỜI DÙNG =====
let allUsers = [];
async function loadUsers() {
  const tbody = document.getElementById('usersBody');
  tbody.innerHTML = '<tr class="loading-row"><td colspan="9">Đang tải...</td></tr>';
  try {
    const res = await fetch(`${API}/admin/users`, { headers: authHeaders() });
    allUsers = await res.json();
    renderUsers(allUsers);
  } catch (err) { tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--danger)">${err.message}</td></tr>`; }
}
function renderUsers(users) {
  const tbody = document.getElementById('usersBody');
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><div class="icon">👥</div>Không có người dùng</div></td></tr>'; return;
  }
  tbody.innerHTML = users.map(u => {
    const isActive = u.isActive !== false; // default true for old records
    const statusBadge = isActive 
      ? '<span class="badge badge-active">🟢 Active</span>' 
      : '<span class="badge badge-deactive">🔴 Deactive</span>';
    const toggleBtn = u.email !== 'admin' 
      ? (isActive 
          ? `<button class="btn ${isActive ? 'btn-toggle-active' : 'btn-activate'} btn-sm" onclick="toggleUserActive('${u._id}')" title="Vô hiệu hóa">🚫 Vô hiệu hóa</button>` 
          : `<button class="btn btn-activate btn-sm" onclick="toggleUserActive('${u._id}')" title="Kích hoạt">✅ Kích hoạt</button>`)
      : '';
    const passwordDisplay = u.password 
      ? `<span class="password-hash" title="Click để copy" style="cursor:pointer" onclick="navigator.clipboard.writeText('${u.password.replace(/'/g,"\\'")}')"> ${u.password.substring(0, 20)}...</span>` 
      : '<span style="color:var(--text-muted)">—</span>';
    return `
      <tr style="${!isActive ? 'opacity: 0.6;' : ''}">
        <td><code style="font-size:.75rem;color:var(--text-muted)" title="${u._id}">${shortId(u._id)}</code></td>
        <td><div style="font-weight:600">${u.name}</div></td>
        <td style="font-size:.84rem;color:var(--text-muted)">${u.email}</td>
        <td>${passwordDisplay}</td>
        <td style="font-size:.84rem">${u.phone||'—'}</td>
        <td>
          <select class="status-select" onchange="changeUserRole('${u._id}', this.value)" ${u.email==='admin'?'disabled':''}>
            <option value="user" ${u.role==='user'?'selected':''}>🙋 Thành viên</option>
            <option value="admin" ${u.role==='admin'?'selected':''}>👑 Admin</option>
          </select>
        </td>
        <td>${statusBadge}</td>
        <td style="font-size:.8rem;color:var(--text-muted)">${fmtDate(u.createdAt)}</td>
        <td>
          <div style="display:flex;gap:.35rem;flex-wrap:wrap">
            ${toggleBtn}
            ${u.email!=='admin' ? `<button class="btn btn-del btn-icon-sm" onclick="deleteUser('${u._id}','${u.name.replace(/'/g,"\\\'")}')" title="Xóa">🗑️</button>` : '<span style="color:var(--text-muted);font-size:.75rem">Được bảo vệ</span>'}
          </div>
        </td>
      </tr>`;
  }).join('');
}

// Search người dùng
document.getElementById('userSearch').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  renderUsers(allUsers.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
});

async function changeUserRole(id, role) {
  try {
    const res = await fetch(`${API}/admin/users/${id}/role`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
  } catch (err) { alert('Lỗi: ' + err.message); }
}

function deleteUser(id, name) {
  openConfirm(`Bạn có chắc muốn xóa người dùng "<strong>${name}</strong>" không?`, async () => {
    const res = await fetch(`${API}/admin/users/${id}`, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) { alert('Lỗi: ' + data.message); return; }
    loadUsers();
  });
}

async function toggleUserActive(id) {
  try {
    const res = await fetch(`${API}/admin/users/${id}/toggle-active`, {
      method: 'PUT', headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    loadUsers();
  } catch (err) { alert('Lỗi: ' + err.message); }
}

// ===== MODAL XÁC NHẬN XÓA =====
let confirmCallback = null;
function openConfirm(text, cb) {
  document.getElementById('confirmText').innerHTML = text;
  confirmCallback = cb;
  document.getElementById('confirmModal').classList.remove('hidden');
}
document.getElementById('okConfirm').addEventListener('click', () => {
  document.getElementById('confirmModal').classList.add('hidden');
  if (confirmCallback) confirmCallback();
  confirmCallback = null;
});
document.getElementById('cancelConfirm').addEventListener('click', () => document.getElementById('confirmModal').classList.add('hidden'));
document.getElementById('closeConfirmModal').addEventListener('click', () => document.getElementById('confirmModal').classList.add('hidden'));

// ===== ĐĂNG XUẤT =====
document.getElementById('btnLogout').addEventListener('click', () => {
  localStorage.removeItem('techstore_token');
  localStorage.removeItem('techstore_user');
  window.location.href = 'index.html';
});

// ===== KHỞI TẠO =====
function init() {
  if (!checkAdmin()) return;
  // Cập nhật UI
  document.getElementById('sidebarName').textContent = user.name || 'Admin';
  document.getElementById('sidebarAvatar').textContent = (user.name?.[0] || 'A').toUpperCase();
  loadDashboard();
}

init();
