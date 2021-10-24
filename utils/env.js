function setHelixEnv(name) {
  if (name) {
    sessionStorage.setItem('helix-env', name);
  } else {
    sessionStorage.removeItem('helix-env');
  }
}

export async function displayEnv() {
  try {
    const usp = new URLSearchParams(window.location.search);
    const env = usp.get('helix-env');
    if (env) { setHelixEnv(env); }
  } catch (e) {
    const { debug } = await import('./console.js');
    debug(`display env failed: ${e.message}`);
  }
}

/**
 * Get the current Helix environment
 * @returns {Object} the env object
 */
export function getEnv() {
  let envName = sessionStorage.getItem('helix-env');
  if (!envName) envName = 'prod';
  const envs = {
    stage: {
      ims: 'stg1',
      adminconsole: 'stage.adminconsole.adobe.com',
      account: 'stage.account.adobe.com',
      target: false,
    },
    prod: {
      ims: 'prod',
      adminconsole: 'adminconsole.adobe.com',
      account: 'account.adobe.com',
      target: true,
    },
  };
  const env = envs[envName];
  if (env) {
    env.name = envName;
  }
  return env;
}
