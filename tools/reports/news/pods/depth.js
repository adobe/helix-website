function buildImg(src, i) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = `Media ${i + 1}`;
  return img;
}

function buildVideo(src, type, i) {
  const video = document.createElement('video');
  ['autoplay', 'loop', 'muted', 'playsinline'].forEach((property) => {
    video[property] = true;
  });
  video.setAttribute('aria-label', `Media ${i + 1}`);
  const source = document.createElement('source');
  source.src = src;
  source.type = `video/${type}`;
  video.append(source);
  return video;
}

function buildTableEl(count) {
  const table = document.createElement('table');
  const caption = document.createElement('caption');
  caption.textContent = 'Media Engagement By Depth on Blog Post';
  const head = document.createElement('thead');
  head.innerHTML = `<tr>
      <th scope="col">Media Preview</th>
      <th scope="col"><span data-before="by">Engagement</span></th>
    </tr>`;
  const body = document.createElement('tbody');
  const foot = document.createElement('tfoot');
  foot.innerHTML = `<tr>
      <td>${count} media previews</td>
      <td class="metric-sum"></td>
    </tr>`;
  table.append(caption, head, body, foot);
  return table;
}

export default function buildDepthBlock(depths, id) {
  const container = document.getElementById(id);
  if (container) {
    if (container.querySelector('table')) {
      container.querySelector('table').remove();
    }
    if (depths.length > 8) container.parentElement.classList.add('bulkMedia');
    else container.parentElement.classList.remove('bulkMedia');

    const table = buildTableEl(depths.length);
    const body = table.querySelector('tbody');
    container.append(table);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          table.querySelectorAll('td .bar').forEach((bar, i) => {
            setTimeout(() => {
              bar.style.width = `${parseInt(bar.dataset.value, 10)}%`; // expand to target width
            }, i * 150); // cascade bar expansions
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0 });
    observer.observe(table);

    // supported media types
    const imgs = ['jpeg', 'jpg', 'png', 'gif', 'svg'];
    const videos = ['mp4'];
    depths.forEach((depth, i) => {
      const rate = depth.value;
      const row = document.createElement('tr');
      row.innerHTML = `<td class="media-container">
          <div class="media-wrapper"></div>
        </td>
        <td>
          <span class="bar" data-value="${rate}"></span>
          <span>${rate}%</span>
        </td>`;
      body.append(row);
      const preview = row.querySelector('.media-wrapper');
      try {
        const type = new URL(depth.preview).pathname.split('.').pop();
        if (imgs.includes(type)) {
          const img = buildImg(depth.preview, i);
          preview.append(img);
        } else if (videos.includes(type)) {
          const video = buildVideo(depth.preview, type, i);
          preview.append(video);
        } else {
          // try as an image
          const img = buildImg(depth.preview, i);
          preview.append(img);
        }
        preview.addEventListener('click', () => {
          const zoom = preview.classList.contains('zoom');
          container.querySelectorAll('.media-wrapper').forEach((w) => w.classList.remove('zoom'));
          if (!zoom) preview.classList.add('zoom');
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error, 'is not a supported media type.');
        preview.classList.add('unsupported');
        const fallback = document.createElement('p');
        fallback.textContent = 'Media cannot be previewed';
        preview.append(fallback);
      }
    });
  }
}
