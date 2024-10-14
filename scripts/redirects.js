function globToRegex(glob) {
  return new RegExp(`^${glob.replace(/\*/g, '(.*)').replace(/\?/g, '(.)').replace(/\//g, '\\/')}$`);
}

export function activateRedirects(data) {
  return data.map((o) => Object.entries(o)
    .reduce((acc, [k, v]) => {
      if (k.toLowerCase() === 'from') {
        acc.from = globToRegex(v);
      } else if (k.toLowerCase() === 'to') {
        acc.to = (...replacements) => {
          replacements.shift();
          const result = v.replace(/(\$\d+|\*)/g, (matched) => {
            if (matched.startsWith('$')) {
              return replacements[matched.slice(1)];
            }
            if (matched === '*') {
              return replacements.shift();
            }
            return matched;
          });
          return result;
        };
      } else if (k.toLowerCase() === 'start') {
        acc.start = new Date(
          Date.UTC(1899, 11, 30, 0, 0, 0)
          + (v - Math.floor(v)) * 86400000 + Math.floor(v) * 86400000,
        );
      }
      return acc;
    }, {}));
}
export async function fetchRedirects(path = '/smart-redirects.json') {
  const response = await fetch(path);
  const redirects = await response.json();
  if (redirects.data) {
    return activateRedirects(redirects.data);
  }
  return [];
}

export async function applyRedirects(
  redirects = fetchRedirects(),
  path = window.location.pathname,
) {
  const redirect = (await redirects)
    .filter((r) => typeof r.start === 'undefined' || r.start.getTime() <= Date.now())
    .find((r) => r.from.test(path));
  if (redirect) {
    const target = redirect.to(path, ...redirect.from.exec(path).slice(1));
    const currentUrl = new URL(window.location.href);
    const targetURL = new URL(target, currentUrl.origin);
    // Copy all URL parameters from currentUrl to targetURL
    currentUrl.searchParams.forEach((value, key) => {
      targetURL.searchParams.set(key, value);
    });

    targetURL.searchParams.set('redirect_from', path);
    window.location.replace(targetURL.toString());
  }
  return path;
}
