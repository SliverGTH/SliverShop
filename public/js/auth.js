// ===== LOGIN PAGE =====
function initLoginPage() {
  // Redirect if already logged in
  if (Auth.isLoggedIn()) { window.location.href = '/'; return; }

  const form     = document.getElementById('loginForm');
  const submitBtn= document.getElementById('submitBtn');
  const btnText  = document.getElementById('btnText');
  const spinner  = document.getElementById('btnSpinner');
  const alertEl  = document.getElementById('alert');

  // Toggle password visibility
  document.getElementById('togglePw').addEventListener('click', () => {
    const pw = document.getElementById('password');
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showAlert('กรุณากรอกข้อมูลให้ครบ', 'error');
      return;
    }

    setLoading(true, submitBtn, btnText, spinner);
    alertEl.classList.add('hidden');

    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      Auth.save(data.token, data.user);
      showToast('เข้าสู่ระบบสำเร็จ! 🎉', 'success');
      setTimeout(() => {
        window.location.href = data.user.role === 'admin' ? '/admin.html' : '/';
      }, 800);
    } catch (err) {
      showAlert(err.message, 'error');
      setLoading(false, submitBtn, btnText, spinner);
    }
  });
}

// ===== REGISTER PAGE =====
function initRegisterPage() {
  if (Auth.isLoggedIn()) { window.location.href = '/'; return; }

  const form     = document.getElementById('registerForm');
  const submitBtn= document.getElementById('submitBtn');
  const btnText  = document.getElementById('btnText');
  const spinner  = document.getElementById('btnSpinner');
  const alertEl  = document.getElementById('alert');
  const pwInput  = document.getElementById('password');
  const pwStrength = document.getElementById('pwStrength');

  // Toggle password
  document.getElementById('togglePw').addEventListener('click', () => {
    pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
  });

  // Password strength
  pwInput.addEventListener('input', () => {
    const pw = pwInput.value;
    let level = 0;
    if (pw.length >= 6) level++;
    if (/[A-Z]/.test(pw) || /\d/.test(pw)) level++;
    if (pw.length >= 10 && /[^A-Za-z0-9]/.test(pw)) level++;
    pwStrength.dataset.level = level;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = document.getElementById('name').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirmPassword').value;

    if (!name || !email || !password || !confirm) {
      showAlert('กรุณากรอกข้อมูลให้ครบทุกช่อง', 'error');
      return;
    }
    if (password.length < 6) {
      showAlert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'error');
      return;
    }
    if (password !== confirm) {
      showAlert('รหัสผ่านทั้งสองช่องไม่ตรงกัน', 'error');
      document.getElementById('confirmPassword').classList.add('error');
      return;
    }

    document.getElementById('confirmPassword').classList.remove('error');
    setLoading(true, submitBtn, btnText, spinner);
    alertEl.classList.add('hidden');

    try {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      Auth.save(data.token, data.user);
      showToast('สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ 🎉', 'success');
      setTimeout(() => window.location.href = '/', 900);
    } catch (err) {
      showAlert(err.message, 'error');
      setLoading(false, submitBtn, btnText, spinner);
    }
  });
}

// ===== UTILS =====
function showAlert(msg, type = 'error') {
  const el = document.getElementById('alert');
  el.textContent = msg;
  el.className = `alert ${type}`;
}

function setLoading(on, btn, text, spinner) {
  btn.disabled = on;
  text.textContent = on ? 'กำลังดำเนินการ...' : text.dataset.orig || text.textContent;
  spinner.classList.toggle('hidden', !on);
}
