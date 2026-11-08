import { createTag } from '../../scripts/scripts.js';

/**
 * Event List — Collection block for community upcoming events.
 *
 * | Event List |
 * | ## Upcoming Events | |
 * | ### Title ¶ Description ¶ **[Date](youtube-url)** on *Show* | https://youtube.com/watch?v=... |
 * | ### Title 2 ¶ Description ¶ **Date** on *Show* | |
 *
 * Right column: YouTube URL → poster thumbnail + link; empty → default placeholder (no link).
 *
 * `Event List (compact)` variant: same content model, rendered as a tight card
 * grid (thumbnail, title, date only — description text is not shown).
 * | ### Title ¶ Date | https://youtube.com/watch?v=... |
 * | ### Title 2 ¶ Date | |
 *
 * Right column empty → placeholder thumbnail, non-clickable card (for
 * sessions that haven't happened yet).
 *
 * `Event List (download-link)` variant: put an optional presentation link
 * in its own paragraph after the date in the first column.
 * | ### Title ¶ Date ¶ [Download presentation](slides-url) ¶ Description | youtube-url |
 * Dates and presentation links are optional. Existing dates at the end of
 * the cell are moved below the title when this variant is enabled.
 * Combine with `compact` to show the presentation and description in cards;
 * the video thumbnail and presentation remain separate links.
 */

const DEFAULT_PLACEHOLDER = '/blocks/event-list/thursday-frequency-default.png';

function getYouTubeUrl(cell) {
  if (!cell) return null;

  const link = cell.querySelector('a[href*="youtu"]');
  if (link?.href) return link.href;

  const text = cell.textContent.trim();
  const match = text.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)/);
  return match ? match[0] : null;
}

function getYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    return u.searchParams.get('v') || u.pathname.split('/').pop();
  } catch {
    return null;
  }
}

function buildMedia(cell) {
  const media = createTag('div', { class: 'event-list-media' });
  const youtubeUrl = getYouTubeUrl(cell);

  if (youtubeUrl) {
    const videoId = getYouTubeId(youtubeUrl);
    if (videoId) {
      const link = createTag('a', {
        href: youtubeUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'event-list-play-link',
        'aria-label': 'Play video',
      });
      link.append(createTag('img', {
        src: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        alt: '',
        loading: 'lazy',
      }));
      media.append(link);
      return media;
    }
  }

  const picture = cell?.querySelector('picture');
  const img = cell?.querySelector('img');
  if (picture) {
    media.append(picture.cloneNode(true));
    return media;
  }
  if (img) {
    media.append(img.cloneNode(true));
    return media;
  }

  media.append(createTag('img', {
    src: DEFAULT_PLACEHOLDER,
    alt: 'Thursday Frequency',
    loading: 'lazy',
  }));
  return media;
}

function getThumbnailSrc(cell) {
  const youtubeUrl = getYouTubeUrl(cell);
  if (youtubeUrl) {
    const videoId = getYouTubeId(youtubeUrl);
    if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }

  const img = cell?.querySelector('img');
  if (img) return img.src;

  return DEFAULT_PLACEHOLDER;
}

const NEW_BADGE_WINDOW_DAYS = 5;

function parseEventDate(text) {
  const match = text?.match(/(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(`${month} ${day}, ${year}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isWithinNewBadgeWindow(date) {
  if (!date) return false;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + NEW_BADGE_WINDOW_DAYS);
  const now = new Date();
  return now >= start && now < end;
}

function getDownloadLink(paragraph) {
  if (paragraph?.tagName !== 'P') return null;

  const links = paragraph.querySelectorAll('a[href]');
  const link = links[0];
  if (links.length !== 1 || !link.getAttribute('href')?.trim()
    || paragraph.textContent.trim() !== link.textContent.trim()) return null;

  return link;
}

function decorateDownloadLink(content) {
  const title = content.querySelector('h3');
  const paragraphs = [...content.querySelectorAll(':scope > p')];
  const date = paragraphs.find((p) => parseEventDate(p.textContent))
    || (getDownloadLink(paragraphs[1]) && !getDownloadLink(paragraphs[0])
      ? paragraphs[0] : null);

  if (date) {
    const dateWrap = createTag('div', { class: 'event-list-date' });
    dateWrap.append(...date.childNodes);
    date.replaceWith(dateWrap);
    title.after(dateWrap);
  }

  const paragraph = date
    ? title.nextElementSibling.nextElementSibling : title.nextElementSibling;
  const link = getDownloadLink(paragraph);
  if (!link) return;
  link.classList.remove('button');
  link.classList.add('event-list-download-link');
  const download = createTag('div', { class: 'event-list-download' });
  download.append(link);
  paragraph.replaceWith(download);
}

function buildCompactCard(cells, hasDownloadLink) {
  const title = cells[0].querySelector('h3');
  const date = hasDownloadLink
    ? cells[0].querySelector('.event-list-date')
    : cells[0].querySelector('p');
  const href = getYouTubeUrl(cells[1]);
  const isLinkedCard = href && !hasDownloadLink;

  const card = createTag(isLinkedCard ? 'a' : 'div', {
    class: 'event-list-card',
    ...(isLinkedCard ? { href, target: '_blank', rel: 'noopener noreferrer' } : {}),
  });

  const thumb = createTag('div', { class: 'event-list-card-thumb' });
  thumb.append(createTag('img', {
    src: getThumbnailSrc(cells[1]),
    alt: '',
    loading: 'lazy',
  }));
  if (isWithinNewBadgeWindow(parseEventDate(date?.textContent))) {
    thumb.append(createTag('span', { class: 'event-list-card-badge' }, 'New'));
  }
  if (href && hasDownloadLink) {
    const videoLink = createTag('a', {
      class: 'event-list-card-video-link',
      href,
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': `Play video: ${title.textContent}`,
    });
    videoLink.append(thumb);
    card.append(videoLink);
  } else {
    card.append(thumb);
  }

  const info = createTag('div', { class: 'event-list-card-info' });
  if (title) info.append(createTag('strong', {}, title.textContent));
  if (date) info.append(createTag('span', { class: 'event-list-card-date' }, date.textContent));
  if (hasDownloadLink) {
    info.append(...[...cells[0].childNodes].filter((node) => node !== title && node !== date));
  }
  card.append(info);

  return card;
}

export default function decorate(block) {
  const isCompact = block.classList.contains('compact');
  const hasDownloadLink = block.classList.contains('download-link');
  const rows = [...block.querySelectorAll(':scope > div')];

  block.textContent = '';

  const grid = isCompact ? createTag('div', { class: 'event-list-grid' }) : null;

  rows.forEach((row) => {
    const cells = [...row.children].filter((cell) => cell.tagName === 'DIV');
    if (!cells.length) return;

    const heading = row.querySelector('h2');
    if (heading) {
      const headingWrap = createTag('div', { class: 'event-list-heading' });
      headingWrap.append(heading.cloneNode(true));
      block.append(headingWrap);
      return;
    }

    if (cells.length < 2 || !cells[0].querySelector('h3')) return;

    if (hasDownloadLink) decorateDownloadLink(cells[0]);

    if (isCompact) {
      grid.append(buildCompactCard(cells, hasDownloadLink));
      return;
    }

    const item = createTag('div', { class: 'event-list-item' });
    const content = createTag('div', { class: 'event-list-content' });
    content.innerHTML = cells[0].innerHTML;
    item.append(content, buildMedia(cells[1]));
    block.append(item);
  });

  if (isCompact) block.append(grid);
}
