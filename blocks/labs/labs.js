export default function decorate(block) {
  const headings = block.querySelector('h1, h2, h3, h4, h5, h6');
  const body = block.querySelector('p');
  const header = document.createElement('div');
  header.className = 'header';
  header.textContent = headings.textContent || 'Early-access technology';
  block.innerHTML = body
    ? body.innerHTML
    : `Ask us about this feature from the ${block.textContent.trim()} labs on your Slack channel!`;
  block.prepend(header);
}
