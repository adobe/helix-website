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
   * @prop {boolean|Function} isPressed Determines whether the button is pressed
   */

  /**
   * @typedef {Object} plugin
   * @description The plugin configuration.
   * @prop {string}       id        The plugin ID (mandatory)
   * @prop {pluginButton} button    A button configuration object (optional)
   * @prop {boolean}      override=false  True to replace an existing plugin (optional)
   * @prop {elemConfig[]} elements  An array of elements to add (optional)
   * @prop {Function}     condition Determines whether to show this plugin (optional).
   * This function is expected to return a boolean when called with the sidekick as argument.
   * @prop {Function}     callback  A function called after adding the plugin (optional).
   * This function is called with the sidekick and the newly added plugin as arguments.
   */

  /**
   * @typedef {Object} sidekickConfig
   * @description The sidekick configuration.
   * before creating the {@link Sidekick}.
   * @prop {string} owner The GitHub owner or organization (mandatory)
   * @prop {string} repo The GitHub owner or organization (mandatory)
   * @prop {string} ref=main The Git reference or branch (optional)
   * @prop {string} project The name of the Helix project used in the sharing link (optional)
   * @prop {plugin[]} plugins An array of plugin configurations (optional)
   * @prop {string} outerHost The outer CDN's host name (optional)
   * @prop {string} host The production host name to publish content to (optional)
   * @prop {boolean} byocdn=false <pre>true</pre> if the production host is a 3rd party CDN
   * @prop {boolean} hlx3=false <pre>true</pre> if the project is running on Helix 3
   * @prop {boolean} devMode=false Loads configuration and plugins from the developmemt environment
   * @prop {boolean} pushDown=true <pre>false</pre> to have the sidekick overlay page content
   * @prop {string} pushDownSelector The CSS selector for absolute elements to also push down
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
    const compHost = (host.split('--').length === 3)
      ? host.substring(host.indexOf('--') + 2)
      : host;
    return baseHost === compHost || baseHost.endsWith(compHost);
  }

  /**
   * Returns the sidekick configuration.
   * @private
   * @param {sidekickConfig} cfg The sidekick config (defaults to {@link window.hlx.sidekickConfig})
   * @returns {Object} The sidekick configuration
   */
  function initConfig(cfg) {
    const config = cfg || (window.hlx && window.hlx.sidekickConfig) || {};
    const {
      owner,
      repo,
      ref = 'main',
      outerHost,
      host,
      project,
      pushDown = true,
      pushDownSelector,
      hlx3 = false,
    } = config;
    const innerPrefix = owner && repo ? `${ref}--${repo}--${owner}` : null;
    const publicHost = host && host.startsWith('http') ? new URL(host).host : host;
    const scriptUrl = (window.hlx.sidekickScript && window.hlx.sidekickScript.src)
      || 'https://www.hlx.live/tools/sidekick/module.js';
    let innerHost;
    if (hlx3) {
      innerHost = 'hlx3.page';
    }
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
    if (!innerHost) {
      // fall back to hlx.page
      innerHost = 'hlx.page';
    }
    innerHost = innerPrefix ? `${innerPrefix}.${innerHost}` : null;
    let liveHost = outerHost;
    if (!liveHost && owner && repo) {
      if (hlx3) {
        // hlx3 sites automatically have an outer CDN (including the ref)
        liveHost = `${ref}--${repo}--${owner}.hlx.live`;
      } else if (publicHost) {
        // hlx2 sites require a production host to be defined
        liveHost = `${repo}--${owner}.hlx.live`;
      }
    }
    // define elements to push down
    const pushDownElements = [];
    if (pushDown) {
      document.querySelectorAll(
        `html, iframe#WebApplicationFrame${pushDownSelector ? `, ${pushDownSelector}` : ''}`,
      ).forEach((elem) => pushDownElements.push(elem));
    }
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
      hlx3,
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

    // replace single - with 2
    const makeHostHelixCompliant = (ahost) => {
      if (!/.*\.hlx.*\.(live|page)/.test(ahost) || ahost.match(/^.*?--.*?--.*?\./gm)) {
        return ahost;
      }
      return ahost
        .replace(/^([^-.]+)-([^-.]+)-([^-.]+)\./gm, '$1-$2--$3.')
        .replace(/^([^-.]+)-([^-.]+)\./gm, '$1--$2.');
    };

    const newHost = makeHostHelixCompliant(hostname);

    return {
      hash,
      host: host.replace(hostname, newHost),
      hostname: newHost,
      href: href.replace(hostname, newHost),
      origin: origin.replace(hostname, newHost),
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
          setTimeout(() => {
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
      ['hlx3', config.hlx3],
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
   * Checks for sidekick updates and informs the user.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function checkForUpdates(sk) {
    const indicators = [
      // legacy config
      typeof window.hlxSidekickConfig === 'object' || sk.config.compatMode,
      // legacy script host
      !sk.config.scriptUrl || new URL(sk.config.scriptUrl).host === 'www.hlx.page',
      // update flag
      sk.updateRequired = false,
    ];
    if (indicators.includes(true)) {
      window.setTimeout(() => {
        if (window.confirm('Apologies, but your Helix Sidekick Bookmarklet needs to be updated one more time …\n\nThis time we made sure we will never have to ask you again. Promised! :)')) {
          sk.showModal('Please wait …', true);
          window.location.href = getShareUrl(sk.config, sk.location.href);
        }
      }, 1000);
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
   * Compares source and preview last modified dates.
   * @private
   * @param {Sidekick} sidekick The sidekick
   */
  async function checkLastModified({ detail = {} }) {
    const { data: status = {} } = detail;
    const pLastMod = (status.preview && status.preview.lastModified) || null;
    const sLastMod = (status.source && status.source.lastModified) || null;
    console.log('preview up to date?', new Date(pLastMod) > new Date(sLastMod));
    // TODO: do something with it
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
   * @returns {string} The admin URL
   */
  function getAdminUrl({ owner, repo, ref }, api, path) {
    return new URL([
      'https://admin.hlx3.page/',
      api,
      `/${owner}`,
      `/${repo}`,
      `/${ref}`,
      path,
    ].join(''));
  }

  /**
   * Check for Helix 3 related issues.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  async function checkForHelix3(sk) {
    // check if current inner cdn url is hlx3 url
    if (sk.config.hlx3
      && sk.location.hostname.endsWith('.page')
      && !sk.location.hostname.endsWith('hlx3.page')) {
      if (window.confirm('This Helix Sidekick Bookmarklet can only work on a Helix 3 site.\n\nPress OK to be taken to the Helix 3 version of this page now.')) {
        sk.switchEnv('preview');
      }
    }
  }

  /**
   * Adds the edit plugin to the sidekick.
   * @private
   * @param {Sidekick} sk The sidekick
   */
  function addEditPlugin(sk) {
    sk.add({
      id: 'edit',
      condition: (sidekick) => !sidekick.isEditor() && sidekick.isHelix()
        && sidekick.status.edit && sidekick.status.edit.url,
      button: {
        action: async () => {
          const { config, status } = sk;
          const editUrl = status.edit && status.edit.url;
          window.open(editUrl, `hlx-sk-edit--${config.owner}/${config.repo}/${config.ref}${status.webPath}`);
        },
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
      },
    });

    // live
    sk.add({
      id: 'live',
      condition: (sidekick) => (sidekick.config.hlx3 || sidekick.config.outerHost)
        && (sidekick.isEditor() || sidekick.isHelix()),
      button: {
        action: async (evt) => {
          if (evt.target.classList.contains('pressed')) {
            return;
          }
          sk.switchEnv('live', newTab(evt));
        },
        isPressed: (sidekick) => sidekick.isOuter(),
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
      condition: (s) => s.config.innerHost && (s.isInner() || s.isDev())
        && (s.status.edit && s.status.edit.url), // show if edit url exists
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
        && (!sidekick.status.edit || !sidekick.status.edit.url), // show if no edit url
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
            : 'This file no longer exists in the repository'}
            , deleting it cannot be undone!\n\n
            Are you sure you want to delete it?`)) {
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
        && !(sidekick.config.byocdn && sidekick.location.host === sidekick.config.host)
        && (sidekick.status.edit && sidekick.status.edit.url) // show if edit url exists
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
            const redirectHost = config.byocdn || (config.hlx3 && !config.host)
              ? config.outerHost
              : config.host;
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
            sk.showModal('Failed to publish page. Please try again later.', true, 0);
          }
        },
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
        && !(sidekick.config.byocdn && sidekick.location.host === sidekick.config.host)
        && (!sidekick.status.edit || !sidekick.status.edit.url) // show if no edit url
        && sidekick.status.live && sidekick.status.live.lastModified // show if published
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
    if (sk.plugins.length === 0) {
      // default plugins
      addEditPlugin(sk);
      addEnvPlugins(sk);
      addReloadPlugin(sk);
      addDeletePlugin(sk);
      addPublishPlugin(sk);
      addUnpublishPlugin(sk);
      // custom plugins
      if (sk.config.plugins && Array.isArray(sk.config.plugins)) {
        sk.config.plugins.forEach((plugin) => sk.add(plugin));
      }
      if (sk.config.compatMode
        && (sk.isHelix() || sk.isEditor())
        && (sk.config.devMode || sk.config.innerHost)) {
        // load custom plugins in compatibility mode
        let prefix = (sk.isEditor() ? `https://${sk.config.innerHost}` : '');
        if (sk.config.devMode || sk.config.pluginHost) {
          // TODO: remove support for pluginHost
          if (sk.config.pluginHost) {
            console.warn('pluginHost is deprecated, use devMode instead');
          }
          prefix = sk.config.pluginHost || DEV_URL.origin;
        }
        appendTag(document.head, {
          tag: 'script',
          attrs: {
            src: `${prefix}/tools/sidekick/plugins.js`,
          },
        });
      }
      setTimeout(() => {
        if (sk.root.querySelectorAll(':scope > div > *').length === 0) {
          // add empty text
          sk.root.classList.replace('hlx-sk-loading', 'hlx-sk-empty');
        }
      }, 5000);
    } else {
      // re-evaluate plugin conditions
      sk.plugins.forEach((plugin) => {
        if (typeof plugin.condition !== 'function') {
          // nothing to do
          return;
        }
        const $plugin = sk.get(plugin.id);
        if ($plugin && !plugin.condition(sk)) {
          // plugin exists but condition now false
          sk.remove(plugin.id);
        } else if (!$plugin && plugin.condition(sk)) {
          // plugin doesn't exist but condition now true
          sk.add(plugin);
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
      this.attachShadow({ mode: 'open' });
      this.root = appendTag(this.shadowRoot, {
        tag: 'div',
        attrs: {
          class: 'hlx-sk hlx-sk-hidden hlx-sk-loading',
        },
        lstnrs: {
          statusfetched: () => {
            checkPlugins(this);
            checkLastModified(this);
          },
        },
      });
      this.status = {};
      this.plugins = [];
      this.loadContext(cfg);
      this.fetchStatus();
      this.loadCSS();
      // share button
      const share = appendTag(this.root, {
        tag: 'button',
        text: '<',
        attrs: {
          class: 'share',
        },
        lstnrs: {
          click: () => shareSidekick(this),
        },
      });
      appendTag(share, {
        tag: 'span',
        attrs: {
          class: 'dots',
        },
      });
      // close button
      appendTag(this.root, {
        tag: 'button',
        text: '✕',
        attrs: {
          class: 'close',
        },
        lstnrs: {
          click: () => this.hide(),
        },
      });
      checkForHelix3(this);
      checkForUpdates(this);
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
          this.isContent() ? 'preview' : 'code',
          this.isEditor() ? '/' : pathname,
        );
        if (this.isEditor()) {
          apiUrl.search = new URLSearchParams([
            ['editUrl', href],
          ]).toString();
        }
        this.status.apiUrl = apiUrl.toString();
      }
      fetch(this.status.apiUrl, { cache: 'no-store' })
        .then((resp) => resp.json())
        .then((json) => Object.assign(this.status, json))
        .then((json) => fireEvent(this, 'statusfetched', json))
        .catch((e) => {
          this.status.error = e.message;
          this.showModal('Failed to fetch status. Please try again later', false, 0, () => {
            // this error is fatal, hide and delete sidekick
            window.hlx.sidekick.hide();
            window.hlx.sidekick.replaceWith(''); // remove() doesn't work for custom element
            delete window.hlx.sidekick;
          });
          console.error('failed to fetch status', e);
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
      this.config = initConfig(cfg);
      this.location = getLocation();
      fireEvent(this, 'contextloaded', {
        config: this.config,
        location: this.location,
      });
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
      if (this.config.pushDown
        && !this.hasAttribute('pushdown')
        && this.location.host !== 'docs.google.com') {
        // push down content
        this.setAttribute('pushdown', '');
        this.config.pushDownElements.forEach((elem) => {
          // sidekick shown, push element down
          const currentMarginTop = parseInt(elem.style.marginTop, 10);
          let newMarginTop = 49;
          if (!Number.isNaN(currentMarginTop)) {
            // add element's non-zero top value
            newMarginTop += currentMarginTop;
          }
          elem.style.marginTop = `${newMarginTop}px`;
        });
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
      this.hideModal();
      if (this.config.pushDown
        && this.hasAttribute('pushdown')
        && this.location.host !== 'docs.google.com') {
        // revert push down of content
        this.removeAttribute('pushdown');
        this.config.pushDownElements.forEach((elem) => {
          elem.style.marginTop = 'initial';
        });
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
        plugin.enabled = typeof plugin.condition === 'undefined'
          || (typeof plugin.condition === 'function' && plugin.condition(this));
        // find existing plugin
        let $plugin = this.get(plugin.id);
        let $pluginContainer = this.root;
        if (ENVS[plugin.id]) {
          // find or create environment plugin container
          $pluginContainer = this.root.querySelector(':scope .env');
          if (!$pluginContainer) {
            $pluginContainer = appendTag(this.root, {
              tag: 'div',
              attrs: {
                class: 'env',
              },
            });
          }
        }
        const pluginCfg = {
          tag: 'div',
          attrs: {
            class: plugin.id,
          },
        };
        if (!$plugin && plugin.enabled) {
          // add new plugin
          $plugin = appendTag($pluginContainer, pluginCfg);
          // remove loading text
          if (this.root.classList.contains('hlx-sk-loading')) {
            this.root.classList.remove('hlx-sk-loading');
          }
        } else if ($plugin) {
          if (!plugin.enabled) {
            // remove existing plugin
            $plugin.remove();
          } else if (plugin.override) {
            // replace existing plugin
            const $existingPlugin = $plugin;
            $plugin = appendTag($existingPlugin.parentElement, pluginCfg, $existingPlugin);
            $existingPlugin.remove();
          }
        }
        if (!plugin.enabled) {
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
          // check if button is pressed
          if ((typeof plugin.button.isPressed === 'boolean' && !!plugin.button.isPressed)
            || (typeof plugin.button.isPressed === 'function' && plugin.button.isPressed(this))) {
            $button.classList.add('pressed');
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
      return this.root.querySelector(`:scope .${id}`);
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
          msg.forEach((line) => appendTag(this._modal, {
            tag: 'p',
            text: line,
          }));
        } else {
          this._modal.textContent = msg;
        }
        this._modal.className = `modal${level < 2 ? ` level-${level}` : ''}`;
      }
      if (!sticky) {
        const sk = this;
        window.setTimeout(() => {
          sk.hideModal();
          if (callback && typeof callback === 'function') {
            callback(sk);
          }
        }, 3000);
      } else {
        this._modal.classList.add('wait');
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
        this._modal.parentNode.classList.add('hlx-sk-hidden');
        fireEvent(this, 'modalhidden');
      }
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
      if (!navigator.language.startsWith('en')) {
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
      const { config, location, status } = this;
      this.showModal('Please wait …', true);
      if (!status.webPath) {
        console.log('not ready yet, trying again in a second ...');
        window.setTimeout(() => this.switchEnv(targetEnv, open), 1000);
        return this;
      }
      const envUrl = `https://${config[hostType]}${status.webPath}`;
      if (config.hlx3 && targetEnv === 'preview' && this.isEditor()) {
        await this.update();
      }
      fireEvent(this, 'envswitched', {
        sourceUrl: location.href,
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
        if (config.hlx3) {
          // update preview
          resp = await fetch(
            getAdminUrl(config, this.isContent() ? 'preview' : 'code', path),
            { method: 'POST' },
          );
        } else {
          resp = await this.publish(path, true);
        }
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
        if (config.hlx3) {
          // delete preview
          resp = await fetch(
            getAdminUrl(config, this.isContent() ? 'preview' : 'code', path),
            { method: 'DELETE' },
          );
          if (status.live && status.live.lastModified) {
            await this.unpublish(path);
          }
        } else {
          resp = await this.update(path);
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
     * @typedef {Object} publishResponse
     * @description The response object for a publish action.
     * @prop {boolean} ok     True if publish action was successful, else false
     * @prop {string}  status The status text returned by the publish action
     * @prop {Object}  json   The JSON object returned by the publish action
     * @prop {string}  path   The path of the published page
     */

    /**
     * Publishes the page at the specified path if <pre>config.host</pre> is defined.
     * @param {string} path The path of the page to publish
     * @param {boolean} innerOnly <pre>true</pre> to only refresh inner CDN, else <pre>false</pre>
     * @fires Sidekick#published
     * @return {publishResponse} The response object
     */
    async publish(path, innerOnly = false) {
      const { config, location } = this;

      if ((!innerOnly && !config.hlx3 && !config.host) // non-hlx3 without host
        || (config.byocdn && location.host === config.host) // byocdn and prod host
        || !this.isContent()) {
        return null;
      }

      const purgeURL = new URL(path, this.isEditor() ? `https://${config.innerHost}/` : location.href);
      let ok;
      let status;
      let json;

      if (config.hlx3) {
        console.log(`publishing ${purgeURL.pathname}`);
        const resp = await fetch(getAdminUrl(config, 'live', purgeURL.pathname), { method: 'POST' });
        ok = resp.ok;
        status = resp.status;
      } else {
        console.log(`purging ${purgeURL.href}`);
        const xfh = [config.innerHost];
        if (!innerOnly) {
          if (config.outerHost) {
            xfh.push(config.outerHost);
          }
          if (config.host && !config.byocdn) {
            xfh.push(config.host);
          }
        }
        const resp = await fetch(purgeURL, {
          method: 'POST',
          headers: {
            'X-Method-Override': 'HLXPURGE',
            'X-Forwarded-Host': xfh.join(', '),
          },
        });
        json = await resp.json();
        console.log(JSON.stringify(json));
        ok = resp.ok && Array.isArray(json) && json.every((e) => e.status === 'ok');
        status = resp.status;
      }
      fireEvent(this, 'published', path);
      return {
        ok,
        status,
        json: json || {},
        path,
      };
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
        if (config.hlx3) {
          // delete live
          resp = await fetch(getAdminUrl(config, 'live', path), { method: 'DELETE' });
          fireEvent(this, 'unpublished', path);
        }
      } catch (e) {
        console.error('failed to unpublish', path, e);
      }
      return {
        ok: (resp && resp.ok) || false,
        status: (resp && resp.status) || 0,
        path,
      };
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
      if (!window.customElements.get('helix-sidekick')) {
        window.customElements.define('helix-sidekick', Sidekick);
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
