import { createTag } from '../../scripts/scripts.js';
import { toClassName } from '../../scripts/lib-franklin.js';

function toCamelCase(string) {
  return toClassName(string).replace(/-([a-z])/g, (s) => s[1].toUpperCase());
}

async function fetchQuestionnaire(source) {
  const { pathname } = new URL(source);
  if (pathname) {
    const req = await fetch(pathname);
    const res = await req.json();
    const questionnaire = { questions: res.data };
    if (questionnaire.questions.length) {
      questionnaire.choices = Object.keys(res.data[0]).slice(1);
    }
    return questionnaire;
  }
  return {};
}

function buildQuestion(q) {
  const name = toClassName(q.Question);
  const label = createTag('label', { for: name }, q.Question);
  const input = createTag('input', { type: 'checkbox', name, id: name });
  Object.keys(q).forEach((choice) => {
    // eslint-disable-next-line eqeqeq
    if (q[choice] == parseInt(q[choice], 10)) {
      input.dataset[toCamelCase(choice)] = q[choice];
    }
  });
  const span = createTag('span', { class: 'checkbox' });
  label.append(input, span);
  return label;
}

function findPaths(e) {
  const checked = e.target.querySelectorAll('input:checked');
  const results = {};
  checked.forEach((check) => {
    Object.keys(check.dataset).forEach((choice) => {
      const value = parseInt(check.dataset[choice], 10);
      if (results[choice]) {
        results[choice] += value;
      } else {
        results[choice] = value;
      }
    });
  });
  const sorted = Object.entries(results).sort((a, b) => b[1] - a[1]);
  const topMatches = [];
  let count = 0;
  while (count < 3 && sorted[0] && sorted[0][1] && sorted[0][1] > 0) {
    const [choice] = sorted;
    topMatches.push(choice);
    sorted.shift();
    count += 1;
  }
  return topMatches;
}

function displayPaths(e, el, choices) {
  e.preventDefault();
  el.innerHTML = '';
  const paths = findPaths(e);
  paths.forEach((path) => {
    const choice = choices.find((c) => toCamelCase(c) === path[0]);
    const li = createTag('li', {}, choice);
    // TODO: actually present results in a useful way
    el.append(li);
  });
}

export default async function decorate(block) {
  const source = block.querySelector('a[href]');
  block.innerHTML = '';
  if (source) {
    const data = await fetchQuestionnaire(source);
    // build questionnaire
    const form = createTag('form');
    const results = createTag('ol', { class: 'cdn-path-results' });
    form.addEventListener('submit', (e) => displayPaths(e, results, data.choices));
    data.questions.forEach((d) => {
      const q = buildQuestion(d);
      form.append(q);
    });
    // TODO: move string out of code
    const button = createTag('button', { type: 'submit' }, 'Find Your Path');
    form.append(button);
    block.append(form, results);
  }
}
