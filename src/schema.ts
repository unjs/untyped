import { getType, isObject, unique, getValue, setValue, joinPath } from './utils'
import type { InputObject, InputValue, JSValue, Schema } from './types'

interface _ResolveCtx {
  root?: InputObject
  defaults?: InputObject,
  resolveCache: Record<string, Schema>
}

export function resolveSchema (obj: InputObject, defaults?: InputObject) {
  const schema = _resolveSchema(obj, '', {
    root: obj,
    defaults,
    resolveCache: {}
  })
  // TODO: Create meta-schema fror superset of Schema interface
  // schema.$schema = 'http://json-schema.org/schema#'
  return schema
}

function _resolveSchema (input: InputValue, id: string, ctx: _ResolveCtx): Schema {
  // Check cache
  if (id in ctx.resolveCache) {
    return ctx.resolveCache[id]
  }

  // Node is plain value
  if (!isObject(input)) {
    const schema = {
      type: getType(input),
      default: input as JSValue
    }
    normalizeSchema(schema)
    ctx.resolveCache[id] = schema
    if (ctx.defaults && getValue(ctx.defaults, id) === undefined) {
      setValue(ctx.defaults, id, schema.default)
    }
    return schema
  }

  // Clone to avoid mutation
  const node = { ...input as any } as InputObject

  const schema: Schema = ctx.resolveCache[id] = {
    ...node.$schema,
    id: '#' + id
  }

  // Resolve children
  for (const key in node) {
    // Ignore special keys
    if (key === '$resolve' || key === '$schema' || key === '$default') {
      continue
    }
    schema.properties = schema.properties || {}
    if (!schema.properties[key]) {
      schema.properties[key] = _resolveSchema(node[key], joinPath(id, key), ctx)
    }
  }

  // Infer default value from $resolve and $default
  if (ctx.defaults) {
    schema.default = getValue(ctx.defaults, id)
  }
  if (schema.default === undefined && '$default' in node) {
    schema.default = node.$default
  }
  if (typeof node.$resolve === 'function') {
    schema.default = node.$resolve(schema.default, (key) => {
      return _resolveSchema(getValue(ctx.root, key), key, ctx).default
    })
  }
  if (ctx.defaults) {
    setValue(ctx.defaults, id, schema.default)
  }

  // Infer type from default value
  if (!schema.type) {
    schema.type = getType(schema.default) || (schema.properties ? 'object' : 'any')
  }

  normalizeSchema(schema)
  return schema
}

export function applyDefaults (ref: InputObject, input: InputObject) {
  resolveSchema(ref, input)
  return input
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
}
