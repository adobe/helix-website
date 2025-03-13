import { utils } from '@adobe/rum-distiller';

const { isKnownFacet } = utils;

export default class ConversionTracker extends HTMLElement {
  updateState() {
    const conversionDef = Array.from(new URLSearchParams(window.location.search).entries())
      .filter(([key]) => key.startsWith('conversion.'))
      .map(([key, value]) => [key.replace('conversion.', ''), value]);

    this.definiton.innerHTML = '';

    const filterDef = Array.from(new URLSearchParams(window.location.search).entries())
      .filter(([key]) => isKnownFacet(key));

    (this.getAttribute('mode') === 'pending' ? filterDef : conversionDef)
      .forEach(([key, value]) => {
        const li = document.createElement('li');
        li.textContent = `${key}: ${value}`;
        this.definiton.appendChild(li);
      });

    if (this.getAttribute('mode') === 'pending') {
      this.button.textContent = 'confirm';
      this.button.disabled = false;
    } else if (conversionDef.length === 0 || (conversionDef.length === 1 && conversionDef[0][0] === 'checkpoint' && conversionDef[0][1] === 'click' && filterDef.length === 0)) {
      this.button.textContent = 'default';
      this.button.disabled = true;
      this.setAttribute('mode', 'default');
    } else if (conversionDef.length === 1 && conversionDef[0][0] === 'checkpoint' && conversionDef[0][1] === 'click' && filterDef.length > 0) {
      this.button.textContent = 'redefine';
      this.button.disabled = false;
    } else {
      this.button.textContent = 'reset';
      this.button.disabled = false;
      this.querySelector('h2').textContent = 'Conversions';
      this.title = 'Custom conversion definition';
      this.setAttribute('mode', 'custom');
    }
  }

  confirmConversion() {
    const usp = new URLSearchParams(window.location.search);
    // remove all conversion keys
    Array.from(usp.keys())
      .filter((key) => key.startsWith('conversion.'))
      .forEach((key) => usp.delete(key));
    // take each filter key and add it as a conversion key
    Array.from(usp.entries())
      .filter(([key]) => isKnownFacet(key))
      .forEach(([key, value]) => {
        usp.append(`conversion.${key}`, value);
      });
    // remove all filter keys
    Array.from(usp.keys())
      .filter((key) => !key.startsWith('conversion.'))
      .filter((key) => isKnownFacet(key))
      .forEach((key) => {
        usp.delete(key);
      });
    // reset the label
    this.button.textContent = 'appying...';
    this.button.disabled = true;
    this.removeAttribute('mode');
    // navigate to the new url
    window.location.href = `${window.location.pathname}?${usp.toString()}`;
  }

  resetConversion() {
    const usp = new URLSearchParams(window.location.search);
    // remove all conversion keys
    Array.from(usp.keys())
      .filter((key) => key.startsWith('conversion.'))
      .forEach((key) => usp.delete(key));

    // set the checkpoint to click
    usp.set('conversion.checkpoint', 'click');
    // reset the label
    this.button.textContent = 'appying...';
    this.button.disabled = true;
    // navigate to the new url
    window.location.href = `${window.location.pathname}?${usp.toString()}`;
  }

  connectedCallback() {
    // nothing yet
    this.button = document.createElement('button');
    this.button.textContent = 'redefine';
    this.button.title = 'Redefine what a conversion is';

    const h2 = this.querySelector('h2');
    h2.after(this.button);

    this.definiton = document.createElement('ol');
    this.updateState();
    this.append(this.definiton);

    document.addEventListener('urlstatechange', () => this.updateState());
    this.button.addEventListener('click', () => {
      if (this.button.textContent === 'reset') {
        this.resetConversion();
      } else if (this.getAttribute('mode') === 'pending') {
        // this is the confirmation.
        this.confirmConversion();
      } else {
        this.setAttribute('mode', 'pending');
        this.updateState();
      }
    });
  }
}
