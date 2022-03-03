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
  if (!window.hlx || !window.hlx.importer) {
    window.hlx = window.hlx || {};

    const appScript = document.getElementById('hlx-importer-app');
    if (!appScript) {
      console.error('Invalid bookmarklet to start the app, missing hlx-importer-app id');
      return;
    }

    const host = appScript.getAttribute('src').replace('/app.js', '').split('?')[0];
    const moduleScript = document.createElement('script');
    moduleScript.id = 'hlx-importer-module';
    moduleScript.src = `${host}/module.js`;
    const config = JSON.parse(appScript.dataset.config || '{}');
    moduleScript.addEventListener('load', () => {
      window.hlx.initImporter({
        importFileURL: 'http://localhost:3000/tools/importer/import.js', // default
        host,
        ...config,
      });
    });

    moduleScript.addEventListener('error', () => {
      console.error('failed to load importer module');
    });
    document.head.append(moduleScript);
  } else if (window.hlx.importer) {
    window.hlx.importer.toggle();
  }
})();
