
import { loadBlogData, createTag } from '../../scripts/scripts.js';

function groupPostsByMonth(posts) {
  const grouped = {};
  posts.forEach((post) => {
    const date = new Date(post.publicationDate);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    const key = `${year}-${month}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(post);
  });
  return grouped;
}

export default async function decorate(block) {
  loadBlogData();

  const checkDataLoaded = () => window?.blogindex?.loaded;

  const renderArchive = () => {
    const posts = window.blogindex.data;
    posts.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));
    const groupedPosts = groupPostsByMonth(posts);

    const archiveContainer = createTag('div', { class: 'blog-archive-container' });

    Object.entries(groupedPosts).forEach(([group, postsInGroup]) => {
      const [year, month] = group.split('-');
      const groupContainer = createTag('div', { class: 'blog-archive-group' });
      const groupHeader = createTag('h2', {}, `${month} ${year}`);
      groupContainer.appendChild(groupHeader);

      const postList = createTag('ul', { class: 'blog-archive-list' });
      postsInGroup.forEach((post) => {
        const listItem = createTag('li');
        const postLink = createTag('a', { href: post.path }, post.title);
        const postDate = createTag('span', { class: 'date' }, new Date(post.publicationDate).toLocaleDateString());
        const postAuthor = createTag('span', { class: 'author' }, `by ${post.author}`);
        listItem.appendChild(postLink);
        listItem.appendChild(postDate);
        listItem.appendChild(postAuthor);
        postList.appendChild(listItem);
      });
      groupContainer.appendChild(postList);
      archiveContainer.appendChild(groupContainer);
    });

    block.innerHTML = '';
    block.appendChild(archiveContainer);
  };

  if (checkDataLoaded()) {
    renderArchive();
  } else {
    document.addEventListener('dataset-ready', () => {
      if (checkDataLoaded()) {
        renderArchive();
      }
    });
  }
}
