// app/dashboard/orders/page.js
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { currentLanguage, translations } = useLanguage();
  const isRTL = currentLanguage === 'ar';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session) {
      fetchOrders();
    }
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      
      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? updatedOrder.order : order
          )
        );
      } else {
        const error = await response.json();
        alert(error.error || translations.updateOrderStatusFailed || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(translations.updateOrderStatusFailed || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusConfig = (status) => {
    const statusConfig = {
      'pending': {
        color: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: '⏳',
        label: translations.pending || 'PENDING'
      },
      'accepted': {
        color: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: '✅',
        label: translations.accepted || 'ACCEPTED'
      },
      'rejected': {
        color: 'bg-red-50 text-red-800 border-red-200',
        icon: '❌',
        label: translations.rejected || 'REJECTED'
      },
      'shipped': {
        color: 'bg-purple-50 text-purple-800 border-purple-200',
        icon: '🚚',
        label: translations.shipped || 'SHIPPED'
      },
      'delivered': {
        color: 'bg-green-50 text-green-800 border-green-200',
        icon: '📦',
        label: translations.delivered || 'DELIVERED'
      }
    };
    return statusConfig[status] || {
      color: 'bg-gray-50 text-gray-800 border-gray-200',
      icon: '📋',
      label: status.toUpperCase()
    };
  };

  const isAdmin = session?.user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-16" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-3 py-4">
          <div className="animate-pulse">
            <div className="h-7 bg-gray-200 rounded-lg w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-col mb-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-40"></div>
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="space-y-3">
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="flex items-center space-x-3">
                        <div className="w-12 h-14 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-3 py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col">
            <div>
              <h1 className="text-2xl font-light text-gray-900 mb-1">
                {isAdmin ? (translations.allOrders || 'ALL ORDERS') : (translations.myOrders || 'MY ORDERS')}
              </h1>
              <p className="text-gray-600 font-light text-base">
                {orders.length} {orders.length === 1 ? (translations.order || 'order') : (translations.orders || 'orders')} {translations.found || 'found'}
              </p>
            </div>
            {orders.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span>{translations.liveUpdates || 'Live updates'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-light text-gray-900 mb-2 text-center">
              {isAdmin ? (translations.noOrdersFound || 'No orders found') : (translations.noOrdersYet || 'No orders yet')}
            </h3>
            <p className="text-gray-500 font-light text-center mb-6 text-sm px-4">
              {isAdmin 
                ? (translations.noOrdersAdminDesc || 'When customers place orders, they will appear here for you to manage.')
                : (translations.noOrdersDesc || 'Start shopping to see your orders here. Explore our collection and find something you love.')
              }
            </p>
            {!isAdmin && (
              <button
                onClick={() => router.push('/products')}
                className="bg-gray-900 text-white px-6 py-2.5 font-light tracking-wide rounded-lg hover:bg-gray-800 transition-all duration-200 w-full max-w-xs"
              >
                {translations.startShopping || 'START SHOPPING'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <div key={order._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="bg-gray-900 text-white p-2 rounded-lg flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-light text-gray-900 truncate">
                              {translations.order || 'Order'} #{order.orderNumber}
                            </h3>
                            <p className="text-gray-600 font-light text-sm mt-0.5">
                              {translations.placedOn || 'Placed on'} {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border ${statusConfig.color}`}>
                            <span className="text-xs">{statusConfig.icon}</span>
                            <span className="text-xs font-medium">{statusConfig.label}</span>
                          </div>
                          <p className="text-xl font-light text-gray-900">
                            {order.total.toFixed(2)} ل.س
                          </p>
                        </div>
                        
                        {isAdmin && order.user && (
                          <p className="text-gray-500 font-light text-xs">
                            {translations.customer || 'Customer'}: {order.user.firstName} {order.user.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <h4 className="font-light text-gray-900 text-base mb-3">{translations.orderItems || 'ORDER ITEMS'}</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 w-14 h-16 relative bg-white rounded border border-gray-200 overflow-hidden">
                            {item.product?.featuredImage ? (
                              <Image
                                src={item.product.featuredImage}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-light text-gray-900 text-sm line-clamp-2 mb-1">
                              {item.product?.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="bg-white px-2 py-0.5 rounded text-xs text-gray-600 border border-gray-200">
                                {translations.size || 'Size'}: {item.size}
                              </span>
                              {item.color && (
                                <span className="bg-white px-2 py-0.5 rounded text-xs text-gray-600 border border-gray-200 flex items-center space-x-1">
                                  <div
                                    className="w-2.5 h-2.5 rounded-full border border-gray-300"
                                    style={{ backgroundColor: item.color.hex }}
                                  ></div>
                                  <span>{item.color.name}</span>
                                </span>
                              )}
                              <span className="bg-white px-2 py-0.5 rounded text-xs text-gray-600 border border-gray-200">
                                {translations.quantity || 'Qty'}: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <p className="text-base font-light text-gray-900 whitespace-nowrap flex-shrink-0">
                            {(item.price * item.quantity).toFixed(2)} ل.س
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Information */}


{/* Customer Information */}
{isAdmin && order.customerInfo && (
  <div className="border-t border-gray-200">
    <div className="p-4 bg-blue-50">
      <h4 className="font-light text-gray-900 text-base mb-3 flex items-center space-x-2">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>{translations.customerInformation || 'CUSTOMER INFORMATION'}</span>
      </h4>
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-600">{translations.name || 'Name'}</p>
              <p className="font-medium text-gray-900 text-sm truncate">{order.customerInfo.fullName || translations.notProvided || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-600">{translations.phone || 'Phone'}</p>
              <p className="font-medium text-gray-900 text-sm truncate">{order.customerInfo.phoneNumber || translations.notProvided || 'Not provided'}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-600">{translations.address || 'Address'}</p>
              {/* FIXED: Now displaying address as simple string */}
              <p className="font-medium text-gray-900 text-sm whitespace-pre-wrap break-words">
                {order.customerInfo.address || translations.notProvided || 'Not provided'}
              </p>
            </div>
          </div>
          {order.customerInfo.notes && (
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600">{translations.notes || 'Notes'}</p>
                <p className="font-medium text-gray-900 text-sm">{order.customerInfo.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}


                  {/* Older Order Notice */}
                  {isAdmin && !order.customerInfo && (
                    <div className="border-t border-gray-200">
                      <div className="p-4 bg-amber-50">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <p className="text-amber-800 font-light text-xs">
                            {translations.olderOrderMessage || 'This is an older order. Customer information was not collected at the time of purchase.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="border-t border-gray-200">
                      <div className="p-4">
                        <h4 className="font-light text-gray-900 text-base mb-3">{translations.manageOrder || 'MANAGE ORDER'}</h4>
                        <div className="flex flex-col space-y-2">
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateOrderStatus(order._id, 'accepted')}
                                disabled={updating}
                                className="bg-green-600 text-white px-4 py-2.5 font-medium rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 w-full"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm">{translations.acceptOrder || 'ACCEPT ORDER'}</span>
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order._id, 'rejected')}
                                disabled={updating}
                                className="bg-red-600 text-white px-4 py-2.5 font-medium rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 w-full"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-sm">{translations.rejectOrder || 'REJECT ORDER'}</span>
                              </button>
                            </>
                          )}
                          {order.status === 'accepted' && (
                            <button
                              onClick={() => updateOrderStatus(order._id, 'shipped')}
                              disabled={updating}
                              className="bg-purple-600 text-white px-4 py-2.5 font-medium rounded-lg hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 w-full"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">{translations.markAsShipped || 'MARK AS SHIPPED'}</span>
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            <button
                              onClick={() => updateOrderStatus(order._id, 'delivered')}
                              disabled={updating}
                              className="bg-green-600 text-white px-4 py-2.5 font-medium rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 w-full"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">{translations.markAsDelivered || 'MARK AS DELIVERED'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}