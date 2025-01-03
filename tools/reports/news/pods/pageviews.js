import BarChart from '../charts/barchart.js';

export default function buildPageViewsChart(dataChunks) {
  // get the context of the canvas element
  const elems = {
    canvas: document.getElementById('page-views-chart'),
  };

  // create the chart
  const chart = new BarChart(dataChunks, elems);

  chart.render();
  chart.draw();
}
