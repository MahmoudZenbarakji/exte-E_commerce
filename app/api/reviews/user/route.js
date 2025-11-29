// app/api/reviews/user/route.js
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviews = await Review.find({ user: session.user.id })
      .populate('product', 'name featuredImage')
      .sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}