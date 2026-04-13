'use client';

import useSWR from 'swr';
import { fetchJsonNoStore } from '@/lib/fetchJson';

const swrOptions = {
  revalidateOnFocus: true,
  revalidateIfStale: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
};

/**
 * Parallel SWR loads for product management: dedupes requests, avoids race conditions
 * on Strict Mode double-mount, and revalidates after focus for fresh dropdown data.
 */
export function useDashboardInventory() {
  const products = useSWR('/api/products?activeOnly=false', fetchJsonNoStore, swrOptions);
  const categories = useSWR('/api/categories?activeOnly=false', fetchJsonNoStore, swrOptions);
  const subCategories = useSWR('/api/subcategories?activeOnly=false', fetchJsonNoStore, swrOptions);
  const collections = useSWR('/api/collections?activeOnly=false', fetchJsonNoStore, swrOptions);

  const isLoading =
    products.isLoading ||
    categories.isLoading ||
    subCategories.isLoading ||
    collections.isLoading;

  const isValidating =
    products.isValidating ||
    categories.isValidating ||
    subCategories.isValidating ||
    collections.isValidating;

  const error =
    products.error ||
    categories.error ||
    subCategories.error ||
    collections.error;

  const mutateAll = () =>
    Promise.all([
      products.mutate(),
      categories.mutate(),
      subCategories.mutate(),
      collections.mutate(),
    ]);

  return {
    products: products.data ?? [],
    categories: categories.data ?? [],
    subCategories: subCategories.data ?? [],
    collections: collections.data ?? [],
    isLoading,
    isValidating,
    error,
    mutateAll,
  };
}
