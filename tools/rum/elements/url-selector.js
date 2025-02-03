function getPersistentToken() {
  return localStorage.getItem('rum-bundler-token');
}

function isIncognitoMode() {
  return new URL(window.location.href).searchParams.get('domainkey') === 'incognito';
}

export default class URLSelector extends HTMLElement {
  constructor() {
    super();
    this.template = `
      <style>
        url-selector label {
          display: block;
          margin-right: 8px;
        }

        url-selector input {
          width: 100%;
          display: block;
          font: inherit;
          font-size: var(--type-heading-xl-size);
          font-weight: 900;
          letter-spacing: -0.04em;
          border: 0;
        }

        url-selector input:disabled {
          background-color: transparent;
          color: black;
        }
      </style>
      <label for="url"><img src="https://www.aem.live/favicon.ico"></label>
      <input id="url" type="url" list="rum-domain-suggestions">
      <datalist id="rum-domain-suggestions"></datalist>
    `;
  }

  connectedCallback() {
    this.innerHTML = this.template;
    const datalist = this.querySelector('datalist');
    const input = this.querySelector('input');
    input.value = new URL(window.location.href).searchParams.get('domain');
    const img = this.querySelector('img');
    img.src = `https://www.google.com/s2/favicons?domain=${input.value.split(':')[0]}&sz=64`;

    if (!getPersistentToken()) {
      input.disabled = true;
      datalist.remove();
    }

    input.addEventListener('mouseover', () => {
      const token = getPersistentToken();
      if (token && !isIncognitoMode()) {
        fetch('https://bundles.aem.page/domains?suggested=true', {
          headers: {
            accept: 'application/json',
            authorization: `Bearer ${token}`,
          },
        }).then(async (resp) => {
          if (!resp.ok) {
            datalist.remove();
          } else {
            const { domains } = await resp.json();
            input.setAttribute('data-all-domains', domains.join(','));
          }
        }).catch(() => {
          datalist.remove();
        });
      }
    }, { once: true });

    input.addEventListener('focus', () => {
      input.select();
    });

    input.addEventListener('input', () => {
      // filter the domains and append to the datalist
      const allDomains = input.getAttribute('data-all-domains').split(',');
      datalist.innerHTML = '';
      let limit = 10;
      for (let i = 0; i < allDomains.length; i += 1) {
        const domain = allDomains[i];
        if (domain.startsWith(input.value)) {
          const option = document.createElement('option');
          option.value = domain;
          datalist.appendChild(option);
          limit -= 1;
        }
        if (limit === 0) {
          break;
        }
      }

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
      let domain = event.detail;
      try {
        const entered = new URL(`https://${domain}`);
        domain = entered.hostname;
      } catch (e) {
        // ignore, some domains are not valid URLs
      }
      const goto = new URL(window.location.pathname, window.location.origin);
      goto.searchParams.set('domain', domain);
      goto.searchParams.set('view', 'month');
      window.location.href = goto.href;
    });
  }

  get value() {
    return this.querySelector('input').value;
  }
}
