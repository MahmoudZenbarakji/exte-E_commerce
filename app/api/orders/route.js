// app/api/orders/route.js - FIXED VERSION
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import connectToDB from '@/lib/dbConnect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    // Check if user is admin
    const isAdmin = session.user.role === 'admin';

    let orders;
    if (isAdmin) {
      // Admin can see all orders
      orders = await Order.find()
        .populate('user', 'firstName lastName email')
        .populate('items.product')
        .sort({ createdAt: -1 });
    } else {
      // Regular users can only see their own orders
      orders = await Order.find({ user: session.user.id })
        .populate('items.product')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, total, customerInfo, notes } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate customer information - SIMPLE VALIDATION
    if (!customerInfo || !customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.address) {
      return NextResponse.json({ 
        error: 'Full name, phone number, and address are required' 
      }, { status: 400 });
    }

    await connectToDB();

    // Create new order with simplified customer information
    const order = new Order({
      user: session.user.id,
      items: items,
      total: total,
      paymentMethod: 'cash_on_delivery',
      customerInfo: {
        fullName: customerInfo.fullName,
        phoneNumber: customerInfo.phoneNumber,
        address: customerInfo.address, // Simple string address
        notes: notes || ''
      }
    });

    await order.save();
    await order.populate('items.product');

    // Clear user's cart after successful order
    await Cart.findOneAndUpdate(
      { user: session.user.id },
      { items: [] }
    );

    return NextResponse.json({
      message: 'Order created successfully',
      order: order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}