// app/api/collections/[id]/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import Collection from '@/models/Collection';
import Product from '@/models/Product';
import dbConnect from '@/lib/dbConnect';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const collection = await Collection.findById(id);

    if (!collection) {
      return new Response(JSON.stringify({ error: 'Collection not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(collection), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Collection fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch collection' }), {
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

    const collectionData = await request.json();
    await dbConnect();

    // Check if another collection with same name already exists
    if (collectionData.name) {
      const existingCollection = await Collection.findOne({ 
        name: { $regex: new RegExp(`^${collectionData.name}$`, 'i') },
        _id: { $ne: params.id }
      });
      
      if (existingCollection) {
        return new Response(JSON.stringify({ error: 'Collection with this name already exists' }), {
          status: 400,
        });
      }
    }

    const collection = await Collection.findByIdAndUpdate(
      params.id,
      collectionData,
      { new: true, runValidators: true }
    );

    if (!collection) {
      return new Response(JSON.stringify({ error: 'Collection not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(collection), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Collection update error:', error);
    
    if (error.code === 11000) {
      return new Response(JSON.stringify({ error: 'Collection with this name already exists' }), {
        status: 400,
      });
    }
    
    return new Response(JSON.stringify({ error: 'Failed to update collection' }), {
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

    // Check if collection has products
    const productCount = await Product.countDocuments({ 
      collection: params.id,
      isActive: true 
    });

    if (productCount > 0) {
      return new Response(JSON.stringify({ 
        error: 'Cannot delete collection with active products. Deactivate the collection instead.' 
      }), {
        status: 400,
      });
    }

    const collection = await Collection.findByIdAndDelete(params.id);

    if (!collection) {
      return new Response(JSON.stringify({ error: 'Collection not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: 'Collection deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Collection delete error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete collection' }), {
      status: 500,
    });
  }
}