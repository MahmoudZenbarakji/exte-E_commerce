'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

const ProductCard = ({ product }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const { translations } = useLanguage();

    const fallbackImage = '/images/placeholder-product.jpg';

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch(`/api/products/${product._id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ liked: !isLiked })
            });

            if (response.ok) {
                setIsLiked(!isLiked);
            } else {
                console.error('Failed to update like');
            }
        } catch (error) {
            console.error('Error updating like:', error);
        }
    };

    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // TODO: Implement quick add to cart functionality
        console.log('Quick add:', product._id);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    return (
        <div className="group relative">
            <Link href={`/products/${product._id}`}>
                <div className="relative overflow-hidden bg-gray-100 aspect-[3/4] mb-4">
                    {/* Product Image */}
                    {!imageError && product.featuredImage ? (
                        <>
                            <Image
                                src={product.featuredImage}
                                alt={product.name}
                                fill
                                className={`object-cover transition-transform duration-500 group-hover:scale-105 ${!imageLoading ? 'opacity-100' : 'opacity-0'
                                    }`}
                                onError={handleImageError}
                                onLoad={handleImageLoad}
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaUMkQ8C8YvVz4MVaUw2HLVTGpNsdagf//Z"
                            />
                            {imageLoading && (
                                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                                    <span className="text-gray-400 text-xs font-light">Loading...</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-sm font-light">No Image</span>
                        </div>
                    )}

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300">
                        <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {/* Like Button */}
                            <button
                                onClick={handleLike}
                                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                            >
                                {isLiked ? (
                                    <FaHeart className="w-4 h-4 text-red-500" />
                                ) : (
                                    <CiHeart className="w-4 h-4 text-gray-600" />
                                )}
                            </button>

                            {/* Quick Add Button */}
                            <button
                                onClick={handleQuickAdd}
                                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Sale Badge */}
                    {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 text-xs font-light tracking-wide">
                            {translations.sale}
                        </div>
                    )}

                    {/* Out of Stock Overlay */}
                    {product.sizes && product.sizes.every(size => size.stock === 0) && (
                        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                            <span className="text-gray-900 font-light tracking-wide text-sm">{translations.outOfStock}</span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                    <h3 className="font-light text-gray-900 text-sm tracking-wide line-clamp-2 leading-relaxed">
                        {product.name}
                    </h3>

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

                        {/* Rating (placeholder) */}
                        <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs text-gray-500 font-light">4.8</span>
                        </div>
                    </div>

                    {/* Color Variants */}
                    {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center space-x-1">
                            {product.colors.slice(0, 4).map((color, index) => (
                                <div
                                    key={index}
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                />
                            ))}
                            {product.colors.length > 4 && (
                                <span className="text-xs text-gray-500 font-light ml-1">
                                    +{product.colors.length - 4}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Available Sizes */}
                    {product.sizes && product.sizes.some(size => size.stock > 0) && (
                        <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500 font-light">{translations.sizes}:</span>
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
                                {product.sizes.filter(size => size.stock > 0).length > 3 && (
                                    <span className="text-xs text-gray-500 font-light">+ {translations.more}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;