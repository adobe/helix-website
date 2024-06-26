/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';
import { track } from './coverage.js';
import { goToAndRunAudience, waitForDomEvent } from './utils.js';

track(test);

test.describe('Page-level audiences', () => {
  test('Replaces the page content with the variant.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/page-level');
    expect(await page.locator('main').textContent()).toContain('Hello v1!');
    await goToAndRunAudience(page, '/tests/fixtures/audiences/page-level--async');
    expect(await page.locator('main').textContent()).toContain('Hello v2!');
  });

  test('Sets a class on the body for the main resolved audience.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/page-level');
    expect(await page.locator('body').getAttribute('class')).not.toContain('audience-default');
    expect(await page.locator('body').getAttribute('class')).toContain('audience-foo');
    expect(await page.locator('body').getAttribute('class')).not.toContain('audience-bar');
  });

  test('Ignores empty audiences.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/page-level--empty');
    expect(await page.locator('main').textContent()).toContain('Hello World!');
    expect(await page.locator('body').getAttribute('class')).toContain('audience-default');
    expect(await page.locator('body').getAttribute('class')).not.toContain('audience-foo');
    expect(await page.locator('body').getAttribute('class')).not.toContain('audience-bar');
  });

  test('Controls the audience shown via query parameters.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/page-level?audience=foo');
    expect(await page.locator('main').textContent()).toContain('Hello v1!');
    await goToAndRunAudience(page, '/tests/fixtures/audiences/page-level?audience=bar');
    expect(await page.locator('main').textContent()).toContain('Hello v2!');
  });

  test('Ignores invalid audiences.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/page-level--invalid');
    expect(await page.locator('main').textContent()).toContain('Hello v2!');
  });

  test('Ignores invalid audience references in the query parameters.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/page-level?audience=baz');
    expect(await page.locator('main').textContent()).toContain('Hello World!');
  });

  test('Ignores invalid variant urls.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/page-level--invalid-url');
    expect(await page.locator('main').textContent()).toContain('Hello World!');
  });

  test('Tracks the audience in RUM.', async ({ page }) => {
    await page.addInitScript(() => {
      window.rumCalls = [];
      window.hlx = { rum: { sampleRUM: (...args) => window.rumCalls.push(args) } };
    });
    await goToAndRunAudience(page, '/tests/fixtures/audiences/page-level');
    expect(await page.evaluate(() => window.rumCalls)).toContainEqual([
      'audience',
      expect.objectContaining({
        source: 'audience-foo',
        target: 'foo',
      }),
    ]);
  });

  test('Exposes the audiences in a JS API.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/page-level');
    expect(await page.evaluate(() => window.hlx.audiences)).toContainEqual(
      expect.objectContaining({
        type: 'page',
        config: expect.objectContaining({
          configuredAudiences: {
            foo: '/tests/fixtures/audiences/variant-1',
            bar: '/tests/fixtures/audiences/variant-2',
          },
          resolvedAudiences: ['foo', 'bar'],
          selectedAudience: 'foo',
        }),
        servedExperience: '/tests/fixtures/audiences/variant-1',
      }),
    );
  });

  test('triggers a DOM event with the audience detail', async ({ page }) => {
    const fn = await waitForDomEvent(page, 'aem:experimentation');
    await page.goto('/tests/fixtures/audiences/page-level');
    expect(await page.evaluate(fn)).toEqual({
      type: 'audience',
      element: await page.evaluate(() => document.body),
      audience: 'foo',
    });
  });
});

test.describe('Section-level audiences', () => {
  test('Replaces the section content with the variant.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/section-level');
    expect(await page.locator('main>div').textContent()).toContain('Hello v2!');
  });

  test('Sets classes on the section for the audience.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/section-level');
    expect(await page.locator('main>div').getAttribute('class')).toContain('audience-bar');
    await goToAndRunAudience(page, '/tests/fixtures/audiences/section-level?audience=foo');
    expect(await page.locator('main>div').getAttribute('class')).toContain('audience-foo');
  });

  test('Exposes the audiences in a JS API.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/section-level');
    expect(await page.evaluate(() => window.hlx.audiences)).toContainEqual(
      expect.objectContaining({
        type: 'section',
        config: expect.objectContaining({
          configuredAudiences: {
            foo: `${await page.evaluate(() => window.location.origin)}/tests/fixtures/audiences/variant-1`,
            bar: '/tests/fixtures/audiences/variant-2',
          },
          resolvedAudiences: ['bar'],
          selectedAudience: 'bar',
        }),
        servedExperience: '/tests/fixtures/audiences/variant-2',
      }),
    );
  });

  test('triggers a DOM event with the audience detail', async ({ page }) => {
    const fn = await waitForDomEvent(page, 'aem:experimentation');
    await page.goto('/tests/fixtures/audiences/section-level');
    expect(await page.evaluate(fn)).toEqual({
      type: 'audience',
      element: await page.evaluate(() => document.querySelector('.section')),
      audience: 'bar',
    });
  });
});

test.describe('Fragment-level audiences', () => {
  test('Replaces the fragment content with the variant.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/fragment-level');
    expect(await page.locator('.fragment').textContent()).toContain('Hello v1!');
  });

  test('Supports plural format for manifest keys.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/fragment-level--alt');
    expect(await page.locator('.fragment').textContent()).toContain('Hello v1!');
  });

  test('Ignores invalid manifest url.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/fragment-level--invalid-url');
    expect(await page.locator('.fragment').textContent()).toContain('Hello World!');
  });

  test('Replaces the async fragment content with the variant.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/fragment-level--async');
    expect(await page.locator('.fragment').textContent()).toContain('Hello v2!');
  });

  test('Sets classes on the section for the audience.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/fragment-level');
    expect(await page.locator('.fragment').getAttribute('class')).toContain('audience-foo');
    await goToAndRunAudience(page, '/tests/fixtures/audiences/fragment-level?audience=bar');
    expect(await page.locator('.fragment').getAttribute('class')).toContain('audience-bar');
  });

  test('Exposes the audiences in a JS API.', async ({ page }) => {
    await goToAndRunAudience(page, '/tests/fixtures/audiences/fragment-level');
    expect(await page.evaluate(() => window.hlx.audiences)).toContainEqual(
      expect.objectContaining({
        type: 'fragment',
        config: expect.objectContaining({
          configuredAudiences: {
            foo: '/tests/fixtures/audiences/variant-1',
            bar: '/tests/fixtures/audiences/variant-2',
          },
          resolvedAudiences: ['foo'],
          selectedAudience: 'foo',
        }),
        servedExperience: '/tests/fixtures/audiences/variant-1',
      }),
    );
  });

  test('triggers a DOM event with the audience detail', async ({ page }) => {
    const fn = await waitForDomEvent(page, 'aem:experimentation');
    await page.goto('/tests/fixtures/audiences/fragment-level');
    expect(await page.evaluate(fn)).toEqual({
      type: 'audience',
      element: await page.evaluate(() => document.querySelector('.fragment')),
      audience: 'foo',
    });
  });
});
