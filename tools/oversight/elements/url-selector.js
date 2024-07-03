function getPersistentToken() {
  return localStorage.getItem('rum-bundler-token');
}

export default class URLSelector extends HTMLElement {
  constructor() {
    super();
    this.template = `
      <style>
        label {
          display: block;
          margin-right: 8px;
        }

        input {
          width: 100%;
          display: block;
          font: inherit;
          font-size: var(--type-heading-xl-size);
          font-weight: 900;
          letter-spacing: -0.04em;
          border: 0;
        }

        input:disabled {
          background-color: transparent;
          color: black;
        }
      </style>
      <label for="url"><img src="https://www.aem.live/favicon.ico"></label>
      <input id="url" type="url">
    `;
  }

  connectedCallback() {
    this.innerHTML = this.template;
    const input = this.querySelector('input');
    input.value = new URL(window.location.href).searchParams.get('domain');
    const img = this.querySelector('img');
    img.src = `https://www.google.com/s2/favicons?domain=${input.value}&sz=64`;

    if (!getPersistentToken()) {
      input.disabled = true;

      // detect a click with shift key pressed
      img.addEventListener('click', (event) => {
        if (event.shiftKey) {
          const targetlocation = new URL('https://oversight-trampoline--helix-website--adobe.aem.live/tools/oversight/explorer.html');
          targetlocation.searchParams.set('domain', input.value);
          targetlocation.searchParams.set('returnTo', window.location.href);
          window.location.href = targetlocation.href;
        }
      });
    }

    input.addEventListener('focus', () => {
      input.select();
    });

    input.addEventListener('input', () => {
      this.dispatchEvent(new CustomEvent('change', { detail: input.value }));
    });

    input.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.dispatchEvent(new CustomEvent('submit', { detail: input.value }));
      }
    });

    input.addEventListener('unfocus', () => {
      this.dispatchEvent(new CustomEvent('submit', { detail: input.value }));
    });

    this.addEventListener('submit', (event) => {
      try {
        const entered = new URL(`https://${event.detail}`);
        const goto = new URL(window.location.pathname, window.location.origin);
        goto.searchParams.set('domain', entered.hostname);
        goto.searchParams.set('view', 'month');
        window.location.href = goto.href;
      } catch (e) {
        console.error('Invalid URL', e, event.detail);
      }
    });
  }

  get value() {
    return this.querySelector('input').value;
  }
}
