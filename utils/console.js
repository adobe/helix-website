export default function debug(message) {
  const { hostname } = window.location;
  const usp = new URLSearchParams(window.location.search);
  if (usp.has('helix-debug') || hostname === 'localhost') {
    // eslint-disable-next-line no-console
    console.log(message);
    return message;
  }
  return null;
}
