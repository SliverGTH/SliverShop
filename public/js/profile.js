document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.isLoggedIn()) { window.location.href = '/login.html'; return; }

  let user;
  try {
    const data = await api('/api/auth/me');
    user = data.user;
  } catch {
    window.location.href = '/login.html'; return;
  }

  // Display
  document.getElementById('profileAvatar').textContent = user.name.charAt(0).toUpperCase();
  document.getElementById('profileNameDisplay').textContent = user.name;
  document.getElementById('profileEmailDisplay').textContent = user.email;

  // Fill form
  document.getElementById('pName').value       = user.name || '';
  document.getElementById('pPhone').value      = user.phone || '';
  document.getElementById('pStreet').value     = user.address?.street     || '';
  document.getElementById('pDistrict').value   = user.address?.district   || '';
  document.getElementById('pCity').value       = user.address?.city       || '';
  document.getElementById('pProvince').value   = user.address?.province   || '';
  document.getElementById('pPostalCode').value = user.address?.postalCode || '';

  // Password toggle
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  // Submit
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alert   = document.getElementById('profileAlert');
    const btn     = document.getElementById('profileSaveBtn');
    const txt     = document.getElementById('profileSaveTxt');
    const spinner = document.getElementById('profileSpinner');

    alert.className = 'alert hidden';
    btn.disabled = true;
    txt.textContent = 'กำลังบันทึก...';
    spinner.classList.remove('hidden');

    try {
      const body = {
        name:  document.getElementById('pName').value.trim(),
        phone: document.getElementById('pPhone').value.trim(),
        address: {
          street:     document.getElementById('pStreet').value.trim(),
          district:   document.getElementById('pDistrict').value.trim(),
          city:       document.getElementById('pCity').value.trim(),
          province:   document.getElementById('pProvince').value.trim(),
          postalCode: document.getElementById('pPostalCode').value.trim(),
        },
      };

      const currentPw = document.getElementById('pCurrentPw').value;
      const newPw     = document.getElementById('pNewPw').value;
      if (newPw) { body.currentPassword = currentPw; body.newPassword = newPw; }

      const data = await api('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      Auth.save(Auth.getToken(), data.user);
      document.getElementById('profileNameDisplay').textContent = data.user.name;
      document.getElementById('profileAvatar').textContent = data.user.name.charAt(0).toUpperCase();
      document.getElementById('pCurrentPw').value = '';
      document.getElementById('pNewPw').value     = '';

      alert.textContent = 'บันทึกข้อมูลสำเร็จ ✅';
      alert.className   = 'alert success';
    } catch (err) {
      alert.textContent = err.message;
      alert.className   = 'alert error';
    } finally {
      btn.disabled = false;
      txt.textContent = 'บันทึกข้อมูล';
      spinner.classList.add('hidden');
    }
  });
});
