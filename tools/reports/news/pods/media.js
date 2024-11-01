function buildChart(media) {
  const chart = document.createElement('div');
  chart.role = 'list';
  media.forEach((m, i) => {
    const wrapper = document.createElement('div');
    wrapper.role = 'listitem';
    wrapper.addEventListener('click', () => {
      const expanded = wrapper.classList.contains('expand');
      chart.querySelectorAll('.expand').forEach((e) => e.removeAttribute('class'));
      if (expanded) wrapper.classList.remove('expand');
      else wrapper.classList.add('expand');
    });
    const bar = document.createElement('div');
    bar.setAttribute('aria-label', `Media ${i + 1} engagement: ${m.value}%`);
    bar.setAttribute('aria-valuenow', m.value);
    bar.className = 'chart-bar';
    bar.style.width = 0;
    const img = document.createElement('img');
    img.src = m.preview;
    img.alt = ''; // image has no contextual value
    const value = document.createElement('span');
    value.setAttribute('aria-hidden', true); // hide duplicative content
    value.textContent = `${m.value}%`;
    bar.append(img);
    wrapper.append(bar, value);
    chart.append(wrapper);
  });

  if (!media.length) {
    const noMedia = document.createElement('p');
    noMedia.role = 'listitem';
    noMedia.textContent = 'This post had no observable media engagement.';
    chart.append(noMedia);
    chart.className = 'empty';
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          chart.querySelectorAll('.chart-bar').forEach((bar, i) => {
            setTimeout(() => {
              bar.style.width = `${media[i].value}%`; // expand to target width
              bar.querySelector('img').style.objectPosition = 'center';
            }, i * 150); // cascade bar expansions
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0 });
    observer.observe(chart);
  }

  return chart;
}

export default function buildMediaChart(media, id) {
  const container = document.getElementById(id);

  if (container) {
    if (container.querySelector('figure')) {
      container.querySelector('figure').remove();
    }
    if (media.length > 8) container.parentElement.classList.add('bulkMedia');
    else container.parentElement.classList.remove('bulkMedia');
    const wrapper = document.createElement('figure');
    const title = document.createElement('figcaption');
    title.textContent = 'Media Engagement By Depth on Blog Post';
    const chart = buildChart(media);
    wrapper.append(title, chart);
    container.append(wrapper);
  }
}
