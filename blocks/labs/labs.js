export default function decorate(block) {
  const header = document.createElement('div');
  header.className = 'header';
  let parts;
  if (block.querySelector('h1, h2, h3, h4, h5, h6')) {
    parts = [block.querySelector('h1, h2, h3, h4, h5, h6').innerText];
    block.querySelector('h1, h2, h3, h4, h5, h6').remove();
    parts.push(block.innerHTML);
  } else {
    parts = block.innerText.split(/:/)
      .map((p) => p.trim());
  }
  if (parts.length === 1) {
    parts.unshift('Early-access technology');
    parts[1] = `Ask us about this feature from the ${parts[1]} labs on your Slack channel!`;
  }
  [header.textContent, block.innerHTML] = parts;
  block.prepend(header);
}
