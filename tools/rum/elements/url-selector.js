export default class URLSelector extends HTMLHeadingElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 1em 0;
        }
        label {
          display: block;
          font-weight: bold;
          margin-bottom: 0.5em;
        }
        input {
          width: 100%;
          padding: 0.5em;
          font-size: 1em;
        }
      </style>
      <label for="url">URL</label>
      <input id="url" type="url" placeholder="https://example.com">
    `;
  }

  get value() {
    return this.shadowRoot.querySelector('input').value;
  }

  set value(value) {
    this.shadowRoot.querySelector('input').value = value;
  }
}
