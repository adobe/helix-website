/**
 * Theme toggle module for dark/light/system mode switching.
 * Cycles through: System → Light → Dark → System
 */

import { applyTheme, getStoredTheme, storeTheme } from '../../scripts/scripts.js';

const THEMES = ['system', 'light', 'dark'];

// Cache for loaded SVG icons
const iconsCache = {};

const LABELS = {
  system: 'Theme: System (click for Light)',
  light: 'Theme: Light (click for Dark)',
  dark: 'Theme: Dark (click for System)',
};

// Tooltips describing what happens on click
const TITLES = {
  system: 'Switch to light theme',
  light: 'Switch to dark theme',
  dark: 'Switch to system theme',
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
