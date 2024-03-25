export default function decorate(block) {
  const header = document.createElement('div');
  header.className = 'header';
  const parts = block.innerText.split(/:/);
  if (parts.length === 1) {
    parts.unshift('Early-access technology');
    parts[1] = ` Ask us about this feature from the ${parts[1]} labs on your Slack channel!`;
  }
  [header.textContent, block.innerHTML] = parts;
  block.prepend(header);
}
