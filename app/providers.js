// app/providers.js
'use client';
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from 'swr';

import { LanguageProvider } from '../context/LanguageContext';

export function Providers({ children, initialLocale = "ar" }) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          revalidateOnFocus: true,
          shouldRetryOnError: true,
          dedupingInterval: 2000,
        }}
      >
        <LanguageProvider initialLocale={initialLocale}>
          {children}
        </LanguageProvider>
      </SWRConfig>
    </SessionProvider>
  );
}