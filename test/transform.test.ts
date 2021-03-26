import { transform } from '../src/loader/transform'

describe('transform (functions)', () => {
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
      type: "string",
      items: {}
    }, {
      name: "date",
      type: "Date",
      items: {
        type: "Date"
      }
    }, {
      name: "append",
      optional: true,
      type: "boolean",
      items: {}
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
      type: "array",
      items: {
        type: ["string", "number"]
      }
    }, {
      name: "append",
      type: "false",
      items: {
        type: "false"
      }
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
    args: [],
    returns: {
      type: "void"
    }
  }
};
`.trim())
  })

  it('correctly handles a function assigned to a variable', () => {
    const results = [transform(`
      export const bob = function add (test: string): string {}
    `), transform(`
      export const bob = (test: string): string => {}
    `)]

    results.forEach(result => expect(result).toBe(`
export const bob = {
  $schema: {
    type: "function",
    args: [{
      name: "test",
      type: "string",
      items: {}
    }],
    returns: {
      type: "string"
    }
  }
};
`.trim()))
  })
})
