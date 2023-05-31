function isOdd(num) { return num % 2 ? 'z-row-odd' : 'z-row-even'; }

const ColorPattern = ['pink', 'purple', 'lightgreen', 'yellow'];

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

    const cells = row.querySelectorAll('div');
    cells.forEach((cell) => {
      if (cell.querySelector('img')) {
        cell.classList.add('image-side');
      } else {
        cell.classList.add('content-side');
      }
    });

    if (el.classList.contains('value-props')) {
      const contentSide = row.querySelector(':scope > div:last-of-type');
      const eyebrow = contentSide.querySelector('p:first-of-type');
      const headline = contentSide.querySelector('h3');
      if (eyebrow) {
        eyebrow.classList.add('icon-eyebrow');
      }
      if (headline) {
        headline.classList.add('main-headline');
      }

      const props = contentSide.querySelectorAll('ul > li');
      props.forEach((prop, index) => {
        prop.classList.add('colored-tag-description');
        const coloredTag = prop.querySelector('strong');
        if (coloredTag) {
          coloredTag.classList.add('colored-tag', ColorPattern[index]);
        }
      });
    }
  });
}
