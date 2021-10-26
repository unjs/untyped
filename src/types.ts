export type JSValue =
  string |
  number |
  bigint |
  boolean |
  symbol |
  Function |
  Array<any> |
  undefined |
  object |
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

export interface TypeDescriptor {
  type?: JSType | JSType[] | string | string[]
  items?: TypeDescriptor | TypeDescriptor[]
}

export interface FunctionArg extends TypeDescriptor {
  name?: string
  default?: JSValue
  optional?: boolean
}

export interface Schema extends TypeDescriptor {
  id?: string,
  default?: JSValue
  resolve?: ResolveFn
  properties?: { [key: string]: Schema }
  title?: string
  description?: string
  $schema?: string
  tags?: string[]
  args?: FunctionArg[]
  returns?: TypeDescriptor,
}

export interface InputObject {
  [key: string]: any
  $schema?: Schema
  $resolve?: ResolveFn
}

export type InputValue = InputObject | JSValue
