
// const draw = (placeholder, d) => {
//   d.sets.forEach((set) => {
//     const container = document.createElement('div');
//     placeholder.appendChild(container);

//     container.appendChild(document.createElement('span'));
//     container.appendChild(document.createElement('span'));

//     if (set.sets.length === 1) {
//       container.classList.add('circle');
//     } else {
//       container.classList.add('shape');
//     }

//     container.classList.add(set.sets.join(''));
//     const title = document.createElement('h3');
//     title.textContent = set.content.title;
//     container.appendChild(title);

//     const ul = document.createElement('ul');
//     set.content.items.forEach(item => {
//       const li = document.createElement('li');
//       li.textContent = item;
//       ul.appendChild(li);
//     });
//     container.appendChild(ul);

//   });
// };
// draw(document.querySelector('.venn'), data);

export default function decorate(block) {
  block.querySelectorAll('& > div').forEach((row) => {
    console.log('row', row);
    const set = row.firstElementChild.textContent;

    if (!set) {
      return;
    }
    const sets = set.split(' ');
    if (sets.length === 1) {
      row.classList.add('circle');
    } else {
      row.classList.add('shape');
    }
    row.classList.add(sets.join(''));
    row.firstElementChild.remove();
    const title = row.querySelector('h3');
    const list = row.querySelector('ul');

    row.prepend(list);
    if (title) row.prepend(title);
    row.prepend(document.createElement('span'));
    row.prepend(document.createElement('span'));

  });
}