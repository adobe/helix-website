export function Template({ inner, url, selector, index }) {
  const wrapper = document.createElement('div');
  const container = document.createElement('div');
  container.append(wrapper);
  if (inner) {
    wrapper.innerHTML = inner.replace(/\.(\/media_[0-9a-f]{41})/g, 'http://localhost:3000$1');

    this.decorate(wrapper.firstElementChild);

    const [name] = wrapper.firstElementChild.classList;
    container.classList.add(`${name}-container`);
    wrapper.classList.add(`${name}-wrapper`);
  } else if (url) {
    fetch(`http://localhost:3000${url}.plain.html`).then(res => {
      res.text().then(html => {
        const parser = new DOMParser();
        const mydoc = parser.parseFromString(html, 'text/html');
        const node = mydoc.querySelectorAll(selector).item(index);

        wrapper.innerHTML = node.outerHTML.replace(/\.(\/media_[0-9a-f]{41})/g, 'http://localhost:3000$1');
        this.decorate(wrapper.firstElementChild);

        const [name] = wrapper.firstElementChild.classList;
        container.classList.add(`${name}-container`);
        wrapper.classList.add(`${name}-wrapper`);
        console.log(name);
      });
    });
  }
  return container;
};