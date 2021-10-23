import createTag from '../../utils/tag.js';

function help(e) {
  e.preventDefault();
  e.stopPropagation();
  alert('Instead of clicking this button, you need to drag it to your browser\'s bookmark bar.');
  return false;
}

function run(evt) {
  if (evt) {
    evt.preventDefault();
  }
  let giturl = document.querySelector('input#giturl').value;
  const project = document.querySelector('input#project').value;
  const hlx3 = document.querySelector('input#hlx3').value;
  if (!giturl) {
    alert('Repository URL is mandatory.');
    return;
  }
  giturl = new URL(giturl);
  const segs = giturl.pathname.substring(1).split('/');
  const owner = segs[0];
  const repo = segs[1];
  const ref = segs[3] || 'main';

  const config = {
    owner,
    repo,
    ref,
  };

  // bake hlx3 flag into bookmarklet (default: true)
  config.hlx3 = hlx3 !== 'false';

  const bm = document.getElementById('bookmark');
  bm.href = [
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
  const params = new URLSearchParams(window.location.search);
  params.forEach((v,k) => {
    const field = document.querySelector(`input#${k}`);
    if (!field) return;
    field.type === 'checkbox' ? field.checked = (v === 'true') : field.value = v;
    autorun = true;
  });
  const from = params.has('from') && params.get('from');
  if (from) {
    const backLink = document.createElement('a');
    backLink.href = encodeURI(from);
    backLink.textContent = from;
    const wrapper = document.createElement('div');
    wrapper.className = 'back';
    wrapper.appendChild(backLink);
    document.getElementById('book').appendChild(wrapper);
    document.getElementById('update').style.display = 'unset';
  }
  if (autorun) {
    document.getElementById('form-container').classList.add('hidden');
    run();
  }
}

export default function decorate(el) {
    const formContainer = el.querySelector(':scope > div:first-of-type > div');
    const form = createTag('form');
    const label = createTag('label', { for: 'giturl' }, 'Repository URL:');
    const gitInput = createTag('input', { id: 'giturl', placeholder: 'https://github.com/...' });
    const project = createTag('input', { id: 'project', type: 'hidden' });
    const hlx3 = createTag('input', { id: 'hlx3', type: 'hidden' });
    const button = createTag('button', { id: 'generator' }, 'Generate Bookmarklet');
    button.onclick = run;
    form.append(label, gitInput, project, hlx3, button);
    formContainer.append(form);
    formContainer.id = 'form-container';

    const installContainer = el.querySelector(':scope > div:last-of-type > div');
    const bookmark = createTag('a', { id: 'bookmark', href: '#' }, 'Sidekick');
    const em = createTag('em', null, bookmark);
    installContainer.append(em);
    installContainer.id = 'install-container';
    installContainer.classList.add('hidden');

    init();
}
