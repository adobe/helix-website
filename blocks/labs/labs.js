export default function decorate(block) {
  const header = document.createElement('div');
  header.className = 'header';
  header.textContent = block.textContent.startsWith('Brand New')
    ? 'Brand New'
    : 'Early-access technology';
  block.innerHTML = block.textContent.startsWith('Brand New')
    ? block.textContent.replace('Brand New', '').trim()
    : ` Ask us about this feature from the ${block.textContent.trim()} labs on your Slack channel!`;
  block.prepend(header);
}
