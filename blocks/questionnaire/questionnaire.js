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

function updateSliderValue(input, index, options) {
  const min = parseFloat(input.min, 10);
  const max = parseFloat(input.max, 10);
  const step = (max - min) / (options - 1);
  const values = [...Array(options)].map((_, i) => min + (i * step));
  input.value = values[index];
}

function buildQuestion(q) {
  const wrapper = createTag('div', { class: 'question' });
  const name = toClassName(q.Question);
  const label = createTag('label', { for: name }, q.Question);
  // TODO: allow authoring of range, calculate step from options and range
  const input = createTag('input', {
    type: 'range', name, id: name, min: -1, max: 1, step: 0.25, value: 0,
  });
  Object.keys(q).forEach((choice) => {
    input.dataset[toCamelCase(choice)] = q[choice];
  });
  // if URL query string has a value, set the input value
  const url = new URL(window.location);
  const params = new URLSearchParams(url.search);
  if (params.has(name)) input.value = params.get(name);

  const score = createTag('p', { class: 'score' });
  // TODO: move strings out of code
  const scores = ['strongly disagree', 'disagree', 'no opinion', 'agree', 'strongly agree'];
  scores.forEach((s, i) => {
    const span = createTag('span', {}, s);
    span.addEventListener('click', () => updateSliderValue(input, i, scores.length));
    score.append(span);
  });
  wrapper.append(label, input, score);
  return wrapper;
}

/**
 * Returns a function that calculates a score based on a multiplier
 * The multiplier is a string that starts with a prefix and ends with a number
 * The prefix can be '+', '-', '--', '++' or nothing (default to '+')
 * The number is a float (default to 0)
 * @param {string} scoreMultiplier the multiplier string
 * @returns {function} a function that takes a value and returns a score
 */
function scoreFn(scoreMultiplier) {
  const [numstring] = scoreMultiplier.match(/[\d.]+/) || ['0']; // default to 0
  const numvalue = parseFloat(numstring, 10);
  const prefix = (scoreMultiplier.match(/^[^\d]+/) || ['+'])[0]; // default to '+'
  const multipliers = {
    '+': (value) => value * numvalue, // more is better, less is worse
    '-': (value) => value * -numvalue, // less is better, more is worse
    '--': (value) => (value < 0 ? value * -numvalue : 0), // less is better, more is neutral
    '++': (value) => (value > 0 ? value * numvalue : 0), // more is better, less is neutral
  };
  return multipliers[prefix] || multipliers['+'];
}

function calculateResults(e) {
  const aggregatedScores = [...e.target.querySelectorAll('input')]
    // get all questions and their answers
    .map((i) => ({
      id: i.id, multipliers: i.dataset, value: parseFloat(i.value, 10),
    }))
    // calculate scores for each answer
    .map((q) => Object.fromEntries(
      Object
        .entries(q.multipliers)
        .map(([answerKey, scoreMultiplier]) => [
          answerKey,
          scoreFn(scoreMultiplier)(q.value)]),
    ))
    // aggregate scores for each answer
    .reduce((answerScores, questionScores) => {
      Object.entries(questionScores).forEach(([answerKey, answerScore]) => {
        if (answerScores[answerKey] !== undefined) answerScores[answerKey] += answerScore;
        else answerScores[answerKey] = answerScore;
      });
      return answerScores;
    }, {});
  // sort aggregated scores
  return Object
    .entries(aggregatedScores)
    .filter(([, score]) => !Number.isNaN(score))
    .sort(([, aScore], [, bScore]) => (
      // randomize order of equal scores
      bScore === aScore ? Math.random() - 0.5
        : bScore - aScore));
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

function organizeResults(e, options) {
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
      organizeResults(e, results);
    });

    form.addEventListener('change', (e) => {
      // push state to update URL
      const url = new URL(window.location);
      const params = new URLSearchParams(url.search);
      params.set(e.target.id, e.target.value);
      url.search = params;
      window.history.pushState({}, '', url);
    });
    row.append(form);
    // if the URL has query strings, submit the form, so that there is a
    // permalink to the results
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);
    if (params.toString()) form.dispatchEvent(new Event('submit'));
  }
}
