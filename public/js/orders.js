const STATUS_LABEL = {
  pending:   { text: 'รอการยืนยัน', cls: 'status-pending' },
  confirmed: { text: 'ยืนยันแล้ว',   cls: 'status-confirmed' },
  shipped:   { text: 'จัดส่งแล้ว',   cls: 'status-shipped' },
  delivered: { text: 'ได้รับสินค้าแล้ว', cls: 'status-delivered' },
  cancelled: { text: 'ยกเลิก',       cls: 'status-cancelled' },
};

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.isLoggedIn()) { window.location.href = '/login.html'; return; }

  if (new URLSearchParams(location.search).get('new') === '1') {
    document.getElementById('ordersSuccess').classList.remove('hidden');
    history.replaceState({}, '', '/orders.html');
  }

  try {
    const data = await api('/api/orders/me');
    renderOrders(data.orders || []);
  } catch (err) {
    document.getElementById('ordersList').innerHTML =
      `<div style="text-align:center;padding:60px;color:var(--danger)">${err.message}</div>`;
  }
});

function renderOrders(orders) {
  const el = document.getElementById('ordersList');
  if (orders.length === 0) {
    el.innerHTML = `
      <div style="text-align:center;padding:60px;color:var(--text-muted)">
        <div style="font-size:3rem;margin-bottom:12px">📦</div>
        <p>ยังไม่มีประวัติการสั่งซื้อ</p>
        <a href="/" class="btn-save" style="display:inline-block;margin-top:16px;text-decoration:none">เลือกซื้อสินค้า</a>
      </div>`;
    return;
  }

  el.innerHTML = orders.map(order => {
    const s = STATUS_LABEL[order.status] || { text: order.status, cls: '' };
    const date = new Date(order.createdAt).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const addr = order.shippingAddress;

    return `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <span class="order-id">ออเดอร์ #${order._id.slice(-8).toUpperCase()}</span>
            <span class="order-date">${date}</span>
          </div>
          <span class="order-status ${s.cls}">${s.text}</span>
        </div>

        <div class="order-items-list">
          ${order.items.map(item => {
            const thumb = item.image
              ? `<img src="${item.image}" style="width:48px;height:48px;object-fit:cover;border-radius:4px;" />`
              : `<div style="width:48px;height:48px;background:var(--bg-light);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.4rem">${item.emoji}</div>`;
            return `
              <div class="order-item-row">
                ${thumb}
                <div style="flex:1;min-width:0">
                  <div class="order-item-name">${item.name}</div>
                  <div class="order-item-sub">฿${item.price.toLocaleString()} × ${item.qty}</div>
                </div>
                <div class="order-item-total">฿${(item.price * item.qty).toLocaleString()}</div>
              </div>`;
          }).join('')}
        </div>

        <div class="order-card-footer">
          <div class="order-address">
            <strong>${addr.name}</strong> · ${addr.phone}<br/>
            ${addr.street}${addr.district ? ' ' + addr.district : ''} ${addr.city} ${addr.province} ${addr.postalCode}
          </div>
          <div class="order-total-row">
            รวม <strong>฿${order.totalPrice.toLocaleString()}</strong>
          </div>
        </div>
      </div>`;
  }).join('');
}
