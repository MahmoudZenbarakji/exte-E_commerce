// app/products/[id]/page.js
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useLanguage } from '@/context/LanguageContext';

import toast, { Toaster } from 'react-hot-toast'; // Add Toaster import


export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userCanReview, setUserCanReview] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
      fetchReviews();
      checkUserCanReview();
      checkIfLiked();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productRes = await fetch(`/api/products/${params.id}`);

      if (productRes.ok) {
        const productData = await productRes.json();
        setProduct(productData);
        setLikesCount(productData.likes || 0);

        // Set default selections
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0].size);
        }
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0].name);
        }

        // Fetch related products only if category exists
        if (productData.category && productData.category._id) {
          const relatedRes = await fetch(`/api/products?category=${productData.category._id}&limit=4`);
          if (relatedRes.ok) {
            setRelatedProducts(await relatedRes.json());
          }
        } else {
          setRelatedProducts([]);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async () => {
    try {
      const response = await fetch('/api/users/likes');
      if (response.ok) {
        const likedProducts = await response.json();
        // Ensure we're comparing strings and handle case where likedProducts is null/undefined
        const liked = Array.isArray(likedProducts) &&
          likedProducts.some(likedProduct =>
            likedProduct && likedProduct._id === params.id
          );
        setIsLiked(liked);
      } else {
        console.error('Failed to fetch liked products');
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
      setIsLiked(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liked: !isLiked })
      });

      if (response.ok) {
        const result = await response.json();
        setIsLiked(!isLiked);
        setLikesCount(result.likes);
      } else {
        console.error('Failed to update like');
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };


const handleAddToCart = async () => {
  if (!selectedSize) {
    toast.error(t('pleaseSelectSize'));
    return;
  }

  try {
    // Get the selected size stock
    const selectedSizeData = product.sizes?.find(size => size.size === selectedSize);
    const availableStock = selectedSizeData?.stock || 0;

    // Check if requested quantity exceeds available stock
    if (quantity > availableStock) {
      toast.error(t('onlyItemsAvailable', { 
        availableStock, 
        selectedSize 
      }));
      return;
    }

    console.log('Sending to cart:', {
      productId: product._id,
      size: selectedSize,
      color: product.colors?.find(color => color.name === selectedColor),
      quantity: quantity
    });

    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: product._id,
        size: selectedSize,
        color: product.colors?.find(color => color.name === selectedColor),
        quantity: quantity
      }),
    });

    const result = await response.json();
    console.log('Cart response:', { status: response.status, result });

    if (response.ok) {
      toast.success(t('productAddedToCart'));
      if (window.mutateCart) {
        window.mutateCart();
      }
    } else if (response.status === 401) {
      router.push(`/auth/signin?returnUrl=${encodeURIComponent(window.location.pathname)}`);
    } else {
      // Handle stock validation errors from API
      if (result.error?.includes('stock') || result.error?.includes('available')) {
        toast.error(result.error);
      } else {
        toast.error(t('failedToAddToCart'));
      }
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    toast.error(t('failedToAddToCartTryAgain'));
  }
};

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${params.id}`);
      if (response.ok) {
        setReviews(await response.json());
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews.length) return { average: 0, count: 0 };

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = total / reviews.length;

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal
      count: reviews.length
    };
  };

  // Then update the rating display in the product header:
  const ratingData = calculateAverageRating(reviews);

  const checkUserCanReview = async () => {
    try {
      const response = await fetch('/api/reviews/eligible-products');
      if (response.ok) {
        const eligibleProducts = await response.json();
        const canReview = eligibleProducts.some(item => item.product._id === params.id);
        setUserCanReview(canReview);
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <Navbar />
        <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="space-y-4">
                <div className="bg-gray-200 aspect-square rounded"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-200 aspect-square rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white py-16">
        <Navbar />
        <div className="pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-light tracking-wide text-gray-900 mb-4">{t('productNotFound')}</h1>
            <Link
              href="/products"
              className="border border-gray-900 px-6 py-3 text-sm font-light tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200"
            >
              {t('backToProducts')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const availableSizes = product.sizes?.filter(size => size.stock > 0) || [];
  const selectedColorData = product.colors?.find(color => color.name === selectedColor);
  const images = selectedColorData?.images || [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Add top padding to push content below navbar */}
      <div className="pt-24">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex space-x-2 text-sm font-light text-gray-600">
              <Link href="/" className="hover:text-gray-900">{t('home')}</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-gray-900">{t('products')}</Link>
              <span>/</span>
              <span className="text-gray-900">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Product Images */}
            <div>
              {/* Main Image */}
{/* Main Image */}
<div className="bg-gray-100 mb-4 w-full h-[800px] relative overflow-hidden">
  {images && images[activeImage] ? (
    <Image
      src={images[activeImage]}
      alt={product.name}
      className="object-cover w-full h-full"
      width={1200}
      height={1200}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-gray-400 font-light">{t('noImageAvailable')}</span>
    </div>
  )}
</div>


              {/* Image Thumbnails */}
              {images && images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`relative bg-gray-100 aspect-square border-2 ${activeImage === index ? 'border-gray-900' : 'border-transparent'
                        }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-light tracking-wide text-gray-900 mb-2">
                  {product.name}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                  <p className="text-xl lg:text-2xl font-light text-gray-900">
                     {product.price} ل.س
                  </p>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <p className="text-lg text-gray-400 line-through font-light">
                         {product.originalPrice} ل.س
                      </p>
                      <span className="bg-red-500 text-white px-2 py-1 text-xs font-light tracking-wide w-fit">
                        {t('save')}  {product.originalPrice - product.price} ل.س
                      </span>
                    </>
                  )}
                </div>

                {/* Rating and Likes */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(ratingData.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-light">
                      {ratingData.average > 0 ? `${ratingData.average} (${ratingData.count} ${ratingData.count === 1 ? t('review') : t('reviews')})` : t('noReviewsYet')}
                    </span>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={handleLike}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-500 transition-colors w-fit"
                  >
                    {isLiked ? (
                      <FaHeart className="w-5 h-5 text-red-500" />
                    ) : (
                      <CiHeart className="w-5 h-5" />
                    )}
                    <span>{likesCount} {t('likes')}</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-light text-gray-700 mb-2 tracking-wide">{t('description')}</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-light text-gray-700 mb-3 tracking-wide">{t('color')}</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-10 h-10 rounded-full border-2 ${selectedColor === color.name ? 'border-gray-900' : 'border-gray-300'
                          }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 font-light mt-2">{selectedColor}</p>
                </div>
              )}

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-light text-gray-700 tracking-wide">{t('size')}</h3>
                    <button className="text-sm font-light text-gray-600 hover:text-gray-900">
                      {t('sizeGuide')}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size.size}
                        onClick={() => setSelectedSize(size.size)}
                        className={`py-3 text-center border text-sm font-light tracking-wide transition-colors ${selectedSize === size.size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-900 hover:border-gray-900'
                          }`}
                      >
                        {size.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="w-full sm:w-auto">
                    <label className="text-sm font-light text-gray-700 mb-2 block tracking-wide">{t('quantity')}</label>
                    <div className="flex border border-gray-300 w-full sm:w-32">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 font-light flex-1"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 text-gray-900 font-light flex-1 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 font-light flex-1"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-light text-gray-700 mb-2 block tracking-wide invisible">
                      {t('addToCart')}
                    </label>
                    <button
                      onClick={handleAddToCart}
                      disabled={availableSizes.length === 0}
                      className="w-full bg-gray-900 text-white py-3 text-sm font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {availableSizes.length === 0 ? t('outOfStock') : t('addToCart')}
                    </button>
                  </div>
                </div>

                {/* Secondary Actions */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex-1 border py-3 text-sm font-light tracking-wide transition-colors duration-200 flex items-center justify-center space-x-2 ${isLiked
                      ? 'border-red-500 text-red-500 bg-red-50 hover:bg-red-100'
                      : 'border-gray-300 text-gray-900 hover:border-gray-900'
                      }`}
                  >
                    {isLiked ? (
                      <>
                        <FaHeart className="w-5 h-5 text-red-500" />
                        <span>{t('liked')}</span>
                      </>
                    ) : (
                      <>
                        <CiHeart className="w-5 h-5" />
                        <span>{t('like')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-light text-gray-600">{t('sku')}</span>
                    <span className="font-light text-gray-900">{product.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-light text-gray-600">{t('category')}</span>
                    <span className="font-light text-gray-900">{product.category?.name}</span>
                  </div>
                  {product.subCategory && (
                    <div className="flex justify-between">
                      <span className="font-light text-gray-600">{t('subcategory')}</span>
                      <span className="font-light text-gray-900">{product.subCategory?.name}</span>
                    </div>
                  )}
                  {product.collection && (
                    <div className="flex justify-between">
                      <span className="font-light text-gray-600">{t('collection')}</span>
                      <span className="font-light text-gray-900">{product.collection?.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 lg:mt-16 border-t border-gray-200 pt-12 lg:pt-16">
              <h2 className="text-xl lg:text-2xl font-light tracking-wide text-gray-900 mb-6 lg:mb-8">{t('youMightAlsoLike')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {relatedProducts.slice(0, 4).map((relatedProduct) => (
                  <div key={relatedProduct._id} className="group">
                    <Link href={`/products/${relatedProduct._id}`}>
                      <div className="relative bg-gray-100 aspect-[3/4] mb-3 lg:mb-4">
                        {relatedProduct.featuredImage && (
                          <Image
                            src={relatedProduct.featuredImage}
                            alt={relatedProduct.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-light text-gray-900 text-sm tracking-wide mb-1 line-clamp-1">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-gray-600 font-light text-sm">
                           {relatedProduct.price} ل.س
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Reviews Section */}
        <div className="mt-12 lg:mt-16 border-t border-gray-200 pt-12 lg:pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 gap-4">
              <h2 className="text-xl lg:text-2xl font-light tracking-wide text-gray-900">
                {t('customerReviews')} ({reviews.length})
              </h2>
              
              {/* Overall Rating Summary */}
              {ratingData.average > 0 && (
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-light text-gray-900">{ratingData.average}</div>
                  <div className="flex justify-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(ratingData.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 font-light">
                    {ratingData.count} {ratingData.count === 1 ? t('review') : t('reviews')}
                  </div>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-gray-600 font-light mb-2">{t('noReviewsYet')}</p>
                <p className="text-sm text-gray-500 mb-6">{t('beFirstToReview')}</p>
                {userCanReview && (
                  <Link
                    href="/dashboard/reviews"
                    className="bg-gray-900 text-white px-6 py-3 text-sm font-light tracking-wide hover:bg-gray-800 transition-colors inline-block"
                  >
                    {t('writeReview')}
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6 lg:space-y-8">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-sm transition-shadow">
                    {/* Review Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4 gap-4">
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          {/* User Avatar */}
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-600 text-sm font-light">
                              {review.user.firstName?.[0]}{review.user.lastName?.[0]}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-light text-gray-900 text-lg">
                              {review.title || `${t('reviewBy')} ${review.user.firstName}`}
                            </h4>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-1">
                              {/* Star Rating */}
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                ))}
                              </div>
                              
                              {/* Verified Badge */}
                              {review.isVerified && (
                                <span className="flex items-center space-x-1 text-green-600 text-xs">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span>{t('verifiedPurchase')}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Review Date */}
                      <div className="text-right">
                        <span className="text-sm text-gray-500 font-light">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Review Comment */}
                    {review.comment && (
                      <div className="mb-4">
                        <p className="text-gray-600 font-light leading-relaxed text-sm">
                          {review.comment}
                        </p>
                      </div>
                    )}

                    {/* Review Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-100 gap-2">
                      <span className="text-sm text-gray-500 font-light">
                        {t('by')} {review.user.firstName} {review.user.lastName}
                      </span>
                      
                      {/* Helpful Button */}
                      <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>{t('helpful')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Write Review CTA */}
            {userCanReview && reviews.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  href="/dashboard/reviews"
                  className="bg-gray-900 text-white px-6 py-3 text-sm font-light tracking-wide hover:bg-gray-800 transition-colors inline-block"
                >
                  {t('writeReview')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}