require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));

// ── Fallback: serve index.html for unknown routes ───────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ message: 'Not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Seed Functions ──────────────────────────────────────────
const seedAdmin = async () => {
  const User = require('./models/User');
  const exists = await User.findOne({ role: 'admin' });
  if (!exists) {
    await User.create({
      name:     process.env.ADMIN_NAME,
      email:    process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role:     'admin',
    });
    console.log(`✅ Admin created → ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
  }
};

const seedProducts = async () => {
  const Product = require('./models/Product');
  const count = await Product.countDocuments();
  if (count > 0) return;

  const initial = [
    { name:'หูฟัง Bluetooth Pro X',       category:'electronics', price:1490, oldPrice:2990, emoji:'🎧', rating:4.8, reviews:1243, badge:'ขายดี', desc:'หูฟังไร้สาย ANC ตัดเสียงรบกวน ใช้งานได้ 30 ชม. กันน้ำ IPX5' },
    { name:'สมาร์ทวอทช์ Series 8',         category:'electronics', price:5990, oldPrice:8990, emoji:'⌚', rating:4.7, reviews:872,  badge:'ใหม่',   desc:'นาฬิกาอัจฉริยะ วัดอัตราหัวใจ GPS ในตัว กันน้ำ 50M' },
    { name:'โดรนถ่ายภาพ 4K Mini',          category:'electronics', price:7800, oldPrice:11500,emoji:'🚁', rating:4.5, reviews:345,  badge:'-32%',  desc:'โดรนกล้อง 4K Ultra HD กันสั่น 3 แกน บินได้ 25 นาที' },
    { name:'แท็บเล็ต 10.5" 2026',          category:'electronics', price:9990, oldPrice:14990,emoji:'📱', rating:4.6, reviews:589,  badge:'ลด 33%',desc:'แท็บเล็ตหน้าจอ IPS RAM 8GB WiFi 6 แบต 8000mAh รองรับปากกา' },
    { name:'เสื้อยืด Oversized Cotton',    category:'fashion',     price:390,  oldPrice:590,  emoji:'👕', rating:4.9, reviews:2105, badge:'ขายดี', desc:'เสื้อยืด Oversize ผ้า Cotton 100% ระบายอากาศดี มีหลายสี' },
    { name:'กางเกง Jogger สีพาสเทล',      category:'fashion',     price:590,  oldPrice:890,  emoji:'👖', rating:4.6, reviews:743,  badge:'',       desc:'กางเกงจ๊อกเกอร์ Poly-Cotton เอวยางยืดปรับได้' },
    { name:'กระเป๋า Tote ผ้า Canvas',     category:'fashion',     price:450,  oldPrice:750,  emoji:'👜', rating:4.7, reviews:918,  badge:'ขายดี', desc:'กระเป๋า Tote Canvas คุณภาพสูง จุของได้เยอะ มีช่องซิปด้านใน' },
    { name:'รองเท้าผ้าใบ Air Cushion',    category:'fashion',     price:1290, oldPrice:2190, emoji:'👟', rating:4.5, reviews:421,  badge:'-41%',  desc:'รองเท้าผ้าใบ Cushion ระบายอากาศดี น้ำหนักเบา เหมาะออกกำลังกาย' },
    { name:'เซรั่มวิตามิน C 30ml',        category:'beauty',      price:890,  oldPrice:1590, emoji:'✨', rating:4.9, reviews:3124, badge:'Top',    desc:'เซรั่มวิตามิน C 20% ลดรอยดำ กระจ่างใส เหมาะทุกสภาพผิว' },
    { name:'มอยส์เจอไรเซอร์ SPF50',      category:'beauty',      price:650,  oldPrice:990,  emoji:'🧴', rating:4.7, reviews:1876, badge:'',       desc:'ครีมกันแดด+มอยส์เจอร์ SPF50 PA+++ บางเบา ชุ่มชื้น 24 ชม.' },
    { name:'แป้งฝุ่น HD Matte Finish',    category:'beauty',      price:420,  oldPrice:690,  emoji:'💄', rating:4.6, reviews:2341, badge:'ใหม่',   desc:'แป้งฝุ่น HD ควบคุมความมัน ติดทนนาน 16 ชม. ไม่ตกร่อง' },
    { name:'ลิปสติกเนื้อแมต 12สี',       category:'beauty',      price:290,  oldPrice:490,  emoji:'💋', rating:4.8, reviews:4562, badge:'ขายดี', desc:'ลิปสติกแมตชุ่มชื้น ติดทนนาน 8 ชม. มี 12 เฉดสี' },
    { name:'เตียงแมวคิ้วท์ ขนนุ่ม',     category:'home',        price:590,  oldPrice:990,  emoji:'🛏️', rating:4.8, reviews:756,  badge:'ขายดี', desc:'เตียงแมวทรงกลม ผ้าขนนุ่ม กันน้ำด้านล่าง ซักเครื่องได้' },
    { name:'หม้อหุงข้าว IH 1.8L',        category:'home',        price:2490, oldPrice:3990, emoji:'🍚', rating:4.7, reviews:1023, badge:'',       desc:'หม้อหุงข้าวระบบ IH 1.8L อุ่นข้าว 24 ชม. ล้างง่าย' },
    { name:'ไฟ LED อาบแสง ตั้งโต๊ะ',    category:'home',        price:890,  oldPrice:1490, emoji:'💡', rating:4.5, reviews:632,  badge:'-40%',  desc:'ไฟตั้งโต๊ะ LED ปรับแสงได้ 3 ระดับ ถนอมสายตา ชาร์จ USB' },
    { name:'กระถางต้นไม้เซรามิก Set 3',  category:'home',        price:490,  oldPrice:790,  emoji:'🪴', rating:4.6, reviews:389,  badge:'ใหม่',   desc:'กระถางเซรามิก Set 3 ใบ ดีไซน์มินิมอล สีพาสเทล มีจานรอง' },
    { name:'เชือกกระโดด Speed Pro',       category:'sports',      price:490,  oldPrice:890,  emoji:'🪢', rating:4.7, reviews:1234, badge:'ขายดี', desc:'เชือกกระโดด Speed Rope แบบลูกปืน หมุนเร็ว ด้ามจับกันลื่น' },
    { name:'ดัมเบล 5kg/ข้าง รับประกัน',  category:'sports',      price:790,  oldPrice:1290, emoji:'🏋️', rating:4.8, reviews:876,  badge:'',       desc:'ดัมเบล Cast Iron 5kg เคลือบยางกันกระแทก เหมาะออกกำลังกายที่บ้าน' },
    { name:'เสื่อโยคะ 6mm Non-Slip',      category:'sports',      price:690,  oldPrice:1190, emoji:'🧘', rating:4.9, reviews:2156, badge:'Top',    desc:'เสื่อโยคะ NBR 6mm กันลื่นสองด้าน น้ำหนักเบา 183x61 ซม.' },
    { name:'กระติกน้ำสเตนเลส 1L',        category:'sports',      price:390,  oldPrice:690,  emoji:'🥤', rating:4.6, reviews:3421, badge:'ขายดี', desc:'กระติกสเตนเลส 304 เก็บเย็น 24 ชม. เก็บร้อน 12 ชม. ไม่รั่วซึม' },
  ];
  await Product.insertMany(initial);
  console.log(`✅ Seeded ${initial.length} products`);
};

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedAdmin();
  await seedProducts();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`   Admin: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
  });
});
