/**
 * Theme toggle module for dark/light/system mode switching.
 * Cycles through: System → Light → Dark → System
 */

const STORAGE_KEY = 'aem-theme-preference';
const THEMES = ['system', 'light', 'dark'];

// SVG Icons for each theme state
const ICONS = {
  // Sun/moon combo with vertical divider - sun on left, moon on right
  system: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <defs>
      <clipPath id="left-half"><rect x="0" y="0" width="11" height="24"/></clipPath>
      <clipPath id="right-half"><rect x="13" y="0" width="11" height="24"/></clipPath>
    </defs>
    <g clip-path="url(#left-half)">
      <circle cx="12" cy="12" r="4"/>
      <path stroke-width="2" stroke-linecap="round" d="M12 5V3M12 21v-2M5 12H3M6.3 6.3 4.9 4.9M6.3 17.7l-1.4 1.4"/>
    </g>
    <line x1="12" y1="4" x2="12" y2="20" stroke-width="1" stroke-opacity="0.4"/>
    <g clip-path="url(#right-half)">
      <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
    </g>
  </svg>`,
  light: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4"/>
    <path stroke-width="2" stroke-linecap="round" d="M12 5V3M12 21v-2M5 12H3m18 0h-2M6.3 6.3 4.9 4.9m12.8 12.8 1.4 1.4M6.3 17.7l-1.4 1.4M17.7 6.3l1.4-1.4"/>
  </svg>`,
  dark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
  </svg>`,
};

const LABELS = {
  system: 'Using system theme. Click for light mode.',
  light: 'Using light mode. Click for dark mode.',
  dark: 'Using dark mode. Click for system theme.',
};

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
 * Update the toggle button's icon and aria-label
 * @param {HTMLElement} button - The toggle button element
 * @param {string} theme - Current theme
 */
function updateButton(button, theme) {
  button.innerHTML = ICONS[theme];
  button.setAttribute('aria-label', LABELS[theme]);
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
export default function initThemeToggle(button) {
  // Get initial theme
  let currentTheme = getStoredTheme();
  applyTheme(currentTheme);
  updateButton(button, currentTheme);

  // Handle click to cycle themes
  button.addEventListener('click', () => {
    currentTheme = getNextTheme(currentTheme);
    applyTheme(currentTheme);
    storeTheme(currentTheme);
    updateButton(button, currentTheme);
  });
}
