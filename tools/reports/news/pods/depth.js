function buildTableEl() {
  const table = document.createElement('table');
  const caption = document.createElement('caption');
  caption.innerHTML = 'Media viewed on the page';
  const body = document.createElement('tbody');
  const foot = document.createElement('tfoot');
  foot.innerHTML = `<tr>
      <td class="metric-sum"><span>End of page</span></td>
    </tr>`;
  table.append(caption, body, foot);
  return table;
}

export default function buildDepthBlock(depths, id) {
  const container = document.getElementById(id);
  if (container) {
    if (container.querySelector('table')) {
      container.querySelector('table').remove();
    }
    const table = buildTableEl();
    container.append(table);
    const body = table.querySelector('tbody');
    depths.forEach((depth) => {
      const rate = depth.value;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <span class="bar" data-value="${rate}" style="width: ${rate}%"></span>
          <span>${rate.toLocaleString()}%</span>
        </td>`;
      body.append(row);
    });
  }
}
