/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import assert from 'assert';
import { describe, it } from 'node:test';
import { classifyAcquisition } from '../acquisition.js';

describe('classifyAcquisition', () => {
  const testCases = [
    { input: 'google', expected: 'paid:search:google', only: true },
    { input: 'facebook', expected: ':social:facebook' },
    { input: 'fb', expected: ':social:facebook' },
    { input: 'bing', expected: 'paid:search:bing' },
    { input: 'ig', expected: ':social:instagram' },
    { input: 'meta', expected: ':social:facebook' },
    { input: 'push', expected: 'owned:push' },
    { input: 'yandex', expected: 'paid:search:yandex' },
    { input: 'baidu', expected: 'paid:search:baidu' },
    { input: 'amazon', expected: 'paid:display:amazon' },
    { input: 'youtube', expected: ':video:youtube' },
    { input: 'linkedin', expected: ':social:linkedin' },
    { input: 'gmb', expected: ':local:google' },
    { input: 'tiktok', expected: 'paid:video:tiktok', only: true },
    { input: 'newsletter', expected: 'owned:email' },
    { input: 'instagram', expected: ':social:instagram' },
    { input: 'dv360', expected: 'paid:video:google' },
    { input: 'email', expected: 'owned:email' },
    { input: 'programmatic', expected: 'paid:display' },
    { input: 'googleads', expected: 'paid:search:google', only: true },
    { input: 'sfmc', expected: '' },
    { input: 'google-ads', expected: 'paid:search:google', only: true },
    { input: 'an', expected: '' },
    { input: 'marketo', expected: 'owned:email:marketo', only: true },
    { input: 'hs_email', expected: 'owned:email' },
    { input: 'social', expected: ':social', only: true },
    { input: 'microsoft', expected: 'paid:display:microsoft', only: true },
    { input: 'adwords', expected: 'paid:search:google', only: true },
    { input: 'pinterest', expected: ':social:pinterest' },
    { input: 'gdn', expected: 'paid:display:google' },
    { input: 'facebook-instagram', expected: ':social:instagram', only: true },
    { input: 'twitter', expected: ':social:x' },
    { input: 'snapchat', expected: ':social:snapchat' },
    { input: 'eloqua', expected: 'owned:email:eloqua', only: true },
    { input: 'yahoo', expected: 'paid:search:yahoo', only: true },
    { input: 'teads', expected: 'paid::teads' },
    { input: 'criteo', expected: 'paid:display:criteo', only: true },
    { input: 'acs', expected: '' },
    { input: 'taboola', expected: 'paid:display:taboola', only: true },
    { input: 'kaufland marketing', expected: '' },
    { input: 'search', expected: 'paid:search', only: true },
    { input: 'abandoned-cart', expected: '' },
    { input: 'zalo', expected: '' },
    { input: 'website', expected: 'owned:web' },
    { input: 'outbrain', expected: 'paid:display:outbrain', only: true },
    { input: 'google_pmax', expected: 'paid:search:google', only: true },
    { input: 'substack', expected: 'owned:email:substack', only: true },
    { input: 'line', expected: ':social:line', only: true },
    { input: 'spotify', expected: 'paid:display:spotify', only: true },
    { input: 'display', expected: 'paid:display' },
    { input: 'google_deman', expected: 'paid:search:google', only: true },
    { input: 'ttd', expected: '' },
    { input: 'sms', expected: 'owned:sms' },
    { input: 'qr', expected: 'owned:qr' },
    { input: 'reddit', expected: 'paid:social:reddit', only: true },
    { input: 'dbm', expected: 'paid:display:google' },
    { input: 'google_search', expected: 'paid:search:google', only: true },
    { input: 'qrcode', expected: 'owned:qr' },
    { input: 'linkin.bio', expected: 'owned:social', only: true },
    { input: 'cpc', expected: 'paid' },
    { input: 'paid', expected: 'paid' },
    { input: 'email', expected: 'owned:email' },
    { input: 'social', expected: ':social', only: true },
    { input: 'yext', expected: 'paid:local:yext', only: true },
    { input: 'video', expected: ':video', only: true },
    { input: 'referral', expected: '' },
    { input: 'paid_social', expected: 'paid:social' },
    { input: 'banner', expected: 'paid:display' },
    { input: 'ppc', expected: 'paid' },
    { input: 'organic', expected: 'owned' },
    { input: 'social_paid', expected: 'paid:social' },
    { input: 'organicgmb', expected: 'owned:local:google' },
    { input: 'cpm', expected: 'paid' },
    { input: 'paid-social', expected: 'paid:social' },
    { input: 'paidsocial', expected: 'paid:social' },
    { input: 'paidsearch', expected: 'paid:search' },
    { input: 'native', expected: '' },
    { input: 'paid_search', expected: 'paid:search' },
    { input: 'affiliate', expected: 'paid:affiliate' },
    { input: 'app', expected: '' },
    { input: 'brand_paid_search', expected: 'paid:search' },
    { input: 'non_brand_paid_search', expected: 'paid:search' },
    { input: 'search-unbrand_paid', expected: 'paid:search' },
    { input: 'web', expected: 'owned:web' },
    { input: 'social_media', expected: ':social', only: true },
    { input: 'organic_social', expected: 'owned:social' },
    { input: 'social-paid', expected: 'paid:social' },
    { input: 'yt', expected: ':video:youtube' },
    { input: 'carousel', expected: '' },
    { input: 'sea', expected: 'paid:search' },
    { input: 'social-cpc', expected: 'paid:social' },
    { input: 'social-organic', expected: 'owned:social' },
    { input: 'link', expected: '' },
    { input: 'ctv', expected: 'paid:video:amazon' },
    { input: 'print', expected: 'owned:print' },
    { input: 'paid social', expected: 'paid:social', only: true },
  ];

  testCases
    .forEach(({ input, expected }) => {
      it(`should classify "${input}" as "${expected}"`, () => {
        assert.strictEqual(classifyAcquisition(input), expected);
      });
    });
});
