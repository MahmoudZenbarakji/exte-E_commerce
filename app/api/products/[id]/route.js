// app/api/products/[id]/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import Product from '@/models/Product';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import Collection from '@/models/Collection';
import dbConnect from '@/lib/dbConnect';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // Await params
    const { id } = await params;
    
    const product = await Product.findById(id)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('collection', 'name');

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch product' }), {
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

    const productData = await request.json();
    await dbConnect();

    // Await params
    const { id } = await params;

    // Clean up empty optional fields
    if (productData.subCategory === '') {
      delete productData.subCategory;
    }
    
    if (productData.collection === '') {
      delete productData.collection;
    }

    // Validate category exists
    if (productData.category) {
      const categoryExists = await Category.findById(productData.category);
      if (!categoryExists) {
        return new Response(JSON.stringify({ error: 'Category not found' }), {
          status: 400,
        });
      }
    }

    // Validate subcategory exists and belongs to category
    if (productData.subCategory) {
      const subCategoryExists = await SubCategory.findOne({
        _id: productData.subCategory,
        category: productData.category
      });
      if (!subCategoryExists) {
        return new Response(JSON.stringify({ error: 'SubCategory not found or does not belong to the selected category' }), {
          status: 400,
        });
      }
    }

    // Validate collection exists
    if (productData.collection) {
      const collectionExists = await Collection.findById(productData.collection);
      if (!collectionExists) {
        return new Response(JSON.stringify({ error: 'Collection not found' }), {
          status: 400,
        });
      }
    }

    // Validate required images
    if (!productData.images || productData.images.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one product image is required' }), {
        status: 400,
      });
    }

    // Set featuredImage to first image if not provided
    if (!productData.featuredImage && productData.images.length > 0) {
      productData.featuredImage = productData.images[0];
    }

    // Convert price to number
    if (productData.price) {
      productData.price = parseFloat(productData.price);
    }
    
    if (productData.originalPrice) {
      productData.originalPrice = parseFloat(productData.originalPrice);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      productData,
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('collection', 'name');

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Product update error:', error);
    
    if (error.code === 11000) {
      return new Response(JSON.stringify({ error: 'Product with this SKU already exists' }), {
        status: 400,
      });
    }
    
    // Handle validation errors more specifically
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return new Response(JSON.stringify({ error: errors.join(', ') }), {
        status: 400,
      });
    }
    
    return new Response(JSON.stringify({ error: 'Failed to update product' }), {
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

    // Await params
    const { id } = await params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: 'Product deactivated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Product delete error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete product' }), {
      status: 500,
    });
  }
}