export default class ConversionTracker extends HTMLElement {
  connectedCallback() {
    // nothing yet
    const button = document.createElement('button');
    button.textContent = 'redefine';
    button.title = 'Redefine what a conversion is';

    const h2 = this.querySelector('h2');
    h2.after(button);
  }
}
