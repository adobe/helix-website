/**
 * Theme toggle module for dark/light/system mode switching.
 * Cycles through: System → Light → Dark → System
 */

const STORAGE_KEY = 'aem-theme-preference';
const THEMES = ['system', 'light', 'dark'];

// SVG Icons for each theme state
const ICONS = {
  system: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 5h16v11H4V5zm18-2H2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7v2H6v2h12v-2h-3v-2h7a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"/>
  </svg>`,
  light: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zM3 11a1 1 0 1 1 0 2H1a1 1 0 1 1 0-2h2zm18 0h2a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2zM5.64 4.22a1 1 0 0 1 1.42 1.42L5.64 7.06a1 1 0 0 1-1.42-1.42l1.42-1.42zm12.02 12.02a1 1 0 0 1 1.42 1.42l-1.42 1.42a1 1 0 1 1-1.42-1.42l1.42-1.42zM4.22 18.36a1 1 0 0 1 1.42-1.42l1.42 1.42a1 1 0 1 1-1.42 1.42l-1.42-1.42zm12.02-12.02a1 1 0 0 1 1.42-1.42l1.42 1.42a1 1 0 1 1-1.42 1.42l-1.42-1.42z"/>
  </svg>`,
  dark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
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
  // Get initial theme and apply it
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

// Apply stored theme immediately on script load to prevent flash
const storedTheme = getStoredTheme();
if (storedTheme !== 'system') {
  applyTheme(storedTheme);
}
