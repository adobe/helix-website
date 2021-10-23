const getProperty = (object, objectPath) => {
  const pathArray = objectPath.split('.');
  return pathArray.reduce((acc, part) => acc && acc[part], object);
};

const getObjectProperty = (property, timeout) => new Promise((resolve) => {
  let i = 0;
  const interval = 10;
  const refreshId = setInterval(() => {
    const prop = getProperty(window, property);
    if (prop !== null && typeof prop !== 'undefined') {
      resolve(prop);
      clearInterval(refreshId);
    } else if (i >= timeout) {
      resolve(null);
      clearInterval(refreshId);
    }
    i += interval;
  }, interval);
});

export default getObjectProperty;
