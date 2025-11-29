// app/api/products/[id]/like/route.js
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Product from '@/models/Product';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params object first
    const { id } = await params;
    const { liked } = await request.json();

    // Fetch user with likedProducts field
    const user = await User.findById(session.user.id).select('likedProducts');
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Initialize likedProducts if it doesn't exist
    if (!user.likedProducts) {
      user.likedProducts = [];
    }

    if (liked) {
      // Add to likes if not already liked
      if (!user.likedProducts.includes(id)) {
        user.likedProducts.push(id);
        product.likes += 1;
      }
    } else {
      // Remove from likes
      user.likedProducts = user.likedProducts.filter(
        productId => productId.toString() !== id
      );
      product.likes = Math.max(0, product.likes - 1);
    }

    await user.save();
    await product.save();

    return NextResponse.json({ 
      message: liked ? 'Product liked' : 'Product unliked',
      likes: product.likes 
    });
  } catch (error) {
    console.error('Error updating like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}