/**
 * Report Actions Module - Handles report saving functionality
 */
import { uploadToDA, getCurrentAnalyzedUrl, fetchReportsFromDA } from './da-upload.js';
import { updateButtonState } from './modal-ui.js';
import { closeReportModal } from './generate-ai-rum-report.js';
import { showReportInline } from './report-viewer/report-viewer.js';

const CONFIG = {
  VIEWED_KEY: 'optel-detective-viewed-reports',
  ERROR_TIMEOUT: 2000,
  STYLES: {
    HEADER: 'font-weight: 600; color: #333; padding-top: 12px; margin-top: 12px; border-top: 2px solid #ccc; cursor: default; pointer-events: none;',
    ENTRY_UNVIEWED: 'color: #147af3; padding-left: 2rem; cursor: pointer; font-size: 14px; line-height: 1.4; font-weight: 600;', // --dark-blue
    ENTRY_VIEWED: 'color: #7326d3; padding-left: 2rem; cursor: pointer; font-size: 14px; line-height: 1.4; font-weight: normal;', // --dark-purple
    BADGE: 'position: absolute; top: -4px; right: -4px; min-width: 20px; width: 20px; height: 20px; background: #ff7c65; border-radius: 50%; z-index: 1000; pointer-events: none; color: white; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); line-height: 1;', // --medium-red from rum-slicer.css
  },
};

export function setupReportActions(reportContent) {
  document.getElementById('save-report-btn')?.addEventListener('click', (e) => 
    handleSaveReport(e.target, reportContent)
  );
}

async function handleSaveReport(button, reportContent) {
  updateButtonState(button, true, '💾 Saving...');
  try {
    const currentUrl = getCurrentAnalyzedUrl();
    await uploadToDA(reportContent, { url: currentUrl, debug: true });
    
    updateButtonState(button, true, 'Report Saved Successfully');
    
    // Refresh the reports list from DA after successful save
    await initializeSavedReports();
    await updateNotificationBadge();
  } catch (error) {
    console.error('[OpTel Detective Report] Error saving report:', error);
    updateButtonState(button, true, '❌ Error Saving Report');
    setTimeout(() => updateButtonState(button, false, '💾 Save Report'), CONFIG.ERROR_TIMEOUT);
  }
}

export async function getSavedReports() {
  try {
    return await fetchReportsFromDA();
  } catch (error) {
    console.error('[OpTel Detective Report] Error fetching saved reports:', error);
    return [];
  }
}

function getViewedReports() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.VIEWED_KEY) || '[]');
  } catch {
    return [];
  }
}

function getWeekIdentifier(timestamp) {
  const date = new Date(timestamp);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((date - yearStart) / 86400000 + yearStart.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${weekNumber}`;
}

function filterReportsByWeek(reports) {
  const weekMap = new Map();
  
  reports.forEach(report => {
    const week = getWeekIdentifier(report.timestamp);
    if (!weekMap.has(week) || report.timestamp > weekMap.get(week).timestamp) {
      weekMap.set(week, report);
    }
  });
  
  return Array.from(weekMap.values()).sort((a, b) => b.timestamp - a.timestamp);
}

function markReportAsViewed(path) {
  try {
    const viewed = getViewedReports();
    if (!viewed.includes(path)) {
      viewed.push(path);
      localStorage.setItem(CONFIG.VIEWED_KEY, JSON.stringify(viewed));
    }
  } catch (error) {
    console.error('[OpTel Detective Report] Error marking viewed:', error);
  }
}

async function hasUnviewedReports() {
  const allReports = await getSavedReports();
  const filteredReports = filterReportsByWeek(allReports);
  return filteredReports.some(r => !getViewedReports().includes(r.path));
}

async function updateNotificationBadge() {
  const picker = document.querySelector('daterange-picker');
  if (!picker?.shadowRoot) return;
  
  // Remove ALL existing badges from everywhere
  const allBadges = [
    ...picker.shadowRoot.querySelectorAll('.report-notification-badge'),
    ...picker.querySelectorAll('.report-notification-badge'),
    ...document.querySelectorAll('.report-notification-badge'),
  ];
  allBadges.forEach(badge => badge.remove());
  
  // Force a fresh check for unviewed reports (don't cache)
  const allReports = await getSavedReports();
  const filteredReports = filterReportsByWeek(allReports);
  const viewedReports = getViewedReports();
  const unviewedReports = filteredReports.filter(r => !viewedReports.includes(r.path));
  
  // If no unviewed reports, we're done (badge already removed above)
  if (unviewedReports.length === 0) return;
  
  const wrapper = picker.shadowRoot.querySelector('.daterange-wrapper');
  if (!wrapper) return;
  
  // Create badge with unviewed count
  const badge = Object.assign(document.createElement('div'), {
    className: 'report-notification-badge',
    title: 'unviewed OpTel reports',
    textContent: unviewedReports.length.toString(),
  });
  badge.style.cssText = CONFIG.STYLES.BADGE;
  
  wrapper.style.position = 'relative';
  wrapper.style.display = 'inline-block';
  wrapper.appendChild(badge);
}

function addReportToDateRangePicker(result) {
  const dropdown = document.querySelector('daterange-picker')?.shadowRoot?.querySelector('ul.menu');
  if (!dropdown) return;

  let header = dropdown.querySelector('li.saved-reports-header');
  if (!header) {
    header = Object.assign(document.createElement('li'), {
      className: 'saved-reports-header',
      textContent: 'Saved Reports',
    });
    header.style.cssText = CONFIG.STYLES.HEADER;
    dropdown.appendChild(header);
  }

  const isViewed = getViewedReports().includes(result.path);
  const entry = Object.assign(document.createElement('li'), {
    className: 'saved-report-entry',
    textContent: result.filename,
  });
  entry.dataset.reportPath = result.path;
  entry.style.cssText = isViewed ? CONFIG.STYLES.ENTRY_VIEWED : CONFIG.STYLES.ENTRY_UNVIEWED;
  entry.onclick = async () => {
    // Mark as viewed first
    markReportAsViewed(result.path);
    
    // Update the UI to show it's been viewed
    entry.style.cssText = CONFIG.STYLES.ENTRY_VIEWED;
    
    // Force a small delay to ensure localStorage write completes before badge check
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Update the notification badge (this will remove it if no unviewed reports remain)
    await updateNotificationBadge();
    
    // Show the report
    showReportInline(result.path, result.filename);
  };
  
  // Find the last saved report entry or insert right after header
  const lastEntry = Array.from(dropdown.querySelectorAll('li.saved-report-entry')).pop();
  if (lastEntry) {
    lastEntry.after(entry);
  } else {
    header.after(entry);
  }
}

export async function initializeSavedReports() {
  try {
    // Clear existing report entries
    const dropdown = document.querySelector('daterange-picker')?.shadowRoot?.querySelector('ul.menu');
    if (dropdown) {
      dropdown.querySelectorAll('li.saved-report-entry, li.saved-reports-header').forEach(el => el.remove());
    }
    
    const allReports = await getSavedReports();
    const filteredReports = filterReportsByWeek(allReports);
    filteredReports.forEach(addReportToDateRangePicker);
    setTimeout(async () => await updateNotificationBadge(), 300);
  } catch (error) {
    console.error('[OpTel Detective Report] Error initializing saved reports:', error);
  }
}

