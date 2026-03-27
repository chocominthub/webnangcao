/**
 * TechStore - E-commerce Website
 * Đồ án Lập trình Web nâng cao
 */

// ===== DỮ LIỆU SẢN PHẨM (ảnh Unsplash khớp từng loại sản phẩm - free to use) =====
let PRODUCTS = [];

async function fetchProductsFromAPI() {
    try {
        const res = await fetch('/api/products');
        const data = await res.json();
        // Map backend product schema (_id) to frontend schema (id) to minimize changes
        PRODUCTS = data.map(p => ({
            ...p,
            id: p._id,
            image: p.image || '',
            emoji: p.emoji || '📦'
        }));
    } catch (err) {
        console.error('Lỗi khi tải sản phẩm từ API:', err);
    }
}

// Danh mục hiển thị
const CATEGORIES = {
    'linh-kien': 'Linh kiện PC',
    'dien-thoai': 'Điện thoại',
    'laptop': 'Laptop',
    'phu-kien': 'Phụ kiện',
    'man-hinh': 'Màn hình'
};

// ===== STATE =====
let currentCategory = 'all';
let searchQuery = '';
let sortBy = 'default';
let cart = JSON.parse(localStorage.getItem('techstore_cart')) || [];

// ===== DOM ELEMENTS =====
const productsGrid = document.getElementById('productsGrid');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartTotal = document.getElementById('cartTotal');
const closeCart = document.getElementById('closeCart');
const btnCart = document.getElementById('btnCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortSelect = document.getElementById('sortSelect');
const filterInfo = document.getElementById('filterInfo');
const noProducts = document.getElementById('noProducts');
const productModal = document.getElementById('productModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const loginModal = document.getElementById('loginModal');
const closeLogin = document.getElementById('closeLogin');
const loginBackdrop = document.getElementById('loginBackdrop');
const loginForm = document.getElementById('loginForm');
const showRegister = document.getElementById('showRegister');

// ===== ĐỊNH DẠNG TIỀN =====
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// ===== LỌC & SẮP XẾP =====
function getFilteredProducts() {
    let list = [...PRODUCTS];

    if (currentCategory !== 'all') {
        list = list.filter(p => p.category === currentCategory);
    }

    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (CATEGORIES[p.category] && CATEGORIES[p.category].toLowerCase().includes(q))
        );
    }

    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
}

// ===== CẬP NHẬT FILTER INFO =====
function updateFilterInfo(filtered) {
    const total = PRODUCTS.length;
    if (currentCategory !== 'all' || searchQuery.trim()) {
        filterInfo.textContent = `Đang hiển thị ${filtered.length} / ${total} sản phẩm`;
    } else {
        filterInfo.textContent = 'Đang hiển thị tất cả sản phẩm';
    }
}

// ===== RENDER SẢN PHẨM =====
function renderProducts() {
    const list = getFilteredProducts();
    updateFilterInfo(list);

    if (list.length === 0) {
        productsGrid.innerHTML = '';
        noProducts.classList.remove('hidden');
        return;
    }

    noProducts.classList.add('hidden');
    productsGrid.innerHTML = list.map(p => `
        <article class="product-card" data-id="${p.id}">
            <div class="product-image">
                <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                <span class="product-image-fallback" style="display:none">${p.emoji}</span>
            </div>
            <div class="product-info">
                <span class="product-category">${CATEGORIES[p.category] || p.category}</span>
                <h3 class="product-name">${p.name}</h3>
                <div class="product-price">${formatPrice(p.price)}</div>
                <div class="product-actions">
                    <button type="button" class="btn btn-add-cart" data-id="${p.id}">Thêm vào giỏ</button>
                    <button type="button" class="btn btn-primary btn-view-detail" data-id="${p.id}">Chi tiết</button>
                </div>
            </div>
        </article>
    `).join('');

    productsGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(btn.dataset.id);
        });
    });

    productsGrid.querySelectorAll('.btn-view-detail').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = 'product.html?id=' + btn.dataset.id;
        });
    });

    productsGrid.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            window.location.href = 'product.html?id=' + card.dataset.id;
        });
    });
}

// ===== GIỎ HÀNG =====
function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, image: product.image, qty: 1 });
    }

    saveCart();
    updateCartUI();
    showToast(`✅ Đã thêm "${product.name}" vào giỏ hàng!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateCartQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(productId);
        return;
    }
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('techstore_cart', JSON.stringify(cart));
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = count;
    cartCount.dataset.count = count;
}

function updateCartUI() {
    updateCartCount();

    if (cart.length === 0) {
        cartEmpty.classList.remove('hidden');
        cartItems.innerHTML = '';
        cartTotal.textContent = '0₫';
        document.querySelector('.cart-footer').style.display = 'none';
        return;
    }

    document.querySelector('.cart-footer').style.display = 'block';
    cartEmpty.classList.add('hidden');
    cartItems.innerHTML = cart.map(item => `
        <li class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                ${item.image ? `<img src="${item.image}" alt="">` : `<span>${item.emoji}</span>`}
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                <div class="cart-item-qty">
                    <button type="button" class="qty-minus" data-id="${item.id}">−</button>
                    <span>${item.qty}</span>
                    <button type="button" class="qty-plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button type="button" class="cart-item-remove remove-item" data-id="${item.id}" aria-label="Xóa">×</button>
        </li>
    `).join('');

    cartTotal.textContent = formatPrice(getCartTotal());

    cartItems.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', () => updateCartQty(btn.dataset.id, -1));
    });
    cartItems.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', () => updateCartQty(btn.dataset.id, 1));
    });
    cartItems.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
}

function openCart() {
    cartSidebar.classList.add('open');
    cartSidebar.setAttribute('aria-hidden', 'false');
    cartOverlay.classList.add('open');
    cartOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeCartSidebar() {
    cartSidebar.classList.remove('open');
    cartSidebar.setAttribute('aria-hidden', 'true');
    cartOverlay.classList.remove('open');
    cartOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// ===== MODAL CHI TIẾT SẢN PHẨM =====
function openProductDetail(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    modalBody.innerHTML = `
        <div class="product-detail">
            <div class="product-detail-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                <span class="product-detail-image-fallback" style="display:none">${product.emoji}</span>
            </div>
            <div class="product-detail-info">
                <span class="product-category">${CATEGORIES[product.category] || product.category}</span>
                <h2 id="modalTitle">${product.name}</h2>
                <div class="product-price">${formatPrice(product.price)}</div>
                <p class="product-detail-desc">${product.description}</p>
                <div class="product-actions">
                    <button type="button" class="btn btn-add-cart btn-detail-add" data-id="${product.id}">Thêm vào giỏ</button>
                </div>
            </div>
        </div>
    `;

    modalBody.querySelector('.btn-detail-add').addEventListener('click', () => {
        addToCart(product.id);
        closeProductModal();
    });

    productModal.classList.add('active');
    productModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    productModal.classList.remove('active');
    productModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// ===== THANH TOÁN =====
function handleCheckout() {
    if (cart.length === 0) {
        alert('Giỏ hàng trống. Vui lòng thêm sản phẩm.');
        return;
    }
    window.location.href = 'checkout.html';
}

// ===== SỰ KIỆN =====
function initCategoryFilters() {
    document.querySelectorAll('.nav-link[data-category], .nav-dropdown a[data-category]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentCategory = link.dataset.category;
            if (link.dataset.filter) {
                searchQuery = link.dataset.filter;
                if (searchInput) searchInput.value = searchQuery;
            } else {
                searchQuery = '';
                if (searchInput) searchInput.value = '';
            }
            document.querySelectorAll('.nav-list > li > .nav-link').forEach(l => l.classList.remove('active'));
            const mainLink = link.closest('.nav-item-has-dropdown')
                ? link.closest('.nav-item-has-dropdown').querySelector(':scope > .nav-link')
                : link;
            if (mainLink) mainLink.classList.add('active');
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            const card = document.querySelector(`.category-card[data-category="${currentCategory}"]`);
            if (card) card.classList.add('active');
            renderProducts();
        });
    });

    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            currentCategory = card.dataset.category;
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const navLink = document.querySelector(`.nav-link[data-category="${currentCategory}"]`);
            if (navLink) navLink.classList.add('active');
            renderProducts();
        });
    });
}

function initSearch() {
    function doSearch() {
        searchQuery = searchInput.value;
        renderProducts();
    }

    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doSearch();
    });
    searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value;
        renderProducts();
    });
}

function initSort() {
    sortSelect.addEventListener('change', () => {
        sortBy = sortSelect.value;
        renderProducts();
    });
}


// ===== AUTH - API thật =====
const API = '/api';

function showAuthMessage(msg, isError = true) {
    const el = document.getElementById('authMessage');
    el.textContent = msg;
    el.className = 'auth-message ' + (isError ? 'auth-error' : 'auth-success');
    el.classList.remove('hidden');
}

function updateHeaderForUser(user) {
    const btnLogin = document.getElementById('btnLogin');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    if (user) {
        btnLogin.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userName.textContent = '👤 ' + user.name;
        // Hiện link Admin Panel nếu là admin
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            adminLink.classList.toggle('hidden', user.role !== 'admin');
        }
    } else {
        btnLogin.classList.remove('hidden');
        userInfo.classList.add('hidden');
    }
}

function checkAuthState() {
    const user = JSON.parse(localStorage.getItem('techstore_user') || 'null');
    updateHeaderForUser(user);
}

function initLoginModal() {
    const loginLink = document.getElementById('btnLogin');
    const loginModal = document.getElementById('loginModal');
    const closeLogin = document.getElementById('closeLogin');
    const loginBackdrop = document.getElementById('loginBackdrop');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const btnLogout = document.getElementById('btnLogout');

    function openLoginModal(showTab = 'login') {
        loginModal.classList.add('active');
        loginModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        const msgEl = document.getElementById('authMessage');
        if (msgEl) { msgEl.classList.add('hidden'); msgEl.textContent = ''; }
        switchTab(showTab);
    }

    function closeLoginModal() {
        loginModal.classList.remove('active');
        loginModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function switchTab(tab) {
        if (tab === 'login') {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
    }

    if (loginLink) loginLink.addEventListener('click', (e) => { e.preventDefault(); openLoginModal('login'); });
    closeLogin.addEventListener('click', closeLoginModal);
    if (loginBackdrop) loginBackdrop.addEventListener('click', closeLoginModal);
    tabLogin.addEventListener('click', () => switchTab('login'));
    tabRegister.addEventListener('click', () => switchTab('register'));

    // ===== ĐĂNG NHẬP =====
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('btnLoginSubmit');
        btn.textContent = 'Đang đăng nhập...';
        btn.disabled = true;
        try {
            const res = await fetch(`${API}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');
            localStorage.setItem('techstore_token', data.token);
            localStorage.setItem('techstore_user', JSON.stringify(data.user));
            updateHeaderForUser(data.user);
            showAuthMessage(`Chào mừng, ${data.user.name}! 🎉`, false);
            setTimeout(closeLoginModal, 1200);
        } catch (err) {
            showAuthMessage(err.message);
        } finally {
            btn.textContent = 'Đăng nhập';
            btn.disabled = false;
        }
    });

    // ===== ĐĂNG KÝ =====
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const phone = document.getElementById('regPhone').value;
        const btn = document.getElementById('btnRegisterSubmit');
        btn.textContent = 'Đang tạo tài khoản...';
        btn.disabled = true;
        try {
            const res = await fetch(`${API}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại');
            localStorage.setItem('techstore_token', data.token);
            localStorage.setItem('techstore_user', JSON.stringify(data.user));
            updateHeaderForUser(data.user);
            showAuthMessage(`Tạo tài khoản thành công! Chào ${data.user.name} 🎉`, false);
            setTimeout(closeLoginModal, 1200);
        } catch (err) {
            showAuthMessage(err.message);
        } finally {
            btn.textContent = 'Tạo tài khoản';
            btn.disabled = false;
        }
    });

    // ===== ĐĂNG XUẤT =====
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('techstore_token');
            localStorage.removeItem('techstore_user');
            updateHeaderForUser(null);
        });
    }
}

// ===== TOAST NOTIFICATION =====
function showToast(message) {
    // Remove existing toast if any
    const existing = document.getElementById('cartToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '24px', right: '24px',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        color: 'white', padding: '0.85rem 1.5rem',
        borderRadius: '12px', fontSize: '0.92rem', fontWeight: '600',
        boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
        zIndex: '9999', animation: 'toastIn 0.3s ease',
        fontFamily: "'Be Vietnam Pro', sans-serif",
        maxWidth: '350px'
    });

    // Inject animation if not already
    if (!document.getElementById('toastStyles')) {
        const style = document.createElement('style');
        style.id = 'toastStyles';
        style.textContent = `
            @keyframes toastIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: none; } }
            @keyframes toastOut { from { opacity:1; transform: none; } to { opacity:0; transform: translateY(12px); } }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ===== KHỞI TẠO =====
async function init() {
    await fetchProductsFromAPI();
    renderProducts();
    updateCartUI();
    initCategoryFilters();
    initSearch();
    initSort();

    btnCart.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartSidebar);
    cartOverlay.addEventListener('click', closeCartSidebar);
    checkoutBtn.addEventListener('click', handleCheckout);

    closeModal.addEventListener('click', closeProductModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeProductModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCartSidebar();
            closeProductModal();
            const lm = document.getElementById('loginModal');
            if (lm && lm.classList.contains('active')) {
                lm.classList.remove('active');
                lm.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        }
    });

    checkAuthState();
    initLoginModal();
}

init();

