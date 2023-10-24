import { addAnchorLink } from '../../scripts/scripts.js';

function mdToHTML(md) {
  const toHTML = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>') // h3 tag
    .replace(/^## (.*$)/gim, '<h2>$1</h2>') // h2 tag
    .replace(/^# (.*$)/gim, '<h1>$1</h1>') // h1 tag
    .replace(/^\* (.*$)/gim, '<li>$1</li>') // li tag
    .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>') // bold text
    .replace(/\*(.*)\*/gim, '<i>$1</i>') // italic text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>'); // links
  return toHTML.trim(); // using trim method to remove whitespace
}

const displayNames = {
  'helix-pipeline-service': 'Delivery Pipeline',
  'helix-admin': 'Admin API',
  'helix-importer-ui': 'Content Importer',
  'helix-cli': 'Command Line Interface',
  'helix-sidekick-extension': 'Sidekick Extension',
  'franklin-sidekick-library': 'Sidekick Library',
};

function createRelease(release) {
  const div = document.createElement('div');
  const dateToReadable = (date) => {
    const delta = Math.round((new Date() - date) / 1000);

    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;

    let relativeTime;

    if (delta < 30) {
      relativeTime = 'now';
    } else if (delta < minute) {
      relativeTime = `${delta} seconds ago`;
    } else if (delta < 2 * minute) {
      relativeTime = 'a minute ago';
    } else if (delta < hour) {
      relativeTime = `${Math.floor(delta / minute)} minutes ago`;
    } else if (Math.floor(delta / hour) === 1) {
      relativeTime = '1 hour ago.';
    } else if (delta < day) {
      relativeTime = `${Math.floor(delta / hour)} hours ago`;
    } else if (delta < day * 2) {
      relativeTime = 'yesterday';
    } else if (delta < week) {
      relativeTime = `${Math.floor(delta / day)} days ago`;
    } else if (Math.floor(delta / week) === 1) {
      relativeTime = '1 week ago';
    }
    return (relativeTime);
  };

  div.classList.add('release', `release-${release.repo}`);
  const readableDate = dateToReadable(new Date(release.published));
  const fullDate = readableDate ? `${readableDate} (${release.published})` : release.published;
  const releaseBody = document.createElement('p');
  releaseBody.innerHTML = mdToHTML(release.body);
  releaseBody.querySelectorAll('h1, h2').forEach((h) => h.remove());
  releaseBody.querySelectorAll('li').forEach((li) => {
    if (!(li.previousElementSibling && li.previousElementSibling.tagName === 'UL')) {
      li.before(document.createElement('ul'));
    }
    const ul = li.previousElementSibling;
    ul.append(li);
  });

  div.innerHTML = `<p class="releases-date">${fullDate}</p><h2 id="${release.repo}-${release.tag}">${displayNames[release.repo]} <a href="${release.url}">${release.tag}</a></h2>`;
  addAnchorLink(div.querySelector('h2'));

  div.append(releaseBody);
  return div;
}

export default async function decorate(block) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        io.disconnect();
        const url = block.querySelector('a').href;
        block.textContent = '';
        const releases = document.createElement('div');
        const controls = document.createElement('div');
        controls.classList.add('releases-controls');
        Object.keys(displayNames).forEach((repo) => {
          const control = document.createElement('div');
          control.classList.add(`release-${repo}`, 'releases-control');
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.name = 'repo';
          cb.checked = true;
          cb.value = repo;
          cb.id = repo;
          control.append(cb);
          const label = document.createElement('label');
          label.textContent = displayNames[repo];
          label.htmlFor = repo;
          control.append(label);
          controls.append(control);
          control.addEventListener('click', () => {
            cb.checked = !cb.checked;
            releases.className = Array.from(controls.querySelectorAll('input:checked')).map((i) => i.value).join(' ');
            releases.classList.add('releases-results');
          });
        });
        block.append(controls);
        releases.className = Array.from(controls.querySelectorAll('input:checked')).map((i) => i.value).join(' ');
        releases.classList.add('releases-results');

        const resp = await fetch(url);
        const json = await resp.json();
        json.forEach((release) => {
          releases.append(createRelease(release));
        });
        block.append(releases);
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.type = 'application/rss+xml';
        link.title = 'AEM Releases';
        link.href = `${url}?format=rss`;
        document.head.append(link);
      }
    });
  });
  io.observe(block);
}
