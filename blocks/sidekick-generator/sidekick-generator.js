import createTag from '../../utils/tag.js';

const browserExtensionSupported = [
  'edg',
  'chrome',
  'safari',
].find((b) => window.navigator.userAgent.toLowerCase().includes(b));

function run(evt) {
  if (evt) {
    evt.preventDefault();
  }
  // retrieve config
  const formData = {};
  document.querySelectorAll('#form-container input').forEach((field) => {
    if (field.type === 'checkbox' || field.type === 'radio') {
      formData[field.id] = field.checked;
    } else {
      formData[field.id] = field.value;
    }
  });

  const {
    giturl, project,
  } = formData;

  if (!giturl) {
    // eslint-disable-next-line no-alert
    alert('Repository URL is mandatory.');
    return;
  }

  let finalGitUrl = giturl;
  let owner;
  let repo;
  let ref;
  const giturlAsUrl = new URL(giturl);
  if (giturlAsUrl.hostname.endsWith('hlx.page')
    || giturlAsUrl.hostname.endsWith('hlx.live')
    || giturlAsUrl.hostname.endsWith('aem.page')
    || giturlAsUrl.hostname.endsWith('aem.live')) {
    const segs = giturlAsUrl.hostname.split('.')[0].split('--');
    [ref, repo, owner] = segs;

    finalGitUrl = `https://github.com/${owner}/${repo}/tree/${ref}`;
  } else {
    [, owner, repo,, ref = 'main'] = giturlAsUrl.pathname.split('/');
  }

  // update title
  document.title = `${project || `${repo}`} for ${document.title}`;
  // update URL
  const url = new URL(window.location.href);
  const usp = url.searchParams;
  Object.keys(formData).forEach((name) => usp.set(name, formData[name]));
  // override giturl in case original was hlx url
  usp.set('giturl', finalGitUrl);
  url.search = usp.toString();
  window.history.pushState({ finalGitUrl, project }, null, url.href);

  window.dispatchEvent(new CustomEvent('sidekickGeneratorReady'));
}

function init() {
  let autorun = false;
  // pre-fill form
  const params = new URLSearchParams(window.location.search);
  params.forEach((v, k) => {
    const field = document.querySelector(`input#${k}`);
    if (!field) return;
    if (field.type === 'checkbox' || field.type === 'radio') {
      field.checked = v !== 'false';
    } else {
      field.value = v;
    }
    autorun = true;
  });
  const from = params.has('from') && params.get('from');
  if (from) {
    const href = encodeURI(from);
    const backLink = createTag('a', {
      class: 'back-link',
      title: href,
      href,
    }, href);
    document.getElementById('sidekick-generator-bookmarklet').append(createTag('p', null, backLink));
  }
  if (autorun) {
    document.getElementById('form-container').parentElement.classList.add('hidden');
    run();
  }
}

export default async function decorate(el) {
  const formContainer = el.querySelector(':scope > div:first-of-type > div');

  const submitLink = formContainer.querySelector(':scope p > a');
  const button = createTag('button', { id: 'generator' }, submitLink ? submitLink.textContent : 'Go');
  button.onclick = run;
  if (submitLink) {
    submitLink.replaceWith(button);
  } else {
    formContainer.append(createTag('p', {}, button));
  }

  let formPath = './generator';
  const pars = formContainer.querySelectorAll(':scope p');
  if (pars.length > 1) {
    // first of multiple <p> expected to contain path to form
    const p = pars[0];
    formPath = p.textContent.split(':')[1]?.trim();
    p.remove();
  }

  const form = createTag('form');
  const resp = await fetch(`${encodeURI(formPath)}.json`);
  if (resp.ok) {
    const json = await resp.json();
    json.data.forEach(({
      label, type, required, name, placeholder, checked,
    }) => {
      if (label) {
        form.append(createTag('label', { for: name }, `${label}${required ? '*' : ''}`));
      }
      const elem = createTag('input', { type, id: name, placeholder: placeholder || '' });
      if (type === 'checkbox' && checked) {
        elem.checked = true;
      }
      form.append(elem);
    });
  }
  formContainer.insertBefore(form, formContainer.querySelector(':scope p:last-of-type'));
  formContainer.id = 'form-container';

  // install container
  const installContainer = el.querySelector(':scope > div:nth-of-type(2) > div');
  if (installContainer) {
    installContainer.id = 'sidekick-generator-bookmarklet';
    installContainer.style.paddingTop = '20px';
    installContainer.parentElement.classList.add('hidden');

    // chrome web store
    const chromeLink = installContainer.querySelector('a[title~="Chrome"]');
    if (chromeLink) {
      const webStoreIcon = document.createElement('img');
      webStoreIcon.src = '/img/chrome.svg';
      chromeLink.prepend(webStoreIcon);
      chromeLink.setAttribute('target', '_blank');
      if (!['chrome', 'edg'].includes(browserExtensionSupported)) {
        chromeLink.parentElement.parentElement.classList.add('hidden');
      }
    }
    // apple app store
    const safariLink = installContainer.querySelector('a[title~="Safari"]');
    if (safariLink) {
      const appStoreIcon = document.createElement('img');
      appStoreIcon.src = '/img/safari.svg';
      safariLink.prepend(appStoreIcon);
      safariLink.setAttribute('target', '_blank');
      if (browserExtensionSupported !== 'safari') {
        safariLink.parentElement.parentElement.classList.add('hidden');
      }
    }
  }

  // add project to extension
  const extensionAddContainer = el.querySelector(':scope > div:nth-of-type(3) > div');
  if (extensionAddContainer) {
    extensionAddContainer.id = 'sidekick-generator-extension-add-project';
    extensionAddContainer.querySelector('a').removeAttribute('href');
    extensionAddContainer.parentElement.classList.add('hidden');
  }

  // remove project from extension
  const extensionDeleteContainer = el.querySelector(':scope > div:nth-of-type(4) > div');
  if (extensionDeleteContainer) {
    extensionDeleteContainer.id = 'sidekick-generator-extension-delete-project';
    extensionDeleteContainer.querySelector('a').removeAttribute('href');
    extensionDeleteContainer.parentElement.classList.add('hidden');
  }

  window.addEventListener('sidekickGeneratorReady', () => {
    // show install container (default)
    installContainer.parentElement.classList.remove('hidden');
  });

  init();
}
