const DESCRIPTION_WORD_LIMIT = 25;

function toggleVisibility(el) {
  const expanded = el.getAttribute('aria-expanded') === 'true';
  el.setAttribute('aria-expanded', expanded ? 'false' : 'true');
}

function truncate(description, limit) {
  const p = document.createElement('p');
  p.className = 'event-sessions-card-description';

  const words = description.trim().split(/\s+/);
  const initial = words.slice(0, limit);
  const extra = words.slice(limit);

  if (extra.length === 0) {
    p.classList.add('noextra');
    p.textContent = initial.join(' ');
    return p;
  }

  p.append(`${initial.join(' ')} `);
  const span = document.createElement('span');
  span.className = 'event-sessions-card-description-extra';
  span.textContent = extra.join(' ');
  p.append(span);
  return p;
}

export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const grid = document.createElement('div');
  grid.className = 'event-sessions-grid';

  rows.forEach((row) => {
    const [thumbCell, contentCell] = row.children;
    if (!contentCell) return;

    const card = document.createElement('div');
    card.className = 'event-sessions-card';

    const picture = thumbCell?.querySelector('picture');
    if (picture) {
      const thumb = document.createElement('div');
      thumb.className = 'event-sessions-card-thumb';
      thumb.append(picture);
      card.append(thumb);
    }

    const info = document.createElement('div');
    info.className = 'event-sessions-card-info';

    // Content model is positional: title, then description.
    const [titlePara, ...descriptionParas] = [...contentCell.querySelectorAll('p')];

    if (titlePara) {
      const heading = document.createElement('h3');
      heading.innerHTML = titlePara.innerHTML;
      info.append(heading);
    }

    if (descriptionParas.length) {
      const text = descriptionParas.map((p) => p.textContent.trim()).join(' ');
      const description = truncate(text, DESCRIPTION_WORD_LIMIT);
      info.append(description);

      const extraSpan = description.querySelector('.event-sessions-card-description-extra');
      if (extraSpan) {
        description.addEventListener('click', () => {
          toggleVisibility(extraSpan);
          toggleVisibility(description);
        });
      }
    }

    card.append(info);
    grid.append(card);
  });

  block.append(grid);
}
