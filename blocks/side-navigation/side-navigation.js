import createTag from '../../utils/tag.js';

export default function decorate(block) {
  const docBtnInner = '<button>📖 Docs</button>';
  const docButton = createTag('div', { class: 'side-navigation-overlay-btn-wrapper' }, docBtnInner);

  const backBtnInner = '<button>← Back</button>';
  const backBtn = createTag('div', { class: 'side-navigation-overlay-btn-wrapper' }, backBtnInner);

  block.parentElement.prepend(docButton);
  block.prepend(backBtn);

  [docButton, backBtn].forEach((btn) => {
    btn.addEventListener('click', () => {
      block.classList.toggle('overlay');
    });
  });

  block.querySelectorAll(':scope > div > div > ul > li').forEach((list) => {
    list.classList.add('list-section');
    list.querySelectorAll(':scope > ul').forEach((listInner) => {
      listInner.classList.add('list-section-inner');

      listInner.querySelectorAll(':scope > li > ul').forEach((nestedList) => {
        const listTarget = nestedList.parentElement;

        nestedList.classList.add('list-section-inner-nested');

        listTarget.classList.add('side-navigation-nested-target', 'collapse');
        listTarget.addEventListener('click', (e) => {
          e.target.classList.toggle('collapse');
        });
      });

      listInner.querySelectorAll(':scope li a').forEach((link) => {
        if (window.location.pathname === link.getAttribute('href')) {
          link.classList.add('active');
        }
      });
    });
  });
}
