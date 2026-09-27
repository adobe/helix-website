const DEFAULT_ENDPOINT = '/event-agenda.json';

// Maps the event tool's raw category values to the visitor-facing filter groups.
const CATEGORY_GROUPS = {
  session: 'Keynote & Sessions',
  preconference: 'Keynote & Sessions',
  certification: 'Free Certification',
  break: 'Breaks & Social',
  'hands-on lab': 'Hands-on Labs',
};

const GROUP_ORDER = [
  'Keynote & Sessions',
  'Hands-on Labs',
  'Free Certification',
  'Breaks & Social',
];

function toGroup(category) {
  const key = (category || '').trim().toLowerCase();
  return CATEGORY_GROUPS[key] || category?.trim() || 'Other';
}

function isFeatured(row) {
  // Sheet column casing has varied ("featured" vs "Featured"); match case-insensitively.
  const key = Object.keys(row).find((k) => k.toLowerCase() === 'featured');
  return key ? row[key].trim().toLowerCase() === 'yes' : false;
}

/**
 * Fetches the event's speaker roster (same API the event-speakers block uses)
 * and returns a lookup from normalized full name to speaker photo/details.
 * @param {string} apiUrl developerevents.adobe.com event API URL
 * @returns {Promise<Map<string, object>>} speaker lookup, empty on failure
 */
async function fetchSpeakerLookup(apiUrl) {
  const lookup = new Map();
  if (!apiUrl) return lookup;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();
    (json.speakers || []).forEach((speaker) => {
      const name = `${speaker.first_name} ${speaker.last_name}`.trim().toLowerCase();
      lookup.set(name, speaker);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('event-agenda: unable to load speaker photos', error);
  }
  return lookup;
}

function renderSpeakers(speakersText, speakerLookup) {
  const container = document.createElement('span');
  container.className = 'event-agenda-item-speakers';

  speakersText.split(',').map((name) => name.trim()).filter(Boolean).forEach((name) => {
    const speaker = speakerLookup.get(name.toLowerCase());
    const chip = document.createElement('span');
    chip.className = 'event-agenda-speaker';

    const photoUrl = speaker?.picture?.thumbnail_url || speaker?.picture?.url;
    if (photoUrl) {
      const img = document.createElement('img');
      img.className = 'event-agenda-speaker-photo';
      img.src = photoUrl;
      img.alt = '';
      img.loading = 'lazy';
      chip.append(img);
    }

    const label = document.createElement('span');
    label.className = 'event-agenda-speaker-name';
    label.textContent = name;
    chip.append(label);

    container.append(chip);
  });

  return container;
}

/**
 * Renders a speaker card (large photo, bold name, title, company) for each
 * speaker, in the same visual style as the event-speakers block. Shown in
 * the expanded description panel at desktop widths only.
 * @param {string} speakersText comma-separated speaker names
 * @param {Map<string, object>} speakerLookup speaker lookup from the API
 * @returns {Element} row of speaker cards
 */
function renderSpeakerCards(speakersText, speakerLookup) {
  const list = document.createElement('div');
  list.className = 'event-agenda-panel-speakers';

  speakersText.split(',').map((name) => name.trim()).filter(Boolean).forEach((name) => {
    const speaker = speakerLookup.get(name.toLowerCase());
    const card = document.createElement('div');
    card.className = 'event-agenda-panel-speaker';

    const photoUrl = speaker?.picture?.thumbnail_url || speaker?.picture?.url;
    if (photoUrl) {
      const img = document.createElement('img');
      img.className = 'event-agenda-panel-speaker-photo';
      img.src = photoUrl;
      img.alt = '';
      img.loading = 'lazy';
      card.append(img);
    }

    const nameEl = document.createElement('p');
    nameEl.className = 'event-agenda-panel-speaker-name';
    nameEl.textContent = name;
    card.append(nameEl);

    const title = speaker?.title?.split(',')[0]?.trim();
    if (title) {
      const titleEl = document.createElement('p');
      titleEl.className = 'event-agenda-panel-speaker-title';
      titleEl.textContent = title;
      card.append(titleEl);
    }

    if (speaker?.company) {
      const companyEl = document.createElement('p');
      companyEl.className = 'event-agenda-panel-speaker-company';
      companyEl.textContent = speaker.company;
      card.append(companyEl);
    }

    list.append(card);
  });

  return list;
}

function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours < 12 ? 'am' : 'pm';
  const twelveHour = hours % 12 || 12;
  const paddedMinutes = String(minutes).padStart(2, '0');
  return minutes === 0 ? `${twelveHour} ${period}` : `${twelveHour}:${paddedMinutes} ${period}`;
}

function formatDayLabel(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function appendList(container, items) {
  if (!items.length) return;
  const ul = document.createElement('ul');
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.append(li);
  });
  container.append(ul);
}

const HEADING_LABELS = /^(key takeaways|what you'?ll learn|why watch|takeaways)$/i;

/**
 * Appends text to an element, converting **bold** markers to <strong>.
 * @param {Element} el element to append to
 * @param {string} text raw text, possibly containing **bold** markers
 */
function appendInlineText(el, text) {
  text.split(/\*\*(.+?)\*\*/g).forEach((part, index) => {
    if (!part) return;
    if (index % 2 === 1) {
      const strong = document.createElement('strong');
      strong.textContent = part;
      el.append(strong);
    } else {
      el.append(document.createTextNode(part));
    }
  });
}

/**
 * Renders a description cell.
 *
 * The DA sheet flattens each cell to a single line: a blank line between
 * paragraphs becomes a double space, and a single line break becomes a
 * single space. This splits back on that double-space signal to recover
 * paragraphs, groups consecutive "- " lines into a bullet list, and turns a
 * short standalone line (e.g. "Key takeaways") into a sub-heading. It also
 * supports the legacy " | " single-line bullet convention, and **bold**
 * markers anywhere in the text.
 * @param {string} text raw description text
 * @returns {Element} rendered description
 */
function renderDescription(text) {
  const container = document.createElement('div');
  container.className = 'event-agenda-item-description';
  if (!text) return container;

  if (text.includes(' | ')) {
    const [intro, ...items] = text.split(' | ').map((part) => part.trim()).filter(Boolean);
    if (intro) {
      const p = document.createElement('p');
      appendInlineText(p, intro);
      container.append(p);
    }
    appendList(container, items);
    return container;
  }

  let pendingList = null;
  const flushList = () => {
    if (pendingList) {
      container.append(pendingList);
      pendingList = null;
    }
  };

  text.split(/\s{2,}/).map((chunk) => chunk.trim()).filter(Boolean).forEach((chunk) => {
    const bulletMatch = chunk.match(/^[-•]\s+(.*)/);
    if (bulletMatch) {
      pendingList ??= document.createElement('ul');
      const li = document.createElement('li');
      appendInlineText(li, bulletMatch[1].replace(/\.$/, ''));
      pendingList.append(li);
      return;
    }
    flushList();

    const label = chunk.replace(/[.:]+$/, '');
    const isHeading = HEADING_LABELS.test(label)
      || (chunk.endsWith(':') && chunk.split(' ').length <= 6);
    const p = document.createElement('p');
    if (isHeading) {
      p.className = 'event-agenda-item-description-heading';
      p.textContent = label;
    } else {
      appendInlineText(p, chunk);
    }
    container.append(p);
  });
  flushList();

  return container;
}

function createItem(row, index, speakerLookup) {
  const li = document.createElement('li');
  li.className = 'event-agenda-item';
  li.dataset.day = row.date;
  li.dataset.group = toGroup(row.category);
  if (isFeatured(row)) li.classList.add('featured');

  const panelId = `event-agenda-panel-${index}`;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'event-agenda-item-toggle';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', panelId);

  const badgeText = isFeatured(row) ? 'Featured' : row.category;

  const time = document.createElement('div');
  time.className = 'event-agenda-item-time';
  const timeRange = document.createElement('span');
  timeRange.className = 'event-agenda-item-time-range';
  timeRange.textContent = `${formatTime(row.start)} – ${formatTime(row.end)}`;
  time.append(timeRange);

  // Rendered twice: this copy sits under the time on mobile, at a fixed
  // distance regardless of how long the title wraps. The desktop copy
  // (below) sits next to the title. Only one is ever visible at a time.
  const badgeMobile = document.createElement('span');
  badgeMobile.className = 'event-agenda-item-badge event-agenda-item-badge-mobile';
  badgeMobile.textContent = badgeText;
  time.append(badgeMobile);

  const summary = document.createElement('div');
  summary.className = 'event-agenda-item-summary';

  const title = document.createElement('h3');
  title.className = 'event-agenda-item-title';
  title.textContent = row.title;
  summary.append(title);

  if (row.speakers) {
    summary.append(renderSpeakers(row.speakers, speakerLookup));
  }

  const badgeDesktop = document.createElement('span');
  badgeDesktop.className = 'event-agenda-item-badge event-agenda-item-badge-desktop';
  badgeDesktop.textContent = badgeText;

  const chevron = document.createElement('span');
  chevron.className = 'event-agenda-item-chevron';
  chevron.setAttribute('aria-hidden', 'true');

  button.append(time, summary, badgeDesktop, chevron);

  const panel = document.createElement('div');
  panel.className = 'event-agenda-item-panel';
  panel.id = panelId;
  panel.hidden = true;

  if (row.speakers || row.description) {
    const panelBody = document.createElement('div');
    panelBody.className = 'event-agenda-item-panel-body';
    if (row.speakers) panelBody.append(renderSpeakerCards(row.speakers, speakerLookup));
    if (row.description) panelBody.append(renderDescription(row.description));
    panel.append(panelBody);
  }

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
  });

  li.append(button, panel);
  return li;
}

function createDayTabs(days, activeDay, preconferenceDays, onSelect) {
  const nav = document.createElement('div');
  nav.className = 'event-agenda-days';
  nav.setAttribute('role', 'tablist');

  days.forEach((day) => {
    const isActive = day === activeDay;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'event-agenda-day';
    button.dataset.day = day;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(isActive));
    if (isActive) button.classList.add('active');

    if (preconferenceDays.has(day)) {
      const chip = document.createElement('span');
      chip.className = 'event-agenda-day-chip';
      chip.textContent = 'Pre-conference';
      button.append(chip);
    }

    const label = document.createElement('span');
    label.textContent = formatDayLabel(day);
    button.append(label);

    button.addEventListener('click', () => {
      nav.querySelectorAll('.event-agenda-day').forEach((tab) => {
        tab.classList.toggle('active', tab === button);
        tab.setAttribute('aria-selected', String(tab === button));
      });
      onSelect(day);
    });
    nav.append(button);
  });

  return nav;
}

function createCategoryFilters(groups, onSelect) {
  const nav = document.createElement('div');
  nav.className = 'event-agenda-filters';

  const buttons = groups.map((group, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'event-agenda-filter';
    button.textContent = group === 'all' ? 'All' : group;
    button.dataset.group = group;
    if (index === 0) button.classList.add('active');
    button.addEventListener('click', () => {
      nav.querySelectorAll('.event-agenda-filter').forEach((filter) => {
        filter.classList.toggle('active', filter === button);
      });
      onSelect(group);
    });
    nav.append(button);
    return button;
  });

  return { nav, buttons };
}

export default async function decorate(block) {
  const links = [...block.querySelectorAll('a')];
  const speakersLink = links.find((a) => {
    const url = new URL(a.href);
    return url.host === 'developerevents.adobe.com' && url.pathname.startsWith('/api/');
  });
  const sheetLink = links.find((a) => a !== speakersLink);
  const endpoint = sheetLink ? sheetLink.href : DEFAULT_ENDPOINT;
  block.textContent = '';

  const speakerLookupPromise = fetchSpeakerLookup(speakersLink?.href);

  let rows;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();
    rows = json.data || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('event-agenda: unable to load schedule data', error);
    const message = document.createElement('p');
    message.className = 'event-agenda-error';
    message.textContent = 'The event schedule is unavailable right now. Please try again later.';
    block.append(message);
    return;
  }

  const validRows = rows.filter((row) => {
    if (row.date && row.start && row.end) return true;
    // eslint-disable-next-line no-console
    console.warn('event-agenda: skipping row with missing date/start/end', row);
    return false;
  });

  if (!validRows.length) {
    const message = document.createElement('p');
    message.className = 'event-agenda-error';
    message.textContent = 'No schedule items are available yet.';
    block.append(message);
    return;
  }

  const days = [...new Set(validRows.map((row) => row.date))].sort();
  const presentGroups = new Set(validRows.map((row) => toGroup(row.category)));
  const groups = ['all', ...GROUP_ORDER.filter((group) => presentGroups.has(group)),
    ...[...presentGroups].filter((group) => !GROUP_ORDER.includes(group))];

  // Days containing a "Preconference" category row get a chip on their tab.
  const preconferenceDays = new Set(
    validRows.filter((row) => (row.category || '').trim().toLowerCase() === 'preconference')
      .map((row) => row.date),
  );

  // Default to the day with the featured keynote (the main conference day),
  // falling back to the first day if no row is flagged as featured.
  const featuredRow = validRows.find(isFeatured);
  const defaultDay = featuredRow ? featuredRow.date : days[0];

  const speakerLookup = await speakerLookupPromise;

  const list = document.createElement('ul');
  list.className = 'event-agenda-list';
  validRows.forEach((row, index) => list.append(createItem(row, index, speakerLookup)));

  let activeDay = defaultDay;
  let activeGroup = 'all';

  function applyFilters() {
    list.querySelectorAll(':scope > .event-agenda-item').forEach((item) => {
      const matchesDay = item.dataset.day === activeDay;
      const matchesGroup = activeGroup === 'all' || item.dataset.group === activeGroup;
      item.classList.toggle('is-hidden', !(matchesDay && matchesGroup));
    });
  }

  const controls = document.createElement('div');
  controls.className = 'event-agenda-controls';

  if (days.length > 1) {
    controls.append(createDayTabs(days, activeDay, preconferenceDays, (day) => {
      activeDay = day;
      applyFilters();
    }));
  }

  const { nav: filtersNav } = createCategoryFilters(groups, (group) => {
    activeGroup = group;
    applyFilters();
  });
  controls.append(filtersNav);

  block.append(controls, list);
  applyFilters();
}
