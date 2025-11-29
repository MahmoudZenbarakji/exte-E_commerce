// app/api/collections/route.js
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import Collection from '@/models/Collection';
import dbConnect from '@/lib/dbConnect';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const featured = searchParams.get('featured');
    const season = searchParams.get('season');
    
    let query = {};
    if (activeOnly) query.isActive = true;
    if (featured === 'true') query.featured = true;
    if (season) query.season = season;
    
    const collections = await Collection.find(query)
      .sort({ featured: -1, year: -1, name: 1 });

    return new Response(JSON.stringify(collections), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Collections fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch collections' }), {
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

    const collectionData = await request.json();
    await dbConnect();

    // Check if collection with same name already exists
    const existingCollection = await Collection.findOne({ 
      name: { $regex: new RegExp(`^${collectionData.name}$`, 'i') } 
    });
    
    if (existingCollection) {
      return new Response(JSON.stringify({ error: 'Collection with this name already exists' }), {
        status: 400,
      });
    }

    const collection = new Collection(collectionData);
    await collection.save();

    return new Response(JSON.stringify(collection), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Collection creation error:', error);
    
    if (error.code === 11000) {
      return new Response(JSON.stringify({ error: 'Collection with this name already exists' }), {
        status: 400,
      });
    }
    
    return new Response(JSON.stringify({ error: 'Failed to create collection' }), {
      status: 500,
    });
  }
}