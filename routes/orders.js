const router  = require('express').Router();
const Order   = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');
const { sendNewOrderMail } = require('../utils/mailer');

const STATUS_LABEL = {
  pending:   'รอการยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  shipped:   'จัดส่งแล้ว',
  delivered: 'ได้รับสินค้าแล้ว',
  cancelled: 'ยกเลิก',
};

// POST /api/orders — create order (auth user)
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, note } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'ไม่มีสินค้าในตะกร้า' });

    const { name, phone, street, district, city, province, postalCode } = shippingAddress || {};
    if (!name || !phone || !street || !city || !province || !postalCode) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบ' });
    }

    const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: { name, phone, street, district: district || '', city, province, postalCode },
      totalPrice,
      note: note || '',
    });

    sendNewOrderMail(order, req.user).catch(() => {});

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' });
  }
});

// GET /api/orders/me — my orders
router.get('/me', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// GET /api/orders — all orders (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = status ? { status } : {};
    const total  = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// PUT /api/orders/:id/status — update status (admin)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUS_LABEL[status]) return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'ไม่พบออเดอร์' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;
