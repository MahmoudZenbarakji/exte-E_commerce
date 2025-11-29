// app/dashboard/cart/page.js
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CheckoutForm from '@/components/CheckoutForm';
import { useLanguage } from '@/context/LanguageContext';

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const { currentLanguage, translations } = useLanguage();
  const isRTL = currentLanguage === 'ar';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session) {
      fetchCart();
    }
  }, [session, status, router]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      
      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
      } else {
        console.error('Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(true);
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    try {
      setUpdating(true);
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = async (customerInfo) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items,
          total: cart.total,
          customerInfo: customerInfo,
          notes: customerInfo.notes
        }),
      });

      if (response.ok) {
        const order = await response.json();
        setShowCheckoutForm(false);
        alert(translations.orderPlacedSuccess || 'Order placed successfully! You can track your order status in the orders page.');
        router.push('/dashboard/orders');
      } else {
        const error = await response.json();
        alert(error.error || translations.placeOrderFailed || 'Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(translations.placeOrderFailed || 'Failed to place order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 p-6 bg-white rounded-lg shadow-sm">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm h-64">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              {translations.yourShoppingBag || 'Your Shopping Bag'}
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {translations.yourBagIsEmpty || 'Your bag is empty. Start adding some beautiful items!'}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
            >
              <svg className={`w-5 h-5 mr-2 ${isRTL ? 'ml-2 mr-0' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {translations.continueShopping || 'Continue Shopping'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900">
            {translations.shoppingBag || 'Shopping Bag'}
          </h1>
          <p className="text-gray-600 mt-2">
            {cart.itemCount} {cart.itemCount === 1 ? (translations.item || 'item') : (translations.items || 'items')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {translations.cartItems || 'Cart Items'}
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {cart.items.map((item) => (
                  <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-24 sm:w-24 sm:h-32 relative bg-gray-100 rounded-lg overflow-hidden">
                          {item.product.featuredImage ? (
                            <Image
                              src={item.product.featuredImage}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {item.product.category?.name}
                            </p>
                            {item.product.collection && (
                              <p className="text-gray-500 text-xs mb-3">
                                {translations.collection || 'Collection'}: {item.product.collection.name}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item._id)}
                            disabled={updating}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Size and Color */}
                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {translations.size || 'SIZE'}: {item.size}
                            </span>
                          </div>
                          {item.color && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {translations.color || 'COLOR'}
                              </span>
                              <div className="flex items-center gap-1">
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: item.color.hex }}
                                ></div>
                                <span className="text-xs text-gray-700">{item.color.name}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700">{translations.quantity || 'QUANTITY'}</span>
                            <div className="flex items-center border border-gray-200 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                disabled={updating || item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-8 text-center text-gray-900 font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                disabled={updating}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {(item.price * item.quantity).toFixed(2)} ل.س
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-500">
                                {item.price.toFixed(2)} {translations.each || 'each'} ل.س
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clear Cart Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={clearCart}
                disabled={updating}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {translations.clearShoppingBag || 'Clear Shopping Bag'}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {translations.orderSummary || 'Order Summary'}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{translations.subtotal || 'Subtotal'} ({cart.itemCount} {cart.itemCount === 1 ? (translations.item || 'item') : (translations.items || 'items')})</span>
                  <span className="font-medium"> {cart.total.toFixed(2)} ل.س </span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-base font-bold">
                    <span>{translations.total || 'Total'}</span>
                    <span className="text-lg"> {cart.total.toFixed(2)} ل.س</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Notice */}
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-amber-800">
                    <strong>{translations.cashOnDelivery || 'Cash on Delivery'}</strong> - {translations.cashOnDeliveryNotice || 'Currently we only accept cash payments'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCheckoutForm(true)}
                disabled={updating}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {translations.proceedToCheckout || 'Proceed to Checkout'}
              </button>

              <Link
                href="/products"
                className="w-full inline-flex items-center justify-center border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {translations.continueShopping || 'Continue Shopping'}
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{translations.freeShippingNotice || 'Free shipping on all orders'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{translations.easyReturnsNotice || 'Easy returns within 30 days'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Form Modal */}
      <CheckoutForm
        isOpen={showCheckoutForm}
        onClose={() => setShowCheckoutForm(false)}
        onCheckout={handleCheckout}
        cart={cart}
        updating={updating}
      />
    </div>
  );
}