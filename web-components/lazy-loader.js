// Web Component that activates any <template>
// elements that it contains only once the
// 'hlx:delayed' event is received.
class LazyLoader extends HTMLElement {
  static register() {
    customElements.define('lazy-loader', LazyLoader);
  }

  constructor() {
    super();
    document.addEventListener('hlx:delayed', this.activateTemplates.bind(this));
  }

  activateTemplates() {
    this.querySelectorAll('template').forEach((t) => {
      this.append(t.content.cloneNode(true));
      this.querySelectorAll('script').forEach((s) => {
        // move any script tags found in the template
        // to document.head to activate them
        const script = document.createElement('script');
        script.setAttribute('src', s.getAttribute('src'));
        script.setAttribute('type', s.getAttribute('type'));
        document.head.appendChild(script);
        s.parentNode.removeChild(s);
      });
      // Remove any "please wait" elements
      this.querySelectorAll('.remove').forEach((r) => {
        r.parentNode.removeChild(r);
      });
    });
  }
}

LazyLoader.register();
