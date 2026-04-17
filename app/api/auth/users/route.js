// app/api/users/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions"; // Remove the curly braces
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

// app/api/users/route.js - Updated GET function
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    if (session.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    await dbConnect();
    const users = await User.find({})
      .select('firstName lastName email role image createdAt')
      .lean();
    
    return new Response(JSON.stringify({ users }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const { userId, role } = await request.json();
    
    await dbConnect();
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ user }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}