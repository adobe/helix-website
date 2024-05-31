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
    console.log('VitalsFacet connected', this);
    if (this.dataChunks) this.update();
  }

  update() {
    const facetName = this.getAttribute('facet');

    const u = new URL(window.location.href);
    const { searchParams } = u;

    const facetEntries = this.dataChunks.facets[facetName];

    const fieldSet = this.querySelector('fieldset') || document.createElement('fieldset');
    const legendText = this.querySelector('legend')?.textContent || facetName;

    console.log('facetEntries', facetEntries);
    fieldSet.textContent = '';

    facetEntries.forEach(({ name, value, weight }) => {
      const div = document.createElement('div');
      div.classList.add('facet-entry');
      div.dataset.name = name;
      div.dataset.value = value;
      div.dataset.weight = weight;
      const label = document.createElement('label');
      label.textContent = `${value.replace(/good|poor|ni/, '')}: ${toHumanReadable(weight)}`;
      label.htmlFor = `${name}=${value}`;
      div.append(label);
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `${name}=${value}`;
      input.value = value;
      input.checked = searchParams.has(facetName) && searchParams.get(facetName) === value;

      input.addEventListener('change', (evt) => {
        evt.stopPropagation();
        this.parentElement.parentElement.dispatchEvent(new Event('facetchange'));
      });

      div.append(input);

      fieldSet.append(div);
    });

    const legend = this.querySelector('legend') || document.createElement('legend');
    legend.textContent = legendText;
    fieldSet.append(legend);
    // append fieldset
    this.append(fieldSet);
  }
}
