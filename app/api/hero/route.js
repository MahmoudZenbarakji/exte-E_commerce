// app/api/hero/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import HeroSection from '@/models/HeroSection';
import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Generate SHA1 hash for signature
const generateSHA1 = (data) => {
  const hash = crypto.createHash('sha1');
  hash.update(data);
  return hash.digest('hex');
};

// Generate signature for Cloudinary
const generateSignature = (publicId, apiSecret) => {
  const timestamp = new Date().getTime();
  return `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const timestamp = new Date().getTime();
  const signature = generateSHA1(generateSignature(publicId, apiSecret));
  
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('signature', signature);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  return result.result === 'ok';
};

// GET /api/hero
export async function GET() {
  try {
    await dbConnect();
    
    // Get the most recent hero section (there should only be one, but get the latest)
    const heroSection = await HeroSection.findOne().sort({ createdAt: -1 });
    
    if (!heroSection) {
      return NextResponse.json({ imageUrl: null, publicId: null }, { status: 200 });
    }
    
    return NextResponse.json({
      imageUrl: heroSection.imageUrl,
      publicId: heroSection.publicId
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching hero section:', error);
    return NextResponse.json({ error: 'Failed to fetch hero section' }, { status: 500 });
  }
}

// POST /api/hero
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { imageUrl, publicId } = await request.json();
    
    if (!imageUrl || !publicId) {
      return NextResponse.json({ error: 'imageUrl and publicId are required' }, { status: 400 });
    }

    await dbConnect();

    // Get existing hero section
    const existingHero = await HeroSection.findOne().sort({ createdAt: -1 });
    
    // If there's an existing hero section, delete the old image from Cloudinary
    if (existingHero && existingHero.publicId) {
      try {
        await deleteFromCloudinary(existingHero.publicId);
      } catch (error) {
        console.error('Error deleting old image from Cloudinary:', error);
        // Continue even if deletion fails
      }
      
      // Update the existing hero section
      existingHero.imageUrl = imageUrl;
      existingHero.publicId = publicId;
      await existingHero.save();
      
      return NextResponse.json({
        imageUrl: existingHero.imageUrl,
        publicId: existingHero.publicId
      }, { status: 200 });
    } else {
      // Create new hero section
      const heroSection = new HeroSection({
        imageUrl,
        publicId
      });
      await heroSection.save();
      
      return NextResponse.json({
        imageUrl: heroSection.imageUrl,
        publicId: heroSection.publicId
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error updating hero section:', error);
    return NextResponse.json({ error: 'Failed to update hero section' }, { status: 500 });
  }
}

// DELETE /api/hero
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();

    // Get existing hero section
    const existingHero = await HeroSection.findOne().sort({ createdAt: -1 });
    
    if (!existingHero) {
      return NextResponse.json({ error: 'No hero section found' }, { status: 404 });
    }

    // Delete image from Cloudinary
    if (existingHero.publicId) {
      try {
        await deleteFromCloudinary(existingHero.publicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Continue even if deletion fails
      }
    }

    // Delete from database
    await HeroSection.findByIdAndDelete(existingHero._id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Hero section deleted successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting hero section:', error);
    return NextResponse.json({ error: 'Failed to delete hero section' }, { status: 500 });
  }
}

