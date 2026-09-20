/** Laravel API base for server-side fetches (Next.js → Laravel directly). */
export function getServerApiBase(): string {
  const laravel = process.env.LARAVEL_DEV_URL ?? "http://127.0.0.1:8000";
  return `${laravel.replace(/\/$/, "")}/api`;
}

/** API base for browser requests — always same-origin via Next.js rewrite. */
export function getClientApiBase(): string {
  const endpoint = process.env.NEXT_PUBLIC_END_POINT ?? "laravel-api";
  return `/${endpoint}`;
}
