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

function createPreviewOverlay(cls) {
  const overlay = document.createElement('div');
  overlay.className = cls;
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
    ? item.actions.map((action) => `<div class="hlx-button"><a href="${action.href}">${action.label}</a></div>`)
    : [];
  const div = document.createElement('div');
  div.className = `hlx-popup-item${item.isSelected ? ' is-selected' : ''}`;
  div.innerHTML = `
    <h5 class="hlx-popup-item-label">${typeof item === 'object' ? item.label : item}</h5>
    ${item.description ? `<div class="hlx-popup-item-description">${item.description}</div>` : ''}
    ${actions.length ? `<div class="hlx-popup-item-actions">${actions}</div>` : ''}`;
  return div;
}

function createPopupDialog(header, items = []) {
  const actions = typeof header === 'object'
    ? (header.actions || []).map((action) => `<div class="hlx-button"><a href="${action.href}">${action.label}</a></div>`)
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
  return popup;
}

function createPopupButton(label, header, items) {
  const button = createButton(label);
  const popup = createPopupDialog(header, items);
  button.innerHTML += '<span class="hlx-open"></span>';
  button.append(popup);
  button.addEventListener('click', () => {
    popup.classList.toggle('hlx-hidden');
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

function getOverlay() {
  let overlay = document.querySelector('.hlx-preview-overlay');
  if (!overlay) {
    overlay = createPreviewOverlay('hlx-preview-overlay');
    document.body.append(overlay);
  }
  return overlay;
}

const percentformat = new Intl.NumberFormat('en-US', { style: 'percent', maximumSignificantDigits: 2 });
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
    label: `<code>${variantName}</code>`,
    description: `
      <p>${variant.label}</p>
      <p class="percentage">(${percentage} split)</p>
      <p class="performance"></p>`,
    actions: [{ label: 'Simulate', href: experimentURL.href }],
    isSelected: selectedVariant === variantName,
  };
}

async function fetchRumData(experiment, options) {
  // the query is a bit slow, so I'm only fetching the results when the popup is opened
  const resultsURL = new URL('https://helix-pages.anywhere.run/helix-services/run-query@v2/rum-experiments');
  resultsURL.searchParams.set(options.experimentsQueryParameter, experiment);
  if (window.hlx.sidekickConfig && window.hlx.sidekickConfig.host) {
    // restrict results to the production host, this also reduces query cost
    resultsURL.searchParams.set('domain', window.hlx.sidekickConfig.host);
  }

  const response = await fetch(resultsURL.href);
  if (!response.ok) {
    return null;
  }

  const { results } = await response.json();
  if (!results.length) {
    return null;
  }

  const numberify = (obj) => Object.entries(obj).reduce((o, [k, v]) => {
    o[k] = Number.parseFloat(v);
    o[k] = Number.isNaN(o[k]) ? v : o[k];
    return o;
  }, {});

  const variantsAsNums = results.map(numberify);
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
    if (o[ckey] && o[vkey]) {
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
}) {
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
    const variantDiv = document.querySelectorAll('.hlx-popup-item')[index];
    const percentage = variantDiv.querySelector('.percentage');
    percentage.innerHTML = `
      <span title="${countformat.format(richVariants[variantName].variant_conversion_events)} real events">${bigcountformat.format(richVariants[variantName].variant_conversions)} clicks</span> /
      <span title="${countformat.format(richVariants[variantName].variant_experimentation_events)} real events">${bigcountformat.format(richVariants[variantName].variant_experimentations)} visits</span>
      <span>(${percentformat.format(richVariants[variantName].variant_experimentations / totals.total_experimentations)} split)</span>
    `;
  });

  // add click rate and significance to each variant
  variantsAsNums.forEach((result) => {
    const variant = document.querySelectorAll('.hlx-popup-item')[config.variantNames.indexOf(result.variant)];
    if (variant) {
      const performance = variant.querySelector('.performance');
      performance.innerHTML = `
        <span>click rate: ${percentformat.format(result.variant_conversion_rate)}</span>
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
async function decorateExperimentPill(overlay, options, context) {
  const config = window?.hlx?.experiment;
  const experiment = context.toClassName(context.getMetadata(options.experimentsMetaTag));
  if (!experiment || !config) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log('preview experiment', experiment);

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
          ${config.variants[config.variantNames[0]].blocks.length ? ', Blocks: ' : ''}
          ${config.variants[config.variantNames[0]].blocks.join(',')}
        </div>
        <div class="hlx-info">How is it going?</div>`,
      actions: config.manifest ? [{ label: 'Manifest', href: config.manifest }] : [],
    },
    config.variantNames.map((vname) => createVariant(experiment, vname, config, options)),
  );
  pill.classList.add(`is-${context.toClassName(config.status)}`);
  overlay.append(pill);

  const performanceMetrics = await fetchRumData(experiment, options);
  if (performanceMetrics === null) {
    return;
  }
  populatePerformanceMetrics(pill, config, performanceMetrics);
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
async function decorateCampaignPill(overlay, options, context) {
  const campaigns = context.getAllMetadata(options.campaignsMetaTagPrefix);
  if (!Object.keys(campaigns).length) {
    return;
  }

  const usp = new URLSearchParams(window.location.search);
  const forcedAudience = usp.has(options.audiencesQueryParameter)
    ? context.toClassName(usp.get(options.audiencesQueryParameter))
    : null;
  const audiences = campaigns.audience?.split(',').map(context.toClassName) || [];
  const resolvedAudiences = await context.getResolvedAudiences(audiences, options);
  const isActive = forcedAudience
    ? audiences.includes(forcedAudience)
    : (!resolvedAudiences || !!resolvedAudiences.length);
  const campaign = (usp.has(options.campaignsQueryParameter)
    ? context.toClassName(usp.get(options.campaignsQueryParameter))
    : null)
    || (usp.has('utm_campaign') ? context.toClassName(usp.get('utm_campaign')) : null);
  const pill = createPopupButton(
    `Campaign: ${campaign || 'default'}`,
    {
      label: 'Campaigns on this page:',
      description: `
        <div class="hlx-details">
          ${audiences.length && resolvedAudiences?.length ? `Audience: ${resolvedAudiences[0]}` : ''}
          ${audiences.length && !resolvedAudiences?.length ? 'No audience resolved' : ''}
          ${!audiences.length || !resolvedAudiences ? 'No audience configured' : ''}
        </div>`,
    },
    [
      createCampaign('default', !campaign || !isActive, options),
      ...Object.keys(campaigns)
        .filter((c) => c !== 'audience')
        .map((c) => createCampaign(c, isActive && context.toClassName(campaign) === c, options)),
    ],
  );

  if (campaign && isActive) {
    pill.classList.add('is-active');
  }
  overlay.append(pill);
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
async function decorateAudiencesPill(overlay, options, context) {
  const audiences = context.getAllMetadata(options.audiencesMetaTagPrefix);
  if (!Object.keys(audiences).length || !Object.keys(options.audiences).length) {
    return;
  }

  const resolvedAudiences = await context.getResolvedAudiences(
    Object.keys(audiences),
    options,
    context,
  );
  const pill = createPopupButton(
    'Audiences',
    {
      label: 'Audiences for this page:',
    },
    [
      createAudience('default', !resolvedAudiences.length || resolvedAudiences[0] === 'default', options),
      ...Object.keys(audiences)
        .filter((a) => a !== 'audience')
        .map((a) => createAudience(a, resolvedAudiences && resolvedAudiences[0] === a, options)),
    ],
  );

  if (resolvedAudiences.length) {
    pill.classList.add('is-active');
  }
  overlay.append(pill);
}

/**
 * Decorates Preview mode badges and overlays
 * @return {Object} returns a badge or empty string
 */
export default async function decoratePreviewMode(document, options, context) {
  try {
    context.loadCSS(`${options.basePath || window.hlx.codeBasePath}/plugins/experimentation/src/preview.css`);
    const overlay = getOverlay(options);
    await decorateAudiencesPill(overlay, options, context);
    await decorateCampaignPill(overlay, options, context);
    await decorateExperimentPill(overlay, options, context);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
}
