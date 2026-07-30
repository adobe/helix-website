import { loadCSS } from './aem.js';
import parsePluginParams from './plugin-params.js';

/**
 * Loads a non-block generic module, invoking its default export with the given args.
 * @param {string} name The module name
 * @param {string} jsPath The JS file to load
 * @param {string} [cssPath] An optional CSS file to load
 * @param {object[]} [args] Parameters to be passed to the default export when it is called
 */
async function loadModule(name, jsPath, cssPath, ...args) {
  const cssLoaded = cssPath ? loadCSS(cssPath) : Promise.resolve();
  const decorationComplete = jsPath
    ? new Promise((resolve) => {
      (async () => {
        let mod;
        try {
          mod = await import(jsPath);
          if (mod.default) {
            await mod.default.apply(null, args);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(`failed to load module for ${name}`, error);
        }
        resolve(mod);
      })();
    })
    : Promise.resolve();
  return Promise.all([cssLoaded, decorationComplete])
    .then(([, api]) => api);
}

/**
 * Registry of lazily-loaded, conditionally-triggered plugins, keyed by phase
 * (eager/lazy/delayed). Ported from lib-franklin.js — aem.js has no equivalent,
 * so this lives here as website-local code. The execution context (the set of
 * helper functions plugins are called with) is supplied by scripts.js, since it
 * includes site-local functions like getAllMetadata that aem.js doesn't export.
 */
export default class PluginsRegistry {
  #plugins;

  #context;

  constructor(context) {
    this.#plugins = new Map();
    this.#context = context;
  }

  // Register a new plugin
  add(id, config) {
    const { id: pluginId, config: pluginConfig } = parsePluginParams(id, config);
    this.#plugins.set(pluginId, pluginConfig);
  }

  // Get the plugin
  get(id) { return this.#plugins.get(id); }

  // Check if the plugin exists
  includes(id) { return !!this.#plugins.has(id); }

  // Load all plugins that are referenced by URL, and updated their configuration with the
  // actual API they expose
  async load(phase) {
    [...this.#plugins.entries()]
      .filter(([, plugin]) => plugin.condition
      && !plugin.condition(document, plugin.options, this.#context))
      .map(([id]) => this.#plugins.delete(id));
    return Promise.all([...this.#plugins.entries()]
      // Filter plugins that don't match the execution conditions
      .filter(([, plugin]) => (
        (!plugin.condition || plugin.condition(document, plugin.options, this.#context))
        && phase === plugin.load && plugin.url
      ))
      .map(async ([key, plugin]) => {
        try {
          // If the plugin has a default export, it will be executed immediately
          const pluginApi = (await loadModule(
            key,
            !plugin.url.endsWith('.js') ? `${plugin.url}/${key}.js` : plugin.url,
            !plugin.url.endsWith('.js') ? `${plugin.url}/${key}.css` : null,
            document,
            plugin.options,
            this.#context,
          )) || {};
          this.#plugins.set(key, { ...plugin, ...pluginApi });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Could not load specified plugin', key);
        }
      }));
  }

  // Run a specific phase in the plugin
  async run(phase) {
    return [...this.#plugins.values()]
      .reduce((promise, plugin) => ( // Using reduce to execute plugins sequencially
        plugin[phase] && (!plugin.condition
            || plugin.condition(document, plugin.options, this.#context))
          ? promise.then(() => plugin[phase](document, plugin.options, this.#context))
          : promise
      ), Promise.resolve());
  }
}
