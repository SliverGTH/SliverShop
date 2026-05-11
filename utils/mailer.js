const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const STATUS_TH = {
  pending:   'รอการยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  shipped:   'จัดส่งแล้ว',
  delivered: 'ได้รับสินค้าแล้ว',
  cancelled: 'ยกเลิก',
};

async function sendNewOrderMail(order, customerUser) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) return;

  const addr = order.shippingAddress;
  const itemsHtml = order.items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">฿${(i.price * i.qty).toLocaleString()}</td>
    </tr>`).join('');

  const html = `
<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Sarabun',Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.1)">

    <!-- Header -->
    <div style="background:#1a3557;padding:24px 32px;text-align:center">
      <h1 style="color:#c8a951;margin:0;font-size:1.4rem;letter-spacing:.04em">💍 Silver Gallery</h1>
      <p style="color:#a8c0d8;margin:6px 0 0;font-size:.9rem">มีคำสั่งซื้อใหม่!</p>
    </div>

    <!-- Order ID -->
    <div style="padding:24px 32px;border-bottom:1px solid #eee">
      <table style="width:100%">
        <tr>
          <td><span style="color:#5c6370;font-size:.85rem">ออเดอร์</span><br/><strong style="font-family:monospace;font-size:1rem">#${String(order._id).slice(-8).toUpperCase()}</strong></td>
          <td style="text-align:right"><span style="color:#5c6370;font-size:.85rem">วันที่สั่งซื้อ</span><br/><strong>${new Date(order.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></td>
        </tr>
      </table>
    </div>

    <!-- Customer -->
    <div style="padding:20px 32px;background:#f8f9fb;border-bottom:1px solid #eee">
      <h3 style="margin:0 0 10px;color:#1a3557;font-size:.95rem">ข้อมูลลูกค้า</h3>
      <p style="margin:0;line-height:1.8">
        <strong>${customerUser?.name || addr.name}</strong><br/>
        📧 ${customerUser?.email || '-'}<br/>
        📞 ${addr.phone}<br/>
        📍 ${addr.street}${addr.district ? ' ' + addr.district : ''} ${addr.city} ${addr.province} ${addr.postalCode}
      </p>
      ${order.note ? `<p style="margin:10px 0 0;color:#5c6370;font-size:.88rem">หมายเหตุ: ${order.note}</p>` : ''}
    </div>

    <!-- Items -->
    <div style="padding:20px 32px;border-bottom:1px solid #eee">
      <h3 style="margin:0 0 12px;color:#1a3557;font-size:.95rem">รายการสินค้า</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f4f5f7">
            <th style="padding:8px 12px;text-align:left;font-size:.85rem;color:#5c6370">สินค้า</th>
            <th style="padding:8px 12px;text-align:center;font-size:.85rem;color:#5c6370">จำนวน</th>
            <th style="padding:8px 12px;text-align:right;font-size:.85rem;color:#5c6370">ราคา</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px;text-align:right;font-weight:700;color:#1a3557">รวมทั้งหมด</td>
            <td style="padding:12px;text-align:right;font-weight:700;font-size:1.1rem;color:#c8a951">฿${order.totalPrice.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Payment -->
    <div style="padding:16px 32px;background:#f8f9fb;border-bottom:1px solid #eee">
      <p style="margin:0;font-size:.9rem">💵 การชำระเงิน: <strong>ชำระเงินปลายทาง (COD)</strong></p>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;text-align:center">
      <p style="margin:0;color:#5c6370;font-size:.85rem">Silver Gallery Admin Panel</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from:    `"Silver Gallery" <${process.env.GMAIL_USER}>`,
    to:      process.env.ADMIN_NOTIFY_EMAIL || process.env.GMAIL_USER,
    subject: `🛒 ออเดอร์ใหม่ #${String(order._id).slice(-8).toUpperCase()} — ฿${order.totalPrice.toLocaleString()}`,
    html,
  });
}

module.exports = { sendNewOrderMail };
