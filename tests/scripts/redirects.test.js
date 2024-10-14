import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';
import { activateRedirects, getRedirect } from '../../scripts/redirects.js';
/* eslint-env mocha */

document.body.innerHTML = await readFile({ path: './dummy.html' });
document.head.innerHTML = await readFile({ path: './head.html' });

describe.only('Redirects', () => {
  it('loads redirects', async () => {
    const emptyRedirects = [];
    const redirects = await activateRedirects(emptyRedirects);
    expect(redirects).to.deep.equal(emptyRedirects);
  });

  it('applies applies a simple redirect', async () => {
    const exampleRedirects = [
      {
        from: '/foo',
        to: '/bar',
        start: 1,
      },
    ];
    const redirects = await activateRedirects(exampleRedirects);
    const currentURL = new URL('https://example.com/foo');
    const redirect = await getRedirect(redirects, '/foo', currentURL);
    expect(redirect).to.equal('https://example.com/bar?redirect_from=%2Ffoo');
  });

  it('applies applies a redirect with a parameter', async () => {
    const exampleRedirects = [
      {
        from: '/foo/*',
        to: '/bar/*',
        start: 1,
      },
    ];
    const redirects = await activateRedirects(exampleRedirects);
    const currentURL = new URL('https://example.com/foo/baz');
    const redirect = await getRedirect(redirects, '/foo/baz', currentURL);
    expect(redirect).to.equal('https://example.com/bar/baz?redirect_from=%2Ffoo%2Fbaz');
  });

  it('applies applies a redirect with multiple parameters', async () => {
    const exampleRedirects = [
      {
        from: '/foo/*/*',
        to: '/bar/*/baz/*',
        start: 1,
      },
    ];
    const redirects = await activateRedirects(exampleRedirects);
    const currentURL = new URL('https://example.com/foo/fifi/qux');
    const redirect = await getRedirect(redirects, '/foo/fifi/qux', currentURL);
    expect(redirect).to.equal('https://example.com/bar/fifi/baz/qux?redirect_from=%2Ffoo%2Ffifi%2Fqux');
  });

  it('applies applies a redirect with multiple parameters and changed order', async () => {
    const exampleRedirects = [
      {
        from: '/foo/*/*',
        to: '/bar/$2/baz/$1',
        start: 1,
      },
    ];
    const redirects = await activateRedirects(exampleRedirects);
    const currentURL = new URL('https://example.com/foo/fifi/qux');
    const redirect = await getRedirect(redirects, '/foo/fifi/qux', currentURL);
    expect(redirect).to.equal('https://example.com/bar/qux/baz/fifi?redirect_from=%2Ffoo%2Ffifi%2Fqux');
  });
});
