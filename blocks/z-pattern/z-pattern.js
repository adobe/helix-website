function isOdd(num) { return num % 2 ? 'z-row-odd' : 'z-row-even'; }

export default function init(el) {
  const h2 = el.querySelector('h2');
  if (h2) {
    h2.parentElement.parentElement.classList.add('z-pattern-heading');
  }
  // An empty last div will denote a trailing CTA because the cells are merged
  const lastRow = el.querySelector(':scope > div:last-child > div:last-child');
  if (!lastRow.textContent) {
    lastRow.parentElement.classList.add('z-pattern-cta');
  }
  const zRows = el.querySelectorAll(':scope > div:not([class])');
  zRows.forEach((row, idx) => {
    row.classList.add(isOdd(idx));
  });
}
