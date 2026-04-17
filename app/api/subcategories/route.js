// app/api/subcategories/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import SubCategory from '@/models/SubCategory';
import Category from '@/models/Category'; // Import Category model
import dbConnect from '@/lib/dbConnect';
import { getPagination } from '@/lib/pagination';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    
    let query = {};
    if (activeOnly) query.isActive = true;

    const { limit, skip } = getPagination(searchParams, { maxLimit: 500 });

    let q = SubCategory.find(query)
      .populate('category', 'name _id')
      .sort({ name: 1 });

    if (skip) q = q.skip(skip);
    if (limit != null) q = q.limit(limit);

    const subCategories = await q;

    const cacheControl = activeOnly
      ? 'public, s-maxage=60, stale-while-revalidate=300'
      : 'private, no-store, must-revalidate';

    return new Response(JSON.stringify(subCategories), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': cacheControl,
      },
    });
  } catch (error) {
    console.error('Subcategories fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch subcategories' }), {
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

    const subCategoryData = await request.json();
    await dbConnect();

    // Check if subcategory with same name already exists in this category
    const existingSubCategory = await SubCategory.findOne({ 
      name: { $regex: new RegExp(`^${subCategoryData.name}$`, 'i') },
      category: subCategoryData.category
    });
    
    if (existingSubCategory) {
      return new Response(JSON.stringify({ error: 'SubCategory with this name already exists in this category' }), {
        status: 400,
      });
    }

    const subCategory = new SubCategory(subCategoryData);
    await subCategory.save();

    // Populate the category field before sending response
    await subCategory.populate('category', 'name _id');

    return new Response(JSON.stringify(subCategory), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('SubCategory creation error:', error);
    
    if (error.code === 11000) {
      return new Response(JSON.stringify({ error: 'SubCategory with this name already exists' }), {
        status: 400,
      });
    }
    
    return new Response(JSON.stringify({ error: 'Failed to create subcategory' }), {
      status: 500,
    });
  }
}