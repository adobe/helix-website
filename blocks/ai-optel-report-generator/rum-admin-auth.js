/**
 * RUM Admin Authentication
 * Validates RUM token against the bundles API (like tools/rum/admin/store.js)
 */

const BUNDLES_API = 'https://bundles.aem.page';
const TOKEN_KEYS = ['rum-bundler-token', 'rum-admin-token'];

/**
 * Get RUM token from localStorage
 * @returns {string|null}
 */
function getToken() {
  let token = null;
  TOKEN_KEYS.some((key) => {
    token = localStorage.getItem(key);
    return !!token;
  });
  return token;
}

/**
 * Validate RUM token against the bundles API
 * Only super admins (200 response) are allowed
 * - 200 = super admin - allowed
 * - 403 = limited permissions - denied
 * - 401 = invalid/expired token - denied
 * @returns {Promise<{isAdmin: boolean}>}
 */
export default async function checkRumAdminAccess() {
  const token = getToken();

  if (!token) {
    return { isAdmin: false };
  }

  try {
    const res = await fetch(`${BUNDLES_API}/domains?suggested=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 200 = super admin - allowed
    if (res.ok) {
      return { isAdmin: true };
    }

    // 401 = invalid/expired token, 403 = limited permissions - denied
    return { isAdmin: false };
  } catch {
    // Network error - allow access (benefit of doubt)
    return { isAdmin: true };
  }
}
