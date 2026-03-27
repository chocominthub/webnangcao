/**
 * TechStore - Product Comparison Logic
 */

const API = 'http://localhost:5000/api';
const COMPARE_KEY = 'techstore_compare';

// Format currency
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Lấy danh sách ID sản phẩm đang so sánh từ localStorage
function getCompareIds() {
    return JSON.parse(localStorage.getItem(COMPARE_KEY)) || [];
}

// Xóa 1 sản phẩm khỏi danh sách so sánh
function removeCompare(id) {
    let ids = getCompareIds();
    ids = ids.filter(compareId => compareId !== id);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
    loadCompareProducts(); // Tải lại bảng
}

// Xóa tất cả
document.getElementById('clearCompareBtn').addEventListener('click', () => {
    localStorage.removeItem(COMPARE_KEY);
    loadCompareProducts();
});

// Helper function to extract dummy specs based on product name/category for comparison 
// since we don't have a real specs table in DB
function extractSpecs(p) {
    const specs = {
        'Thương hiệu': p.name.split(' ')[0], // Đoán thương hiệu từ chữ đầu tiên
        'Phân loại': p.category === 'dien-thoai' ? 'Điện thoại' : 
                     p.category === 'laptop' ? 'Laptop' : 
                     p.category === 'linh-kien' ? 'Linh kiện' :
                     p.category === 'man-hinh' ? 'Màn hình' : 'Phụ kiện',
        'Tồn kho': p.stock > 0 ? `Còn ${p.stock} sản phẩm` : '<span class="spec-false">Hết hàng</span>',
        'Đánh giá': p.rating ? `⭐ ${p.rating}/5` : 'Chưa có đánh giá',
        'Mô tả': p.description || 'Không có mô tả chi tiết'
    };

    if (p.category === 'dien-thoai') {
        specs['Bảo hành'] = '12 tháng chính hãng';
        specs['Hệ điều hành'] = p.name.toLowerCase().includes('iphone') ? 'iOS' : 'Android';
    } else if (p.category === 'laptop') {
        specs['Bảo hành'] = '24 tháng';
    } else if (p.category === 'linh-kien') {
        specs['Bảo hành'] = '36 tháng';
    }

    return specs;
}

// Render the comparison table
function renderTable(products, allProducts = []) {
    const container = document.getElementById('compareContent');
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-compare">
                <h2>Không có sản phẩm nào để so sánh</h2>
                <p>Vui lòng quay lại trang chủ và chọn ít nhất 2 sản phẩm để so sánh.</p>
                <a href="index.html" class="btn btn-primary" style="margin-top: 1rem; display: inline-block;">🏠 Quay lại Trang chủ</a>
            </div>
        `;
        return;
    }

    // Prepare table markup
    let html = `
    <div class="compare-table-wrapper">
        <table class="compare-table">
            <thead>
                <tr>
                    <th><!-- Empty top-left cell --></th>
    `;

    // Cột Header cho mỗi sản phẩm (Hình + Tên + Giá)
    products.forEach(p => {
        html += `
            <th>
                <img src="${p.image}" alt="${p.name}" class="compare-product-img" onerror="this.src='https://via.placeholder.com/150';">
                <div class="compare-product-name"><a href="product.html?id=${p._id}" class="text-reset">${p.name}</a></div>
                <div class="compare-product-price">${formatPrice(p.price)}</div>
                <button type="button" class="btn btn-primary" onclick="window.location.href='product.html?id=${p._id}'" style="width: 100%; margin-bottom: 0.5rem;">Xem chi tiết</button>
                <button type="button" class="btn-remove-compare" onclick="removeCompare('${p._id}')">❌ Bỏ khỏi so sánh</button>
            </th>
        `;
    });

    // Cột Thêm Sản Phẩm (nếu < 4 sản phẩm)
    if (products.length < 4 && allProducts.length > 0) {
        const availableOptions = allProducts.filter(ap => !products.find(cp => cp._id === ap._id));
        const optionsHtml = availableOptions.map(o => `<option value="${o._id}">${o.name}</option>`).join('');
        
        html += `
            <th style="vertical-align: middle; text-align: center; background: var(--bg);">
                <div style="padding: 1.5rem; border: 2px dashed var(--border); border-radius: var(--radius-sm); height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 1rem;">
                    <div style="font-size: 2rem; color: var(--text-muted); line-height: 1;">+</div>
                    <div style="font-weight: 500; color: var(--text-muted);">Thêm sản phẩm</div>
                    <select class="form-control" style="width: 100%; max-width: 220px; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border);" onchange="addCompareFromSelect(this)">
                        <option value="">-- Chọn sản phẩm --</option>
                        ${optionsHtml}
                    </select>
                </div>
            </th>
        `;
    }

    html += `
                </tr>
            </thead>
            <tbody>
    `;

    // Trích xuất các thuộc tính độc nhất từ tất cả sản phẩm
    const allSpecsList = products.map(p => extractSpecs(p));
    // Lấy Set của tất cả các tên thuộc tính
    const specKeys = new Set();
    allSpecsList.forEach(specs => {
        Object.keys(specs).forEach(key => specKeys.add(key));
    });

    // Vẽ từng dòng thuộc tính
    Array.from(specKeys).forEach(key => {
        html += `<tr>`;
        html += `<td>${key}</td>`; // Cột tên thuộc tính
        
        products.forEach((p, index) => {
            const specValue = allSpecsList[index][key] || '—';
            html += `<td>${specValue}</td>`;
        });
        
        // Ô trống cho cột Thêm Sản Phẩm nếu < 4 sản phẩm
        if (products.length < 4 && allProducts.length > 0) {
            html += `<td style="background: var(--bg);"></td>`;
        }
        
        html += `</tr>`;
    });

    html += `
            </tbody>
        </table>
    </div>
    `;

    container.innerHTML = html;
}

// Tải dữ liệu các sản phẩm đang so sánh
async function loadCompareProducts() {
    const ids = getCompareIds();
    if (ids.length === 0) {
        renderTable([]);
        return;
    }

    document.getElementById('compareContent').innerHTML = '<div class="empty-compare">Đang tải biểu đồ so sánh...</div>';

    try {
        const res = await fetch(`${API}/products`);
        const allProducts = await res.json();
        
        // Lọc ra các sản phẩm nằm trong danh sách compare
        const compareProducts = allProducts.filter(p => ids.includes(p._id));
        renderTable(compareProducts, allProducts);
    } catch (err) {
        console.error('Lỗi khi tải sản phẩm so sánh:', err);
        document.getElementById('compareContent').innerHTML = '<div class="empty-compare" style="color:red">Lỗi tải dữ liệu. Vui lòng thử lại.</div>';
    }
}

// Thêm sản phẩm từ dropdown trên trang so sánh
window.addCompareFromSelect = function(select) {
    if (!select.value) return;
    let ids = getCompareIds();
    if (ids.length >= 4) {
        alert('Tối đa 4 sản phẩm.');
        select.value = "";
        return;
    }
    if (!ids.includes(select.value)) {
        ids.push(select.value);
        localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
        loadCompareProducts();
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadCompareProducts();
});
