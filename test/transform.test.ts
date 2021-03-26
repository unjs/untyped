import { transform } from '../src/loader/transform'

function expectCodeToMatch (code: string, pattern: RegExp, expected: any) {
  const [, result] = code.match(pattern)
  expect(result).toBeDefined()
  // eslint-disable-next-line
  const obj = Function('"use strict";return (' + result.replace(/;$/, '') + ')')()
  expect(obj).toMatchObject(expected)
}

describe('transform (functions)', () => {
  it('creates correct types for simple function', () => {
    const result = transform(`
      export function add (id: string, date = new Date(), append?: boolean) {}
    `)

    expectCodeToMatch(result, /export const add = ([\s\S]*)$/, {
      $schema: {
        type: 'function',
        args: [{
          name: 'id',
          type: 'string',
          items: {}
        }, {
          name: 'date',
          type: 'Date',
          items: {
            type: 'Date'
          }
        }, {
          name: 'append',
          optional: true,
          type: 'boolean',
          items: {}
        }]
      }
    })
  })

  it('infers correct types from defaults', () => {
    const result = transform(`
      export function add (test = ['42', 2], append = false as const) {}
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
          type: 'false',
          items: {
            type: 'false'
          }
        }]
      }
    })
  })

  it('correctly uses a defined return type', () => {
    const result = transform(`
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
      export const bob = function add (test: string): string {}
    `), transform(`
      export const bob = (test: string): string => {}
    `)]

    results.forEach(result => expectCodeToMatch(result, /export const bob = ([\s\S]*)$/, {
      $schema: {
        type: 'function',
        args: [{
          name: 'test',
          type: 'string',
          items: {}
        }],
        returns: {
          type: 'string'
        }
      }
    }))
  })
})
