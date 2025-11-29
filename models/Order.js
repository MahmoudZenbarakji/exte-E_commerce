// models/Order.js
import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  size: {
    type: String,
    required: true
  },
  color: {
    name: String,
    hex: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [OrderItemSchema],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'shipped', 'delivered'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'cash_on_delivery'
  },
  orderNumber: {
    type: String,
    unique: true
  },
  // FIXED: Simplified customer information with string address
  customerInfo: {
    fullName: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    address: {  // Now just a simple string
      type: String,
      required: true
    },
    notes: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const timestamp = date.getTime();
    const random = Math.floor(Math.random() * 1000);
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Populate product details
OrderSchema.pre('find', function(next) {
  this.populate('items.product');
  this.populate('user');
  next();
});

OrderSchema.pre('findOne', function(next) {
  this.populate('items.product');
  this.populate('user');
  next();
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);