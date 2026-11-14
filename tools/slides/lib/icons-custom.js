// Hand-drawn vector icons that complement the shapes extracted from the deck.
// Same format as lib/icons.js. Coordinates are in a 100-unit box.
// kind "mono" → painted with currentColor. kind "art" → colours baked in.
//
// Add new icons here (keep them flat, geometric, chunky — the deck's style).

// eslint-disable-next-line import/prefer-default-export -- named export shared with lib/icons.js
export const CUSTOM = {
  globe: {
    viewBox: '0 0 100 100',
    kind: 'mono',
    d: 'M50 4a46 46 0 1 0 0 92a46 46 0 1 0 0-92Zm0 9c4 0 9.6 7.8 12.2 21H37.8C40.4 20.8 46 13 50 13Zm-11.4 2.6C35.2 21 33 27.6 31.8 34H17.4a37.2 37.2 0 0 1 21.2-18.4Zm22.8 0A37.2 37.2 0 0 1 82.6 34H68.2C67 27.6 64.8 21 61.4 15.6ZM14.3 43h16.4c-.3 4.6-.3 9.4 0 14H14.3a37.5 37.5 0 0 1 0-14Zm25.4 0h20.6c.3 4.6.3 9.4 0 14H39.7c-.3-4.6-.3-9.4 0-14Zm29.6 0h16.4a37.5 37.5 0 0 1 0 14H69.3c.3-4.6.3-9.4 0-14ZM17.4 66h14.4c1.2 6.4 3.4 13 6.8 18.4A37.2 37.2 0 0 1 17.4 66Zm20.4 0h24.4C59.6 79.2 54 87 50 87s-9.6-7.8-12.2-21Zm30.4 0h14.4a37.2 37.2 0 0 1-21.2 18.4c3.4-5.4 5.6-12 6.8-18.4Z',
  },
  key: {
    viewBox: '0 0 100 100',
    kind: 'mono',
    d: 'M33 8a25 25 0 1 0 14.6 45.3L56 61.7V72h10v10h10v10h16V76L54.7 38.7A25 25 0 0 0 33 8Zm-6 13a8 8 0 1 1 0 16a8 8 0 0 1 0-16Z',
  },
  pencil: {
    viewBox: '0 0 100 100',
    kind: 'mono',
    d: 'M70.5 8.5a6 6 0 0 1 8.5 0l12.5 12.5a6 6 0 0 1 0 8.5L83 38 62 17ZM56 23l21 21-44 44-26 8a2.5 2.5 0 0 1-3.1-3.1L12 67Z',
  },
  cloud: {
    viewBox: '0 0 100 64',
    kind: 'mono',
    d: 'M26 62C12 62 2 53 2 41c0-11 8.6-19.6 19.4-20.6C25.6 9.8 36.2 2 48.6 2c14.6 0 26.6 10.6 28.4 24.6C89.4 27.6 98 36.4 98 46.6 98 55.6 90.8 62 81 62Z',
  },
  user: {
    viewBox: '0 0 100 100',
    kind: 'mono',
    d: 'M50 8a20 22 0 1 0 0 44a20 22 0 1 0 0-44ZM50 58c-22 0-38 11-40 34h80c-2-23-18-34-40-34Z',
  },
  rocket: {
    viewBox: '0 0 100 100',
    kind: 'mono',
    d: 'M92 8C70 6 52 16 40 34l-14 1L12 49l16 3 20 20 3 16 14-14 1-14C84 48 94 30 92 8ZM66 24a10 10 0 1 1 0 20a10 10 0 0 1 0-20ZM24 64c-8 2-14 10-16 28 18-2 26-8 28-16Z',
  },
  bolt: {
    viewBox: '0 0 60 100',
    kind: 'mono',
    d: 'M38 2 4 58h22L18 98 56 38H33Z',
  },
  check: {
    viewBox: '0 0 100 100',
    kind: 'mono',
    d: 'M12 0h76a12 12 0 0 1 12 12v76a12 12 0 0 1-12 12H12A12 12 0 0 1 0 88V12A12 12 0 0 1 12 0Zm62 22L42 56 26 40 16 50l26 26 42-44Z',
  },
  plus: {
    viewBox: '0 0 100 100',
    kind: 'mono',
    d: 'M50 2a48 48 0 1 0 0 96a48 48 0 1 0 0-96Zm-9 20h18v19h19v18H59v19H41V59H22V41h19Z',
  },
  chart: {
    viewBox: '0 0 100 80',
    kind: 'mono',
    d: 'M0 0h5v75h95v5H0ZM14 46h12v24H14Zm20-20h12v44H34Zm20 14h12v30H54Zm20-30h12v60H74Z',
  },
  stopwatch: {
    viewBox: '0 0 100 110',
    kind: 'mono',
    d: 'M38 0h24v10H55v6.5A45 45 0 1 1 45 16.5V10h-7ZM80 16l9 9-6 6-9-9ZM50 30a35 35 0 1 0 0 70a35 35 0 1 0 0-70Zm-4 10h8v28l14 14-5.6 5.6L46 71.2Z',
  },
  doc: {
    viewBox: '0 0 80 100',
    kind: 'mono',
    d: 'M0 6a6 6 0 0 1 6-6h44l30 30v64a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6Zm50-2v26h26ZM14 46v6h52v-6Zm0 14v6h52v-6Zm0 14v6h38v-6Z',
  },
  database: {
    viewBox: '0 0 100 110',
    kind: 'mono',
    d: 'M50 0C24 0 4 7 4 16s20 16 46 16 46-7 46-16S76 0 50 0ZM4 26v10c0 9 20 16 46 16s46-7 46-16V26c-8 7-26 12-46 12S12 33 4 26Zm0 20v10c0 9 20 16 46 16s46-7 46-16V46c-8 7-26 12-46 12S12 53 4 46Zm0 20v10c0 9 20 16 46 16s46-7 46-16V66c-8 7-26 12-46 12S12 73 4 66Zm0 20v8c0 9 20 16 46 16s46-7 46-16v-8c-8 7-26 12-46 12S12 93 4 86Z',
  },
  sparkle: {
    viewBox: '0 0 100 100',
    kind: 'mono',
    d: 'M50 0c3 27 23 47 50 50-27 3-47 23-50 50-3-27-23-47-50-50C27 47 47 27 50 0Z',
  },
  'mountain-range': {
    viewBox: '0 0 400 140',
    kind: 'mono',
    d: 'M0 140V96l24-34 22 26 30-48 26 30 18-22 30 44 42-62 46 50 36-40 126 100Z',
  },
  'image-placeholder': {
    viewBox: '0 0 220 140',
    kind: 'art',
    body: '<g fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"><path d="M2 86 L58 6 a3 3 0 0 1 5 0 L118 72 L164 45 L218 70 V132 a6 6 0 0 1-6 6 H8 a6 6 0 0 1-6-6 Z"/><circle cx="135" cy="17" r="15"/></g>',
  },
  'price-tag': {
    viewBox: '0 0 100 120',
    kind: 'mono',
    d: 'M14 0h44l42 42v14L44 120 0 76V14ZM28 20a8 8 0 1 0 0 16a8 8 0 1 0 0-16Z',
  },
  // the three-hook webhook mark, heavier stroke.
  // Geometry from Tabler Icons "webhook" (MIT, © Paweł Kuna).
  webhook: {
    viewBox: '1.6 2.4 20.8 20.8',
    kind: 'mono',
    body: '<g fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4.876 13.61a4 4 0 1 0 6.124 3.39h6"/><path d="M15.066 20.502a4 4 0 1 0 1.934 -7.502c-.706 0 -1.424 .179 -2 .5l-3 -5.5"/><path d="M16 8a4 4 0 1 0 -8 0c0 1.506 .77 2.818 2 3.5l-3 5.5"/></g>',
  },
};
