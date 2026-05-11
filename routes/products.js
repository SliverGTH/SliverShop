const router  = require('express').Router();
const multer  = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// ── Cloudinary config ─────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:           'silver-gallery',
    allowed_formats:  ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation:   [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  },
});

const fileFilter = (_, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(file.mimetype)) cb(null, true);
  else cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพ (jpg, png, gif, webp)'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Extract Cloudinary public_id from URL
const getPublicId = (url) => {
  if (!url || !url.includes('/upload/')) return null;
  const afterUpload = url.split('/upload/')[1].replace(/^v\d+\//, '');
  return afterUpload.replace(/\.[^/.]+$/, '');
};

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
    if (req.file) data.image = req.file.path;
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
      if (existing.image) {
        const pid = getPublicId(existing.image);
        if (pid) await cloudinary.uploader.destroy(pid).catch(() => {});
      }
      data.image = req.file.path;
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
      const pid = getPublicId(product.image);
      if (pid) await cloudinary.uploader.destroy(pid).catch(() => {});
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
