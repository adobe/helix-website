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
// eslint-disable-next-line import/no-cycle
import {
  debug,
  getMetadata,
  toClassName,
} from './index.js';

const DOMAIN_KEY_NAME = 'aem-domainkey';

class AemExperimentationBar extends HTMLElement {
  connectedCallback() {
    // Create a shadow root
    const shadow = this.attachShadow({ mode: 'open' });

    const cssPath = new URL(new Error().stack.split('\n')[2].match(/[a-z]+?:\/\/.*?\/[^:]+/)[0]).pathname.replace('preview.js', 'preview.css');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    link.onload = () => {
      shadow.querySelector('.hlx-preview-overlay').removeAttribute('hidden');
    };
    shadow.append(link);
    shadow.append(link);

    const el = document.createElement('div');
    el.className = 'hlx-preview-overlay';
    shadow.append(el);
  }
}
customElements.define('aem-experimentation-bar', AemExperimentationBar);

function watchForAddedExperiences(ns, cb) {
  let { length } = ns;
  window.setInterval(() => {
    if (length !== ns.length) {
      const diff = length - ns.length;
      length = ns.length;
      ns.slice(diff).map((c) => cb(c));
    }
  }, 1000);
}

function createPreviewOverlay() {
  const overlay = document.createElement('aem-experimentation-bar');
  return overlay;
}

function getOverlay() {
  let overlay = document.querySelector('aem-experimentation-bar')?.shadowRoot.children[1];
  if (!overlay) {
    const el = createPreviewOverlay();
    const style = document.createElement('style');
    style.textContent = `
      .hlx-highlight {
        --highlight-size: .5rem;
      
        outline-color: #888;
        outline-offset: calc(-1 * var(--highlight-size));
        outline-style: dashed;
        outline-width: var(--highlight-size);
        background-color: #8882;
      }`;
    el.prepend(style);
    document.body.prepend(el);
    [, overlay] = el.shadowRoot.children;
  }
  return overlay;
}

function createButton(label) {
  const button = document.createElement('button');
  button.className = 'hlx-badge';
  const text = document.createElement('span');
  text.innerHTML = label;
  button.append(text);
  return button;
}

function createPopupItem(item) {
  const actions = typeof item === 'object'
    ? item.actions.map((action) => (action.href
      ? `<div class="hlx-button"><a href="${action.href}">${action.label}</a></div>`
      : `<div class="hlx-button"><a href="#">${action.label}</a></div>`))
    : [];
  const div = document.createElement('div');
  div.className = `hlx-popup-item${item.isSelected ? ' is-selected' : ''}`;
  div.innerHTML = `
    <h5 class="hlx-popup-item-label">${typeof item === 'object' ? item.label : item}</h5>
    ${item.description ? `<div class="hlx-popup-item-description">${item.description}</div>` : ''}
    ${actions.length ? `<div class="hlx-popup-item-actions">${actions}</div>` : ''}`;
  const buttons = [...div.querySelectorAll('.hlx-button a')];
  item.actions?.forEach((action, index) => {
    if (action.onclick) {
      buttons[index].addEventListener('click', action.onclick);
    }
  });
  return div;
}

function createPopupDialog(header, items = []) {
  const actions = typeof header === 'object'
    ? (header.actions || []).map((action) => (action.href
      ? `<div class="hlx-button"><a href="${action.href}">${action.label}</a></div>`
      : `<div class="hlx-button"><a href="#">${action.label}</a></div>`))
    : [];
  const popup = document.createElement('div');
  popup.className = 'hlx-popup hlx-hidden';
  popup.innerHTML = `
    <div class="hlx-popup-header">
      <h5 class="hlx-popup-header-label">${typeof header === 'object' ? header.label : header}</h5>
      ${header.description ? `<div class="hlx-popup-header-description">${header.description}</div>` : ''}
      ${actions.length ? `<div class="hlx-popup-header-actions">${actions}</div>` : ''}
    </div>
    <div class="hlx-popup-items"></div>`;
  const list = popup.querySelector('.hlx-popup-items');
  items.forEach((item) => {
    list.append(createPopupItem(item));
  });
  const buttons = [...popup.querySelectorAll('.hlx-popup-header-actions .hlx-button a')];
  header.actions?.forEach((action, index) => {
    if (action.onclick) {
      buttons[index].addEventListener('click', action.onclick);
    }
  });
  return popup;
}

function createPopupButton(label, header, items, eventListeners = {}) {
  const button = createButton(label);
  const popup = createPopupDialog(header, items);
  button.innerHTML += '<span class="hlx-open"></span>';
  button.append(popup);
  button.addEventListener('click', (ev) => {
    if (ev.target.closest('.hlx-popup')) {
      return;
    }
    getOverlay().querySelectorAll('.hlx-badge .hlx-popup:not(.hlx-hidden)').forEach((el) => {
      if (el !== popup) {
        el.classList.toggle('hlx-hidden', true);
      }
    });
    popup.classList.toggle('hlx-hidden');
  });
  Object.entries(eventListeners).forEach(([evt, listener]) => {
    button.addEventListener(evt, listener);
  });
  return button;
}

// eslint-disable-next-line no-unused-vars
function createToggleButton(label) {
  const button = document.createElement('div');
  button.className = 'hlx-badge';
  button.role = 'button';
  button.setAttribute('aria-pressed', false);
  button.setAttribute('tabindex', 0);
  const text = document.createElement('span');
  text.innerHTML = label;
  button.append(text);
  button.addEventListener('click', () => {
    button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') === 'false');
  });
  return button;
}

const percentformat = new Intl.NumberFormat('en-US', { style: 'percent', maximumSignificantDigits: 3 });
const countformat = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 2 });
const significanceformat = {
  format: (value) => {
    if (value < 0.005) {
      return 'highly significant';
    }
    if (value < 0.05) {
      return 'significant';
    }
    if (value < 0.1) {
      return 'marginally significant';
    }
    return 'not significant';
  },
};
const bigcountformat = {
  format: (value) => {
    if (value > 1000000) {
      return `${countformat.format(value / 1000000)}M`;
    }
    if (value > 1000) {
      return `${countformat.format(value / 1000)}K`;
    }
    return countformat.format(value);
  },
};

function createVariant(experiment, variantName, config, options) {
  const selectedVariant = config?.selectedVariant || config?.variantNames[0];
  const variant = config.variants[variantName];
  const split = variant.percentageSplit;
  const percentage = percentformat.format(split);

  const experimentURL = new URL(window.location.href);
  // this will retain other query params such as ?rum=on
  experimentURL.searchParams.set(options.experimentsQueryParameter, `${experiment}/${variantName}`);

  return {
    label: `<code>${variant.label}</code>`,
    description: `
      <p>${variantName}</p>
      <p class="percentage">(${percentage} split)</p>
      <p class="performance"></p>`,
    actions: [{ label: 'Simulate', href: experimentURL.href }],
    isSelected: selectedVariant === variantName,
  };
}

async function fetchRumData(experiment, options) {
  if (!options.domainKey) {
    // eslint-disable-next-line no-console
    console.warn('Cannot show RUM data. No `domainKey` configured.');
    return null;
  }
  if (!options.prodHost && (typeof options.isProd !== 'function' || !options.isProd())) {
    // eslint-disable-next-line no-console
    console.warn('Cannot show RUM data. No `prodHost` configured or custom `isProd` method provided.');
    return null;
  }

  // the query is a bit slow, so I'm only fetching the results when the popup is opened
  const resultsURL = new URL('https://helix-pages.anywhere.run/helix-services/run-query@v3/rum-experiments');
  // restrict results to the production host, this also reduces query cost
  if (typeof options.isProd === 'function' && options.isProd()) {
    resultsURL.searchParams.set('url', window.location.host);
  } else if (options.prodHost) {
    resultsURL.searchParams.set('url', options.prodHost);
  }
  resultsURL.searchParams.set('domainkey', options.domainKey);
  resultsURL.searchParams.set('experiment', experiment);
  resultsURL.searchParams.set('conversioncheckpoint', options.conversionName);

  const response = await fetch(resultsURL.href);
  if (!response.ok) {
    return null;
  }

  const { results } = await response.json();
  const { data } = results;
  if (!data.length) {
    return null;
  }

  const numberify = (obj) => Object.entries(obj).reduce((o, [k, v]) => {
    o[k] = Number.parseFloat(v);
    o[k] = Number.isNaN(o[k]) ? v : o[k];
    return o;
  }, {});

  const variantsAsNums = data.map(numberify);
  const totals = Object.entries(
    variantsAsNums.reduce((o, v) => {
      Object.entries(v).forEach(([k, val]) => {
        if (typeof val === 'number' && Number.isInteger(val) && k.startsWith('variant_')) {
          o[k] = (o[k] || 0) + val;
        } else if (typeof val === 'number' && Number.isInteger(val) && k.startsWith('control_')) {
          o[k] = val;
        }
      });
      return o;
    }, {}),
  ).reduce((o, [k, v]) => {
    o[k] = v;
    const vkey = k.replace(/^(variant|control)_/, 'variant_');
    const ckey = k.replace(/^(variant|control)_/, 'control_');
    const tkey = k.replace(/^(variant|control)_/, 'total_');
    if (!Number.isNaN(o[ckey]) && !Number.isNaN(o[vkey])) {
      o[tkey] = o[ckey] + o[vkey];
    }
    return o;
  }, {});
  const richVariants = variantsAsNums
    .map((v) => ({
      ...v,
      allocation_rate: v.variant_experimentations / totals.total_experimentations,
    }))
    .reduce((o, v) => {
      const variantName = v.variant;
      o[variantName] = v;
      return o;
    }, {
      control: {
        variant: 'control',
        ...Object.entries(variantsAsNums[0]).reduce((k, v) => {
          const [key, val] = v;
          if (key.startsWith('control_')) {
            k[key.replace(/^control_/, 'variant_')] = val;
          }
          return k;
        }, {}),
      },
    });
  const winner = variantsAsNums.reduce((w, v) => {
    if (v.variant_conversion_rate > w.conversion_rate && v.p_value < 0.05) {
      w.conversion_rate = v.variant_conversion_rate;
      w.p_value = v.p_value;
      w.variant = v.variant;
    }
    return w;
  }, { variant: 'control', p_value: 1, conversion_rate: 0 });

  return {
    richVariants,
    totals,
    variantsAsNums,
    winner,
  };
}

function populatePerformanceMetrics(div, config, {
  richVariants, totals, variantsAsNums, winner,
}, conversionName) {
  // add summary
  const summary = div.querySelector('.hlx-info');
  summary.innerHTML = `Showing results for ${bigcountformat.format(totals.total_experimentations)} visits and ${bigcountformat.format(totals.total_conversions)} conversions: `;
  if (totals.total_conversion_events < 500 && winner.p_value > 0.05) {
    summary.innerHTML += ` not yet enough data to determine a winner. Keep going until you get ${bigcountformat.format((500 * totals.total_experimentations) / totals.total_conversion_events)} visits.`;
  } else if (winner.p_value > 0.05) {
    summary.innerHTML += ' no significant difference between variants. In doubt, stick with <code>control</code>.';
  } else if (winner.variant === 'control') {
    summary.innerHTML += ' Stick with <code>control</code>. No variant is better than the control.';
  } else {
    summary.innerHTML += ` <code>${winner.variant}</code> is the winner.`;
  }

  // add traffic allocation to control and each variant
  config.variantNames.forEach((variantName, index) => {
    const variantDiv = getOverlay().querySelectorAll('.hlx-popup-item')[index];
    const percentage = variantDiv.querySelector('.percentage');
    percentage.innerHTML = `
      <span title="${countformat.format(richVariants[variantName].variant_conversion_events)} real events">${bigcountformat.format(richVariants[variantName].variant_conversions)} ${conversionName} events</span> /
      <span title="${countformat.format(richVariants[variantName].variant_experimentation_events)} real events">${bigcountformat.format(richVariants[variantName].variant_experimentations)} visits</span>
      <span>(${percentformat.format(richVariants[variantName].variant_experimentations / totals.total_experimentations)} split)</span>
    `;
  });

  // add click rate and significance to each variant
  variantsAsNums.forEach((result) => {
    const variant = getOverlay().querySelectorAll('.hlx-popup-item')[config.variantNames.indexOf(result.variant)];
    if (variant) {
      const performance = variant.querySelector('.performance');
      performance.innerHTML = `
        <span>${conversionName} conversion rate: ${percentformat.format(result.variant_conversion_rate)}</span>
        <span>vs. ${percentformat.format(result.control_conversion_rate)}</span>
        <span title="p value: ${result.p_value}" class="significance ${significanceformat.format(result.p_value).replace(/ /, '-')}">${significanceformat.format(result.p_value)}</span>
      `;
    }
  });
}

/**
 * Create Badge if a Page is enlisted in a AEM Experiment
 * @return {Object} returns a badge or empty string
 */
async function decorateExperimentPill({ el, config }, container, options) {
  if (!config) {
    return;
  }
  // eslint-disable-next-line no-console
  debug('preview experiment', config.id);

  const domainKey = window.localStorage.getItem(DOMAIN_KEY_NAME);
  const conversionName = (el.tagName === 'MAIN'
    ? toClassName(getMetadata('conversion-name'))
    : el.dataset.conversionName
  ) || 'click';
  const pill = createPopupButton(
    `Experiment: ${config.id}`,
    {
      label: config.label,
      description: `
        <div class="hlx-details">
          ${config.status}
          ${config.resolvedAudiences ? ', ' : ''}
          ${config.resolvedAudiences && config.resolvedAudiences.length ? config.resolvedAudiences[0] : ''}
          ${config.resolvedAudiences && !config.resolvedAudiences.length ? 'No audience resolved' : ''}
          ${config.variants[config.variantNames[0]].blocks?.length ? ', Blocks: ' : ''}
          ${config.variants[config.variantNames[0]].blocks?.join(',') || ''}
        </div>
        <div class="hlx-info">How is it going?</div>`,
      actions: [
        ...config.manifest ? [{ label: 'Manifest', href: config.manifest }] : [],
        {
          label: '<span style="font-size:2em;line-height:1em">⚙</span>',
          onclick: async () => {
            // eslint-disable-next-line no-alert
            const key = window.prompt(
              'Please enter your domain key:',
              window.localStorage.getItem(DOMAIN_KEY_NAME) || '',
            );
            if (key && key.match(/[a-f0-9-]+/)) {
              window.localStorage.setItem(DOMAIN_KEY_NAME, key);
              const performanceMetrics = await fetchRumData(config.id, {
                ...options,
                domainKey: key,
              });
              if (performanceMetrics === null) {
                return;
              }
              populatePerformanceMetrics(pill, config, performanceMetrics, conversionName);
            } else if (key === '') {
              window.localStorage.removeItem(DOMAIN_KEY_NAME);
            }
          },
        },
      ],
    },
    config.variantNames.map((vname) => createVariant(config.id, vname, config, options)),
    {
      click: (ev) => {
        if (!ev.target.querySelector('.hlx-hidden')) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      },
      mouseenter: () => { el.classList.add('hlx-highlight'); },
      mouseleave: () => {
        document.querySelectorAll('.hlx-highlight')
          .forEach((e) => e.classList.remove('hlx-highlight'));
      },
    },
  );
  if (config.run) {
    pill.classList.add(`is-${toClassName(config.status)}`);
  }
  container.append(pill);
  const performanceMetrics = await fetchRumData(config.id, {
    ...options, conversionName, domainKey,
  });
  if (performanceMetrics === null) {
    return;
  }
  populatePerformanceMetrics(pill, config, performanceMetrics, conversionName);
}

async function decorateExperimentPills(container, options) {
  const ns = window.aem || window.hlx;
  if (!ns?.experiments) {
    return null;
  }

  watchForAddedExperiences(ns.experiments, (c) => decorateExperimentPill(c, container, options));
  return Promise.all(ns.experiments.map((c) => decorateExperimentPill(c, container, options)));
}

function createCampaign(campaign, isSelected, options) {
  const url = new URL(window.location.href);
  if (campaign !== 'default') {
    url.searchParams.set(options.campaignsQueryParameter, campaign);
  } else {
    url.searchParams.delete(options.campaignsQueryParameter);
  }

  return {
    label: `<code>${campaign}</code>`,
    actions: [{ label: 'Simulate', href: url.href }],
    isSelected,
  };
}

/**
 * Create Badge if a Page is enlisted in a AEM Campaign
 * @return {Object} returns a badge or empty string
 */
async function decorateCampaignPill({ el, config }, container, options) {
  if (!config) {
    return;
  }
  const pill = createPopupButton(
    `Campaign: ${config.selectedCampaign || 'default'}`,
    {
      label: 'Campaigns on this page:',
      description: `
        <div class="hlx-details">
          ${config.audiences.length && config.resolvedAudiences?.length ? `Audience: ${config.resolvedAudiences[0]}` : ''}
          ${config.audiences.length && !config.resolvedAudiences?.length ? 'No audience resolved' : ''}
          ${!config.audiences.length || !config.resolvedAudiences ? 'No audience configured' : ''}
        </div>`,
    },
    [
      createCampaign('default', !config.selectedCampaign || config.selectedCampaign === 'default', options),
      ...Object.keys(config.configuredCampaigns)
        .filter((c) => c !== 'audience')
        .map((c) => createCampaign(c, config.selectedCampaign === c, options)),
    ],
    {
      click: (ev) => {
        if (!ev.target.querySelector('.hlx-hidden')) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      },
      mouseenter: () => { el.classList.add('hlx-highlight'); },
      mouseleave: () => {
        document.querySelectorAll('.hlx-highlight')
          .forEach((e) => e.classList.remove('hlx-highlight'));
      },
    },
  );

  if (config.selectedCampaign) {
    pill.classList.add('is-active');
  }
  container.append(pill);
}

async function decorateCampaignPills(container, options) {
  const ns = window.aem || window.hlx;
  if (!ns?.campaigns) {
    return null;
  }

  watchForAddedExperiences(ns.campaigns, (c) => decorateCampaignPill(c, container, options));
  return Promise.all(ns.campaigns.map((c) => decorateCampaignPill(c, container, options)));
}

function createAudience(audience, isSelected, options) {
  const url = new URL(window.location.href);
  url.searchParams.set(options.audiencesQueryParameter, audience);

  return {
    label: `<code>${audience}</code>`,
    actions: [{ label: 'Simulate', href: url.href }],
    isSelected,
  };
}

/**
 * Create Badge if a Page is enlisted in a AEM Audiences
 * @return {Object} returns a badge or empty string
 */
async function decorateAudiencesPill({ el, config }, container, options) {
  if (!config) {
    return;
  }
  const configuredAudienceNames = Object.keys(config.configuredAudiences);
  if (!Object.keys(config.configuredAudiences).length || !Object.keys(options.audiences).length) {
    return;
  }

  const pill = createPopupButton(
    `Audience: ${config.selectedAudience || 'default'}`,
    {
      label: 'Audiences for this page:',
    },
    [
      createAudience('default', !config.selectedAudience || config.selectedAudience === 'default', options),
      ...configuredAudienceNames
        .filter((a) => a !== 'audience')
        .map((a) => createAudience(a, config.selectedAudience === a, options)),
    ],
    {
      click: (ev) => {
        if (!ev.target.querySelector('.hlx-hidden')) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      },
      mouseenter: () => { el.classList.add('hlx-highlight'); },
      mouseleave: () => {
        document.querySelectorAll('.hlx-highlight')
          .forEach((e) => e.classList.remove('hlx-highlight'));
      },
    },
  );

  if (config.selectedAudience) {
    pill.classList.add('is-active');
  }
  container.append(pill);
}

async function decorateAudiencesPills(container, options) {
  const ns = window.aem || window.hlx;
  if (!ns?.audiences) {
    return null;
  }

  watchForAddedExperiences(ns.audiences, (c) => decorateAudiencesPill(c, container, options));
  return Promise.all(ns.audiences.map((c) => decorateAudiencesPill(c, container, options)));
}

/**
 * Decorates Preview mode badges and overlays
 * @return {Object} returns a badge or empty string
 */
export default async function decoratePreviewMode(document, options) {
  try {
    const overlay = getOverlay();

    await decorateAudiencesPills(overlay, options);
    await decorateCampaignPills(overlay, options);
    await decorateExperimentPills(overlay, options);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
}
