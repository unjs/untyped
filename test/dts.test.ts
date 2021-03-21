import { resolveSchema, generateDts } from '../src'

describe('resolveSchema', () => {
  it('basic', () => {
    const types = generateDts(resolveSchema({
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
interface MyObject {
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
    const types = generateDts(resolveSchema({
      empty: [],
      numbers: [1, 2, 3],
      mixed: [true, 123]
    }))

    expect(types).toBe(`
interface MyObject {
   empty: any[],

  /** @default [1,2,3] */
  numbers: number[],

  /** @default [true,123] */
  mixed: (boolean | number)[],
}
`.trim())
  })

  it('escapeKey', () => {
    const types = generateDts(resolveSchema({
      '*key': '123'
    }))
    expect(types).toMatch('"*key": string')
  })
})
