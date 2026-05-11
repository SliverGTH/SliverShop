document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.isLoggedIn()) { window.location.href = '/login.html'; return; }

  const cart = JSON.parse(localStorage.getItem('shophub_cart') || '[]');
  if (cart.length === 0) { window.location.href = '/'; return; }

  // Render cart items
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('checkoutTotal').textContent = `฿${total.toLocaleString()}`;
  document.getElementById('checkoutItems').innerHTML = cart.map(item => {
    const thumb = item.image
      ? `<img src="${item.image}" alt="${item.name}" style="width:56px;height:56px;object-fit:cover;border-radius:6px;" />`
      : `<div style="width:56px;height:56px;background:var(--bg-light);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.6rem">${item.emoji || '📦'}</div>`;
    return `
      <div class="checkout-item">
        ${thumb}
        <div class="checkout-item-info">
          <div class="checkout-item-name">${item.name}</div>
          <div class="checkout-item-sub">฿${item.price.toLocaleString()} × ${item.qty}</div>
        </div>
        <div class="checkout-item-total">฿${(item.price * item.qty).toLocaleString()}</div>
      </div>`;
  }).join('');

  // Pre-fill address from profile
  try {
    const data = await api('/api/auth/me');
    const u = data.user;
    document.getElementById('cName').value      = u.name || '';
    document.getElementById('cPhone').value     = u.phone || '';
    document.getElementById('cStreet').value    = u.address?.street     || '';
    document.getElementById('cDistrict').value  = u.address?.district   || '';
    document.getElementById('cCity').value      = u.address?.city       || '';
    document.getElementById('cProvince').value  = u.address?.province   || '';
    document.getElementById('cPostalCode').value = u.address?.postalCode || '';
  } catch {}

  // Submit order
  document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertEl = document.getElementById('checkoutAlert');
    const btn     = document.getElementById('placeOrderBtn');
    const txt     = document.getElementById('placeOrderTxt');
    const spinner = document.getElementById('placeOrderSpinner');

    alertEl.className = 'alert hidden';

    const name       = document.getElementById('cName').value.trim();
    const phone      = document.getElementById('cPhone').value.trim();
    const street     = document.getElementById('cStreet').value.trim();
    const city       = document.getElementById('cCity').value.trim();
    const province   = document.getElementById('cProvince').value.trim();
    const postalCode = document.getElementById('cPostalCode').value.trim();

    if (!name || !phone || !street || !city || !province || !postalCode) {
      alertEl.textContent = 'กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบ';
      alertEl.className   = 'alert error';
      return;
    }

    btn.disabled = true;
    txt.textContent = 'กำลังสั่งซื้อ...';
    spinner.classList.remove('hidden');

    try {
      const orderItems = cart.map(i => ({
        product: i._id,
        name:    i.name,
        price:   i.price,
        image:   i.image || '',
        emoji:   i.emoji || '📦',
        qty:     i.qty,
      }));

      await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: {
            name, phone, street,
            district:   document.getElementById('cDistrict').value.trim(),
            city, province, postalCode,
          },
          note: document.getElementById('cNote').value.trim(),
        }),
      });

      localStorage.removeItem('shophub_cart');
      window.location.href = '/orders.html?new=1';
    } catch (err) {
      alertEl.textContent = err.message;
      alertEl.className   = 'alert error';
      btn.disabled = false;
      txt.textContent = 'ยืนยันการสั่งซื้อ';
      spinner.classList.add('hidden');
    }
  });
});
