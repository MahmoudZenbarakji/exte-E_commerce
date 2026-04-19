// app/api/orders/[id]/route.js
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import authOptions from '@/lib/authOptions';
import Order from '@/models/Order';
import connectToDB from '@/lib/dbConnect';

const ORDER_STATUSES = ['pending', 'accepted', 'rejected', 'shipped', 'delivered'];

export async function PUT(req, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = context?.params;
    const resolved = params != null ? await Promise.resolve(params) : {};
    const id = resolved?.id;

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { status } = body;

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    if (!ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectToDB();

    if (mongoose.connection.readyState !== 1) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate('user', 'firstName lastName email')
      .populate('items.product')
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Order update error:', error);
    if (error?.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid order id or data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}