import createTag from '../../utils/tag.js';

export default function decorate(el) {
    const formContainer = el.querySelector(':scope > div:first-of-type > div');
    const form = createTag('form');
    const label = createTag('label', { for: 'giturl' }, 'Repository URL:');
    const gitInput = createTag('input', { id: 'giturl', placeholder: 'https://github.com/...' }, 'Repository URL:');
    const project = createTag('input', { id: 'project', type: 'hidden' });
    const hlx3 = createTag('input', { id: 'hlx3', type: 'hidden' });
    const button = createTag('button', null, 'Generate Bookmarklet');
    form.append(label, gitInput, project, hlx3, button);
    formContainer.append(form);
}

function copy() {
    const text = document.getElementById('bookmark').href;
    navigator.clipboard.writeText(text);
}

function help(e) {
    e.preventDefault();
    e.stopPropagation();
    alert('Instead of clicking the Helix logo, drag it to your browser\'s bookmark bar.');
    return false;
}

function run() {
    let giturl = document.getElementById('giturl').value;
    const project = document.getElementById('project').value;
    const hlx3 = document.getElementById('hlx3').value;
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
    bm.setAttribute('title', title);
    bm.firstElementChild.setAttribute('alt', title);
    bm.onclick = help;
    document.getElementById('book').style.display = 'block';
}

function init() {
    let autorun = false;
    const params = new URLSearchParams(window.location.search);
    params.forEach((v,k) => {
      const field = document.getElementById(k);
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
      document.getElementById('form').style.display = 'none';
      run();
    }
}

  // init();