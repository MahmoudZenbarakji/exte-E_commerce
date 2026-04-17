/**
 * Default SWR fetcher: parses JSON and throws on non-OK responses so SWR marks errors correctly.
 */
export async function jsonFetcher(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.response = res;
    throw err;
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}
