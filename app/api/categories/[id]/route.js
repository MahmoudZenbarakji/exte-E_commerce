// app/api/categories/[id]/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import Product from '@/models/Product';
import dbConnect from '@/lib/dbConnect';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const category = await Category.findById(params.id)
      .populate('subCategories');

    if (!category) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(category), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Category fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch category' }), {
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

    const categoryData = await request.json();
    await dbConnect();

    const category = await Category.findByIdAndUpdate(
      params.id,
      categoryData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(category), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Category update error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update category' }), {
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

    // Check if category has products
    const productCount = await Product.countDocuments({ 
      category: params.id, 
      isActive: true 
    });

    if (productCount > 0) {
      return new Response(JSON.stringify({ 
        error: 'Cannot delete category with active products. Deactivate the category instead.' 
      }), {
        status: 400,
      });
    }

    // Check if category has subcategories
    const subCategoryCount = await SubCategory.countDocuments({ 
      category: params.id 
    });

    if (subCategoryCount > 0) {
      return new Response(JSON.stringify({ 
        error: 'Cannot delete category with subcategories. Delete or reassign subcategories first.' 
      }), {
        status: 400,
      });
    }

    const category = await Category.findByIdAndDelete(params.id);

    if (!category) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: 'Category deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Category delete error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete category' }), {
      status: 500,
    });
  }
}