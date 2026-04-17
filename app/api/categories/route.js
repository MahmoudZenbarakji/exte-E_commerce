// app/api/categories/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import Category from '@/models/Category';
// Ensure SubCategory is registered before virtual populate on Category (avoids intermittent
// "Schema hasn't been registered for model SubCategory" in serverless cold starts).
import '@/models/SubCategory';
import dbConnect from '@/lib/dbConnect';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Query params are always strings; normalize common boolean forms (incl. uppercase "False"). */
function parseActiveOnlyParam(raw) {
  if (raw === null || raw === undefined || raw === '') {
    return true;
  }
  const v = String(raw).trim().toLowerCase();
  if (v === 'false' || v === '0' || v === 'no') {
    return false;
  }
  if (v === 'true' || v === '1' || v === 'yes') {
    return true;
  }
  return true;
}

function normalizeCategoriesPayload(docs) {
  const list = Array.isArray(docs) ? docs : [];
  return list
    .filter((doc) => doc != null && typeof doc === 'object')
    .map((doc) => {
      const subCategories = Array.isArray(doc.subCategories)
        ? doc.subCategories.filter((s) => s != null)
        : [];
      return { ...doc, subCategories };
    });
}

export async function GET(request) {
  try {
    const conn = await dbConnect();
    if (!conn) {
      throw new Error('Database is not configured (MONGODB_URI missing)');
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = parseActiveOnlyParam(searchParams.get('activeOnly'));

    const query = {};
    if (activeOnly) {
      query.isActive = true;
    }

    const raw = await Category.find(query)
      .populate({
        path: 'subCategories',
        match: activeOnly ? { isActive: true } : {},
        options: { sort: { order: 1, name: 1 } },
      })
      .sort({ order: 1, name: 1 })
      .lean({ virtuals: true });

    const categories = normalizeCategoriesPayload(raw);

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
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