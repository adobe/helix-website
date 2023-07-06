import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  const usp = new URLSearchParams(window.location.search);
  const keys = Object.keys(config);
  block.textContent = '';
  if (keys.every((key) => usp.get(key))) {
    block.innerHTML = '<p>For your conveniece find the values for this screen below to copy/paste</p>';
    keys.forEach((key) => {
      const div = document.createElement('div');
      div.innerHTML = `<span>${config[key]}</span>`;
      const input = document.createElement('input');
      input.value = usp.get(key);
      div.append(input);
      const button = document.createElement('button');
      button.textContent = 'copy';
      button.addEventListener('click', () => {
        input.select();
        document.execCommand('copy');
      });
      div.append(button);
      block.append(div);
    });
  }
}
