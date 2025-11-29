// components/CheckoutForm.js
'use client';
import { useState } from 'react';
import { useLanguage } from "@/context/LanguageContext";

export default function CheckoutForm({ isOpen, onClose, onCheckout, cart, updating }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '', // Changed to single string
    notes: ''
  });
  const { translations } = useLanguage();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCheckout(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-light tracking-wide text-gray-900">{translations.checkoutInformation || 'Checkout Information'}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2 tracking-wide">
                {translations.fullName || 'Full Name'}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 font-light focus:outline-none focus:border-gray-900"
                placeholder={translations.fullName || 'Full Name'}
              />
            </div>

            <div>
              <label className="block text-sm font-light text-gray-700 mb-2 tracking-wide">
                {translations.phoneNumber || 'Phone Number'}
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 font-light focus:outline-none focus:border-gray-900"
                placeholder={translations.phoneNumber || 'Phone Number'}
              />
            </div>

            {/* Full Address as single textarea */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2 tracking-wide">
                {translations.fullAddress || 'Full Address'}
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 font-light focus:outline-none focus:border-gray-900"
                placeholder={translations.fullAddressPlaceholder || 'Enter your complete address including street, city, state, and zip code'}
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2 tracking-wide">
                {translations.additionalNotes || 'Additional Notes'}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 font-light focus:outline-none focus:border-gray-900"
                placeholder={translations.additionalNotesPlaceholder || 'Any special instructions for delivery...'}
              />
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-light text-gray-700 mb-3 tracking-wide">{translations.orderSummary || 'Order Summary'}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-light text-gray-600">{translations.items || 'Items'} ({cart.itemCount})</span>
                  <span className="font-light text-gray-900">{cart.total.toFixed(2)} ل.س</span>
                </div>
                <div className="flex justify-between text-base border-t border-gray-200 pt-2">
                  <span className="font-light text-gray-900">{translations.total || 'Total'}</span>
                  <span className="font-light text-gray-900">{cart.total.toFixed(2)} ل.س</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-900 text-gray-900 py-3 text-sm font-light tracking-wide hover:bg-gray-900 hover:text-white transition-colors duration-200"
              >
                {translations.cancel || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={updating}
                className="flex-1 bg-gray-900 text-white py-3 text-sm font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (translations.placingOrder || 'Placing Order...') : (translations.placeOrder || 'Place Order')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}