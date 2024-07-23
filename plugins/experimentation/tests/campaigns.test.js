/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';
import { track } from './coverage.js';
import { goToAndRunCampaign, waitForDomEvent } from './utils.js';

track(test);

test.describe('Page-level campaigns', () => {
  test('Replaces the page content with the variant.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level');
    expect(await page.locator('main').textContent()).toContain('Hello World!');
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level?campaign=foo');
    expect(await page.locator('main').textContent()).toContain('Hello v1!');
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level?campaign=bar');
    expect(await page.locator('main').textContent()).toContain('Hello v2!');
  });

  test('Serves the campaign if the configured audience is resolved.', async ({ page }) => {
    await page.addInitScript(() => {
      window.AUDIENCES = { baz: () => false };
    });
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level--audiences?campaign=foo');
    expect(await page.locator('main').textContent()).toContain('Hello World!');
    await page.addInitScript(() => {
      window.AUDIENCES = { baz: () => true };
    });
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level--audiences?campaign=foo');
    expect(await page.locator('main').textContent()).toContain('Hello v1!');
  });

  test('Sets a class on the body for the active campaign.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level');
    expect(await page.locator('body').getAttribute('class')).toContain('campaign-default');
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level?campaign=foo');
    expect(await page.locator('body').getAttribute('class')).toContain('campaign-foo');
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level?campaign=bar');
    expect(await page.locator('body').getAttribute('class')).toContain('campaign-bar');
  });

  test('Ignores empty campaigns.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level--empty?campaign=foo');
    expect(await page.locator('main').textContent()).toContain('Hello World!');
    expect(await page.locator('body').getAttribute('class')).toContain('campaign-default');
  });

  test('Controls the campaign shown via UTM query parameters.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level?utm_campaign=foo');
    expect(await page.locator('main').textContent()).toContain('Hello v1!');
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level?utm_campaign=bar');
    expect(await page.locator('main').textContent()).toContain('Hello v2!');
  });

  test('Ignores invalid campaigns references in the query parameters.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level?campaign=baz');
    expect(await page.locator('main').textContent()).toContain('Hello World!');
  });

  test('Ignores invalid variant urls.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level--invalid-url?campaign=foo');
    expect(await page.locator('main').textContent()).toContain('Hello World!');
  });

  test('Tracks the campaign in RUM.', async ({ page }) => {
    await page.addInitScript(() => {
      window.rumCalls = [];
      window.hlx = { rum: { sampleRUM: (...args) => window.rumCalls.push(args) } };
    });
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level?campaign=foo');
    expect(await page.evaluate(() => window.rumCalls)).toContainEqual([
      'audience',
      expect.objectContaining({
        source: 'foo',
        target: 'foo:bar',
      }),
    ]);
  });

  test('Exposes the campaign in a JS API.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level?campaign=bar');
    expect(await page.evaluate(() => window.hlx.campaigns)).toContainEqual(
      expect.objectContaining({
        type: 'page',
        config: expect.objectContaining({
          configuredCampaigns: {
            foo: '/tests/fixtures/campaigns/variant-1',
            bar: '/tests/fixtures/campaigns/variant-2',
          },
          selectedCampaign: 'bar',
        }),
        servedExperience: '/tests/fixtures/campaigns/variant-2',
      }),
    );
  });

  test('triggers a DOM event with the campaign detail', async ({ page }) => {
    const fn = await waitForDomEvent(page, 'aem:experimentation');
    await page.goto('/tests/fixtures/campaigns/page-level?campaign=bar');
    expect(await page.evaluate(fn)).toEqual({
      type: 'campaign',
      element: await page.evaluate(() => document.body),
      campaign: 'bar',
    });
  });
});

test.describe('Section-level campaigns', () => {
  test('Replaces the section content with the variant.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/section-level?campaign=bar');
    expect(await page.locator('main>div').textContent()).toContain('Hello v2!');
  });

  test('Sets classes on the section for the campaign.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/section-level?campaign=foo');
    expect(await page.locator('main>div').getAttribute('class')).toContain('campaign-foo');
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/section-level?campaign=bar');
    expect(await page.locator('main>div').getAttribute('class')).toContain('campaign-bar');
  });

  test('Exposes the campaigns in a JS API.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/section-level?campaign=bar');
    expect(await page.evaluate(() => window.hlx.campaigns)).toContainEqual(
      expect.objectContaining({
        type: 'section',
        config: expect.objectContaining({
          configuredCampaigns: {
            foo: '/tests/fixtures/campaigns/variant-1',
            bar: '/tests/fixtures/campaigns/variant-2',
          },
          selectedCampaign: 'bar',
        }),
        servedExperience: '/tests/fixtures/campaigns/variant-2',
      }),
    );
  });

  test('triggers a DOM event with the campaign detail', async ({ page }) => {
    const fn = await waitForDomEvent(page, 'aem:experimentation');
    await page.goto('/tests/fixtures/campaigns/section-level?campaign=bar');
    expect(await page.evaluate(fn)).toEqual({
      type: 'campaign',
      element: await page.evaluate(() => document.querySelector('.section')),
      campaign: 'bar',
    });
  });
});

test.describe('Fragment-level campaigns', () => {
  test('Replaces the fragment content with the variant.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/fragment-level?campaign=foo');
    expect(await page.locator('.fragment').textContent()).toContain('Hello v1!');
  });

  test('Supports plural format for manifest keys.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/fragment-level--alt?campaign=foo');
    expect(await page.locator('.fragment').textContent()).toContain('Hello v1!');
  });

  test('Ignores invalid manifest url.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/fragment-level--invalid-url?campaign=foo');
    expect(await page.locator('.fragment').textContent()).toContain('Hello World!');
  });

  test('Sets classes on the section for the campaign.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/fragment-level?campaign=foo');
    expect(await page.locator('.fragment').getAttribute('class')).toContain('campaign-foo');
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/fragment-level?campaign=bar');
    expect(await page.locator('.fragment').getAttribute('class')).toContain('campaign-bar');
  });

  test('Exposes the campaigns in a JS API.', async ({ page }) => {
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/fragment-level?campaign=foo');
    expect(await page.evaluate(() => window.hlx.campaigns)).toContainEqual(
      expect.objectContaining({
        type: 'fragment',
        config: expect.objectContaining({
          configuredCampaigns: {
            foo: '/tests/fixtures/campaigns/variant-1',
            bar: '/tests/fixtures/campaigns/variant-2',
          },
          selectedCampaign: 'foo',
        }),
        servedExperience: '/tests/fixtures/campaigns/variant-1',
      }),
    );
  });

  test('triggers a DOM event with the campaign detail', async ({ page }) => {
    const fn = await waitForDomEvent(page, 'aem:experimentation');
    await page.goto('/tests/fixtures/campaigns/fragment-level?campaign=foo');
    expect(await page.evaluate(fn)).toEqual({
      type: 'campaign',
      element: await page.evaluate(() => document.querySelector('.fragment')),
      campaign: 'foo',
    });
  });
});

test.describe('Backward Compatibility with v1', () => {
  test('Support the old "audience" metadata.', async ({ page }) => {
    await page.addInitScript(() => {
      window.AUDIENCES = { baz: () => true };
    });
    await goToAndRunCampaign(page, '/tests/fixtures/campaigns/page-level--backward-compatibility--audience?campaign=foo');
    expect(await page.locator('main').textContent()).toContain('Hello v1!');
  });
});
