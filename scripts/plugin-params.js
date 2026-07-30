/**
 * Normalizes the various shapes `PluginsRegistry.add`/`TemplatesRegistry.add` accept
 * (a bare URL string, a config object, or just an id) into a consistent
 * { id, config } pair. Shared by plugins.js and templates.js.
 */
export default function parsePluginParams(id, config) {
  const pluginId = !config
    ? id.split('/').splice(id.endsWith('/') ? -2 : -1, 1)[0].replace(/\.js/, '')
    : id;
  const pluginConfig = {
    load: 'eager',
    ...(typeof config === 'string' || !config
      ? { url: (config || id).replace(/\/$/, '') }
      : config),
  };
  pluginConfig.options ||= {};
  return { id: pluginId, config: pluginConfig };
}
