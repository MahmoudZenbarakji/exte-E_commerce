// app/api/reviews/eligible-products/route.js
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Review from '@/models/Review';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find delivered orders for the user
    const deliveredOrders = await Order.find({
      user: session.user.id,
      status: 'delivered'
    }).populate('items.product', 'name featuredImage');

    // Get products that haven't been reviewed yet
    const productsToReview = [];

    for (const order of deliveredOrders) {
      for (const item of order.items) {
        // Check if review already exists for this product and order
        const existingReview = await Review.findOne({
          user: session.user.id,
          product: item.product._id,
          order: order._id
        });

        if (!existingReview) {
          productsToReview.push({
            product: item.product,
            order: {
              _id: order._id,
              orderNumber: order.orderNumber,
              updatedAt: order.updatedAt
            }
          });
        }
      }
    }

    return NextResponse.json(productsToReview);
  } catch (error) {
    console.error('Error fetching eligible products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}