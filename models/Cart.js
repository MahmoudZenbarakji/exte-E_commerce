// models/Cart.js
import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
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
    hex: String,
    images: [String]
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Each user can have ONLY ONE cart
  },
  items: [CartItemSchema]
}, {
  timestamps: true
});

// Create a unique index to ensure one cart per user
CartSchema.index({ user: 1 }, { unique: true });

// Calculate totals as virtuals
CartSchema.virtual('total').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

CartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Enable virtuals in JSON output
CartSchema.set('toJSON', { virtuals: true });
CartSchema.set('toObject', { virtuals: true });

// Safe find or create method
CartSchema.statics.findOrCreateByUser = async function(userId) {
  try {
    let cart = await this.findOne({ user: userId }).populate('items.product');
    
    if (!cart) {
      cart = new this({
        user: userId,
        items: []
      });
      await cart.save();
      cart = await this.findOne({ user: userId }).populate('items.product');
    }
    
    return cart;
  } catch (error) {
    console.error('Error in findOrCreateByUser:', error);
    throw error;
  }
};

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);