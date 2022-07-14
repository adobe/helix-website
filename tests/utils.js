const defaultIntersectionObserver = IntersectionObserver;
let instances = [];

const setupIntersectionObserverMock = () => {
  class MockIntersectionObserver {
    entries = [];

    constructor(callback) {
      this.callback = callback;
      instances.push(this);
    }

    observe(target) {
      this.entries.push(target);
    }

    intersect() {
      this.callback(this.entries.map((e) => ({ isIntersecting: true, target: e })));
    }
  }

  Object.defineProperty(
    window,
    'IntersectionObserver',
    {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    },
  );
};

const intersect = () => {
  instances.forEach((instance) => instance.intersect());
};

const restoreDefaultIntersectionObserver = () => {
  Object.defineProperty(
    window,
    'IntersectionObserver',
    {
      writable: true,
      configurable: true,
      value: defaultIntersectionObserver,
    },
  );
  instances = [];
};
export { setupIntersectionObserverMock, restoreDefaultIntersectionObserver, intersect };
