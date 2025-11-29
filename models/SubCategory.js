// models/SubCategory.js
import mongoose from 'mongoose';

const SubCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'SubCategory name is required'],
    trim: true,
    maxlength: 100
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
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
}, {
  timestamps: true
});

// Index for better performance
SubCategorySchema.index({ category: 1, isActive: 1 });

export default mongoose.models.SubCategory || mongoose.model('SubCategory', SubCategorySchema);