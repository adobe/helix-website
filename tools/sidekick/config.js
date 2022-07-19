window.hlx.initSidekick({
  project: 'hlx',
  hlx3: true,
  host: 'www.hlx.live',
  pushDownSelector: 'header',
  plugins: [
    {
      id: 'chat',
      button: {
        text: 'Chat',
        action: (_, sk) => {
          const { config } = sk;
          console.log('foo');
          SignalZen.expand();
        },
      },
    },
  ]
});

var _sz = _sz || {
  invisible: true
};
_sz.appId = "8fa40ef3",
  function () {
    var e = document.createElement("script");
    e.src = "https://cdn.signalzen.com/signalzen.js";
    e.setAttribute("async", "true");
    document.documentElement.firstChild.appendChild(e);
    var t = setInterval(function () {
      "undefined" != typeof SignalZen && (clearInterval(t), new SignalZen(_sz).load());
    }, 10);
  }();
