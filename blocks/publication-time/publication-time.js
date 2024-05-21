import '../../web-components/relative-time.js';

export default function decorate($block) {
  // First row of the block defines the text prefix
  const prefix = $block.querySelector(':scope > div > div ')?.textContent?.trim();

  // Output the <relative-time> element as specified,
  // https://github.com/github/relative-time-element
  if (!document.lastModified) {
    // eslint-disable-next-line no-console
    console.error('document.lastModified returns null');
  } else {
    const lastMod = new Date(document.lastModified);
    const p = document.createElement('p');
    const rt = document.createElement('relative-time');
    rt.setAttribute('datetime', lastMod.toISOString());
    rt.textContent = lastMod.toLocaleDateString();
    p.textContent = `${prefix} `;
    p.appendChild(rt);
    $block.replaceChildren(p);
  }
}
