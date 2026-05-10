// ===== STATE =====
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('shophub_cart') || '[]');
let wishlist = new Set(JSON.parse(localStorage.getItem('shophub_wishlist') || '[]'));
let currentCategory = 'all';
let currentSearch = '';
let currentSort = '';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderAuthHeader();
  loadProducts();
  updateCartBadge();

  // Nav category filter
  document.getElementById('navList').addEventListener('click', (e) => {
    const a = e.target.closest('a[data-cat]');
    if (!a) return;
    e.preventDefault();
    document.querySelectorAll('.nav-list a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    currentCategory = a.dataset.cat;
    renderProducts();
    document.querySelector('.main').scrollIntoView({ behavior: 'smooth' });
  });

  // Footer category links
  document.querySelectorAll('a[data-cat]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      currentCategory = a.dataset.cat;
      document.querySelectorAll('.nav-list a').forEach(x => x.classList.remove('active'));
      const navLink = document.querySelector(`.nav-list a[data-cat="${currentCategory}"]`);
      if (navLink) navLink.classList.add('active');
      renderProducts();
      document.querySelector('.main').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  document.getElementById('searchBtn').addEventListener('click', doSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') doSearch();
    else { currentSearch = searchInput.value.toLowerCase().trim(); renderProducts(); }
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderProducts();
  });

  // Hero button
  document.getElementById('shopNowBtn').addEventListener('click', () => {
    document.querySelector('.main').scrollIntoView({ behavior: 'smooth' });
  });

  // Cart
  document.getElementById('cartBtn').addEventListener('click', toggleCart);
  document.getElementById('closeCart').addEventListener('click', toggleCart);
  document.getElementById('cartOverlay').addEventListener('click', toggleCart);
  document.getElementById('checkoutBtn').addEventListener('click', checkout);
  document.getElementById('clearCartBtn').addEventListener('click', clearCart);

  // Modal
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', closeModal);
});

// ===== AUTH HEADER =====
function renderAuthHeader() {
  const section = document.getElementById('authSection');
  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    const initial = user.name.charAt(0).toUpperCase();
    section.innerHTML = `
      <div class="user-menu">
        ${Auth.isAdmin() ? `<a href="/admin.html" class="btn-admin">⚙️ แอดมิน</a>` : ''}
        <div class="user-avatar" title="${user.name}">${initial}</div>
        <span class="user-name">${user.name.split(' ')[0]}</span>
        <button class="btn-logout-sm" id="logoutBtnMain">ออก</button>
      </div>`;
    document.getElementById('logoutBtnMain').addEventListener('click', Auth.logout);
  } else {
    section.innerHTML = `
      <a href="/login.html"    class="btn-login">เข้าสู่ระบบ</a>
      <a href="/register.html" class="btn-register">สมัครสมาชิก</a>`;
  }
}

// ===== LOAD PRODUCTS =====
async function loadProducts() {
  try {
    const data = await api('/api/products?limit=100');
    allProducts = data.products || [];
    renderProducts();
  } catch (err) {
    document.getElementById('productGrid').innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">
        <div style="font-size:3rem;margin-bottom:12px">⚠️</div>
        <p>ไม่สามารถโหลดสินค้าได้</p>
      </div>`;
  }
}

// ===== FILTER & SORT =====
function getFiltered() {
  let items = [...allProducts];
  if (currentCategory !== 'all') items = items.filter(p => p.category === currentCategory);
  if (currentSearch) items = items.filter(p => p.name.toLowerCase().includes(currentSearch));

  switch (currentSort) {
    case 'price-asc':  items.sort((a,b) => a.price - b.price); break;
    case 'price-desc': items.sort((a,b) => b.price - a.price); break;
    case 'name-asc':   items.sort((a,b) => a.name.localeCompare(b.name,'th')); break;
    case 'rating':     items.sort((a,b) => b.rating - a.rating); break;
    case 'newest':     items.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
  }
  return items;
}

function doSearch() {
  currentSearch = document.getElementById('searchInput').value.toLowerCase().trim();
  renderProducts();
}

// ===== RENDER PRODUCTS =====
function renderProducts() {
  const items = getFiltered();
  const grid = document.getElementById('productGrid');
  const noResults = document.getElementById('noResults');
  document.getElementById('resultsCount').textContent = `แสดงสินค้า ${items.length} รายการ`;

  if (items.length === 0) {
    grid.innerHTML = '';
    noResults.classList.remove('hidden');
    return;
  }
  noResults.classList.add('hidden');
  grid.innerHTML = items.map(renderCard).join('');
}

function renderCard(p) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const inWishlist = wishlist.has(p._id);
  const id = p._id;

  const imgContent = p.image
    ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" />`
    : `<span>${p.emoji || '📦'}</span>`;

  return `
    <div class="product-card" data-id="${id}">
      <div class="product-img ${p.image ? 'has-image' : ''}">
        ${imgContent}
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <button class="wishlist-btn ${inWishlist ? 'active' : ''}" data-wid="${id}" title="รายการโปรด">
          ${inWishlist ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="product-info" style="cursor:pointer">
        <div class="product-category">${catLabel[p.category] || p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <span class="stars">${renderStars(p.rating || 0)}</span>
          <span class="rating-num">${p.rating} (${(p.reviews||0).toLocaleString()})</span>
        </div>
        <div class="product-price">
          <span class="price-current">฿${p.price.toLocaleString()}</span>
          ${p.oldPrice ? `<span class="price-old">฿${p.oldPrice.toLocaleString()}</span>` : ''}
          ${discount > 0 ? `<span class="price-discount">-${discount}%</span>` : ''}
        </div>
        <button class="add-cart-btn" data-cid="${id}" ${!p.inStock ? 'disabled' : ''}>
          ${p.inStock ? '+ เพิ่มลงตะกร้า' : 'สินค้าหมด'}
        </button>
      </div>
    </div>`;
}

// ===== EVENT DELEGATION for grid =====
document.addEventListener('click', (e) => {
  // Wishlist
  const wbtn = e.target.closest('.wishlist-btn');
  if (wbtn) { e.stopPropagation(); toggleWishlist(wbtn.dataset.wid, wbtn); return; }

  // Add to cart
  const cbtn = e.target.closest('.add-cart-btn');
  if (cbtn) { e.stopPropagation(); addToCart(cbtn.dataset.cid); return; }

  // Open modal (click on product card info area)
  const card = e.target.closest('.product-card');
  if (card && !e.target.closest('button')) { openModal(card.dataset.id); }
});

// ===== WISHLIST =====
function toggleWishlist(id, btn) {
  if (wishlist.has(id)) {
    wishlist.delete(id); btn.innerHTML = '🤍'; btn.classList.remove('active');
    showToast('ลบออกจากรายการโปรด');
  } else {
    wishlist.add(id); btn.innerHTML = '❤️'; btn.classList.add('active');
    showToast('เพิ่มในรายการโปรดแล้ว ❤️');
  }
  localStorage.setItem('shophub_wishlist', JSON.stringify([...wishlist]));
}

// ===== CART =====
function addToCart(id) {
  const product = allProducts.find(p => p._id === id);
  if (!product) return;
  const existing = cart.find(i => i._id === id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  saveCart(); updateCartBadge();
  showToast(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว 🛒`, 'success');
}

function removeFromCart(id) {
  cart = cart.filter(i => i._id !== id);
  saveCart(); updateCartBadge(); renderCartItems();
}

function changeQty(id, delta) {
  const item = cart.find(i => i._id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  saveCart(); updateCartBadge(); renderCartItems();
}

function clearCart() {
  cart = []; saveCart(); updateCartBadge(); renderCartItems();
  showToast('ล้างตะกร้าแล้ว');
}

function saveCart() { localStorage.setItem('shophub_cart', JSON.stringify(cart)); }
function updateCartBadge() {
  const total = cart.reduce((s,i) => s + i.qty, 0);
  document.getElementById('cartBadge').textContent = total;
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
  else { renderCartItems(); sidebar.classList.add('open'); overlay.classList.add('show'); }
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer    = document.getElementById('cartFooter');
  const emptyEl   = document.getElementById('cartEmpty');

  if (cart.length === 0) {
    container.innerHTML = '';
    container.appendChild(emptyEl);
    emptyEl.style.display = 'block';
    footer.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  footer.style.display  = 'flex';

  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = `฿${total.toLocaleString()}`;

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">฿${item.price.toLocaleString()}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item._id}',-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item._id}',1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item._id}')" title="ลบ">✕</button>
    </div>`).join('');
}

function checkout() {
  if (!Auth.isLoggedIn()) {
    showToast('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ', 'error');
    setTimeout(() => window.location.href = '/login.html', 1500);
    return;
  }
  showToast('ขอบคุณที่สั่งซื้อ! กำลังดำเนินการ... 🎉', 'success');
  cart = []; saveCart(); updateCartBadge(); renderCartItems();
  setTimeout(toggleCart, 1500);
}

// ===== MODAL =====
function openModal(id) {
  const p = allProducts.find(x => x._id === id);
  if (!p) return;
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  const modalImg = p.image
    ? `<div class="modal-img has-image" style="background:#f9f9f9"><img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;" /></div>`
    : `<div class="modal-img">${p.emoji || '📦'}</div>`;

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-inner">
      ${modalImg}
      <div class="modal-info">
        <div class="modal-category">${catLabel[p.category] || p.category}</div>
        <div class="modal-name">${p.name}</div>
        <div class="product-rating" style="margin-bottom:12px">
          <span class="stars">${renderStars(p.rating||0)}</span>
          <span style="color:var(--text-muted);font-size:.85rem;margin-left:6px">${p.rating} · ${(p.reviews||0).toLocaleString()} รีวิว</span>
        </div>
        <p class="modal-desc">${p.desc || ''}</p>
        <div class="modal-price-row">
          <span class="modal-price">฿${p.price.toLocaleString()}</span>
          ${p.oldPrice ? `<span class="modal-old-price">฿${p.oldPrice.toLocaleString()}</span>` : ''}
          ${discount > 0 ? `<span class="price-discount">-${discount}%</span>` : ''}
        </div>
        <button class="modal-add-btn" onclick="addToCart('${p._id}');closeModal()">
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
