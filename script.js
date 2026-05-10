// ===== PRODUCT DATA =====
const products = [
  // Electronics
  { id: 1, name: 'หูฟัง Bluetooth Pro X', category: 'electronics', price: 1490, oldPrice: 2990, emoji: '🎧', rating: 4.8, reviews: 1243, badge: 'ขายดี', desc: 'หูฟังไร้สายคุณภาพสูง ตัดเสียงรบกวน ANC ใช้งานได้ 30 ชั่วโมง กันน้ำ IPX5 เสียงสมดุล ไดร์เวอร์ 40mm' },
  { id: 2, name: 'สมาร์ทวอทช์ Series 8', category: 'electronics', price: 5990, oldPrice: 8990, emoji: '⌚', rating: 4.7, reviews: 872, badge: 'ใหม่', desc: 'นาฬิกาอัจฉริยะติดตามสุขภาพ วัดอัตราหัวใจ ออกซิเจนในเลือด GPS ในตัว กันน้ำ 50M' },
  { id: 3, name: 'โดรนถ่ายภาพ 4K Mini', category: 'electronics', price: 7800, oldPrice: 11500, emoji: '🚁', rating: 4.5, reviews: 345, badge: '-32%', desc: 'โดรนกล้อง 4K Ultra HD กันสั่น 3 แกน บินได้ 25 นาที ควบคุมระยะไกล 1000 เมตร' },
  { id: 4, name: 'แท็บเล็ต 10.5" 2026', category: 'electronics', price: 9990, oldPrice: 14990, emoji: '📱', rating: 4.6, reviews: 589, badge: 'ลด 33%', desc: 'แท็บเล็ตหน้าจอ IPS 10.5 นิ้ว RAM 8GB รองรับ WiFi 6 แบตเตอรี่ 8000 mAh รองรับปากกา' },

  // Fashion
  { id: 5, name: 'เสื้อยืด Oversized Cotton', category: 'fashion', price: 390, oldPrice: 590, emoji: '👕', rating: 4.9, reviews: 2105, badge: 'ขายดี', desc: 'เสื้อยืด Oversize ผ้า Cotton 100% ระบายอากาศดี นุ่มสบาย มีหลายสีให้เลือก ซักง่าย ไม่หด' },
  { id: 6, name: 'กางเกง Jogger สีพาสเทล', category: 'fashion', price: 590, oldPrice: 890, emoji: '👖', rating: 4.6, reviews: 743, badge: null, desc: 'กางเกงจ๊อกเกอร์ผ้า Poly-Cotton นุ่มสบาย ยืดหยุ่นดี เอวยางยืดปรับได้ เหมาะทุกกิจกรรม' },
  { id: 7, name: 'กระเป๋า Tote ผ้า Canvas', category: 'fashion', price: 450, oldPrice: 750, emoji: '👜', rating: 4.7, reviews: 918, badge: 'ขายดี', desc: 'กระเป๋า Tote ผ้า Canvas คุณภาพสูง จุของได้เยอะ สายยาวปรับได้ มีช่องซิปด้านใน' },
  { id: 8, name: 'รองเท้าผ้าใบ Air Cushion', category: 'fashion', price: 1290, oldPrice: 2190, emoji: '👟', rating: 4.5, reviews: 421, badge: '-41%', desc: 'รองเท้าผ้าใบ Cushion รองรับการกระแทก ระบายอากาศดี น้ำหนักเบา เหมาะออกกำลังกาย' },

  // Beauty
  { id: 9, name: 'เซรั่มวิตามิน C 30ml', category: 'beauty', price: 890, oldPrice: 1590, emoji: '✨', rating: 4.9, reviews: 3124, badge: 'Top', desc: 'เซรั่มวิตามิน C เข้มข้น 20% ลดรอยดำ กระจ่างใส ผิวเรียบเนียน เหมาะทุกสภาพผิว' },
  { id: 10, name: 'มอยส์เจอไรเซอร์ SPF50', category: 'beauty', price: 650, oldPrice: 990, emoji: '🧴', rating: 4.7, reviews: 1876, badge: null, desc: 'ครีมกันแดด + มอยส์เจอร์ SPF50 PA+++ บางเบา ไม่อุดตัน ให้ความชุ่มชื้น 24 ชั่วโมง' },
  { id: 11, name: 'แป้งฝุ่น HD Matte Finish', category: 'beauty', price: 420, oldPrice: 690, emoji: '💄', rating: 4.6, reviews: 2341, badge: 'ใหม่', desc: 'แป้งฝุ่นควบคุมความมัน HD สูตรใหม่ ติดทนนาน 16 ชั่วโมง ไม่ตกร่อง เบาสบายผิว' },
  { id: 12, name: 'ลิปสติกเนื้อแมต 12สี', category: 'beauty', price: 290, oldPrice: 490, emoji: '💋', rating: 4.8, reviews: 4562, badge: 'ขายดี', desc: 'ลิปสติกเนื้อแมตชุ่มชื้น ติดทนนาน 8 ชั่วโมง ไม่แห้งแตก มี 12 เฉดสีให้เลือก' },

  // Home
  { id: 13, name: 'เตียงแมวคิ้วท์ ขนนุ่ม', category: 'home', price: 590, oldPrice: 990, emoji: '🛏️', rating: 4.8, reviews: 756, badge: 'ขายดี', desc: 'เตียงแมวทรงกลม ผ้าขนนุ่มสบาย กันน้ำด้านล่าง ซักเครื่องได้ รองรับน้ำหนักถึง 10kg' },
  { id: 14, name: 'หม้อหุงข้าว IH 1.8L', category: 'home', price: 2490, oldPrice: 3990, emoji: '🍚', rating: 4.7, reviews: 1023, badge: null, desc: 'หม้อหุงข้าวระบบ IH เหนี่ยวนำ 1.8 ลิตร หุงข้าวอัตโนมัติ อุ่นข้าว 24 ชั่วโมง ล้างง่าย' },
  { id: 15, name: 'ไฟ LED อาบแสง ตั้งโต๊ะ', category: 'home', price: 890, oldPrice: 1490, emoji: '💡', rating: 4.5, reviews: 632, badge: '-40%', desc: 'ไฟตั้งโต๊ะ LED ปรับแสงได้ 3 ระดับ ถนอมสายตา ชาร์จ USB ใช้งานได้ 8 ชั่วโมง' },
  { id: 16, name: 'กระถางต้นไม้เซรามิก Set 3', category: 'home', price: 490, oldPrice: 790, emoji: '🪴', rating: 4.6, reviews: 389, badge: 'ใหม่', desc: 'กระถางเซรามิกเซ็ต 3 ใบ ดีไซน์มินิมอล สีพาสเทล มีจานรอง ขนาด S/M/L' },

  // Sports
  { id: 17, name: 'เชือกกระโดด Speed Pro', category: 'sports', price: 490, oldPrice: 890, emoji: '🪢', rating: 4.7, reviews: 1234, badge: 'ขายดี', desc: 'เชือกกระโดด Speed Rope แบบลูกปืน หมุนเร็ว ลดน้ำหนัก ปรับความยาวได้ ด้ามจับกันลื่น' },
  { id: 18, name: 'ดัมเบล 5kg/ข้าง รับประกัน', category: 'sports', price: 790, oldPrice: 1290, emoji: '🏋️', rating: 4.8, reviews: 876, badge: null, desc: 'ดัมเบล Cast Iron 5kg เคลือบยางกันกระแทก ด้ามจับนูนกันลื่น เหมาะสำหรับออกกำลังกายที่บ้าน' },
  { id: 19, name: 'เสื่อโยคะ 6mm Non-Slip', category: 'sports', price: 690, oldPrice: 1190, emoji: '🧘', rating: 4.9, reviews: 2156, badge: 'Top', desc: 'เสื่อโยคะ NBR หนา 6mm กันลื่นสองด้าน น้ำหนักเบา พกพาง่าย ขนาด 183x61 ซม.' },
  { id: 20, name: 'กระติกน้ำสเตนเลส 1L', category: 'sports', price: 390, oldPrice: 690, emoji: '🥤', rating: 4.6, reviews: 3421, badge: 'ขายดี', desc: 'กระติกน้ำสเตนเลส 304 ขนาด 1 ลิตร เก็บเย็น 24 ชั่วโมง เก็บร้อน 12 ชั่วโมง ไม่รั่วซึม' },
];

// ===== STATE =====
let cart = JSON.parse(localStorage.getItem('shophub_cart') || '[]');
let wishlist = new Set(JSON.parse(localStorage.getItem('shophub_wishlist') || '[]'));
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'default';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartUI();

  document.getElementById('searchInput').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') searchProducts();
    else {
      currentSearch = e.target.value.toLowerCase();
      renderProducts();
    }
  });
});

// ===== RENDER =====
function getFilteredProducts() {
  let items = [...products];

  if (currentCategory !== 'all') {
    items = items.filter(p => p.category === currentCategory);
  }

  if (currentSearch) {
    items = items.filter(p =>
      p.name.toLowerCase().includes(currentSearch) ||
      p.category.toLowerCase().includes(currentSearch)
    );
  }

  switch (currentSort) {
    case 'price-asc':  items.sort((a, b) => a.price - b.price); break;
    case 'price-desc': items.sort((a, b) => b.price - a.price); break;
    case 'name-asc':   items.sort((a, b) => a.name.localeCompare(b.name, 'th')); break;
    case 'rating':     items.sort((a, b) => b.rating - a.rating); break;
  }

  return items;
}

function renderProducts() {
  const items = getFilteredProducts();
  const grid = document.getElementById('productGrid');
  const noResults = document.getElementById('noResults');
  const count = document.getElementById('resultsCount');

  count.textContent = `แสดงสินค้า ${items.length} รายการ`;

  if (items.length === 0) {
    grid.innerHTML = '';
    noResults.classList.remove('hidden');
    return;
  }

  noResults.classList.add('hidden');
  grid.innerHTML = items.map(renderCard).join('');
}

function renderCard(p) {
  const discount = Math.round((1 - p.price / p.oldPrice) * 100);
  const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');
  const inWishlist = wishlist.has(p.id);

  return `
    <div class="product-card" onclick="openModal(${p.id})">
      <div class="product-img">
        <span>${p.emoji}</span>
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <button class="wishlist-btn ${inWishlist ? 'active' : ''}"
          onclick="event.stopPropagation(); toggleWishlist(${p.id}, this)"
          title="เพิ่มในรายการโปรด">
          ${inWishlist ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="product-info">
        <div class="product-category">${getCategoryLabel(p.category)}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span class="rating-num">${p.rating} (${p.reviews.toLocaleString()})</span>
        </div>
        <div class="product-price">
          <span class="price-current">฿${p.price.toLocaleString()}</span>
          <span class="price-old">฿${p.oldPrice.toLocaleString()}</span>
          <span class="price-discount">-${discount}%</span>
        </div>
        <button class="add-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id})">
          + เพิ่มลงตะกร้า
        </button>
      </div>
    </div>`;
}

function getCategoryLabel(cat) {
  const labels = {
    electronics: 'อิเล็กทรอนิกส์',
    fashion: 'แฟชั่น',
    beauty: 'ความงาม',
    home: 'บ้านและสวน',
    sports: 'กีฬา',
  };
  return labels[cat] || cat;
}

// ===== FILTER & SORT =====
function filterCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.nav-list a').forEach(a => a.classList.remove('active'));
  event.target.classList.add('active');
  renderProducts();
  document.querySelector('.main').scrollIntoView({ behavior: 'smooth' });
}

function searchProducts() {
  currentSearch = document.getElementById('searchInput').value.toLowerCase();
  renderProducts();
}

function sortProducts() {
  currentSort = document.getElementById('sortSelect').value;
  renderProducts();
}

// ===== WISHLIST =====
function toggleWishlist(id, btn) {
  if (wishlist.has(id)) {
    wishlist.delete(id);
    btn.innerHTML = '🤍';
    btn.classList.remove('active');
    showToast('ลบออกจากรายการโปรดแล้ว');
  } else {
    wishlist.add(id);
    btn.innerHTML = '❤️';
    btn.classList.add('active');
    showToast('เพิ่มในรายการโปรดแล้ว ❤️');
  }
  localStorage.setItem('shophub_wishlist', JSON.stringify([...wishlist]));
}

// ===== CART =====
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว 🛒`);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  updateCartUI();
  renderCartItems();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  renderCartItems();
  showToast('ล้างตะกร้าแล้ว');
}

function saveCart() {
  localStorage.setItem('shophub_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartBadge').textContent = total;
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  } else {
    renderCartItems();
    sidebar.classList.add('open');
    overlay.classList.add('show');
  }
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  const emptyEl = document.getElementById('cartEmpty');

  if (cart.length === 0) {
    container.innerHTML = '';
    container.appendChild(emptyEl);
    emptyEl.style.display = 'block';
    footer.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  footer.style.display = 'flex';

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = `฿${totalPrice.toLocaleString()}`;

  const html = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">฿${item.price.toLocaleString()}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="ลบ">✕</button>
    </div>
  `).join('');

  container.innerHTML = html;
}

function checkout() {
  showToast('ขอบคุณที่สั่งซื้อ! กำลังดำเนินการ... 🎉');
  cart = [];
  saveCart();
  updateCartUI();
  renderCartItems();
  setTimeout(toggleCart, 1500);
}

// ===== MODAL =====
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const discount = Math.round((1 - p.price / p.oldPrice) * 100);
  const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-inner">
      <div class="modal-img">${p.emoji}</div>
      <div class="modal-info">
        <div class="modal-category">${getCategoryLabel(p.category)}</div>
        <div class="modal-name">${p.name}</div>
        <div class="modal-rating">
          <span class="stars">${stars}</span>
          <span style="color:var(--text-muted);font-size:0.85rem;margin-left:6px">
            ${p.rating} · ${p.reviews.toLocaleString()} รีวิว
          </span>
        </div>
        <p class="modal-desc">${p.desc}</p>
        <div class="modal-price-row">
          <span class="modal-price">฿${p.price.toLocaleString()}</span>
          <span class="modal-old-price">฿${p.oldPrice.toLocaleString()}</span>
          <span class="price-discount">-${discount}%</span>
        </div>
        <button class="modal-add-btn" onclick="addToCart(${p.id}); closeModal()">
          🛒 เพิ่มลงตะกร้า
        </button>
      </div>
    </div>`;

  document.getElementById('productModal').classList.add('show');
  document.getElementById('modalOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('productModal').classList.remove('show');
  document.getElementById('modalOverlay').classList.remove('show');
  document.body.style.overflow = '';
}

// ===== TOAST =====
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
