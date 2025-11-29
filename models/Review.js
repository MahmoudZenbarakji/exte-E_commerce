// models/Review.js
import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    maxlength: 100
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  isVerified: {
    type: Boolean,
    default: true // Set to true after we verify the order was delivered
  }
}, {
  timestamps: true
});

// Ensure one review per user per product per order
ReviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

// Index for product reviews
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);