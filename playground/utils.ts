import { reactive, watch, computed } from 'vue'

const globalKeys = Object.getOwnPropertyNames(globalThis)
  .filter(key => key[0].toLocaleLowerCase() === key[0] && key !== 'console')

export function evaluateSource (src) {
  // Basic commonjs transform
  src = src
    .replace('export default', 'module.exports = ')
    .replace(/export (const|let|var) (\w+) ?= ?/g, 'exports.$2 = ')
    .replace(/export (function|class) (\w+)/g, 'exports.$2 = $1 $2 ')

  // eslint-disable-next-line no-new-func
  const fn = Function(`
    const exports = {};
    const module = { exports }
    const sandbox = {
      module,
      exports,
      ${globalKeys.map(key => `"${key}": {}`).join(',')}
    }
    with (sandbox) {
      ${src};
    };
    return sandbox.module.exports;
  `)

  return fn.call({})
}

export function tryFn (fn) {
  try {
    return fn()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return null
  }
}

export function persistedState (initialState = {}) {
  const state = reactive({
    ...initialState,
    ...tryFn(() => JSON.parse(atob(window.location.hash.substr(1)) || '{}'))
  })
  watch(state, () => {
    window.location.hash = '#' + btoa(JSON.stringify(state))
  })
  return state
}

export function safeComputed (fn) {
  let lastState = null
  return computed(() => {
    try {
      lastState = fn()
      return lastState
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      return lastState
    }
  })
}

export function asyncImport ({ loader, loading, error }) {
  const m = reactive(loading || {})
  loader().then(res => Object.assign(m, res)).catch((err) => {
    if (error) {
      Object.assign(m, error(err))
    }
    // eslint-disable-next-line no-console
    console.error(err)
  })
  return m
}
