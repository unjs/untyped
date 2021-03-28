import type { Schema, JSType, TypeDescriptor } from './types'

export function escapeKey (val: string): string {
  return /^\w+$/.test(val) ? val : `"${val}"`
}

export function getType (val: unknown): JSType | undefined {
  const type = typeof val
  if (type === 'undefined' || val === null) {
    return undefined
  }
  if (Array.isArray(val)) {
    return 'array'
  }
  return type
}

export function isObject (val: unknown): boolean {
  return val !== null && !Array.isArray(val) && typeof val === 'object'
}

export function nonEmpty <T> (arr: T[]): Array<NonNullable<T>> {
  return arr.filter(Boolean) as Array<NonNullable<T>>
}

export function unique <T> (arr: T[]) {
  return Array.from(new Set(arr))
}

export function joinPath (a: string, b = '', sep = '.') {
  return a ? a + sep + b : b
}

export function resolvePath (path: string, from: string) {
  return path.startsWith('/')
    ? resolveRelative(path)
    : resolveRelative(joinPath(from, path))
}

function resolveRelative (path: string) {
  const rSegments: string[] = []
  for (const s of path.split(/[/.$]/g)) {
    if (s === '..') {
      rSegments.pop()
    } else {
      rSegments.push(s)
    }
  }
  return '/' + rSegments.filter(Boolean).join('/')
}

export function setValue (obj: Record<string, any>, path: string, val: any) {
  const keys = path.split('.')
  const _key = keys.pop()
  for (const key of keys) {
    if (!(key in obj)) {
      obj[key] = {}
    }
    obj = obj[key]
  }
  if (_key) {
    obj[_key] = val
  }
}

export function getValue <V = any> (obj: Record<string, any>, path: string) {
  for (const key of path.split('.')) {
    if (!(key in obj)) {
      return undefined
    }
    obj = obj[key]
  }
  return obj as V
}

export function getSchemaPath (schema: Schema, path: string) {
  for (const key of path.split('.')) {
    if (!schema.properties || !(key in schema.properties)) {
      return undefined
    }
    schema = schema.properties[key]
  }
  return schema
}

export function mergedTypes (...types: TypeDescriptor[]): TypeDescriptor {
  types = types.filter(Boolean)
  if (types.length === 0) { return {} }
  if (types.length === 1) { return types[0] }
  return {
    type: normalizeTypes(types.map(t => t.type).flat().filter(Boolean)),
    items: mergedTypes(...types.map(t => t.items).flat().filter(Boolean))
  }
}

export function normalizeTypes (val: string[]) {
  const arr = unique(val.filter(str => str))
  if (!arr.length || arr.includes('any')) { return undefined }
  return (arr.length > 1) ? arr : arr[0]
}

export function cachedFn (fn) {
  let val
  let resolved = false
  return () => {
    if (!resolved) {
      val = fn()
      resolved = true
    }
    return val
  }
}
