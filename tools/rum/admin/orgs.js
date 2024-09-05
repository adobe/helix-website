import { store, log } from './store.js';

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
