# AEM Experience Decisioning

The AEM Experience Decisioning plugin helps you quickly set up experimentation and segmentation on your AEM project. 
It is currently available to customers in collaboration with AEM Engineering via co-innovation VIP Projects. 
To implement experimentation or personalization use-cases, please reach out to the AEM Engineering team in the Slack channel dedicated to your project.

## Features

The AEM Experience Decisioning plugin supports:
- :busts_in_silhouette: serving different content variations to different audiences, including custom audience definitions for your project that can be either resolved directly in-browser or against a trusted backend API.
- :money_with_wings: serving different content variations based on marketing campaigns you are running, so that you can easily track email and/or social campaigns
- :chart_with_upwards_trend: running A/B test experiments on a set of variants to measure and improve the conversion on your site. This works particularly with our :chart: [RUM conversion tracking plugin](https://github.com/adobe/franklin-rum-conversion).
- :rocket: easy simulation of each experience and basic reporting leveraging in-page overlays

## Installation

Add the plugin to your AEM project by running:
```sh
git subtree add --squash --prefix plugins/experience-decisioning git@github.com:adobe/aem-experience-decisioning.git main
```

If you later want to pull the latest changes and update your local copy of the plugin
```sh
git subtree pull --squash --prefix plugins/experience-decisioning git@github.com:adobe/aem-experience-decisioning.git main
```

If you prefer using `https` links you'd replace `git@github.com:adobe/aem-experience-decisioning.git` in the above commands by `https://github.com/adobe/aem-experience-decisioning.git`.

## Project instrumentation

To properly connect and configure the plugin for your project, you'll need to edit your `scripts.js` in your AEM project and add the following:

1. at the start of the file:
    ```js
    const AUDIENCES = {
      mobile: () => window.innerWidth < 600,
      desktop: () => window.innerWidth >= 600,
      // define your custom audiences here as needed
    };

    /**
     * Gets all the metadata elements that are in the given scope.
     * @param {String} scope The scope/prefix for the metadata
     * @returns an array of HTMLElement nodes that match the given scope
     */
    export function getAllMetadata(scope) {
      return [...document.head.querySelectorAll(`meta[property^="${scope}:"],meta[name^="${scope}-"]`)]
        .reduce((res, meta) => {
          const id = toClassName(meta.name
            ? meta.name.substring(scope.length + 1)
            : meta.getAttribute('property').split(':')[1]);
          res[id] = meta.getAttribute('content');
          return res;
        }, {});
    }
    ```
2. if this is the first plugin you add to your project, you'll also need to add:
    ```js
    // Define an execution context
    const pluginContext = {
      getAllMetadata,
      getMetadata,
      loadCSS,
      loadScript,
      sampleRUM,
      toCamelCase,
      toClassName,
    };
    ```
3. Early in the `loadEager` method you'll need to add:
    ```js
    async function loadEager(doc) {
      …
      // Add below snippet early in the eager phase
      if (getMetadata('experiment')
        || Object.keys(getAllMetadata('campaign')).length
        || Object.keys(getAllMetadata('audience')).length) {
        // eslint-disable-next-line import/no-relative-packages
        const { loadEager: runEager } = await import('../plugins/experience-decisioning/src/index.js');
        await runEager.call(pluginContext, { audiences: AUDIENCES });
      }
      …
    }
    ```
    This needs to be done as early as possible since this will be blocking the eager phase and impacting your LCP, so we want this to execute as soon as possible.
4. Finally at the end of the `loadLazy` method you'll have to add:
    ```js
    async function loadLazy(doc) {
      …
      // Add below snippet at the end of the lazy phase
      if ((getMetadata('experiment')
        || Object.keys(getAllMetadata('campaign')).length
        || Object.keys(getAllMetadata('audience')).length)
        && (window.location.hostname.endsWith('hlx.page') || window.location.hostname === ('localhost'))) {
        // eslint-disable-next-line import/no-relative-packages
        const { loadLazy: runLazy } = await import('../plugins/experience-decisioning/src/index.js');
        await runLazy.call(pluginContext, { audiences: AUDIENCES });
      }
    }
    ```
    This is mostly used for the authoring overlay, and as such isn't essential to the page rendering, so having it at the end of the lazy phase is good enough.

### Custom options

There are various aspects of the plugin that you can configure via options you are passing to the 2 main methods above (`runEager`/`runLazy`).
You have already seen the `audiences` option in the examples above, but here is the full list we support:

```js
runEager.call(pluginContext, {
  // Overrides the base path if the plugin was installed in a sub-directory
  basePath: '',

  /* Generic properties */
  // RUM sampling rate on regular AEM pages is 1 out of 100 page views
  // but we increase this by default for audiences, campaigns and experiments
  // to 1 out of 10 page views so we can collect metrics faster of the relative
  // short durations of those campaigns/experiments
  rumSamplingRate: 10,

  /* Audiences related properties */
  // See more details on the dedicated Audiences page linked below
  audiences: {},
  audiencesMetaTagPrefix: 'audience',
  audiencesQueryParameter: 'audience',

  /* Campaigns related properties */
  // See more details on the dedicated Campaigns page linked below
  campaignsMetaTagPrefix: 'campaign',
  campaignsQueryParameter: 'campaign',

  /* Experimentation related properties */
  // See more details on the dedicated Experiments page linked below
  experimentsRoot: '/experiments',
  experimentsConfigFile: 'manifest.json',
  experimentsMetaTag: 'experiment',
  experimentsQueryParameter: 'experiment',
});
```

For detailed implementation instructions on the different features, please read the dedicated pages we have on those topics:
- [Audiences](https://github.com/adobe/aem-experience-decisioning/wiki/Audiences)
- [Campaigns](https://github.com/adobe/aem-experience-decisioning/wiki/Campaigns)
- [Experiments](https://github.com/adobe/aem-experience-decisioning/wiki/Experiments)
