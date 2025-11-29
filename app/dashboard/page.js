// app/dashboard/page.js
'use client';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';

export default function Dashboard() {
  const { data: session } = useSession();
  const { currentLanguage, translations } = useLanguage();
  const isRTL = currentLanguage === 'ar';

  return (
    <div className="max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {translations.welcome || 'Welcome to your Dashboard'}, {session?.user?.name}!
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          {translations.email || 'Email'}: {session?.user?.email}
        </p>
        <p className="text-lg text-gray-600 mb-4">
          {translations.welcomeBack || 'Welcome back'}, {session?.user?.firstName}!
        </p>
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">{translations.dashboardFeatures || 'Dashboard Features'}</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>{translations.accountManagement || 'Account Management'}</li>
            <li>{translations.profileSettings || 'Profile Settings'}</li>
            <li>{translations.orderTracking || 'Order Tracking'}</li>
            <li>{translations.performanceAnalytics || 'Performance Analytics'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}