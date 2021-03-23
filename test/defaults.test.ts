import { applyDefaults } from '../src'

describe('applyDefaults', () => {
  it('basic', () => {
    const ref = {
      name: 'default',
      nested: {
        val: 1,
        list: {
          $resolve: val => ['a'].concat(val)
        }
      }
    }
    const input = {
      name: 'custom',
      nested: {
        list: 'b'
      }
    }
    expect(applyDefaults(ref, input)).toMatchObject({
      name: 'custom',
      nested: {
        val: 1,
        list: ['a', 'b']
      }
    })
  })
})
