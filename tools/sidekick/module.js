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

'use strict';

(() => {
  /**
   * @typedef {Object.<string, string>} elemAttr
   * @description The name and value of the attribute to set on an element.
   */

  /**
   * @typedef {Object.<string, Function>} elemLstnr
   * @description The event name and listener to register on an element.
   */

  /**
   * @typedef {Object} elemConfig
   * @description The configuration of an element to add.
   * @prop {string}      tag    The tag name (mandatory)
   * @prop {string}      text   The text content (optional)
   * @prop {elemAttr[]}  attrs  The attributes (optional)
   * @prop {elemLstnr[]} lstnrs The event listeners (optional)
   */

  /**
   * @typedef {Object} pluginButton
   * @description The configuration for a plugin button. This can be used as
   * a shorthand for {@link elemConfig}.
   * @prop {string}   text   The button text
   * @prop {Function} action The click listener
   * @prop {Function} isPressed=false Determines whether the button is pressed
   * @prop {Function} isEnabled=true Determines whether to enable the button
   * @prop {boolean}  isDropdown=false Determines whether to turn this button into a dropdown
   */

  /**
   * @typedef {Object} plugin
   * @description The plugin configuration.
   * @prop {string}       id        The plugin ID (mandatory)
   * @prop {pluginButton} button    A button configuration object (optional)
   * @prop {string}       container The ID of a dropdown to add this plugin to (optional)
   * @prop {boolean}      override=false True to replace an existing plugin (optional)
   * @prop {elemConfig[]} elements  An array of elements to add (optional)
   * @prop {Function}     condition Determines whether to show this plugin (optional).
   * This function is expected to return a boolean when called with the sidekick as argument.
   * @prop {Function}     callback  A function called after adding the plugin (optional).
   * This function is called with the sidekick and the newly added plugin as arguments.
   */

  /**
   * A callback function to render a view.
   * @callback viewCallback
   * @param {HTMLELement} viewContainer The view container
   * @param {Object} data The data to display
   */

  /**
   * @typedef {Object} viewConfig
   * @description A custom view configuration.
   * @prop {string|viewCallback} js The URL of a JS module or a function to render this view
   * @prop {string} path The path or globbing pattern where to apply this view
   * @prop {string} css The URL of a CSS file or inline CSS to render this view (optional)
   */

  /**
   * @typedef {Object} helpStep
   * @description The definition of a help step inside a {@link helpTopic}.
   * @prop {string} message The help message
   * @prop {string} selector The CSS selector of the target element
   */

  /**
   * @typedef {Object} helpTopic
   * @description The definition of a help topic.
   * @prop {string} id The ID of the help topic
   * @prop {helpStep[]} steps An array of {@link helpStep}s
   */

  /**
   * @typedef {Object} sidekickConfig
   * @description The sidekick configuration.
   * @prop {string} owner The GitHub owner or organization (mandatory)
   * @prop {string} repo The GitHub owner or organization (mandatory)
   * @prop {string} ref=main The Git reference or branch (optional)
   * @prop {string} project The name of the Helix project used in the sharing link (optional)
   * @prop {plugin[]} plugins An array of plugin configurations (optional)
   * @prop {string} outerHost The outer CDN's host name (optional)
   * @prop {string} host The production host name to publish content to (optional)
   * @prop {boolean} byocdn=false <pre>true</pre> if the production host is a 3rd party CDN
   * @prop {boolean} devMode=false Loads configuration and plugins from the developmemt environment
   * @prop {boolean} pushDown=false <pre>true</pre> to have the sidekick push down page content
   * @prop {string} pushDownSelector The CSS selector for absolute elements to also push down
   * @prop {viewConfig[]} specialViews An array of custom view configurations (optional)
   * @prop {number} adminVersion The specific version of admin service to use (optional)
   */

  /**
   * @external
   * @name "window.hlx.sidekickConfig"
   * @type {sidekickConfig}
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
   * @property {sidekickConfig} config The sidekick configuration
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
    preview: 'innerHost',
    live: 'outerHost',
    prod: 'host',
  };

  /**
   * The URL of the development environment.
   * @see {@link https://github.com/adobe/helix-cli|Helix CLI}).
   * @private
   * @type {URL}
   */
  const DEV_URL = new URL('http://localhost:3000');

  /**
   * Checks if the current location is an editor URL (SharePoint or Google Docs).
   * @private
   * @param {Location} loc The location object
   * @returns {boolean} <code>true</code> if editor URL, else <code>false</code>
   */
  function isEditor(loc) {
    return /.*\.sharepoint\.com/.test(loc.host)
    || loc.host === 'docs.google.com';
  }

  /**
   * Retrieves Helix project details from a host name.
   * @private
   * @param {string} host The host name
   * @returns {string[]} The project details
   */
  function getHelixProjectDetails(host) {
    const details = host.split('.')[0].split('--');
    if (details.length < 2) {
      return false;
    }
    if (details.length === 3) {
      // lose ref
      details.shift();
    }
    return details;
  }

  /**
   * Checks if a Helix host name matches another, regardless of ref.
   * @private
   * @param {string} baseHost The base host
   * @param {string} host The host to match against the base host
   * @returns {boolean} <code>true</code> if the hosts match, else <code>false</code>
   */
  function matchHelixHost(baseHost, host) {
    if (!baseHost || !host) {
      return false;
    }
    // matching helix domains
    const helixDomains = ['page', 'hlx.live'];
    if (!helixDomains.find((domain) => baseHost.endsWith(domain)
      && host.endsWith(domain))) {
      return false;
    }
    // direct match
    if (baseHost === host) {
      return true;
    }
    // project details
    const [baseHostRepo, baseHostOwner] = getHelixProjectDetails(baseHost);
    const [hostRepo, hostOwner] = getHelixProjectDetails(host);
    return baseHostOwner === hostOwner && baseHostRepo === hostRepo;
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
   * Returns the sidekick configuration.
   * @private
   * @param {sidekickConfig} cfg The sidekick config (defaults to {@link window.hlx.sidekickConfig})
   * @param {Location} location The current location
   * @returns {Object} The sidekick configuration
   */
  function initConfig(cfg, location) {
    const config = cfg || (window.hlx && window.hlx.sidekickConfig) || {};
    const {
      owner,
      repo,
      ref = 'main',
      outerHost,
      host,
      project,
      pushDown,
      pushDownSelector,
      specialViews,
    } = config;
    const innerPrefix = owner && repo ? `${ref}--${repo}--${owner}` : null;
    const publicHost = host && host.startsWith('http') ? new URL(host).host : host;
    const scriptUrl = (window.hlx.sidekickScript && window.hlx.sidekickScript.src)
      || 'https://www.hlx.live/tools/sidekick/module.js';
    let innerHost = 'hlx.page';
    if (!innerHost && scriptUrl) {
      // get hlx domain from script src (used for branch deployment testing)
      const scriptHost = new URL(scriptUrl).host;
      if (scriptHost && scriptHost !== 'www.hlx.live' && !scriptHost.startsWith(DEV_URL.host)) {
        // keep only 1st and 2nd level domain
        innerHost = scriptHost.split('.')
          .reverse()
          .splice(0, 2)
          .reverse()
          .join('.');
      }
    }
    innerHost = innerPrefix ? `${innerPrefix}.${innerHost}` : null;
    let liveHost = outerHost;
    if (!liveHost && owner && repo) {
      // use default hlx3 outer CDN including the ref
      liveHost = `${ref}--${repo}--${owner}.hlx.live`;
    }
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
        js: './view/json.js',
      },
    ];
    // try custom views first
    const allSpecialViews = Array.isArray(specialViews)
      ? specialViews.concat(defaultSpecialViews)
      : defaultSpecialViews;
    // find view based on path
    const { pathname } = location;
    const specialView = allSpecialViews.find(({ path }) => globToRegExp(path).test(pathname));

    return {
      ...config,
      ref,
      innerHost,
      outerHost: liveHost,
      scriptUrl,
      host: publicHost,
      project: project || '',
      pushDown,
      pushDownElements,
      specialView,
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
   * Creates a dropdown as a container for other plugins.
   * @private
   * @param {pluginConfig} config The plugin configuration
   * @returns {HTMLElement} The dropdown
   */
  function createDropdown(config) {
    const { id = '', button = {} } = config;
    const dropdown = createTag({
      tag: 'div',
      attrs: {
        class: `${id} dropdown`,
      },
    });
    appendTag(dropdown, {
      tag: 'button',
      attrs: {
        class: 'dropdown-toggle',
      },
      lstnrs: {
        click: (evt) => {
          // collapse env listener
          const collapseEnv = () => {
            dropdown.classList.remove('dropdown-expanded');
            document.removeEventListener('click', collapseEnv);
          };
          dropdown.classList.toggle('dropdown-expanded');
          if (dropdown.classList.contains('dropdown-expanded')) {
            window.setTimeout(() => {
              document.addEventListener('click', collapseEnv);
            }, 100);
          }
          evt.stopPropagation();
        },
      },
      ...button,
    });
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
          'botttom-left',
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
        title: `Sidekick for ${config.project}`,
        text: `Check out this helper bookmarklet for ${config.project}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      sk.notify('Sharing URL copied to clipboard');
    }
  }

  /**
   * Fires an event with the given name.
   * @private
   * @param {Sidekick} sk The sidekick
   * @param {string} name The name of the event
   * @param {Object} data The data to pass to event listeners (defaults to {@link Sidekick})
   */
  function fireEvent(sk, name, data) {
    try {
      sk.root.dispatchEvent(new CustomEvent(name, {
        detail: {
          data: data || sk,
        },
      }));
    } catch (e) {
      console.warn('failed to fire event', name, data);
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
    const editLastMod = (status.edit && status.edit.lastModified) || null;
    const previewLastMod = (status.preview && status.preview.lastModified) || null;
    const liveLastMod = (status.live && status.live.lastModified) || null;
    if (sidekick.get('reload')
      && editLastMod && previewLastMod && new Date(editLastMod) > new Date(previewLastMod)) {
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
  }, api, path) {
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
   * Adds the edit plugin to the sidekick.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function addEditPlugin(sk) {
    sk.add({
      id: 'edit',
      condition: (sidekick) => !sidekick.isEditor() && sidekick.isHelix(),
      button: {
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
    // preview
    sk.add({
      id: 'preview',
      condition: (sidekick) => sidekick.isEditor() || sidekick.isHelix(),
      button: {
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
      condition: (sidekick) => sidekick.config.outerHost
        && (sidekick.isEditor() || sidekick.isHelix()),
      button: {
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
    });

    // production
    sk.add({
      id: 'prod',
      condition: (sidekick) => sidekick.config.host
        && sidekick.config.host !== sidekick.config.outerHost
        && (sidekick.isEditor() || sidekick.isHelix()),
      button: {
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
        action: async (evt) => {
          const { status } = sk;
          sk.showModal('Please wait …', true);
          // update preview
          const resp = await sk.update();
          if (!resp.ok) {
            console.error(resp);
            sk.showModal(
              `Failed to preview ${status.webPath}. Please try again later.`,
              true,
              0,
            );
            return;
          }
          // handle special case /.helix/config.json
          if (status.webPath === '/.helix/config.json') {
            sk.notify('Helix configuration successfully activated');
            return;
          }
          sk.switchEnv('preview', newTab(evt));
        },
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
        action: async (evt) => {
          const { location } = sk;
          sk.showModal('Please wait …', true);
          try {
            const resp = await sk.update();
            if (!resp.ok && resp.status >= 400) {
              console.error(resp);
              throw new Error(resp);
            }
            console.log(`reloading ${location.href}`);
            if (newTab(evt)) {
              window.open(window.location.href);
              sk.hideModal();
            } else {
              window.location.reload();
            }
          } catch (e) {
            sk.showModal(
              `Failed to reload ${location.pathname}. Please try again later.`,
              true,
              0,
            );
          }
        },
        isEnabled: (s) => s.status.edit && s.status.edit.url, // enable only if edit url exists
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
      condition: (sidekick) => sidekick.isHelix()
        && (!sidekick.status.edit || !sidekick.status.edit.url) // show only if no edit url and
        && (sidekick.status.preview && sidekick.status.preview.status !== 404), // preview exists
      button: {
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
              sk.showModal(
                `Failed to delete ${status.webPath}. Please try again later.`,
                true,
                0,
              );
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
      condition: (sidekick) => sidekick.isHelix() && sidekick.config.outerHost
        && sk.isContent(),
      button: {
        action: async (evt) => {
          const { config, location } = sk;
          const path = location.pathname;
          sk.showModal(`Publishing ${path}`, true);
          let urls = [path];
          // purge dependencies
          if (Array.isArray(window.hlx.dependencies)) {
            urls = urls.concat(window.hlx.dependencies);
          }
          const results = await Promise.all(urls.map((url) => sk.publish(url)));
          if (results.every((res) => res && res.ok)) {
            sk.showModal('Please wait …', true);
            // fetch and redirect to production
            const redirectHost = config.host || config.outerHost;
            const prodURL = `https://${redirectHost}${path}`;
            await fetch(prodURL, { cache: 'reload', mode: 'no-cors' });
            console.log(`redirecting to ${prodURL}`);
            if (newTab(evt)) {
              window.open(prodURL);
              sk.hideModal();
            } else {
              window.location.href = prodURL;
            }
          } else {
            console.error(results);
            sk.showModal(`Failed to publish ${path}. Please try again later.`, true, 0);
          }
        },
        isEnabled: (sidekick) => sidekick.status.edit
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
      condition: (sidekick) => sidekick.isHelix() && sidekick.config.outerHost
        && (!sidekick.status.edit || !sidekick.status.edit.url) // show only if no edit url and
        && sidekick.status.live && sidekick.status.live.lastModified // published
        && sk.isContent(),
      button: {
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
              sk.showModal(
                `Failed to unpublish ${path}. Please try again later.`,
                true,
                0,
              );
            }
          }
        },
      },
    });
  }

  /**
   * Adds the default and custom plugins to the sidekick, or checks existing
   * plugins based on the status of the current resource.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function checkPlugins(sk) {
    window.setTimeout(() => {
      if (sk.pluginContainer.querySelectorAll(':scope > div > *').length === 0) {
        // add empty text
        sk.pluginContainer.classList.replace('loading', 'empty');
        sk.checkPushDownContent();
      }
    }, 5000);
    sk.checkPushDownContent();
  }

  /**
   * Pushes down the page content to make room for the sidekick.
   * @private
   * @see {@link sidekickConfig.noPushDown}
   * @param {Sidekick} sk The sidekick
   * @param {number} skHeight The current height of the sidekick (optional)
   */
  function pushDownContent(sk, skHeight) {
    const { config, location } = sk;
    if (config.pushDown
      && !sk.hasAttribute('pushdown')
      && location.host !== 'docs.google.com') {
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
      && location.host !== 'docs.google.com') {
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
        attrs: { class: 'description' },
      });
      appendTag(description, {
        tag: 'button',
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
    }
  }

  /**
   * The sidekick provides helper tools for authors.
   * @augments HTMLElement
   */
  class Sidekick extends HTMLElement {
    /**
     * Creates a new sidekick.
     * @param {sidekickConfig} cfg The sidekick config
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
          contextloaded: () => {
            // add default plugins
            addEditPlugin(this);
            addEnvPlugins(this);
            addPreviewPlugin(this);
            addReloadPlugin(this);
            addDeletePlugin(this);
            addPublishPlugin(this);
            addUnpublishPlugin(this);
            // add custom plugins
            if (this.config.plugins && Array.isArray(this.config.plugins)) {
              this.config.plugins.forEach((plugin) => this.add(plugin));
            }
          },
          statusfetched: () => {
            checkPlugins(this);
            checkLastModified(this);
          },
          shown: async () => {
            await showSpecialView(this);
            pushDownContent(this);
          },
          hidden: () => {
            hideSpecialView(this);
            revertPushDownContent(this);
          },
        },
      });
      this.status = {};
      this.plugins = [];
      this.pluginContainer = appendTag(this.root, {
        tag: 'div',
        attrs: {
          class: 'plugin-container loading',
        },
      });
      this.featureContainer = appendTag(this.root, {
        tag: 'div',
        attrs: {
          class: 'feature-container',
        },
      });
      // share button
      const share = appendTag(this.featureContainer, {
        tag: 'button',
        attrs: {
          class: 'share',
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
          class: 'close',
        },
        lstnrs: {
          click: () => this.hide(),
        },
      });

      this.loadContext(cfg);
      this.fetchStatus();
      this.loadCSS();
      checkForIssues(this);
    }

    /**
     * Fetches the status for the current resource.
     * @fires Sidekick#statusfetched
     * @returns {Sidekick} The sidekick
     */
    async fetchStatus() {
      const { owner, repo, ref } = this.config;
      if (!owner || !repo || !ref) {
        return this;
      }
      if (!this.status.apiUrl) {
        const { href, pathname } = this.location;
        const apiUrl = getAdminUrl(
          this.config,
          'status',
          this.isEditor() ? '' : pathname,
        );
        apiUrl.searchParams.append('editUrl', this.isEditor() ? href : 'auto');
        this.status.apiUrl = apiUrl.toString();
      }
      fetch(this.status.apiUrl, { cache: 'no-store' })
        .then((resp) => {
          // check for error status
          if (!resp.ok) {
            let msg = '';
            switch (resp.status) {
              case 401:
                msg = 'You are not authorized to access this page. Check your login or network status.';
                break;
              case 404:
                msg = this.isEditor()
                  ? 'Page not found. Check your Sidekick configuration and make sure Helix has access to this document.'
                  : 'Page not found. Check your Sidekick configuration or URL.';
                break;
              default:
                msg = 'Failed to fetch the page status. Please try again later.';
            }
            throw new Error(`${resp.status}: ${msg}`);
          }
          return resp;
        })
        .then(async (resp) => {
          try {
            return resp.json();
          } catch (e) {
            throw new Error('Invalid server response. Check your Sidekick configuration or URL.');
          }
        })
        .then((json) => Object.assign(this.status, json))
        .then((json) => fireEvent(this, 'statusfetched', json))
        .catch((e) => {
          this.status.error = e.message;
          this.showModal(e.message, true, 0, () => {
            // this error is fatal, hide and delete sidekick
            if (window.hlx.sidekick) {
              window.hlx.sidekick.hide();
              window.hlx.sidekick.replaceWith(''); // remove() doesn't work for custom element
              delete window.hlx.sidekick;
            }
          });
          console.error('failed to fetch status', e.message);
        });
      return this;
    }

    /**
     * Loads the sidekick configuration and retrieves the location of the current document.
     * @param {sidekickConfig} cfg The sidekick config
     * @fires Sidekick#contextloaded
     * @returns {Sidekick} The sidekick
     */
    loadContext(cfg) {
      this.location = getLocation();
      this.config = initConfig(cfg, this.location);
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
     * @param {plugin} plugin The plugin configuration.
     * @returns {HTMLElement} The plugin
     */
    add(plugin) {
      if (typeof plugin === 'object') {
        this.plugins.push(plugin);
        plugin.isShown = typeof plugin.condition === 'undefined'
          || (typeof plugin.condition === 'function' && plugin.condition(this));
        // find existing plugin
        let $plugin = this.get(plugin.id);
        let $pluginContainer = (plugin.container
          && this.pluginContainer
            .querySelector(`.dropdown.${plugin.container} .dropdown-container`))
          || this.pluginContainer;
        if (ENVS[plugin.id]) {
          // find or create environment plugin container
          $pluginContainer = this.root.querySelector(':scope .env .dropdown-container');
          if (!$pluginContainer) {
            const $envDropdown = appendTag(
              this.featureContainer,
              createDropdown({
                id: 'env',
              }),
              this.featureContainer.firstElementChild,
            );
            if (this.isInner()) $envDropdown.classList.add('preview');
            if (this.isOuter()) $envDropdown.classList.add('live');
            if (this.isProd()) $envDropdown.classList.add('prod');
            $pluginContainer = $envDropdown.querySelector(':scope .dropdown-container');
          }
        }
        // re-check plugin once status is fetched
        this.addEventListener('statusfetched', () => {
          if (typeof plugin.condition === 'function') {
            if ($plugin && !plugin.condition(this)) {
              // plugin exists but condition now false
              this.remove(plugin.id);
            } else if (!$plugin && plugin.condition(this)) {
              // plugin doesn't exist but condition now true
              this.add(plugin);
            }
          }
          const isEnabled = plugin.button && plugin.button.isEnabled;
          if (typeof isEnabled === 'function' || typeof isEnabled === 'boolean') {
            const $button = $plugin && $plugin.querySelector(':scope button');
            if ($button) {
              if (typeof isEnabled === 'function' && isEnabled(this)) {
                // button enabled
                $plugin.querySelector(':scope button').removeAttribute('disabled');
              } else {
                // button disabled
                $plugin.querySelector(':scope button').setAttribute('disabled', '');
              }
            }
          }
        });

        const pluginCfg = {
          tag: 'div',
          attrs: {
            class: plugin.id,
          },
        };
        if (!$plugin && plugin.isShown) {
          // add new plugin
          if (plugin.button && plugin.button.isDropdown) {
            // add dropdown
            return appendTag($pluginContainer, createDropdown(plugin));
          }
          $plugin = appendTag($pluginContainer, pluginCfg);
          // remove loading text
          if (this.pluginContainer.classList.contains('loading')) {
            this.pluginContainer.classList.remove('loading');
          }
        } else if ($plugin) {
          if (!plugin.isShown) {
            // remove existing plugin
            $plugin.remove();
          } else if (plugin.override) {
            // replace existing plugin
            const $existingPlugin = $plugin;
            $plugin = appendTag($existingPlugin.parentElement, pluginCfg, $existingPlugin);
            $existingPlugin.remove();
          }
        }
        if (!plugin.isShown) {
          return null;
        }
        // add elements
        if (Array.isArray(plugin.elements)) {
          plugin.elements.forEach((elem) => appendTag($plugin, elem));
        }
        // add or update button
        if (plugin.button) {
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
        if (typeof plugin.callback === 'function') {
          plugin.callback(this, $plugin);
        }
        return $plugin;
      }
      return null;
    }

    /**
     * Returns the sidekick plugin with the specified ID.
     * @param {string} id The plugin ID
     * @returns {HTMLElement} The plugin
     */
    get(id) {
      return this.root.querySelector(`:scope div:not(.env).${id}`);
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
      return isEditor(this.location);
    }

    /**
     * Checks if the current location is a development URL.
     * @returns {boolean} <code>true</code> if development URL, else <code>false</code>
     */
    isDev() {
      const { location } = this;
      return [
        '', // for unit testing
        DEV_URL.host, // for development and browser testing
      ].includes(location.host);
    }

    /**
     * Checks if the current location is an inner CDN URL.
     * @returns {boolean} <code>true</code> if inner CDN URL, else <code>false</code>
     */
    isInner() {
      const { config, location } = this;
      return matchHelixHost(config.innerHost, location.host);
    }

    /**
     * Checks if the current location is an outer CDN URL.
     * @returns {boolean} <code>true</code> if outer CDN URL, else <code>false</code>
     */
    isOuter() {
      const { config, location } = this;
      return matchHelixHost(config.outerHost, location.host);
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
     * Checks if the current location is a configured Helix URL.
     * @returns {boolean} <code>true</code> if Helix URL, else <code>false</code>
     */
    isHelix() {
      return this.config.owner && this.config.repo
        && (this.isDev() || this.isInner() || this.isOuter() || this.isProd());
    }

    /**
     * Checks if the current location is a content URL.
     * @returns {boolean} <code>true</code> if content URL, else <code>false</code>
     */
    isContent() {
      const file = this.location.pathname.split('/').pop();
      const ext = file && file.split('.').pop();
      return this.isEditor() || ext === file || ext === 'html' || ext === 'json';
    }

    /**
     * Displays a non-sticky notification.
     * @param {string|string[]} msg The message (lines) to display
     * @param {number}          level error (0), warning (1), of info (2)
     */
    notify(msg, level = 2) {
      this.showModal(msg, false, level);
    }

    /**
     * Displays a modal notification.
     * @param {string|string[]} msg The message (lines) to display
     * @param {boolean}         sticky <code>true</code> if message should be sticky (optional)
     * @param {number}          level error (0), warning (1), of info (2)
     * @param {Function}        callback The function to call when the modal is hidden again
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
        this._modal.parentNode.classList.remove('hlx-sk-hidden');
      }
      if (msg) {
        if (Array.isArray(msg)) {
          this._modal.textContent = '';
          msg.forEach((line) => {
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
          });
        } else {
          this._modal.textContent = msg;
        }
        this._modal.className = `modal${level < 2 ? ` level-${level}` : ''}`;
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
     * @param {helpTopic} topic The topic
     * @param {number} step The step number to display (starting with 0)
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
      if (!numSteps) return;
      const { message, selector } = cSteps[step];
      this.showModal([message], true);

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
        const close = appendTag(buttonControls, createDropdown({
          id: 'help-close',
          button: {
            attrs: {
              class: 'dropdown-toggle close',
            },
          },
        }));
        appendTag(close.lastElementChild, {
          tag: 'button',
          attrs: {
            class: 'help-close-dismiss',
          },
          lstnrs: {
            click: () => {
              fireEvent(this, 'helpdismissed', id);
            },
          },
        });
        appendTag(close.lastElementChild, {
          tag: 'button',
          attrs: {
            class: 'help-close-acknowledge',
          },
          lstnrs: {
            click: () => {
              fireEvent(this, 'helpacknowledged', id);
            },
          },
        });
        appendTag(close.lastElementChild, {
          tag: 'button',
          attrs: {
            class: 'help-close-opt-out',
          },
          lstnrs: {
            click: () => {
              fireEvent(this, 'helpoptedout', id);
            },
          },
        });
        appendTag(buttonControls, {
          tag: 'button',
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
        if (this.config.scriptUrl) {
          href = `${this.config.scriptUrl.substring(0, this.config.scriptUrl.lastIndexOf('/'))}/app.css`;
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
      });
      // i18n
      if (!path && !navigator.language.startsWith('en')) {
        // look for language file in same directory
        const langHref = `${href.substring(0, href.lastIndexOf('/'))}/${navigator.language.split('-')[0]}.css`;
        appendTag(this.shadowRoot, {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: langHref,
          },
        });
      }
      return this;
    }

    /**
     * Switches to (or opens) a given environment.
     * @param {string} targetEnv One of the following environments:
     *        <pre>edit</pre>, <pre>preview</pre>, <pre>live</pre> or <pre>prod</pre>
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
      this.showModal('Please wait …', true);
      if (!status.webPath) {
        console.log('not ready yet, trying again in a second ...');
        window.setTimeout(() => this.switchEnv(targetEnv, open), 1000);
        return this;
      }
      let envUrl = `https://${config[hostType]}${status.webPath}`;
      if (!this.isEditor()) {
        envUrl += `${search}${hash}`;
      }
      if (targetEnv === 'preview' && this.isEditor()) {
        await this.update();
      }
      // handle special case /.helix/config.json
      if (status.webPath === '/.helix/config.json') {
        this.notify('Helix configuration successfully activated');
        return this;
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
     * @return {Response} The response object
     */
    async update() {
      const { config, status } = this;
      const path = status.webPath;
      let resp;
      try {
        // update preview
        resp = await fetch(
          getAdminUrl(config, this.isContent() ? 'preview' : 'code', path),
          { method: 'POST' },
        );
        if (this.isEditor() || this.isInner() || this.isDev()) {
          // bust client cache
          await fetch(`https://${config.innerHost}${path}`, { cache: 'reload', mode: 'no-cors' });
        }
        fireEvent(this, 'updated', path);
      } catch (e) {
        console.error('failed to update', path, e);
      }
      return {
        ok: (resp && resp.ok) || false,
        status: (resp && resp.status) || 0,
        path,
      };
    }

    /**
     * Deletes the preview or code of the current resource.
     * @fires Sidekick#deleted
     * @return {Response} The response object
     */
    async delete() {
      const { config, status } = this;
      const path = status.webPath;
      let resp;
      try {
        // delete preview
        resp = await fetch(
          getAdminUrl(config, this.isContent() ? 'preview' : 'code', path),
          { method: 'DELETE' },
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
     * @return {Response} The response object
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
        resp = await fetch(getAdminUrl(config, 'live', purgeURL.pathname), { method: 'POST' });
        // bust client cache for live and production
        if (config.outerHost) {
          await fetch(`https://${config.outerHost}${path}`, { cache: 'reload', mode: 'no-cors' });
        }
        if (config.host) {
          await fetch(`https://${config.host}${path}`, { cache: 'reload', mode: 'no-cors' });
        }
        fireEvent(this, 'published', path);
      } catch (e) {
        console.error('failed to unpublish', path, e);
      }
      return resp;
    }

    /**
     * Unpublishes the current page.
     * @fires Sidekick#unpublished
     * @return {Response} The response object
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
        resp = await fetch(getAdminUrl(config, 'live', path), { method: 'DELETE' });
        fireEvent(this, 'unpublished', path);
      } catch (e) {
        console.error('failed to unpublish', path, e);
      }
      return resp;
    }

    /**
     * Sets up a function that will be called whenever the specified sidekick
     * event is fired.
     * @param {string} type The event type
     * @param {Function} listener The function to call
     */
    addEventListener(type, listener) {
      this.root.addEventListener(type, listener);
    }

    /**
     * Removes an event listener previously registered with {@link addEventListener}.
     * @param {string} type The event type
     * @param {Function} listener The function to remove
     */
    removeEventListener(name, listener) {
      this.root.removeEventListener(name, listener);
    }
  }

  /**
   * @external
   * @name "window.hlx.initSidekick"
   * @type {Function}
   * @description Initializes the sidekick and stores a reference to it in
   *              {@link window.hlx.sidekick}.
   * @param {sidekickConfig} cfg The sidekick configuration
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
    } else {
      // toggle sidekick
      window.hlx.sidekick.toggle();
    }
    return window.hlx.sidekick;
  }

  window.hlx = window.hlx || {};
  window.hlx.initSidekick = initSidekick;
})();
