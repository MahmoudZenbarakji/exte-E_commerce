/**
 * Parse limit/skip from URL search params for list endpoints.
 * `limit: null` means return the full list (no .limit()).
 */
export function getPagination(searchParams, { maxLimit = 200 } = {}) {
  const rawLimit = searchParams.get('limit');
  const rawSkip = searchParams.get('skip');

  let limit = null;
  if (rawLimit != null && rawLimit !== '') {
    const n = parseInt(String(rawLimit), 10);
    if (Number.isFinite(n) && n > 0) limit = Math.min(n, maxLimit);
  }

  const rawS = rawSkip != null && rawSkip !== '' ? parseInt(String(rawSkip), 10) : 0;
  const skip = Number.isFinite(rawS) && rawS >= 0 ? rawS : 0;

  return { limit, skip };
}
