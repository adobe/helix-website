import { URLReports, SERIES, toHumanReadable } from './news.js';
import { getConfig, getDetails, toReportURL } from './utils.js';

const main = async () => {
  const config = getConfig();

  const period = document.getElementById('period');
  period.innerHTML = `from ${config.start} to ${config.end}`;

  getDetails(config.url, config.articlesRootURL).then((details) => {
    const detailsElement = document.getElementById('details');
    detailsElement.innerHTML = `
      <ul>
        <li><label>URL: </label><a href="${details.url}" target="_blank">${details.url}</a></li>
        <li><label>Title: </label><span>${details.title}</span></li>
        <li><label>Auhor: </label><span>${details.author}</span></li>
        <li><label>Publication Date: </label><span>${details.publicationDate}</span></li>
        <li><label>Description: </label><span>${details.title}</p></span>
      </ul>
    `;
  });

  const report = new URLReports(config);
  report.init().then(() => {
    report.filter = {
      url: [config.url],
    };

    let urls = report.getURLs();
    const currentPageEntry = urls.find((entry) => entry.value === config.url);
    const media = report.getMedia();

    if (!currentPageEntry) {
      throw new Error('Current page not found in report');
    }

    let metrics = currentPageEntry.getMetrics(['pageViews', 'organic', 'visits', 'bounces', 'engagement', 'conversions', 'timeOnPage']);

    const businessMetricsElement = document.getElementById('businessMetrics');
    let ul = document.createElement('ul');
    businessMetricsElement.appendChild(ul);
    Object.keys(SERIES).forEach((key) => {
      const s = SERIES[key];
      const value = s.rateFn(metrics);
      const display = s.labelFn(value);

      const li = document.createElement('li');
      li.innerHTML = `<label>${s.label}: </label><span>${display}</span>`;
      ul.appendChild(li);
    });

    const mediaElement = document.getElementById('media');
    ul = document.createElement('ul');
    mediaElement.appendChild(ul);

    media.forEach((mi) => {
      const li = document.createElement('li');
      li.classList.add('media');
      li.innerHTML = `<img src="${config.url}/${mi.value}"> / ${mi.value} / ${toHumanReadable(mi.weight)}`;
      ul.appendChild(li);
    });

    report.filter = {
      underroot: [true],
    };

    const top10Element = document.getElementById('top10');
    ul = document.createElement('ul');
    top10Element.appendChild(ul);

    urls = report.getURLs();
    for (let i = 0; i < Math.min(10, urls.length); i += 1) {
      const entry = urls[i];
      metrics = entry.getMetrics(['pageViews']);
      const li = document.createElement('li');
      li.innerHTML = `<a href="${toReportURL(entry.value)}" target="_blank">${entry.value} (${toHumanReadable(metrics.pageViews.sum)})</a>`;
      ul.appendChild(li);
    }

    report.filter = {
      inrange: [true],
    };

    const top10ReleasedElement = document.getElementById('top10released');
    ul = document.createElement('ul');
    top10ReleasedElement.appendChild(ul);
    urls = report.getURLs();
    for (let i = 0; i < Math.min(10, urls.length); i += 1) {
      const entry = urls[i];
      metrics = entry.getMetrics(['pageViews']);
      const li = document.createElement('li');
      li.innerHTML = `<a href="${toReportURL(entry.value)}" target="_blank">${entry.value} / (${toHumanReadable(metrics.pageViews.sum)})</a>`;
      ul.appendChild(li);
    }
  });
};

main();
