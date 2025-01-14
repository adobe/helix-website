const API = 'https://bundles.aem.page';

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
      // eslint-disable-next-line no-alert
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

export { log, store, fetchAPI };
