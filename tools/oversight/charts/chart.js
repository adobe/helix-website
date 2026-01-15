export default class AbstractChart {
  constructor(dataChunks, elems) {
    this.chartConfig = {};
    this.dataChunks = dataChunks;
    this.elems = elems;
    this.chart = {};

    const themeObserver = new MutationObserver(() => {
      this.updateColorScheme();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  set config(config) {
    this.chartConfig = config;
  }

  get config() {
    return this.chartConfig || {};
  }

  render() {
    throw new Error('render method must be implemented', this);
  }

  async draw() {
    throw new Error('draw method must be implemented', this);
  }

  /**
   * Update chart colors when color scheme changes.
   * Override in subclasses to update specific chart colors.
   */
  // eslint-disable-next-line class-methods-use-this
  updateColorScheme() {
    // Default implementation does nothing
    // Subclasses should override to update their specific colors
  }
}
