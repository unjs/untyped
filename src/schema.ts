import { getType, isObject } from './utils'
import type { InputObject, InputValue, JSValue, Schema } from './types'

export function resolveSchema (obj: InputObject) {
  const schema = _resolveSchema(obj, obj, obj)
  // TODO: Create meta-schema fror superset of Schema interface
  // schema.$schema = 'http://json-schema.org/schema#'
  return schema
}

function _resolveSchema (input: InputValue, parent: InputObject, root: InputObject): Schema {
  // Node is plain value
  if (!isObject(input)) {
    return {
      type: getType(input),
      default: input as JSValue
    }
  }

  // Clone to avoid mutation
  const node = { ...input as any } as InputObject
  const schema: Schema = { ...node.$schema }

  // Resolve children
  for (const key in node) {
    // Ignore special keys
    if (key === '$resolve' || key === '$schema' || key === '$default') {
      continue
    }
    const resolved = _resolveSchema(node[key], node, root)
    schema.properties = schema.properties || {}
    schema.properties[key] = resolved
    node[key] = resolved.default
  }

  // Infer default value from $resolve and $default
  if ('$default' in node) {
    schema.default = node.$default
  }
  if (typeof node.$resolve === 'function') {
    schema.default = node.$resolve(schema.default, parent, root)
  }

  // Infer type from default value
  if (!schema.type) {
    if (Array.isArray(schema.default)) {
      schema.type = 'array'
      schema.items = schema.default.map(i => getType(i)).map(type => ({ type }))
    } else {
      schema.type = getType(schema.default) || (schema.properties ? 'object' : 'any')
    }
  }

  return schema
}
