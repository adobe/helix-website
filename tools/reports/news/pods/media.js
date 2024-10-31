function buildChart(media) {
  const chart = document.createElement('div');
  media.forEach((m, i) => {
    const wrapper = document.createElement('div');
    wrapper.addEventListener('click', () => {
      const expanded = wrapper.classList.contains('expand');
      chart.querySelectorAll('.expand').forEach((e) => e.removeAttribute('class'));
      if (expanded) wrapper.classList.remove('expand');
      else wrapper.classList.add('expand');
    });
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.width = `${m.value}%`;
    const img = document.createElement('img');
    img.src = m.preview;
    img.alt = `Media ${i + 1}`;
    const value = document.createElement('span');
    value.textContent = `${m.value}%`;
    bar.append(img);
    wrapper.append(bar, value);
    chart.append(wrapper);
  });
  return chart;
}

export default function buildMediaChart(media, id) {
  const container = document.getElementById(id);

  if (container) {
    if (container.querySelector('.chart')) {
      container.querySelector('.chart > div').remove();
    }
    if (media.length > 8) container.parentElement.classList.add('bulkMedia');
    else container.parentElement.classList.remove('bulkMedia');
    const title = document.createElement('h2');
    title.textContent = 'Media Engagement By Depth on Blog Post';
    const chart = buildChart(media);
    container.append(title, chart);
  }
}
