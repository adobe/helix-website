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
   * Returns the share URL for the sidekick extension.
   * @private
   * @param {Object} config The sidekick configuration
   * @returns {string} The share URL
   */
  function getShareUrl(config) {
    const { owner, repo, ref } = config;
    const shareUrl = new URL('https://www.aem.live/tools/sidekick/');
    shareUrl.search = new URLSearchParams([
      ['giturl', `https://github.com/${owner}/${repo}/tree/${ref}`],
    ]).toString();
    return shareUrl.toString();
  }

  /**
   * Warns the bookmarklet user about the deprecation of the
   * sidekick bookmarklet.
   * @private
   */
  function showDeprecationWarning() {
    const EXT_HINT = 'hlxSidekickBookmarkletDeprecation';

    if (navigator.userAgent.includes('Headless')) {
      return;
    }

    const installUrl = getShareUrl(window.hlx.sidekickConfig);
    const installButtonText = 'Install now';

    const installButton = document.createElement('button');
    installButton.textContent = installButtonText;
    installButton.title = installButtonText;
    installButton.addEventListener('click', () => {
      window.open(installUrl);
    });

    window.hlx.sidekick.showModal(
      [
        'The Sidekick bookmarklet is no longer supported.',
        `Switch to the Sidekick extension today to stay productive.`,
        installButton,
      ],
      true,
      1,
      () => {
        window.hlx.sidekick.replaceWith('');
        delete window.hlx.sidekick;
      },
    );
  }

  if (!window.hlx || !window.hlx.sidekick) {
    window.hlx = window.hlx || {};
    const appScript = document.getElementById('hlx-sk-app');
    // load sidekick module
    const moduleScript = document.createElement('script');
    moduleScript.id = 'hlx-sk-module';
    moduleScript.src = (appScript && appScript.getAttribute('src').replace('app.js', 'module.js'))
      || 'https://www.hlx.live/tools/sidekick/module.js';
    moduleScript.type = 'module';
    moduleScript.addEventListener('load', async () => {
      // get base config from script data attribute
      const baseConfig = (appScript
        && appScript.dataset.config
        && JSON.parse(appScript.dataset.config)) || {};
      // extract and validate base config
      const { owner, repo } = baseConfig;
      baseConfig.scriptUrl = appScript.getAttribute('src');
      if (owner && repo) {
        // load sidekick
        window.hlx.sidekickConfig = baseConfig;
        window.hlx.initSidekick();
      }
      window.hlx.sidekick.addEventListener('contextloaded', () => {
        showDeprecationWarning();
      }, { once: true });
    });
    document.head.append(moduleScript);
  } else if (window.hlx.sidekick) {
    // sidekick already loaded > toggle
    window.hlx.sidekick.toggle();
  }
})();
