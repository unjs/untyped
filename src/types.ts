export type JSValue =
  string |
  number |
  bigint |
  boolean |
  symbol |
  Function |
  Array<any> |
  undefined |
  null

export type JSType =
  'string' |
  'number' |
  'bigint' |
  'boolean' |
  'symbol' |
  'function' |
  'object' |
  'any' |
  'array'

// eslint-disable-next-line no-use-before-define
export type ResolveFn = ((value: any, get: (key: string) => any) => JSValue)

export interface Schema {
  id?: string,
  type?: JSType | JSType[]
  items?: Schema
  default?: JSValue
  resolve?: ResolveFn
  properties?: { [key: string]: Schema }
  title?: string
  description?: string
  $schema?: string
  tags?: string[]
  args?: {
    name: string
    type?: string,
    default?: any
    optional?: boolean
  }[]
}

export interface InputObject {
  [key: string]: any
  $schema?: Schema
  $resolve?: ResolveFn
}

export type InputValue = InputObject | JSValue
