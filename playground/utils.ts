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

export const defaultInput = `export default {
  name: 'earth',
  specs: {
    gravity: {
      $resolve: val => parseFloat(val),
      $default: '9.8'
    },
    moons: {
      $resolve: (val = ['moon']) => [].concat(val),
      $schema: {
        title: 'planet moons'
      }
    }
  }
}`
