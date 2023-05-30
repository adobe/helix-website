/*
 * Copyright 2021 Adobe. All rights reserved.
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

(() => {
  /**
   * @typedef {Object} ElemConfig
   * @private
   * @description The configuration of an element to add.
   * @prop {string}      tag    The tag name (mandatory)
   * @prop {string}      text   The text content (optional)
   * @prop {Object[]}  attrs  The attributes (optional)
   * @prop {Object[]} lstnrs The event listeners (optional)
   */

  /**
   * @typedef {Object} PluginButton
   * @private
   * @description The configuration for a plugin button. This can be used as
   * a shorthand for {@link elemConfig}.
   * @prop {string}   text   The button text
   * @prop {Function} action The click listener
   * @prop {Function} isPressed=false Determines whether the button is pressed
   * @prop {Function} isEnabled=true Determines whether to enable the button
   * @prop {boolean}  isDropdown=false Determines whether to turn this button into a dropdown
   */

  /**
   * @typedef {Object} _Plugin
   * @private
   * @description The internal plugin configuration.
   * @prop {string}       id        The plugin ID (mandatory)
   * @prop {PluginButton} button    A button configuration object (optional)
   * @prop {string}       container The ID of a dropdown to add this plugin to (optional)
   * @prop {boolean}      feature=false Determines whether to group this plugin with the features
   * @prop {boolean}      override=false Determines whether to replace an existing plugin
   * @prop {ElemConfig[]} elements  An array of elements to add (optional)
   * @prop {Function}     condition Determines whether to show this plugin (optional).
   * This function is expected to return a boolean when called with the sidekick as argument.
   * @prop {Function}     advanced  Show this plugin only in advanced mode (optional).
   * This function is expected to return a boolean when called with the sidekick as argument.
   * @prop {Function}     callback  A function called after adding the plugin (optional).
   * This function is called with the sidekick and the newly added plugin as arguments.
   */

  /**
   * @typedef {Object} Plugin
   * @description The plugin configuration.
   * @prop {string} id The plugin ID (mandatory)
   * @prop {string} title The button text
   * @prop {Object} titleI18n={} A map of translated button texts
   * @prop {string} url The URL to open when the button is clicked
   * @prop {boolean} passConfig Append additional sk info to the url as query parameters:
   *                          ref, repo, owner, host, project
   * @prop {boolean} passReferrer Append the referrer URL as a query param on new URL button click
   * @prop {string} event The name of a custom event to fire when the button is clicked.
   *                      Note: Plugin events get a custom: prefix, e.g. "foo" becomes "custom:foo".
   * @prop {string} containerId The ID of a dropdown to add this plugin to (optional)
   * @prop {boolean} isContainer Determines whether to turn this plugin into a dropdown
   * @prop {boolean} isPalette Determines whether a URL is opened in a palette instead of a new tab
   * @prop {string} paletteRect The dimensions and position of a palette (optional)
   * @prop {string[]} environments Specifies when to show this plugin
   *                               (admin, edit, dev, preview, live, prod)
   * @prop {string[]} excludePaths Exclude the plugin from these paths (glob patterns supported)
   * @prop {string[]} includePaths Include the plugin on these paths (glob patterns supported)
   */

  /**
   * @typedef {Object} ViewConfig
   * @description A custom view configuration.
   * @prop {string} path The path or globbing pattern where to apply this view
   * @prop {string} css The URL of a CSS file or inline CSS to render this view (optional)
   */

  /**
   * @typedef {Object} HelpStep
   * @description The definition of a help step inside a {@link HelpTopic|help topic}.
   * @prop {string} message The help message
   * @prop {string} selector The CSS selector of the target element
   */

  /**
   * @typedef {Object} HelpTopic
   * @description The definition of a help topic.
   * @prop {string} id The ID of the help topic
   * @prop {HelpStep[]} steps An array of {@link HelpStep|help steps}
   */

  /**
   * @typedef {Object} SidekickConfig
   * @description The sidekick configuration.
   * @prop {string} owner The GitHub owner or organization (mandatory)
   * @prop {string} repo The GitHub owner or organization (mandatory)
   * @prop {string} ref=main The Git reference or branch (optional)
   * @prop {string} mountpoint The content source URL (optional)
   * @prop {string} project The name of the project used in the sharing link (optional)
   * @prop {Plugin[]} plugins An array of {@link Plugin|plugin configurations} (optional)
   * @prop {string} previewHost The host name of a custom preview CDN (optional)
   * @prop {string} liveHost The host name of a custom live CDN (optional)
   * @prop {string} host The production host name to publish content to (optional)
   * @prop {boolean} byocdn=false <pre>true</pre> if the production host is a 3rd party CDN
   * @prop {boolean} devMode=false Loads configuration and plugins from the development environment
   * @prop {boolean} devOrigin=http://localhost:3000 URL of the local development environment
   * @prop {boolean} pushDown=false <pre>true</pre> to have the sidekick push down page content
   * @prop {string} pushDownSelector The CSS selector for absolute elements to also push down
   * @prop {ViewConfig[]} specialViews An array of custom {@link ViewConfig|view configurations}
   * @prop {number} adminVersion The specific version of admin service to use (optional)
   */

  /**
   * @external
   * @name "window.hlx.sidekickConfig"
   * @type {SidekickConfig}
   * @description The global variable holding the initial sidekick configuration.
   */

  /**
   * @external
   * @name "window.hlx.sidekick"
   * @type {Sidekick}
   * @description The global variable referencing the {@link Sidekick} singleton.
   */

  /**
   * @external
   * @name "window.hlx.sidekickScript"
   * @type {Element}
   * @description The <pre>script</pre> element which loaded the sidekick module.
   */

  /**
   * @event Sidekick#shown
   * @type {Sidekick} The sidekick
   * @description This event is fired when the sidekick has been shown.
   */

  /**
   * @event Sidekick#hidden
   * @type {Sidekick} The sidekick
   * @description This event is fired when the sidekick has been hidden.
   */

  /**
   * @event Sidekick#pluginused
   * @type {Object} The plugin used
   * @property {string} id The plugin ID
   * @property {Element} button The button element
   * @description This event is fired when a sidekick plugin has been used.
   */

  /**
   * @event Sidekick#contextloaded
   * @type {Object} The context object
   * @property {SidekickConfig} config The sidekick configuration
   * @property {Location} location The sidekick location
   * @description This event is fired when the context has been loaded.
   */

  /**
   * @event Sidekick#statusfetched
   * @type {Object} The status object
   * @description This event is fired when the status has been fetched.
   */

  /**
   * @event Sidekick#envswitched
   * @type {Object} The environment object
   * @property {string} sourceUrl The URL of the source environment
   * @property {string} targetUrl The URL of the target environment
   * @description This event is fired when the environment has been switched
   */

  /**
   * @event Sidekick#updated
   * @type {string} The updated path
   * @description This event is fired when a path has been updated.
   */

  /**
   * @event Sidekick#deleted
   * @type {string} The deleted path
   * @description This event is fired when a path has been deleted.
   */

  /**
   * @event Sidekick#published
   * @type {string} The published path
   * @description This event is fired when a path has been published.
   */

  /**
   * @event Sidekick#unpublished
   * @type {string} The unpublished path
   * @description This event is fired when a path has been unpublished.
   */

  /**
   * @event Sidekick#loggedin
   * @type {Sidekick} The sidekick
   * @description This event is fired when a user has logged in.
   */

  /**
   * @event Sidekick#loggedout
   * @type {Sidekick} The sidekick
   * @description This event is fired when a user has logged out.
   */

  /**
   * @event Sidekick#helpnext
   * @type {string} The help topic
   * @description This event is fired when a user clicks next on a help dialog.
   */

  /**
   * @event Sidekick#helpdismissed
   * @type {string} The help topic
   * @description This event is fired when a help dialog has been dismissed.
   */

  /**
   * @event Sidekick#helpacknowledged
   * @type {string} The help topic
   * @description This event is fired when a help dialog has been acknowledged.
   */

  /**
   * @event Sidekick#helpoptedout
   * @type {string} The help topic
   * @description This event is fired when a user decides to opt out of help content.
   */

  /**
   * Mapping between the plugin IDs that will be treated as environments
   * and their corresponding host properties in the config.
   * @private
   * @type {Object}
   */
  const ENVS = {
    dev: 'localhost',
    preview: 'innerHost',
    live: 'outerHost',
    prod: 'host',
  };

  /**
   * Array of restricted paths with limited sidekick functionality.
   * @private
   * @type {string[]}
   */
  const RESTRICTED_PATHS = [
    '/helix-env.json',
  ];

  /**
   * Log RUM for sidekick telemetry.
   * @private
   * @param {string} checkpoint identifies the checkpoint in funnel
   * @param {Object} data additional data for RUM sample
   */
  function sampleRUM(checkpoint, data = {}) {
    sampleRUM.defer = sampleRUM.defer || [];
    const defer = (fnname) => {
      sampleRUM[fnname] = sampleRUM[fnname]
        || ((...args) => sampleRUM.defer.push({ fnname, args }));
    };
    sampleRUM.drain = sampleRUM.drain
      || ((dfnname, fn) => {
        sampleRUM[dfnname] = fn;
        sampleRUM.defer
          .filter(({ fnname }) => dfnname === fnname)
          .forEach(({ fnname, args }) => sampleRUM[fnname](...args));
      });
    sampleRUM.on = (chkpnt, fn) => {
      sampleRUM.cases[chkpnt] = fn;
    };
    defer('observe');
    defer('cw');
    try {
      window.hlx = window.hlx || {};
      const sk = window.hlx.sidekick;
      if (!window.hlx.rum) {
        const usp = new URLSearchParams(sk.location.search);
        const weight = (usp.get('hlx-sk-rum') === 'on') ? 1 : 10; // with parameter, weight is 1. Defaults to 10.
        // eslint-disable-next-line no-bitwise
        const hashCode = (s) => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
        const id = `${hashCode(sk.location.href)}-${new Date().getTime()}-${Math.random().toString(16).substr(2, 14)}`;
        const random = Math.random();
        const isSelected = (random * weight < 1);
        // eslint-disable-next-line object-curly-newline
        window.hlx.rum = { weight, id, random, isSelected, sampleRUM };
      }
      const { weight, id } = window.hlx.rum;
      if (window.hlx && window.hlx.rum && window.hlx.rum.isSelected) {
        const sendPing = () => {
          // eslint-disable-next-line object-curly-newline, max-len, no-use-before-define
          const body = JSON.stringify({ weight, id, referer: sk.location.href, generation: window.hlx.RUM_GENERATION, checkpoint, ...data });
          const url = `https://rum.hlx.page/.rum/${weight}`;
          // eslint-disable-next-line no-unused-expressions
          navigator.sendBeacon(url, body);
        };
        sampleRUM.cases = sampleRUM.cases || {
          cwv: () => sampleRUM.cwv(data) || true,
          lazy: () => {
            // use classic script to avoid CORS issues
            const script = document.createElement('script');
            script.src = 'https://rum.hlx.page/.rum/@adobe/helix-rum-enhancer@^1/src/index.js';
            document.head.appendChild(script);
            return true;
          },
        };
        sendPing(data);
        if (sampleRUM.cases[checkpoint]) {
          sampleRUM.cases[checkpoint]();
        }
      }
    } catch (error) {
      // something went wrong
    }
  }

  /**
   * Retrieves project details from a host name.
   * @private
   * @param {string} host The host name
   * @returns {string[]} The project details
   * @throws {Error} if host is not a project host
   */
  function getProjectDetails(host) {
    const details = host.split('.')[0].split('--');
    if (details.length < 2) {
      throw new Error('not a project host');
    }
    if (details.length === 3) {
      // lose ref
      details.shift();
    }
    return details;
  }

  /**
   * Checks if a project host name matches another, regardless of ref.
   * @private
   * @param {string} baseHost The base host
   * @param {string} host The host to match against the base host
   * @returns {boolean} <code>true</code> if the hosts match, else <code>false</code>
   */
  function matchProjectHost(baseHost, host) {
    if (!baseHost || !host) {
      return false;
    }
    // direct match
    if (baseHost === host) {
      return true;
    }
    // matching project domains
    const projectDomains = ['page', 'hlx.live'];
    if (!projectDomains.find((domain) => baseHost.endsWith(domain)
      && host.endsWith(domain))) {
      return false;
    }
    // project details
    try {
      const [baseHostRepo, baseHostOwner] = getProjectDetails(baseHost);
      const [hostRepo, hostOwner] = getProjectDetails(host);
      return baseHostOwner === hostOwner && baseHostRepo === hostRepo;
    } catch (e) {
      // ignore if no project host
    }
    return false;
  }

  /**
   * Turns a globbing into a regular expression.
   * @private
   * @param {string} glob The globbing
   * @returns The regular expression
   */
  function globToRegExp(glob) {
    if (!glob) {
      glob = '**';
    }
    const reString = glob
      .replace(/\*\*/g, '_')
      .replace(/\*/g, '[0-9a-z-.]*')
      .replace(/_/g, '.*');
    return new RegExp(`^${reString}$`);
  }

  /**
   * Creates an Admin URL for an API and path.
   * @private
   * @param {Object} config The sidekick configuration
   * @param {string} api The API endpoint to call
   * @param {string} path The current path
   * @returns {URL} The admin URL
   */
  function getAdminUrl({
    owner, repo, ref, adminVersion,
  }, api, path = '') {
    const adminUrl = new URL([
      'https://admin.hlx.page/',
      api,
      `/${owner}`,
      `/${repo}`,
      `/${ref}`,
      path,
    ].join(''));
    if (adminVersion) {
      adminUrl.searchParams.append('hlx-admin-version', adminVersion);
    }
    return adminUrl;
  }

  /**
   * Returns the fetch options for admin requests
   * @param {boolean} omitCredentials Should we omit the credentials
   * @returns {object}
   */
  function getAdminFetchOptions(omitCredentials = false) {
    const opts = {
      cache: 'no-store',
      credentials: omitCredentials ? 'omit' : 'include',
      headers: {},
    };
    return opts;
  }

  /**
   * Returns the sidekick configuration.
   * @private
   * @param {SidekickConfig} cfg The sidekick config (defaults to {@link window.hlx.sidekickConfig})
   * @param {Location} location The current location
   * @returns {Object} The sidekick configuration
   */
  async function initConfig(cfg, location) {
    let config = cfg || (window.hlx && window.hlx.sidekickConfig) || {};
    const {
      owner,
      repo,
      ref = 'main',
      devMode,
      adminVersion,
      _extended,
    } = config;
    let { devOrigin } = config;
    if (!devOrigin) {
      devOrigin = 'http://localhost:3000';
    }
    if (owner && repo && !_extended) {
      // look for custom config in project
      const configUrl = devMode
        ? `${devOrigin}/tools/sidekick/config.json`
        : getAdminUrl(config, 'sidekick', '/config.json');
      try {
        const res = await fetch(configUrl, getAdminFetchOptions(true));
        if (res.status === 200) {
          config = {
            ...config,
            ...(await res.json()),
            // no overriding below
            owner,
            repo,
            ref,
            devMode,
            adminVersion,
            _extended: Date.now(),
          };
        }
      } catch (e) {
        console.log('error retrieving custom sidekick config', e);
      }
    }

    const {
      previewHost,
      liveHost,
      outerHost: legacyLiveHost,
      host,
      project,
      pushDown,
      pushDownSelector,
      specialViews,
      scriptUrl = 'https://www.hlx.live/tools/sidekick/module.js',
      scriptRoot = scriptUrl.split('/').filter((_, i, arr) => i < arr.length - 1).join('/'),
    } = config;
    const publicHost = host && host.startsWith('http') ? new URL(host).host : host;
    const hostPrefix = owner && repo ? `${ref}--${repo}--${owner}` : null;
    let innerHost = previewHost;
    if (!innerHost) {
      innerHost = hostPrefix ? `${hostPrefix}.hlx.page` : null;
    }
    let outerHost = liveHost || legacyLiveHost;
    if (!outerHost) {
      outerHost = hostPrefix ? `${hostPrefix}.hlx.live` : null;
    }
    const devUrl = new URL(devOrigin);
    // define elements to push down
    const pushDownElements = [];
    if (pushDown) {
      document.querySelectorAll(
        `html, iframe#WebApplicationFrame${pushDownSelector ? `, ${pushDownSelector}` : ''}`,
      ).forEach((elem) => pushDownElements.push(elem));
    }
    // default views
    const defaultSpecialViews = [
      {
        path: '**.json',
        js: `${scriptRoot}/view/json.js`,
      },
    ];
    // try custom views first
    const allSpecialViews = Array.isArray(specialViews)
      ? specialViews.concat(defaultSpecialViews)
      : defaultSpecialViews;
    // find view based on path
    const { pathname } = location;
    const specialView = allSpecialViews.find(({
      path,
    }) => !RESTRICTED_PATHS.includes(pathname) && globToRegExp(path).test(pathname));

    return {
      ...config,
      ref,
      innerHost,
      outerHost,
      scriptRoot,
      host: publicHost,
      project: project || '',
      pushDownElements,
      specialView,
      devUrl,
    };
  }

  /**
   * Returns the location of the current document.
   * @private
   * @returns {Location} The location object
   */
  function getLocation() {
    // first check if there is a test location
    const $test = document.getElementById('sidekick_test_location');
    if ($test) {
      try {
        return new URL($test.value);
      } catch (e) {
        return null;
      }
    }
    // fall back to window location
    const {
      hash, host, hostname, href, origin, pathname, port, protocol, search,
    } = window.location;

    return {
      hash,
      host,
      hostname,
      href,
      origin,
      pathname,
      port,
      protocol,
      search,
    };
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
      if (!elem.title) {
        elem.title = elem.textContent;
      }
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
   * @param {HTMLElement|elemConfig}  config The tag (configuration)
   * @param {HTMLElement} before The element to insert before (optional)
   * @returns {HTMLElement} The new tag
   */
  function appendTag(parent, config, before) {
    const tag = config instanceof HTMLElement ? config : createTag(config);
    return makeAccessible(before
      ? parent.insertBefore(tag, before)
      : parent.appendChild(tag));
  }

  /**
   * Retrieves a string from the dictionary in the user's language.
   * @private
   * @param {Sidekick} sk The sidekick
   * @param {string} key The dictionary key
   * @returns {string} The string in the user's language
   */
  function i18n(sk, key) {
    return sk.dict ? (sk.dict[key] || '') : '';
  }

  /**
   * Listener to collapse all dropdowns when document is clicked.
   * @private
   */
  function collapseDropdowns(sk) {
    sk.root.querySelectorAll('.dropdown').forEach((d) => d.classList.remove('dropdown-expanded'));
  }

  /**
   * Creates a dropdown as a container for other plugins.
   * @private
   * @param {Sidekick} sk The sidekick
   * @param {pluginConfig} config The plugin configuration
   * @returns {HTMLElement} The dropdown
   */
  function createDropdown(sk, config) {
    const { id = '', button = {}, lstnrs = {} } = config;
    const dropdown = createTag({
      tag: 'div',
      attrs: {
        class: `${id} plugin dropdown`,
      },
    });
    const toggle = appendTag(dropdown, {
      ...button,
      tag: 'button',
      attrs: {
        ...(button.attrs || {}),
        class: 'dropdown-toggle',
        'aria-expanded': false,
      },
      lstnrs: {
        click: (evt) => {
          if (dropdown.classList.contains('dropdown-expanded')) {
            dropdown.classList.remove('dropdown-expanded');
            evt.target.setAttribute('aria-expanded', false);
            return;
          }

          collapseDropdowns(sk);
          dropdown.classList.add('dropdown-expanded');
          evt.target.setAttribute('aria-expanded', true);
          const {
            lastElementChild: container,
          } = dropdown;
          container.style.marginLeft = 'initial';
          const { left: cLeft, width: cWidth } = container.getBoundingClientRect();
          if (cLeft + cWidth > window.innerWidth) {
            const { width: tWidth } = toggle.getBoundingClientRect();
            container.style.marginLeft = `-${cWidth - tWidth}px`;
          }
          evt.stopPropagation();
          if (lstnrs.click) {
            lstnrs.click(evt);
          }
        },
      },
    });
    if (Array.isArray(button.elements)) {
      button.elements.forEach((elem) => appendTag(toggle, elem));
    }

    appendTag(dropdown, {
      tag: 'div',
      attrs: {
        class: 'dropdown-container',
      },
    });
    return dropdown;
  }

  /**
   * Aligns an element with another and keeps it there.
   * @private
   * @param {Sidekick} sk The sidekick
   * @param {string} elemSelector The CSS selector for the element to align
   * @param {string} targetSelector The CSS selector for the target element
   */
  function stickTo(sk, elemSelector, targetSelector) {
    // if no selector, stick to sidekick root
    if (!targetSelector) targetSelector = `.${sk.root.className}`;
    const listener = () => {
      const elem = sk.shadowRoot.querySelector(elemSelector);
      const target = sk.shadowRoot.querySelector(targetSelector);
      if (elem && target) {
        const elemRect = elem.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        // define alignment
        const alignments = [
          'bottom-center',
          'bottom-left',
          'bottom-right',
        ];
        let align = target === sk.root ? alignments[0] : alignments[1];
        if (targetRect.left + elemRect.width >= window.innerWidth) {
          [, , align] = alignments;
        }
        alignments.forEach((a) => elem.classList.remove(a));
        elem.classList.add(align);
        elem.style.top = `${Math.round(targetRect.bottom)}px`;
        switch (align) {
          case alignments[0]:
            elem.style.left = '';
            break;
          case alignments[1]:
            elem.style.left = `${Math.round(targetRect.left) + (targetRect.width / 2) - 45}px`;
            break;
          case alignments[2]:
          default:
            elem.style.left = `${Math.round(targetRect.left) + (targetRect.width / 2)
              - (elemRect.width - 45)}px`;
        }
      } else {
        window.removeEventListener('resize', listener);
      }
    };
    listener();
    window.addEventListener('resize', listener);
  }

  /**
   * Returns the share URL for the sidekick bookmarklet.
   * @private
   * @param {Object} config The sidekick configuration
   * @param {string} from The URL of the referrer page
   * @returns {string} The share URL
   */
  function getShareUrl(config, from) {
    const shareUrl = new URL('https://www.hlx.live/tools/sidekick/');
    shareUrl.search = new URLSearchParams([
      ['project', config.project || ''],
      ['from', from || ''],
      ['giturl', `https://github.com/${config.owner}/${config.repo}/tree/${config.ref}`],
    ]).toString();
    return shareUrl.toString();
  }

  /**
   * Creates a share URL for this sidekick and either invokes the
   * Web Share API or copies it to the clipboard.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function shareSidekick(sk) {
    const { config } = sk;
    const shareUrl = getShareUrl(config);
    if (navigator.share) {
      navigator.share({
        text: i18n(sk, 'config_shareurl_share_title').replace('$1', config.project),
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      sk.showModal(i18n(sk, 'config_shareurl_copied').replace('$1', config.project));
    }
    // log telemetry
    sampleRUM('sidekick:share', {
      source: sk.location.href,
      target: shareUrl,
    });
  }

  /**
   * Fires an event with the given name.
   * @private
   * @param {Sidekick} sk The sidekick
   * @param {string} name The name of the event
   * @param {Object} data The data to pass to event listeners (optional)
   */
  function fireEvent(sk, name, data) {
    try {
      sk.dispatchEvent(new CustomEvent(name, {
        detail: {
          data: data || {
            config: JSON.parse(JSON.stringify(sk.config)),
            location: sk.location,
            status: sk.status,
          },
        },
      }));
      const userEvents = [
        'shown',
        'hidden',
        'updated',
        'published',
        'unpublished',
        'deleted',
        'envswitched',
        'page-info',
        'user',
        'loggedin',
        'loggedout',
        'helpnext',
        'helpdismissed',
        'helpacknowlegded',
        'helpoptedout',
      ];
      if (name.startsWith('custom:') || userEvents.includes(name)) {
        // log telemetry
        sampleRUM(`sidekick:${name}`, {
          source: data?.sourceUrl || sk.location.href,
          target: data?.targetUrl || sk.status.webPath,
        });
      }
    } catch (e) {
      console.warn('failed to fire event', name, e);
    }
  }

  /**
   * Check for issues.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  async function checkForIssues() {
    // nothing to check for atm
  }

  /**
   * Compares source and preview last modified dates.
   * @private
   * @param {Sidekick} sidekick The sidekick
   */
  async function checkLastModified(sidekick) {
    const { status } = sidekick;
    if ((status.status && status.status !== 200) || (status.edit && status.edit.status === 404)) {
      return;
    }
    const editLastMod = (status.edit && status.edit.lastModified) || null;
    const previewLastMod = (status.preview && status.preview.lastModified) || null;
    const liveLastMod = (status.live && status.live.lastModified) || null;
    if (sidekick.get('edit-preview')
      && editLastMod && (!previewLastMod || new Date(editLastMod) > new Date(previewLastMod))) {
      sidekick.get('edit-preview').classList.add('update');
    }
    if (sidekick.get('reload')
      && editLastMod && (!previewLastMod || new Date(editLastMod) > new Date(previewLastMod))) {
      sidekick.get('reload').classList.add('update');
    }
    if (sidekick.get('publish')
      && (!liveLastMod || (previewLastMod && new Date(liveLastMod) < new Date(previewLastMod)))) {
      sidekick.get('publish').classList.add('update');
    }
  }

  /**
   * Determines whether to open a new tab or reuse the existing window.
   * @private
   * @param {Event} evt The event
   * @returns <pre>true</pre> if a new tab should be opened, else <pre>false</pre>
   */
  function newTab(evt) {
    return evt.metaKey || evt.shiftKey || evt.which === 2;
  }

  async function updatePreview(sk, ranBefore) {
    sk.showWait();
    const { status } = sk;
    const resp = await sk.update();
    if (!resp.ok) {
      if (!ranBefore) {
        // assume document has been renamed, re-fetch status and try again
        sk.addEventListener('statusfetched', async () => {
          updatePreview(sk, true);
        }, { once: true });
        sk.fetchStatus();
      } else if (status.webPath.startsWith('/.helix/') && resp.error) {
        // show detail message only in config update mode
        sk.showModal({
          message: `${i18n(sk, 'error_config_failure')}${resp.error}`,
          sticky: true,
          level: 0,
        });
      } else {
        console.error(resp);
        sk.showModal({
          message: i18n(sk, 'error_preview_failure'),
          sticky: true,
          level: 0,
        });
      }
      return;
    }
    // handle special case /.helix/*
    if (status.webPath.startsWith('/.helix/')) {
      sk.showModal({
        message: i18n(sk, 'preview_config_success'),
      });
      return;
    }
    sk.hideModal();
    sk.switchEnv('preview');
  }

  /**
   * Adds the edit plugin to the sidekick.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function addEditPlugin(sk) {
    sk.add({
      id: 'edit',
      condition: (sidekick) => !sidekick.isEditor() && sidekick.isProject(),
      button: {
        text: i18n(sk, 'edit'),
        action: async () => {
          const { config, status } = sk;
          const editUrl = status.edit && status.edit.url;
          window.open(
            editUrl,
            `hlx-sk-edit--${config.owner}/${config.repo}/${config.ref}${status.webPath}`,
          );
        },
        isEnabled: (sidekick) => sidekick.status.edit && sidekick.status.edit.url,
      },
    });
  }

  /**
   * Adds the following environment plugins to the sidekick:
   * Preview, Live and Production
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function addEnvPlugins(sk) {
    // add env container
    let switchViewText = i18n(sk, 'switch_view');
    if (sk.isDev()) switchViewText = i18n(sk, 'development');
    if (sk.isInner()) switchViewText = i18n(sk, 'preview');
    if (sk.isOuter()) switchViewText = i18n(sk, 'live');
    if (sk.isProd()) switchViewText = i18n(sk, 'production');
    sk.add({
      id: 'env',
      feature: true,
      button: {
        text: switchViewText,
        isDropdown: true,
      },
    });

    // dev
    sk.add({
      id: 'dev',
      container: 'env',
      condition: (sidekick) => sidekick.isEditor() || sidekick.isProject(),
      button: {
        text: i18n(sk, 'development'),
        action: async (evt) => {
          if (evt.target.classList.contains('pressed')) {
            return;
          }
          sk.switchEnv('dev', newTab(evt));
        },
        isPressed: (sidekick) => sidekick.isDev(),
        isEnabled: (sidekick) => sidekick.isDev()
          || (sidekick.status.preview && sidekick.status.preview.lastModified),
      },
      advanced: (sidekick) => !sidekick.isDev(),
    });

    // preview
    sk.add({
      id: 'preview',
      container: 'env',
      condition: (sidekick) => sidekick.isEditor() || sidekick.isProject(),
      button: {
        text: i18n(sk, 'preview'),
        action: async (evt) => {
          if (evt.target.classList.contains('pressed')) {
            return;
          }
          sk.switchEnv('preview', newTab(evt));
        },
        isPressed: (sidekick) => sidekick.isInner(),
        isEnabled: (sidekick) => sidekick.isInner()
          || (sidekick.status.preview && sidekick.status.preview.lastModified),
      },
    });

    // live
    sk.add({
      id: 'live',
      container: 'env',
      condition: (sidekick) => sidekick.config.outerHost
        && (sidekick.isEditor() || sidekick.isProject()),
      button: {
        text: i18n(sk, 'live'),
        action: async (evt) => {
          if (evt.target.classList.contains('pressed')) {
            return;
          }
          sk.switchEnv('live', newTab(evt));
        },
        isPressed: (sidekick) => sidekick.isOuter(),
        isEnabled: (sidekick) => sidekick.isOuter()
          || (sidekick.status.live && sidekick.status.live.lastModified),
      },
      advanced: (sidekick) => !!sidekick.config.host,
    });

    // production
    sk.add({
      id: 'prod',
      container: 'env',
      condition: (sidekick) => sidekick.config.host
        && sidekick.config.host !== sidekick.config.outerHost
        && (sidekick.isEditor() || sidekick.isProject()),
      button: {
        text: i18n(sk, 'production'),
        action: async (evt) => {
          if (evt.target.classList.contains('pressed')) {
            return;
          }
          sk.switchEnv('prod', newTab(evt));
        },
        isPressed: (sidekick) => sidekick.isProd(),
        isEnabled: (sidekick) => sidekick.isProd()
          || (sidekick.status.live && sidekick.status.live.lastModified),
      },
    });

    // keep empty env switcher hidden
    if (sk.root.querySelectorAll(':scope .feature-container .env .dropdown-container > div').length === 0) {
      sk.root.querySelector(':scope .feature-container .env').classList.add('hlx-sk-hidden');
    }
  }

  /**
   * Adds the preview plugin to the sidekick.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function addPreviewPlugin(sk) {
    sk.add({
      id: 'edit-preview',
      condition: (sidekick) => sidekick.isEditor(),
      button: {
        text: i18n(sk, 'preview'),
        action: async () => {
          const { status, location } = sk;
          if (status.edit && status.edit.sourceLocation
            && status.edit.sourceLocation.startsWith('onedrive:')
            && !location.pathname.startsWith('/:x:/')) {
            // show ctrl/cmd + s hint on onedrive docs
            const mac = navigator.platform.toLowerCase().includes('mac') ? '_mac' : '';
            sk.showModal(i18n(sk, `preview_onedrive${mac}`));
          } else if (status.edit.sourceLocation?.startsWith('gdrive:')) {
            const { contentType } = status.edit;

            const isGoogleDocMime = contentType === 'application/vnd.google-apps.document';
            const isGoogleSheetMime = contentType === 'application/vnd.google-apps.spreadsheet';
            const neitherGdocOrGSheet = !isGoogleDocMime && !isGoogleSheetMime;

            if (neitherGdocOrGSheet) {
              const isMsDocMime = contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              const isMsExcelSheet = contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
              let errorKey = 'error_preview_not_gdoc_generic'; // show generic message by default
              if (isMsDocMime) {
                errorKey = 'error_preview_not_gdoc_ms_word';
              } else if (isMsExcelSheet) {
                errorKey = 'error_preview_not_gsheet_ms_excel';
              }
              sk.showModal({
                message: i18n(sk, errorKey),
                sticky: true,
                level: 0,
              });

              return;
            }
          }
          if (location.pathname.startsWith('/:x:/')) {
            // refresh excel with preview param
            window.sessionStorage.setItem('hlx-sk-preview', JSON.stringify({
              previewPath: status.webPath,
              previewTimestamp: Date.now(),
            }));
            window.location.reload();
          } else {
            updatePreview(sk);
          }
        },
        isEnabled: (sidekick) => sidekick.isAuthorized('preview', 'write')
          && sidekick.status.webPath,
      },
      callback: () => {
        const { previewPath, previewTimestamp } = JSON
          .parse(window.sessionStorage.getItem('hlx-sk-preview') || '{}');
        window.sessionStorage.removeItem('hlx-sk-preview');
        if (previewTimestamp < Date.now() + 60000) {
          // preview request detected in session storage, wait for status...
          sk.showWait();
          sk.addEventListener('statusfetched', async () => {
            const { status } = sk;
            if (status.webPath === previewPath && sk.isAuthorized('preview', 'write')) {
              // update preview and remove preview request from session storage
              updatePreview(sk);
            } else {
              sk.hideModal();
            }
          }, { once: true });
        }
      },
    });
  }

  /**
   * Adds the reload plugin to the sidekick.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function addReloadPlugin(sk) {
    sk.add({
      id: 'reload',
      condition: (s) => s.config.innerHost && (s.isInner() || s.isDev()),
      button: {
        text: i18n(sk, 'reload'),
        action: async (evt) => {
          sk.showWait();
          try {
            const resp = await sk.update();
            if (!resp.ok && resp.status >= 400) {
              console.error(resp);
              throw new Error(resp);
            }
            console.log(`reloading ${window.location.href}`);
            if (newTab(evt)) {
              window.open(window.location.href);
              sk.hideModal();
            } else {
              window.location.reload();
            }
          } catch (e) {
            sk.showModal({
              message: i18n(sk, 'reload_failure'),
              sticky: true,
              level: 0,
            });
          }
        },
        isEnabled: (s) => s.isAuthorized('preview', 'write')
          && s.status.edit && s.status.edit.url, // enable only if edit url exists
      },
    });
  }

  /**
   * Adds the delete plugin to the sidekick.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function addDeletePlugin(sk) {
    sk.add({
      id: 'delete',
      condition: (sidekick) => sidekick.isAuthorized('preview', 'delete') && sidekick.isProject()
        && (!sidekick.status.edit || !sidekick.status.edit.url) // show only if no edit url and
        && (sidekick.status.preview && sidekick.status.preview.status !== 404) // preview exists
        && !RESTRICTED_PATHS.includes(sidekick.location.pathname),
      button: {
        text: i18n(sk, 'delete'),
        action: async () => {
          const { location, status } = sk;
          // double check
          if (status.edit && status.edit.url) {
            window.alert(sk.isContent()
              ? 'This page still has a source document and cannot be deleted.'
              : 'This file still exists in the repository and cannot be deleted.');
            return;
          }
          // have user confirm deletion
          if (window.confirm(`${sk.isContent()
            ? 'This page no longer has a source document'
            : 'This file no longer exists in the repository'}, deleting it cannot be undone!\n\nAre you sure you want to delete it?`)) {
            try {
              const resp = await sk.delete();
              if (!resp.ok && resp.status >= 400) {
                console.error(resp);
                throw new Error(resp);
              }
              console.log(`redirecting to ${location.origin}/`);
              window.location.href = `${location.origin}/`;
            } catch (e) {
              sk.showModal({
                message: i18n(sk, 'delete_failure'),
                sticky: true,
                level: 0,
              });
            }
          }
        },
      },
    });
  }

  /**
   * Adds the publish plugin to the sidekick.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function addPublishPlugin(sk) {
    sk.add({
      id: 'publish',
      condition: (sidekick) => sidekick.isProject() && sk.isContent(),
      button: {
        text: i18n(sk, 'publish'),
        action: async (evt) => {
          const { config, location } = sk;
          const path = location.pathname;
          sk.showWait();
          let urls = [path];
          // purge dependencies
          if (Array.isArray(window.hlx.dependencies)) {
            urls = urls.concat(window.hlx.dependencies);
          }
          const results = await Promise.all(urls.map((url) => sk.publish(url)));
          if (results.every((res) => res && res.ok)) {
            // fetch and redirect to production
            const redirectHost = config.host || config.outerHost;
            const prodURL = `https://${redirectHost}${path}`;
            console.log(`redirecting to ${prodURL}`);
            if (newTab(evt)) {
              window.open(prodURL);
              sk.hideModal();
            } else {
              window.location.href = prodURL;
            }
          } else {
            console.error(results);
            sk.showModal({
              message: i18n(sk, 'publish_failure'),
              sticky: true,
              level: 0,
            });
          }
        },
        isEnabled: (sidekick) => sidekick.isAuthorized('live', 'write') && sidekick.status.edit
          && sidekick.status.edit.url, // enable only if edit url exists
      },
    });
  }

  /**
   * Adds the unpublish plugin to the sidekick.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function addUnpublishPlugin(sk) {
    sk.add({
      id: 'unpublish',
      condition: (sidekick) => sidekick.isAuthorized('live', 'delete') && sidekick.isProject()
        && (!sidekick.status.edit || !sidekick.status.edit.url) // show only if no edit url and
        && sidekick.status.live && sidekick.status.live.lastModified // published
        && sk.isContent() && !RESTRICTED_PATHS.includes(sidekick.location.pathname),
      button: {
        text: i18n(sk, 'unpublish'),
        action: async () => {
          const { status } = sk;
          // double check
          if (status.edit && status.edit.url) {
            window.alert('This page has a source document and cannot be unpublished.');
            return;
          }
          // have user confirm unpublishing
          if (window.confirm('This page no longer has a source document, unpublishing it cannot be undone!\n\nAre you sure you want to unpublish it?')) {
            const path = status.webPath;
            try {
              const resp = await sk.unpublish();
              if (!resp.ok && resp.status >= 400) {
                console.error(resp);
                throw new Error(resp);
              }
              if (!sk.isInner()) {
                const newPath = `${path.substring(0, path.lastIndexOf('/'))}/`;
                console.log(`redirecting to ${newPath}`);
                window.location.href = newPath;
              }
            } catch (e) {
              sk.showModal({
                message: i18n(sk, 'unpublish_failure'),
                sticky: true,
                level: 0,
              });
            }
          }
        },
      },
    });
  }

  /**
   * Adds the bulk plugins to the sidekick.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function addBulkPlugins(sk) {
    let bulkSelection = [];

    const isSharePoint = (location) => /\w+\.sharepoint.com$/.test(location.host)
      && location.pathname.endsWith('/Forms/AllItems.aspx');

    const toWebPath = (folder, item) => {
      const { path, type } = item;
      const nameParts = path.split('.');
      let [file, ext] = nameParts;
      if (isSharePoint(sk.location) && ext === 'docx') {
        // omit docx extension on sharepoint
        ext = '';
      }
      if (type === 'xlsx' || type.includes('vnd.google-apps.spreadsheet')) {
        // use json extension for spreadsheets
        ext = 'json';
      }
      file = file
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      return `${folder}${folder.endsWith('/') ? '' : '/'}${file}${ext ? `.${ext}` : ''}`;
    };

    const getBulkSelection = () => {
      const { location } = sk;
      if (isSharePoint(location)) {
        const isGrid = document.querySelector('div[class~="ms-TilesList"]');
        return [...document.querySelectorAll('#appRoot [role="presentation"] div[aria-selected="true"]')]
          .filter((row) => !row.querySelector('img').getAttribute('src').includes('/foldericons/')
            && !row.querySelector('img').getAttribute('src').endsWith('folder.svg'))
          .map((row) => ({
            type: isGrid
              ? row.querySelector(':scope i[aria-label]')?.getAttribute('aria-label').trim()
              : new URL(row.querySelector('img').getAttribute('src'), sk.location.href).pathname.split('/').slice(-1)[0].split('.')[0],
            path: isGrid
              ? row.querySelector('div[data-automationid="name"]').textContent.trim()
              : row.querySelector('button')?.textContent.trim(),
          }));
      } else {
        // gdrive
        return [...document.querySelectorAll('#drive_main_page [role="row"][aria-selected="true"]')]
          .filter((row) => row.querySelector(':scope img'))
          .map((row) => ({
            type: new URL(row.querySelector('div > img').getAttribute('src'), sk.location.href).pathname.split('/').slice(-2).join('/'),
            path: row.querySelector(':scope > div > div:nth-of-type(2)').textContent.trim() // list layout
              || row.querySelector(':scope > div > div > div:nth-of-type(4)').textContent.trim(), // grid layout
          }));
      }
    };

    const updateBulkInfo = () => {
      if (!sk.isAdmin()) {
        return;
      }
      const sel = getBulkSelection(sk);
      bulkSelection = sel;
      // update info
      const label = sk.root.querySelector('#hlx-sk-bulk-info');
      if (sel.length === 0) {
        label.textContent = i18n(sk, 'bulk_selection_empty');
      } else if (sel.length === 1) {
        label.textContent = i18n(sk, 'bulk_selection_single');
      } else {
        label.textContent = i18n(sk, 'bulk_selection_multiple').replace('$1', sel.length);
      }
      // show/hide bulk buttons
      const filesSelected = sel.length > 0;
      if (window.location.href !== sk.location.href) {
        // refresh location
        sk.location = getLocation();
      }
      ['preview', 'publish', 'copy-urls'].forEach((action) => {
        const pluginId = `bulk-${action}`;
        const plugin = sk.get(pluginId);
        const customShowPlugin = (sk.customPlugins[action]?.condition || (() => true))(sk);
        plugin.classList[filesSelected && customShowPlugin ? 'remove' : 'add']('hlx-sk-hidden');
      });
      // update copy url button texts based on selection size
      ['', 'preview', 'live', 'prod'].forEach((env) => {
        const text = i18n(sk, `copy_${env}${env ? '_' : ''}url${sel.length === 1 ? '' : 's'}`);
        const button = sk.get(`bulk-copy-${env}${env ? '-' : ''}urls`)?.querySelector('button');
        if (button) {
          button.textContent = text;
          button.title = text;
        }
      });
    };

    const getBulkText = ([num, total], type, action, mod) => {
      let i18nKey = `bulk_${type}`;
      if (num === 0) {
        i18nKey = `${i18nKey}_empty`;
      } else {
        i18nKey = `${i18nKey}_${action}_${(total || num) === 1 ? 'single' : 'multiple'}${mod ? `_${mod}` : ''}`;
      }
      return i18n(sk, i18nKey)
        .replace('$1', num)
        .replace('$2', total);
    };

    const isChangedUrl = () => {
      const $test = document.getElementById('sidekick_test_location');
      if ($test) {
        return $test.value !== sk.location.href;
      }
      return window.location.href !== sk.location.href;
    };

    const doBulkOperation = async (operation, method, concurrency, host) => {
      const { config, status } = sk;
      const sel = bulkSelection.map((item) => toWebPath(status.webPath, item));
      const results = [];
      const total = sel.length;
      const { processQueue } = await import(`${config.scriptRoot}/lib/process-queue.js`);
      await processQueue(sel, async (file) => {
        results.push(await sk[method](file));
        if (total > 1) {
          sk.showModal(getBulkText([results.length, total], 'progress', operation), true);
        }
      }, concurrency);
      const lines = [];
      const ok = results.filter((res) => res.ok);
      if (ok.length > 0) {
        lines.push(getBulkText([ok.length], 'result', operation, 'success'));
        lines.push(createTag({
          tag: 'button',
          text: i18n(sk, ok.length === 1 ? 'copy_url' : 'copy_urls'),
          lstnrs: {
            click: (evt) => {
              evt.stopPropagation();
              navigator.clipboard.writeText(ok.map((item) => `https://${host}${item.path}`)
                .join('\n'));
              sk.hideModal();
            },
          },
        }));
      }
      const failed = results.filter((res) => !res.ok);
      if (failed.length > 0) {
        const failureText = getBulkText([failed.length], 'result', operation, 'failure');
        lines.push(failureText);
        lines.push(...failed.map((item) => {
          if (item.error.endsWith('docx with google not supported.')) {
            item.error = getBulkText([1], 'result', operation, 'error_no_docx');
          }
          if (item.error.endsWith('xlsx with google not supported.')) {
            item.error = getBulkText([1], 'result', operation, 'error_no_xlsx');
          }
          if (item.error.includes('source does not exist')) {
            item.error = getBulkText([1], 'result', operation, 'error_no_source');
          }
          return `${item.path.split('/').pop()}: ${item.error}`;
        }));
      }
      lines.push(createTag({
        tag: 'button',
        text: i18n(sk, 'close'),
      }));
      let level = 2;
      if (failed.length > 0) {
        level = 1;
        if (ok.length === 0) {
          level = 0;
        }
      }
      sk.showModal(
        lines,
        true,
        level,
      );
    };

    const doBulkCopyUrls = async (hostProperty) => {
      const { config, status } = sk;
      const urls = bulkSelection.map((item) => `https://${config[hostProperty]}${toWebPath(status.webPath, item)}`);
      navigator.clipboard.writeText(urls.join('\n'));
      sk.showModal(i18n(sk, `copied_url${urls.length !== 1 ? 's' : ''}`));
    };

    // bulk info
    sk.add({
      id: 'bulk-info',
      condition: (sidekick) => sidekick.isAdmin(),
      elements: [{
        tag: 'span',
        attrs: {
          id: 'hlx-sk-bulk-info',
          class: 'hlx-sk-label',
        },
      }],
      callback: () => {
        window.setInterval(() => {
          updateBulkInfo();
        }, 500);
      },
    });

    // bulk preview
    sk.add({
      id: 'bulk-preview',
      condition: (sidekick) => sidekick.isAdmin(),
      button: {
        text: i18n(sk, 'preview'),
        action: async () => {
          const confirmText = getBulkText([bulkSelection.length], 'confirm', 'preview');
          if (bulkSelection.length === 0) {
            sk.showModal(confirmText);
          } else if (window.confirm(confirmText)) {
            sk.showWait();
            if (isChangedUrl()) {
              // url changed, refetch status
              sk.addEventListener('statusfetched', () => {
                doBulkOperation('preview', 'update', 2, sk.config.innerHost);
              }, { once: true });
              sk.fetchStatus(true);
            } else {
              doBulkOperation('preview', 'update', 2, sk.config.innerHost);
            }
          }
        },
        isEnabled: (s) => s.isAuthorized('preview', 'write') && s.status.webPath,
      },
    });

    // bulk publish
    sk.add({
      id: 'bulk-publish',
      condition: (sidekick) => sidekick.isAdmin(),
      button: {
        text: i18n(sk, 'publish'),
        action: async () => {
          const confirmText = getBulkText([bulkSelection.length], 'confirm', 'publish');
          if (bulkSelection.length === 0) {
            sk.showModal(confirmText);
          } else if (window.confirm(confirmText)) {
            sk.showWait();
            if (isChangedUrl()) {
              // url changed, refetch status
              sk.addEventListener('statusfetched', () => {
                doBulkOperation('publish', 'publish', 40, sk.config.host || sk.config.outerHost);
              }, { once: true });
              sk.fetchStatus(true);
            } else {
              doBulkOperation('publish', 'publish', 40, sk.config.host || sk.config.outerHost);
            }
          }
        },
        isEnabled: (s) => s.isAuthorized('live', 'write') && s.status.webPath,
      },
    });

    // bulk copy urls
    sk.add({
      id: 'bulk-copy-urls',
      condition: (sidekick) => sidekick.isAdmin(),
      button: {
        isDropdown: true,
      },
    });
    [{
      env: 'preview',
      hostProperty: 'innerHost',
      condition: (sidekick) => sidekick.isAdmin(),
    }, {
      env: 'live',
      hostProperty: 'outerHost',
      condition: (sidekick) => sidekick.isAdmin(),
      advanced: (sidekick) => !!sidekick.config.host,
    }, {
      env: 'prod',
      hostProperty: 'host',
      condition: (sidekick) => sidekick.isAdmin() && sidekick.config.host,
    }].forEach(({
      env,
      hostProperty,
      condition,
      advanced = () => false,
    }) => {
      sk.add({
        id: `bulk-copy-${env}-urls`,
        container: 'bulk-copy-urls',
        condition,
        advanced,
        button: {
          text: i18n(sk, `copy_${env}_url`),
          action: async () => {
            const emptyText = getBulkText([bulkSelection.length], 'confirm');
            if (bulkSelection.length === 0) {
              sk.showModal(emptyText);
            } else {
              sk.showWait();
              if (isChangedUrl()) {
                // url changed, refetch status
                sk.addEventListener('statusfetched', () => {
                  doBulkCopyUrls(hostProperty);
                }, { once: true });
                sk.fetchStatus(true);
              } else {
                doBulkCopyUrls(hostProperty);
              }
            }
          },
        },
      });
    });

    updateBulkInfo();
  }

  /**
   * Adds custom plugins to the sidekick.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function addCustomPlugins(sk) {
    const { location, config: { plugins, innerHost } = {} } = sk;
    const language = navigator.language.split('-')[0];
    if (plugins && Array.isArray(plugins)) {
      plugins.forEach((cfg, i) => {
        if (typeof (cfg.button && cfg.button.action) === 'function'
          || typeof cfg.condition === 'function') {
          // add legacy plugin
          sk.add(cfg);
        } else {
          const {
            id,
            title,
            titleI18n,
            url,
            passConfig,
            passReferrer,
            isPalette,
            paletteRect,
            event: eventName,
            environments,
            excludePaths,
            includePaths,
            containerId,
            isContainer,
          } = cfg;
          const condition = (s) => {
            let excluded = false;
            const pathSearchHash = s.location.href.replace(s.location.origin, '');
            if (excludePaths && Array.isArray(excludePaths)
              && excludePaths.some((glob) => globToRegExp(glob).test(pathSearchHash))) {
              excluded = true;
            }
            if (includePaths && Array.isArray(includePaths)
              && includePaths.some((glob) => globToRegExp(glob).test(pathSearchHash))) {
              excluded = false;
            }
            if (excluded) {
              // excluding plugin
              return false;
            }
            if (!environments || environments.includes('any')) {
              return true;
            }
            const envChecks = {
              dev: s.isDev,
              edit: s.isEditor,
              preview: s.isInner,
              live: s.isOuter,
              prod: s.isProd,
            };
            return environments.some((env) => envChecks[env] && envChecks[env].call(s));
          };
          // assemble plugin config
          const plugin = {
            custom: true,
            id: id || `custom-plugin-${i}`,
            condition,
            button: {
              text: (titleI18n && titleI18n[language]) || title || '',
              action: () => {
                if (url) {
                  const target = url.startsWith('/') ? new URL(url, `https://${innerHost}/`) : new URL(url);
                  if (passConfig) {
                    target.searchParams.append('ref', sk.config.ref);
                    target.searchParams.append('repo', sk.config.repo);
                    target.searchParams.append('owner', sk.config.owner);
                    if (sk.config.host) target.searchParams.append('host', sk.config.host);
                    if (sk.config.project) target.searchParams.append('project', sk.config.project);
                  }
                  if (passReferrer) {
                    target.searchParams.append('referrer', location.href);
                  }
                  if (isPalette) {
                    let palette = sk.shadowRoot.getElementById(`hlx-sk-palette-${id}`);
                    const togglePalette = () => {
                      const button = sk.get(id).querySelector('button');
                      if (!palette.classList.contains('hlx-sk-hidden')) {
                        palette.classList.add('hlx-sk-hidden');
                        button.classList.remove('pressed');
                      } else {
                        palette.classList.remove('hlx-sk-hidden');
                        button.classList.add('pressed');
                        // log telemetry
                        sampleRUM('sidekick:paletteclosed', {
                          source: sk.location.href,
                          target: sk.status.webPath,
                        });
                      }
                    };
                    if (!palette) {
                      // draw palette
                      palette = appendTag(sk.root, {
                        tag: 'div',
                        attrs: {
                          id: `hlx-sk-palette-${id}`,
                          class: 'hlx-sk-palette hlx-sk-hidden',
                          style: paletteRect || '',
                        },
                      });
                      const titleBar = appendTag(palette, {
                        tag: 'div',
                        text: (titleI18n && titleI18n[language]) || title,
                        attrs: {
                          class: 'palette-title',
                        },
                      });
                      appendTag(titleBar, {
                        tag: 'button',
                        attrs: {
                          title: i18n(sk, 'close'),
                          class: 'close',
                        },
                        lstnrs: {
                          click: togglePalette,
                        },
                      });
                      const container = appendTag(palette, {
                        tag: 'div',
                        attrs: {
                          class: 'palette-content',
                        },
                      });
                      appendTag(container, {
                        tag: 'iframe',
                        attrs: {
                          src: target,
                          allow: 'clipboard-write *',
                        },
                      });
                    }
                    togglePalette();
                  } else {
                    // open url in new window
                    window.open(target, `hlx-sk-${id || `custom-plugin-${i}`}`);
                  }
                } else if (eventName) {
                  // fire custom event
                  fireEvent(sk, `custom:${eventName}`);
                }
              },
              isDropdown: isContainer,
            },
            container: containerId,
          };
          sk.customPlugins[plugin.id] = plugin;
          // check and remove existing plugin
          const existingPlugin = sk.plugins[plugin.id];
          if (existingPlugin) {
            if (sk.get(plugin.id) && !condition(sk)) {
              sk.remove(id);
            }
          } else {
            // add custom plugin
            sk.add(plugin);
          }
        }
      });
    }
  }

  async function checkProfileStatus(sk, status) {
    const url = getAdminUrl(sk.config, 'profile');
    const opts = getAdminFetchOptions();
    return fetch(url, opts)
      .then((res) => res.json())
      .then((json) => (json.status === status))
      .catch(() => false);
  }

  /**
   * Logs the user in.
   * @private
   * @param {Sidekick} sk The sidekick
   * @param {boolean} selectAccount <code>true</code> to allow user to select account (optional)
   */
  function login(sk, selectAccount) {
    sk.showWait();
    const loginUrl = getAdminUrl(sk.config, 'login');
    const extensionId = window.chrome?.runtime?.id;
    const authHeaderEnabled = extensionId && !window.navigator.vendor.includes('Apple');
    if (authHeaderEnabled) {
      loginUrl.searchParams.set('extensionId', extensionId);
    } else {
      loginUrl.searchParams.set(
        'loginRedirect',
        'https://www.hlx.live/tools/sidekick/login-success',
      );
    }
    if (selectAccount) {
      loginUrl.searchParams.set('selectAccount', true);
    }
    const loginWindow = window.open(loginUrl.toString());

    let attempts = 0;

    async function checkLoggedIn() {
      if (loginWindow.closed) {
        const { config, status, location } = sk;
        attempts += 1;
        // try 5 times after login window has been closed
        if (await checkProfileStatus(sk, 200)) {
          // logged in, stop checking
          delete status.status;
          sk.addEventListener('statusfetched', () => sk.hideModal(), { once: true });
          sk.config = await initConfig(config, location);
          sk.config.authToken = window.hlx.sidekickConfig.authToken;
          addCustomPlugins(sk);
          sk.fetchStatus();
          fireEvent(sk, 'loggedin');
          return;
        }
        if (attempts >= 5) {
          // give up after 5 attempts
          sk.showModal({
            message: i18n(sk, 'error_login_timeout'),
            sticky: true,
            level: 1,
          });
          return;
        }
      }
      // try again after 1s
      window.setTimeout(checkLoggedIn, 1000);
    }
    window.setTimeout(checkLoggedIn, 1000);
  }

  /**
   * Logs the user out.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function logout(sk) {
    sk.showWait();
    const logoutUrl = getAdminUrl(sk.config, 'logout');
    const extensionId = window.chrome?.runtime?.id;
    if (extensionId && !window.navigator.vendor.includes('Apple')) { // exclude safari
      logoutUrl.searchParams.set('extensionId', extensionId);
    } else {
      logoutUrl.searchParams.set(
        'logoutRedirect',
        'https://www.hlx.live/tools/sidekick/logout-success',
      );
    }
    const logoutWindow = window.open(logoutUrl.toString());

    let attempts = 0;

    async function checkLoggedOut() {
      if (logoutWindow.closed) {
        attempts += 1;
        // try 5 times after login window has been closed
        if (await checkProfileStatus(sk, 401)) {
          delete sk.status.profile;
          delete sk.config.authToken;
          sk.addEventListener('statusfetched', () => sk.hideModal(), { once: true });
          sk.fetchStatus();
          fireEvent(sk, 'loggedout');
          return;
        }
        if (attempts >= 5) {
          // give up after 5 attempts
          sk.showModal({
            message: i18n(sk, 'error_logout_error'),
            sticky: true,
            level: 1,
          });
          return;
        }
      }
      // try again after 1s
      window.setTimeout(checkLoggedOut, 1000);
    }
    window.setTimeout(checkLoggedOut, 1000);
  }

  /**
   * Checks if the user needs to log in or updates the user menu.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function checkUserState(sk) {
    const toggle = sk.userMenu.firstElementChild;
    toggle.removeAttribute('disabled');
    const updateUserPicture = async (picture, name) => {
      toggle.querySelector('.user-picture')?.remove();
      if (picture) {
        if (picture.startsWith('https://admin.hlx.page/')) {
          // fetch the image with auth token
          const resp = await fetch(picture, {
            headers: {
              'x-auth-token': sk.config.authToken,
            },
          });
          picture = resp.ok ? URL.createObjectURL(await resp.blob()) : null;
        }
        if (picture) {
          toggle.querySelector('.user-icon').classList.add('user-icon-hidden');
          appendTag(toggle, {
            tag: 'img',
            attrs: {
              class: 'user-picture',
              src: picture,
            },
          });
        }
        toggle.title = name;
      } else {
        toggle.querySelector('.user-picture')?.remove();
        toggle.querySelector('.user-icon').classList.remove('user-icon-hidden');
        toggle.title = i18n(sk, 'anonymous');
      }
    };
    const { profile } = sk.status;
    if (profile) {
      const { name, email, picture } = profile;
      updateUserPicture(picture, name);
      sk.remove('user-login');

      const info = sk.get('user-info');
      if (!info) {
        sk.add({
          // create user info box
          condition: (sidekick) => sidekick.isAuthenticated(),
          container: 'user',
          id: 'user-info',
          elements: [{
            tag: 'div',
            text: name,
            attrs: {
              class: 'profile-name',
            },
            lstnrs: {
              click: (e) => {
                e.stopPropagation();
              },
            },
          },
          {
            tag: 'div',
            text: email,
            attrs: {
              class: 'profile-email',
            },
            lstnrs: {
              click: (e) => {
                e.stopPropagation();
              },
            },
          }],
        });
      } else {
        // update user info box
        info.querySelector('.profile-name').textContent = name;
        info.querySelector('.profile-email').textContent = email;
      }
      // switch user
      sk.add({
        container: 'user',
        id: 'user-switch',
        condition: (sidekick) => sidekick.isAuthenticated(),
        button: {
          text: i18n(sk, 'user_switch'),
          action: () => login(sk, true),
        },
      });
      // logout
      sk.add({
        container: 'user',
        id: 'user-logout',
        condition: (sidekick) => sidekick.isAuthenticated(),
        button: {
          text: i18n(sk, 'user_logout'),
          action: () => logout(sk),
        },
      });
      // clean up on logout
      sk.addEventListener('loggedout', () => {
        sk.remove('user-info');
        sk.remove('user-switch');
        sk.remove('user-logout');
      });
    } else {
      updateUserPicture();
      // login
      sk.add({
        container: 'user',
        id: 'user-login',
        condition: (sidekick) => !sidekick.status.profile || !sidekick.isAuthenticated(),
        button: {
          text: i18n(sk, 'user_login'),
          action: () => login(sk),
        },
      });
      // clean up on login
      sk.addEventListener('loggedin', () => {
        sk.remove('user-login');
      });
      if (!sk.status.loggedOut && sk.status.status === 401 && !sk.isAuthenticated()) {
        // // encourage login
        toggle.click();
        toggle.nextElementSibling.classList.add('highlight');
      }
    }
  }

  function getTimeAgo(sk, dateParam) {
    if (!dateParam) {
      return i18n(sk, 'never');
    }
    const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);

    const today = new Date();
    const yesterday = new Date(today - 86400000); // 86400000 = ms in a day
    const seconds = Math.round((today - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const isToday = today.toDateString() === date.toDateString();
    const isYesterday = yesterday.toDateString() === date.toDateString();
    const isThisYear = today.getFullYear() === date.getFullYear();
    const timeToday = date.toLocaleTimeString([], {
      timeStyle: 'short',
    });
    const dateThisYear = date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
    const fullDate = date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });

    if (seconds < 30) {
      return i18n(sk, 'now');
    } else if (seconds < 120) {
      return i18n(sk, 'seconds_ago').replace('$1', seconds);
    } else if (minutes < 60) {
      return i18n(sk, 'minutes_ago').replace('$1', minutes);
    } else if (isToday) {
      return i18n(sk, 'today_at').replace('$1', timeToday);
    } else if (isYesterday) {
      return i18n(sk, 'yesterday_at').replace('$1', timeToday);
    } else if (isThisYear) {
      return dateThisYear;
    }

    return fullDate;
  }

  function updateModifiedDates(sk) {
    const infoPlugin = sk.get('info');
    if (!infoPlugin) {
      return;
    }

    const editEl = infoPlugin.querySelector('.edit-date');
    const previewEl = infoPlugin.querySelector('.preview-date');
    const publishEl = infoPlugin.querySelector('.publish-date');

    const { status } = sk;
    const editLastMod = (status.edit && status.edit.lastModified) || null;
    const previewLastMod = (status.preview && status.preview.lastModified) || null;
    const liveLastMod = (status.live && status.live.lastModified) || null;

    editEl.innerHTML = getTimeAgo(sk, editLastMod);
    previewEl.innerHTML = getTimeAgo(sk, previewLastMod);
    publishEl.innerHTML = getTimeAgo(sk, liveLastMod);
  }

  /**
   * Checks info menu.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function enableInfoBtn(sk) {
    if (!sk.isAdmin()) {
      const info = sk.get('page-info');
      if (!info) {
        const toggle = sk.get('info').firstElementChild;
        toggle.removeAttribute('disabled');

        sk.add({
          id: 'page-info',
          container: 'info',
          condition: () => true,
          elements: [
            {
              tag: 'div',
              attrs: {
                class: 'edit-date-container',
              },
            },
            {
              tag: 'div',
              attrs: {
                class: 'preview-date-container',
              },
            },
            {
              tag: 'div',
              attrs: {
                class: 'publish-date-container',
              },
            },
          ],
        });
      }
      sk.get('page-info').querySelector('.edit-date-container')
        .innerHTML = `<span>${i18n(sk, 'edit_date')}</span><span class="edit-date"></span>`;
      sk.get('page-info').querySelector('.preview-date-container')
        .innerHTML = `<span>${i18n(sk, 'preview_date')}</span><span class="preview-date"></span>`;
      sk.get('page-info').querySelector('.publish-date-container')
        .innerHTML = `<span>${i18n(sk, 'publish_date')}</span><span class="publish-date"></span>`;
      updateModifiedDates(sk);
    }
  }

  /**
   * Registers a plugin for re-evaluation if it should be shown or hidden,
   * and if its button should be enabled or disabled.
   * @private
   * @param {Sidekick} sk The sidekick
   * @param {Plugin} plugin The plugin configuration
   * @param {HTMLElement} $plugin The plugin
   * @returns {HTMLElement} The plugin or {@code null}
   */
  function registerPlugin(sk, plugin, $plugin) {
    // re-evaluate plugin when status fetched
    sk.addEventListener('statusfetched', () => {
      const { status } = sk;
      if (typeof plugin.condition === 'function') {
        if ($plugin && !plugin.condition(sk)) {
          // plugin exists but condition now false
          sk.remove(plugin.id);
        } else if (!$plugin && plugin.condition(sk)) {
          // plugin doesn't exist but condition now true
          sk.add(plugin);
        }
      }
      if ($plugin && plugin.custom && status.status === 401) {
        // custom plugin exists but user logged out now
        sk.remove(plugin.id);
      }
      const isEnabled = plugin.button && plugin.button.isEnabled;
      if (typeof isEnabled === 'function') {
        const $button = $plugin && $plugin.querySelector(':scope button');
        if ($button) {
          if (isEnabled(sk)) {
            // button enabled
            $plugin.querySelector(':scope button').removeAttribute('disabled');
          } else {
            // button disabled
            $plugin.querySelector(':scope button').setAttribute('disabled', '');
          }
        }
      }
    });
    if (typeof plugin.callback === 'function') {
      plugin.callback(sk, $plugin);
    }
    return $plugin || null;
  }

  /**
   * Checks existing plugins based on the status of the current resource.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function checkPlugins(sk) {
    window.setTimeout(() => {
      if (!sk.pluginContainer.querySelector(':scope div.plugin')) {
        // add empty text
        sk.pluginContainer.innerHTML = '';
        sk.pluginContainer.append(createTag({
          tag: 'span',
          text: i18n(sk, 'plugins_empty'),
          attrs: {
            class: 'hlx-sk-label',
          },
        }));
        sk.checkPushDownContent();
      }
    }, 5000);
    sk.checkPushDownContent();
  }

  /**
   * Pushes down the page content to make room for the sidekick.
   * @private
   * @see {@link SidekickConfig.noPushDown}
   * @param {Sidekick} sk The sidekick
   * @param {number} skHeight The current height of the sidekick (optional)
   */
  function pushDownContent(sk, skHeight) {
    const { config, location } = sk;
    if (config.pushDown
      && !sk.hasAttribute('pushdown')
      && !location.host.endsWith('.google.com')) {
      window.setTimeout(() => {
        if (!skHeight) {
          skHeight = parseFloat(window.getComputedStyle(sk.root).height, 10);
        }
        sk.setAttribute('pushdown', skHeight);
        config.pushDownElements.forEach((elem) => {
          // sidekick shown, push element down
          const currentMarginTop = parseInt(elem.style.marginTop, 10);
          let newMarginTop = skHeight;
          if (!Number.isNaN(currentMarginTop)) {
            // add element's non-zero top value
            newMarginTop += currentMarginTop;
          }
          elem.style.marginTop = `${newMarginTop}px`;
          if (elem.id === 'WebApplicationFrame') {
            // adjust height of office online frame
            elem.style.height = `calc(100% - ${newMarginTop}px)`;
          }
        });
      }, 100);
      window.addEventListener('resize', sk.checkPushDownContent);
    }
  }

  /**
   * Reverts the pushing down of page content.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function revertPushDownContent(sk) {
    const { config, location } = sk;
    if (config.pushDown
      && sk.hasAttribute('pushdown')
      && !location.host.endsWith('.google.com')) {
      sk.removeAttribute('pushdown');
      config.pushDownElements.forEach((elem) => {
        elem.style.marginTop = 'initial';
        if (elem.id === 'WebApplicationFrame') {
          // adjust height of office online frame
          elem.style.height = '';
        }
      });
      window.removeEventListener('resize', sk.checkPushDownContent);
    }
  }

  /**
   * Creates and/or returns a special view.
   * @private
   * @param {Sidekick} sk The sidekick
   * @param {boolean} create Create the special view if none exists
   * @returns {HTMLELement} The special view
   */
  function getSpecialView(sk, create) {
    const view = sk.shadowRoot.querySelector('.hlx-sk-special-view')
      || (create
        ? appendTag(sk.shadowRoot, {
          tag: 'div',
          attrs: { class: 'hlx-sk-special-view' },
        })
        : null);
    if (create && view) {
      const description = appendTag(view, {
        tag: 'div',
        text: i18n(sk, 'json_view_description'),
        attrs: { class: 'description' },
      });
      appendTag(description, {
        tag: 'button',
        text: i18n(sk, 'close'),
        attrs: { class: 'close' },
        // eslint-disable-next-line no-use-before-define
        lstnrs: { click: () => hideSpecialView(sk) },
      });
      appendTag(view, {
        tag: 'div',
        attrs: {
          class: 'container',
        },
      });
    }
    return view;
  }

  /**
   * Shows the view.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  async function showSpecialView(sk) {
    const {
      config: {
        specialView,
        pushDownElements,
      },
      location: {
        href,
        pathname,
      },
    } = sk;
    if (specialView && !getSpecialView(sk)) {
      try {
        const resp = await fetch(href);
        if (!resp.ok) {
          return;
        }
        const { js, css, cssLoaded } = specialView;
        if (css && !cssLoaded) {
          if (css.startsWith('https://') || css.startsWith('/')) {
            // load external css file
            sk.loadCSS(css);
          } else {
            // load inline css
            const style = appendTag(sk.shadowRoot, {
              tag: 'style',
              attrs: {
                type: 'text/css',
              },
            });
            style.textContent = css;
          }
          specialView.cssLoaded = true;
        }

        // hide original content
        [...sk.parentElement.children].forEach((el) => {
          if (el !== sk) {
            try {
              el.style.display = 'none';
            } catch (e) {
              // ignore
            }
          }
        });

        const view = getSpecialView(sk, true);
        view.classList.add(pathname.split('.').pop());
        pushDownElements.push(view);

        const data = await resp.text();
        let callback;
        if (typeof js === 'function') {
          callback = js;
        } else if (typeof js === 'string') {
          // load external module
          const mod = await import(js);
          callback = mod.default;
        } else {
          throw new Error('invalid view callback');
        }
        callback(view.querySelector(':scope .container'), data);
      } catch (e) {
        console.log('failed to draw view', e);
      }
    }
  }

  /**
   * Hides the special view.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function hideSpecialView(sk) {
    const { config } = sk;
    const view = getSpecialView(sk);
    if (view) {
      config.pushDownElements = config.pushDownElements.filter((el) => el !== view);
      view.replaceWith('');

      // show original content
      [...sk.parentElement.children].forEach((el) => {
        if (el !== sk) {
          try {
            el.style.display = '';
          } catch (e) {
            // ignore
          }
        }
      });

      // log telemetry
      sampleRUM('sidekick:specialviewhidden', {
        source: sk.location.href,
        target: sk.status.webPath,
      });
    }
  }

  /**
   * Fetches the dictionary for a language.
   * @private
   * @param {Sidekick} sk The sidekick
   * @param {string} lang The language
   * @returns {Object} The dictionary
   */
  async function fetchDict(sk, lang) {
    const dict = {};
    const dictPath = `${sk.config.scriptRoot}/_locales/${lang}/messages.json`;
    try {
      const res = await fetch(dictPath);
      const messages = await res.json();
      Object.keys(messages).forEach((key) => {
        dict[key] = messages[key].message;
      });
    } catch (e) {
      console.error(`failed to fetch dictionary from ${dictPath}`);
    }
    return dict;
  }

  /**
   * The sidekick provides helper tools for authors.
   * @augments HTMLElement
   */
  class Sidekick extends HTMLElement {
    /**
     * Creates a new sidekick.
     * @param {SidekickConfig} cfg The sidekick config
     */
    constructor(cfg) {
      super();
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }
      this.root = appendTag(this.shadowRoot, {
        tag: 'div',
        attrs: {
          class: 'hlx-sk hlx-sk-hidden',
        },
        lstnrs: {
          keydown: ({ altKey }) => {
            if (altKey) {
              // enable advanced mode
              this.root.classList.add('hlx-sk-advanced');
            }
          },
          keyup: ({ altKey }) => {
            if (!altKey) {
              // disable advanced mode
              this.root.classList.remove('hlx-sk-advanced');
            }
          },
        },
      });
      this.addEventListener('contextloaded', () => {
        this.loadCSS();
        // containers
        this.pluginContainer = appendTag(this.root, {
          tag: 'div',
          attrs: {
            class: 'plugin-container',
          },
        });
        this.pluginContainer.append(createTag({
          tag: 'span',
          text: i18n(this, 'plugins_loading'),
          attrs: {
            class: 'hlx-sk-label',
          },
        }));
        this.featureContainer = appendTag(this.root, {
          tag: 'div',
          attrs: {
            class: 'feature-container',
          },
        });
        // info button
        appendTag(
          this.featureContainer,
          createDropdown(this, {
            id: 'info',
            lstnrs: {
              click: () => {
                this.fetchStatus();
                updateModifiedDates(this);
              },
            },
            button: {
              attrs: {
                disabled: '',
                title: i18n(this, 'info'),
              },
              elements: [{
                tag: 'div',
                attrs: {
                  class: 'info-icon',
                },
              }],
            },
          }),
        );
        // user button
        this.userMenu = appendTag(
          this.featureContainer,
          createDropdown(this, {
            id: 'user',
            button: {
              attrs: {
                disabled: '',
                title: i18n(this, 'anonymous'),
              },
              elements: [{
                tag: 'div',
                attrs: {
                  class: 'user-icon',
                },
              }],
            },
          }),
        );
        // share button
        const share = appendTag(this.featureContainer, {
          tag: 'button',
          attrs: {
            class: 'share',
            title: i18n(this, 'share_description'),
          },
          lstnrs: {
            click: () => shareSidekick(this),
          },
        });
        appendTag(share, { tag: 'i' });
        // close button
        appendTag(this.featureContainer, {
          tag: 'button',
          attrs: {
            title: i18n(this, 'close'),
            class: 'close',
          },
          lstnrs: {
            click: () => this.hide(),
          },
        });
        // add default plugins
        addEditPlugin(this);
        addEnvPlugins(this);
        addPreviewPlugin(this);
        addReloadPlugin(this);
        addDeletePlugin(this);
        addPublishPlugin(this);
        addUnpublishPlugin(this);
        addBulkPlugins(this);
        addCustomPlugins(this);
        // fetch status
        this.fetchStatus();
        // push down content
        pushDownContent(this);
        // show special view
        showSpecialView(this);
      }, { once: true });
      this.addEventListener('statusfetched', () => {
        checkUserState(this);
        checkPlugins(this);
        checkLastModified(this);
        enableInfoBtn(this);
      });
      this.addEventListener('shown', async () => {
        pushDownContent(this);
      });
      this.addEventListener('hidden', () => {
        hideSpecialView(this);
        revertPushDownContent(this);
      });
      this.status = {};
      this.plugins = {};
      this.customPlugins = {};
      this.config = {};

      this.loadContext(cfg);
      checkForIssues(this);

      // collapse dropdowns when document is clicked
      document.addEventListener('click', () => collapseDropdowns(this));
    }

    /**
     * Fetches the status for the current resource.
     * @fires Sidekick#statusfetched
     * @param {boolean} refreshLocation Refresh the sidekick's location (optional)
     * @returns {Sidekick} The sidekick
     */
    async fetchStatus(refreshLocation) {
      const { owner, repo, ref } = this.config;
      if (!owner || !repo || !ref) {
        return this;
      }
      if (!this.status.apiUrl || refreshLocation) {
        const { href, pathname } = this.location;
        const isDM = this.isEditor() || this.isAdmin(); // is document management
        const apiUrl = getAdminUrl(
          this.config,
          'status',
          isDM ? '' : pathname,
        );

        apiUrl.searchParams.append('editUrl', isDM ? href : 'auto');
        this.status.apiUrl = apiUrl;
      }

      fetch(this.status.apiUrl, {
        ...getAdminFetchOptions(),
      })
        .then((resp) => {
          // check for error status
          if (!resp.ok) {
            let errorKey = '';
            switch (resp.status) {
              case 401:
                // unauthorized, ask user to log in
                return {
                  json: () => ({
                    status: 401,
                  }),
                };
              case 404:
                errorKey = this.isEditor()
                  ? 'error_status_404_document'
                  : 'error_status_404_content';
                break;
              default:
                errorKey = `error_status_${resp.status}`;
            }
            throw new Error(errorKey);
          }
          return resp;
        })
        .then(async (resp) => {
          try {
            return resp.json();
          } catch (e) {
            throw new Error('error_status_invalid');
          }
        })
        .then((json) => {
          this.status = json;
          return json;
        })
        .then((json) => fireEvent(this, 'statusfetched', json))
        .catch(({ message }) => {
          this.status.error = message;
          const modal = {
            message: message.startsWith('error_') ? i18n(this, message) : message,
            sticky: true,
            level: 0,
            callback: () => {
              // this error is fatal, hide and delete sidekick
              if (window.hlx.sidekick) {
                window.hlx.sidekick.hide();
                window.hlx.sidekick.replaceWith(''); // remove() doesn't work for custom element
                delete window.hlx.sidekick;
              }
            },
          };
          this.showModal(modal);
        });
      return this;
    }

    /**
     * Loads the sidekick configuration and language dictionary,
     * and retrieves the location of the current document.
     * @param {SidekickConfig} cfg The sidekick config
     * @fires Sidekick#contextloaded
     * @returns {Sidekick} The sidekick
     */
    async loadContext(cfg) {
      this.location = getLocation();
      this.config = await initConfig(cfg, this.location);

      // load dictionary based on user language
      const lang = this.config.lang || navigator.language.split('-')[0];
      this.dict = await fetchDict(this, lang);
      if (!this.dict.title) {
        // unsupported language, default to english
        this.dict = await fetchDict(this, 'en');
      }
      fireEvent(this, 'contextloaded', {
        config: this.config,
        location: this.location,
      });
      return this;
    }

    /**
     * Recalculates the height of the sidekick and pushes down the
     * page content by that amount to make room for the sidekick.
     * @returns {Sidekick} The sidekick
     */
    checkPushDownContent() {
      const sk = this instanceof Sidekick ? this : window.hlx.sidekick;
      const skHeight = parseFloat(window.getComputedStyle(sk.root).height, 10);
      if (sk.hasAttribute('pushdown') && +sk.getAttribute('pushdown') !== skHeight) {
        revertPushDownContent(sk);
        pushDownContent(sk, skHeight);
      }
      return this;
    }

    /**
     * Shows the sidekick.
     * @fires Sidekick#shown
     * @returns {Sidekick} The sidekick
     */
    show() {
      if (this.root.classList.contains('hlx-sk-hidden')) {
        this.root.classList.remove('hlx-sk-hidden');
      }
      fireEvent(this, 'shown');
      return this;
    }

    /**
     * Hides the sidekick.
     * @fires Sidekick#hidden
     * @returns {Sidekick} The sidekick
     */
    hide() {
      if (!this.root.classList.contains('hlx-sk-hidden')) {
        this.root.classList.add('hlx-sk-hidden');
      }
      if (this._modal && !this._modal.parentNode.classList.contains('hlx-sk-hidden')) {
        this.hideModal();
      }
      try {
        this.root.querySelector(':scope .env').classList.remove('expanded');
      } catch (e) {
        // ignore
      }
      fireEvent(this, 'hidden');
      return this;
    }

    /**
     * Shows/hides the sidekick.
     * @returns {Sidekick} The sidekick
     */
    toggle() {
      if (this.root.classList.contains('hlx-sk-hidden')) {
        this.show();
      } else {
        this.hide();
      }
      return this;
    }

    /**
     * Adds a plugin to the sidekick.
     * @param {_plugin} plugin The plugin configuration.
     * @returns {HTMLElement} The plugin
     */
    add(plugin) {
      if (typeof plugin !== 'object') {
        return null;
      }
      this.plugins[plugin.id] = plugin;
      // determine if plugin can be shown
      plugin.isShown = typeof plugin.condition === 'undefined'
          || (typeof plugin.condition === 'function' && plugin.condition(this));
      if (!plugin.isShown) {
        return registerPlugin(this, plugin, null);
      }

      // find existing plugin
      let $plugin = this.get(plugin.id);
      // determine container
      const $pluginContainer = (plugin.container && this.root
        .querySelector(`.dropdown.${plugin.container} .dropdown-container`))
        || (plugin.feature && this.root.querySelector('.feature-container'))
        || this.pluginContainer;

      const getPluginCfg = (p) => ({
        tag: 'div',
        attrs: {
          class: `${p.id} plugin`,
        },
      });

      if (!$plugin) {
        // add feature plugins in reverse order
        const $before = !!plugin.feature && this.root.querySelector('.feature-container').firstElementChild;
        if (plugin.button && plugin.button.isDropdown) {
          // add plugin as dropdown
          $plugin = appendTag($pluginContainer, createDropdown(this, plugin), $before);
          if (typeof plugin.callback === 'function') {
            plugin.callback(this, $plugin);
          }
          return $plugin;
        }
        // add plugin
        if ($pluginContainer === this.pluginContainer
          && !$pluginContainer.querySelector(':scope div.plugin')) {
          // first plugin, remove loading text
          $pluginContainer.innerHTML = '';
        }
        $plugin = appendTag($pluginContainer, getPluginCfg(plugin), $before);
      } else if (!plugin.isShown) {
        // remove existing plugin
        $plugin.remove();
        return null;
      } else if (plugin.override) {
        // replace existing plugin
        const $existingPlugin = $plugin;
        $plugin = appendTag($existingPlugin.parentElement, getPluginCfg(plugin), $existingPlugin);
        $existingPlugin.remove();
      }
      // add elements
      if (plugin.elements && Array.isArray(plugin.elements)) {
        plugin.elements.forEach((elem) => appendTag($plugin, elem));
      }
      // add or update button
      if (plugin.button) {
        plugin.button.action = plugin.button.action || (() => {});
        const buttonCfg = {
          tag: 'button',
          text: plugin.button.text,
          lstnrs: {
            click: (e) => plugin.button.action(e, this),
            auxclick: (e) => plugin.button.action(e, this),
          },
        };
        let $button = $plugin ? $plugin.querySelector(':scope button') : null;
        if ($button) {
          // extend existing button
          extendTag($button, buttonCfg);
        } else {
          // add button
          $button = appendTag($plugin, buttonCfg);
        }
        // check if button is enabled
        if (typeof plugin.button.isEnabled === 'function' && !plugin.button.isEnabled(this)) {
          $button.setAttribute('disabled', '');
        }
        // check if button is pressed
        if (typeof plugin.button.isPressed === 'function' && plugin.button.isPressed(this)) {
          $button.classList.add('pressed');
          $button.removeAttribute('tabindex');
        }
        // fire event when plugin button is clicked
        $button.addEventListener('click', () => fireEvent(this, 'pluginused', {
          id: plugin.id,
          button: $button,
        }));
      }
      // check advanced mode
      if (typeof plugin.advanced === 'function' && plugin.advanced(this)) {
        $plugin.classList.add('hlx-sk-advanced-only');
      }
      return registerPlugin(this, plugin, $plugin);
    }

    /**
     * Returns the sidekick plugin with the specified ID.
     * @param {string} id The plugin ID
     * @returns {HTMLElement} The plugin
     */
    get(id) {
      return this.root.querySelector(`:scope div.plugin.${id}`);
    }

    /**
     * Removes the plugin with the specified ID from the sidekick.
     * @param {string} id The plugin ID
     * @returns {Sidekick} The sidekick
     */
    remove(id) {
      const $plugin = this.get(id);
      if ($plugin) {
        $plugin.remove();
      }
      return this;
    }

    /**
     * Checks if the current location is an editor URL (SharePoint or Google Docs).
     * @returns {boolean} <code>true</code> if editor URL, else <code>false</code>
     */
    isEditor() {
      const { config, location } = this;
      const { host, pathname, search } = location;
      return (/.*\.sharepoint\.com$/.test(host)
        && pathname.match(/\/_layouts\/15\/[\w]+.aspx$/)
        && search.includes('sourcedoc='))
        || location.host === 'docs.google.com'
        || (config.mountpoint && new URL(config.mountpoint).host === location.host
          && !this.isAdmin());
    }

    /**
     * Checks if the current location is an admin URL (SharePoint or Google Drive).
     * @returns {boolean} <code>true</code> if admin URL, else <code>false</code>
     */
    isAdmin() {
      const { location } = this;
      return (location.host === 'drive.google.com')
        || (/\w+\.sharepoint.com$/.test(location.host)
        && location.pathname.endsWith('/Forms/AllItems.aspx'));
    }

    /**
     * Checks if the current location is a development URL.
     * @returns {boolean} <code>true</code> if development URL, else <code>false</code>
     */
    isDev() {
      const { config, location } = this;
      return [
        '', // for unit testing
        config.devUrl.host, // for development and browser testing
      ].includes(location.host);
    }

    /**
     * Checks if the current location is an inner CDN URL.
     * @returns {boolean} <code>true</code> if inner CDN URL, else <code>false</code>
     */
    isInner() {
      const { config, location } = this;
      return matchProjectHost(config.innerHost, location.host);
    }

    /**
     * Checks if the current location is an outer CDN URL.
     * @returns {boolean} <code>true</code> if outer CDN URL, else <code>false</code>
     */
    isOuter() {
      const { config, location } = this;
      return matchProjectHost(config.outerHost, location.host);
    }

    /**
     * Checks if the current location is a production URL.
     * @returns {boolean} <code>true</code> if production URL, else <code>false</code>
     */
    isProd() {
      const { config, location } = this;
      return config.host === location.host;
    }

    /**
     * Checks if the current location is a configured project URL.
     * @returns {boolean} <code>true</code> if project URL, else <code>false</code>
     */
    isProject() {
      return this.config.owner && this.config.repo
        && (this.isDev() || this.isInner() || this.isOuter() || this.isProd());
    }

    /**
     * @deprecated Use {@link isProject} instead
     * Checks if the current location is a configured project URL.
     * @returns {boolean} <code>true</code> if project URL, else <code>false</code>
     */
    isHelix() {
      return this.isProject();
    }

    /**
     * Checks if the current location is a content URL.
     * @returns {boolean} <code>true</code> if content URL, else <code>false</code>
     */
    isContent() {
      const file = this.location.pathname.split('/').pop();
      const ext = file && file.split('.').pop();
      return this.isEditor() || this.isAdmin() || ext === file || ext === 'html'
        || ext === 'json' || ext === 'pdf';
    }

    /**
     * Checks if the user is logged in.
     * @returns {boolean} <code>true</code> if user is logged in (or does not need to be),
     * else <code>false</code>
     */
    isAuthenticated() {
      return !!this.status?.profile;
    }

    /**
     * Checks if the user is allowed to use a feature.
     * @param {string} feature The feature to check
     * @param {string} permission The permission to require
     * @returns {boolean} <code>true</code> if user is allowed, else <code>false</code>
     */
    isAuthorized(feature, permission) {
      if (!this.status[feature]) {
        // unknown feature
        return false;
      }
      if (!this.status[feature].permissions) {
        // feature doesn't require permissions
        return true;
      }
      return this.status[feature].permissions.includes(permission);
    }

    /**
     * Displays a non-sticky notification.
     * @deprecated Use <code>showModal(<Object>)</code> instead
     * @param {string|string[]} message The message (lines) to display
     * @param {number}          level error (0), warning (1), of info (2)
     */
    notify(message, level = 2) {
      this.showModal({
        message,
        level,
      });
    }

    /**
     * Displays a sticky notification asking the user to wait.
     */
    showWait() {
      this.showModal({ message: i18n(this, 'please_wait'), sticky: true });
    }

    /**
     * Displays a modal notification.
     * @param {object|string|string[]} msg The message (object or lines)
     * @param {string} msg.message The message
     * @param {string} msg.css     The CSS class to add
     * @param {boolean} msg.sticky <code>true</code> if message should be sticky (optional)
     * @param {number}  msg.level error (0), warning (1), of info (2, default)
     * @param {Function} msg.callback The function to call when the modal is hidden again
     * @param {boolean} sticky <code>true</code> if message should be sticky (optional)
     * @param {number} level error (0), warning (1), of info (2, default)
     * @param {Function} callback The function to call when the modal is hidden again
     * @fires Sidekick#modalshown
     * @returns {Sidekick} The sidekick
     */
    // eslint-disable-next-line default-param-last
    showModal(msg, sticky = false, level = 2, callback) {
      this._modalCallback = callback;
      if (!this._modal) {
        const $spinnerWrap = appendTag(this.shadowRoot, {
          tag: 'div',
          attrs: {
            class: 'hlx-sk-overlay',
          },
          lstnrs: {
            click: () => this.hideModal(),
          },
        });
        this._modal = appendTag($spinnerWrap, { tag: 'div' });
      } else {
        this._modal.className = '';
        this._modal.parentNode.classList.remove('hlx-sk-hidden');
      }
      if (msg) {
        if (msg instanceof Object && !Array.isArray(msg)) {
          // object notation, use only props from first argument
          const {
            message,
            css,
            sticky: isSticky = false,
            level: hasLevel = 2,
            callback: hasCallback,
          } = msg;
          if (css) {
            this._modal.classList.add(css.split(' ')[0]);
          }
          msg = message || '';
          sticky = isSticky;
          level = hasLevel;
          this._modalCallback = hasCallback;
        }
        if (Array.isArray(msg)) {
          this._modal.textContent = '';
          msg.forEach((line) => {
            if (typeof line === 'string') {
              const isURL = line.startsWith('http');
              const p = appendTag(this._modal, {
                tag: 'p',
                text: !isURL ? line : '',
              });
              if (isURL) {
                appendTag(p, {
                  tag: 'a',
                  text: line,
                  attrs: {
                    href: line,
                    target: '_blank',
                  },
                });
              }
            } else if (line instanceof HTMLElement) {
              appendTag(appendTag(this._modal, { tag: 'p' }), line);
            }
          });
        } else {
          this._modal.textContent = msg;
        }
        this._modal.classList.add('modal');
        if (level < 2) {
          this._modal.classList.add(`level-${level}`);
        }
      }
      if (!sticky) {
        const sk = this;
        window.setTimeout(() => {
          sk.hideModal();
        }, 3000);
      }
      fireEvent(this, 'modalshown', this._modal);
      return this;
    }

    /**
     * Hides the modal if shown.
     * @fires Sidekick#modalhidden
     * @returns {Sidekick} The sidekick
     */
    hideModal() {
      if (this._modal) {
        this._modal.innerHTML = '';
        this._modal.className = '';
        this._modal.style = {};
        this._modal.parentNode.classList.add('hlx-sk-hidden');
        fireEvent(this, 'modalhidden');
      }
      if (typeof this._modalCallback === 'function') {
        this._modalCallback(this);
        delete this._modalCallback;
      }
      return this;
    }

    /**
     * Displays a balloon with help content.
     * @param {HelpTopic} topic The topic
     * @param {number} step The step number to display (starting with 0)
     * @returns {Sidekick} The sidekick
     */
    showHelp(topic, step = 0) {
      const { id, steps } = topic;
      // contextualize and consolidate help steps
      const cSteps = steps.filter(({ selector }) => {
        if (!selector) return true;
        const target = this.shadowRoot.querySelector(selector);
        return target && window.getComputedStyle(target).display !== 'none';
      });
      const numSteps = cSteps.length;
      if (!numSteps) return this;
      const { message, selector } = cSteps[step];
      this.showModal({
        message: [message],
        sticky: true,
      });

      // add controls
      const controls = appendTag(this._modal, {
        tag: 'p',
        attrs: {
          class: 'help-controls',
        },
      });
      const stepControls = appendTag(controls, {
        tag: 'div',
        attrs: {
          class: 'help-steps',
        },
      });
      const buttonControls = appendTag(controls, {
        tag: 'div',
        attrs: {
          class: 'help-actions',
        },
      });
      if (cSteps.length > 1) {
        cSteps.forEach((_, num) => {
          let type = 'current';
          if (num < step) {
            type = 'previous';
          } else if (num > step) {
            type = 'next';
          }
          const stepButton = appendTag(stepControls, {
            tag: 'a',
            attrs: {
              class: `help-step help-${type}`,
              title: i18n(this, `help_${type}`),
            },
            lstnrs: {
              click: (evt) => {
                evt.stopPropagation();
                this.showHelp(topic, num);
              },
            },
          });
          appendTag(stepButton, {
            tag: 'div',
            attrs: {
              class: 'circle',
            },
          });
        });
      }
      if (cSteps[step + 1]) {
        // more help steps to show
        const close = appendTag(buttonControls, createDropdown(this, {
          id: 'help-close',
          button: {
            text: i18n(this, 'close'),
          },
        }));
        appendTag(close.lastElementChild, {
          tag: 'button',
          text: i18n(this, 'help_close_dismiss'),
          lstnrs: {
            click: () => {
              fireEvent(this, 'helpdismissed', id);
            },
          },
        });
        appendTag(close.lastElementChild, {
          tag: 'button',
          text: i18n(this, 'help_close_acknowledge'),
          lstnrs: {
            click: () => {
              fireEvent(this, 'helpacknowledged', id);
            },
          },
        });
        appendTag(close.lastElementChild, {
          tag: 'button',
          text: i18n(this, 'help_close_opt_out'),
          lstnrs: {
            click: () => {
              fireEvent(this, 'helpoptedout', id);
            },
          },
        });
        appendTag(buttonControls, {
          tag: 'button',
          text: i18n(this, 'help_next'),
          attrs: {
            class: 'help-next',
          },
          lstnrs: {
            click: (evt) => {
              evt.stopPropagation();
              this.showHelp(topic, step + 1);
              fireEvent(this, 'helpnext', id);
            },
          },
        });
      } else {
        // last help step
        appendTag(buttonControls, {
          tag: 'button',
          text: i18n(this, 'help_acknowledge'),
          attrs: {
            class: 'help-acknowledge',
          },
          lstnrs: {
            click: () => {
              fireEvent(this, 'helpacknowledged', id);
            },
          },
        });
      }

      this._modal.classList.add('help');
      stickTo(this, '.modal.help', selector);
      return this;
    }

    /**
     * Loads the specified default CSS file, or a sibling of the
     * current JS or HTML file. E.g. when called without argument from
     * /foo/bar.js, it will attempt to load /foo/bar.css.
     * @param {string} path The path to the CSS file (optional)
     * @returns {Sidekick} The sidekick
     */
    loadCSS(path) {
      let href = path;
      if (!href) {
        if (this.config.scriptRoot) {
          href = `${this.config.scriptRoot}/app.css`;
        } else {
          const filePath = this.location.pathname;
          href = `${filePath.substring(filePath.lastIndexOf('/') + 1).split('.')[0]}.css`;
        }
      }
      appendTag(this.shadowRoot, {
        tag: 'link',
        attrs: {
          rel: 'stylesheet',
          href,
        },
      })
        .addEventListener('load', () => {
          fireEvent(this, 'cssloaded');
        });
      return this;
    }

    /**
     * Switches to (or opens) a given environment.
     * @param {string} targetEnv One of the following environments:
     *        <pre>dev</pre>, <pre>preview</pre>, <pre>live</pre> or <pre>prod</pre>
     * @param {boolean} open=false <pre>true</pre> if environment should be opened in new tab
     * @fires Sidekick#envswitched
     * @returns {Sidekick} The sidekick
     */
    async switchEnv(targetEnv, open) {
      const hostType = ENVS[targetEnv];
      if (!hostType) {
        console.error('invalid environment', targetEnv);
        return this;
      }
      if (this.status.error) {
        return this;
      }
      const { config, location: { href, search, hash }, status } = this;
      this.showWait();
      if (!status.webPath) {
        console.log('not ready yet, trying again in a second ...');
        window.setTimeout(() => this.switchEnv(targetEnv, open), 1000);
        return this;
      }
      const envOrigin = targetEnv === 'dev' ? config.devUrl.origin : `https://${config[hostType]}`;
      let envUrl = `${envOrigin}${status.webPath}`;
      if (!this.isEditor()) {
        envUrl += `${search}${hash}`;
      }
      fireEvent(this, 'envswitched', {
        sourceUrl: href,
        targetUrl: envUrl,
      });
      // switch or open env
      if (open || this.isEditor()) {
        window.open(envUrl, open
          ? '' : `hlx-sk-env--${config.owner}/${config.repo}/${config.ref}${status.webPath}`);
        this.hideModal();
      } else {
        window.location.href = envUrl;
      }
      return this;
    }

    /**
     * Updates the preview or code of the current resource.
     * @fires Sidekick#updated
     * @returns {Response} The response object
     */
    async update(path) {
      const { config, status } = this;
      path = path || status.webPath;
      let resp;
      let respPath;
      try {
        // update preview
        resp = await fetch(
          getAdminUrl(config, this.isContent() ? 'preview' : 'code', path),
          {
            method: 'POST',
            ...getAdminFetchOptions(),
          },
        );
        if (resp.ok) {
          if (this.isEditor() || this.isInner() || this.isDev()) {
            // bust client cache
            await fetch(`https://${config.innerHost}${path}`, { cache: 'reload', mode: 'no-cors' });
          }
          respPath = (await resp.json()).webPath;
          fireEvent(this, 'updated', respPath);
        }
      } catch (e) {
        console.error('failed to update', path, e);
      }
      return {
        ok: (resp && resp.ok) || false,
        status: (resp && resp.status) || 0,
        error: (resp && resp.headers.get('x-error')) || '',
        path: respPath || path,
      };
    }

    /**
     * Deletes the preview or code of the current resource.
     * @fires Sidekick#deleted
     * @returns {Response} The response object
     */
    async delete() {
      const { config, status } = this;
      const path = status.webPath;
      let resp;
      try {
        // delete preview
        resp = await fetch(
          getAdminUrl(config, this.isContent() ? 'preview' : 'code', path),
          {
            method: 'DELETE',
            ...getAdminFetchOptions(),
          },
        );
        // also unpublish if published
        if (status.live && status.live.lastModified) {
          await this.unpublish(path);
        }
        fireEvent(this, 'deleted', path);
      } catch (e) {
        console.error('failed to delete', path, e);
      }
      return {
        ok: (resp && resp.ok) || false,
        status: (resp && resp.status) || 0,
        path,
      };
    }

    /**
     * Publishes the page at the specified path if <pre>config.host</pre> is defined.
     * @param {string} path The path of the page to publish
     * @fires Sidekick#published
     * @returns {Response} The response object
     */
    async publish(path) {
      const { config, location } = this;

      // publish content only
      if (!this.isContent()) {
        return null;
      }

      const purgeURL = new URL(path, this.isEditor() ? `https://${config.innerHost}/` : location.href);
      console.log(`publishing ${purgeURL.pathname}`);
      let resp = {};
      try {
        resp = await fetch(
          getAdminUrl(config, 'live', purgeURL.pathname),
          {
            method: 'POST',
            ...getAdminFetchOptions(),
          },
        );
        // bust client cache for live and production
        if (config.outerHost) {
          // reuse purgeURL to ensure page relative paths (e.g. when publishing dependencies)
          purgeURL.hostname = config.outerHost;
          await fetch(purgeURL.href, { cache: 'reload', mode: 'no-cors' });
        }
        if (config.host) {
          // reuse purgeURL to ensure page relative paths (e.g. when publishing dependencies)
          purgeURL.hostname = config.host;
          await fetch(purgeURL.href, { cache: 'reload', mode: 'no-cors' });
        }
        fireEvent(this, 'published', path);
      } catch (e) {
        console.error('failed to publish', path, e);
      }
      resp.path = path;
      resp.error = (resp.headers && resp.headers.get('x-error')) || '';
      return resp;
    }

    /**
     * Unpublishes the current page.
     * @fires Sidekick#unpublished
     * @returns {Response} The response object
     */
    async unpublish() {
      if (!this.isContent()) {
        return null;
      }
      const { config, status } = this;
      const path = status.webPath;
      let resp;
      try {
        // delete live
        resp = await fetch(
          getAdminUrl(config, 'live', path),
          {
            method: 'DELETE',
            ...getAdminFetchOptions(),
          },
        );
        fireEvent(this, 'unpublished', path);
      } catch (e) {
        console.error('failed to unpublish', path, e);
      }
      return resp;
    }
  }

  /**
   * @external
   * @name "window.hlx.initSidekick"
   * @type {Function}
   * @description Initializes the sidekick and stores a reference to it in
   *              {@link window.hlx.sidekick}.
   * @param {SidekickConfig} cfg The sidekick configuration
   *        (extends {@link window.hlx.sidekickConfig})
   * @returns {Sidekick} The sidekick
   */
  function initSidekick(cfg = {}) {
    if (!window.hlx.sidekick) {
      // merge base config with extended config
      window.hlx.sidekickConfig = Object.assign(window.hlx.sidekickConfig || {}, cfg);
      // init and show sidekick
      try {
        window.customElements.define('helix-sidekick', Sidekick);
      } catch (e) {
        // ignore
      }
      // make sure there is only one sidekick
      document.querySelectorAll('helix-sidekick').forEach((sk) => sk.replaceWith(''));
      window.hlx.sidekick = document.createElement('helix-sidekick');
      document.body.prepend(window.hlx.sidekick);
      window.hlx.sidekick.show();

      // announce to the document that the sidekick is ready
      document.dispatchEvent(new CustomEvent('sidekick-ready'));
      document.dispatchEvent(new CustomEvent('helix-sidekick-ready')); // legacy
    } else {
      // toggle sidekick
      window.hlx.sidekick.toggle();
    }
    return window.hlx.sidekick;
  }

  window.hlx = window.hlx || {};
  window.hlx.initSidekick = initSidekick;
})();
