/**
 * Cache Manager Module
 * Handles analysis result caching and validation
 */

// Cache configuration
const CACHE_KEY = 'rumAnalysisCache_aiReport';
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Get cache from localStorage
 * @returns {Object|null} Cached data or null
 */
function getAnalysisCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('[Cache] Error reading cache:', error);
    return null;
  }
}

/**
 * Set cache in localStorage
 * @param {Object} cacheData - Data to cache
 */
function setAnalysisCache(cacheData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('[Cache] Error writing cache:', error);
  }
}

/**
 * Check if cache is valid for the given dashboard hash
 * @param {string} currentDashboardHash - Current dashboard data hash
 * @returns {boolean} True if cache is valid
 */
export function isCacheValid(currentDashboardHash) {
  const analysisCache = getAnalysisCache();
  
  if (!analysisCache || !analysisCache.timestamp) {
    return false;
  }

  // Check if cache has expired
  const now = Date.now();
  const timeDiff = now - analysisCache.timestamp;
  if (timeDiff > CACHE_DURATION) {
    console.log('[Cache] Cache expired, will generate new analysis');
    clearAnalysisCache();
    return false;
  }

  // Check if dashboard data has changed
  if (analysisCache.dashboardDataHash !== currentDashboardHash) {
    console.log('[Cache] Dashboard data changed, will generate new analysis');
    clearAnalysisCache();
    return false;
  }

  console.log('[Cache] Valid cache found, using cached analysis');
  return true;
}

/**
 * Cache analysis result
 * @param {string} result - Analysis result to cache
 * @param {string} dashboardDataHash - Dashboard data hash
 */
export function cacheAnalysisResult(result, dashboardDataHash) {
  const cacheData = {
    result,
    timestamp: Date.now(),
    dashboardDataHash,
  };
  setAnalysisCache(cacheData);
  console.log('[Cache] Analysis result cached for 4 hours');
}

/**
 * Clear analysis cache
 */
export function clearAnalysisCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('[Cache] Analysis cache cleared');
  } catch (error) {
    console.warn('[Cache] Error clearing cache:', error);
  }
}

/**
 * Get cache status for UI display
 * @returns {string|null} Cache status message or null
 */
export function getCacheStatus() {
  const analysisCache = getAnalysisCache();

  if (!analysisCache || !analysisCache.timestamp) {
    return null;
  }

  const now = Date.now();
  const timeDiff = now - analysisCache.timestamp;
  const remainingTime = CACHE_DURATION - timeDiff;

  if (remainingTime <= 0) {
    clearAnalysisCache();
    return null;
  }

  const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
  return `Cached result (expires in ${remainingMinutes} min)`;
}

/**
 * Get cached analysis result
 * @returns {string|null} Cached result or null
 */
export function getCachedResult() {
  const cache = getAnalysisCache();
  return cache ? cache.result : null;
}
