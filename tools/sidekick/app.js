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

  /**
   * Returns the share URL for the sidekick extension.
   * @private
   * @param {Object} config The sidekick configuration
   * @returns {string} The share URL
   */
  function getShareUrl(config) {
    const { owner, repo, ref } = config;
    const shareUrl = new URL('https://www.hlx.live/tools/sidekick/');
    shareUrl.search = new URLSearchParams([
      ['giturl', `https://github.com/${owner}/${repo}/tree/${ref}`],
    ]).toString();
    return shareUrl.toString();
  }

  /**
   * Informs the bookmarklet user about the sidekick extension.
   * @private
   * @param {Object} hint The hint details
   * @param {string[]} hint.browsers The supported browsers
   * @param {string} hint.message The message
   * @param {string} hint.installUrl The URL to open when the install button is clicked
   * @param {string} hint.installButtonText The text on the install button
   * @param {string} hint.laterButtonText The text on the later button
   */
  function showExtensionHint({
    browsers,
    message,
    installUrl,
    installButtonText,
    laterButtonText,
  }) {
    const browser = browsers.find((b) => navigator.userAgent.includes(b));
    if (!browser) {
      return;
    }
    window.hlx.sidekick.addEventListener('contextloaded', () => {
      const EXT_HINT = 'hlxSidekickExtensionHint';
      // respect user choice
      const userChoice = window.localStorage.getItem(EXT_HINT);
      if (userChoice && userChoice * 1 > Date.now()) {
        return;
      }
      // show extension hint
      window.hlx.sidekick.showHelp({
        id: EXT_HINT,
        steps: [{
          message: message.replace('{{browser}}', browser),
        }],
      });
      const laterHandler = () => window.localStorage
        .setItem(EXT_HINT, Date.now() + 259200000 /* +3 days */);
      const ackHandler = () => window.localStorage
        .setItem(EXT_HINT, Date.now() + 31536000000 /* +1 year */);
      const installButton = document.createElement('button');
      installButton.textContent = installButtonText;
      installButton.addEventListener('click', () => {
        window.open(installUrl);
        ackHandler();
      });
      const laterButton = document.createElement('button');
      laterButton.textContent = laterButtonText;
      laterButton.addEventListener('click', laterHandler);

      const helpActions = window.hlx.sidekick.shadowRoot.querySelector('.hlx-sk-overlay .modal .help-actions');
      helpActions.prepend(laterButton);
      helpActions.prepend(installButton);
      installButton.focus();
      window.hlx.sidekick.addEventListener('helpacknowledged', ackHandler);
    });
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
        const { owner, repo } = baseConfig;
        baseConfig.scriptUrl = appScript.getAttribute('src');
        if (owner && repo) {
          // load sidekick
          window.hlx.sidekickConfig = baseConfig;
          window.hlx.initSidekick();

          showExtensionHint({
            browsers: ['Chrome'],
            message: 'Did you know that the Sidekick is also available as a {{browser}} extension?',
            installUrl: getShareUrl(baseConfig),
            installButtonText: 'Show me now',
            laterButtonText: 'Remind me later',
          });
        }
      }
    });
    document.head.append(moduleScript);
  } else if (window.hlx.sidekick) {
    // sidekick already loaded > toggle
    window.hlx.sidekick.toggle();
  }
})();
