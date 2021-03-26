import { resolveSchema, generateTypes } from '../src'

describe('resolveSchema', () => {
  it('basic', () => {
    const types = generateTypes(resolveSchema({
      test: {
        foo: {
          $default: 'test value',
          $schema: {
            title: 'Test',
            description: 'this is test'
          }
        }
      }
    }))
    expect(types).toBe(`
interface Untyped {
   test: {
    /**
     * Test
     * this is test
     * @default "test value"
    */
    foo: string,
  },
}
`.trim())
  })

  it('array', () => {
    const types = generateTypes(resolveSchema({
      empty: [],
      numbers: [1, 2, 3],
      mixed: [true, 123]
    }))

    expect(types).toBe(`
interface Untyped {
   empty: Array<any>,

  /** @default [1,2,3] */
  numbers: Array<number>,

  /** @default [true,123] */
  mixed: Array<boolean|number>,
}
`.trim())
  })

  it('escapeKey', () => {
    const types = generateTypes(resolveSchema({
      '*key': '123'
    }))
    expect(types).toMatch('"*key": string')
  })

  it('functions', () => {
    const types = generateTypes(resolveSchema({
      add: {
        $schema: {
          type: 'function',
          args: [{
            name: 'test',
            type: 'Array<string | number>',
            optional: true
          }, {
            name: 'append',
            type: 'boolean',
            optional: true
          }]
        }
      }
    }))

    expect(types).toBe(`
interface Untyped {
   add: (test?: Array<string | number>, append?: boolean) => any,
}
`.trim())
  })
})
