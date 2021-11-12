/*
 * Copyright 2020 Adobe. All rights reserved.
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
   * Initializes the sidekick in compatibility mode.
   * @private
   * @returns {Sidekick} The sidekick
   */
  function initSidekickCompatMode() {
    window.hlx.sidekickScript = document.querySelector('script[src$="/sidekick/app.js"]');
    window.hlx.sidekickConfig = window.hlx.sidekickConfig || {};
    window.hlx.sidekickConfig.compatMode = true;
    return window.hlx.initSidekick();
  }

  if (!window.customElements.get('helix-sidekick')) {
    window.hlx = window.hlx || {};
    const appScript = document.getElementById('hlx-sk-app');
    // load sidekick module
    const moduleScript = document.createElement('script');
    moduleScript.id = 'hlx-sk-module';
    moduleScript.src = (appScript && appScript.getAttribute('src').replace('app.js', 'module.js'))
      || 'https://www.hlx.live/tools/sidekick/module.js';
    moduleScript.addEventListener('load', () => {
      // get base config from script data attribute
      const baseConfig = appScript
        && appScript.dataset.config
        && JSON.parse(appScript.dataset.config);
      if (!appScript || typeof baseConfig !== 'object') {
        // old bookmarklet > compatibility mode
        initSidekickCompatMode();
      } else {
        // extract and validate base config
        const {
          owner, repo, ref = 'main', devMode,
        } = baseConfig;
        if (owner && repo) {
          // merge base config with potential pre-existing config
          window.hlx.sidekickConfig = Object.assign(
            window.hlx.sidekickConfig || {},
            baseConfig,
          );
          // look for extended config in project
          let configOrigin = '';
          if (devMode) {
            configOrigin = 'http://localhost:3000';
          } else if (!new RegExp(`${repo}\\-\\-${owner}\\.hlx(\\-\\d|3)?\\.page$`).test(window.location.hostname)) {
            // load config from inner CDN
            configOrigin = `https://${ref}--${repo}--${owner}.hlx.page`;
          }
          const configScript = document.createElement('script');
          configScript.id = 'hlx-sk-config';
          configScript.src = `${configOrigin}/tools/sidekick/config.js`;
          configScript.addEventListener('error', () => {
            // if no project config, init sidekick with base config
            console.info(`no sidekick config found at ${configScript.src}`);
            window.hlx.initSidekick();
          });
          // init sidekick via project config
          if (document.getElementById(configScript.id)) {
            document.getElementById(configScript.id).replaceWith(configScript);
          } else {
            document.head.append(configScript);
          }
        }
      }
    });
    moduleScript.addEventListener('error', () => {
      console.error('failed to load sidekick module');
    });
    document.head.append(moduleScript);
    window.hlx.sidekickScript = moduleScript;
  } else if (window.hlx.sidekick) {
    // sidekick already loaded > toggle
    window.hlx.sidekick.toggle();
  }
})();
