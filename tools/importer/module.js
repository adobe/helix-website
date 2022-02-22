/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-console, no-alert */

'use strict';

(() => {
  const setup = {
    scripts: [{
      src: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.1/codemirror.js',
      deps: [
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.1/mode/xml/xml.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.1/mode/javascript/javascript.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.1/mode/css/css.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.1/mode/htmlmixed/htmlmixed.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.1/mode/markdown/markdown.js',
      ],
    }, {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify-html.min.js',
    }, {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js',
    }, {
      src: '/lib/importer-bundle.js',
    }],
    template: `<div class="wrapper">
    <div class="left">
      <h2>Your transformation</h2>
      <div class="code">
        <textarea id="transformed" rows="4" cols="10"></textarea>
      </div>
    </div>
    <div class="right markdown">
      <h2>Markdown - Preview <input type="checkbox" id="mdPreviewCheckbox" checked><button id="save">Save as Word</button></h2>
      <div class="code hidden">
        <textarea id="markdownSource" rows="4" cols="10"></textarea>
      </div>
      <div id="markdownPreview"></div>
    </div>
  </div>`
  }

  /**
   * Makes the given element accessible by setting a title attribute
   * based on its :before CSS style or text content, and enabling
   * keyboard access.
   * @private
   * @param {HTMLElement} elem The element
   * @returns {HTMLElement} The element
   */
  function makeAccessible(elem) {
    if (elem.tagName === 'A' || elem.tagName === 'BUTTON') {
      const ensureTitle = (tag) => {
        if (!tag.title) {
          // wait for computed style to be available
          window.setTimeout(() => {
            let title = window.getComputedStyle(tag, ':before').getPropertyValue('content');
            title = title !== 'normal' && title !== 'none'
              ? title.substring(1, title.length - 1)
              : '';
            if (!title) {
              title = tag.textContent;
            }
            tag.setAttribute('title', title);
          }, 200);
        }
      };
      ensureTitle(elem);
      elem.setAttribute('tabindex', '0');
    }
    return elem;
  }

  /**
   * Extends a tag.
   * @private
   * @param {HTMLElement} tag The tag to extend
   * @param {elemConfig}  config The tag configuration object
   * @returns {HTMLElement} The extended tag
   */
  function extendTag(tag, config) {
    if (typeof config.attrs === 'object') {
      for (const [key, value] of Object.entries(config.attrs)) {
        tag.setAttribute(key, value);
      }
    }
    if (typeof config.lstnrs === 'object') {
      for (const [name, fn] of Object.entries(config.lstnrs)) {
        if (typeof fn === 'function') {
          tag.addEventListener(name, fn);
        }
      }
    }
    if (typeof config.text === 'string') {
      tag.textContent = config.text;
    }
    return tag;
  }

  /**
   * Creates a tag.
   * @private
   * @param {elemConfig} config The tag configuration
   * @returns {HTMLElement} The new tag
   */
  function createTag(config) {
    if (typeof config.tag !== 'string') {
      return null;
    }
    const el = document.createElement(config.tag);
    return extendTag(el, config);
  }

  /**
   * Creates a tag with the given name, attributes and listeners,
   * and appends it to the parent element.
   * @private
   * @param {HTMLElement} parent The parent element
   * @param {elemConfig}  config The tag configuration
   * @param {HTMLElement} before The element to insert before (optional)
   * @returns {HTMLElement} The new tag
   */
  function appendTag(parent, config, before) {
    return makeAccessible(before
      ? parent.insertBefore(createTag(config), before)
      : parent.appendChild(createTag(config)));
  }

   /**
   * Returns the sidekick configuration.
   * @private
   * @param {sidekickConfig} cfg The sidekick config (defaults to {@link window.hlx.sidekickConfig})
   * @param {Location} location The current location
   * @returns {Object} The sidekick configuration
   */
    function initConfig() {
      const config = window.hlx && window.hlx.importerConfig || {};
      return config;
    }


  /**
   * The importer provides helper tools for authors.
   * @augments HTMLElement
   */
   class Importer extends HTMLElement {
    /**
     * Creates a new importer.
     * @param {importerConfig} cfg The importer config
     */
     constructor(cfg) {
      super();
      this.config = initConfig();
      this.attachShadow({ mode: 'open' });
      this.root = appendTag(this.shadowRoot, {
        tag: 'div',
        attrs: {
          class: 'hlx-importer hlx-importer-hidden hlx-importer-loading',
        },
      });

      this.loadSequence();
    }

    async loadSequence() {
      this.loadCSS();
      await this.loadScripts();
      await this.initProjectTransformPolling();
      this.init();
    }

    async loadScripts() {
      const shadowRoot = this.shadowRoot;
      for (let i=0; i < setup.scripts.length; i++) {
        const script = setup.scripts[i];
        await this.loadJS(script.src);
        
        if (script.deps) {
          for (let j=0; j < script.deps.length; j++) {
            const sub = script.deps[j]
            await this.loadJS(sub);
          }
        }
      }
    }

    async initProjectTransformPolling() {
      const $this = this;
      const loadModule = async (projectTransformFileURL) => {
        try { 
          const mod = await import(`${projectTransformFileURL}?cf=${new Date().getTime()}`);
          if (mod.default) {
            this.projectTransform = mod.default;
          }
        } catch (err) {
          console.warn(`failed to load project transform module`, err);
        }
      }
      const poll = async () => {
        const projectTransformFileURL = this.config.importFileURL;
        try {
          const res = await fetch(projectTransformFileURL);
          const body = await res.text();

          if (body !== $this.lastProjectTransformFileBody) {
            $this.lastProjectTransformFileBody = body;
            await loadModule(projectTransformFileURL);
            $this.transform();
          }
        } catch (err) {
          if ($this.lastProjectTransformFileBody !== 'nofilefound') {
            console.warn(`failed to poll project transform module`, err);
            $this.lastProjectTransformFileBody = 'nofilefound';
            $this.transform();
          }
          
        }
      };

      if (!this.projectTransformInterval) {
        await poll();
        this.projectTransformInterval = setInterval(poll, 5000);
      }
    }

    init() {
      this.root.innerHTML = setup.template;
      
      this.transformedEditor = CodeMirror.fromTextArea(this.shadowRoot.getElementById('transformed'), {
        lineNumbers: true,
        mode: 'htmlmixed',
        theme: 'base16-dark',
      });
      this.transformedEditor.setSize('100%', '440');
      
      this.markdownSource = this.shadowRoot.getElementById('markdownSource');
      this.markdownEditor = CodeMirror.fromTextArea(this.markdownSource, {
        lineNumbers: true,
        mode: 'markdown',
        theme: 'base16-dark',
      });
      this.markdownEditor.setSize('100%', '440');

      this.showdownConverter = new showdown.Converter();
      this.markdownPreview = this.shadowRoot.getElementById('markdownPreview');

      this.shadowRoot.getElementById('mdPreviewCheckbox').addEventListener('click',  ((evt) => {
        if (evt.target.checked) {
          this.markdownSource.parentElement.classList.add('hidden');
          this.markdownPreview.classList.remove('hidden');
        } else {
          this.markdownPreview.classList.add('hidden');
          this.markdownSource.parentElement.classList.remove('hidden');
          this.markdownEditor.refresh();
        }
      }).bind(this));

      this.shadowRoot.getElementById('save').addEventListener('click',  (async (evt) => {
        const out = await WebImporter.html2docx(window.location.href, document.documentElement.outerHTML, this.projectTransform);
        const { docx, name } = out;
        let filename = window.location.pathname
          .replace(/^\//, '')
          .replace(/\/$/, '.docx')
          .replace(/\//, '---');

        if (name) {
          filename = `${name}.docx`;
        }

        const a = document.createElement('a');
        const blob = new Blob([ docx ], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        a.setAttribute('href', URL.createObjectURL(blob));
        a.setAttribute('download', filename);
        a.click()
      }).bind(this));
    }

    async transform() {
      const out = await WebImporter.html2md(window.location.href, document.documentElement.outerHTML, this.projectTransform);
      const { md, html: outputHTML } = out;
      
      this.transformedEditor.setValue(html_beautify(outputHTML));
      this.markdownEditor.setValue(md || '');

      const mdPreview = this.showdownConverter.makeHtml(md);
      this.markdownPreview.innerHTML = mdPreview;

      // remove existing classes and styles
      Array.from(this.markdownPreview.querySelectorAll('[class], [style]')).forEach((t) => {
        t.removeAttribute('class');
        t.removeAttribute('style');
      });
        
    }

    /**
     * Shows the importer.
     * @fires Importer#shown
     * @returns {Importer} The importer
     */
    show() {
      if (this.root.classList.contains('hlx-importer-hidden')) {
        this.root.classList.remove('hlx-importer-hidden');
      }
      return this;
    }

    hide() {
      if (!this.root.classList.contains('hlx-importer-hidden')) {
        this.root.classList.add('hlx-importer-hidden');
      }
      return this;
    }

    toggle() {
      if (this.root.classList.contains('hlx-importer-hidden')) {
        this.show();
      } else {
        this.hide();
      }
      return this;
    }

    loadCSS(path) {
      let href = path;
      if (!path) {
        href = `${this.config.host}/app.css`;
      } else {
        if (!path.startsWith('http')) {
          href = `${this.config.host}${path}`;
        }
      }
      appendTag(this.shadowRoot, {
        tag: 'link',
        attrs: {
          rel: 'stylesheet',
          href,
        },
      });
      return this;
    }

    async loadJS(path) {
      let src = path;
      if (!path.startsWith('http')) {
        src = `${this.config.host}${path}`;
      }
      return new Promise((resolve) => {
        appendTag(this.shadowRoot, {
          tag: 'script',
          attrs: {
            src,
          },
          lstnrs: {
            load: () => resolve(),
          }
        });
      });
    }
  }

  function initImporter(cfg = {}) {
    if (!window.hlx.importer) {
      window.hlx.importerConfig = Object.assign(window.hlx.importerConfig || {}, cfg);

      // init and show importer
      if (!window.customElements.get('helix-importer')) {
        window.customElements.define('helix-importer', Importer);
      }
      // make sure there is only one importer
      document.querySelectorAll('helix-importer').forEach((importer) => importer.replaceWith(''));
      window.hlx.importer = document.createElement('helix-importer');
      document.body.prepend(window.hlx.importer);
      window.hlx.importer.show();
    } else {
      // toggle importer
      window.hlx.importer.toggle();
    }
    return window.hlx.importer;
  }

  window.hlx = window.hlx || {};
  window.hlx.initImporter = initImporter;
})();