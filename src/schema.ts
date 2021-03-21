import { getType, isObject, unique } from './utils'
import type { InputObject, InputValue, JSValue, Schema } from './types'

export function resolveSchema (obj: InputObject) {
  const schema = _resolveSchema(obj, obj)
  // TODO: Create meta-schema fror superset of Schema interface
  // schema.$schema = 'http://json-schema.org/schema#'
  return schema
}

function _resolveSchema (input: InputValue, parent: InputObject, root?: InputObject): Schema {
  // Node is plain value
  if (!isObject(input)) {
    return normalizeSchema({
      type: getType(input),
      default: input as JSValue
    })
  }

  // Clone to avoid mutation
  const node = { ...input as any } as InputObject
  const schema: Schema = { ...node.$schema }

  // Resolve children
  let proxifiedNode = node
  const getSchema = (key) => {
    schema.properties = schema.properties || {}
    if (!schema.properties[key]) {
      schema.properties[key] = _resolveSchema(node[key], proxifiedNode, root || proxifiedNode)
    }
    return schema.properties[key]
  }
  proxifiedNode = new Proxy(node, { get: (_, key) => getSchema(key).default || node[key as string], set: () => false })

  for (const key in node) {
    // Ignore special keys
    if (key === '$resolve' || key === '$schema' || key === '$default') {
      continue
    }
    getSchema(key)
  }

  // Infer default value from $resolve and $default
  if ('$default' in node) {
    schema.default = node.$default
  }
  if (typeof node.$resolve === 'function') {
    schema.default = node.$resolve(schema.default, parent, root || proxifiedNode)
  }

  // Infer type from default value
  if (!schema.type) {
    schema.type = getType(schema.default) || (schema.properties ? 'object' : 'any')
  }

  return normalizeSchema(schema)
}

function normalizeSchema (schema: Schema) {
  if (schema.type === 'array' && !('items' in schema)) {
    schema.items = {
      type: unique((schema.default as any[]).map(i => getType(i)))
    }
    if (!schema.items.type.length) {
      schema.items.type = 'any'
    }
  }
  return schema
}
