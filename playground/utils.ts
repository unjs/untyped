import { reactive, watch, computed } from 'vue'

export function evaluateSource (src) {
  let val
  // eslint-disable-next-line no-eval
  eval('val = ' + src.replace('export default', ''))
  return val
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
