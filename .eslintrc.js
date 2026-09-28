module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    // allow reassigning param
    'no-param-reassign': [2, { props: false }],
    'linebreak-style': ['error', 'unix'],
    'import/extensions': ['error', {
      js: 'always',
    }],
  },
  overrides: [
    {
      // CI-only scripts run in Node, not in the browser.
      files: ['tools/youtube-chapters/**/*.js'],
      env: { browser: false, node: true },
      rules: {
        'no-console': 'off',
        'no-restricted-syntax': ['error', 'WithStatement'],
      },
    },
  ],
};
