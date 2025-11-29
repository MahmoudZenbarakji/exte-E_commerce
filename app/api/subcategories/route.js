// app/api/subcategories/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import SubCategory from '@/models/SubCategory';
import Category from '@/models/Category'; // Import Category model
import dbConnect from '@/lib/dbConnect';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    
    let query = {};
    if (activeOnly) query.isActive = true;
    
    // Populate the category field with category data
    const subCategories = await SubCategory.find(query)
      .populate('category', 'name _id') // Populate with category name and _id
      .sort({ name: 1 });

    return new Response(JSON.stringify(subCategories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
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