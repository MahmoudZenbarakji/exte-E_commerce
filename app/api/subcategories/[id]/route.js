// app/api/subcategories/[id]/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import SubCategory from '@/models/SubCategory';
import Product from '@/models/Product';
import dbConnect from '@/lib/dbConnect';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const subCategory = await SubCategory.findById(id)
      .populate('category', 'name _id');

    if (!subCategory) {
      return new Response(JSON.stringify({ error: 'SubCategory not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(subCategory), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('SubCategory fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch subcategory' }), {
      status: 500,
    });
  }
}

export async function PUT(request, { params }) {
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

    // Check if another subcategory with same name already exists in this category
    if (subCategoryData.name) {
      const existingSubCategory = await SubCategory.findOne({ 
        name: { $regex: new RegExp(`^${subCategoryData.name}$`, 'i') },
        category: subCategoryData.category,
        _id: { $ne: params.id }
      });
      
      if (existingSubCategory) {
        return new Response(JSON.stringify({ error: 'SubCategory with this name already exists in this category' }), {
          status: 400,
        });
      }
    }

    const subCategory = await SubCategory.findByIdAndUpdate(
      params.id,
      subCategoryData,
      { new: true, runValidators: true }
    ).populate('category', 'name _id');

    if (!subCategory) {
      return new Response(JSON.stringify({ error: 'SubCategory not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(subCategory), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('SubCategory update error:', error);
    
    if (error.code === 11000) {
      return new Response(JSON.stringify({ error: 'SubCategory with this name already exists' }), {
        status: 400,
      });
    }
    
    return new Response(JSON.stringify({ error: 'Failed to update subcategory' }), {
      status: 500,
    });
  }
}

export async function DELETE(request, { params }) {
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

    await dbConnect();

    // Check if subcategory has products
    const productCount = await Product.countDocuments({ 
      subCategory: params.id,
      isActive: true 
    });

    if (productCount > 0) {
      return new Response(JSON.stringify({ 
        error: 'Cannot delete subcategory with active products. Deactivate the subcategory instead.' 
      }), {
        status: 400,
      });
    }

    const subCategory = await SubCategory.findByIdAndDelete(params.id);

    if (!subCategory) {
      return new Response(JSON.stringify({ error: 'SubCategory not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: 'SubCategory deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('SubCategory delete error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete subcategory' }), {
      status: 500,
    });
  }
}