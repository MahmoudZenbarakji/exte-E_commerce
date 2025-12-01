// app/dashboard/collections/page.js
'use client';
import { useState, useEffect } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { currentLanguage, translations } = useLanguage();
  const isRTL = currentLanguage === 'ar';

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    hasDiscount: false, 
    category: '',
    subCategory: '',
    collection: '',
    sizes: [],
    colors: [],
    tags: '',
    isFeatured: false,
    isActive: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true
  });

  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    description: '',
    category: '',
    image: '',
    isActive: true
  });

  const [collectionForm, setCollectionForm] = useState({
    name: '',
    description: '',
    image: '',
    season: 'All Season',
    year: new Date().getFullYear(),
    featured: false,
    isActive: true
  });

  // Edit states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [editingCollection, setEditingCollection] = useState(null);

  // Size and color management
  const [currentSize, setCurrentSize] = useState({ size: '', stock: 0 });
  const [currentColor, setCurrentColor] = useState({ name: '', hex: '#000000', images: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, subCategoriesRes, collectionsRes] = await Promise.all([
        fetch('/api/products?activeOnly=false'),
        fetch('/api/categories?activeOnly=false'),
        fetch('/api/subcategories?activeOnly=false'),
        fetch('/api/collections?activeOnly=false')
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (subCategoriesRes.ok) setSubCategories(await subCategoriesRes.json());
      if (collectionsRes.ok) setCollections(await collectionsRes.json());
    } catch (error) {
      setMessage({ type: 'error', text: translations.fetchDataFailed || 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  // Reset forms
  const resetProductForm = () => {
    setProductForm({
      name: '', description: '', price: '', originalPrice: '', hasDiscount: false,
      category: '', subCategory: '', collection: '', sizes: [], colors: [], 
      tags: '', isFeatured: false, isActive: true
    });
    setEditingProduct(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '', image: '', isActive: true });
    setEditingCategory(null);
  };

  const resetSubCategoryForm = () => {
    setSubCategoryForm({ name: '', description: '', category: '', image: '', isActive: true });
    setEditingSubCategory(null);
  };

  const resetCollectionForm = () => {
    setCollectionForm({ 
      name: '', description: '', image: '', season: 'All Season',
      year: new Date().getFullYear(), featured: false, isActive: true 
    });
    setEditingCollection(null);
  };

  // Product Management
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if there are colors with images
    const hasColorImages = productForm.colors.some(color => color.images && color.images.length > 0);
    if (!hasColorImages) {
      setMessage({ type: 'error', text: translations.colorImagesRequired || 'At least one color must have images' });
      setLoading(false);
      return;
    }

    if (!productForm.category) {
      setMessage({ type: 'error', text: translations.categoryRequired || 'Category is required' });
      setLoading(false);
      return;
    }

    try {
      const productData = {
        ...productForm,
        subCategory: productForm.subCategory || undefined,
        collection: productForm.collection || undefined,
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        price: parseFloat(productForm.price),
        originalPrice: productForm.hasDiscount && productForm.originalPrice ? 
          parseFloat(productForm.originalPrice) : undefined,
        // Set featuredImage to the first image of the first color
        featuredImage: productForm.colors[0]?.images?.[0] || ''
      };

      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: editingProduct ? (translations.productUpdated || 'Product updated successfully!') : (translations.productCreated || 'Product created successfully!') });
        resetProductForm();
        fetchData();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || (editingProduct ? (translations.updateProductFailed || 'Failed to update product') : (translations.createProductFailed || 'Failed to create product')) });
      }
    } catch (error) {
      setMessage({ type: 'error', text: translations.networkError || 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // Category Management
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: editingCategory ? (translations.categoryUpdated || 'Category updated successfully!') : (translations.categoryCreated || 'Category created successfully!') });
        resetCategoryForm();
        fetchData();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || (editingCategory ? (translations.updateCategoryFailed || 'Failed to update category') : (translations.createCategoryFailed || 'Failed to create category')) });
      }
    } catch (error) {
      setMessage({ type: 'error', text: translations.networkError || 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // SubCategory Management
  const handleSubCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingSubCategory ? `/api/subcategories/${editingSubCategory._id}` : '/api/subcategories';
      const method = editingSubCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subCategoryForm)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: editingSubCategory ? (translations.subCategoryUpdated || 'SubCategory updated successfully!') : (translations.subCategoryCreated || 'SubCategory created successfully!') });
        resetSubCategoryForm();
        fetchData();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || (editingSubCategory ? (translations.updateSubCategoryFailed || 'Failed to update subcategory') : (translations.createSubCategoryFailed || 'Failed to create subcategory')) });
      }
    } catch (error) {
      setMessage({ type: 'error', text: translations.networkError || 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // Collection Management
  const handleCollectionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingCollection ? `/api/collections/${editingCollection._id}` : '/api/collections';
      const method = editingCollection ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionForm)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: editingCollection ? (translations.collectionUpdated || 'Collection updated successfully!') : (translations.collectionCreated || 'Collection created successfully!') });
        resetCollectionForm();
        fetchData();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || (editingCollection ? (translations.updateCollectionFailed || 'Failed to update collection') : (translations.createCollectionFailed || 'Failed to create collection')) });
      }
    } catch (error) {
      setMessage({ type: 'error', text: translations.networkError || 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // Edit functions
  const editProduct = (product) => {
    const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
    
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      hasDiscount: hasDiscount,
      category: product.category?._id || product.category,
      subCategory: product.subCategory?._id || product.subCategory,
      collection: product.collection?._id || product.collection,
      sizes: product.sizes || [],
      colors: product.colors || [],
      tags: product.tags?.join(', ') || '',
      isFeatured: product.isFeatured || false,
      isActive: product.isActive
    });
    setEditingProduct(product);
  };

  const editCategory = (category) => {
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      isActive: category.isActive
    });
    setEditingCategory(category);
  };

  const editSubCategory = (subCategory) => {
    setSubCategoryForm({
      name: subCategory.name,
      description: subCategory.description || '',
      category: subCategory.category?._id || subCategory.category,
      image: subCategory.image || '',
      isActive: subCategory.isActive
    });
    setEditingSubCategory(subCategory);
  };

  const editCollection = (collection) => {
    setCollectionForm({
      name: collection.name,
      description: collection.description || '',
      image: collection.image || '',
      season: collection.season || 'All Season',
      year: collection.year || new Date().getFullYear(),
      featured: collection.featured || false,
      isActive: collection.isActive
    });
    setEditingCollection(collection);
  };

  // Delete functions
  const deleteProduct = async (productId) => {
    if (!confirm(translations.confirmDeleteProduct || 'Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: translations.productDeleted || 'Product deleted successfully!' });
        fetchData();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || translations.deleteProductFailed || 'Failed to delete product' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: translations.networkError || 'Network error occurred' });
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!confirm(translations.confirmDeleteCategory || 'Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: translations.categoryDeleted || 'Category deleted successfully!' });
        fetchData();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || translations.deleteCategoryFailed || 'Failed to delete category' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: translations.networkError || 'Network error occurred' });
    }
  };

  const deleteSubCategory = async (subCategoryId) => {
    if (!confirm(translations.confirmDeleteSubCategory || 'Are you sure you want to delete this subcategory?')) return;

    try {
      const response = await fetch(`/api/subcategories/${subCategoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: translations.subCategoryDeleted || 'SubCategory deleted successfully!' });
        fetchData();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || translations.deleteSubCategoryFailed || 'Failed to delete subcategory' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: translations.networkError || 'Network error occurred' });
    }
  };

  const deleteCollection = async (collectionId) => {
    if (!confirm(translations.confirmDeleteCollection || 'Are you sure you want to delete this collection?')) return;

    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: translations.collectionDeleted || 'Collection deleted successfully!' });
        fetchData();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || translations.deleteCollectionFailed || 'Failed to delete collection' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: translations.networkError || 'Network error occurred' });
    }
  };

  // Helper functions for sizes and colors
  const addSize = () => {
    if (currentSize.size && currentSize.stock >= 0) {
      setProductForm(prev => ({
        ...prev,
        sizes: [...prev.sizes, { ...currentSize }]
      }));
      setCurrentSize({ size: '', stock: 0 });
    }
  };

  const removeSize = (index) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const addColor = () => {
    if (currentColor.name && currentColor.hex && currentColor.images.length > 0) {
      setProductForm(prev => ({
        ...prev,
        colors: [...prev.colors, { ...currentColor }]
      }));
      setCurrentColor({ name: '', hex: '#000000', images: [] });
    } else {
      setMessage({ type: 'error', text: translations.colorImagesRequired || 'Please add at least one image for the color' });
    }
  };

  const removeColor = (index) => {
    setProductForm(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (result, type) => {
    if (result.event === 'success') {
      const imageUrl = result.info.secure_url;

      switch (type) {
        case 'category':
          setCategoryForm(prev => ({ ...prev, image: imageUrl }));
          break;
        case 'subcategory':
          setSubCategoryForm(prev => ({ ...prev, image: imageUrl }));
          break;
        case 'collection':
          setCollectionForm(prev => ({ ...prev, image: imageUrl }));
          break;
        case 'color':
          setCurrentColor(prev => ({ ...prev, images: [...prev.images, imageUrl] }));
          break;
      }

      setMessage({ type: 'success', text: translations.imageUploaded || 'Image uploaded successfully!' });
    }
  };

  const removeColorImage = (colorIndex, imageIndex) => {
    setProductForm(prev => {
      const updatedColors = [...prev.colors];
      updatedColors[colorIndex] = {
        ...updatedColors[colorIndex],
        images: updatedColors[colorIndex].images.filter((_, i) => i !== imageIndex)
      };
      return { ...prev, colors: updatedColors };
    });
  };

  const removeCurrentColorImage = (index) => {
    setCurrentColor(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Helper function for subcategory category ID
  const getSubCategoryCategoryId = (subCategory) => {
    return subCategory.category?._id || subCategory.category;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4 sm:py-8" >
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-light tracking-wider text-gray-900 uppercase">
          {translations.productManagement || 'Product Management'}
        </h1>
        <p className="text-gray-600 mt-2 font-light text-sm sm:text-base">
          {translations.manageProductsCategories || 'Manage products, categories, subcategories, and collections'}
        </p>
      </div>

      {/* Tab Navigation - Horizontal scroll on mobile */}
      <div className="border-b border-gray-200 mb-6 sm:mb-8">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto pb-2 -mb-px">
          {['products', 'categories', 'subcategories', 'collections'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-light text-xs sm:text-sm tracking-wide transition-colors duration-200 whitespace-nowrap ${activeTab === tab
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </nav>
      </div>

      {message.text && (
        <div className={`mb-6 sm:mb-8 p-4 border-l-4 ${message.type === 'success'
          ? 'bg-green-50 text-green-800 border-green-400'
          : 'bg-red-50 text-red-800 border-red-400'
          }`}>
          <span className="font-medium text-sm sm:text-base">{message.text}</span>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Product Form */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900">
                {editingProduct ? (translations.editProduct || 'EDIT PRODUCT') : (translations.addNewProduct || 'ADD NEW PRODUCT')}
              </h2>
              {editingProduct && (
                <button
                  onClick={resetProductForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-light text-sm hover:bg-gray-50 transition-colors"
                >
                  {translations.cancel || 'CANCEL'}
                </button>
              )}
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.productName || 'PRODUCT NAME'}
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.description || 'DESCRIPTION'}
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  required
                />
              </div>

              {/* Price Section - Updated with Discount Checkbox */}
              <div className="space-y-4 sm:space-y-6">
                {/* Discount Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasDiscount"
                    checked={productForm.hasDiscount}
                    onChange={(e) => setProductForm(prev => ({ 
                      ...prev, 
                      hasDiscount: e.target.checked,
                      originalPrice: e.target.checked ? prev.originalPrice : ''
                    }))}
                    className="w-4 h-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                  <label htmlFor="hasDiscount" className="text-xs sm:text-sm font-light text-gray-700">
                    {translations.hasDiscount || 'DOES IT HAVE A DISCOUNT?'}
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                      {productForm.hasDiscount ? (translations.discountPrice || 'PRICE AFTER DISCOUNT') : (translations.price || 'PRICE')} (ل.س)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                      required
                    />
                  </div>

                  {/* Original Price - Only show when hasDiscount is true */}
                  {productForm.hasDiscount && (
                    <div>
                      <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                        {translations.originalPrice || 'ORIGINAL PRICE'} (ل.س)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                        required={productForm.hasDiscount}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                    {translations.category || 'CATEGORY'}
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value, subCategory: '' }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                    required
                  >
                    <option value="">{translations.selectCategory || 'Select Category'}</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                    {translations.subcategory || 'SUBCATEGORY'}
                  </label>
                  <select
                    value={productForm.subCategory}
                    onChange={(e) => setProductForm(prev => ({ ...prev, subCategory: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  >
                    <option value="">{translations.selectSubcategory || 'Select Subcategory'}</option>
                    {subCategories
                      .filter(sub => getSubCategoryCategoryId(sub) === productForm.category)
                      .map(sub => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.collection || 'COLLECTION'}
                </label>
                <select
                  value={productForm.collection}
                  onChange={(e) => setProductForm(prev => ({ ...prev, collection: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                >
                  <option value="">{translations.selectCollection || 'Select Collection'}</option>
                  {collections.map(col => (
                    <option key={col._id} value={col._id}>{col.name}</option>
                  ))}
                </select>
              </div>

              {/* Sizes Management */}
              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.sizesStock || 'SIZES & STOCK'}
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
                  <select
                    value={currentSize.size}
                    onChange={(e) => setCurrentSize(prev => ({ ...prev, size: e.target.value }))}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  >
                    <option value="">{translations.selectSize || 'Select Size'}</option>
                    {[
                      'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
                      '26', '28', '30', '31', '32', '33', '34',
                      '36', '38', '40', '42', '44', '46',
                      '48', '50', '52', '54', '56', '58', '60',
                      'XXXXL', 'XXXXXL', 'XXXXXXL'
                    ].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder={translations.stock || 'Stock'}
                    value={currentSize.stock}
                    onChange={(e) => setCurrentSize(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    className="w-full sm:w-24 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-4 py-2 sm:py-3 border border-gray-900 bg-white text-gray-900 font-light text-xs sm:text-sm tracking-wide hover:bg-gray-900 hover:text-white transition-colors duration-200"
                  >
                    {translations.add || 'ADD'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {productForm.sizes.map((size, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-100 px-2 sm:px-3 py-1 sm:py-2">
                      <span className="text-xs sm:text-sm font-light">{size.size} ({translations.stock || 'Stock'}: {size.stock})</span>
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors Management with Images */}
              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.colors || 'COLORS'} - {translations.colorImagesRequired || 'Each color must have images'}
                </label>
                
                {/* Current Color Input */}
                <div className="border border-gray-200 p-4 mb-4">
                  <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
                    <input
                      type="text"
                      placeholder={translations.colorName || 'Color Name'}
                      value={currentColor.name}
                      onChange={(e) => setCurrentColor(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentColor.hex}
                        onChange={(e) => setCurrentColor(prev => ({ ...prev, hex: e.target.value }))}
                        className="w-10 h-10 sm:w-16 sm:h-12 px-1 sm:px-2 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white"
                      />
                      <button
                        type="button"
                        onClick={addColor}
                        className="flex-1 sm:flex-none px-4 py-2 sm:py-3 border border-gray-900 bg-white text-gray-900 font-light text-xs sm:text-sm tracking-wide hover:bg-gray-900 hover:text-white transition-colors duration-200"
                      >
                        {translations.add || 'ADD'}
                      </button>
                    </div>
                  </div>

                  {/* Current Color Images */}
                  <div className="mb-3">
                    <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                      {translations.colorImages || 'COLOR IMAGES'}
                    </label>
                    <CldUploadWidget
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                      onSuccess={(result) => handleImageUpload(result, 'color')}
                    >
                      {({ open }) => (
                        <button
                          type="button"
                          onClick={() => open()}
                          className="w-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-900 bg-white text-gray-900 font-light text-xs sm:text-sm tracking-wide hover:bg-gray-900 hover:text-white transition-colors duration-200 mb-3 sm:mb-4"
                        >
                          {translations.uploadColorImages || 'UPLOAD COLOR IMAGES'}
                        </button>
                      )}
                    </CldUploadWidget>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {currentColor.images.map((image, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={image}
                            alt={`${currentColor.name || 'Color'} ${index + 1}`}
                            width={80}
                            height={80}
                            className="object-cover border border-gray-300 w-full h-auto"
                          />
                          <button
                            type="button"
                            onClick={() => removeCurrentColorImage(index)}
                            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Added Colors */}
                <div className="space-y-3">
                  {productForm.colors.map((color, colorIndex) => (
                    <div key={colorIndex} className="border border-gray-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.hex }}
                          ></div>
                          <span className="text-sm font-light">{color.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeColor(colorIndex)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          {translations.remove || 'Remove'}
                        </button>
                      </div>
                      
                      {/* Color Images */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {color.images.map((image, imageIndex) => (
                          <div key={imageIndex} className="relative">
                            <Image
                              src={image}
                              alt={`${color.name} ${imageIndex + 1}`}
                              width={60}
                              height={60}
                              className="object-cover border border-gray-300 w-full h-auto"
                            />
                            <button
                              type="button"
                              onClick={() => removeColorImage(colorIndex, imageIndex)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.tagsCommaSeparated || 'TAGS (comma separated)'}
                </label>
                <input
                  type="text"
                  value={productForm.tags}
                  onChange={(e) => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="summer, casual, cotton"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={productForm.isFeatured}
                  onChange={(e) => setProductForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className="text-xs sm:text-sm font-light text-gray-700">
                  {translations.featuredProduct || 'FEATURED PRODUCT'}
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="productActive"
                  checked={productForm.isActive}
                  onChange={(e) => setProductForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                />
                <label htmlFor="productActive" className="text-xs sm:text-sm font-light text-gray-700">
                  {translations.activeProduct || 'ACTIVE PRODUCT'}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-900 text-sm sm:text-base"
              >
                {loading ? (editingProduct ? (translations.updatingProduct || 'UPDATING PRODUCT...') : (translations.creatingProduct || 'CREATING PRODUCT...')) : (editingProduct ? (translations.updateProduct || 'UPDATE PRODUCT') : (translations.createProduct || 'CREATE PRODUCT'))}
              </button>
            </form>
          </div>

          {/* Products List */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
              {translations.products || 'PRODUCTS'} ({products.length})
            </h2>
            <div className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto">
              {products.map(product => (
                <div key={product._id} className="border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {product.featuredImage && (
                      <div className="flex-shrink-0">
                        <Image
                          src={product.featuredImage}
                          alt={product.name}
                          width={60}
                          height={60}
                          className="object-cover border border-gray-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-light text-gray-900 text-sm sm:text-base truncate">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-light">{product.price} ل.س</p>
                      <p className="text-xs text-gray-500 font-light">
                        {product.sizes?.length || 0} {translations.sizes || 'sizes'} • {product.colors?.length || 0} {translations.colors || 'colors'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-2">
                      <span className={`text-xs px-2 py-1 ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {product.isActive ? (translations.active || 'Active') : (translations.inactive || 'Inactive')}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editProduct(product)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-light"
                        >
                          {translations.edit || 'Edit'}
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-light"
                        >
                          {translations.delete || 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Category Form */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900">
                {editingCategory ? (translations.editCategory || 'EDIT CATEGORY') : (translations.addNewCategory || 'ADD NEW CATEGORY')}
              </h2>
              {editingCategory && (
                <button
                  onClick={resetCategoryForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-light text-sm hover:bg-gray-50 transition-colors"
                >
                  {translations.cancel || 'CANCEL'}
                </button>
              )}
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.categoryName || 'CATEGORY NAME'}
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.description || 'DESCRIPTION'}
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.categoryImage || 'CATEGORY IMAGE'}
                </label>
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={(result) => handleImageUpload(result, 'category')}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="w-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-900 bg-white text-gray-900 font-light text-xs sm:text-sm tracking-wide hover:bg-gray-900 hover:text-white transition-colors duration-200 mb-3 sm:mb-4"
                    >
                      {translations.uploadCategoryImage || 'UPLOAD CATEGORY IMAGE'}
                    </button>
                  )}
                </CldUploadWidget>
                {categoryForm.image && (
                  <div className="mt-2">
                    <Image
                      src={categoryForm.image}
                      alt={translations.category || 'Category'}
                      width={80}
                      height={80}
                      className="object-cover border border-gray-300"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="categoryActive"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                />
                <label htmlFor="categoryActive" className="text-xs sm:text-sm font-light text-gray-700">
                  {translations.activeCategory || 'ACTIVE CATEGORY'}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-900 text-sm sm:text-base"
              >
                {loading ? (editingCategory ? (translations.updatingCategory || 'UPDATING CATEGORY...') : (translations.creatingCategory || 'CREATING CATEGORY...')) : (editingCategory ? (translations.updateCategory || 'UPDATE CATEGORY') : (translations.createCategory || 'CREATE CATEGORY'))}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
              {translations.categories || 'CATEGORIES'} ({categories.length})
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {categories.map(category => (
                <div key={category._id} className="border border-gray-200 p-3 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {category.image && (
                      <div className="flex-shrink-0">
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={50}
                          height={50}
                          className="object-cover border border-gray-300"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-light text-gray-900 text-sm sm:text-base truncate">{category.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-light truncate">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2 py-1 flex-shrink-0 ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {category.isActive ? (translations.active || 'Active') : (translations.inactive || 'Inactive')}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editCategory(category)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-light"
                      >
                        {translations.edit || 'Edit'}
                      </button>
                      <button
                        onClick={() => deleteCategory(category._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-light"
                      >
                        {translations.delete || 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SubCategories Tab */}
      {activeTab === 'subcategories' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* SubCategory Form */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900">
                {editingSubCategory ? (translations.editSubCategory || 'EDIT SUBCATEGORY') : (translations.addNewSubCategory || 'ADD NEW SUBCATEGORY')}
              </h2>
              {editingSubCategory && (
                <button
                  onClick={resetSubCategoryForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-light text-sm hover:bg-gray-50 transition-colors"
                >
                  {translations.cancel || 'CANCEL'}
                </button>
              )}
            </div>

            <form onSubmit={handleSubCategorySubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.parentCategory || 'PARENT CATEGORY'}
                </label>
                <select
                  value={subCategoryForm.category}
                  onChange={(e) => setSubCategoryForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  required
                >
                  <option value="">{translations.selectParentCategory || 'Select Parent Category'}</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.subCategoryName || 'SUBCATEGORY NAME'}
                </label>
                <input
                  type="text"
                  value={subCategoryForm.name}
                  onChange={(e) => setSubCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.description || 'DESCRIPTION'}
                </label>
                <textarea
                  value={subCategoryForm.description}
                  onChange={(e) => setSubCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="subCategoryActive"
                  checked={subCategoryForm.isActive}
                  onChange={(e) => setSubCategoryForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                />
                <label htmlFor="subCategoryActive" className="text-xs sm:text-sm font-light text-gray-700">
                  {translations.activeSubCategory || 'ACTIVE SUBCATEGORY'}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-900 text-sm sm:text-base"
              >
                {loading ? (editingSubCategory ? (translations.updatingSubCategory || 'UPDATING SUBCATEGORY...') : (translations.creatingSubCategory || 'CREATING SUBCATEGORY...')) : (editingSubCategory ? (translations.updateSubCategory || 'UPDATE SUBCATEGORY') : (translations.createSubCategory || 'CREATE SUBCATEGORY'))}
              </button>
            </form>
          </div>

          {/* SubCategories List */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
              {translations.subcategories || 'SUBCATEGORIES'} ({subCategories.length})
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {subCategories.map(subCategory => (
                <div key={subCategory._id} className="border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="font-light text-gray-900 text-sm sm:text-base truncate">{subCategory.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-light">
                        {translations.parent || 'Parent'}: {subCategory.category?.name || translations.unknown || 'Unknown'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 font-light truncate">{subCategory.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-2 py-1 flex-shrink-0 ${subCategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {subCategory.isActive ? (translations.active || 'Active') : (translations.inactive || 'Inactive')}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editSubCategory(subCategory)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-light"
                        >
                          {translations.edit || 'Edit'}
                        </button>
                        <button
                          onClick={() => deleteSubCategory(subCategory._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-light"
                        >
                          {translations.delete || 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Collections Tab */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Collection Form */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900">
                {editingCollection ? (translations.editCollection || 'EDIT COLLECTION') : (translations.addNewCollection || 'ADD NEW COLLECTION')}
              </h2>
              {editingCollection && (
                <button
                  onClick={resetCollectionForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-light text-sm hover:bg-gray-50 transition-colors"
                >
                  {translations.cancel || 'CANCEL'}
                </button>
              )}
            </div>

            <form onSubmit={handleCollectionSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.collectionName || 'COLLECTION NAME'}
                </label>
                <input
                  type="text"
                  value={collectionForm.name}
                  onChange={(e) => setCollectionForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.description || 'DESCRIPTION'}
                </label>
                <textarea
                  value={collectionForm.description}
                  onChange={(e) => setCollectionForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                    {translations.season || 'SEASON'}
                  </label>
                  <select
                    value={collectionForm.season}
                    onChange={(e) => setCollectionForm(prev => ({ ...prev, season: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  >
                    {['Spring', 'Summer', 'Fall', 'Winter', 'All Season', 'Holiday', 'Resort'].map(season => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                    {translations.year || 'YEAR'}
                  </label>
                  <input
                    type="number"
                    value={collectionForm.year}
                    onChange={(e) => setCollectionForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  {translations.collectionImage || 'COLLECTION IMAGE'}
                </label>
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={(result) => handleImageUpload(result, 'collection')}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="w-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-900 bg-white text-gray-900 font-light text-xs sm:text-sm tracking-wide hover:bg-gray-900 hover:text-white transition-colors duration-200 mb-3 sm:mb-4"
                    >
                      {translations.uploadCollectionImage || 'UPLOAD COLLECTION IMAGE'}
                    </button>
                  )}
                </CldUploadWidget>
                {collectionForm.image && (
                  <div className="mt-2">
                    <Image
                      src={collectionForm.image}
                      alt={translations.collection || 'Collection'}
                      width={80}
                      height={80}
                      className="object-cover border border-gray-300"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={collectionForm.featured}
                  onChange={(e) => setCollectionForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="text-xs sm:text-sm font-light text-gray-700">
                  {translations.featuredCollection || 'FEATURED COLLECTION'}
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="collectionActive"
                  checked={collectionForm.isActive}
                  onChange={(e) => setCollectionForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                />
                <label htmlFor="collectionActive" className="text-xs sm:text-sm font-light text-gray-700">
                  {translations.activeCollection || 'ACTIVE COLLECTION'}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-900 text-sm sm:text-base"
              >
                {loading ? (editingCollection ? (translations.updatingCollection || 'UPDATING COLLECTION...') : (translations.creatingCollection || 'CREATING COLLECTION...')) : (editingCollection ? (translations.updateCollection || 'UPDATE COLLECTION') : (translations.createCollection || 'CREATE COLLECTION'))}
              </button>
            </form>
          </div>

          {/* Collections List */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
              {translations.collections || 'COLLECTIONS'} ({collections.length})
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {collections.map(collection => (
                <div key={collection._id} className="border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {collection.image && (
                      <div className="flex-shrink-0">
                        <Image
                          src={collection.image}
                          alt={collection.name}
                          width={50}
                          height={50}
                          className="object-cover border border-gray-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-light text-gray-900 text-sm sm:text-base truncate">{collection.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-light truncate">{collection.description}</p>
                      <p className="text-xs text-gray-500 font-light">
                        {collection.season} {collection.year}
                        {collection.featured && ` • ${translations.featured || 'Featured'}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-2 py-1 flex-shrink-0 ${collection.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {collection.isActive ? (translations.active || 'Active') : (translations.inactive || 'Inactive')}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editCollection(collection)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-light"
                        >
                          {translations.edit || 'Edit'}
                        </button>
                        <button
                          onClick={() => deleteCollection(collection._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-light"
                        >
                          {translations.delete || 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}