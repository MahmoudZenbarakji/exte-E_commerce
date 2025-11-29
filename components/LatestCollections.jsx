
// components/LatestCollections.jsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from "@/context/LanguageContext";

const LatestCollections = () => {
  const [latestData, setLatestData] = useState({
    collections: [],
    products: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const { translations } = useLanguage();

  useEffect(() => {
    fetchLatestData();
  }, []);

  const fetchLatestData = async () => {
    try {
      setLoading(true);
      
      // Fetch latest collections, products, and categories
      const [collectionsRes, productsRes, categoriesRes] = await Promise.all([
        fetch('/api/collections?limit=2&sort=-createdAt'),
        fetch('/api/products?limit=2&sort=-createdAt'),
        fetch('/api/categories?limit=2&sort=-createdAt')
      ]);

      const collections = await collectionsRes.json();
      const products = await productsRes.json();
      const categories = await categoriesRes.json();

      setLatestData({
        collections: collections.slice(0, 2),
        products: products.slice(0, 2),
        categories: categories.slice(0, 2)
      });
    } catch (error) {
      console.error('Error fetching latest data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`space-y-4 ${i < 2 ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
                  <div className={`bg-gray-200 rounded ${i < 2 ? 'h-48' : 'h-40'}`}></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Collection Card - Large and wide
  const CollectionCard = ({ collection, index }) => (
    <Link 
      href="/products" 
      className="group block bg-white border border-gray-200 hover:border-gray-900 transition-all duration-300 lg:col-span-2"
    >
      <div className="relative overflow-hidden bg-gray-50 aspect-[16/6]">
        {collection.image ? (
          <Image
            src={collection.image}
            alt={collection.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">🏷️</div>
              <span className="text-gray-500 text-sm font-light">NO IMAGE</span>
            </div>
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-light tracking-wide text-gray-900 border border-gray-300">
            {translations.collection}
          </span>
        </div>

        {/* Featured Badge */}
        {collection.featured && (
          <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 text-xs font-light tracking-widest uppercase">
            {translations.featured}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 border border-gray-900">
              <span className="text-sm font-light tracking-wide text-gray-900 uppercase">
                {translations.exploreCollection}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <h3 className="font-light text-gray-900 text-xl tracking-wide leading-relaxed group-hover:text-gray-700 transition-colors">
              {collection.name}
            </h3>
            <p className="text-sm text-gray-600 font-light leading-relaxed line-clamp-2">
              {collection.description}
            </p>
          </div>
          <div className="text-right space-y-2">
            <div className="flex items-center space-x-2 justify-end">
              <span className="text-sm text-gray-500 font-light tracking-wide">
                {collection.season} {collection.year}
              </span>
            </div>
            <span className={`text-xs px-2 py-1 ${
              collection.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            } font-light`}>
              {collection.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Collection Stats */}
        <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-light text-gray-900">12</div>
            <div className="text-xs text-gray-500 font-light">{translations.products}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-light text-gray-900">4</div>
            <div className="text-xs text-gray-500 font-light">{translations.categories}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-light text-gray-900">{translations.season}</div>
            <div className="text-xs text-gray-500 font-light">New</div>
          </div>
        </div>
      </div>

      {/* Border Effect */}
      <div className="absolute inset-0 border border-transparent group-hover:border-gray-900 transition-all duration-500 pointer-events-none"></div>
    </Link>
  );

  // Product Card - Small and compact
  const ProductCard = ({ product, index }) => (
    <Link 
      href="/products" 
      className="group block bg-white border border-gray-200 hover:border-gray-900 transition-all duration-300"
    >
      <div className="relative overflow-hidden bg-gray-50 aspect-[4/3]">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-2xl mb-1">👕</div>
              <span className="text-gray-500 text-xs font-light">NO IMAGE</span>
            </div>
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 text-xs font-light tracking-wide text-gray-900 border border-gray-300">
            {translations.product}
          </span>
        </div>

        {/* Sale Badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 text-xs font-light tracking-widest uppercase">
            {translations.sale}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 border border-gray-900">
              <span className="text-xs font-light tracking-wide text-gray-900 uppercase">
                {translations.quickView}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-light text-gray-900 text-base tracking-wide leading-relaxed group-hover:text-gray-700 transition-colors line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-light text-gray-900">{product.price} ل.س</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xs text-gray-400 line-through font-light">
                {product.originalPrice} ل.س
              </p>
            )}
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs text-gray-500 font-light">4.8</span>
          </div>
        </div>

        {/* Color variants */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center space-x-1 pt-1">
            {product.colors.slice(0, 3).map((color, colorIndex) => (
              <div
                key={colorIndex}
                className="w-3 h-3 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-xs text-gray-400 font-light">
                +{product.colors.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Border Effect */}
      <div className="absolute inset-0 border border-transparent group-hover:border-gray-900 transition-all duration-500 pointer-events-none"></div>
    </Link>
  );

  // Category Card - Smaller size
  const CategoryCard = ({ category, index }) => (
    <Link 
      href="/products" 
      className="group block bg-white border border-gray-200 hover:border-gray-900 transition-all duration-300"
    >
      <div className="relative overflow-hidden bg-gray-50 aspect-[3/2]">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-3xl mb-2">📁</div>
              <span className="text-gray-500 text-xs font-light">NO IMAGE</span>
            </div>
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 text-xs font-light tracking-wide text-gray-900 border border-gray-300">
            {translations.category}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 border border-gray-900">
              <span className="text-xs font-light tracking-wide text-gray-900 uppercase">
                {translations.browse}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-light text-gray-900 text-base tracking-wide leading-relaxed group-hover:text-gray-700 transition-colors">
          {category.name}
        </h3>
        
        <p className="text-xs text-gray-600 font-light leading-relaxed line-clamp-2">
          {category.description || 'Explore this category'}
        </p>

        <div className="pt-1">
          <span className={`text-xs px-2 py-1 ${
            category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          } font-light`}>
            {category.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Border Effect */}
      <div className="absolute inset-0 border border-transparent group-hover:border-gray-900 transition-all duration-500 pointer-events-none"></div>
    </Link>
  );

  const ViewAllCard = () => (
    <Link 
      href="/products" 
      className="group block bg-gradient-to-br from-gray-900 to-black border border-gray-900 hover:border-gray-700 transition-all duration-300 lg:col-span-2"
    >
      <div className="relative overflow-hidden aspect-[4/3] lg:aspect-[16/6] flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="text-white text-6xl transform group-hover:scale-110 transition-transform duration-500">
            →
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-light tracking-wide text-white uppercase">
              {translations.viewAllProducts}
            </h3>
            <p className="text-gray-300 text-sm font-light max-w-md mx-auto leading-relaxed">
              {translations.viewAllDesc}
            </p>
          </div>
        </div>
        
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </div>
    </Link>
  );

  return (
    <section className="py-16 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-wider text-gray-900 uppercase mb-4">
              {translations.latestAdditions}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base font-light tracking-wide max-w-2xl">
              {translations.discoverNewest}
            </p>
          </div>
          <Link 
            href="/dashboard/collections" 
            className="hidden sm:flex border border-gray-900 px-6 py-3 text-sm font-light tracking-wide text-gray-900 uppercase hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            {translations.manageCollections}
          </Link>
        </div>

        {/* Grid Layout with Different Card Sizes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collections - Large wide cards spanning 2 columns */}
          {latestData.collections.map((collection, index) => (
            <CollectionCard key={collection._id} collection={collection} index={index} />
          ))}

          {/* Products - Small cards in single column */}
          {latestData.products.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}

          {/* Categories - Smaller cards in single column */}
          {latestData.categories.map((category, index) => (
            <CategoryCard key={category._id} category={category} index={index} />
          ))}

          {/* View All - Large wide card spanning 2 columns */}
          <ViewAllCard />
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 sm:hidden text-center">
          <Link 
            href="/dashboard/collections" 
            className="inline-block border border-gray-900 px-6 py-3 text-sm font-light tracking-wide text-gray-900 uppercase hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            {translations.manageCollections}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestCollections;