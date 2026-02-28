// app/providers.js
'use client';
import { SessionProvider } from "next-auth/react";

import { LanguageProvider } from '../context/LanguageContext';

export function Providers({ children, initialLocale = "ar" }) {
  return (
    <SessionProvider>
      <LanguageProvider initialLocale={initialLocale}>
        {children}
      </LanguageProvider>
    </SessionProvider>
  );
}