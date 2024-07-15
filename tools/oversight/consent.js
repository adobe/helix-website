const vendors = {
  onetrust: {
    match: /#(onetrust|ot)-/,
    accept: /accept/,
    reject: /reject/,
    dismiss: /close-pc-btn-handler/,
  },
  usercentrics: {
    match: /#usercentrics-root/,
    // we don't have nicely id'd buttons here
  },
  truste: {
    match: /#truste/,
    accept: /consent-button/,
    dismiss: /close/,
  },
  cybot: {
    match: /#CybotCookiebot/,
    accept: /AllowAll/,
    reject: /Decline/,
  },
};

export default function classifyConsent(cssSelector) {
  return cssSelector
    && (Object.entries(vendors)
      .filter(([, { match }]) => match.test(cssSelector))
      .map(([vendor, spec]) => ({
        checkpoint: 'consent',
        source: vendor,
        target: Object.entries(spec)
          .filter(([key]) => key !== 'match')
          .filter(([, pattern]) => pattern.test(cssSelector))
          .map(([key]) => key)
          .pop(),
      }))).pop();
}
