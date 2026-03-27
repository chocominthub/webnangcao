/**
 * TechStore CSKH Chatbot
 * Bot chăm sóc khách hàng tự động
 */

const BOT_NAME = 'TechBot 🤖';
const BOT_AVATAR = '🤖';

// ===== CƠ SỞ TRI THỨC =====
const KB = [
  {
    keys: ['xin chào', 'hello', 'hi', 'chào', 'hey', 'alo'],
    reply: () => `Xin chào! Tôi là **TechBot**, trợ lý ảo của TechStore 🎉\nTôi có thể giúp bạn về:\n• 🛍️ Sản phẩm & giá cả\n• 🚚 Vận chuyển & giao hàng\n• 🔄 Đổi trả & bảo hành\n• 💳 Thanh toán\n• 📦 Theo dõi đơn hàng\n\nBạn cần hỗ trợ gì không?`,
    quick: ['Xem sản phẩm', 'Chính sách vận chuyển', 'Đổi trả', 'Thanh toán']
  },
  {
    keys: ['laptop', 'máy tính xách tay', 'notebook'],
    reply: () => `Chúng tôi có các dòng laptop hot nhất:\n\n💻 **Gaming**: ASUS ROG Strix G16 - 35.990.000₫\n💼 **Văn phòng**: ThinkPad E14 Gen 5 - 18.990.000₫\n🎨 **Sáng tạo**: Dell XPS 15 OLED - 42.990.000₫\n🍎 **MacBook**: MacBook Air M3 - 34.990.000₫\n\nBạn muốn dùng laptop cho mục đích gì? Gaming, văn phòng hay sáng tạo nội dung?`,
    quick: ['Laptop gaming', 'Laptop văn phòng', 'MacBook', 'Xem tất cả']
  },
  {
    keys: ['điện thoại', 'phone', 'iphone', 'samsung', 'xiaomi', 'oppo', 'di động'],
    reply: () => `Điện thoại bán chạy tại TechStore:\n\n📱 **iPhone 15 Pro** 256GB - 29.990.000₫ 🔥\n📱 **Samsung S24 Ultra** 256GB - 32.990.000₫\n📱 **Xiaomi 14 Ultra** - 23.990.000₫\n📱 **OPPO Find X7 Pro** - 21.990.000₫\n\nTất cả đều là hàng chính hãng, bảo hành 12 tháng!`,
    quick: ['iPhone', 'Samsung', 'So sánh giá', 'Trả góp']
  },
  {
    keys: ['linh kiện', 'cpu', 'ram', 'ssd', 'vga', 'card', 'mainboard', 'nguồn', 'pc', 'gaming'],
    reply: () => `Linh kiện máy tính chính hãng tại TechStore:\n\n🔲 **CPU**: Intel i5-13400F (4.99M), AMD R5 5600X (4.29M)\n🎮 **VGA**: RTX 4060 Ti 8GB (11.99M)\n📦 **RAM**: DDR4 16GB 3200MHz (890K)\n💾 **SSD**: Samsung 970 EVO 500GB NVMe (1.15M)\n\nCần tư vấn cấu hình máy tính? Cho tôi biết ngân sách nhé!`,
    quick: ['Cấu hình 10 triệu', 'Cấu hình 20 triệu', 'Tư vấn gaming', 'So sánh CPU']
  },
  {
    keys: ['màn hình', 'monitor', 'display'],
    reply: () => `Màn hình đang có tại TechStore:\n\n🖥️ **LG 27" 4K IPS** USB-C - 8.99M (văn phòng/thiết kế)\n🎮 **Samsung Odyssey G7 32"** 240Hz - 11.99M (gaming)\n💼 **Dell 24" FHD** - 3.29M (văn phòng tiết kiệm)\n\nBạn dùng cho mục đích gì? Gaming hay làm việc?`,
    quick: ['Màn hình gaming', 'Màn hình 4K', 'Dưới 5 triệu']
  },
  {
    keys: ['phụ kiện', 'chuột', 'bàn phím', 'tai nghe', 'webcam', 'keyboard', 'mouse', 'headphone'],
    reply: () => `Phụ kiện hot nhất:\n\n⌨️ **Keychron K2 Pro** (cơ không dây) - 1.99M\n🖱️ **Logitech MX Master 3S** - 2.49M\n🎧 **Sony WH-1000XM5** (chống ồn ANC) - 7.99M\n📷 **Webcam Logitech C920** 1080p - 1.89M\n\nTất cả có bảo hành chính hãng!`,
    quick: ['Bàn phím cơ', 'Tai nghe chống ồn', 'Chuột không dây']
  },
  {
    keys: ['giá', 'bao nhiêu tiền', 'price', 'rẻ', 'đắt', 'khuyến mãi', 'sale', 'giảm giá'],
    reply: () => `Tại TechStore, chúng tôi cam kết:\n\n✅ **Giá tốt nhất thị trường** - Chênh lệch hoàn tiền\n🏷️ **Nhiều sản phẩm đang khuyến mãi** (xem badge "Hot", "Bán chạy")\n💰 **Trả góp 0%** qua thẻ tín dụng\n🎁 **Ưu đãi thành viên** khi đăng ký tài khoản\n\nBạn đang quan tâm đến sản phẩm nào? Tôi sẽ báo giá chính xác nhất!`,
    quick: ['Xem sản phẩm hot', 'Trả góp', 'Combo tiết kiệm']
  },
  {
    keys: ['vận chuyển', 'giao hàng', 'ship', 'delivery', 'nhận hàng', 'bao lâu'],
    reply: () => `🚚 **Chính sách vận chuyển TechStore:**\n\n• **Miễn phí vận chuyển** cho đơn từ 500K\n• **Nội thành HCM & HN**: 2-4 tiếng (giao hỏa tốc)\n• **Toàn quốc**: 1-3 ngày làm việc\n• **Tỉnh xa**: 3-5 ngày làm việc\n\n📦 Đơn hàng được đóng gói cẩn thận, có tem niêm phong\n🔍 Có thể theo dõi đơn hàng trực tuyến`,
    quick: ['Phí ship', 'Giao hỏa tốc', 'Theo dõi đơn']
  },
  {
    keys: ['đổi trả', 'hoàn tiền', 'return', 'refund', 'bảo hành', 'warranty', 'hỏng', 'lỗi'],
    reply: () => `🔄 **Chính sách đổi trả & bảo hành:**\n\n✅ **Đổi hàng trong 7 ngày** nếu lỗi do nhà sản xuất\n✅ **Hoàn tiền trong 24h** nếu sản phẩm không đúng mô tả\n🛡️ **Bảo hành chính hãng**: 12-24 tháng tùy sản phẩm\n🔧 **Trung tâm bảo hành** tại 123 Đường Công Nghệ, Q.1\n\n📞 Hotline hỗ trợ: **1900 xxxx** (8:00 - 22:00)`,
    quick: ['Điều kiện đổi trả', 'Thời gian bảo hành', 'Hotline']
  },
  {
    keys: ['thanh toán', 'payment', 'cod', 'momo', 'vnpay', 'chuyển khoản', 'thẻ', 'trả góp'],
    reply: () => `💳 **Phương thức thanh toán:**\n\n💵 **COD** - Thanh toán khi nhận hàng\n🏦 **Chuyển khoản** - ACB 17543271 (VU HUY HOANG)\n🔷 **VNPay** - Thanh toán QR nhanh\n🟣 **Momo** - Ví điện tử tiện lợi\n💳 **Trả góp 0%** - Qua Shinhan, FE Credit, HD Saison\n\nTất cả giao dịch đều được mã hóa bảo mật SSL 🔒`,
    quick: ['Trả góp 0%', 'Quét QR', 'COD']
  },
  {
    keys: ['đơn hàng', 'order', 'theo dõi', 'track', 'kiểm tra đơn', 'mã đơn'],
    reply: () => `📦 **Theo dõi đơn hàng:**\n\nNếu bạn đã đặt hàng:\n1. 🔐 **Đăng nhập** vào tài khoản\n2. 📦 Click **"Đơn hàng"** trên menu\n3. Xem trạng thái: Chờ xác nhận → Đang giao → Đã giao\n\n📞 Nếu cần hỗ trợ gấp: **1900 xxxx**\n✉️ Email: support@techstore.vn`,
    quick: ['Xem đơn hàng của tôi', 'Hủy đơn', 'Đơn chưa nhận được']
  },
  {
    keys: ['liên hệ', 'contact', 'hotline', 'điện thoại cửa hàng', 'địa chỉ', 'cửa hàng'],
    reply: () => `📍 **Thông tin liên hệ TechStore:**\n\n🏪 **Địa chỉ**: 123 Đường Công nghệ, Phường Bến Nghé, Quận 1, TP.HCM\n📞 **Hotline**: 1900 xxxx (miễn phí, 8:00-22:00)\n📱 **Zalo**: 028 xxxx xxxx\n✉️ **Email**: support@techstore.vn\n🕐 **Giờ làm việc**: T2-T7: 8:00-21:00, CN: 9:00-18:00`,
    quick: ['Đường dẫn Google Maps', 'Chat Zalo', 'Email hỗ trợ']
  },
  {
    keys: ['tư vấn', 'giúp', 'hỗ trợ', 'cần', 'muốn mua', 'recommend', 'gợi ý', 'nên mua'],
    reply: () => `Tôi rất vui được tư vấn cho bạn! 💪\n\nBạn đang quan tâm đến loại sản phẩm nào?\n\n🎮 Gaming: Laptop, VGA, tai nghe, ghế gaming\n💼 Văn phòng: Laptop, màn hình, bàn phím, chuột\n📱 Di động: Điện thoại, tai nghe, phụ kiện\n🔧 PC DIY: CPU, mainboard, RAM, SSD, case\n\nChia sẻ nhu cầu và ngân sách, tôi sẽ gợi ý phù hợp nhất!`,
    quick: ['Ngân sách 10 triệu', 'Ngân sách 20 triệu', 'Laptop gaming', 'Điện thoại']
  },
  {
    keys: ['cảm ơn', 'thanks', 'thank you', 'ok', 'oke', 'được rồi', 'hiểu rồi'],
    reply: () => `Rất vui được hỗ trợ bạn! 😊\n\nNếu cần thêm thông tin hãy hỏi tôi nhé. Chúc bạn mua sắm vui vẻ tại TechStore! 🛍️`,
    quick: ['Xem sản phẩm ngay', 'Hỏi thêm']
  }
];

const DEFAULT_REPLY = (msg) => `Tôi chưa hiểu câu hỏi của bạn về "${msg}" 😅\n\nBạn có thể hỏi tôi về:\n• Sản phẩm (laptop, điện thoại, linh kiện...)\n• Giá cả, khuyến mãi\n• Vận chuyển, đổi trả, bảo hành\n• Thanh toán\n• Liên hệ, địa chỉ cửa hàng`;
const DEFAULT_QUICK = ['Sản phẩm', 'Vận chuyển', 'Đổi trả', 'Liên hệ'];

// ===== TRẠNG THÁI CHATBOT =====
let chatOpen = false;
let msgCount = 0;

// ===== TẠO HTML WIDGET =====
function createWidget() {
  const widget = document.createElement('div');
  widget.innerHTML = `
    <!-- Nút mở chatbot -->
    <button class="chatbot-toggle" id="chatbotToggle" aria-label="Mở chat hỗ trợ">
      <span class="chatbot-toggle-icon" id="chatToggleIcon">💬</span>
      <span class="chatbot-badge hidden" id="chatbotBadge">1</span>
    </button>

    <!-- Cửa sổ chat -->
    <div class="chatbot-window hidden" id="chatbotWindow" role="dialog" aria-label="Chat hỗ trợ">
      <div class="chatbot-header">
        <div class="chatbot-header-info">
          <div class="chatbot-avatar">${BOT_AVATAR}</div>
          <div>
            <div class="chatbot-name">${BOT_NAME}</div>
            <div class="chatbot-status">🟢 Đang hoạt động</div>
          </div>
        </div>
        <button class="chatbot-close" id="chatbotClose" aria-label="Đóng chat">✕</button>
      </div>

      <div class="chatbot-messages" id="chatbotMessages"></div>

      <div class="chatbot-quick-wrap" id="chatbotQuick"></div>

      <div class="chatbot-input-bar">
        <input class="chatbot-input" id="chatbotInput" type="text" placeholder="Nhập câu hỏi..." autocomplete="off" maxlength="200">
        <button class="chatbot-send" id="chatbotSend" aria-label="Gửi">
          <span>➤</span>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);
}

// ===== THÊM CSS =====
function injectCSS() {
  const style = document.createElement('style');
  style.textContent = `
  /* ===== CHATBOT WIDGET ===== */
  .chatbot-toggle {
    position: fixed;
    bottom: 24px; right: 24px;
    width: 60px; height: 60px;
    background: linear-gradient(135deg, #0ea5e9, #6366f1);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.6rem;
    box-shadow: 0 4px 20px rgba(99,102,241,0.45);
    z-index: 2000;
    transition: transform 0.2s, box-shadow 0.2s;
    animation: chatPulse 2.5s ease-in-out infinite;
    cursor: pointer;
    border: none;
  }
  .chatbot-toggle:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(99,102,241,0.55); animation: none; }
  @keyframes chatPulse {
    0%,100% { box-shadow: 0 4px 20px rgba(99,102,241,.4); }
    50%      { box-shadow: 0 4px 28px rgba(99,102,241,.75); }
  }

  .chatbot-badge {
    position: absolute;
    top: -3px; right: -3px;
    min-width: 20px; height: 20px;
    padding: 0 5px;
    background: #ef4444;
    color: white; font-size: 0.7rem; font-weight: 700;
    border-radius: 999px;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid white;
  }

  /* Window */
  .chatbot-window {
    position: fixed;
    bottom: 96px; right: 24px;
    width: 360px;
    max-height: 560px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
    z-index: 1999;
    display: flex; flex-direction: column;
    overflow: hidden;
    transform-origin: bottom right;
    transition: opacity .25s, transform .25s;
    opacity: 1; transform: scale(1);
  }
  .chatbot-window.hidden { opacity: 0; transform: scale(0.88) translateY(12px); pointer-events: none; }
  @media (max-width: 420px) {
    .chatbot-window { width: calc(100vw - 16px); right: 8px; bottom: 84px; }
  }

  /* Header */
  .chatbot-header {
    background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
    padding: 1rem 1.1rem;
    display: flex; align-items: center; justify-content: space-between;
    color: white;
    flex-shrink: 0;
  }
  .chatbot-header-info { display: flex; align-items: center; gap: 0.7rem; }
  .chatbot-avatar {
    width: 40px; height: 40px;
    background: rgba(255,255,255,.25);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.35rem;
  }
  .chatbot-name { font-weight: 700; font-size: 1rem; }
  .chatbot-status { font-size: 0.75rem; opacity: 0.9; margin-top: 1px; }
  .chatbot-close {
    width: 30px; height: 30px;
    background: rgba(255,255,255,.15);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; color: white; cursor: pointer; border: none;
    transition: background .2s;
  }
  .chatbot-close:hover { background: rgba(255,255,255,.3); }

  /* Messages */
  .chatbot-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex; flex-direction: column; gap: 0.75rem;
    background: #f8fafc;
    scroll-behavior: smooth;
  }
  .chatbot-messages::-webkit-scrollbar { width: 4px; }
  .chatbot-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

  .chat-msg { display: flex; gap: 0.5rem; align-items: flex-end; animation: msgIn .2s ease; }
  @keyframes msgIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }

  .chat-msg.bot { flex-direction: row; }
  .chat-msg.user { flex-direction: row-reverse; }

  .chat-msg-avatar {
    width: 28px; height: 28px;
    background: linear-gradient(135deg, #0ea5e9, #6366f1);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; flex-shrink: 0;
  }

  .chat-msg-bubble {
    max-width: 80%;
    padding: 0.65rem 0.9rem;
    border-radius: 16px;
    font-size: 0.88rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .chat-msg.bot .chat-msg-bubble {
    background: white;
    color: #1e293b;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 4px rgba(0,0,0,.08);
  }
  .chat-msg.bot .chat-msg-bubble strong { color: #0ea5e9; }
  .chat-msg.user .chat-msg-bubble {
    background: linear-gradient(135deg, #0ea5e9, #6366f1);
    color: white;
    border-bottom-right-radius: 4px;
  }

  /* Typing indicator */
  .chat-typing .chat-msg-bubble {
    padding: 0.65rem 1rem;
    display: flex; gap: 5px; align-items: center;
  }
  .chat-dot {
    width: 7px; height: 7px;
    background: #94a3b8;
    border-radius: 50%;
    animation: dotBounce .9s infinite ease-in-out;
  }
  .chat-dot:nth-child(2) { animation-delay: .15s; }
  .chat-dot:nth-child(3) { animation-delay: .3s; }
  @keyframes dotBounce {
    0%,60%,100% { transform: translateY(0); }
    30% { transform: translateY(-5px); }
  }

  /* Quick replies */
  .chatbot-quick-wrap {
    padding: 0.5rem 0.75rem;
    display: flex; flex-wrap: wrap; gap: 0.4rem;
    background: white;
    border-top: 1px solid #e2e8f0;
    flex-shrink: 0;
  }
  .chatbot-quick-wrap:empty { display: none; }
  .chatbot-quick-btn {
    padding: 0.35rem 0.75rem;
    border: 1.5px solid #0ea5e9;
    border-radius: 999px;
    font-size: 0.78rem;
    color: #0ea5e9;
    font-weight: 600;
    cursor: pointer;
    background: white;
    transition: all .2s;
    font-family: inherit;
  }
  .chatbot-quick-btn:hover { background: #0ea5e9; color: white; }

  /* Input */
  .chatbot-input-bar {
    display: flex;
    padding: 0.75rem;
    border-top: 1px solid #e2e8f0;
    gap: 0.5rem;
    background: white;
    flex-shrink: 0;
  }
  .chatbot-input {
    flex: 1;
    padding: 0.6rem 0.9rem;
    border: 1.5px solid #e2e8f0;
    border-radius: 999px;
    font-size: 0.9rem;
    font-family: 'Be Vietnam Pro', sans-serif;
    outline: none;
    transition: border-color .2s;
  }
  .chatbot-input:focus { border-color: #0ea5e9; }
  .chatbot-send {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #0ea5e9, #6366f1);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 1rem;
    cursor: pointer; border: none;
    transition: transform .15s, box-shadow .15s;
    flex-shrink: 0;
  }
  .chatbot-send:hover { transform: scale(1.08); box-shadow: 0 2px 10px rgba(99,102,241,.4); }
  `;
  document.head.appendChild(style);
}

// ===== LOGIC CHATBOT =====
function findResponse(msg) {
  const lower = msg.toLowerCase().trim();
  for (const item of KB) {
    if (item.keys.some(k => lower.includes(k))) {
      return item;
    }
  }
  return null;
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function addMessage(text, sender = 'bot') {
  const msgs = document.getElementById('chatbotMessages');
  const div = document.createElement('div');
  div.className = `chat-msg ${sender}`;
  if (sender === 'bot') {
    div.innerHTML = `
      <div class="chat-msg-avatar">🤖</div>
      <div class="chat-msg-bubble">${renderMarkdown(text)}</div>`;
  } else {
    div.innerHTML = `<div class="chat-msg-bubble">${text}</div>`;
  }
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  msgCount++;
}

function showTyping() {
  const msgs = document.getElementById('chatbotMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg bot chat-typing';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="chat-msg-avatar">🤖</div>
    <div class="chat-msg-bubble">
      <div class="chat-dot"></div>
      <div class="chat-dot"></div>
      <div class="chat-dot"></div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function renderQuicks(items) {
  const wrap = document.getElementById('chatbotQuick');
  wrap.innerHTML = '';
  if (!items || items.length === 0) return;
  items.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'chatbot-quick-btn';
    btn.textContent = q;
    btn.addEventListener('click', () => sendMessage(q));
    wrap.appendChild(btn);
  });
}

function botReply(userMsg) {
  showTyping();
  setTimeout(() => {
    removeTyping();
    const match = findResponse(userMsg);
    if (match) {
      addMessage(match.reply(), 'bot');
      renderQuicks(match.quick);
    } else {
      addMessage(DEFAULT_REPLY(userMsg), 'bot');
      renderQuicks(DEFAULT_QUICK);
    }
  }, 700 + Math.random() * 400);
}

function sendMessage(text) {
  const input = document.getElementById('chatbotInput');
  const msg = (text || input.value).trim();
  if (!msg) return;
  input.value = '';
  renderQuicks([]);
  addMessage(msg, 'user');
  botReply(msg);
}

// ===== ĐIỀU KHIỂN MỞ/ĐÓNG =====
function openChat() {
  chatOpen = true;
  document.getElementById('chatbotWindow').classList.remove('hidden');
  document.getElementById('chatToggleIcon').textContent = '✕';
  document.getElementById('chatbotBadge').classList.add('hidden');
  document.getElementById('chatbotInput').focus();

  // Lời chào nếu chưa có tin nhắn
  if (msgCount === 0) {
    const greetItem = KB[0];
    addMessage(greetItem.reply(), 'bot');
    renderQuicks(greetItem.quick);
  }
}

function closeChat() {
  chatOpen = false;
  document.getElementById('chatbotWindow').classList.add('hidden');
  document.getElementById('chatToggleIcon').textContent = '💬';
}

// ===== KHỞI TẠO =====
function initChatbot() {
  injectCSS();
  createWidget();

  document.getElementById('chatbotToggle').addEventListener('click', () => {
    chatOpen ? closeChat() : openChat();
  });
  document.getElementById('chatbotClose').addEventListener('click', closeChat);

  document.getElementById('chatbotSend').addEventListener('click', () => sendMessage());
  document.getElementById('chatbotInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Hiện badge sau 3 giây nếu chưa mở
  setTimeout(() => {
    if (!chatOpen) {
      const badge = document.getElementById('chatbotBadge');
      badge.classList.remove('hidden');
      badge.textContent = '1';
    }
  }, 3000);
}

// Chờ DOM xong
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbot);
} else {
  initChatbot();
}
