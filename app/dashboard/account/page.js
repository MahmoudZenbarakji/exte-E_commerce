// app/dashboard/account/page.js
'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function AccountPage() {
  const { data: session, update } = useSession();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    image: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { currentLanguage, translations } = useLanguage();
  const isRTL = currentLanguage === 'ar';

  useEffect(() => {
    if (session?.user) {
      setUserData({
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        email: session.user.email || '',
        image: session.user.image || ''
      });
    }
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: translations.profileUpdated || 'Profile updated successfully!' });
        await update();
      } else {
        setMessage({ type: 'error', text: data.error || translations.updateProfileFailed || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: translations.networkError || 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: translations.passwordsDontMatch || 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: translations.passwordLengthError || 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: translations.passwordUpdated || 'Password updated successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: data.error || translations.updatePasswordFailed || 'Failed to update password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: translations.networkError || 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (result) => {
    if (result.event === 'success') {
      setUserData(prev => ({
        ...prev,
        image: result.info.secure_url
      }));
      setMessage({ type: 'success', text: translations.imageUploaded || 'Image uploaded successfully!' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header - Zara Style */}
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-wider text-gray-900 uppercase">
          {translations.accountSettings || 'Account Settings'}
        </h1>
        <p className="text-gray-600 mt-2 font-light">
          {translations.manageProfileSecurity || 'Manage your profile and security preferences'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-light text-sm tracking-wide transition-colors duration-200 ${
              activeTab === 'profile'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {translations.profileInformation || 'PROFILE INFORMATION'}
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-4 px-1 border-b-2 font-light text-sm tracking-wide transition-colors duration-200 ${
              activeTab === 'password'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {translations.changePassword || 'CHANGE PASSWORD'}
          </button>
        </nav>
      </div>

      {message.text && (
        <div className={`mb-8 p-4 border-l-4 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-400' 
            : 'bg-red-50 text-red-800 border-red-400'
        }`}>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white p-10">
          <form onSubmit={handleProfileUpdate} className="space-y-8">
            {/* Profile Image Upload */}
            <div className="flex flex-col md:flex-row items-start gap-8 pb-8 border-b border-gray-200">
              <div className="flex-shrink-0">
                <div className="relative">
                  {userData.image ? (
                    <Image
                      src={userData.image}
                      alt={translations.profile || 'Profile'}
                      width={120}
                      height={120}
                      className="rounded-full border-2 border-gray-300 object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-gray-400 text-xl font-light uppercase">
                        {userData.firstName?.[0]}{userData.lastName?.[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4 ">
                <h3 className="text-lg font-light tracking-wide text-gray-900">
                  {translations.profilePhoto || 'PROFILE PHOTO'}
                </h3>
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={handleImageUpload}
                  options={{
                    multiple: false,
                    resourceType: 'image',
                    cropping: true,
                    croppingAspectRatio: 1,
                    croppingDefaultSelectionRatio: 0.9,
                    showSkipCropButton: false,
                    styles: {
                      palette: {
                        window: "#FFFFFF",
                        sourceBg: "#F8F8F8",
                        windowBorder: "#000000",
                        tabIcon: "#000000",
                        inactiveTabIcon: "#555555",
                        menuIcons: "#000000",
                        link: "#000000",
                        action: "#000000",
                        inProgress: "#000000",
                        complete: "#000000",
                        error: "#000000",
                        textDark: "#000000",
                        textLight: "#FFFFFF"
                      }
                    }
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="px-6 py-3 border border-gray-900 bg-white text-gray-900 font-light text-sm tracking-wide hover:bg-gray-900 hover:text-white transition-colors duration-200"
                    >
                      {translations.uploadNewPhoto || 'UPLOAD NEW PHOTO'}
                    </button>
                  )}
                </CldUploadWidget>
                <p className="text-sm text-gray-600 font-light">
                  {translations.imageRecommendations || 'Recommended: Square image, at least 400x400 pixels. JPG, PNG, or WebP.'}
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-8">
              <h3 className="text-lg font-light tracking-wide text-gray-900 border-b border-gray-200 pb-2">
                {translations.personalInformation || 'PERSONAL INFORMATION'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-light text-gray-700 mb-3 tracking-wide">
                    {translations.firstName || 'FIRST NAME'}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-light text-gray-700 mb-3 tracking-wide">
                    {translations.lastName || 'LAST NAME'}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-light text-gray-700 mb-3 tracking-wide">
                  {translations.emailAddress || 'EMAIL ADDRESS'}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light"
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-4 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-900"
              >
                {loading ? (translations.updating || 'UPDATING...') : (translations.saveChanges || 'SAVE CHANGES')}
              </button>
              
              <button
                type="button"
                onClick={() => setUserData({
                  firstName: session.user.firstName || '',
                  lastName: session.user.lastName || '',
                  email: session.user.email || '',
                  image: session.user.image || ''
                })}
                className="flex-1 px-8 py-4 border border-gray-300 text-gray-700 hover:bg-gray-50 font-light tracking-wide transition-colors duration-200"
              >
                {translations.resetChanges || 'RESET CHANGES'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white p-10">
          <form onSubmit={handlePasswordUpdate} className="space-y-8">
            <div className="space-y-8">
              <h3 className="text-lg font-light tracking-wide text-gray-900 border-b border-gray-200 pb-2">
                {translations.changePassword || 'CHANGE PASSWORD'}
              </h3>
              
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-light text-gray-700 mb-3 tracking-wide">
                  {translations.currentPassword || 'CURRENT PASSWORD'}
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-light text-gray-700 mb-3 tracking-wide">
                    {translations.newPassword || 'NEW PASSWORD'}
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-light text-gray-700 mb-3 tracking-wide">
                    {translations.confirmNewPassword || 'CONFIRM NEW PASSWORD'}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 border-l-4 border-gray-400">
                <p className="text-sm text-gray-600 font-light">
                  {translations.passwordRequirements || 'Password must be at least 6 characters long. For better security, use a mix of letters, numbers, and symbols.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-4 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-900"
              >
                {loading ? (translations.updating || 'UPDATING...') : (translations.updatePassword || 'UPDATE PASSWORD')}
              </button>
              
              <button
                type="button"
                onClick={() => setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                })}
                className="flex-1 px-8 py-4 border border-gray-300 text-gray-700 hover:bg-gray-50 font-light tracking-wide transition-colors duration-200"
              >
                {translations.clearFields || 'CLEAR FIELDS'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}