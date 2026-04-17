// app/providers.js
'use client';
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from 'swr';

import { LanguageProvider } from '../context/LanguageContext';
import { jsonFetcher } from '@/lib/swr-fetcher';

export function Providers({ children, initialLocale = "ar" }) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          fetcher: jsonFetcher,
          revalidateOnFocus: true,
          shouldRetryOnError: true,
          errorRetryCount: 2,
          dedupingInterval: 5000,
          focusThrottleInterval: 10000,
        }}
      >
        <LanguageProvider initialLocale={initialLocale}>
          {children}
        </LanguageProvider>
      </SWRConfig>
    </SessionProvider>
  );
}