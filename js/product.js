/**
 * TechStore - Trang chi tiết sản phẩm
 * product.html?id=1
 */

let PRODUCTS = [];

async function fetchProductsFromAPI() {
    try {
        const res = await fetch('/api/products');
        const data = await res.json();
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

const CATEGORIES = { 'linh-kien': 'Linh kiện PC', 'dien-thoai': 'Điện thoại', 'laptop': 'Laptop', 'phu-kien': 'Phụ kiện', 'man-hinh': 'Màn hình' };
const CART_KEY = 'techstore_cart';

function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function getProductById(id) {
    return PRODUCTS.find(p => p.id === id);
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function getSpecs(p) {
    const base = [
        ['Danh mục', CATEGORIES[p.category] || p.category],
        ['Tên sản phẩm', p.name],
        ['Giá', formatPrice(p.price)],
    ];
    if (p.category === 'linh-kien') {
        if (p.name.includes('CPU')) base.push(['Loại', 'CPU'], ['Socket', 'LGA 1700 / AM4 (tùy model)'], ['Bảo hành', '24 tháng']);
        else if (p.name.includes('VGA') || p.name.includes('RTX')) base.push(['Loại', 'Card đồ họa'], ['VRAM', '8GB GDDR6'], ['Bảo hành', '36 tháng']);
        else if (p.name.includes('RAM')) base.push(['Dung lượng', '16GB'], ['Bus', '3200MHz'], ['Bảo hành', 'Lifetime']);
        else if (p.name.includes('SSD')) base.push(['Dung lượng', '500GB'], ['Chuẩn', 'NVMe M.2'], ['Bảo hành', '60 tháng']);
        else if (p.name.includes('Mainboard') || p.name.includes('Bo mạch')) base.push(['Chipset', 'B760'], ['Bảo hành', '36 tháng']);
        else if (p.name.includes('Nguồn')) base.push(['Công suất', '650W'], ['Chứng nhận', '80+ Bronze'], ['Bảo hành', '36 tháng']);
    }
    if (p.category === 'dien-thoai') base.push(['Bảo hành', '12 tháng chính hãng'], ['Xuất xứ', 'Nhập khẩu']);
    if (p.category === 'laptop') base.push(['Bảo hành', '24 tháng'], ['Xuất xứ', 'Nhập khẩu']);
    if (p.category === 'phu-kien' || p.category === 'man-hinh') base.push(['Bảo hành', '12–24 tháng']);
    return base;
}

function renderProduct(product) {
    document.title = product.name + ' - TechStore';
    document.getElementById('breadcrumbProduct').textContent = product.name;
    document.getElementById('productCategory').textContent = CATEGORIES[product.category] || product.category;
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productPrice').textContent = formatPrice(product.price);
    document.getElementById('productShort').textContent = product.description;
    document.getElementById('productMainImage').src = product.image;
    document.getElementById('productMainImage').alt = product.name;

    const thumbs = document.getElementById('productGalleryThumbs');
    thumbs.innerHTML = `<button type="button" class="product-thumb active"><img src="${product.image}" alt=""></button>`;

    document.getElementById('productDescription').innerHTML = '<p>' + product.description + '</p><p>Sản phẩm được bán tại TechStore với chính sách bảo hành và đổi trả rõ ràng. Liên hệ hotline để được tư vấn thêm.</p>';

    const tbody = document.getElementById('productSpecsTable').querySelector('tbody');
    tbody.innerHTML = getSpecs(product).map(([label, value]) =>
        '<tr><td class="spec-label">' + label + '</td><td class="spec-value">' + value + '</td></tr>'
    ).join('');

    const related = PRODUCTS.filter(r => r.category === product.category && r.id !== product.id).slice(0, 4);
    const relatedGrid = document.getElementById('relatedProductsGrid');
    relatedGrid.innerHTML = related.map(r => `
        <article class="product-card">
            <a href="product.html?id=${r.id}">
                <div class="product-image">
                    <img src="${r.image}" alt="${r.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="product-category">${CATEGORIES[r.category]}</span>
                    <h3 class="product-name">${r.name}</h3>
                    <div class="product-price">${formatPrice(r.price)}</div>
                </div>
            </a>
        </article>
    `).join('');
}

function initTabs() {
    document.querySelectorAll('.product-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.product-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.product-tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const panel = document.getElementById('tab-' + tab);
            if (panel) panel.classList.add('active');
        });
    });
}

function initQty() {
    const input = document.getElementById('productQty');
    const minus = document.getElementById('qtyMinus');
    const plus = document.getElementById('qtyPlus');
    if (!input) return;
    minus.addEventListener('click', () => { const v = parseInt(input.value, 10) || 1; input.value = Math.max(1, v - 1); });
    plus.addEventListener('click', () => { const v = parseInt(input.value, 10) || 1; input.value = Math.min(99, v + 1); });
}

function addToCart(product, qty) {
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.qty += qty;
    else cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, image: product.image, qty: qty });
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

async function init() {
    await fetchProductsFromAPI();
    const id = getProductId();
    const product = id ? getProductById(id) : null;

    if (!product) {
        document.getElementById('productNotFound').classList.remove('hidden');
        document.getElementById('productDetailPage').classList.add('hidden');
        return;
    }

    renderProduct(product);
    initTabs();
    initQty();

    document.getElementById('btnAddToCart').addEventListener('click', () => {
        const qty = parseInt(document.getElementById('productQty').value, 10) || 1;
        addToCart(product, qty);
        if (confirm('Đã thêm vào giỏ hàng. Bạn có muốn đến trang giỏ hàng không?')) {
            window.location.href = 'index.html';
        }
    });

    document.getElementById('btnBuyNow').addEventListener('click', (e) => {
        e.preventDefault();
        const qty = parseInt(document.getElementById('productQty').value, 10) || 1;
        addToCart(product, qty);
        window.location.href = 'checkout.html';
    });
}

init();
