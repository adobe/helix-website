/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { spy } from 'sinon';
import decorate from '../../../blocks/sidekick-generator/sidekick-generator.js';

const mock = await readFile({ path: './sidekick-generator.mock.html' });

document.body.innerHTML = mock;
window.alert = spy();

describe('Sidekick Generator', () => {
  it('has a form', async () => {
    const generator = document.querySelector('.sidekick-generator');
    await decorate(generator);
    const form = generator.querySelector('form');
    expect(form).to.exist;
    const giturl = generator.querySelector('#giturl');
    expect(giturl).to.exist;
    const submit = generator.querySelector('#generator');
    expect(submit).to.exist;
  });

  it('refuses to run without repository url', async () => {
    const generator = document.querySelector('.sidekick-generator');
    await decorate(generator);
    generator.querySelector('#generator').click();
    expect(window.alert.calledWith('Repository URL is mandatory.')).to.be.true;
  });

  it('works with hlx.page urls', async () => {
    const generator = document.querySelector('.sidekick-generator');
    await decorate(generator);
    generator.querySelector('#giturl').value = 'https://main--a-customer--hlxsites.hlx.page';
    generator.querySelector('#project').value = 'Helix Page';
    generator.querySelector('#generator').click();

    const url = new URL(window.location.href);
    const usp = url.searchParams;
    expect(usp.get('giturl')).to.equal('https://github.com/hlxsites/a-customer/tree/main');
  });

  it('works with hlx.live urls', async () => {
    const generator = document.querySelector('.sidekick-generator');
    await decorate(generator);
    generator.querySelector('#giturl').value = 'https://main--a-customer--hlxsites.hlx.live';
    generator.querySelector('#project').value = 'Helix Page';
    generator.querySelector('#generator').click();

    const url = new URL(window.location.href);
    const usp = url.searchParams;
    expect(usp.get('giturl')).to.equal('https://github.com/hlxsites/a-customer/tree/main');
  });

  it('autoruns with query parameters', async () => {
    window.history.pushState(
      {},
      '',
      `${window.location.href}&from=https%3A%2F%2Fwww.adobe.com%2F&giturl=https%3A%2F%2Fgithub.com%2Fadobe%2Ffoo-website&project=Foo&hlx3=true&token=1234`,
    );
    const generator = document.querySelector('.sidekick-generator');
    await decorate(generator);
    const formContainer = generator.querySelector('#form-container');
    expect(formContainer.parentElement.classList.contains('hidden')).to.be.true;
    const backLink = generator.querySelector(':scope a.back-link');
    expect(backLink).to.exist;
    expect(backLink.href).to.equal('https://www.adobe.com/');
  });

  it('displays project in title', async () => {
    window.history.pushState(
      {},
      '',
      `${window.location.href}&from=https%3A%2F%2Fwww.adobe.com%2F&giturl=https%3A%2F%2Fgithub.com%2Fadobe%2Ffoo-website&project=Foo&hlx3=true&token=1234`,
    );
    const generator = document.querySelector('.sidekick-generator');
    await decorate(generator);
    expect(document.title).to.match(/^Foo/);
  });
});
