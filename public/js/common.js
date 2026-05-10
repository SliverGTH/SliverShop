// ===== AUTH HELPERS =====
const Auth = {
  getToken: () => localStorage.getItem('shophub_token'),
  getUser:  () => JSON.parse(localStorage.getItem('shophub_user') || 'null'),
  isLoggedIn: () => !!localStorage.getItem('shophub_token'),
  isAdmin: () => {
    const u = Auth.getUser();
    return u && u.role === 'admin';
  },
  save: (token, user) => {
    localStorage.setItem('shophub_token', token);
    localStorage.setItem('shophub_user', JSON.stringify(user));
  },
  logout: () => {
    localStorage.removeItem('shophub_token');
    localStorage.removeItem('shophub_user');
    window.location.href = '/login.html';
  },
};

// ===== API HELPER =====
const api = async (path, options = {}) => {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด');
  return data;
};

// ===== TOAST =====
let _toastTimer;
const showToast = (msg, type = '') => {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
};

// ===== CATEGORY LABELS =====
const catLabel = {
  electronics: 'อิเล็กทรอนิกส์',
  fashion:     'แฟชั่น',
  beauty:      'ความงาม',
  home:        'บ้านและสวน',
  sports:      'กีฬา',
};

// ===== STARS HELPER =====
const renderStars = (rating) => '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '');
