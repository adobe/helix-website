export default async function decorate(block) {
  const content = block.firstElementChild;
  content.className = 'venn-content';
  const segments = ['left', 'intersection', 'right'];
  [...content.children].forEach((segment, i) => {
    const layout = segments[i];
    if (layout) segment.className = `venn-content-${layout}`;
  });
}
