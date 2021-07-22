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

describe('transform (jsdoc)', () => {
  it('extracts title and description from jsdoc', () => {
    const result = transform(`
      export default {
        /**
         * Define the source directory of
         * your Nuxt application.
         *
         * This property can be overwritten (for example, running \`nuxt ./my-app/\`
         * will set the \`rootDir\` to the absolute path of \`./my-app/\` from the
         * current/working directory.
         *
         * With more content in description.
         */
        srcDir: 'src'
      }
    `)
    expectCodeToMatch(result, /export default ([\s\S]*)$/, {
      srcDir: {
        $default: 'src',
        $schema: {
          title: 'Define the source directory of your Nuxt application.',
          description: 'This property can be overwritten (for example, running `nuxt ./my-app/` will set the `rootDir` to the absolute path of `./my-app/` from the current/working directory.\nWith more content in description.',
          tags: []
        }
      }
    })
  })

  it('correctly parses tags', () => {
    const result = transform(`
      export default {
        /**
         * Define the source directory of your Nuxt application.
         *
         * This property can be overwritten.
         * @note This is a note.
         * that is on two lines
         * @example
         * \`\`\`js
         * export default secretNumber = 42
         * \`\`\`
         *
         * @see https://nuxtjs.org
         */
        srcDir: 'src'
      }
    `)
    expectCodeToMatch(result, /export default ([\s\S]*)$/, {
      srcDir: {
        $default: 'src',
        $schema: {
          title: 'Define the source directory of your Nuxt application.',
          description: 'This property can be overwritten.',
          tags: [
            '@note This is a note.\nthat is on two lines',
            '@example\n```js\nexport default secretNumber = 42\n```',
            '@see https://nuxtjs.org'
          ]
        }
      }
    })
  })

  it('correctly parses only tags', () => {
    const result = transform(`
      export default {
        /**
         * @note This is a note.
         * that is on two lines
         * @example
         * \`\`\`js
         * export default secretNumber = 42
         * \`\`\`
         *
         * @see https://nuxtjs.org
         */
        srcDir: 'src'
      }
    `)
    expectCodeToMatch(result, /export default ([\s\S]*)$/, {
      srcDir: {
        $default: 'src',
        $schema: {
          title: '',
          description: '',
          tags: [
            '@note This is a note.\nthat is on two lines',
            '@example\n```js\nexport default secretNumber = 42\n```',
            '@see https://nuxtjs.org'
          ]
        }
      }
    })
  })

  it('does not split within a codeblock', () => {
    const result = transform(`
      export default {
        /**
         * @example
         * \`\`\`js
         * export default secretNumber = 42
         *
         * export default nothing = null
         * \`\`\`
         */
        srcDir: 'src'
      }
    `)
    expectCodeToMatch(result, /export default ([\s\S]*)$/, {
      srcDir: {
        $default: 'src',
        $schema: {
          title: '',
          description: '',
          tags: [
            '@example\n```js\nexport default secretNumber = 42\n\nexport default nothing = null\n```'
          ]
        }
      }
    })
  })
})

function expectCodeToMatch (code: string, pattern: RegExp, expected: any) {
  const [, result] = code.match(pattern)
  expect(result).toBeDefined()
  // eslint-disable-next-line
  const obj = Function('"use strict";return (' + result.replace(/;$/, '') + ')')()
  expect(obj).toMatchObject(expected)
}
