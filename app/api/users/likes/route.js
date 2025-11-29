// app/api/users/likes/route.js
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id)
      .populate({
        path: 'likedProducts',
        model: 'Product'
      })
      .select('likedProducts');

    // Return empty array if no liked products
    return NextResponse.json(user.likedProducts || []);
  } catch (error) {
    console.error('Error fetching liked products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}