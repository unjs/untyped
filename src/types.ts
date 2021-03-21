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

// A subset of JSONSchema7
export interface Schema {
  type?: JSType | JSType[]
  items?: Schema
  default?: JSValue
  properties?: { [key: string]: Schema }
  title?: string
  description?: string
  $schema?: string
}

export interface InputObject {
  [key: string]: any
  $schema?: Schema
  $resolve?: JSValue | ((value: any, parent: InputObject, root: InputObject) => JSValue)
}

export type InputValue = InputObject | JSValue
