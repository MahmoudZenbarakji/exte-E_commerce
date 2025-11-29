// app/api/orders/[id]/route.js
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import Order from '@/models/Order';
import connectToDB from '@/lib/dbConnect';

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params object
    const { id } = await params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    await connectToDB();

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'firstName lastName email')
     .populate('items.product');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: order
    });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}