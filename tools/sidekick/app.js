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

  if (!window.hlx || !window.hlx.sidekick) {
    window.hlx = window.hlx || {};
    const appScript = document.getElementById('hlx-sk-app');
    // load sidekick module
    const moduleScript = document.createElement('script');
    moduleScript.id = 'hlx-sk-module';
    moduleScript.src = (appScript && appScript.getAttribute('src').replace('app.js', 'module.js'))
      || 'https://www.hlx.live/tools/sidekick/module.js';
    moduleScript.addEventListener('load', async () => {
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
        baseConfig.scriptUrl = appScript.getAttribute('src');
        if (owner && repo) {
          // init sidekick config
          window.hlx.sidekickConfig = {};
          // look for custom config in project
          let configOrigin = '';
          if (devMode) {
            configOrigin = 'http://localhost:3000';
          } else if (!new RegExp(`${repo}\\-\\-${owner}\\.hlx(\\-\\d|3)?\\.page$`)
            .test(window.location.hostname)) {
            // load config from inner CDN
            configOrigin = `https://${ref}--${repo}--${owner}.hlx.live`;
          }
          try {
            const res = await fetch(`${configOrigin}/tools/sidekick/config.json`);
            if (res.ok) {
              console.log(`custom sidekick config loaded from ${configOrigin}/tools/sidekick/config.json`);
              // apply custom config
              Object.assign(window.hlx.sidekickConfig, await res.json());
            }
          } catch (e) {
            console.log('error retrieving custom sidekick config', e);
          }
          // apply base config
          Object.assign(window.hlx.sidekickConfig, baseConfig);
          window.hlx.initSidekick();
        }
      }
    });
    document.head.append(moduleScript);
  } else if (window.hlx.sidekick) {
    // sidekick already loaded > toggle
    window.hlx.sidekick.toggle();
  }
})();
