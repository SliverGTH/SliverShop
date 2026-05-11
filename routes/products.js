const router  = require('express').Router();
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// ── Multer setup ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    const dir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `product_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพ (jpg, png, gif, webp)'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ── GET /api/products ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const sortMap = {
      'price-asc':  { price: 1 },
      'price-desc': { price: -1 },
      'name-asc':   { name: 1 },
      'rating':     { rating: -1 },
      'newest':     { createdAt: -1 },
    };
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortMap[sort] || { createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({ products, total, page: Number(page) });
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// ── GET /api/products/:id ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'ไม่พบสินค้า' });
    res.json(product);
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// ── POST /api/products ── admin only ──────────────────────────
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  const { name, category, price } = req.body;
  if (!name)     return res.status(400).json({ message: 'กรุณากรอกชื่อสินค้า' });
  if (!category) return res.status(400).json({ message: 'กรุณาเลือกหมวดหมู่' });
  if (!price)    return res.status(400).json({ message: 'กรุณากรอกราคา' });
  try {
    const data = {
      ...req.body,
      price:    Number(req.body.price),
      oldPrice: req.body.oldPrice ? Number(req.body.oldPrice) : undefined,
      rating:   Number(req.body.rating)  || 0,
      reviews:  Number(req.body.reviews) || 0,
      inStock:  req.body.inStock === 'true' || req.body.inStock === true,
      createdBy: req.user._id,
    };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message || 'เกิดข้อผิดพลาด' });
  }
});

// ── PUT /api/products/:id ── admin only ───────────────────────
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'ไม่พบสินค้า' });

    const data = {
      ...req.body,
      price:    Number(req.body.price),
      oldPrice: req.body.oldPrice ? Number(req.body.oldPrice) : undefined,
      rating:   Number(req.body.rating)  || 0,
      reviews:  Number(req.body.reviews) || 0,
      inStock:  req.body.inStock === 'true' || req.body.inStock === true,
    };

    if (req.file) {
      // delete old image file
      if (existing.image) {
        const oldPath = path.join(__dirname, '../public', existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message || 'เกิดข้อผิดพลาด' });
  }
});

// ── DELETE /api/products/:id ── admin only ────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'ไม่พบสินค้า' });
    if (product.image) {
      const imgPath = path.join(__dirname, '../public', product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    res.json({ message: 'ลบสินค้าเรียบร้อย' });
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// catch-all error handler — always return JSON, never HTML
router.use((err, req, res, _next) => {
  const isClient = err instanceof multer.MulterError ||
    (err.message && err.message.includes('อนุญาต'));
  res.status(isClient ? 400 : 500).json({ message: err.message || 'เกิดข้อผิดพลาด' });
});

module.exports = router;
