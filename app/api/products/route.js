// app/api/products/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import Product from '@/models/Product';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import Collection from '@/models/Collection';
import dbConnect from '@/lib/dbConnect';

const DB_TIMEOUT = 30000; // 30 seconds

export async function GET(request) {
  // Set timeout for the entire request
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), 25000)
  );

  try {
    await Promise.race([dbConnect(), timeoutPromise]);
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const collection = searchParams.get('collection');
    const featured = searchParams.get('featured');
    
    let query = { isActive: true };
    
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (collection) query.collection = collection;
    if (featured === 'true') query.isFeatured = true;
    
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('collection', 'name')
      .sort({ createdAt: -1 })
      .maxTimeMS(DB_TIMEOUT);

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    
    if (error.message === 'Request timeout') {
      return new Response(JSON.stringify({ error: 'Request timeout' }), {
        status: 408,
      });
    }
    
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
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

    const productData = await request.json();
    await dbConnect();

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

    // Validate that colors have images
    if (!productData.colors || productData.colors.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one color is required' }), {
        status: 400,
      });
    }

    // Validate each color has at least one image
    for (const color of productData.colors) {
      if (!color.images || color.images.length === 0) {
        return new Response(JSON.stringify({ error: 'Each color must have at least one image' }), {
          status: 400,
        });
      }
    }

    // Set featuredImage to first image of first color if not provided
    if (!productData.featuredImage && productData.colors.length > 0 && productData.colors[0].images.length > 0) {
      productData.featuredImage = productData.colors[0].images[0];
    }

    // Convert price to number
    if (productData.price) {
      productData.price = parseFloat(productData.price);
    }
    
    if (productData.originalPrice) {
      productData.originalPrice = parseFloat(productData.originalPrice);
    }

    // Create product
    const product = new Product(productData);
    await product.save();

    // Populate the created product for response
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('collection', 'name');

    return new Response(JSON.stringify(populatedProduct), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Product creation error:', error);
    
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
    
    return new Response(JSON.stringify({ error: 'Failed to create product' }), {
      status: 500,
    });
  }
}