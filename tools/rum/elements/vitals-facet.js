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

    const cvws = ['CLS', 'FID', 'LCP'];
    const classes = ['good', 'ni', 'poor'];

    const facetEntries = this.dataChunks[facetName];

    const fieldSet = this.querySelector('fieldset') || document.createElement('fieldset');
    const legendText = this.querySelector('legend')?.textContent || facetName;

    fieldSet.textContent = '';

    const legend = this.querySelector('legend') || document.createElement('legend');
    legend.textContent = legendText;
    fieldSet.append(legend);
    // append fieldset
    this.append(fieldSet);
  }
}
