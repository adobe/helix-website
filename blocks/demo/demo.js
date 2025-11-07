/**
 * Decorates the demo block
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // Create intersection observer for entrance animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('enter');
      }
    });
  });

  // Transform each row into a card
  block.querySelectorAll(':scope > div').forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');

    if (cells.length >= 3) {
      // Expected structure: image | heading | description
      const [imageCell, headingCell, descriptionCell] = cells;

      // Add card class to the row
      row.classList.add('demo-card');

      // Extract and structure content
      const picture = imageCell.querySelector('picture');
      const heading = headingCell.querySelector('h3') || headingCell;
      const description = descriptionCell;

      // Clear row and rebuild structure
      row.innerHTML = '';

      // Add image
      if (picture) {
        const imageWrapper = document.createElement('div');
        imageWrapper.classList.add('demo-card-image');
        imageWrapper.append(picture);
        row.append(imageWrapper);
      }

      // Add content container
      const content = document.createElement('div');
      content.classList.add('demo-card-content');

      // Add heading
      if (heading) {
        const headingWrapper = document.createElement('div');
        headingWrapper.classList.add('demo-card-heading');
        if (heading.tagName === 'H3') {
          headingWrapper.append(heading);
        } else {
          const h3 = document.createElement('h3');
          h3.textContent = heading.textContent;
          headingWrapper.append(h3);
        }
        content.append(headingWrapper);
      }

      // Add description
      if (description) {
        const descriptionWrapper = document.createElement('div');
        descriptionWrapper.classList.add('demo-card-description');
        descriptionWrapper.append(...description.childNodes);
        content.append(descriptionWrapper);
      }

      row.append(content);

      // Observe for entrance animation
      observer.observe(row);
    }
  });
}
