
import { readBlockConfig } from '../../scripts/lib-franklin.js';

function groupPosts(posts) {
  const grouped = {};
  posts.forEach((post) => {
    const date = new Date(post.publicationDate * 1000);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    if (!grouped[year]) {
      grouped[year] = {};
    }
    if (!grouped[year][month]) {
      grouped[year][month] = [];
    }
    grouped[year][month].push(post);
  });
  return grouped;
}

function renderArchive(groupedPosts, block) {
  const years = Object.keys(groupedPosts).sort().reverse();
  years.forEach((year) => {
    const yearEl = document.createElement('h2');
    yearEl.textContent = year;
    block.append(yearEl);
    const months = Object.keys(groupedPosts[year]).sort((a, b) => {
      const aDate = new Date(`${a} 1, 2000`);
      const bDate = new Date(`${b} 1, 2000`);
      return bDate - aDate;
    });
    months.forEach((month) => {
      const monthEl = document.createElement('h3');
      monthEl.textContent = month;
      block.append(monthEl);
      const postList = document.createElement('ul');
      groupedPosts[year][month].forEach((post) => {
        const postItem = document.createElement('li');
        const postDate = new Date(post.publicationDate * 1000);
        const dateString = postDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
        postItem.innerHTML = `<span class="post-date">${dateString}</span><a href="${post.path}">${post.title}</a> by ${post.author}`;
        postList.append(postItem);
      });
      block.append(postList);
    });
  });
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.innerHTML = '';

  if (window.blogindex && window.blogindex.loaded) {
    const groupedPosts = groupPosts(window.blogindex.data);
    renderArchive(groupedPosts, block);
  } else {
    document.addEventListener('dataset-ready', () => {
      const groupedPosts = groupPosts(window.blogindex.data);
      renderArchive(groupedPosts, block);
    });
  }
}
