// app/api/cart/route.js
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import connectToDB from '@/lib/dbConnect';

// Helper function to ensure DB connection
async function ensureDbConnection() {
  try {
    await connectToDB();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        items: [],
        total: 0,
        itemCount: 0
      });
    }

    const dbConnected = await ensureDbConnection();
    if (!dbConnected) {
      return NextResponse.json({ 
        error: 'فشل الاتصال بقاعدة البيانات' 
      }, { status: 500 });
    }

    const cart = await Cart.findOne({ user: session.user.id }).populate({
      path: 'items.product',
      select: 'name nameEn featuredImage price originalPrice colors isActive',
    });
    
    // If no cart exists, return empty cart
    if (!cart) {
      return NextResponse.json({
        items: [],
        total: 0,
        itemCount: 0
      });
    }

    return NextResponse.json({
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json({ 
      items: [],
      total: 0,
      itemCount: 0
    });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'يرجى تسجيل الدخول لإضافة منتجات إلى السلة' 
      }, { status: 401 });
    }

    const body = await req.json();

    const { productId, size, color, quantity = 1 } = body;

    if (!productId || !size) {
      return NextResponse.json({ 
        error: 'معرف المنتج والمقاس مطلوبان' 
      }, { status: 400 });
    }

    const dbConnected = await ensureDbConnection();
    if (!dbConnected) {
      return NextResponse.json({ 
        error: 'فشل الاتصال بقاعدة البيانات' 
      }, { status: 500 });
    }

    const product = await Product.findById(productId).select('name price sizes');
    if (!product) {
      return NextResponse.json({ 
        error: 'المنتج غير موجود' 
      }, { status: 404 });
    }

    // Check stock availability for the selected size
    const selectedSize = product.sizes.find(s => s.size === size);
    if (!selectedSize) {
      return NextResponse.json({ 
        error: `المقاس ${size} غير متوفر لهذا المنتج` 
      }, { status: 400 });
    }

    let cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      cart = new Cart({
        user: session.user.id,
        items: []
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => {
        const itemProductId = item.product.toString ? item.product.toString() : item.product;
        const isSameProduct = itemProductId === productId;
        const isSameSize = item.size === size;
        const isSameColor = item.color?.name === color?.name;
        return isSameProduct && isSameSize && isSameColor;
      }
    );

    let newQuantity = quantity;
    if (existingItemIndex > -1) {
      // If item exists, calculate the new total quantity
      newQuantity = cart.items[existingItemIndex].quantity + quantity;
    }

    // Check if the total quantity exceeds available stock
    if (newQuantity > selectedSize.stock) {
      const availableStock = selectedSize.stock;
      const currentInCart = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;
      
      let errorMessage;
      if (currentInCart > 0) {
        errorMessage = `فقط ${availableStock} قطعة متوفرة في المخزون للمقاس ${size}. لديك بالفعل ${currentInCart} في سلة التسوق.`;
      } else {
        errorMessage = `فقط ${availableStock} قطعة متوفرة في المخزون للمقاس ${size}`;
      }
      
      return NextResponse.json({ 
        error: errorMessage 
      }, { status: 400 });
    }

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      const newItem = {
        product: productId,
        size,
        color: color || null,
        quantity,
        price: product.price
      };
      cart.items.push(newItem);
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: session.user.id }).populate({
      path: 'items.product',
      select: 'name nameEn featuredImage price originalPrice colors isActive',
    });

    return NextResponse.json({
      message: 'تمت إضافة المنتج إلى السلة',
      items: updatedCart.items,
      total: updatedCart.total,
      itemCount: updatedCart.itemCount
    });
  } catch (error) {
    console.error('Cart POST error:', error);

    // More specific error handling
    if (error.name === 'MongoServerError' && error.code === 11000) {
      // Duplicate key error - this means multiple carts for same user
      return NextResponse.json({ 
        error: 'حدثت مشكلة في سلة التسوق الخاصة بك. يرجى محاولة تحديث الصفحة.' 
      }, { status: 500 });
    }
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: 'بيانات سلة التسوق غير صالحة: ' + error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'فشل إضافة المنتج إلى السلة. يرجى المحاولة مرة أخرى.' 
    }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { itemId, quantity } = await req.json();

    if (!itemId || quantity === undefined) {
      return NextResponse.json({ error: 'معرف المنتج والكمية مطلوبان' }, { status: 400 });
    }

    const dbConnected = await ensureDbConnection();
    if (!dbConnected) {
      return NextResponse.json({ error: 'فشل الاتصال بقاعدة البيانات' }, { status: 500 });
    }

    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart) {
      return NextResponse.json({ error: 'لم يتم العثور على سلة التسوق' }, { status: 404 });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return NextResponse.json({ error: 'المنتج غير موجود في السلة' }, { status: 404 });
    }

    // Check stock when updating quantity
    const product = await Product.findById(item.product).select('sizes');
    if (product) {
      const selectedSize = product.sizes.find(s => s.size === item.size);
      if (selectedSize && quantity > selectedSize.stock) {
        return NextResponse.json({ 
          error: `فقط ${selectedSize.stock} قطعة متوفرة في المخزون للمقاس ${item.size}.` 
        }, { status: 400 });
      }
    }

    if (quantity <= 0) {
      cart.items.pull({ _id: itemId });
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name nameEn featuredImage price originalPrice colors isActive',
    });

    return NextResponse.json({
      message: 'تم تحديث السلة',
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount
    });
  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم الداخلي' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');

    const dbConnected = await ensureDbConnection();
    if (!dbConnected) {
      return NextResponse.json({ error: 'فشل الاتصال بقاعدة البيانات' }, { status: 500 });
    }

    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart) {
      return NextResponse.json({ error: 'لم يتم العثور على سلة التسوق' }, { status: 404 });
    }

    if (itemId) {
      cart.items.pull({ _id: itemId });
    } else {
      cart.items = [];
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name nameEn featuredImage price originalPrice colors isActive',
    });

    return NextResponse.json({
      message: itemId ? 'تم إزالة المنتج من السلة' : 'تم تفريغ السلة',
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount
    });
  } catch (error) {
    console.error('Cart delete error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم الداخلي' }, { status: 500 });
  }
}