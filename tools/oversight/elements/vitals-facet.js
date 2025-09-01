import { toHumanReadable } from '../utils.js';

export default class VitalsFacet extends HTMLElement {
  constructor() {
    super();
    this.placeholders = {};
  }

  get dataChunks() {
    return this.parentElement.parentElement.dataChunks;
  }

  connectedCallback() {
    if (this.dataChunks) this.update();
  }

  update() {
    const facetName = this.getAttribute('facet');

    const u = new URL(window.location.href);
    const { searchParams } = u;

    const facetEntries = this.dataChunks.facets[facetName];

    const fieldSet = this.querySelector('fieldset') || document.createElement('fieldset');
    const legendText = this.querySelector('legend')?.textContent || facetName;

    fieldSet.textContent = '';

    facetEntries.forEach(({ name, value, weight }) => {
      const div = document.createElement('div');
      div.classList.add('facet-entry');
      div.dataset.name = name;
      div.dataset.value = value;
      div.dataset.weight = weight;
      const label = document.createElement('label');
      label.textContent = `${value.replace(/(good|poor|ni)(.+)$/, (_, m, metric) => {
        if (m === 'ni') return `${metric} ni `;
        return `${metric} ${m}`;
      })}: ${toHumanReadable(weight)}`;
      label.htmlFor = `${name}=${value}`;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `${name}=${value}`;
      input.value = value;
      input.checked = searchParams.has(facetName) && searchParams.getAll(facetName).includes(value);

      input.addEventListener('change', (evt) => {
        evt.stopPropagation();
        this.parentElement.parentElement.dispatchEvent(new Event('facetchange'));
      });

      div.append(input, label);

      fieldSet.append(div);
    });

    const legend = this.querySelector('legend') || document.createElement('legend');
    legend.textContent = legendText;

    const drilldownAtt = this.getAttribute('drilldown');

    if (drilldownAtt && searchParams.get('drilldown') !== facetName) {
      const drilldown = document.createElement('a');
      drilldown.className = 'drilldown';
      drilldown.href = drilldownAtt;
      drilldown.title = 'Drill down to more details';
      drilldown.textContent = '';
      drilldown.addEventListener('click', () => {
        const drilldownurl = new URL(drilldown.href, window.location);
        drilldownurl.search = new URL(window.location).search;
        drilldownurl.searchParams.delete(facetName);
        drilldownurl.searchParams.set('drilldown', facetName);
        drilldown.href = drilldownurl.href;
      });
      legend.append(drilldown);
    } else if (searchParams.get('drilldown') === facetName) {
      const drillup = document.createElement('a');
      drillup.className = 'drillup';
      drillup.href = 'explorer.html';
      drillup.title = 'Return to previous level';
      drillup.textContent = '';
      drillup.addEventListener('click', () => {
        const drillupurl = new URL(drillup.href, window.location);
        drillupurl.search = new URL(window.location).search;
        drillupurl.searchParams.delete(facetName);
        drillupurl.searchParams.delete('drilldown', facetName);
        drillup.href = drillupurl.href;
      });
      legend.append(drillup);
    }

    fieldSet.append(legend);
    // append fieldset
    this.append(fieldSet);
  }
}
