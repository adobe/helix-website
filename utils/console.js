export default function debug(message) {
    const { hostname } = window.location;
    const usp = new URLSearchParams(window.location.search);
    if (usp.has('helix-debug') || hostname === 'localhost') {
      console.log(message);
      return message;
    }
    return;
}