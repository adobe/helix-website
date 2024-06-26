/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';
import { track } from './coverage.js';

track(test);

test.describe('Plugin config', () => {
  test('debug statements are shown in dev/stage', async ({ page }) => {
    await page.goto('/tests/fixtures/global');
    await page.addScriptTag({ content: 'import { setDebugMode } from "/src/index.js"; window.setDebugMode = setDebugMode;', type: 'module' });
    expect(await page.evaluate(async () => window.setDebugMode(new URL('http://localhost:3000'), {}))).toEqual(true);
    expect(await page.evaluate(async () => window.setDebugMode(new URL('https://ref--repo--org.hlx.page/'), {}))).toEqual(true);
    expect(await page.evaluate(async () => window.setDebugMode(new URL('https://ref--repo--org.hlx.live/'), {}))).toEqual(false);
    expect(await page.evaluate(async () => window.setDebugMode(new URL('https://ref--repo--org.hlx.live/'), { isProd: () => false }))).toEqual(true);
    expect(await page.evaluate(async () => window.setDebugMode(new URL('https://stage.foo.com'), { prodHost: 'www.foo.com' }))).toEqual(true);
  });

  // test.skip('debug statements are not shown on prod');
  // test.skip('sends event with details when experiment/audience/campaign is run');
});
