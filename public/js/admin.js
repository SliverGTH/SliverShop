// ===== ADMIN STATE =====
let adminProducts = [];
let adminOrders   = [];
let deleteTargetId = null;
let selectedImageFile = null;

const ORDER_STATUS_LABEL = {
  pending:   { text: 'รอการยืนยัน', cls: 'status-pending' },
  confirmed: { text: 'ยืนยันแล้ว',   cls: 'status-confirmed' },
  shipped:   { text: 'จัดส่งแล้ว',   cls: 'status-shipped' },
  delivered: { text: 'ได้รับสินค้าแล้ว', cls: 'status-delivered' },
  cancelled: { text: 'ยกเลิก',       cls: 'status-cancelled' },
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
    window.location.href = Auth.isLoggedIn() ? '/' : '/login.html';
    return;
  }

  const user = Auth.getUser();
  document.getElementById('adminName').textContent = user.name;
  document.getElementById('logoutBtn').addEventListener('click', Auth.logout);

  // Sidebar nav
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.sidebar-link').forEach(x => x.classList.remove('active'));
      link.classList.add('active');
      showTab(link.dataset.tab);
    });
  });

  document.getElementById('goAddBtn').addEventListener('click', () => showTab('add'));
  document.getElementById('backToListBtn').addEventListener('click', () => showTab('products'));
  document.getElementById('cancelFormBtn').addEventListener('click', () => showTab('products'));

  document.getElementById('adminSearch').addEventListener('input', filterTable);
  document.getElementById('adminCatFilter').addEventListener('change', filterTable);
  document.getElementById('orderStatusFilter').addEventListener('change', () => loadAdminOrders());

  document.getElementById('productForm').addEventListener('submit', saveProduct);

  // Live preview
  document.getElementById('pName').addEventListener('input', updatePreview);
  document.getElementById('pEmoji').addEventListener('input', updatePreview);
  document.getElementById('pPrice').addEventListener('input', updatePreview);

  // Image upload
  initImageUpload();

  // Delete modal
  document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
  document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);

  loadAdminProducts();
  loadAdminOrders();
});

// ===== IMAGE UPLOAD =====
function initImageUpload() {
  const area      = document.getElementById('imageUploadArea');
  const fileInput = document.getElementById('pImage');
  const placeholder = document.getElementById('imagePlaceholder');
  const preview   = document.getElementById('imagePreviewImg');
  const removeBtn = document.getElementById('removeImageBtn');

  // Click to select file
  area.addEventListener('click', (e) => {
    if (e.target === removeBtn || removeBtn.contains(e.target)) return;
    fileInput.click();
  });

  // Drag and drop
  area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleImageFile(fileInput.files[0]);
  });

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearImageUpload();
  });
}

function handleImageFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('ขนาดไฟล์ต้องไม่เกิน 5MB', 'error');
    return;
  }
  selectedImageFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('imagePreviewImg');
    const placeholder = document.getElementById('imagePlaceholder');
    const removeBtn = document.getElementById('removeImageBtn');
    const previewImgCard = document.getElementById('previewImgCard');
    const previewEmoji = document.getElementById('previewEmoji');

    preview.src = e.target.result;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
    removeBtn.classList.remove('hidden');

    previewImgCard.src = e.target.result;
    previewImgCard.classList.remove('hidden');
    previewEmoji.classList.add('hidden');

    document.getElementById('keepOldImage').value = '0';
  };
  reader.readAsDataURL(file);
}

function clearImageUpload() {
  selectedImageFile = null;
  document.getElementById('pImage').value = '';
  document.getElementById('imagePreviewImg').src = '';
  document.getElementById('imagePreviewImg').classList.add('hidden');
  document.getElementById('imagePlaceholder').classList.remove('hidden');
  document.getElementById('removeImageBtn').classList.add('hidden');
  document.getElementById('previewImgCard').classList.add('hidden');
  document.getElementById('previewEmoji').classList.remove('hidden');
  document.getElementById('keepOldImage').value = '0';
}

function setExistingImage(url) {
  if (!url) return;
  const preview = document.getElementById('imagePreviewImg');
  const placeholder = document.getElementById('imagePlaceholder');
  const removeBtn = document.getElementById('removeImageBtn');
  const previewImgCard = document.getElementById('previewImgCard');
  const previewEmoji = document.getElementById('previewEmoji');

  preview.src = url;
  preview.classList.remove('hidden');
  placeholder.classList.add('hidden');
  removeBtn.classList.remove('hidden');

  previewImgCard.src = url;
  previewImgCard.classList.remove('hidden');
  previewEmoji.classList.add('hidden');

  document.getElementById('keepOldImage').value = '1';
}

// ===== TABS =====
function showTab(name) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('hidden'));
  document.getElementById(`tab-${name}`).classList.remove('hidden');
  if (name === 'add') {
    const isEdit = !!document.getElementById('editProductId').value;
    if (!isEdit) resetForm();
    document.getElementById('formTitle').textContent = isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่';
    document.getElementById('saveBtnText').textContent = isEdit ? 'บันทึกการแก้ไข' : 'บันทึกสินค้า';
  }
}

// ===== LOAD PRODUCTS =====
async function loadAdminProducts() {
  try {
    const data = await api('/api/products?limit=200');
    adminProducts = data.products || [];
    renderTable(adminProducts);
    document.getElementById('statProducts').textContent = adminProducts.length;
  } catch (err) {
    document.getElementById('productTableBody').innerHTML =
      `<tr><td colspan="7" class="table-loading" style="color:var(--danger)">${err.message}</td></tr>`;
  }
}

// ===== RENDER TABLE =====
function renderTable(products) {
  const tbody = document.getElementById('productTableBody');
  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-loading">ไม่มีสินค้า</td></tr>`;
    return;
  }
  tbody.innerHTML = products.map(p => {
    const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const thumb = p.image
      ? `<img src="${p.image}" class="table-thumb" alt="${p.name}" />`
      : `<span class="table-thumb-emoji">${p.emoji || '📦'}</span>`;
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:12px">
            ${thumb}
            <span class="table-product-name">${p.name}</span>
          </div>
        </td>
        <td><span class="cat-chip">${catLabel[p.category]||p.category}</span></td>
        <td><strong style="color:var(--primary)">฿${p.price.toLocaleString()}</strong></td>
        <td>${p.oldPrice ? `<span style="text-decoration:line-through;color:var(--text-muted)">฿${p.oldPrice.toLocaleString()}</span>${discount>0?` <span style="font-size:.75rem;color:var(--secondary)">-${discount}%</span>`:''}` : '-'}</td>
        <td>${p.rating > 0 ? `⭐ ${p.rating}` : '-'}</td>
        <td>${p.inStock ? `<span class="stock-in">✓ มีสินค้า</span>` : `<span class="stock-out">✗ หมด</span>`}</td>
        <td>
          <div class="action-btns">
            <button class="btn-edit"   onclick="editProduct('${p._id}')">แก้ไข</button>
            <button class="btn-delete" onclick="openDeleteModal('${p._id}','${p.name.replace(/'/g,"\\'").replace(/"/g,'&quot;')}')">ลบ</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function filterTable() {
  const search = document.getElementById('adminSearch').value.toLowerCase();
  const cat    = document.getElementById('adminCatFilter').value;
  const filtered = adminProducts.filter(p => {
    return (!search || p.name.toLowerCase().includes(search)) && (!cat || p.category === cat);
  });
  renderTable(filtered);
}

// ===== ADD / EDIT =====
function resetForm() {
  selectedImageFile = null;
  document.getElementById('editProductId').value = '';
  document.getElementById('productForm').reset();
  document.getElementById('pInStock').checked = true;
  clearImageUpload();
  document.getElementById('formAlert').classList.add('hidden');
  updatePreview();
}

function editProduct(id) {
  const p = adminProducts.find(x => x._id === id);
  if (!p) return;

  document.getElementById('editProductId').value = p._id;
  document.getElementById('pName').value     = p.name;
  document.getElementById('pEmoji').value    = p.emoji || '';
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pBadge').value    = p.badge || '';
  document.getElementById('pPrice').value    = p.price;
  document.getElementById('pOldPrice').value = p.oldPrice || '';
  document.getElementById('pRating').value   = p.rating || '';
  document.getElementById('pReviews').value  = p.reviews || '';
  document.getElementById('pDesc').value     = p.desc || '';
  document.getElementById('pInStock').checked = p.inStock !== false;

  selectedImageFile = null;
  clearImageUpload();
  if (p.image) setExistingImage(p.image);

  updatePreview();
  showTab('add');
}

async function saveProduct(e) {
  e.preventDefault();
  const editId  = document.getElementById('editProductId').value;
  const alertEl = document.getElementById('formAlert');
  const spinner = document.getElementById('saveBtnSpinner');
  const btnText = document.getElementById('saveBtnText');
  const saveBtn = document.getElementById('saveBtn');

  alertEl.classList.add('hidden');
  saveBtn.disabled = true;
  spinner.classList.remove('hidden');
  btnText.textContent = 'กำลังบันทึก...';

  try {
    const token = Auth.getToken();
    const formData = new FormData();
    formData.append('name',     document.getElementById('pName').value.trim());
    formData.append('emoji',    document.getElementById('pEmoji').value.trim() || '📦');
    formData.append('category', document.getElementById('pCategory').value);
    formData.append('badge',    document.getElementById('pBadge').value.trim());
    formData.append('price',    document.getElementById('pPrice').value);
    formData.append('oldPrice', document.getElementById('pOldPrice').value || '');
    formData.append('rating',   document.getElementById('pRating').value   || '0');
    formData.append('reviews',  document.getElementById('pReviews').value  || '0');
    formData.append('desc',     document.getElementById('pDesc').value.trim());
    formData.append('inStock',  document.getElementById('pInStock').checked);

    if (selectedImageFile) formData.append('image', selectedImageFile);

    const url    = editId ? `/api/products/${editId}` : '/api/products';
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด');

    showToast(editId ? 'แก้ไขสินค้าสำเร็จ ✅' : 'เพิ่มสินค้าสำเร็จ ✅', 'success');
    await loadAdminProducts();
    showTab('products');
  } catch (err) {
    alertEl.textContent = err.message;
    alertEl.className   = 'alert error';
  } finally {
    saveBtn.disabled = false;
    spinner.classList.add('hidden');
    btnText.textContent = editId ? 'บันทึกการแก้ไข' : 'บันทึกสินค้า';
  }
}

// ===== PREVIEW =====
function updatePreview() {
  const emoji = document.getElementById('pEmoji').value || '📦';
  const name  = document.getElementById('pName').value  || 'ชื่อสินค้า';
  const price = Number(document.getElementById('pPrice').value) || 0;
  document.getElementById('previewEmoji').textContent = emoji;
  document.getElementById('previewName').textContent  = name;
  document.getElementById('previewPrice').textContent = `฿${price.toLocaleString()}`;
}

// ===== DELETE =====
function openDeleteModal(id, name) {
  deleteTargetId = id;
  document.getElementById('deleteProductName').textContent = `"${name}"`;
  document.getElementById('deleteOverlay').classList.remove('hidden');
  document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('deleteOverlay').classList.add('hidden');
  document.getElementById('deleteModal').classList.add('hidden');
}

// ===== ORDERS =====
async function loadAdminOrders() {
  try {
    const status = document.getElementById('orderStatusFilter').value;
    const url    = status ? `/api/orders?status=${status}` : '/api/orders';
    const data   = await api(url);
    adminOrders  = data.orders || [];
    renderOrderTable(adminOrders);
    document.getElementById('statOrders').textContent  = data.total ?? adminOrders.length;
    document.getElementById('statPending').textContent = adminOrders.filter(o => o.status === 'pending').length;
  } catch (err) {
    document.getElementById('orderTableBody').innerHTML =
      `<tr><td colspan="7" class="table-loading" style="color:var(--danger)">${err.message}</td></tr>`;
  }
}

function renderOrderTable(orders) {
  const tbody = document.getElementById('orderTableBody');
  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-loading">ไม่มีออเดอร์</td></tr>`;
    return;
  }
  tbody.innerHTML = orders.map(o => {
    const s    = ORDER_STATUS_LABEL[o.status] || { text: o.status, cls: '' };
    const date = new Date(o.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
    const user = o.user || {};
    const itemSummary = o.items.slice(0, 2).map(i => `${i.name} ×${i.qty}`).join(', ')
      + (o.items.length > 2 ? ` +${o.items.length - 2} อื่น` : '');
    const statusOptions = Object.entries(ORDER_STATUS_LABEL).map(([val, {text}]) =>
      `<option value="${val}" ${o.status === val ? 'selected' : ''}>${text}</option>`
    ).join('');
    return `
      <tr>
        <td><span style="font-size:.8rem;font-family:monospace">#${o._id.slice(-8).toUpperCase()}</span></td>
        <td>
          <div style="font-weight:500">${user.name || '-'}</div>
          <div style="font-size:.8rem;color:var(--text-muted)">${user.phone || user.email || ''}</div>
        </td>
        <td style="max-width:200px;font-size:.875rem">${itemSummary}</td>
        <td><strong style="color:var(--primary)">฿${o.totalPrice.toLocaleString()}</strong></td>
        <td><span class="order-status ${s.cls}" style="font-size:.8rem">${s.text}</span></td>
        <td style="font-size:.85rem">${date}</td>
        <td>
          <select class="status-select" onchange="updateOrderStatus('${o._id}', this.value)">
            ${statusOptions}
          </select>
        </td>
      </tr>`;
  }).join('');
}

async function updateOrderStatus(id, status) {
  try {
    await api(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    showToast('อัปเดตสถานะเรียบร้อย ✅', 'success');
    await loadAdminOrders();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const btn = document.getElementById('confirmDeleteBtn');
  btn.disabled = true; btn.textContent = 'กำลังลบ...';
  try {
    await api(`/api/products/${deleteTargetId}`, { method: 'DELETE' });
    showToast('ลบสินค้าเรียบร้อย', 'success');
    closeDeleteModal();
    await loadAdminProducts();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'ยืนยันลบ';
  }
}
