import { stats } from '@adobe/rum-distiller';
import { findNearestVulgarFraction } from '../utils.js';

const { roundToConfidenceInterval, samplingError } = stats;

export default class NumberFormat extends HTMLElement {
  constructor() {
    super();
    this.mutationObserver = null;
  }

  connectedCallback() {
    this.mutationObserver = new MutationObserver(() => {
      const fv = this.querySelector('span.formatted-value');
      if (!fv) this.updateState();
    });
    this.updateState();
    this.mutationObserver.observe(this, { childList: true });
  }

  updateState() {
    const isPureNumber = !!this.textContent.trim().match(/^\d+(\.\d+)?$/);
    const titleValue = parseFloat((this.getAttribute('title') || '').replace(/ .*/g, ''), 10);
    const contentValue = parseFloat(this.textContent, 10);
    const number = isPureNumber
      ? contentValue
      : titleValue || contentValue;

    const sampleSize = parseInt(this.getAttribute('sample-size'), 10);
    const total = parseInt(this.getAttribute('total'), 10);
    const precision = parseInt(this.getAttribute('precision'), 10);
    const fuzzy = this.getAttribute('fuzzy') !== 'false';
    const fv = document.createElement('span');
    fv.classList.add('formatted-value');
    if (Number.isNaN(number)) {
      fv.textContent = '-';
      this.setAttribute('title', 'no data available');
      this.replaceChildren(fv);
    } else {
      fv.textContent = roundToConfidenceInterval(
        number,
        Number.isNaN(sampleSize) ? 0 : sampleSize,
        precision,
        fuzzy,
      );
      this.replaceChildren(fv);

      // set the title to the original number
      this.title = number;
      if (!Number.isNaN(sampleSize)) {
        this.title = `${number} ±${samplingError(number, sampleSize)}`;
      }
      // remove all classes ending with '-of-total'
      Array.from(this.classList)
        .filter((cls) => cls.endsWith('-of-total'))
        .forEach((cls) => {
          this.classList.remove(cls);
        });
      // if the total is given, add the percentage class
      if (!Number.isNaN(total) && total > 0) {
        const fraction = number / total;
        this.classList.add(`${findNearestVulgarFraction(fraction)}-of-total`);
      }
    }
    if (this.getAttribute('trend')) {
      this.title += ` and ${this.getAttribute('trend')}`;
    }
  }
}
