// app/api/reviews/route.js
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';
import Order from '@/models/Order';

export async function GET(request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    let query = { product: productId, isVerified: true };
    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, orderId, rating, title, comment } = body;

    // Verify the user has a delivered order for this product
    const order = await Order.findOne({
      _id: orderId,
      user: session.user.id,
      status: 'delivered',
      'items.product': productId
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found or not delivered' }, { status: 400 });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: session.user.id,
      product: productId,
      order: orderId
    });

    if (existingReview) {
      return NextResponse.json({ error: 'Review already exists' }, { status: 400 });
    }

    // Create review
    const review = new Review({
      user: session.user.id,
      product: productId,
      order: orderId,
      rating,
      title,
      comment,
      isVerified: true
    });

    await review.save();
    await review.populate('user', 'firstName lastName');

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}