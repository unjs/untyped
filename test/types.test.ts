import { describe, it, expect } from 'vitest'
import { resolveSchema, generateTypes } from '../src'

describe('resolveSchema', () => {
  it('basic', () => {
    const types = generateTypes(resolveSchema({
      test: {
        foo: {
          $default: 'test value',
          $schema: {
            title: 'Test',
            description: 'this is test',
            $constraints: {
              nuxt: '^1'
            }
          }
        }
      }
    }))
    expect(types).toBe(`
export interface Untyped {
   test: {
    /**
     * Test
     * this is test
     * @default "test value"
     * @requires nuxt@^1
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
export interface Untyped {
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
            tsType: 'false',
            optional: true
          }]
        }
      }
    }))

    expect(types).toBe(`
export interface Untyped {
   add: (test?: Array<string | number>, append?: false) => any,
}
`.trim())
  })

  it('extracts type imports to top-level', () => {
    const types = generateTypes(resolveSchema({
      test: {
        foo: {
          $schema: {
            tsType: 'typeof import("vue").VueConfig'
          }
        },
        bar: {
          $schema: {
            tsType: 'typeof import("vue")["VueConfig"]'
          }
        },
        baz: {
          $schema: {
            tsType: 'typeof import("vue").OtherImport'
          }
        },
        quf: {
          $schema: {
            tsType: 'typeof import("other-lib").VueConfig'
          }
        }
      }
    }))
    expect(types).toBe(`
import type { VueConfig, OtherImport } from 'vue'
import type { VueConfig as VueConfig0 } from 'other-lib'
export interface Untyped {
   test: {
    foo: VueConfig,

    bar: VueConfig,

    baz: OtherImport,

    quf: VueConfig0,
  },
}
`.trim())
  })
})
