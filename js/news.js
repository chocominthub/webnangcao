/**
 * TechStore - Trang Tin tức công nghệ
 * Hiển thị bài báo, tin tức sản phẩm công nghệ
 */

const U = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80`;

const ARTICLES = [
    { id: 1, category: 'linh-kien', title: 'Intel ra mắt CPU thế hệ 15: Hiệu năng vượt trội cho gaming', excerpt: 'Intel chính thức giới thiệu dòng processor Core Ultra thế hệ mới với kiến trúc Arrow Lake, hứa hẹn cải thiện hiệu năng và tiết kiệm điện năng đáng kể.', date: '2025-03-12', image: U('1678435733095-6dccb4f1a5c8'), link: '#' },
    { id: 2, category: 'dien-thoai', title: 'iPhone 16 Pro Max đánh giá: Camera 48MP và chip A18 Pro', excerpt: 'Apple nâng cấp camera chính lên 48MP trên toàn bộ dòng iPhone 16, cùng chip A18 Pro mạnh mẽ và màn hình ProMotion 120Hz.', date: '2025-03-11', image: U('1556284257-0c29a7e245b1'), link: '#' },
    { id: 3, category: 'laptop', title: 'Laptop gaming 2025: RTX 50 series và màn hình OLED phổ biến', excerpt: 'Xu hướng laptop gaming năm nay tập trung vào card đồ họa thế hệ mới và màn hình OLED cho trải nghiệm hình ảnh sống động hơn.', date: '2025-03-10', image: U('1618424181497-157f25b6ddd5'), link: '#' },
    { id: 4, category: 'linh-kien', title: 'NVIDIA RTX 5090: Thông số rò rỉ, hiệu năng gấp đôi RTX 4090?', excerpt: 'Nguồn tin từ nhà sản xuất cho biết RTX 5090 sẽ sử dụng nhân Blackwell, dung lượng VRAM 32GB GDDR7 và TDP cao hơn.', date: '2025-03-09', image: U('1555618254-84e2cf498b01'), link: '#' },
    { id: 5, category: 'industry', title: 'AI trên smartphone: Google Gemini và Samsung Galaxy AI so tài', excerpt: 'Các hãng lớn đua nhau tích hợp AI vào điện thoại, từ trợ lý ảo đến xử lý ảnh thông minh, mở ra kỷ nguyên smartphone AI.', date: '2025-03-08', image: U('1732998369893-af4c9a4695fe'), link: '#' },
    { id: 6, category: 'dien-thoai', title: 'Samsung Galaxy S25 Ultra: Bút S Pen nâng cấp, camera 200MP', excerpt: 'Galaxy S25 Ultra tiếp tục là flagship Android mạnh nhất với bút S Pen được cải tiến độ trễ thấp và bộ camera hợp tác với Olympus.', date: '2025-03-07', image: U('1732998363838-209c53487dde'), link: '#' },
    { id: 7, category: 'laptop', title: 'MacBook Air M4: Chip Apple M4, thiết kế mỏng nhẹ không đổi', excerpt: 'MacBook Air thế hệ mới dùng chip M4 với CPU 10 nhân, GPU 10 nhân, hỗ trợ 2 màn hình ngoài và thời lượng pin lên tới 18 giờ.', date: '2025-03-06', image: U('1511385348-a52b4a160dc2'), link: '#' },
    { id: 8, category: 'linh-kien', title: 'RAM DDR5 giá giảm mạnh: Thời điểm lên đời cho PC?', excerpt: 'Giá RAM DDR5-5600 đã giảm gần 40% so với đầu năm 2024, nhiều chuyên gia khuyên người dùng nên nâng cấp trong quý 2.', date: '2025-03-05', image: U('1760708626495-91e1415be067'), link: '#' },
    { id: 9, category: 'industry', title: 'CES 2025: Tổng hợp sản phẩm công nghệ đáng chú ý', excerpt: 'Triển lãm CES 2025 quy tụ hàng nghìn sản phẩm từ TV 8K, robot gia đình, đến xe điện và thiết bị đeo tay thông minh.', date: '2025-03-04', image: U('1527800792452-506aacb2101f'), link: '#' },
];

const CATEGORY_LABELS = {
    'linh-kien': 'Linh kiện',
    'dien-thoai': 'Điện thoại',
    'laptop': 'Laptop',
    'industry': 'Công nghiệp'
};

function formatDate(str) {
    const d = new Date(str);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function renderArticles(list) {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;

    grid.innerHTML = list.map(a => `
        <article class="news-card" data-category="${a.category}">
            <a href="${a.link}" class="news-card-link">
                <div class="news-card-image">
                    <img src="${a.image}" alt="${a.title}" loading="lazy">
                </div>
                <div class="news-card-body">
                    <span class="news-card-category">${CATEGORY_LABELS[a.category] || a.category}</span>
                    <h3 class="news-card-title">${a.title}</h3>
                    <p class="news-card-excerpt">${a.excerpt}</p>
                    <time class="news-card-date" datetime="${a.date}">${formatDate(a.date)}</time>
                    <span class="news-card-more">Đọc tiếp →</span>
                </div>
            </a>
        </article>
    `).join('');
}

function filterArticles() {
    const category = document.querySelector('.news-filter-btn.active')?.dataset.category || 'all';
    const query = (document.getElementById('newsSearchInput')?.value || '').toLowerCase().trim();

    let list = [...ARTICLES];
    if (category !== 'all') list = list.filter(a => a.category === category);
    if (query) list = list.filter(a => a.title.toLowerCase().includes(query) || a.excerpt.toLowerCase().includes(query));

    renderArticles(list);
}

function init() {
    renderArticles(ARTICLES);

    document.querySelectorAll('.news-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.news-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterArticles();
        });
    });

    const searchInput = document.getElementById('newsSearchInput');
    const searchBtn = document.getElementById('newsSearchBtn');
    if (searchInput) searchInput.addEventListener('input', filterArticles);
    if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') filterArticles(); });
    if (searchBtn) searchBtn.addEventListener('click', filterArticles);
}

init();
