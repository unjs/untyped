import { transform } from '../src/loader/transform'

describe('transform (functions)', () => {
  it('creates correct types for simple function', () => {
    const result = transform(`
      /** @untyped */
      export function add (id: string, date = new Date(), append?: boolean) {}
    `)

    expectCodeToMatch(result, /export const add = ([\s\S]*)$/, {
      $schema: {
        type: 'function',
        args: [{
          name: 'id',
          type: 'string'
        }, {
          name: 'date',
          type: 'Date'
        }, {
          name: 'append',
          optional: true,
          type: 'boolean'
        }]
      }
    })
  })

  it('infers correct types from defaults', () => {
    const result = transform(`
      /** @untyped */
      export function add (test = ['42', 2], append?: false) {}
    `)

    expectCodeToMatch(result, /export const add = ([\s\S]*)$/, {
      $schema: {
        type: 'function',
        args: [{
          name: 'test',
          type: 'array',
          items: {
            type: ['string', 'number']
          }
        }, {
          name: 'append',
          type: 'false'
        }]
      }
    })
  })

  it('correctly uses a defined return type', () => {
    const result = transform(`
      /** @untyped */
      export function add (): void {}
    `)

    expectCodeToMatch(result, /export const add = ([\s\S]*)$/, {
      $schema: {
        type: 'function',
        args: [],
        returns: {
          type: 'void'
        }
      }
    })
  })

  it('correctly handles a function assigned to a variable', () => {
    const results = [transform(`
      /** @untyped */
      export const bob = function add (test: string): string {}
    `), transform(`
      /** @untyped */
      export const bob = (test: string): string => {}
    `)]

    results.forEach(result => expectCodeToMatch(result, /export const bob = ([\s\S]*)$/, {
      $schema: {
        type: 'function',
        args: [{
          name: 'test',
          type: 'string'
        }],
        returns: {
          type: 'string'
        }
      }
    }))
  })
})

function expectCodeToMatch (code: string, pattern: RegExp, expected: any) {
  const [, result] = code.match(pattern)
  expect(result).toBeDefined()
  // eslint-disable-next-line
  const obj = Function('"use strict";return (' + result.replace(/;$/, '') + ')')()
  expect(obj).toMatchObject(expected)
}
