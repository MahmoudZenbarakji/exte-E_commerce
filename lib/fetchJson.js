/**
 * Client-side JSON fetch: skips HTTP cache and fails loudly on non-OK responses.
 * Use for dashboard / admin data so dropdowns never show stale empty payloads.
 */
export async function fetchJsonNoStore(url) {
  const res = await fetch(url, { cache: 'no-store' });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const msg =
      body && typeof body.error === 'string'
        ? body.error
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body;
}
