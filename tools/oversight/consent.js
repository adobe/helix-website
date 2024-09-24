const vendors = [
  {
    vendor: 'onetrust',
    match: /#onetrust-/,
    accept: /accept/,
    reject: /reject/,
    dismiss: /close-pc-btn-handler/,
  },
  {
    vendor: 'onetrust',
    match: /#ot-/,
    accept: /accept/,
    reject: /reject/,
    dismiss: /close-pc-btn-handler/,
  },
  {
    vendor: 'usercentrics',
    match: /#usercentrics-root/,
    // we don't have nicely id'd buttons here
  },
  {
    vendor: 'truste',
    match: /#truste/,
    accept: /consent-button/,
    dismiss: /close/,
  },
  {
    vendor: 'cybot',
    match: /#CybotCookiebot/,
    accept: /AllowAll/,
    reject: /Decline/,
  },
];

class Consent {
  constructor(vendor, spec, cssSelector) {
    this.checkpoint = 'consent';
    this.vendor = vendor;
    this.spec = spec;
    this.cssSelector = cssSelector;
  }

  get target() {
    return Object.entries(this.spec)
      .filter(([key]) => key !== 'match' && key !== 'vendor')
      .filter(([, pattern]) => pattern.test(this.cssSelector))
      .map(([key]) => key)
      .pop();
  }
}
export default function classifyConsent(cssSelector) {
  if (!cssSelector) return undefined;
  const result = vendors.find(({ match }) => match.test(cssSelector));
  if (result) return new Consent(result.vendor, result, cssSelector);
  return undefined;
}
