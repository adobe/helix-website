export default function decorate(block) {
  block.querySelectorAll('table tbody tr').forEach((row) => {
    const cell = row.querySelectorAll('td')[1];
    const wrapper = document.createElement('p');
    while (cell.firstChild) {
      wrapper.append(cell.firstChild);
    }
    cell.append(wrapper);
    cell.classList.add('table-grayed');
  });
}
