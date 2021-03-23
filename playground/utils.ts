import { reactive, watch, computed } from 'vue'

const globalKeys = Object.getOwnPropertyNames(globalThis)
  .filter(key => key[0].toLocaleLowerCase() === key[0])

export function evaluateSource (src) {
  // eslint-disable-next-line no-new-func
  const fn = Function(`
    const sandbox = {
      module: { exports: {} },
      ${globalKeys.map(key => `"${key}": {}`).join(',')}
    }
    with (sandbox) {
      ${src.replace('export default', 'module.exports = ')};
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
    ...tryFn(() => JSON.parse(atob(window.location.hash.substr(1))))
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

export const defaultInput = `
export default {
    name: 'vulcan',
    price: 12.5,
    /**
     * checked state
     * If is null, will use last checked status
     */
    checked: false,
    dimensions: {
        /** width in px */
        width: 5,
        /** width in px */
        height: 10
    },
    tags: {
        $resolve: (val) => ['tag1'].concat(val).filter(Boolean)
    }
}
`.trim()
