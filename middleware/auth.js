const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'ผู้ใช้ไม่พบในระบบ' });
    next();
  } catch {
    res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'สิทธิ์นี้เฉพาะ Admin เท่านั้น' });
  }
  next();
};

module.exports = { protect, adminOnly };
