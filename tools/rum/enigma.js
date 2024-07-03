let wasm;

let cachedUint32Memory0 = null;

function getUint32Memory0() {
  if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
    cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
  }
  return cachedUint32Memory0;
}

let WASM_VECTOR_LEN = 0;

function passArray32ToWasm0(arg, malloc) {
  // eslint-disable-next-line no-bitwise
  const ptr = malloc(arg.length * 4, 4) >>> 0;
  getUint32Memory0().set(arg, ptr / 4);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
/**
* @param {Uint32Array} left
* @param {Uint32Array} right
* @returns {number}
*/
// eslint-disable-next-line camelcase
export function t_test(left, right) {
  // eslint-disable-next-line no-underscore-dangle
  const ptr0 = passArray32ToWasm0(left, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  // eslint-disable-next-line no-underscore-dangle
  const ptr1 = passArray32ToWasm0(right, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.t_test(ptr0, len0, ptr1, len1);
  return ret;
}

// eslint-disable-next-line camelcase,no-underscore-dangle
async function __wbg_load(module, imports) {
  if (typeof Response === 'function' && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get('Content-Type') !== 'application/wasm') {
          console.warn('`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n', e);
        } else {
          throw e;
        }
      }
    }

    const bytes = await module.arrayBuffer();
    // eslint-disable-next-line no-return-await
    return await WebAssembly.instantiate(bytes, imports);
  }
  const instance = await WebAssembly.instantiate(module, imports);

  if (instance instanceof WebAssembly.Instance) {
    return { instance, module };
  }
  return instance;
}

// eslint-disable-next-line camelcase,no-underscore-dangle
function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};

  return imports;
}

// eslint-disable-next-line no-underscore-dangle,camelcase,no-unused-vars
function __wbg_init_memory(imports, maybe_memory) {

}

// eslint-disable-next-line camelcase,no-underscore-dangle
function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  // eslint-disable-next-line camelcase,no-underscore-dangle,no-use-before-define
  __wbg_init.__wbindgen_wasm_module = module;
  cachedUint32Memory0 = null;

  return wasm;
}

function initSync(module) {
  if (wasm !== undefined) return wasm;

  const imports = __wbg_get_imports();

  __wbg_init_memory(imports);

  if (!(module instanceof WebAssembly.Module)) {
    // eslint-disable-next-line no-param-reassign
    module = new WebAssembly.Module(module);
  }

  const instance = new WebAssembly.Instance(module, imports);

  return __wbg_finalize_init(instance, module);
}

// eslint-disable-next-line no-underscore-dangle,camelcase
async function __wbg_init(input) {
  if (wasm !== undefined) return wasm;

  if (typeof input === 'undefined') {
    // eslint-disable-next-line no-param-reassign
    input = new URL('enigma_bg.wasm', import.meta.url);
  }
  const imports = __wbg_get_imports();

  if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
    // eslint-disable-next-line no-param-reassign
    input = fetch(input);
  }

  __wbg_init_memory(imports);

  const { instance, module } = await __wbg_load(await input, imports);

  return __wbg_finalize_init(instance, module);
}

export { initSync };
// eslint-disable-next-line camelcase
export default __wbg_init;
