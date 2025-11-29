// app/dashboard/likes/page.js
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function LikesPage() {
  const { data: session, status } = useSession();
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentLanguage, translations } = useLanguage();
  const isRTL = currentLanguage === 'ar';

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLikedProducts();
    }
  }, [status]);

const fetchLikedProducts = async () => {
  try {
    const response = await fetch('/api/users/likes');
    if (response.ok) {
      const data = await response.json();
      // Ensure data is always an array
      setLikedProducts(Array.isArray(data) ? data : []);
    } else {
      console.error('Failed to fetch liked products');
      setLikedProducts([]);
    }
  } catch (error) {
    console.error('Error fetching liked products:', error);
    setLikedProducts([]);
  } finally {
    setLoading(false);
  }
};

  const handleUnlike = async (productId) => {
    try {
      const response = await fetch(`/api/products/${productId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liked: false })
      });

      if (response.ok) {
        setLikedProducts(likedProducts.filter(product => product._id !== productId));
      } else {
        alert(translations.removeFromLikesFailed || 'Failed to remove from likes');
      }
    } catch (error) {
      console.error('Error unliking product:', error);
      alert(translations.removeFromLikesFailed || 'Failed to remove from likes');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <div className="bg-gray-200 aspect-[3/4] mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 py-16" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-4">{translations.signInRequired || 'Sign In Required'}</h1>
          <p className="text-gray-600 mb-8">{translations.signInToViewLikes || 'Please sign in to view your liked products.'}</p>
          <Link
            href="/auth/signin"
            className="bg-gray-900 text-white px-6 py-3 text-sm font-light tracking-wide hover:bg-gray-800 transition-colors"
          >
            {translations.signIn || 'SIGN IN'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-light tracking-wide text-gray-900 mb-8">
          {translations.likedProducts || 'Liked Products'}
        </h1>

        {likedProducts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-600 mb-4">{translations.noLikedProducts || "You haven't liked any products yet."}</p>
            <p className="text-sm text-gray-500 mb-6">
              {translations.likeProductsForLater || 'Like products you love to save them for later.'}
            </p>
            <Link
              href="/products"
              className="bg-gray-900 text-white px-6 py-3 text-sm font-light tracking-wide hover:bg-gray-800 transition-colors"
            >
              {translations.browseProducts || 'BROWSE PRODUCTS'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {likedProducts.map((product) => (
              <div key={product._id} className="group relative">
                <Link href={`/products/${product._id}`}>
                  <div className="relative overflow-hidden bg-gray-100 aspect-[3/4] mb-4">
                    {product.featuredImage ? (
                      <Image
                        src={product.featuredImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm font-light">{translations.noImage || 'No Image'}</span>
                      </div>
                    )}

                    {/* Unlike Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnlike(product._id);
                      }}
                      className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg
                        className="w-4 h-4 text-red-500 fill-current"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>

                    {/* Sale Badge */}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 text-xs font-light tracking-wide">
                        {translations.sale || 'SALE'}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="space-y-2">
                  <Link href={`/products/${product._id}`}>
                    <h3 className="font-light text-gray-900 text-sm tracking-wide line-clamp-2 leading-relaxed hover:text-gray-700">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900 font-light text-sm">
                         {product.price} ل.س
                      </p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-gray-400 line-through text-sm font-light">
                          {product.originalPrice} ل.س
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Available Sizes */}
                  {product.sizes && product.sizes.some(size => size.stock > 0) && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500 font-light">{translations.sizes || 'Sizes'}:</span>
                      <div className="flex space-x-1">
                        {product.sizes
                          .filter(size => size.stock > 0)
                          .slice(0, 3)
                          .map((size, index) => (
                            <span key={index} className="text-xs text-gray-600 font-light">
                              {size.size}
                              {index < 2 && ','}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}