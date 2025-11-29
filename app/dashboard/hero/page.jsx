// app/dashboard/hero/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroPage() {
  const [hero, setHero] = useState({ imageUrl: null, publicId: null });
  const [uploadedImage, setUploadedImage] = useState({ imageUrl: '', publicId: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { translations } = useLanguage();

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hero', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setHero(data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch hero section' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (result) => {
    if (result.event === 'success') {
      setUploadedImage({
        imageUrl: result.info.secure_url,
        publicId: result.info.public_id
      });
      setMessage({ type: 'success', text: 'Image uploaded successfully! Please click Save to update the hero section.' });
    }
  };

  const handleSave = async () => {
    if (!uploadedImage.imageUrl || !uploadedImage.publicId) {
      setMessage({ type: 'error', text: 'Please upload an image first' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadedImage.imageUrl,
          publicId: uploadedImage.publicId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setHero(data);
        setUploadedImage({ imageUrl: '', publicId: '' });
        setMessage({ type: 'success', text: 'Hero section updated successfully!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update hero section' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the hero image? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/hero', {
        method: 'DELETE'
      });

      if (response.ok) {
        setHero({ imageUrl: null, publicId: null });
        setUploadedImage({ imageUrl: '', publicId: '' });
        setMessage({ type: 'success', text: 'Hero section deleted successfully!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to delete hero section' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-light tracking-wider text-gray-900 uppercase">
          Hero Section Management
        </h1>
        <p className="text-gray-600 mt-2 font-light text-sm sm:text-base">
          Manage the hero section background image
        </p>
      </div>

      {message.text && (
        <div className={`mb-6 sm:mb-8 p-4 border-l-4 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-400'
            : 'bg-red-50 text-red-800 border-red-400'
        }`}>
          <span className="font-medium text-sm sm:text-base">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Upload Form */}
        <div className="bg-white p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
            Upload New Hero Image
          </h2>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                HERO IMAGE
              </label>
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={handleImageUpload}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="w-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-900 bg-white text-gray-900 font-light text-xs sm:text-sm tracking-wide hover:bg-gray-900 hover:text-white transition-colors duration-200 mb-3 sm:mb-4"
                  >
                    UPLOAD HERO IMAGE
                  </button>
                )}
              </CldUploadWidget>
              
              {uploadedImage.imageUrl && (
                <div className="mt-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 font-light">
                    Preview (Click Save to apply):
                  </p>
                  <div className="relative w-full h-64 border border-gray-300">
                    <Image
                      src={uploadedImage.imageUrl}
                      alt="Hero preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={loading || !uploadedImage.imageUrl}
              className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-900 text-sm sm:text-base"
            >
              {loading ? 'SAVING...' : 'SAVE HERO IMAGE'}
            </button>
          </div>
        </div>

        {/* Current Hero Section */}
        <div className="bg-white p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
            Current Hero Image
          </h2>

          {hero.imageUrl ? (
            <div className="space-y-4">
              <div className="relative w-full h-64 border border-gray-300">
                <Image
                  src={hero.imageUrl}
                  alt="Current hero"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-red-600 text-white font-light tracking-wide hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-red-600 text-sm sm:text-base"
              >
                {loading ? 'DELETING...' : 'DELETE HERO IMAGE'}
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 font-light text-sm sm:text-base">
                No hero image set. Upload an image to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

