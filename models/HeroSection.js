// models/HeroSection.js
import mongoose from 'mongoose';

const HeroSectionSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Since we only want one hero section, we can add a singleton pattern
// But for simplicity, we'll just ensure there's only one document
HeroSectionSchema.index({ createdAt: -1 });

export default mongoose.models.HeroSection || mongoose.model('HeroSection', HeroSectionSchema);

