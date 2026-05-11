require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const connectDB = require('./config/db');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));

// ── Fallback ────────────────────────────────────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ message: 'Not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Global error handler (always JSON) ──────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: err.message || 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
});

// ── Seed Admin ──────────────────────────────────────────────
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
    console.log(`✅ Admin created → ${process.env.ADMIN_EMAIL}`);
  }
};

// ── Connect DB then start (local dev only) ──────────────────
let dbReady = false;
const initDB = async () => {
  if (dbReady) return;
  await connectDB();
  await seedAdmin();
  dbReady = true;
};

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  initDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Silver Gallery running at http://localhost:${PORT}`));
  });
} else {
  // Vercel serverless — init DB on first request
  const originalHandler = app.handle.bind(app);
  app.handle = async (req, res, next) => {
    await initDB().catch(console.error);
    originalHandler(req, res, next);
  };
}

module.exports = app;
