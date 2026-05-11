const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['ring', 'necklace', 'bracelet', 'earring', 'pendant', 'set'] },
  price:    { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, min: 0 },
  emoji:    { type: String, default: '📦' },
  image:    { type: String, default: '' },
  rating:   { type: Number, default: 0, min: 0, max: 5 },
  reviews:  { type: Number, default: 0, min: 0 },
  badge:    { type: String, default: '' },
  desc:     { type: String, default: '' },
  inStock:  { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
