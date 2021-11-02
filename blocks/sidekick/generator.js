import createTag from '../../utils/tag.js';

function help(e) {
  e.preventDefault();
  e.stopPropagation();
  // eslint-disable-next-line no-alert
  alert('Instead of clicking this button, you need to drag it to your browser\'s bookmark bar.');
  return false;
}

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
    giturl, project, token, hlx3,
  } = formData;

  if (!giturl) {
    // eslint-disable-next-line no-alert
    alert('Repository URL is mandatory.');
    return;
  }

  // update URL
  const url = new URL(window.location.href);
  const usp = url.searchParams;
  Object.keys(formData).forEach((name) => usp.set(name, formData[name]));
  url.search = usp.toString();
  window.history.pushState({}, null, url.href);

  // assemble bookmarklet config
  const segs = new URL(giturl).pathname.substring(1).split('/');
  const owner = segs[0];
  const repo = segs[1];
  const ref = segs[3] || 'main';

  const config = {
    owner,
    repo,
    ref,
    hlx3,
  };

  // pass token
  if (token) {
    config.token = token;
  }

  // update bookmarklet link
  const bm = document.getElementById('bookmark');
  bm.href = [
    // eslint-disable-next-line no-script-url
    'javascript:',
    '/* ** Helix Sidekick Bookmarklet ** */',
    '(() => {',
    `const c=${JSON.stringify(config)};`,
    'const s=document.createElement(\'script\');',
    's.id=\'hlx-sk-app\';',
    `s.src='${window.location.origin}/tools/sidekick/app.js';`,
    's.dataset.config=JSON.stringify(c);',
    'if(document.getElementById(\'hlx-sk-app\')){',
    'document.getElementById(\'hlx-sk-app\').replaceWith(s);',
    '} else {',
    'document.head.append(s);',
    '}',
    '})();',
  ].join('');
  let title = 'Sidekick';
  if (project) {
    title = `${project} ${title}`;
  }
  bm.onclick = help;
  bm.textContent = title;
  bm.setAttribute('title', title);
  document.getElementById('install-container').classList.remove('hidden');
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
    document.getElementById('install-container').append(createTag('p', null, backLink));
  }
  if (autorun) {
    document.getElementById('form-container').classList.add('hidden');
    run();
  }
}

export default async function decorate(el) {
  const formContainer = el.querySelector(':scope > div:first-of-type > div');

  const submitLink = formContainer.querySelector(':scope a');
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

  const installContainer = el.querySelector(':scope > div:last-of-type > div');
  const bookmark = createTag('a', { id: 'bookmark', href: '#' }, 'Sidekick');
  installContainer.append(createTag('p', null, createTag('em', null, bookmark)));
  installContainer.id = 'install-container';
  installContainer.style.paddingTop = '20px';
  installContainer.classList.add('hidden');

  init();
}
