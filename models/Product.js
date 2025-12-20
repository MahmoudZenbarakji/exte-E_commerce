// models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: 2000
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory'
  },
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  },
  sizes: [{
    size: {
      type: String,
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL','XXXXL','XXXXXL','XXXXXXL','26', '28', '30','31','32','33', '34', '36', '38', '40', '42', '44', '46','48','50','52','54','56','58','60']
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  
  colors: [{
    name: {
      type: String,
      required: true
    },
    hex: {
      type: String,
      required: true
    },
    images: [{
      type: String,
      required: true
    }]
  }],
  featuredImage: {
    type: String
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  metaTitle: String,
  metaDescription: String,
  seoUrl: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate SKU before saving
ProductSchema.pre('save', async function(next) {
  if (!this.sku) {
    const category = await mongoose.model('Category').findById(this.category);
    const categoryCode = category ? category.name.substring(0, 3).toUpperCase() : 'GEN';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.sku = `${categoryCode}-${randomNum}`;
  }
  
  if (!this.seoUrl) {
    this.seoUrl = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  
  // Set featuredImage to first image of first color if not set
  if (!this.featuredImage && this.colors && this.colors.length > 0 && this.colors[0].images.length > 0) {
    this.featuredImage = this.colors[0].images[0];
  }
  
  next();
});

// Index for better performance
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ subCategory: 1, isActive: 1 });
ProductSchema.index({ collection: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ likes: -1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);