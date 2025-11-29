// app/dashboard/performance/page.js
'use client';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';

export default function PerformancePage() {
  const { data: session } = useSession();
  const { currentLanguage, translations } = useLanguage();
  const isRTL = currentLanguage === 'ar';

  return (
    <div className="max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {translations.performanceAnalytics || 'Performance Analytics'}
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {translations.viewPerformanceMetrics || 'View your performance metrics'}, {session?.user?.firstName}!
        </p>
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {translations.performanceMetrics || 'Performance Metrics'}
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>{translations.salesPerformance || 'Sales performance'}</li>
            <li>{translations.userEngagement || 'User engagement'}</li>
            <li>{translations.revenueAnalytics || 'Revenue analytics'}</li>
            <li>{translations.growthMetrics || 'Growth metrics'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}