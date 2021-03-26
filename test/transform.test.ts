import { transform } from '../src/loader/transform'

describe.skip('transform (functions)', () => {
  it('creates correct types for simple function', () => {
    const result = transform(`
      export function add (id: string, date = new Date(), append?: boolean) {}
    `)

    expect(result).toBe(`
export const add = {
  $schema: {
    type: "function",
    args: [{
      name: "id",
      type: "string"
    }, {
      name: "date",
      type: "Date",
      default: "new Date()"
    }, {
      name: "append",
      type: "boolean",
      optional: true
    }]
  }
};
`.trim())
  })
  it('infers correct types from defaults', () => {
    const result = transform(`
      export function add (test = ['42', 2], append = false as const) {}
    `)

    expect(result).toBe(`
export const add = {
  $schema: {
    type: "function",
    args: [{
      name: "test",
      type: "Array<string | number>",
      default: "['42', 2]"
    }, {
      name: "append",
      type: "false",
      default: "false"
    }]
  }
};
`.trim())
  })

  it('correctly uses a defined return type', () => {
    const result = transform(`
      export function add (): void {}
    `)

    expect(result).toBe(`
export const add = {
  $schema: {
    type: "function",
    returns: "void",
    args: []
  }
};
`.trim())
  })

  it('correctly handles a function assigned to a variable', () => {
    const result = transform(`
      export const bob = function add (test: string): string {}
    `)

    expect(result).toBe(`
export const bob = {
  $schema: {
    type: "function",
    returns: "string",
    args: [{
      name: "test",
      type: "string"
    }]
  }
};
`.trim())
  })
})
