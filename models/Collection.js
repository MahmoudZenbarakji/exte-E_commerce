// models/Collection.js
import mongoose from 'mongoose';

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Collection name is required'],
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
  season: {
    type: String,
    enum: ['Spring', 'Summer', 'Fall', 'Winter', 'All Season', 'Holiday', 'Resort'],
    default: 'All Season'
  },
  year: {
    type: Number,
    default: new Date().getFullYear()
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: Date,
  endDate: Date,
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for product count
CollectionSchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'collection',
  count: true
});

export default mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);