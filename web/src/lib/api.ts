const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100';
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || PUBLIC_API_URL;

/**
 * Returns the API base URL that should be used for the current runtime.
 * Server-side code prefers `INTERNAL_API_URL` (so it can call other containers),
 * while client-side code keeps using the public endpoint (`NEXT_PUBLIC_API_URL`).
 */
export function getApiUrl() {
  return typeof window === 'undefined' ? INTERNAL_API_URL : PUBLIC_API_URL;
}
