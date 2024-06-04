export default async function decorate(block) {
  const content = block.firstElementChild;
  content.className = 'venn-content';
  const segments = ['left', 'intersection', 'right'];
  [...content.children].forEach((segment, i) => {
    const layout = segments[i];
    if (layout) segment.className = `venn-content-${layout}`;
  });

  // retrieve level query param
  const urlParams = new URLSearchParams(window.location.search);
  const level = urlParams.get('level') || 1;
  content.querySelectorAll('li').forEach((li) => {
    const str = li.textContent;
    // extract start and end levels from string - format: (1,6)

    const match = str.match(/\((\d+),(\d+)\)/);
    if (match) {
      const [start, end] = match.slice(1).map(Number);
      if (level >= start) {
        li.classList.add('venn-active');
      }
      // remove levels from string
      const a = li.querySelector('a');
      if (a) {
        li.lastChild.textContent = li.lastChild.textContent.replace(match[0], '');
      } else {
        li.textContent = li.textContent.replace(match[0], '');
      }

      const p = ((level - start) / (end - start)) * 100;

      li.style.background = `linear-gradient(90deg, rgba(0,255,0,1) 0%, rgba(255,255,255,1) ${p}%)`;
    }
  });
}
