/**
 * Report State Module - Manages viewed reports state and notifications
 */

import { fetchReportsFromDA, getCurrentAnalyzedUrl } from './da-upload.js';

const VIEWED_KEY = 'optel-detective-viewed-reports';

export const getViewedReports = () => {
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
      return [];
    }
    throw err;
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
    throw new Error(`Error marking viewed: ${err.message}`);
  }
}

export async function updateNotificationBadge() {
  const picker = document.querySelector('daterange-picker');
  if (!picker?.shadowRoot) return;

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
  wrapper.style.position = 'relative';
  wrapper.style.display = 'inline-block';
  wrapper.appendChild(badge);
}
