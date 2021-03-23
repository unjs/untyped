import { resolveSchema } from './schema'
import type { InputObject, Schema } from './types'

export function applyDefaults (ref: InputObject, input: InputObject) {
  const schema = resolveSchema(ref, true)
  return _applyDefaults(schema, input)
}

export function _applyDefaults (schema: Schema, input: InputObject, root?: InputObject) {
  if (schema.type !== 'object') {
    return {}
  }
  const merged = {}
  for (const key in schema.properties!) {
    const prop = schema.properties[key]
    if (prop.type === 'object') {
      merged[key] = _applyDefaults(prop, input?.[key], root || input)
    } else if (typeof prop.resolve === 'function') {
      merged[key] = prop.resolve(input?.[key], merged, root || input)
    } else {
      merged[key] = input?.[key] || prop.default
    }
  }
  return merged
}
