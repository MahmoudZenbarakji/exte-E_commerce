// app/products/page.js
'use client';
import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import { Toaster } from 'react-hot-toast';

// ProductsPageContent component - No URL updates
function ProductsPageContent() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    subCategory: '',
    collection: '',
    priceRange: [0, 1000000],
    sizes: [],
    sort: 'newest',
    search: ''
  });
  
  const { currentLanguage, translations } = useLanguage();
  const isRTL = currentLanguage === 'ar';

  // Available filter options
  const sizeOptions = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
    '26', '28', '30', '31', '32', '33', '34',
    '36', '38', '40', '42', '44', '46',
    '48', '50', '52', '54', '56', '58', '60',
    'XXXXL', 'XXXXXL', 'XXXXXXL'
  ];
  const sortOptions = [
    { value: 'newest', label: translations.newestFirst || 'Newest First' },
    { value: 'price-low', label: translations.priceLowToHigh || 'Price: Low to High' },
    { value: 'price-high', label: translations.priceHighToLow || 'Price: High to Low' },
    { value: 'name', label: translations.nameAToZ || 'Name: A to Z' }
  ];

  // Format price with commas for better readability
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  // Fetch all products and filter options on component mount
  useEffect(() => {
    fetchAllProducts();
    fetchFilterOptions();
  }, []);

  // Apply filters whenever filters state changes
  useEffect(() => {
    applyFilters();
  }, [filters, allProducts]);

  const fetchFilterOptions = async () => {
    try {
      const [categoriesRes, subCategoriesRes, collectionsRes] = await Promise.all([
        fetch('/api/categories?activeOnly=true'),
        fetch('/api/subcategories?activeOnly=true'),
        fetch('/api/collections?activeOnly=true')
      ]);

      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (subCategoriesRes.ok) setSubCategories(await subCategoriesRes.json());
      if (collectionsRes.ok) setCollections(await collectionsRes.json());
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setAllProducts(data);
        setFilteredProducts(data);
      } else {
        console.error('Failed to fetch products');
        setAllProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

const applyFilters = useCallback(() => {
  if (allProducts.length === 0) return;

  let filtered = [...allProducts];

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    );
  }

  // Apply category filter - FIXED
  if (filters.category) {
    filtered = filtered.filter(product => {
      // Handle both string ID and object with _id
      const productCategoryId = product.category?._id || product.category;
      return productCategoryId === filters.category;
    });
  }

  // Apply subcategory filter - FIXED
  if (filters.subCategory) {
    filtered = filtered.filter(product => {
      // Handle both string ID and object with _id
      const productSubCategoryId = product.subCategory?._id || product.subCategory;
      return productSubCategoryId === filters.subCategory;
    });
  }

  // Apply collection filter - FIXED
  if (filters.collection) {
    filtered = filtered.filter(product => {
      // Handle both string ID and object with _id
      const productCollectionId = product.collection?._id || product.collection;
      return productCollectionId === filters.collection;
    });
  }

  // Apply price range filter
  filtered = filtered.filter(product => 
    product.price >= filters.priceRange[0] && 
    product.price <= filters.priceRange[1]
  );

  // Apply size filter
  if (filters.sizes.length > 0) {
    filtered = filtered.filter(product => 
      product.sizes?.some(size => filters.sizes.includes(size.size))
    );
  }

  // Apply sorting
  switch (filters.sort) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
    default:
      // Keep original order or sort by date if available
      break;
  }

  setFilteredProducts(filtered);
}, [filters, allProducts]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    updateFilters({ [key]: value });
  }, [updateFilters]);

  const handleArrayFilterChange = useCallback((key, item) => {
    setFilters(prev => {
      const currentArray = prev[key];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      
      return { ...prev, [key]: newArray };
    });
  }, []);

  const handlePriceRangeChange = useCallback((values) => {
    setFilters(prev => ({
      ...prev,
      priceRange: values
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      subCategory: '',
      collection: '',
      priceRange: [0, 1000000],
      sizes: [],
      sort: 'newest',
      search: ''
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'priceRange') return value[0] > 0 || value[1] < 1000000;
      if (Array.isArray(value)) return value.length > 0;
      return value && value !== 'newest';
    });
  }, [filters]);

  // Modern Filter Section Component
  const FilterSection = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
        {title}
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      </h3>
      {children}
    </div>
  );

  // Modern Filter Chip Component
  const FilterChip = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

  // Modern Checkbox Component
  const ModernCheckbox = ({ checked, onChange, label, value }) => (
    <label className="flex items-center space-x-3 cursor-pointer group">
      <div className={`relative w-5 h-5 border-2 rounded-md transition-all duration-200 ${
        checked 
          ? 'bg-blue-500 border-blue-500' 
          : 'bg-white border-gray-300 group-hover:border-blue-400'
      }`}>
        {checked && (
          <svg className="absolute inset-0 w-full h-full text-white" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        value={value}
        className="hidden"
      />
      <span className="text-gray-700 font-medium text-sm group-hover:text-gray-900">{label}</span>
    </label>
  );

  // Modern Radio Component
  const ModernRadio = ({ checked, onChange, label, value, name }) => (
    <label className="flex items-center space-x-3 cursor-pointer group">
      <div className={`relative w-5 h-5 border-2 rounded-full transition-all duration-200 ${
        checked 
          ? 'border-blue-500' 
          : 'border-gray-300 group-hover:border-blue-400'
      }`}>
        {checked && (
          <div className="absolute inset-1 bg-blue-500 rounded-full"></div>
        )}
      </div>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        value={value}
        className="hidden"
      />
      <span className="text-gray-700 font-medium text-sm group-hover:text-gray-900">{label}</span>
    </label>
  );

  // Price Range Slider Component
  const PriceRangeSlider = () => {
    const [localRange, setLocalRange] = useState(filters.priceRange);

    useEffect(() => {
      setLocalRange(filters.priceRange);
    }, [filters.priceRange]);

    const handleChange = (values) => {
      setLocalRange(values);
    };

    const handleCommit = (values) => {
      handlePriceRangeChange(values);
    };

    // Calculate percentage for slider styling
    const minPercentage = (localRange[0] / 1000000) * 100;
    const maxPercentage = (localRange[1] / 1000000) * 100;
    const rangeWidth = maxPercentage - minPercentage;

    return (
      <div className="space-y-6">
        {/* Price Display */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="text-xl font-bold text-gray-900">{formatPrice(localRange[0])} ل.س</span>
            <div className="text-xs text-gray-500 mt-1">Minimum</div>
          </div>
          <div className="w-4 h-0.5 bg-gray-300 mx-4"></div>
          <div className="text-right">
            <span className="text-xl font-bold text-gray-900">{formatPrice(localRange[1])} ل.س</span>
            <div className="text-xs text-gray-500 mt-1">Maximum</div>
          </div>
        </div>

        {/* Manual Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
            <div className="relative">
              <input
                type="number"
                value={localRange[0]}
                onChange={(e) => handleChange([parseInt(e.target.value) || 0, localRange[1]])}
                onBlur={() => handleCommit([localRange[0], localRange[1]])}
                className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="1000000"
                step="1000"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">ل.س</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
            <div className="relative">
              <input
                type="number"
                value={localRange[1]}
                onChange={(e) => handleChange([localRange[0], parseInt(e.target.value) || 0])}
                onBlur={() => handleCommit([localRange[0], localRange[1]])}
                className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="1000000"
                step="1000"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">ل.س</span>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="relative py-6">
          <div className="absolute h-2 bg-gray-200 rounded-full w-full"></div>
          <div 
            className="absolute h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
            style={{
              left: `${minPercentage}%`,
              width: `${rangeWidth}%`
            }}
          ></div>
          
          {/* Min Thumb */}
          <input
            type="range"
            min="0"
            max="1000000"
            step="10000"
            value={localRange[0]}
            onChange={(e) => handleChange([parseInt(e.target.value), localRange[1]])}
            onMouseUp={() => handleCommit([localRange[0], localRange[1]])}
            onTouchEnd={() => handleCommit([localRange[0], localRange[1]])}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
          />
          
          {/* Max Thumb */}
          <input
            type="range"
            min="0"
            max="1000000"
            step="10000"
            value={localRange[1]}
            onChange={(e) => handleChange([localRange[0], parseInt(e.target.value)])}
            onMouseUp={() => handleCommit([localRange[0], localRange[1]])}
            onTouchEnd={() => handleCommit([localRange[0], localRange[1]])}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
          />
        </div>

        {/* Price Labels */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>0 ل.س</span>
          <span>250,000 ل.س</span>
          <span>500,000 ل.س</span>
          <span>750,000 ل.س</span>
          <span>1,000,000 ل.س</span>
        </div>

        {/* Quick Price Presets */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={() => handleCommit([0, 250000])}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Under 250K
          </button>
          <button
            onClick={() => handleCommit([250000, 500000])}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            250K - 500K
          </button>
          <button
            onClick={() => handleCommit([500000, 750000])}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            500K - 750K
          </button>
          <button
            onClick={() => handleCommit([750000, 1000000])}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            750K - 1M
          </button>
        </div>
      </div>
    );
  };

  // Mobile Filter Drawer Component
  const MobileFiltersDrawer = () => (
    <div className="lg:hidden">
      {showMobileFilters && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={() => setShowMobileFilters(false)}
        />
      )}
      
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
        showMobileFilters ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              <p className="text-sm text-gray-600 mt-1">Refine your search</p>
            </div>
            <div className="flex items-center space-x-4">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-1 rounded-full bg-white border border-blue-200"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Search */}
            <FilterSection title="Search">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </FilterSection>

            {/* Categories */}
            <FilterSection title="Categories">
              <div className="space-y-3">
                <ModernRadio
                  name="category"
                  value=""
                  checked={filters.category === ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  label="All Categories"
                />
                {categories.map(category => (
                  <ModernRadio
                    key={category._id}
                    name="category"
                    value={category._id}
                    checked={filters.category === category._id}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label={category.name}
                  />
                ))}
              </div>
            </FilterSection>

            {/* SubCategories */}
            {filters.category && (
              <FilterSection title="Subcategories">
                <div className="space-y-3">
                  <ModernRadio
                    name="subCategory"
                    value=""
                    checked={filters.subCategory === ''}
                    onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                    label="All Subcategories"
                  />
                  {subCategories
                    .filter(sub => sub.category === filters.category)
                    .map(subCategory => (
                      <ModernRadio
                        key={subCategory._id}
                        name="subCategory"
                        value={subCategory._id}
                        checked={filters.subCategory === subCategory._id}
                        onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                        label={subCategory.name}
                      />
                    ))}
                </div>
              </FilterSection>
            )}

            {/* Collections */}
            <FilterSection title="Collections">
              <div className="space-y-3">
                <ModernRadio
                  name="collection"
                  value=""
                  checked={filters.collection === ''}
                  onChange={(e) => handleFilterChange('collection', e.target.value)}
                  label="All Collections"
                />
                {collections.map(collection => (
                  <ModernRadio
                    key={collection._id}
                    name="collection"
                    value={collection._id}
                    checked={filters.collection === collection._id}
                    onChange={(e) => handleFilterChange('collection', e.target.value)}
                    label={collection.name}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range">
              <PriceRangeSlider />
            </FilterSection>

            {/* Sizes */}
            <FilterSection title="Sizes">
              <div className="grid grid-cols-3 gap-3">
                {sizeOptions.map(size => (
                  <ModernCheckbox
                    key={size}
                    value={size}
                    checked={filters.sizes.includes(size)}
                    onChange={() => handleArrayFilterChange('sizes', size)}
                    label={size}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Sort */}
            <FilterSection title="Sort By">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FilterSection>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-white">
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              Show Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  {translations.products || 'Our Collection'}
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  {translations.discoverCollection || 'Discover our curated collection of premium clothing and accessories'}
                </p>
              </div>
              
              {/* Search and Actions */}
              <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none lg:w-80">
                  <input
                    type="text"
                    placeholder={translations.searchProducts || 'Search products...'}
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <div className="flex gap-3">
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm font-medium min-w-[160px]"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>Filters</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Bar */}
            {hasActiveFilters && (
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Active filters:</span>
                </div>
                {filters.category && (
                  <FilterChip
                    active={true}
                    onClick={() => handleFilterChange('category', '')}
                  >
                    Category: {categories.find(c => c._id === filters.category)?.name}
                  </FilterChip>
                )}
                {filters.subCategory && (
                  <FilterChip
                    active={true}
                    onClick={() => handleFilterChange('subCategory', '')}
                  >
                    Subcategory: {subCategories.find(s => s._id === filters.subCategory)?.name}
                  </FilterChip>
                )}
                {filters.collection && (
                  <FilterChip
                    active={true}
                    onClick={() => handleFilterChange('collection', '')}
                  >
                    Collection: {collections.find(c => c._id === filters.collection)?.name}
                  </FilterChip>
                )}
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) && (
                  <FilterChip
                    active={true}
                    onClick={() => handleFilterChange('priceRange', [0, 1000000])}
                  >
                    Price: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])} ل.س
                  </FilterChip>
                )}
                {filters.sizes.map(size => (
                  <FilterChip
                    key={size}
                    active={true}
                    onClick={() => handleArrayFilterChange('sizes', size)}
                  >
                    Size: {size}
                  </FilterChip>
                ))}
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block lg:w-80 flex-shrink-0">
              <div className="space-y-6 sticky top-32">
                {/* Filter Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">Filters</h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600">Refine your product selection</p>
                </div>

                {/* Categories */}
                <FilterSection title="Categories">
                  <div className="space-y-3">
                    <ModernRadio
                      name="category"
                      value=""
                      checked={filters.category === ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      label="All Categories"
                    />
                    {categories.map(category => (
                      <ModernRadio
                        key={category._id}
                        name="category"
                        value={category._id}
                        checked={filters.category === category._id}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        label={category.name}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* SubCategories */}
                {filters.category && (
                  <FilterSection title="Subcategories">
                    <div className="space-y-3">
                      <ModernRadio
                        name="subCategory"
                        value=""
                        checked={filters.subCategory === ''}
                        onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                        label="All Subcategories"
                      />
                      {subCategories
                        .filter(sub => sub.category === filters.category)
                        .map(subCategory => (
                          <ModernRadio
                            key={subCategory._id}
                            name="subCategory"
                            value={subCategory._id}
                            checked={filters.subCategory === subCategory._id}
                            onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                            label={subCategory.name}
                          />
                        ))}
                    </div>
                  </FilterSection>
                )}

                {/* Collections */}
                <FilterSection title="Collections">
                  <div className="space-y-3">
                    <ModernRadio
                      name="collection"
                      value=""
                      checked={filters.collection === ''}
                      onChange={(e) => handleFilterChange('collection', e.target.value)}
                      label="All Collections"
                    />
                    {collections.map(collection => (
                      <ModernRadio
                        key={collection._id}
                        name="collection"
                        value={collection._id}
                        checked={filters.collection === collection._id}
                        onChange={(e) => handleFilterChange('collection', e.target.value)}
                        label={collection.name}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* Price Range */}
                <FilterSection title="Price Range">
                  <PriceRangeSlider />
                </FilterSection>

                {/* Sizes */}
                <FilterSection title="Sizes">
                  <div className="grid grid-cols-3 gap-3">
                    {sizeOptions.map(size => (
                      <ModernCheckbox
                        key={size}
                        value={size}
                        checked={filters.sizes.includes(size)}
                        onChange={() => handleArrayFilterChange('sizes', size)}
                        label={size}
                      />
                    ))}
                  </div>
                </FilterSection>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Results Count */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                  </h2>
                  {hasActiveFilters && (
                    <p className="text-gray-600 mt-1">Based on your filters</p>
                  )}
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 aspect-[3/4] rounded-2xl mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredProducts.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    We couldnt find any products matching your criteria. Try adjusting your filters or search terms.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        <MobileFiltersDrawer />
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="hidden lg:block lg:w-80 flex-shrink-0">
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-[3/4] rounded-2xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
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
          theme: {
            primary: 'green',
            secondary: 'black',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
      }}
    />
    </div>
  );
}

// Main page component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsPageContent />
    </Suspense>
  );
}