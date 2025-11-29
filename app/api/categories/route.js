// app/api/categories/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import Category from '@/models/Category';
import dbConnect from '@/lib/dbConnect';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    
    let query = {};
    if (activeOnly) query.isActive = true;
    
    const categories = await Category.find(query)
      .populate({
        path: 'subCategories',
        match: activeOnly ? { isActive: true } : {},
        options: { sort: { order: 1, name: 1 } }
      })
      .sort({ order: 1, name: 1 });

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
      });
    }

    const categoryData = await request.json();
    await dbConnect();

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') } 
    });
    
    if (existingCategory) {
      return new Response(JSON.stringify({ error: 'Category with this name already exists' }), {
        status: 400,
      });
    }

    const category = new Category(categoryData);
    await category.save();

    return new Response(JSON.stringify(category), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Category creation error:', error);
    
    if (error.code === 11000) {
      return new Response(JSON.stringify({ error: 'Category with this name already exists' }), {
        status: 400,
      });
    }
    
    return new Response(JSON.stringify({ error: 'Failed to create category' }), {
      status: 500,
    });
  }
}