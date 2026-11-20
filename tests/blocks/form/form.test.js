/* eslint-disable no-unused-expressions -- chai property assertions (e.g. to.be.null) */
/* global describe it beforeEach afterEach */

import { expect } from '@esm-bundle/chai';
import { createForm, getEndpoint } from '../../../blocks/form/form.js';

const ENDPOINT = 'http://localhost:8787/submit';

const definition = (submit) => ({
  data: [
    {
      Field: 'githubProfile', Label: 'GitHub profile', Type: 'url', Mandatory: 'x', Placeholder: 'https://github.com/you',
    },
    { Field: 'permission', Label: 'Show my profile', Type: 'checkbox' },
    {
      Field: 'category', Label: 'Category', Type: 'select', Options: 'Block, Other',
    },
    {
      Field: 'title', Label: 'Title', Mandatory: 'x', Placeholder: 'Title',
    },
    { Field: 'description', Label: 'Description', Type: 'text-area' },
    {
      Field: 'submit', Label: 'Submit', Type: 'submit', Extra: '#thanks', ...submit,
    },
  ],
});

const waitFor = async (fn) => {
  for (let i = 0; i < 100; i += 1) {
    if (fn()) return;
    // eslint-disable-next-line no-await-in-loop -- polling must run sequentially
    await new Promise((resolve) => { setTimeout(resolve, 10); });
  }
  throw new Error('timed out');
};

describe('Form block', () => {
  let originalFetch;
  let requests;
  let submitResponse;

  async function setup(submit) {
    window.fetch = async (url, opts) => {
      requests.push({ url: String(url), opts });
      if (url === '/test/form.json') return { json: async () => definition(submit) };
      return submitResponse;
    };
    const form = await createForm(`${window.location.origin}/test/form.json`);
    form.addEventListener('submit', (e) => e.preventDefault());
    document.body.append(form);
    form.querySelector('#githubProfile').value = 'https://github.com/octocat';
    form.querySelector('#title').value = 'My Block';
    form.querySelector('#permission').checked = true;
    return form;
  }

  const posts = () => requests.filter((r) => r.opts?.method === 'POST');

  beforeEach(() => {
    originalFetch = window.fetch;
    requests = [];
    submitResponse = { ok: true, status: 202, json: async () => ({ ok: true }) };
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  });

  afterEach(() => {
    window.fetch = originalFetch;
    document.body.innerHTML = '';
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  });

  it('only treats https (or local http) URLs as endpoints', () => {
    expect(getEndpoint('https://intake.example.workers.dev/submit')).to.equal('https://intake.example.workers.dev/submit');
    expect(getEndpoint(ENDPOINT)).to.equal(ENDPOINT);
    expect(getEndpoint('http://example.com/submit')).to.be.null;
    // eslint-disable-next-line no-script-url -- verifies javascript: URLs are rejected
    expect(getEndpoint('javascript:alert(1)')).to.be.null;
    expect(getEndpoint('/tools/bot/register-form')).to.be.null;
    expect(getEndpoint(undefined)).to.be.null;
  });

  it('keeps the legacy forms service when the submit row has no Action', async () => {
    submitResponse = { ok: true, status: 200, text: async () => '' };
    const form = await setup({ Placeholder: '/test/legacy-form' });
    form.querySelector('button').click();
    await waitFor(() => window.location.hash === '#thanks');
    expect(posts()).to.have.length(1);
    expect(posts()[0].url).to.equal('https://form.aem.page/main--helix-website--adobe/test/legacy-form');
  });

  it('only reads the endpoint from Action, not Placeholder', async () => {
    submitResponse = { ok: true, status: 200, text: async () => '' };
    const form = await setup({ Placeholder: ENDPOINT });
    form.querySelector('button').click();
    await waitFor(() => window.location.hash === '#thanks');
    expect(posts()).to.have.length(1);
    expect(posts()[0].url.startsWith('https://form.aem.page/')).to.be.true;
  });

  it('posts the form data to an endpoint, then redirects', async () => {
    const form = await setup({ Action: ENDPOINT });
    form.querySelector('button').click();
    await waitFor(() => window.location.hash === '#thanks');
    expect(posts()).to.have.length(1);
    const [post] = posts();
    expect(post.url).to.equal(ENDPOINT);
    expect(JSON.parse(post.opts.body)).to.deep.equal({
      data: {
        githubProfile: 'https://github.com/octocat',
        permission: 'Yes',
        category: 'Block',
        title: 'My Block',
        description: '',
      },
    });
  });

  it('marks invalid fields on 400 and does not redirect', async () => {
    submitResponse = {
      ok: false,
      status: 400,
      json: async () => ({ ok: false, error: 'invalid', fields: ['title', 'nope'] }),
    };
    const form = await setup({ Action: ENDPOINT });
    const button = form.querySelector('button');
    button.click();
    await waitFor(() => form.querySelector('[role="alert"]'));
    const title = form.querySelector('#title');
    expect(title.getAttribute('aria-invalid')).to.equal('true');
    expect(form.querySelector(`#${title.getAttribute('aria-describedby')}`).textContent).to.not.be.empty;
    expect(form.querySelectorAll('[aria-invalid]')).to.have.length(1);
    expect(document.activeElement).to.equal(title);
    expect(button.hasAttribute('disabled')).to.be.false;
    expect(window.location.hash).to.equal('');

    // a retry clears previous errors
    submitResponse = { ok: true, status: 202, json: async () => ({ ok: true }) };
    button.click();
    await waitFor(() => window.location.hash === '#thanks');
    expect(form.querySelector('[role="alert"], [aria-invalid]')).to.not.exist;
  });

  [403, 429, 500].forEach((status) => {
    it(`shows a generic error on ${status} and does not redirect`, async () => {
      submitResponse = { ok: false, status, json: async () => ({ ok: false }) };
      const form = await setup({ Action: ENDPOINT });
      const button = form.querySelector('button');
      button.click();
      await waitFor(() => form.querySelector('[role="alert"]'));
      expect(form.querySelector('[role="alert"]').textContent).to.contain('try again later');
      expect(form.querySelector('[aria-invalid]')).to.not.exist;
      expect(button.hasAttribute('disabled')).to.be.false;
      expect(window.location.hash).to.equal('');
    });
  });

  it('shows a generic error when the request fails', async () => {
    const form = await setup({ Action: ENDPOINT });
    window.fetch = async () => { throw new TypeError('network'); };
    form.querySelector('button').click();
    await waitFor(() => form.querySelector('[role="alert"]'));
    expect(window.location.hash).to.equal('');
  });
});
