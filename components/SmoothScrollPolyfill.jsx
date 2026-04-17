'use client';

import { useEffect } from 'react';

/** Loads smoothscroll polyfill once on the client (keeps the home shell as a Server Component). */
export default function SmoothScrollPolyfill() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('smoothscroll-polyfill').then((mod) => {
      mod.polyfill();
    });
  }, []);
  return null;
}
