const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:     { type: String, required: true },
    price:    { type: Number, required: true },
    image:    { type: String, default: '' },
    emoji:    { type: String, default: '📦' },
    qty:      { type: Number, required: true, min: 1 },
  }],
  shippingAddress: {
    name:       { type: String, required: true },
    phone:      { type: String, required: true },
    street:     { type: String, required: true },
    district:   { type: String, default: '' },
    city:       { type: String, required: true },
    province:   { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  totalPrice:    { type: Number, required: true },
  status:        { type: String, enum: ['pending','confirmed','shipped','delivered','cancelled'], default: 'pending' },
  paymentMethod: { type: String, default: 'cod' },
  note:          { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
