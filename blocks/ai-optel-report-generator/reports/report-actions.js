/* Report Actions Module - Handles saving reports,
tracking viewed state, and dropdown integration */

/* eslint-disable no-console */

import { uploadToDA, getCurrentAnalyzedUrl, fetchReportsFromDA } from './da-upload.js';
import { updateButtonState } from '../ui/modal-ui.js';

const VIEWED_KEY = 'optel-detective-viewed-reports';
const STYLES = {
  HEADER: 'font-weight: 600; color: #333; padding-top: 12px; margin-top: 12px; border-top: 2px solid #ccc; cursor: default; pointer-events: none; font-size: var(--type-body-l-size);',
  UNVIEWED: 'color: #147af3; padding-left: 2rem; cursor: pointer; font-size: var(--type-body-l-size); line-height: 1.6; font-weight: normal; border: none;',
  VIEWED: 'color: #7326d3; padding-left: 2rem; cursor: pointer; font-size: var(--type-body-l-size); line-height: 1.6; font-weight: normal; border: none;',
  BADGE: 'position: absolute; top: -4px; right: -4px; min-width: 20px; width: 20px; height: 20px; background: #ff7c65; border-radius: 50%; z-index: 1000; pointer-events: none; color: white; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); line-height: 1;',
};

const getViewedReports = () => {
  try { return JSON.parse(localStorage.getItem(VIEWED_KEY) || '[]'); } catch { return []; }
};

const getWeekId = (ts) => {
  const d = new Date(ts);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - yearStart) / 86400000 + yearStart.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
};

const filterByWeek = (reports) => {
  const map = new Map();
  reports.forEach((r) => {
    const week = getWeekId(r.timestamp);
    if (!map.has(week) || r.timestamp > map.get(week).timestamp) map.set(week, r);
  });
  return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
};

export async function getSavedReports() {
  try {
    const domain = getCurrentAnalyzedUrl();
    return await fetchReportsFromDA(domain);
  } catch (err) {
    if (err.message?.includes('Failed to fetch') || err.message?.includes('CORS')) {
      console.warn('[Report Actions] Network/CORS error fetching reports');
      return [];
    }
    console.error('[Report Actions] Error:', err);
    return [];
  }
}

export function markReportAsViewed(path) {
  try {
    const viewed = getViewedReports();
    if (!viewed.includes(path)) {
      viewed.push(path);
      localStorage.setItem(VIEWED_KEY, JSON.stringify(viewed));
    }
  } catch (err) {
    console.error('[Report Actions] Error marking viewed:', err);
  }
}

export async function updateNotificationBadge() {
  const picker = document.querySelector('daterange-picker');
  if (!picker?.shadowRoot) return;

  // Remove all existing badges
  [
    ...picker.shadowRoot.querySelectorAll('.report-notification-badge'),
    ...picker.querySelectorAll('.report-notification-badge'),
    ...document.querySelectorAll('.report-notification-badge'),
  ].forEach((b) => b.remove());

  const reports = filterByWeek(await getSavedReports());
  const viewed = getViewedReports();
  const unviewed = reports.filter((r) => !viewed.includes(r.path));
  if (!unviewed.length) return;

  const wrapper = picker.shadowRoot.querySelector('.daterange-wrapper');
  if (!wrapper) return;

  const badge = Object.assign(document.createElement('div'), {
    className: 'report-notification-badge',
    title: 'unviewed OpTel reports',
    textContent: String(unviewed.length),
  });
  badge.style.cssText = STYLES.BADGE;
  wrapper.style.position = 'relative';
  wrapper.style.display = 'inline-block';
  wrapper.appendChild(badge);
}

function addReportToDropdown(result) {
  const dropdown = document.querySelector('daterange-picker')?.shadowRoot?.querySelector('ul.menu');
  if (!dropdown) return;

  let header = dropdown.querySelector('li.saved-reports-header');
  if (!header) {
    header = Object.assign(document.createElement('li'), {
      className: 'saved-reports-header',
      textContent: 'Saved Reports',
    });
    header.style.cssText = STYLES.HEADER;
    dropdown.appendChild(header);
  }

  const displayName = new Date(result.timestamp).toISOString().split('T')[0];
  const isViewed = getViewedReports().includes(result.path);

  const entry = Object.assign(document.createElement('li'), {
    className: 'saved-report-entry',
    textContent: displayName,
  });
  entry.dataset.reportPath = result.path;
  entry.style.cssText = isViewed ? STYLES.VIEWED : STYLES.UNVIEWED;

  entry.onclick = async () => {
    markReportAsViewed(result.path);
    entry.style.cssText = STYLES.VIEWED;
    await new Promise((r) => { setTimeout(r, 50); });
    await updateNotificationBadge();

    // Close dropdown
    const picker = document.querySelector('daterange-picker');
    const input = picker?.shadowRoot?.querySelector('input');
    if (input?.getAttribute('aria-expanded') === 'true') input.click();

    // eslint-disable-next-line import/no-cycle
    const { showReportInline } = await import('./report-viewer.js');
    showReportInline(result.path, displayName);
  };

  const lastEntry = Array.from(dropdown.querySelectorAll('li.saved-report-entry')).pop();
  (lastEntry || header).after(entry);
}

export async function initializeSavedReports() {
  try {
    const dropdown = document.querySelector('daterange-picker')?.shadowRoot?.querySelector('ul.menu');
    dropdown?.querySelectorAll('li.saved-report-entry, li.saved-reports-header').forEach((el) => el.remove());

    const allReports = await getSavedReports();

    // eslint-disable-next-line import/no-cycle
    const { checkForSharedReport } = await import('./report-viewer.js');
    await checkForSharedReport(() => Promise.resolve(allReports));

    filterByWeek(allReports).forEach(addReportToDropdown);
    setTimeout(updateNotificationBadge, 300);
  } catch (err) {
    console.error('[Report Actions] Error initializing:', err);
  }
}

/** Close modal, clean URL params, and open daterange picker */
function closeModalAndOpenDropdown() {
  document.querySelector('.report-modal-overlay')?.remove();

  const url = new URL(window.location);
  url.searchParams.delete('metrics');
  url.searchParams.delete('checkpoint');
  window.history.replaceState({}, '', url);

  document.querySelectorAll('facet-sidebar input[id^="checkpoint="]').forEach((el) => {
    el.checked = false;
    el.indeterminate = false;
  });

  window.slicerDraw?.().catch(() => {});

  setTimeout(() => {
    const input = document.querySelector('daterange-picker')?.shadowRoot?.querySelector('input');
    if (input && input.getAttribute('aria-expanded') !== 'true') {
      input.focus();
      input.click();
    }
  }, 800);
}

async function handleSaveReport(button, reportContent) {
  updateButtonState(button, true, 'Saving Report...');
  try {
    await uploadToDA(reportContent, { url: getCurrentAnalyzedUrl(), debug: true });
    updateButtonState(button, true, 'Report Saved Successfully!');
    await initializeSavedReports();
    await updateNotificationBadge();
    await new Promise((r) => { setTimeout(r, 300); });
    closeModalAndOpenDropdown();
  } catch (err) {
    console.error('[Report Actions] Save error:', err);
    updateButtonState(button, true, 'Error Saving Report');
    setTimeout(() => updateButtonState(button, false, 'Save Report'), 2000);
  }
}

export function setupReportActions(reportContent) {
  document.getElementById('save-report-btn')
    ?.addEventListener('click', (e) => handleSaveReport(e.target, reportContent));
}

window.initializeSavedReports = initializeSavedReports;
