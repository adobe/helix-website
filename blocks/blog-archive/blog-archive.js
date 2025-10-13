import { createTag, loadBlogData } from '../../scripts/scripts.js';

function parsePublicationDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const months = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };
  const m = dateStr.trim().match(/^([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/);
  if (!m) return null;
  const month = months[m[1].toLowerCase()];
  const day = Number(m[2]);
  const year = Number(m[3]);
  if (!month || !day || !year) return null;
  return { year, month, day };
}

function monthLabel(month) {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return names[month - 1];
}

function groupPosts(posts) {
  const groups = new Map(); // year -> Map(month -> posts[])
  posts.forEach((p) => {
    const parsed = parsePublicationDate(p.publicationDate);
    const year = parsed?.year || 'Unknown';
    const month = parsed?.month || 'Unknown';
    if (!groups.has(year)) groups.set(year, new Map());
    const byMonth = groups.get(year);
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month).push({ ...p, parsed });
  });
  return groups;
}

function renderGroups(block, groups) {
  // Sort years desc, Unknown last
  const years = Array.from(groups.keys()).sort((a, b) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return b - a;
  });

  years.forEach((year) => {
    const yearSection = createTag('section', { class: 'year-group' });
    const yearHeader = createTag('h2', { class: 'year-heading' }, `${year}`);
    yearSection.append(yearHeader);

    const byMonth = groups.get(year);
    const months = Array.from(byMonth.keys()).sort((a, b) => {
      if (a === 'Unknown') return 1;
      if (b === 'Unknown') return -1;
      return b - a; // numeric month desc
    });

    months.forEach((month) => {
      const listWrapper = createTag('div', { class: 'month-group' });
      const headerText = month === 'Unknown' ? 'Unknown Month' : `${monthLabel(month)} `;
      const monthHeader = createTag('h3', { class: 'month-heading' }, headerText);
      listWrapper.append(monthHeader);

      const ul = createTag('ul', { class: 'post-list' });
      const items = byMonth.get(month);
      // Sort posts desc by date if available, else by title
      items.sort((a, b) => {
        if (a.parsed && b.parsed) {
          const ad = new Date(a.parsed.year, a.parsed.month - 1, a.parsed.day);
          const bd = new Date(b.parsed.year, b.parsed.month - 1, b.parsed.day);
          return bd - ad;
        }
        return (b.title || '').localeCompare(a.title || '');
      });

      items.forEach((post) => {
        const li = createTag('li', { class: 'post-item' });
        const titleLink = createTag('a', { href: post.path, class: 'post-title' }, post.title || post.path);
        const meta = createTag('span', { class: 'post-meta' });
        const parts = [];
        if (post.publicationDate) parts.push(post.publicationDate);
        if (post.author) parts.push(`by ${post.author}`);
        meta.textContent = parts.join(' • ');
        li.append(titleLink, meta);
        ul.append(li);
      });

      listWrapper.append(ul);
      yearSection.append(listWrapper);
    });

    block.append(yearSection);
  });
}

export default async function decorate(block) {
  loadBlogData();

  const render = () => {
    const source = (window.blogindex && window.blogindex.data) || [];
    const posts = source
      .filter((e) => e.path && e.path.startsWith('/blog/'))
      .filter((e) => e.path !== '/blog/' && e.path !== '/blog')
      .filter((e) => !e.robots || !/noindex/i.test(e.robots))
      .map((e) => ({
        title: e.title,
        path: e.path,
        publicationDate: e.publicationDate,
        author: e.author,
      }));

    // Clear and render
    block.textContent = '';
    const groups = groupPosts(posts);
    renderGroups(block, groups);
  };

  if (window?.blogindex?.loaded) {
    render();
    return;
  }

  document.addEventListener('dataset-ready', () => {
    if (window?.blogindex?.loaded && !block.dataset.rendered) {
      render();
      block.dataset.rendered = 'true';
    }
  });
}
