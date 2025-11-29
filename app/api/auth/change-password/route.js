// app/api/auth/change-password/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import { comparePassword, hashPassword } from '@/lib/passwordUtils';

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const { currentPassword, newPassword } = await request.json();
    
    await dbConnect();
    
    // Get user with password
    const user = await User.findById(session.user.id).select('+password');
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return new Response(JSON.stringify({ error: 'Current password is incorrect' }), {
        status: 400,
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return new Response(JSON.stringify({ 
      message: 'Password updated successfully'
    }), {
      status: 200,
    });
  } catch (error) {
    console.error('Password update error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}