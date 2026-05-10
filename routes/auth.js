const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('กรุณากรอกชื่อ'),
  body('email').isEmail().withMessage('อีเมลไม่ถูกต้อง'),
  body('password').isLength({ min: 6 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { name, email, password } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('อีเมลไม่ถูกต้อง'),
  body('password').notEmpty().withMessage('กรุณากรอกรหัสผ่าน'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }
    const userObj = user.toJSON();
    res.json({ token: signToken(user._id), user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
