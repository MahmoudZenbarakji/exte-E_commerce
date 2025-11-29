// app/api/products/advanced/route.js
import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import dbConnect from '@/lib/dbConnect';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    
    // Build query
    let query = { isActive: true };
    
    // Category filter
    if (searchParams.get('category')) {
      query.category = searchParams.get('category');
    }
    
    // SubCategory filter
    if (searchParams.get('subCategory')) {
      query.subCategory = searchParams.get('subCategory');
    }
    
    // Collection filter
    if (searchParams.get('collection')) {
      query.collection = searchParams.get('collection');
    }
    
    // Size filter
    if (searchParams.get('sizes')) {
      const sizes = searchParams.get('sizes').split(',');
      query['sizes.size'] = { $in: sizes };
    }
    
    // Color filter
    if (searchParams.get('colors')) {
      const colors = searchParams.get('colors').split(',');
      query['colors.name'] = { $in: colors };
    }
    
    // Price range filter
    if (searchParams.get('minPrice') || searchParams.get('maxPrice')) {
      query.price = {};
      if (searchParams.get('minPrice')) {
        query.price.$gte = parseFloat(searchParams.get('minPrice'));
      }
      if (searchParams.get('maxPrice')) {
        query.price.$lte = parseFloat(searchParams.get('maxPrice'));
      }
    }
    
    // Search filter
    if (searchParams.get('search')) {
      query.$or = [
        { name: { $regex: searchParams.get('search'), $options: 'i' } },
        { description: { $regex: searchParams.get('search'), $options: 'i' } },
        { tags: { $in: [new RegExp(searchParams.get('search'), 'i')] } }
      ];
    }
    
    // Build sort
    let sort = { createdAt: -1 };
    switch (searchParams.get('sort')) {
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
    }
    
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('collection', 'name')
      .sort(sort)
      .limit(parseInt(searchParams.get('limit')) || 100);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Advanced products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}