export default function decorate(block) {
  const header = document.createElement('div');
  header.className = 'header';
  header.textContent = 'Early-access technology';
  block.innerHTML = `Ask us about this feature from the ${block.textContent.trim()} labs on your Slack channel!`;
  block.prepend(header);
}
