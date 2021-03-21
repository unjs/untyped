export function evaluateSource (src) {
  let val
  // eslint-disable-next-line no-eval
  eval('val = ' + src.replace('export default', ''))
  return val
}

export function tryFn (fn, onError) {
  try {
    return fn()
  } catch (err) {
    return onError ? onError(err) : null
  }
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
