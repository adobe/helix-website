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
    });
    document.head.append(moduleScript);
  } else if (window.hlx.sidekick) {
    // sidekick already loaded > toggle
    window.hlx.sidekick.toggle();
  }
})();
