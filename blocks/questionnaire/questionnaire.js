import { createTag } from '../../scripts/scripts.js';
import { toClassName, readBlockConfig } from '../../scripts/lib-franklin.js';

function toCamelCase(string) {
  return toClassName(string).replace(/-([a-z])/g, (s) => s[1].toUpperCase());
}

async function fetchSheet(source) {
  const { pathname, search } = new URL(source);
  if (pathname) {
    const req = await fetch(`${pathname}${search}`);
    const res = await req.json();
    return res;
  }
  return {};
}

async function fetchQuestionnaire(source) {
  const { data } = await fetchSheet(source);
  if (data.length) return { questions: data };
  return {};
}

function updateSliderValue(input, index) {
  const min = parseFloat(input.min, 10);
  const max = parseFloat(input.max, 10);
  const step = parseFloat(input.step, 10);
  const steps = Math.ceil((max - min) / step) + 1; // + 1 to make range inclusive
  const values = [...Array(steps)].map((_, i) => (i * step) + min);
  input.value = values[index];
}

function buildQuestion(q) {
  const wrapper = createTag('div', { class: 'question' });
  const name = toClassName(q.Question);
  const label = createTag('label', { for: name }, q.Question);
  // TODO: allow authoring of range, calculate step from options and range
  const input = createTag('input', {
    type: 'range', name, id: name, min: -1, max: 1, step: 0.5, value: 0,
  });
  Object.keys(q).forEach((choice) => {
    // eslint-disable-next-line eqeqeq
    if (q[choice] == parseInt(q[choice], 10)) {
      input.dataset[toCamelCase(choice)] = q[choice];
    }
  });
  const score = createTag('p', { class: 'score' });
  // TODO: move strings out of code
  const scores = ['strongly disagree', 'disagree', 'no opinion', 'agree', 'strongly agree'];
  scores.forEach((s, i) => {
    const span = createTag('span', {}, s);
    span.addEventListener('click', () => updateSliderValue(input, i));
    score.append(span);
  });
  wrapper.append(label, input, score);
  return wrapper;
}

function calculateResults(e) {
  const qs = [...e.target.querySelectorAll('input')].map((i) => ({
    id: i.id, multipliers: i.dataset, value: parseFloat(i.value, 10),
  }));
  const results = {};
  qs.forEach((q) => {
    Object.keys(q.multipliers).forEach((key) => {
      const multiplier = parseFloat(q.multipliers[key], 10);
      const value = multiplier * parseFloat(q.value, 10);
      if (results[key]) results[key] += value;
      else results[key] = value;
    });
  });
  return Object.entries(results).sort((a, b) => b[1] - a[1]);
}

function buildBadge(score, i) {
  let text;
  // TODO: move strings out of code, programatically set score ranges
  if (!i && score > 0) text = 'Best Match';
  else if (score > 2.5) text = 'Great Match';
  else if (score > 0) text = 'Good Match';
  // don't create a badge for a bad match
  if (!text) return null;
  const badge = createTag('p', { class: `badge ${text.split(' ')[0].toLowerCase()}` }, text);
  return badge;
}

function oraganizeResults(e, options) {
  const results = calculateResults(e);
  options.forEach((o) => {
    // reset options
    o.querySelector('details').open = false;
    const oldBadge = o.querySelector('.badge');
    if (oldBadge) oldBadge.remove();
    // sort options based on results
    const match = results.find((r) => o.classList.contains(r[0]));
    o.style.order = match ? results.indexOf(match) + 1 : options.length;
    if (match) {
      const resultIndex = results.indexOf(match);
      if (resultIndex === 0) o.querySelector('details').open = true;
      const score = match[1];
      // build badge
      const badge = buildBadge(score, resultIndex);
      if (badge) {
        const summary = o.querySelector('summary');
        summary.append(badge);
      }
    }
    o.setAttribute('aria-hidden', false);
  });
}

function rebuildResult(div) {
  const [label, body] = div.children;
  // convert result to accordion
  const details = createTag('details');
  const summary = createTag('summary', {}, `<p>${label.textContent}</p>`);
  // decorate body
  const logo = body.querySelector('img');
  if (logo) {
    body.className = 'has-logo';
    logo.closest('p').className = 'logo';
  }
  details.append(summary, body);
  return details;
}

export default async function decorate(block) {
  const { rubric } = readBlockConfig(block);
  if (rubric) {
    // label and restructure results
    const results = [...block.children].slice(1);
    // eslint-disable-next-line no-return-assign
    results.forEach((r) => {
      r.setAttribute('aria-hidden', true);
      r.className = `result ${toCamelCase(r.firstElementChild.textContent)}`;
      const accordion = rebuildResult(r);
      r.innerHTML = '';
      r.append(accordion);
    });
    // build questionnaire
    const row = block.firstElementChild;
    row.innerHTML = '';
    const data = await fetchQuestionnaire(rubric);
    const form = createTag('form');
    data.questions.forEach((d) => {
      const q = buildQuestion(d);
      form.append(q);
    });
    // TODO: move string out of code
    const button = createTag('button', { type: 'submit' }, 'Find Your Path');
    // TODO: submit raw data to sheet ("Share my results with Adobe")
    form.append(button);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      oraganizeResults(e, results);
    });
    row.append(form);
  }
}
