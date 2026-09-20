/**
 * Rewrites Laravel storage URLs to same-origin `/storage/...` paths.
 * Mobile/LAN clients cannot reach `127.0.0.1:8000`; Next.js proxies `/storage/*` on port 3000.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('/storage/')) return trimmed;

  const storageMatch = trimmed.match(/\/storage\/[^\s?#]*/);
  if (storageMatch) return storageMatch[0];

  return trimmed;
}
