/**
 * Theme toggle module for dark/light/system mode switching.
 * Cycles through: System → Light → Dark → System
 */

const STORAGE_KEY = 'aem-theme-preference';
const THEMES = ['system', 'light', 'dark'];

// Cache for loaded SVG icons
const iconsCache = {};

const LABELS = {
  system: 'Theme: System (click for Light)',
  light: 'Theme: Light (click for Dark)',
  dark: 'Theme: Dark (click for System)',
};

// Shorter tooltips for desktop users
const TITLES = {
  system: 'System theme',
  light: 'Light theme',
  dark: 'Dark theme',
};

/**
 * Fetch and cache an SVG icon from the icons folder
 * @param {string} theme - Theme name (system, light, dark)
 * @returns {Promise<string>} SVG markup
 */
async function fetchIcon(theme) {
  if (iconsCache[theme]) {
    return iconsCache[theme];
  }
  try {
    const response = await fetch(`/icons/theme-${theme}.svg`);
    if (response.ok) {
      const svg = await response.text();
      iconsCache[theme] = svg;
      return svg;
    }
  } catch (e) {
    // Fetch failed, return empty
  }
  return '';
}

/**
 * Get the current theme preference from localStorage
 * @returns {string} 'system', 'light', or 'dark'
 */
function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.includes(stored)) {
      return stored;
    }
  } catch (e) {
    // localStorage not available
  }
  return 'system';
}

/**
 * Save theme preference to localStorage
 * @param {string} theme - 'system', 'light', or 'dark'
 */
function storeTheme(theme) {
  try {
    if (theme === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  } catch (e) {
    // localStorage not available
  }
}

/**
 * Apply theme to the document
 * @param {string} theme - 'system', 'light', or 'dark'
 */
function applyTheme(theme) {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

/**
 * Update the toggle button's icon, aria-label, and title
 * @param {HTMLElement} button - The toggle button element
 * @param {string} theme - Current theme
 */
async function updateButton(button, theme) {
  const svg = await fetchIcon(theme);
  button.innerHTML = svg;
  button.setAttribute('aria-label', LABELS[theme]);
  button.setAttribute('title', TITLES[theme]);
}

/**
 * Get the next theme in the cycle
 * @param {string} current - Current theme
 * @returns {string} Next theme
 */
function getNextTheme(current) {
  const index = THEMES.indexOf(current);
  return THEMES[(index + 1) % THEMES.length];
}

/**
 * Initialize the theme toggle button
 * @param {HTMLElement} button - The button element to initialize
 */
export default async function initThemeToggle(button) {
  // Get initial theme
  let currentTheme = getStoredTheme();
  applyTheme(currentTheme);

  // Prefetch all icons for instant switching
  await Promise.all(THEMES.map((theme) => fetchIcon(theme)));

  await updateButton(button, currentTheme);

  // Handle click to cycle themes
  button.addEventListener('click', async () => {
    currentTheme = getNextTheme(currentTheme);
    applyTheme(currentTheme);
    storeTheme(currentTheme);
    await updateButton(button, currentTheme);
  });
}
