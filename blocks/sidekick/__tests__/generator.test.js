import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import decorate from '../generator.js';

const mock = await readFile({ path: './generator.mock.html' });
document.body.innerHTML = mock;

const generator = document.querySelector('.sidekick-generator');
decorate(generator);

describe('Sidekick Generator', () => {
  it.only('has a form', () => {
    const form = generator.querySelector('form');
    expect(form).to.exist;
    const giturl = generator.querySelector('form input#giturl');
    expect(giturl).to.exist;
    const submit = generator.querySelector('form button#generator');
    expect(submit).to.exist;
  });

  it.only('displays a sidekick bookmarklet link', () => {
    generator.querySelector('form input#giturl').value = 'https://github.com/adobe/foo-website';
    generator.querySelector('form input#project').value = 'Foo';
    generator.querySelector('form button#generator').click();
    const bookmark = generator.querySelector('a#bookmark');
    expect(bookmark).to.exist;
    expect(bookmark.textContent).to.equal('Foo Sidekick');
  });
});
