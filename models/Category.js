// models/Category.js - Remove the subCategories array or make it a virtual
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  image: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
  // Remove the subCategories array from here
}, {
  timestamps: true
});

// Add a virtual for subCategories instead
CategorySchema.virtual('subCategories', {
  ref: 'SubCategory',
  localField: '_id',
  foreignField: 'category'
});

// Virtual for product count
CategorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Enable virtuals in JSON output
CategorySchema.set('toJSON', { virtuals: true });
CategorySchema.set('toObject', { virtuals: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);