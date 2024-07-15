const API = 'https://rum.fastly-aem.page';

let token;
const fetchAPI = async (path, opts = {}) => fetch(`${API}${path}`, {
  ...opts,
  headers: {
    Authorization: `Bearer ${token}`,
    ...(opts.headers || {}),
  },
});

/** @type {Console} */
const log = Object.fromEntries(
  Object.entries(console).map(([key, fn]) => {
    if (typeof fn !== 'function') {
      return [key, fn];
    }
    return [key, fn.bind(null, '[admin/orgs.js]')];
  }),
);

/** @type {HTMLDivElement} */
const mainDiv = document.getElementById('rumadmin');
/** @type {HTMLDivElement} */
const orgDetails = document.getElementById('org-details');
/** @type {HTMLDivElement} */
const orgActionsDiv = document.getElementById('org-actions');
/** @type {HTMLInputElement} */
const orgSelectedInput = document.getElementById('org-selected');
/** @type {HTMLButtonElement} */
const btnShowOrgkey = document.getElementById('btn-show-orgkey');
/** @type {HTMLButtonElement} */
const btnAddDomains = document.getElementById('btn-add-domains');
/** @type {HTMLButtonElement} */
const btnRemoveDomains = document.getElementById('btn-remove-domains');
/** @type {HTMLButtonElement} */
const btnCreateOrg = document.getElementById('btn-create-org');
/** @type {HTMLDataListElement} */
const orgDataList = document.getElementById('org-list');

const store = new (class {
  /** @type {string} */
  selectedOrg = undefined;

  /** @type {boolean} */
  denied = false;

  /** @type {boolean} */
  error = false;

  /**
   * org => domain map
   * @type {Map<string, string[]>}
   */
  orgDomainMap = new Map();

  /** @type {Set<string>} */
  selectedDomains = new Set();

  /** @type {Map<string, string>} */
  orgkeyMap = new Map();

  get orgDomains() {
    return this.orgDomainMap.get(this.selectedOrg);
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
        log.error(`failed to fetch (${res.status}): `, res);
        this.error = true;
      }
      return;
    }

    this.error = false;
    this.denied = false;
    const { orgs } = await res.json();
    this.orgs = orgs;
    log.debug('loaded orgs: ', orgs);

    // if org is selected, load it
    const selectedOrg = new URLSearchParams(window.location.search).get('org');
    if (selectedOrg) {
      await this.setSelectedOrg(selectedOrg);
    }
  }

  async setSelectedOrg(orgId) {
    this.selectedDomains = new Set();
    try {
      await this.fetchDomains(orgId);
    } catch (e) {
      this.error = e.message;
      this.selectedOrg = undefined;
      return false;
    }
    this.selectedOrg = orgId;
    return true;
  }

  selectDomain(domain, selected = true) {
    this.selectedDomains[selected ? 'add' : 'delete'](domain);
    return this.selectedDomains.size;
  }

  async getOrgkey(orgId) {
    if (this.orgkeyMap.has(orgId)) {
      return this.orgkeyMap.get(orgId);
    }

    const res = await fetchAPI(`/orgs/${orgId}/key`);
    if (!res.ok) {
      log.error(`failed to fetch orgkey (${res.status}): `, res);
      throw Error('failed to fetch orgkey');
    }

    const { orgkey } = await res.json();
    this.orgkeyMap.set(orgId, orgkey);
    return orgkey;
  }

  async fetchDomains(orgId) {
    if (this.orgDomainMap.has(orgId)) {
      return this.orgDomainMap.get(orgId);
    }

    const res = await fetchAPI(`/orgs/${orgId}`);
    if (!res.ok) {
      log.error(`failed to fetch (${res.status}): `, res);
      throw Error('failed to fetch org');
    }

    const { domains } = await res.json();
    log.debug(`loaded domains for '${orgId}'`, domains);
    this.orgDomainMap.set(orgId, domains);
    return domains;
  }

  async createOrg(orgId, domains = []) {
    if (this.orgs.includes(orgId)) {
      throw Error('org already exists');
    }

    // eslint-disable-next-line no-param-reassign
    domains = [...new Set(domains)];
    const res = await fetchAPI('/orgs', {
      method: 'POST',
      body: JSON.stringify({ id: orgId, domains }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      log.error(`failed to create org (${res.status}): `, res);
      throw Error('failed to create org');
    }
    const { orgkey } = await res.json();
    this.orgs.push(orgId);
    this.orgDomainMap.set(orgId, domains);
    this.orgkeyMap.set(orgId, orgkey);
    return orgkey;
  }

  async addDomains(orgId, domains) {
    const res = await fetchAPI(`/orgs/${orgId}`, {
      method: 'POST',
      body: JSON.stringify({ domains }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      log.error(`failed to add domains (${res.status}): `, res);
      throw Error('failed to add domains');
    }
    const currentDomains = this.orgDomainMap.get(orgId);
    const newDomains = [...new Set([...currentDomains, ...domains])];
    this.orgDomainMap.set(orgId, newDomains);
    return newDomains;
  }

  async removeDomains(orgId, domains) {
    const removed = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const domain of domains) {
      // eslint-disable-next-line no-await-in-loop
      const res = await fetchAPI(`/orgs/${orgId}/domains/${domain}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        log.error(`failed to remove domain '${domain}' (${res.status}): `, res);
      } else {
        removed[domain] = true;
        this.selectedDomains.delete(domain);
      }
    }
    const currentDomains = this.orgDomainMap.get(orgId);
    const newDomains = currentDomains.filter((d) => !removed[d]);
    this.orgDomainMap.set(orgId, newDomains);
    return newDomains;
  }
})();

/**
 * @param {{
*  title: string;
*  content: string;
*  acceptText?: string
*  cancelText?: string;
*  onAccept?: (self: HTMLDivElement) => boolean|Promise<boolean>;
*  onCancel?: (self: HTMLDivElement) => boolean|Promise<boolean>;
* }} param0
* @returns {HTMLDivElement}
*/
const createModal = ({
  title,
  content = '',
  acceptText = 'OK',
  cancelText = 'Cancel',
  onAccept = () => {},
  onCancel = () => {},
}) => {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = /* html */`
   <div class="modal-content">
     <span class="cancel">&times;</span>
     <h2 class="modal-title">${title}</h2>
     <div class="content">${content}</div>
     <div class="modal-actions"> 
       <button id="btn-accept" class="accept">${acceptText}</button>
       <button id="btn-cancel" class="cancel">${cancelText}</button>
     </div>
   </div>`;

  const cancelBtns = modal.querySelectorAll('.cancel');
  const acceptBtn = modal.querySelector('.accept');
  cancelBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (await onCancel(modal) !== false) {
        modal.remove();
      }
    });
  });
  acceptBtn.addEventListener('click', async () => {
    if (await onAccept(modal) !== false) {
      modal.remove();
    }
  });

  mainDiv.appendChild(modal);
  return modal;
};

const updateOrgDataList = (orgs) => {
  orgDataList.innerHTML = '';
  orgs.forEach((org) => {
    const option = document.createElement('option');
    option.value = org;
    orgDataList.appendChild(option);
  });
};

const enableOrgActions = (enabled = true) => {
  orgActionsDiv.style.display = enabled ? 'block' : 'none';
};

const createDomainRow = (org, domain) => {
  const row = document.createElement('div');
  row.classList.add('domain-row');
  row.innerHTML = /* html */`
    <div class="cell-checkbox"><input type="checkbox"/></div>
    <div class="cell-domain">${domain}</div>
    <div class="cell-domain-actions">
      <button class="btn btn-danger">Remove</button>
    </div>`;

  const checkbox = row.querySelector('input[type="checkbox"]');
  const btnRemove = row.querySelector('.btn-danger');

  checkbox.addEventListener('change', (e) => {
    const checkedCount = store.selectDomain(domain, e.target.checked);
    if (checkedCount > 0) {
      btnRemoveDomains.disabled = false;
    } else {
      btnRemoveDomains.disabled = true;
    }
  });

  btnRemove.addEventListener('click', async () => {
    createModal({
      title: 'Remove domain',
      content: /* html */`
        <p>Are you sure you want to remove domain '${domain}' from ${org}?</p>
      `,
      onAccept: async () => {
        try {
          await store.removeDomains(org, [domain]);
          row.remove();
        } catch (e) {
          // TODO: toast error
          return false;
        }
        return true;
      },
    });
  });
  return row;
};

const updateDomainTable = (domains = []) => {
  orgDetails.innerHTML = '';
  if (domains.length) {
    domains.forEach((domain) => {
      orgDetails.appendChild(
        createDomainRow(store.selectedOrg, domain),
      );
    });
  } else {
    orgDetails.innerHTML = '<p class="empty-message">No domains in org</p>';
  }
};

const showOrgkey = (key) => {
  const orgkeyInput = btnShowOrgkey.previousElementSibling;
  orgkeyInput.value = key;
  orgkeyInput.style.display = key ? 'unset' : 'none';
  btnShowOrgkey.innerText = `${key ? 'Hide' : 'Show'} orgkey`;
};

(async () => {
  mainDiv.classList.add('unauth');
  await store.init();
  if (store.denied) {
    // TODO: ask for token again
    return;
  }
  if (store.error) {
    // TODO: show error
    return;
  }
  mainDiv.classList.remove('unauth');

  const { orgs, selectedOrg } = store;
  updateOrgDataList(orgs);

  if (selectedOrg) {
    orgSelectedInput.value = selectedOrg;
    enableOrgActions();
    updateDomainTable(store.orgDomains);
  }

  // watch for org selection change
  orgSelectedInput.addEventListener('change', async (e) => {
    const orgId = e.target.value;
    log.debug('selected org: ', orgId);
    const ok = await store.setSelectedOrg(orgId);
    showOrgkey();
    enableOrgActions(ok);
    updateDomainTable(store.orgDomains);
    const url = new URL(window.location.href);
    url.searchParams.set('org', orgId);
    window.history.replaceState({}, '', url);
  });

  // show/hide orgkey
  btnShowOrgkey.addEventListener('click', async () => {
    if (!store.selectedOrg) {
      return;
    }

    let orgkey;
    if (btnShowOrgkey.innerText.startsWith('Show')) {
      orgkey = await store.getOrgkey(store.selectedOrg);
    }
    showOrgkey(orgkey);
  });

  // attach create org button
  btnCreateOrg.addEventListener('click', () => {
    createModal({
      title: 'Create new org',
      content: /* html */`
        <input type="text" placeholder="Name" />
        <textarea placeholder="List of domain(s), separated by spaces/commas"></textarea>
      `,
      onAccept: async (modal) => {
        const name = modal.querySelector('input').value;
        const domains = modal.querySelector('textarea').value.split(/[\s,]+/);
        log.debug('creating org: ', name, domains);

        if (!name || name.includes(' ')) {
          modal.querySelector('input').setCustomValidity('Invalid org name');
          return false;
        }

        try {
          const key = await store.createOrg(name, domains);
          if (!key) {
            return false;
          }
        } catch (e) {
          // TODO: toast error
          return false;
        }

        // TODO: toast success
        return true;
      },
    });
  });

  // attach add domains button
  btnAddDomains.addEventListener('click', () => {
    if (!store.selectedOrg) {
      return;
    }

    createModal({
      title: `Add domains to ${store.selectedOrg}`,
      content: /* html */`
        <textarea placeholder="List of domain(s), separated by spaces/commas"></textarea>
      `,
      onAccept: async (modal) => {
        const newDomains = modal.querySelector('textarea').value.split(/[\s,]+/);
        log.debug(`adding domains to '${store.selectedOrg}': `, newDomains);
        try {
          const domains = await store.addDomains(store.selectedOrg, newDomains);
          updateDomainTable(domains);
        } catch (e) {
          // TODO: toast error
          return false;
        }

        // TODO: toast success
        return true;
      },
    });
  });

  // attach remove domains button
  btnRemoveDomains.addEventListener('click', () => {
    if (!store.selectedOrg) {
      return;
    }
    if (!store.selectedDomains.size) {
      return;
    }

    createModal({
      title: 'Remove domains',
      content: /* html */`
        <p>Are you sure you want to remove ${store.selectedDomains.size} domains from ${store.selectedOrg}?</p>
      `,
      onAccept: async () => {
        try {
          const domains = await store.removeDomains(store.selectedOrg, [...store.selectedDomains]);
          updateDomainTable(domains);
        } catch (e) {
          // TODO: toast error
          return false;
        }

        // TODO: toast success
        return true;
      },
    });
  });
})();
