import { toReportURL } from '../utils.js';

function buildTableEl(label, title) {
  const table = document.createElement('table');
  const caption = document.createElement('caption');
  caption.innerHTML = `Top <span class="top-total"></span> Blog Posts ${title || ''} by Page Views`;
  const head = document.createElement('thead');
  head.innerHTML = `<tr>
      <th scope="col">Blog Post</th>
      <th scope="col"><span data-before="by">${label}</span></th>
    </tr>`;
  const body = document.createElement('tbody');
  const foot = document.createElement('tfoot');
  foot.innerHTML = `<tr>
      <td><span class="post-count"></span> blog posts</td>
      <td class="metric-sum"><span data-before="with" data-after="page views"></span></td>
    </tr>`;
  table.append(caption, head, body, foot);
  return table;
}

export default function buildTop10TableBlock(urls, currentEntry, config, id, title) {
  const container = document.getElementById(id);
  if (container) {
    if (container.querySelector('table')) {
      container.querySelector('table').remove();
    }
    const table = buildTableEl('Page Views', title);
    container.append(table);
    const body = table.querySelector('tbody');
    let sum = 0;
    let i = 0;
    for (i; i < Math.min(10, urls.length); i += 1) {
      const entry = urls[i];
      const metrics = entry.getMetrics(['pageViews']);
      const rate = metrics.pageViews.sum;
      sum += rate;
      const row = document.createElement('tr');
      if (entry && entry.value === currentEntry.value) {
        row.className = 'entry-match';
      }
      const u = new URL(entry.value);
      row.innerHTML = `<td>
          <a href="${toReportURL(entry.value)}" target="_blank">
            ${u.pathname}
          </a>
        </td>
        <td>
          <span class="bar" data-value="${rate}"></span>
          <span>${rate.toLocaleString()}</span>
        </td>`;
      body.append(row);
    }

    // populate table footer
    const foot = table.querySelector('tfoot');
    foot.querySelector('.post-count').textContent = i.toLocaleString();
    foot.querySelector('.metric-sum span').textContent = sum.toLocaleString();

    // update bars with the percentage width
    const bars = body.querySelectorAll('td .bar');
    bars.forEach((bar) => {
      const value = parseInt(bar.dataset.value, 10);
      const percentage = Math.floor((value / sum) * 100);
      bar.style.width = `${percentage}%`;
    });

    // populate table caption
    const caption = table.querySelector('caption');
    caption.querySelector('.top-total').textContent = i;
  }
}
