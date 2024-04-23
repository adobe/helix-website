
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
    const uls = row.querySelectorAll('ul');

    const parents = [];
    const div = document.createElement('div');
    div.classList.add('sets');
    [...uls].forEach((ul) => {
      parents.push(ul.parentElement);
      div.append(ul);
    });
    row.append(div);

    parents.forEach((p) => p.remove());

    if (title) {
      const parent = title.parentElement;
      row.prepend(title);
      parent.remove();
    }

    row.prepend(document.createElement('span'));
    row.prepend(document.createElement('span'));
  });
}