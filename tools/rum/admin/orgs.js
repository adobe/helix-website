/* eslint-disable import/no-unresolved */
import { html, LitElement } from 'lit';
import styles from './orgs.css.js';

const API = 'https://rum.fastly-aem.page';

let token;
const fetchAPI = async (path, opts = {}) => fetch(`${API}${path}`, {
  ...opts,
  headers: {
    Authorization: `Bearer ${token}`,
    ...(opts.headers || {}),
  },
});

class AdminOrgs extends LitElement {
  static properties = {
    denied: { type: Boolean },
    ready: { type: Boolean },
    orgs: { type: Array },
    selectedOrg: { type: String },
    invalidOrg: { type: Boolean },
    domains: { type: Array },
  };

  static get styles() {
    return [styles];
  }

  domains = [];

  orgs = [];

  async connectedCallback() {
    super.connectedCallback();

    // fetch orgs, on 404
    await this.init();
    this.ready = true;
  }

  async init() {
    token = localStorage.getItem('rum-admin-token');
    if (!token) {
      token = localStorage.getItem('rum-bundler-token');
    }
    if (!token) {
      token = prompt('Please enter your key');
      if (!token) {
        this.denied = true;
        return;
      }
      localStorage.setItem('rum-admin-token', token);
    }

    const res = await fetchAPI('/orgs');
    if (!res.ok) {
      if ([401, 403].includes(res.status)) {
        this.denied = true;
        localStorage.setItem('rum-admin-token', '');
      } else {
        // TODO: show error
        console.error(`failed to fetch (${res.status}): `, res);
      }
      return;
    }

    const { orgs } = await res.json();
    console.debug('loaded orgs: ', orgs);
    this.orgs = orgs;

    // fetch needed components
    await import('@spectrum-web-components/combobox@0.42.5/sp-combobox.js');
    await import('@spectrum-web-components/table@0.42.5/sp-table.js');
    await import('@spectrum-web-components/table@0.42.5/sp-table-head.js');
    await import('@spectrum-web-components/table@0.42.5/sp-table-head-cell.js');
    await import('@spectrum-web-components/table@0.42.5/sp-table-cell.js');
    // await import('@spectrum-web-components/button@0.42.5/sp-button.js');
    await import('@spectrum-web-components/alert-dialog@0.42.5/sp-alert-dialog.js');
    await import('@spectrum-web-components/textfield@0.42.5/sp-textfield.js');
    await import('@spectrum-web-components/dialog@0.42.5/sp-dialog-wrapper.js');
    await import('@spectrum-web-components/overlay@0.42.5/overlay-trigger.js');
  }

  onOrgChange(e) {
    const org = e.target.value;
    console.log('org selected: ', org);
    this.domains = [];

    if (!this.orgs.includes(org)) {
      this.selectedOrg = org;
      this.invalidOrg = true;
      return;
    }
    this.loadDomains(org).then(() => {
      this.selectedOrg = org;
      this.invalidOrg = false;
    });
  }

  async loadDomains(org = this.selectedOrg) {
    const res = await fetchAPI(`/orgs/${org}/domains`);
    if (!res.ok) {
      console.error(`failed to fetch (${res.status}): `, res);
      return;
    }

    const { domains } = await res.json();
    console.debug('loaded domains: ', domains);
    this.domains = domains;
  }

  domainRow(domain) {
    return html`
      <sp-table-row>
        <sp-table-cell>
          <div class="table-cell-row">
            <div class="row-content">
              <p>${domain}</p>
            </div>

            <div class="row-actions">
              <overlay-trigger type="modal">
                <sp-dialog-wrapper
                    id="remove-domain-dialog"
                    slot="click-content"
                    headline="Remove domain?"
                    dismissable
                    dismiss-label="Close"
                    underlay>
                      <div class="confirm-dialog">
                        <div class="confirm-dialog__actions">
                          <sp-button 
                            variant="negative"
                            @click=${this.onRemoveDomain(domain)}>Remove</sp-button>
                          <sp-button 
                            variant="secondary" 
                            onclick="javascript: this.dispatchEvent(new Event('close', {bubbles: true, composed: true}));">
                            Cancel
                          </sp-button>
                        </div>
                      </div>
                </sp-dialog-wrapper>
              <sp-button slot="trigger" variant="negative">Remove</sp-button>
            </overlay-trigger>
          </div>
        </div>
        </sp-table-cell>
      </sp-table-row>`;
  }

  orgTable() {
    if (this.invalidOrg) {
      return html`<div></div>`;
    }

    return html`
      <sp-table>
        <sp-table-head>
          <sp-table-head-cell>Domains</sp-table-head-cell>
        </sp-table-head>
        <sp-table-body>
          ${this.domains.map((domain) => this.domainRow(domain))}
        </sp-table-body>
      </sp-table>`;
  }

  onRemoveDomain(domain) {
    return async () => {
      console.log('remove domain: ', domain);

      const dialog = this.shadowRoot.querySelector('sp-dialog-wrapper#remove-domain-dialog');
      const resp = await fetchAPI(`/orgs/${this.selectedOrg}/domains/${domain}`, { method: 'DELETE' });
      if (!resp.ok) {
        console.error(`failed to remove domain (${resp.status}): `, resp);
        // TODO: error toast
        return;
      }

      // await this.loadDomains();
      this.domains = this.domains.filter((d) => d !== domain);
      this.requestUpdate();

      dialog.dispatchEvent(new Event('close', { bubbles: true, composed: true }));
    };
  }

  async onAddDomains() {
    const dialog = this.shadowRoot.querySelector('sp-dialog-wrapper#add-domains-dialog');
    const textfield = dialog.querySelector('sp-textfield');
    const domains = textfield.value.split(/,|\n/).map((d) => d.trim()).filter((d) => d);
    console.log('add domains: ', domains);

    const resp = await fetchAPI(`/orgs/${this.selectedOrg}/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domains }),
    });
    if (!resp.ok) {
      console.error(`failed to add domains (${resp.status}): `, resp);
      return;
    }

    // await this.loadDomains();
    this.domains = [...new Set([...this.domains, ...domains])];
    this.requestUpdate();

    dialog.dispatchEvent(new Event('close', { bubbles: true, composed: true }));
  }

  orgActions() {
    if (this.invalidOrg) {
      return html`<div></div>`;
    }

    return html`
      <div class="org-actions">
        <overlay-trigger type="modal">
          <sp-dialog-wrapper
              id="add-domains-dialog"
              slot="click-content"
              headline="Add domains"
              dismissable
              dismiss-label="Close"
              underlay
              footer="">
                <div class="confirm-dialog">
                  <div class="confirm-dialog__content">
                    <sp-textfield label="Domains" multiline placeholder="Enter domains, comma and/or line delimited"></sp-textfield>
                  </div>

                  <div class="confirm-dialog__actions">
                    <sp-button 
                      variant="primary"
                      @click=${this.onAddDomains}>Add</sp-button>
                    <sp-button 
                      variant="secondary" 
                      onclick="javascript: this.dispatchEvent(new Event('close', {bubbles: true, composed: true}));">
                      Cancel
                    </sp-button>
                  </div>
                </div>
          </sp-dialog-wrapper>
          <sp-button slot="trigger" variant="primary">Add domains</sp-button>
        </overlay-trigger>
      </div>`;
  }

  view() {
    if (this.denied) {
      return html`<div>Access Denied</div>`;
    }

    return html`
      <div class="container">
        <div id="nav">
          <sp-combobox 
            .options=${this.orgs.map((o) => ({ itemText: o, value: o }))}
            @change=${this.onOrgChange}
            ?invalid=${this.invalidOrg}
          >
            <sp-help-text slot="negative-help-text">
              Invalid org selected
            </sp-help-text>
          </sp-combobox>
          ${this.selectedOrg
    ? this.orgActions()
    : ''
}
        </div>

        <div id="main">
          ${this.selectedOrg
    ? this.orgTable(this.domains)
    : html`<div class="note"><p>Select an org</p></div>`}
        </div>
      </div>`;
  }

  render() {
    return html`
      <div class="container">
      <h1>RUM Org Manager</h1>
${
  this.ready
    ? this.view()
    : html`
      <div class="loader">
        <sp-progress-circle indeterminate></sp-progress-circle>
      </div>`
}
      </div>`;
  }
}

customElements.define('admin-orgs', AdminOrgs);
