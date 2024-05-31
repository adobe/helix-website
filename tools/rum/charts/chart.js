export default class AbstractChart {
  constructor(dataChunks, elems) {
    this.chartConfig = {};
    this.dataChunks = dataChunks;
    this.elems = elems;
    this.chart = {};
  }

  set config(config) {
    this.chartConfig = config;
  }

  render() {
    throw new Error('render method must be implemented', this);
  }

  async draw() {
    throw new Error('draw method must be implemented', this);
  }
}
