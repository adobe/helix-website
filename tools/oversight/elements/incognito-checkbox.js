function getPersistentToken() {
  return localStorage.getItem('rum-bundler-token');
}

async function fetchDomainKey(domain) {
  try {
    const auth = getPersistentToken();
    let org;
    if (domain.endsWith(':all') && domain !== 'aem.live:all') {
      ([org] = domain.split(':'));
    }
    const issueResp = await fetch(`https://bundles.aem.page/${org ? `orgs/${org}/key` : `domainkey/${domain}`}`, {
      headers: {
        authorization: `Bearer ${auth}`,
      },
    });
    let domainkey = '';
    try {
      domainkey = (await issueResp.json())[org ? 'orgkey' : 'domainkey'];
    } catch (e) {
      // no domainkey
    }
    if (issueResp.status === 403 || domainkey === '') {
      // you don't have an admin key
      // let's see if we can get access anyway
      const n = new Date();
      const y = n.getFullYear();
      const m = String(n.getMonth() + 1).padStart(2, '0');
      const d = String(n.getDate()).padStart(2, '0');
      const probeResp = await fetch(`https://bundles.aem.page/bundles/${domain}/${y}/${m}/${d}?domainkey=open`);
      if (probeResp.status === 200) {
        return 'open';
      }
    }
    return domainkey;
  } catch (e) {
    return 'error';
  }
}

export default class IncognitoCheckbox extends HTMLElement {
  constructor() {
    super();
    this.template = `    
    <input type="checkbox" checked>
    <label class="eye" data-closed>
      <div class="eye__base">
        <div class="eye__base__view">
          <div class="eye__base__view__iris"></div>
          <div class="eye__base__view__pupil"></div>
        </div>
      </div>
      <div class="eye__lid">
        <div class="eye__lid__mask"></div>
        <div class="eye__lid__lashes">
          <div class="eye__lid__lashes__line"></div>
          <div class="eye__lid__lashes__hair"></div>
        </div>
      </div>
    </label>`;
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = this.template;

    const style = document.createElement('style');
    style.textContent = `    

    input {
      position: absolute;
      display: block;
      opacity: 0%;
      z-index: 1;
      width: 30px;
      height: 30px;
    }

    *,
    *:before,
    *:after {
      box-sizing: border-box;
    }

    .eye {
      position: relative;
      top: 5px;
      --box-size: 40px;
      --border-width: calc(var(--box-size) / 12);
      --hair-length: calc(var(--border-width) * 2);
      --iris-scale: 80%;
      --pupil-scale: 35%;
      --tansition-time: 0.15s;

      width: var(--box-size);
      height: var(--box-size);
      display: flex;
      align-items: center;
      justify-content: center;
      transform: scale(0.7);
    }

    .eye__base {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      border: solid var(--border-width) black;
      border-radius: 80% 0;
      transform: rotate(45deg);
      overflow: hidden;
    }

    .eye__base__view {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      transform: translate(15%, 20%);
      transition: transform calc(var(--tansition-time) * 1.5) ease-out;
    }

    .eye[data-closed] .eye__base__view {
      transform: translate(3%, 3%);
    }

    .eye__base__view__iris {
      width: var(--iris-scale);
      height: var(--iris-scale);
      border: solid var(--border-width) black;
      border-radius: 100%;
      transform: rotate(-45deg);
    }

    .eye__base__view__pupil {
      position: absolute;
      width: var(--pupil-scale);
      height: var(--pupil-scale);
      border: solid var(--border-width) black;
      border-radius: 100%;
      transform: rotate(-45deg);
    }

    .eye__lid {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .eye__lid__mask {
      position: absolute;
      width: 100%;
      height: 100%;
      background: white;
      border-radius: 80% 0;
      transform: rotate(45deg);
      transition: all var(--tansition-time) ease-out;
    }

    input:checked + .eye .eye__lid__mask {
      background: transparent;
      transform: rotate(45deg) translate(-20%, -20%);
    }

    .eye__lid__lashes {
      position: absolute;
      width: 100%;
      height: 100%;
      transition: transform var(--tansition-time) ease-out;
    }

    input:checked + .eye .eye__lid__lashes {
      transform: rotateX(180deg);
    }

    .eye__lid__lashes__line {
      position: absolute;
      width: 100%;
      height: 100%;
      border-bottom: solid var(--border-width) black;
      border-right: solid var(--border-width) black;
      border-radius: 80% 0;
      transform: rotate(45deg);
    }

    .eye__lid__lashes__hair {
      position: absolute;
      left: 50%;
      top: 105%;
      transform: translate(-50%, -50%);
      width: var(--border-width);
      height: var(--hair-length);
      background: black;
    }

    .eye__lid__lashes__hair:before {
      content: "";
      position: absolute;
      left: calc(var(--box-size) * -0.4);
      top: calc(var(--box-size) * -0.07);
      width: var(--border-width);
      height: var(--hair-length);
      background: black;
      transform: rotate(20deg);
    }

    .eye__lid__lashes__hair:after {
      content: "";
      position: absolute;
      left: calc(var(--box-size) * 0.4);
      top: calc(var(--box-size) * -0.07);
      width: var(--border-width);
      height: var(--hair-length);
      background: black;
      transform: rotate(-20deg);
    }
    `;
    this.shadowRoot.appendChild(style);
    this.input = this.shadowRoot.querySelector('input');
    const u = new URL(window.location.href);

    const urlkey = u.searchParams.get('domainkey');
    const returnToken = u.searchParams.get('returnToken');
    if (returnToken) {
      localStorage.setItem('rum-bundler-token', returnToken);
      const refreshURL = new URL(window.location.href);
      refreshURL.searchParams.delete('returnToken');
      window.location.href = refreshURL.href;
    }
    if (u.searchParams.get('returnTo') && getPersistentToken()) {
      const returnTo = new URL(u.searchParams.get('returnTo'));
      returnTo.searchParams.set('returnToken', getPersistentToken());
      window.location.href = returnTo.href;
    }

    if (urlkey === 'incognito' || !urlkey) {
      this.setAttribute('mode', 'loading');
      fetchDomainKey(u.searchParams.get('domain')).then((domainkey) => {
        if (domainkey === 'error') {
          this.setAttribute('mode', 'error');
          return;
        }
        this.domainkey = domainkey;
        this.setAttribute('domainkey', domainkey);
        if (urlkey === 'incognito') {
          this.setAttribute('mode', 'incognito');
          this.input.checked = false;
        } else {
          this.setAttribute('mode', 'open');
          this.input.checked = true;
          u.searchParams.set('domainkey', domainkey);
        }
        const e = new Event('change');
        this.dispatchEvent(e);

        window.history.replaceState({}, '', u);
      });
    } else {
      this.domainkey = urlkey;
      this.setAttribute('domainkey', urlkey);
      if (getPersistentToken()) {
        this.setAttribute('mode', 'open');
      } else {
        this.setAttribute('mode', 'provided');
      }
    }
    this.input.addEventListener('change', this.toggleEye.bind(this));
  }

  toggleEye() {
    if (!this.input.checked) {
      const u = new URL(window.location.href);
      this.domainkey = u.searchParams.get('domainkey');
      this.setAttribute('domainkey', this.domainkey);
      this.setAttribute('mode', 'incognito');
      u.searchParams.set('domainkey', 'incognito');
      window.history.replaceState({}, '', u);
    } else {
      const u = new URL(window.location.href);
      u.searchParams.set('domainkey', this.domainkey);
      this.setAttribute('mode', 'open');
      window.history.replaceState({}, '', u);
    }
  }
}
